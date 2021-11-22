const express = require('express');
const {body} = require('express-validator');
const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');
const router = express.Router();
let postDataValidation = [
  body('title')
    .trim()
    .isLength({min: 5}),
  body('content')
    .trim()
    .isLength({min: 5}),
];
// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post(
  '/createPost',
  isAuth,
  postDataValidation,
  feedController.createPost,
);
//get single post

router.get('/getSinglePost/:postId', isAuth, feedController.getSinglePost);
//update post
router.put(
  '/updatePost/:postId',
  isAuth,
  postDataValidation,
  feedController.updatePost,
);
//deete post

router.delete('/deletePost/:postId', isAuth, feedController.deletepost);

module.exports = router;
