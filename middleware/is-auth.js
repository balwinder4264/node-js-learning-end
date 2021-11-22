const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not Authenticated 1');
    error.statuscode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodeToke;
  try {
    decodeToke = jwt.verify(token, 'secret');
  } catch (err) {
    err.statuscode = 500;
    throw err;
  }
  if (!decodeToke) {
    const error = new Error('Not Authenticated');
    error.statuscode = 401;
    throw error;
  }
  req.userId = decodeToke.userId;
  next();
};
