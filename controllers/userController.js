const User = require('../models/User.js');
const Message = require('../models/Message.js');
const JWT = require('jsonwebtoken');
const captchapng = require('captchapng');
const bcrypt = require('bcryptjs');
const { throwError } = require('../utils/helpers.js');

let CAPTCHA_NUM

module.exports.createUser = async(req , res) => {
    try {
        
        //object destructuring : picks up username , email , password from req.body object
        const { email , password } = req.body
        let { username } = req.body
        username = username.replace(/\s+/g, '-').toLowerCase() //replacing space with dash

        await User.userValidation(req.body)

        //finds user by email or username
        const duplicatedEmail = await User.findOne({ email : email })
        const duplicatedUsername = await User.findOne({ username : username })
        
        if(duplicatedEmail) throwError("کاربر با این ایمیل موجود است" , 422 , null)
        if(duplicatedUsername) throwError("کاربر با این  نام کاربری موجود است" , 422 , null)
    
        await User.create({ username , email , password })
        
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
        else{
            //422 status code : error in authentication
            throwError("ایمیل یا کلمه ی عبور اشتباه است" , 422 , null)
        }
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

/*
module.exports.showProfilePage = async(req , res) => {
    console.log(req._parsedOriginalUrl.path);
    const username = req._parsedOriginalUrl.path.substr(15)
    
    //finds the first thing related - finds user by username
    const user = await User.findOne({ username : username })
    res.render("./profile.ejs" , {
        pageTitle : user.username,
        username : user.username,
        email : user.email,
        date : user.createdAt,
        convertToShamsi,
    })
}



module.exports.sendMessagePage = async(req , res) => {

    const username = req._parsedOriginalUrl.path.substr(15)

    //finds user by username
    const user = await User.findOne({ username : username })

    res.render("./sendMessage.ejs" , {
        pageTitle : "ارسال پیام به نویسنده",
        path : "/users/message",
        layout : "./layouts/navbar.ejs",
        req,
        message : req.flash("success_msg"),
        error : req.flash("error"),
        username : username
    })
    
}
*/
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