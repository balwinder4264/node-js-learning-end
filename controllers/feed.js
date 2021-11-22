const {validationResult} = require('express-validator');
const PostModel = require('../models/post');
const UserModel = require('../models/user');
const fs = require('fs');
const path = require('path');
exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  PostModel.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return PostModel.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })

    .then(posts => {
      res.status(200).json({
        message: 'Fetched post successfully',
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('validation failed enterd data incorrect');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No image found');
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;

  //insert into the database
  const post = new PostModel({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  post
    .save()
    .then(result => {
      return UserModel.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
        creator: {_id: creator._id, name: creator.name},
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  // Create post in db
};

exports.getSinglePost = (req, res, next) => {
  const postId = req.params.postId;
  PostModel.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find the Error');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({message: 'Post fectched', post: post});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No image Picked');
    error.statusCode = 422;
    throw error;
  }

  PostModel.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find the Error');
        error.statusCode = 404;
        throw error;
      }
      //if id belongs to id of the creator
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Could not find a post ');
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      res.status(200).json({message: 'post update successfully', post: result});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletepost = (req, res, next) => {
  const postId = req.params.postId;
  PostModel.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find the Post');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Could not find a post ');
        error.statusCode = 404;
        throw error;
      }
      clearImage(post.imageUrl);
      return PostModel.findByIdAndRemove(postId);
    })
    .then(result => {
      return UserModel.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({message: 'Post Deleted successfully'});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = filepath => {
  filepath = path.join(__dirname, '..', filepath);
  fs.unlink(filepath, err => console.log(err));
};
