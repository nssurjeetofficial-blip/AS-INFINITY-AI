import { API_URL } from "./config.js";

export async function sendToAI(
    message,
    history = [],
    memories = [],
    category = "friend"
) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                history,
                memories,
                category
            })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        const reply =
            data.response ||
            data.reply ||
            data.result?.choices?.[0]?.message?.content ||
            data.choices?.[0]?.message?.content;

        if (!reply) {
            throw new Error("AI reply not found");
        }

        return reply;

    } catch (error) {
        console.error("AI Chat Error:", error);
        throw error;
    }
}
