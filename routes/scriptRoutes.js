/**
 * Script Routes
 * Defines all routes related to script generation
 */

const express = require('express');
const router = express.Router();
const { getHomePage, createScript, getScriptPage } = require('../controllers/scriptController');

// Home page route
router.get('/', getHomePage);

// API route for script generation
router.post('/api/generate', createScript);

// Script display page route
router.get('/script', getScriptPage);

module.exports = router;
