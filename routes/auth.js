const express = require('express');
const {body} = require('express-validator');
const UserModel = require('../models/user');
const router = express.Router();
const authController = require('../controllers/auth');

const signUpValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, {req}) => {
      return UserModel.findOne({email: value}).then(userDoc => {
        if (userDoc) {
          return Promise.reject('E-mail address already exists!');
        }
      });
    })
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({min: 5}),
  body('name')
    .trim()
    .not()
    .isEmpty(),
];
router.put('/signup', signUpValidation, authController.signUp);
router.post('/signin', authController.signIn);

module.exports = router;
