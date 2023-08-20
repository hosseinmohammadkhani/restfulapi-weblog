const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { schema } = require('./secure/userValidation.js');

const userSchema  = new mongoose.Schema({
    profilePhoto : {
        type : String
    },
    username : {
        type : String,
        required : [true , "نام کاربری الزامی است"],
        unique : true,
        minLength : [5 , "نام کاربری باید حداقل 5 کاراکتر باشد"],
        maxLength : [255 , "نام کاربری باید حداکثر 255 کاراکتر باشد"],
        trim : true
    },
    email : {
        type : String,
        required : [true , "ایمیل الزامی است"],
        unique : true,
        trim : true
    },
    password : {
        type : String,
        required : [true , "رمز عبور الزامی است"],
        minLength : [6 , "رمز عبور باید حداقل 6 کاراکتر باشد"],
        maxLength : [255 , "رمز عبور باید حداکثر 255 کاراکتر باشد"]
    },
    createdAt : {
        type : Date,
        default : Date.now
    }

})

userSchema.statics.userValidation = function(body){
    return schema.validate(body , { abortEarly : false })
}

//pre middleware functions are executed one after another
//Password will be encrypted before saving
userSchema.pre("save" , function(next){
    let user = this

    //check if password has been changed or not
    if(!user.isModified("password")) return next()

    
    bcrypt.hash(user.password , 10 , (err , hash) => {
        if(err) return next(err)
        user.password = hash
        next()
    })
})


module.exports = mongoose.model("User" , userSchema)
