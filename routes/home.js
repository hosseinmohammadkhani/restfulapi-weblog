const { Router } = require('express');
const router = new Router();
const mainPageController = require('../controllers/mainPageController.js');
const {authenticated} = require('../utils/helpers.js');

// @desc get posts page
// @route GET /
router.get("/" , mainPageController.getPosts)

// @desc show post 
// @route GET /post/:id
router.get("/post/:id" , mainPageController.showPost)

// @desc submit comment 
// @route POST /submit-comment/:postId
router.post("/submit-comment/:postId" , mainPageController.submitComment)

// @desc delete comment
// @route DELETE /delete-comment/:commentId
router.delete("/delete-comment/:commentId" , authenticated , mainPageController.deleteComment)

// @desc handle contact-us
// @route POST /contact-us 
router.post("/contact-us" , mainPageController.handleContactUs)

module.exports = router