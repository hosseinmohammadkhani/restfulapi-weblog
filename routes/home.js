const { Router } = require('express');
const router = new Router();
const mainPageController = require('../controllers/mainPageController.js');

// @desc get posts page
// @route GET /
router.get("/" , mainPageController.getPosts)

// @desc show post 
// @route GET /post/:id
router.get("/post/:id" , mainPageController.showPost)

// @desc /captcha.png
// @route GET /captcha.png
router.get("/captcha.png" , mainPageController.getCaptcha)

// @desc handle contact-us
// @route POST /contact-us 
router.post("/contact-us" , mainPageController.handleContactUs)

module.exports = router