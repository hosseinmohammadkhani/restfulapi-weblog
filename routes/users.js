const { Router } = require('express');
const router = new Router()
const userController = require('../controllers/userController.js');


// @desc send token to email
// @route POST /users/register
router.post("/register" , userController.handleRegister)

// @desc register handler
// @route POST /users/register/:token
router.post("/register/:token" , userController.createUser)

// @desc login handler
// @route POST /users/login
router.post("/login" , userController.handleLogin)

// @desc handle forget-password
// @route POST /users/forget-password
router.post("/forget-password" , userController.handleForgetPassword)

// @desc handle reset-password 
// @route POST /users/reset-password/:token
router.post("/reset-password/:token" , userController.handleResetPassword)

// @desc profile page
// @route GET /users/profile/:username
// router.get("/profile/:username" , userController.showProfilePage)

// @desc handle send message
// @route POST /users/message/:username
router.post("/message/:username" , userController.handleSendMessage)

module.exports = router