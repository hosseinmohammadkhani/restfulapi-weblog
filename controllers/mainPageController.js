const Post = require('../models/Post.js');
const User = require("../models/User.js")
const Yup = require('yup');
const captchapng = require('captchapng');
const Message = require('../models/Message.js');
const { throwError } = require('../utils/helpers.js');
let CAPTCHA_NUM

module.exports.getPosts = async(req , res , next) => {
    try {

        const numberOfPosts = await Post.find({ status : "public" }).countDocuments()
        
        const posts = await Post.find({ status : "public" }).sort({ createdAt : "desc" })
        
        if(!posts) throwError("پستی یافت نشد" , 404 , null , next)

        res.status(200).json({posts , total:numberOfPosts})
    } catch (err) {
        next(err)
    }

    
}

module.exports.showPost = async(req , res , next) => {
    try {
        //Finds post by its id
        const post = await Post.findOne({ _id : req.params.id })

        if(!post) throwError("پستی با ابن شناسه یافت نشد" , 404 , null , next)
    
        res.status(200).json({post})
    } catch (err) {
       console.log(err);
    }

    
}

module.exports.handleContactUs = async(req , res , next) => {
    const errorsArray = []
    try {
        const { fullName , email , message } = req.body
        console.log(`${fullName} -- ${email} -- ${message}`);
        const schema = Yup.object().shape({
            fullName: Yup.string().required("نام و نام خانوادگی الزامی می باشد"),
            email: Yup.string().email("آدرس ایمیل صحیح نیست").required("آدرس ایمیل الزامی می باشد"),
            message: Yup.string().required("پیام اصلی الزامی می باشد"),
        });
        
        //throws error if not authenticated
        await schema.validate(req.body , { abortEarly : false })

        return res.status(200).json({ message : "پیام با موفقیت ارسال شد" })
    } catch (err) {
        err.inner.forEach( e => errorsArray.push({ message : e.message }) )
        throwError("خطا در اعتبارسنجی" , 422 , errorsArray , next)
    }
    
}

module.exports.getCaptcha = (req , res) => {
    CAPTCHA_NUM = parseInt(Math.random()*9000+1000)
    let p = new captchapng(80 , 30 , CAPTCHA_NUM)
    p.color(0, 0, 0, 0)
    p.color(80, 80, 80, 255)

    let img = p.getBase64()
    let imgbase64 = Buffer.from(img , "base64")
    res.send(imgbase64)
}