const User = require('../models/User.js');
const Message = require('../models/Message.js');
const JWT = require('jsonwebtoken');
const captchapng = require('captchapng');
const bcrypt = require('bcryptjs');
const { throwError } = require('../utils/helpers.js');
const {nanoid} = require('nanoid');
const appRoot = require('app-root-path');
const sharp = require('sharp');

let CAPTCHA_NUM

module.exports.handleRegister = async(req , res , next) => {
    try {
        let token = JWT.sign({ email : req.body.email } , process.env.JWT_SECRET , { expiresIn : "1h" })
        
        //لینک زیر باید به ایمیل کاربر ارسال شود
        let registerLink = `http://localhost:5000/users/register/${token}`
        console.log(`لینک ثبت نام
        اگر در حال حاضر در وبلاگ حساب کاربری دارید ، این پیام را نادیده بگیرید
        لینک ثبت نام : ${registerLink}`);

        return res.status(200).json({ message : "لینک تایید ثبت نام ارسال شد" })
        
    } catch (err) {
        next(err)
    }
}

module.exports.createUser = async(req , res , next) => {
    let decodedToken;
    try {
        decodedToken = JWT.verify(req.params.token , process.env.JWT_SECRET)
        if(!decodedToken) throwError("Invalid token" , 404 , null)
    } catch (err) {
       next(err) 
    }

    let profilePhoto = req.files ? req.files.profilePhoto : {}
    let fileName = `${await nanoid()}_${profilePhoto.name}`
    fileName = fileName.replace(/\s+/g, '-').toLowerCase() //replacing space with dash
    const uploadPath = `${appRoot}/public/uploads/profilePhotos/${fileName}`

    try {

        req.body = {...req.body , profilePhoto}
        
        //object destructuring : picks up username , email , password from req.body object
        const { email , password } = req.body
        let username = req.body.username
        username = username.replace(/\s+/g, '-').toLowerCase() //replacing space with dash

        await User.userValidation(req.body)

        if(email !== decodedToken.email) throwError("ایمیل نامعتبر" , 422 , null)

        //finds user by email or username
        const duplicatedEmail = await User.findOne({ email : email })
        const duplicatedUsername = await User.findOne({ username : username })
        
        if(duplicatedEmail) throwError("کاربر با این ایمیل موجود است" , 422 , null)
        if(duplicatedUsername) throwError("کاربر با این  نام کاربری موجود است" , 422 , null)
    

        //Profile photo
        if(typeof profilePhoto.name == `undefined`){
            await User.create({ username : username , email : email , password : password , profilePhoto : "" })
            return res.status(201).json({ message : "کاربر با موفقیت ساخته شد" })
        }
            
        if(profilePhoto.mimetype != "image/jpeg" && profilePhoto.mimetype != "image/png") throwError("فرمت فقط JPG یا PNG" , 422, null)

        if(profilePhoto.size > 8000000) throwError("حداکثر حجم : 8 مگابایت" , 422 , null)

        if(profilePhoto != {}) await sharp(profilePhoto.data).toFile(uploadPath , err => console.log(err))

        await User.create({ username : username , email : email , password : password , profilePhoto : fileName })
        
        //201 : The request succeeded, and a new resource was created as a result.
        return res.status(201).json({ message : "کاربر با موفقیت ساخته شد" })
        
    } catch (err) {
        next(err)
        console.log(err);  
    }

}

module.exports.handleLogin = async(req , res ,next) => {
    try {

        const { email , password } = req.body
        
        //finds user by email
        const user = await User.findOne({ email })
        if(!user) throwError("ایمیل یا کلمه ی عبور اشتباه است" , 404 , null)

        const isEqual = await bcrypt.compare(password , user.password)
        if(isEqual){
            //sending user's information in token
            const token = JWT.sign({user : {
                    userId : user._id.toString(),
                    email : user.email,
                    username : user.username }} , 
                process.env.JWT_SECRET , {expiresIn : "1h" })
            return res.status(200).json({ token , userId : user._id.toString() })
        }
        else throwError("ایمیل یا کلمه ی عبور اشتباه است" , 422 , null)
        
    } catch (err) {
        next(err)
        console.log(err);     
    }
}

module.exports.handleForgetPassword = async(req , res ,next) => {
    try {
        const { email } = req.body

        // finds user by email
        const user = await User.findOne({ email : email })
        if(!user) throwError("ایمیل یافت نشد" , 404 , null)
        
        let token = JWT.sign({ userId : user._id } , process.env.JWT_SECRET , {expiresIn : "1h"})
        const resetLink = `localhost:5000/users/reset-password/${token}`
        console.log(resetLink);
        return res.status(200).json({ message : "لینک ریست پسوورد با موفقیت ارسال شد"  , resetLink : resetLink})
    } catch (err) {
        next(err)
        console.log(err);
    }
}

module.exports.handleResetPassword = async(req , res ,next) => {
    const { password , confirmPassword } = req.body
    
    try {
        const decodedToken = JWT.verify(req.params.token , process.env.JWT_SECRET)
        if(!decodedToken) throwError("توکن نامعتبر"  , 401 , null)

        if(password.length < 6 || password.length > 255) throwError("اندازه ی پسوورد حداقل 6 کاراکتر و حداکثر 255 کاراکتر است" , 422 , null)

        if(password !== confirmPassword) throwError("پسوورد و تکرار باید برابر باشند" , 422 , null)
        
        //finds user by id in decodedToken 
        const user = await User.findOne({ _id : decodedToken.userId })
        if(!user) throwError("کاربر یافت نشد" , 404 , null)

        user.password = password
        await user.save()

        return res.status(200).json({ message : "پسوورد با موفقیت تغییر یافت" })

    } catch (err) {
        next(err)
        console.log(err);
    }
}


module.exports.handleSendMessage = async(req , res , next) => {
    try {
        const { fullName , email , message } = req.body
        
        //finds user by username
        const user = await User.findOne({ username : req.params.username })
     
        if(!user) throwError("کاربری با این نام کاربری وجود ندارد" , 404 , null)
        if(fullName.length < 6 || fullName.length > 255) throwError("اندازه ی نام و نام خانوادگی حداقل 6 کاراکتر و حداکثر 255 کاراکتر می‌باشد" , 422 , null)
        if(message.length === 0 || message === "") throwError("ارسال پیام الزامی است" , 422 , null)
        console.log("Full name : " , fullName);
        console.log("Email : " , email);
        console.log("Message : " , message);
        return res.status(200).json({ message : "پیام با موفقیت ارسال شد" })
    } catch (err) {
        next(err)
        console.log(err);
    }
}


module.exports.getMessageCaptcha = (req , res) => {
    CAPTCHA_NUM = parseInt(Math.random()*9000+1000)
    const p = new captchapng(80 , 30 , CAPTCHA_NUM)
    p.color(0, 0, 0, 0);  
    p.color(80, 80, 80, 255)

    let img = p.getBase64()
    let imgbase64 = Buffer.from(img , "base64")

    res.send(imgbase64)
}