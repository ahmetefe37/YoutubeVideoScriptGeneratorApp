# VideoScriptAI - YouTube Script Generator

VideoScriptAI is an AI-powered tool designed to help content creators generate engaging, well-structured video scripts for YouTube. Utilizing Google's Gemini API, this application creates professional scripts following proven storytelling principles.

## Features

- Generate complete video scripts based on your topic or subject
- Automatically categorizes your content (History, Mysteries, Culture, etc.)
- Creates YouTube-optimized titles and descriptions
- Structured scripts with intro hook, background setup, story segments, and conclusion
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
4. Use the script for your YouTube video creation

## Project Structure

```
VideoScriptGenerator/
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs
│   ├── script.ejs
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

## Acknowledgments

- Google Gemini API for powerful text generation
- Bootstrap for responsive UI components
