const Post = require('../models/Post.js');
const User = require('../models/User.js');
const Message = require('../models/Message.js');
const fs = require('fs');
const sharp = require('sharp');
const appRoot = require('app-root-path');
const { nanoid } = require('nanoid');
const { throwError } = require('../utils/helpers.js');


module.exports.handleCreatePost = async(req , res , next) => {
    let thumbnail = req.files ? req.files.thumbnail : {}
    let fileName = `${await nanoid()}_${thumbnail.name}`
    fileName = fileName.replace(/\s+/g, '-').toLowerCase() //replacing space with dash
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`
    console.log(thumbnail);
    try {
        req.body = { ...req.body , thumbnail }
        if(typeof thumbnail.name == `undefined`) throwError("تصویر برای پست الزامی است" , 422 , null)
        if(thumbnail.mimetype == "image/jpeg" || thumbnail.mimetype == "image/png"){
            if(thumbnail.size > 8000000) throwError("حداکثر حجم فایل : 8 مگابایت" , 422 , null)
            
            await sharp(thumbnail.data).toFile(uploadPath , err => console.log(err))

            //Puts id of user into the post in order to access the post from the user  
            await Post.create({ ...req.body , user : req.userId  ,thumbnail : fileName })

            return res.status(201).json({ message : "پست ساخته شد" })
        }
        else throwError("فقط تصویر با فرمت JPEG یا PNG وارد شود" , 422 , null)
        
    } catch (err) {
        next(err)
    }
}

module.exports.handleEditPost = async(req , res , next) => {
    let thumbnail = req.files ? req.files.thumbnail : {}
    let fileName = `${await nanoid()}_${thumbnail.name}`
    fileName = fileName.replace(/\s+/g, '-').toLowerCase() //replacing space with dash
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`
    
    //finds post by id 
    const post = await Post.findOne({ _id : req.params.id })

    try {
        if(!post) throwError("پست یافت نشد" , 404 , null)

        //post.user -> Post schema
        //req.userId -> authenticated
        if(post.user.toString() != req.userId) throwError("" , 401 , null)
        if(thumbnail.name){
            if(thumbnail.mimetype == "image/jpeg" || thumbnail.mimetype == "image/png"){
                //Deletes previous thumbnail
                //Adds new one
                fs.unlink(`${appRoot}/public/uploads/thumbnails/${post.thumbnail}` , async err => {
                    if(err) console.log(err);
                    await sharp(thumbnail.data).toFile(uploadPath , err => console.log(err))
                })
            }
            else throwError("فقط تصویر با فرمت JPEG یا PNG وارد شود" , 422 , null)
        }
        if(typeof thumbnail.name == `undefined` && typeof post.thumbnail == `undefined`) throwError("قرار دادن تصویر برای پست الزامی است" , 422 , null)
        
        //if thumbnail.name exists (user wants to change thumbnail) fileName will be replaced
        post.thumbnail = thumbnail.name ? fileName : post.thumbnail

        const { title , body , status } = req.body

        post.title = title
        post.body = body
        post.status = status

        await post.save()
        return res.status(200).json({ message : "پست ویرایش شد" })
    } catch (err) {
        next(err)
    }
}

module.exports.deletePost = async(req , res , next) => {
    

    //finds post its by id
    const post = await Post.findOne({ _id : req.params.id })
    

    try {
        if(!post) throwError("پست یافت نشد" , 404 , null)

        if(post.user.toString() != req.userId) throwError("این پست به تو تعلق نداره! سعی نکن دستکاریش کنی" , 401 , null)
        else{
            fs.unlink(`${appRoot}/public/uploads/thumbnails/${post.thumbnail}` , async err => {
                if(err) throwError("خطا" , 400 , null);
                await Post.findByIdAndRemove(req.params.id)
                return res.status(200).json({ message : "پست پاک شد" })                                  
            })           
        }
    } catch (err) {
        next(err)
    }    
}

module.exports.handleEditProfile = async(req , res , next) => {
    try {
        const { username , email } = req.body
        const user = await User.findOne({ _id : req.userId })
        console.log(user);

        const duplicatedEmail = await User.findOne({ email })
        const duplicatedUsername = await User.findOne({ username })
        
        if(user.username === username){
            if(user.email === email){
                await user.save()
                return res.status(201).json({ message : "پروفایل تغییر کرد" })
            }
            else{
                if(duplicatedEmail) throwError("کاربر با این ایمیل موجود است" , 422 , null)
                if(email.length < 6 || email.length > 255 || email === "") throwError("ایمیل حداقل 6 حداکثر 255" , 422 , null)
                user.email = email
                await user.save()
                return res.status(201).json({ message : "پروفایل تغییر کرد" })
            }
        }
        else{
            if(duplicatedUsername) throwError("کاربر با این  نام کاربری موجود است" , 422 , null)
            if(username.length < 6 || username.length > 255 || username === "") throwError("نام کاربری حداقل 6 حداکثر 255" , 422 , null)
            user.username = username
            if(user.email === email){
                await user.save()
                return res.status(201).json({ message : "پروفایل تغییر کرد" })
            }
            else{
                if(duplicatedEmail) throwError("کاربر با این ایمیل موجود است" , 422 , null)
                if(email.length < 6 || email.length > 255 || email === "") throwError("ایمیل حداقل 6 حداکثر 255" , 422 , null)
                user.email = email
                await user.save()
                return res.status(201).json({ message : "پروفایل تغییر کرد" })
            }
        }
    } catch (err) {
        next(err)
    }
}





