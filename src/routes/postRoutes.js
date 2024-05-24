const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/info', postController.getPosts);
router.post('/add', postController.addPost);

module.exports = router;
