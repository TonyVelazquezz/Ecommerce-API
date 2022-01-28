const express = require('express');

const { renderIndex } = require('../controllers/views.controllers');

const router = express.Router();

router.get('/', renderIndex);

module.exports = { viewsRouter: router };
