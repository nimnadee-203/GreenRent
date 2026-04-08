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
            console.log("❌ No models found");
            console.log(JSON.stringify(data, null, 2));
            return;
        }

        console.log("🔥 Available Gemini Models:\n");

        data.models.forEach((model) => {
            console.log("Model:", model.name);
            console.log("Supported Methods:", model.supportedGenerationMethods);
            console.log("----------------------------------");
        });

    } catch (error) {
        console.error("❌ Error:", error);
    }
};

listModels();