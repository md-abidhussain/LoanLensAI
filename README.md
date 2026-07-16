# LoanLens AI

LoanLens AI is a hackathon MVP designed to help people understand their loan agreements and identify predatory lending terms. 

## What It Does
- Accepts loan agreements uploaded in PDF, JPG, or PNG formats.
- Extracts text using pdf-parse for PDFs, or sends images directly to Google Gemini for analysis.
- Connects to Google Gemini 2.5 Flash to automatically audit loan terms.
- Displays key details: a plain-language summary, stated rate, estimated effective APR, risk rating, and a list of red flag clauses.
- Saves every scan to an SQLite database.
- Provides a history view to review past analysis results.

## Environment Variables
Create a .env file in the root directory with the following variables:
PORT=3000
DATABASE_PATH=database.db
GEMINI_API_KEY=your_gemini_api_key_here

## How to Run Locally
1. Install backend dependencies:
   npm install
2. Start the application:
   npm start
3. Open your browser and navigate to http://localhost:3000.

## How AI is Used
I used Google Gemini 2.5 Flash to do the heavy lifting of reading and interpreting the loan documents. When someone uploads a PDF, the backend extracts the text first and passes it to Gemini along with a specific prompt asking for structural terms. For images, I take advantage of Gemini's multimodal capabilities and send the image file directly as raw bytes, letting Gemini perform the text extraction and interpretation in one step. I asked Gemini to strictly return its analysis as a JSON object that matches our exact schema, which makes it easy to parse the results, display them in the frontend, and save them directly to SQLite.
