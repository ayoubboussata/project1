const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/info', userController.getInfo);
router.post('/add', userController.addUser);

module.exports = router;
