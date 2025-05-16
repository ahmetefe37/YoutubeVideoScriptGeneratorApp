/**
 * Script Controller
 * Handles all script generation request logic
 */

const { generateVideoScript } = require('../services/geminiService');

/**
 * Render the home page
 */
const getHomePage = (req, res) => {
  res.render('index', { title: 'YouTube Video Script Generator' });
};

/**
 * Generate a video script based on user input
 */
const createScript = async (req, res) => {
  const { subject } = req.body;
  
  if (!subject || subject.trim() === '') {
    return res.status(400).json({ error: 'Subject is required' });
  }
  
  try {
    const script = await generateVideoScript(subject);
    res.status(200).json(script);  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: error.message || 'Error generating script' });
  }
};

/**
 * Render the script display page
 */
const getScriptPage = (req, res) => {
  res.render('script', { title: 'Generated Script' });
};

module.exports = {
  getHomePage,
  createScript,
  getScriptPage
};
