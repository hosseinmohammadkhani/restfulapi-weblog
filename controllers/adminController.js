const Post = require('../models/Post.js');
const User = require('../models/User.js');
const Message = require('../models/Message.js');
const fs = require('fs');
const sharp = require('sharp');
const appRoot = require('app-root-path');
const jwt = require('jsonwebtoken');
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

module.exports.messagesPage = async(req , res) => {
    const user = await User.findOne({ _id : req.userId })
    
    if(!user || req.params.id !== user._id) throwError("User not found" , 404 , null)

    //finds messages by id in the message
    //id in the message should be as same as logged-in user's id
    const messages = await Message.find({ user : req.userId })

    return res.status(200).json({ messages : messages })
}

module.exports.handleEditProfile = async(req , res , next) => {
    try {
        const { username , email } = req.body
        let profilePhoto = req.files ? req.files.profilePhoto : {}
        let fileName = `${await nanoid()}_${profilePhoto.name}`
        fileName = fileName.replace(/\s+/g, '-').toLowerCase() //replacing space with dash
        const uploadPath = `${appRoot}/public/uploads/profilePhotos/${fileName}`
        
        //finds user by id
        const user = await User.findOne({ _id : req.userId })
        
        const duplicatedEmail = await User.findOne({ email })
        const duplicatedUsername = await User.findOne({ username })
        
        if(req.params.username !== user.username) throwError("Not found" , 404 , null)

        if(profilePhoto.name){
            if(profilePhoto.mimetype == "image/jpeg" || profilePhoto.mimetype == "image/png"){
                if(profilePhoto.size > 8000000) throwError("حداکثر حجم : 8 مگابایت" , 422 , null)
                if(user.profilePhoto == "") await sharp(profilePhoto.data).toFile(uploadPath , err => console.log(err))
                else{

                    //removes previous profile photo and replaces the new one
                    fs.unlink(`${appRoot}/public/uploads/profilePhotos/${user.profilePhoto}` , async err => {
                        if(err) console.log(err);
                        await sharp(profilePhoto.data).toFile(uploadPath , err => console.log(err))
                    })
                }          
                user.profilePhoto = fileName
                await user.save()
            }
            else throwError("فرمت فقط JPG یا PNG" , 422 , null)
        }

        if(user.email === email){
            if(user.username === username) return res.status(201).json({ message : "پروفایل با موفقیت تغییر یافت" })
            else if(user.username !== username){
                if(duplicatedUsername) throwError("نام کاربری قبلا ثبت شده است" , 422 , null)
                if(username === "" || username.length < 6 || username.length > 255) throwError("نام کاربری غیرمجاز" , 422 , null)
                
                user.username = username
                await user.save()
                return res.status(201).json({ message : "پروفایل با موفقیت تغییر یافت" })
            }
        }else if(user.email !== email){
            if(duplicatedEmail) throwError("ایمیل قبلا ثبت شده است" , 422 , null)

            const token = jwt.sign({ email : email , username : username } , process.env.JWT_SECRET , {expiresIn : "1h"})
            const link = `http://localhost:5000/dashboard/change-email/${token}`
            
            //Send email
            console.log(link);
            
            return res.status(200).json({ message : "لینک تغییر ایمیل ارسال شد" })
        }
    } catch (err) {
        next(err)
    }
}
module.exports.changeEmail = async(req , res , next) => {
    let decodedToken;
    try {
        decodedToken = jwt.verify(req.params.token , process.env.JWT_SECRET)
        if(!decodedToken) throwError("404 Not found" , 404 , null)
    } 
    catch (err) { 
        console.log(err)
        return res.status(500).json({ message : "Server error" })
    }

    try {

        //finds user by id
        const user = await User.findOne({ _id : req.userId })
        if(decodedToken.username === user.username){
            user.username = decodedToken.username
            user.email = decodedToken.email
            await user.save()
            return res.status(201).json({ message : "ایمیل با موفقیت تغییر یافت" })
        }else if(decodedToken.username !== user.username){
            if(decodedToken.username === "" || decodedToken.username.length < 6 
            || decodedToken.username.length > 255) throwError("نام کاربری غیرمجاز" , 422 , null)
            
            const duplicatedUsername = await User.findOne({ username : decodedToken.username })
            if(duplicatedUsername) throwError("نام کاربری قبلا ثبت شده است" , 422 , null)
            
            user.username = decodedToken.username
            user.email = decodedToken.email
            await user.save()
            return res.status(201).json({ message : "ایمیل با موفقیت تغییر یافت" })
        }

    } catch (err) {
        next(err)
        console.log(err);
    }

}




