# VideoScriptAI - YouTube Script Generator

VideoScriptAI is an AI-powered tool designed to help content creators generate engaging, well-structured video scripts for YouTube. Utilizing Google's Gemini API, this application creates professional scripts following proven storytelling principles.

## Features

- Generate complete video scripts based on your topic or subject
- Automatically categorizes your content (History, Mysteries, Culture, etc.)
- Creates YouTube-optimized titles and descriptions
- Structured scripts with intro hook, background setup, story segments, and conclusion
- **Automatic image prompts** for each paragraph of your script for use with AI image generators
- **Multi-language translations** into 8 different languages (Turkish, Russian, Chinese, French, Italian, Spanish, Hindi, Japanese)
- Clean, responsive user interface built with Bootstrap
- Easy-to-use download and copy functionality

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS (Bootstrap), JavaScript
- **AI**: Google Gemini API
- **Template Engine**: EJS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Google Gemini API key

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd VideoScriptGenerator
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your API key:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. Start the application:

   ```
   npm start
   ```

   For development with auto-reload:

   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your video subject in the form on the home page
2. Click "Generate Script" and wait for the AI to create your content
3. View, copy, or download your complete script
4. Navigate to the "Image Prompts" page to view AI-generated image prompts for each paragraph
5. Copy individual prompts or all prompts for use with image generation tools like DALL-E, Midjourney, or Stable Diffusion
6. Use the "Translate" button to access translations of your script into multiple languages
7. Use the script, translations, and generated images for your YouTube video creation

## Project Structure

```
VideoScriptGenerator/
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       └── translations.js
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs
│   ├── script.ejs
│   ├── image-prompts.ejs
│   ├── translations.ejs
│   └── error.ejs
├── routes/
│   └── scriptRoutes.js
├── controllers/
│   └── scriptController.js
├── services/
│   └── geminiService.js
├── app.js
├── .env
├── package.json
└── README.md
```

## License

This project is licensed under the ISC License.

## Image Prompts Feature

The Image Prompts feature automatically generates detailed, visually-descriptive text prompts for each paragraph in your script. These prompts are designed to work with AI image generation tools to create compelling visuals for your YouTube videos.

### How It Works

1. **Automatic Generation**: Image prompts are automatically created when you generate a new script
2. **Paragraph-Based**: Each section of your script (intro hook, background setup, story segments, etc.) gets its own image prompt
3. **AI-Optimized**: Prompts are tailored to work well with tools like DALL-E, Midjourney, and Stable Diffusion
4. **Modern UI**: Clean card-based interface makes it easy to view and copy prompts

### Image Prompt Structure

Each image prompt is designed to include:

- Detailed visual descriptions based on paragraph content
- Style suggestions (cinematic, photorealistic, digital art, etc.)
- Lighting, mood, and atmosphere guidance
- Resolution/quality indicators (8k, highly detailed, etc.)

### Usage Tips

- For best results, use the exact prompt text without modification
- Copy individual prompts using the copy button on each card
- Use "Copy All" to get all prompts at once for batch processing
- Try different AI image generation tools to see which gives the best results for your specific prompts

## Translation Feature

The Translation feature enables you to translate your video scripts into eight different languages, expanding your potential audience reach globally.

### Supported Languages

- Turkish
- Russian
- Chinese
- French
- Italian
- Spanish
- Hindi
- Japanese

### How It Works

1. **Generate a script** using the main form
2. **Access translations** by clicking the "Translate Script" button or navigating to the Translations page
3. **Select a language tab** from the available options
4. **Click "Translate"** for your desired language
5. **Download or copy** the translated script in text format

### Translation Features

- **Tab-based interface** for easy navigation between languages
- **Real-time translation** using Google's Gemini API
- **Download option** to save translations as text files
- **Copy functionality** to easily paste translations into other applications
- **Formatted output** that maintains the original script structure (intro, segments, outro)

### Usage Tips

- Translations maintain the same formatting as the original script
- For best results, review machine translations for any context-specific issues
- Downloaded translations include metadata like title, categories, and description
- Use translated scripts for creating international versions of your videos or for subtitles
