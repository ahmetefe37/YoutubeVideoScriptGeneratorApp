/**
 * Script Routes
 * Defines all routes related to script generation
 */

const express = require('express');
const router = express.Router();
const { 
  getHomePage, 
  createScript, 
  getScriptPage, 
  createImagePrompts, 
  getImagePromptPage,
  getTranslationsPage,
  translateScriptToLanguage
} = require('../controllers/scriptController');

// Home page route
router.get('/', getHomePage);

// API route for script generation
router.post('/api/generate', createScript);

// Script display page route
router.get('/script', getScriptPage);

// Image prompts routes
router.get('/image-prompts', getImagePromptPage);
router.post('/api/image-prompts', createImagePrompts);

// Translation routes
router.get('/translations', getTranslationsPage);
router.post('/api/translate', translateScriptToLanguage);

module.exports = router;
