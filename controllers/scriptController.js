/**
 * Script Controller
 * Handles all script generation request logic
 */

const { generateVideoScript, generateImagePrompts } = require('../services/geminiService');

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
    // Generate the script first
    const script = await generateVideoScript(subject);
    
    // Automatically generate image prompts for the script
    let imagePrompts;    try {
      imagePrompts = await generateImagePrompts(script);
      console.log('Image prompts generated successfully:', JSON.stringify(imagePrompts).substring(0, 100) + '...');
      if (!imagePrompts || !imagePrompts.paragraphs) {
        console.warn('Generated image prompts have invalid structure:', imagePrompts);
        imagePrompts = { paragraphs: [] };
      }
    } catch (promptError) {
      console.error('Error generating image prompts:', promptError);
      // Continue with script only if image prompts fail
      imagePrompts = { paragraphs: [] };
    }
    
    // Return both script and image prompts in response
    res.status(200).json({
      script,
      imagePrompts
    });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ error: error.message || 'Error generating script' });
  }
};

/**
 * Generate image prompts based on a script
 */
const createImagePrompts = async (req, res) => {
  try {
    const { script, count } = req.body;
    
    if (!script) {
      return res.status(400).json({ error: 'Script data is required' });
    }
    
    // Set default count to 5 if not provided or invalid
    const promptCount = (!count || isNaN(parseInt(count))) ? 5 : parseInt(count);
    
    const imagePrompts = await generateImagePrompts(script, promptCount);
    res.status(200).json({ imagePrompts });
  } catch (error) {
    console.error('Image prompt generation error:', error);
    res.status(500).json({ error: error.message || 'Error generating image prompts' });
  }
};

/**
 * Render the script display page
 */
const getScriptPage = (req, res) => {
  res.render('script', { title: 'Generated Script' });
};

/**
 * Render the image prompts page
 */
const getImagePromptPage = (req, res) => {
  res.render('image-prompts', { title: 'AI Image Prompts' });
};

module.exports = {
  getHomePage,
  createScript,
  getScriptPage,
  createImagePrompts,
  getImagePromptPage
};
