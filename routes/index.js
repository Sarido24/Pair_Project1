const express = require('express');
const router = express.Router();
const routerRegister = require('./register');
const routerPosts = require('./posts');
const Controller = require('../controllers/controller');

router.get('/', Controller.home);
router.use('/register', routerRegister);
router.use('/posts', routerPosts);

module.exports = router;
