const Post = require('../models/Post.js');
const User = require("../models/User.js")
const Yup = require('yup');
const captchapng = require('captchapng');
const Message = require('../models/Message.js');
const Comment = require('../models/Comment.js');
const { throwError } = require('../utils/helpers.js');
let CAPTCHA_NUM

module.exports.getPosts = async(req , res , next) => {
    try {

        const numberOfPosts = await Post.find({ status : "public" }).countDocuments()
        
        const posts = await Post.find({ status : "public" }).sort({ createdAt : "desc" })
        
        if(!posts) throwError("پستی یافت نشد" , 404 , null , next)

        res.status(200).json({ posts : posts , total : numberOfPosts})
    } catch (err) {
        next(err)
    }

    
}

module.exports.showPost = async(req , res , next) => {
    try {
        //Finds post by its id
        const post = await Post.findOne({ _id : req.params.id })

        //All of the comments of the post in an array
        const comments = await Comment.find({ postId : post._id })

        if(!post) throwError("پستی با ابن شناسه یافت نشد" , 404 , null)
    
        res.status(200).json({ post : post , comments : comments })
    } catch (err) {
        next(err)
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

module.exports.submitComment = async(req , res , next) => {
    const { name , comment } = req.body
    try {
        const post = await Post.findOne({ _id : req.params.postId })

        if(!post) throwError("Post not found" , 404 , null)
 
        if(name === "" || comment === "") throwError("وارد کردن نام و کامنت الزامی است" , 422 , null)
        await Comment.create({ name , comment , postId : post._id })
        return res.status(201).json({ message :  "نظر شما با موفقیت ثبت شد" }) 
    } catch (err) {
        next(err)
        console.log(err);        
    }    
}

module.exports.deleteComment = async(req , res , next) => {
    try {
        
        //finds comment by its id     
        const comment = await Comment.findOne({ _id : req.params.commentId })
        
        if(!comment) throwError("کامنت یافت نشد" , 401 , null)

        //finds post by id in the comment
        const post = await Post.findOne({ _id : comment.postId.toString() })

        //Only owner of post can delete comment
        if(req.userId == post.user.toString()){
            await Comment.findByIdAndRemove(req.params.commentId)
            return res.status(200).json({ message : "کامنت حذف شد" })
        }
        else if(req.userId != post.user.toString()) throwError("خطا" , 401 , null)
        
        
    } catch (err) {
        next(err)
        console.log(err);
    }
}