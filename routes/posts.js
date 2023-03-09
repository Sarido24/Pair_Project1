const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');

router.get('/add', Controller.renderAddPost);
router.post('/add', Controller.handleAddPost);
router.get('/detail/:id', Controller.postDetail);
router.post('/comment/:id', Controller.addComment);

module.exports = router;