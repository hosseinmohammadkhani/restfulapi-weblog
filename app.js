const bodyParser = require('body-parser');
const dotEnv = require('dotenv');
const express = require('express');
const path = require('path');
const app = express()
const connectDB = require("./configs/database.js")
const fileupload = require('express-fileupload');

const { errorHandler, setHeaders } = require('./utils/helpers.js');

app.use(bodyParser.urlencoded({ extended : false })) //encodes url requests
app.use(bodyParser.json()) // Parses JSON requests 

app.use(setHeaders)

//Connects the app to database
connectDB()

app.use(require('cookie-parser')())

//Environmental variables
dotEnv.config({ path : "./configs/config.env" })

//having access to public folder
app.use(express.static(path.join(__dirname , "public")))

//populates req.files
app.use(fileupload())


app.use("/" , require('./routes/home.js'))
app.use("/dashboard" , require('./routes/dashboard.js'))
app.use("/users" , require("./routes/users.js"))

//Error controller
app.use(errorHandler)


const PORT = process.env.PORT || 5000

app.listen(PORT , () => console.log(`Server is running on port ${PORT}`))