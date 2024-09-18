const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = 5000;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Use the cors middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get("/ping", async (req, res) => {
    return res.send("pong");
});

app.get("/getGeminiResponse", async (req, res) => {
    const text = req.query.query;
    console.log('Received text:', text);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Get response from Google Generative AI
        const result = await model.generateContent(text);
        const response = await result.response.text();
        console.log('Response:', response);
        // Extract code from the response
        const codeBlockRegex = /```(\w+)([\s\S]+?)```/; // Regex to match code blocks for any language
        const match = response.match(codeBlockRegex);

        // Check if there is a match
        if (match && match[2]) {
            // Extracted code
            const extractedCode = match[2].trim();
            // Send the extracted code
            res.json({ result: extractedCode });
        } else {
            // If no code is found, send the full response
            res.json({ result: response });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
// console.log('Starting server on port:', port);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});