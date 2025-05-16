/**
 * Gemini AI Service
 * This service handles all interactions with the Gemini API for script generation
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    }

    // Select the model and set parameters for high-quality creative text generation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });    // Construct a detailed prompt based on the script rules
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
  generateVideoScript
};
