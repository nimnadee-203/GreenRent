import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
    console.log("Testing Gemini with model: gemini-2.5-flash...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (error) {
        console.error("Error with 2.5-flash:", error.message);
        
        console.log("\nTesting Gemini with model: gemini-1.5-flash...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Hello, are you working?");
            const response = await result.response;
            console.log("Response:", response.text());
        } catch (err2) {
            console.error("Error with 1.5-flash:", err2.message);
        }
    }
}

testGemini();
