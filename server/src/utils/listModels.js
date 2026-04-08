import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

const listModels = async () => {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        const data = await res.json();
        
        if (!data.models) {
            console.log("❌ No models found. Response:", JSON.stringify(data, null, 2));
            return;
        }

        console.log("🔥 Available Models:\n");

        data.models.forEach((model) => {
            console.log(model.name);
        });

    } catch (error) {
        console.error("❌ Error:", error);
    }
};

listModels();