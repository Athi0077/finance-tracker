const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator results
 * Use after validation chains in routes
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
      errors: errors.array(),
    });
  }
  next();
};

module.exports = validate;
