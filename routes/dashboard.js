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

// @desc edit profile
// @route PUT /dashboard/edit-profile/:id
router.put("/edit-profile/:id" , authenticated , adminController.handleEditProfile)

module.exports = router