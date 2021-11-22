const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/user');
const jwt = require('jsonwebtoken');
exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Somethinf went wrong with validation');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  bcrypt
    .hash(password, 12)
    .then(hashedPW => {
      const user = new UserModel({
        email: email,
        password: hashedPW,
        name: name,
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({message: 'User Created !', userId: result._id});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Signing in user

exports.signIn = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  UserModel.findOne({email: email})
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email cound not be found');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong Password');
        error.statusCode = 401;
        throw error;
      }
      //create token here
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        'secret',
        {expiresIn: '1h'},
      );
      res.status(200).json({token: token, userId: loadedUser._id.toString()});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
