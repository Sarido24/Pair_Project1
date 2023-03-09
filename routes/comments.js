const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');

router.get('/add', Controller.addComment);

module.exports = router;