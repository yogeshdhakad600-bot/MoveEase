const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const { register, login, me, updateMe } = require('../controllers/authController');

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('password').isLength({ min: 6 }),
], validate, register);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, login);
router.get('/me', protect, me);
router.patch('/me', protect, updateMe);

module.exports = router;
