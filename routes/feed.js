const express = require('express');
const { body } = require("express-validator");
const feedController = require('../controllers/feed');

const router = express.Router();
let postDataValidation = [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 })
]
// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/post
router.post('/createPost', postDataValidation, feedController.createPost);
//get single post 

router.get('/getSinglePost/:postId', feedController.getSinglePost)
//update post 
router.put('/updatePost/:postId', postDataValidation, feedController.updatePost)
//deete post 

router.delete('/deletePost/:postId', feedController.deletepost)


module.exports = router;