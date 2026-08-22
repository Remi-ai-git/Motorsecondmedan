const express = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const router = express.Router();

// Publik — tidak butuh token.
router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);

// Butuh token — mengembalikan profil user yang sedang login.
router.get('/me', authenticate, controller.me);

module.exports = router;
