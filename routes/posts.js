const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');

router.get('/', Controller.renderPostManagementPage);
router.get('/add', Controller.renderAddPost);
router.post('/add', Controller.handleAddPost);
router.get('/edit/:id', Controller.renderEditPost);
router.post('/edit/:id', Controller.handleEditPost);
router.get('/detail/:id', Controller.postDetail);
router.get('/delete/:id', Controller.deletePost);
router.post('/comment/:id', Controller.addComment);

module.exports = router;