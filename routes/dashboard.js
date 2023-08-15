const { Router } = require('express');
const router = new Router()
const adminController = require('../controllers/adminController.js');
const { authenticated } = require('../utils/helpers.js');


// @desc create post handler 
// @route POST /dashboard/create-post
router.post("/create-post" , authenticated , adminController.handleCreatePost)

// @desc handle edit post
// @route PUT /dashboard/edit-post/:id
router.put("/edit-post/:id" , authenticated ,  adminController.handleEditPost)

// @desc delete post
// @route DELETE /dashboard/delete-post/:id
router.delete("/delete-post/:id" , authenticated , adminController.deletePost)

// @desc messages page
// @route GET /dashboard/messages/:id
router.get("/messages/:id" , authenticated , adminController.messagesPage)

// @desc edit profile
// @route PUT /dashboard/edit-profile/:username
router.put("/edit-profile/:username" , authenticated , adminController.handleEditProfile)

// @desc change-email 
// @route GET /dashboard/change-email/:token
router.get("/change-email/:token" , authenticated , adminController.changeEmail)

module.exports = router