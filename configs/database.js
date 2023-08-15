const mongoose = require('mongoose');
const connectDB = async() => {
    try {
        await mongoose.connect(`mongodb://localhost:27017/weblog-project-restfulapi` , {
            useNewUrlParser : true,
            useUnifiedTopology : true,
            family : 4
        })
        console.log("Database connected")
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}
module.exports = connectDB