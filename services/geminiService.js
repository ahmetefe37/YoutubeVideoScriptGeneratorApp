/**
 * Gemini AI Service
 * This service handles all interactions with the Gemini API for script generation
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate image prompts based on a video script
 * @param {Object} script - The video script object
 * @param {number} count - Number of image prompts to generate (default: 5)
 * @returns {Object} - Object with paragraphs and their corresponding image prompts
 */
const generateImagePrompts = async (script, count = 5) => {
  try {
    // Validate input
    if (!script) {
      throw new Error('Script is required for image prompt generation');
    }    // Select the model and set parameters for creative image prompt generation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    // Extract key information from the script
    const { title, category, script: scriptContent } = script;
    
    // Extract paragraphs from the script
    const paragraphs = [
      { title: "Intro Hook", content: scriptContent.introHook },
      { title: "Background Setup", content: scriptContent.backgroundSetup },
      ...scriptContent.storySegments,
      { title: "Consequences", content: scriptContent.consequences },
      { title: "Outro", content: scriptContent.outro }
    ];
    
    // Create a detailed prompt for image generation
    const prompt = `
      Based on the following YouTube video script, generate one detailed, high-quality image prompt for EACH paragraph.
      These prompts will be used with AI image generation tools like DALL-E, Midjourney or Stable Diffusion.
      
      VIDEO TITLE: ${title}
      CATEGORIES: ${category.join(', ')}
      
      PARAGRAPHS:
      ${paragraphs.map((para, index) => `
      PARAGRAPH ${index + 1}: ${para.title}
      ${para.content}
      `).join('\n\n')}
      
      VERY IMPORTANT: Format your response as a raw JSON object WITHOUT any markdown formatting, code blocks, or backticks.
      
      For each paragraph, create a detailed, visually striking image prompt that captures the essence of that paragraph.
      
      Your image prompts should:
      1. Be detailed and specific about what needs to be shown in the image
      2. Include style information (cinematic, photorealistic, digital art, etc.)
      3. Mention lighting, mood, and atmosphere
      4. Include resolution/quality indicators (8k, highly detailed, etc.)
      5. Avoid copyright references to specific artists, movies, or brands
      
      Example format:
      {
        "paragraphs": [
          {
            "number": 1,
            "title": "Intro Hook",
            "text": "Full paragraph text here...",
            "imagePrompt": "A dramatic wide-angle shot of ancient ruins of Pompeii with Mount Vesuvius looming in the background, dark storm clouds gathering, streams of lava beginning to flow, cinematic lighting, atmospheric smoke, 8k resolution, photorealistic"
          },
          {
            "number": 2,
            "title": "Background Setup",
            "text": "Full paragraph text here...",
            "imagePrompt": "Aerial view of a bustling Roman marketplace in Pompeii, 79 AD, citizens in period-accurate togas going about daily life, detailed architecture with marble columns, bright daylight illuminating vibrant market stalls, hyper-detailed textures, cinematic composition"
          }
        ]
      }
    `;

    // Generate the content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response text to ensure it's valid JSON
    text = text.replace(/```json|```/g, '').trim();
    
    try {
      // Parse the JSON response
      const imagePrompts = JSON.parse(text);
      return imagePrompts;
    } catch (jsonError) {
      console.error('Failed to parse JSON response for image prompts:', jsonError);
      console.log('Raw response:', text);
      throw new Error('The AI response was not in valid JSON format. Please try again.');
    }
  } catch (error) {
    console.error('Error generating image prompts:', error);
    throw new Error('Failed to generate image prompts: ' + error.message);
  }
};

/**
 * Generate a video script based on user input
 * @param {string} subject - The subject for the script
 * @returns {Object} - The generated script with title, description, and content
 */
const generateVideoScript = async (subject) => {
  try {
    // Validate input
    if (!subject || subject.trim() === '') {
      throw new Error('Subject is required for script generation');
    }    // Select the model and set parameters for high-quality creative text generation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });// Construct a detailed prompt based on the script rules
    const prompt = `
      Generate a YouTube video script about "${subject}" following these strict guidelines:
      
      1. CATEGORY: Identify one or more appropriate categories from this list:
         History, Legends, Mysteries, Inventions, Rules, Culture, What-If
      
      2. TITLE: Create a curiosity-driven, clickable title under 60 characters.
         - Capitalize all main words
         - Include numbers when relevant
         - Use emotion or stakes words like "Changed History", "Never Told", "Secret"
         - For What-Ifs, phrase as a question
         - Example formats: "What If [Subject] Happened?", "The Untold Story of [Event/Person]",
           "[#] [Topic] That Changed [Time/Place]", "The Rule That [Consequence]"
      
      3. DESCRIPTION: Write a 3-part description:
         - Summary Line (1-2 sentences explaining the subject)
         - Engagement Hook (invite curiosity)
         - Call to Action with hashtags
      
      4. SCRIPT STRUCTURE:
         - Intro Hook (45-60 sec): Introduce the question/scenario/claim
         - Background Setup (1-2 min): Set time/place; real-world context
         - Story Segments (8-10 min): 4-6 "mini-stories" or phases
         - Consequences (2-3 min): Reflect on bigger impact, ripple effect
         - Outro/Reflection (30-60 sec): Conclude, pose question to audience
      
      5. TONE: Calm, curious, cinematic, reflective with simple, emotional language
      
      VERY IMPORTANT: Format your response as a raw JSON object WITHOUT any markdown formatting, code blocks, or backticks. 
      The response should be a valid JSON object that can be directly parsed with JSON.parse(). 
      Use this exact structure:
      
      {
        "category": ["Category1", "Category2"],
        "title": "The Title",
        "description": "Full description with all three parts",
        "script": {
          "introHook": "Full intro hook text",
          "backgroundSetup": "Full background setup text",
          "storySegments": [
            {
              "title": "Segment 1 Title",
              "content": "Full segment content"
            }
          ],
          "consequences": "Full consequences section text",
          "outro": "Full outro text"
        }
      }
    `;    // Generate the content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response text to ensure it's valid JSON
    // Sometimes the API returns markdown-formatted JSON with ```json wrapping
    text = text.replace(/```json|```/g, '').trim();
    
    try {
      // Parse the JSON response
      const scriptData = JSON.parse(text);
      return scriptData;
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      console.log('Raw response:', text);
      throw new Error('The AI response was not in valid JSON format. Please try again.');
    }
  } catch (error) {
    console.error('Error generating video script:', error);
    throw new Error('Failed to generate script: ' + error.message);
  }
};

module.exports = {
  generateVideoScript,
  generateImagePrompts
};
