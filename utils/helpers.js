const jwt = require('jsonwebtoken');

module.exports.authenticated = (req , res , next) => {
    try {

        //Gets request header
        const authHeader = req.get("Authorization")
        if(!authHeader) this.throwError("بدون مجوز" , 401 , null)
        
        //Having access to token sent from handleLogin
        const token = authHeader.split(" ")[1]
        const decodedToken = jwt.verify(token , process.env.JWT_SECRET)
        if(!decodedToken) this.throwError("توکن نامعتبر" , 401 , null)
        console.log(decodedToken);
        req.userId = decodedToken.user.userId
        next()
    } catch (err) {
        next(err)
    }
    
}

module.exports.errorHandler = (err , req , res , next) => {

    //err.statusCode === status code that is sent by developer
    const status = err.statusCode || 500
    const message = err.message
    const data = err.data
    if(res.headerSent) return next(err)
    res.status(status).json({ message , data })
}

module.exports.throwError = (message , statusCode , data) => {
    const error = new Error(message)
    error.statusCode = statusCode
    if(data !== null) error.data = data
    throw error
}

module.exports.setHeaders = (req, res ,next) => {

    res.setHeader("Access-Control-Allow-Origin" , "*")
    res.setHeader("Access-Control-Allow-Methods" , "GET, POST , PUT , DELETE")
    res.setHeader("Access-Control-Allow-Headers" , "Content-Type, Authorization")
    next()
}