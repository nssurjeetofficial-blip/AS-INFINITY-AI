// AS INFINITY AI - Cloudflare Worker Backend

const SYSTEM_PROMPT = `
You are AS INFINITY AI.
Your tagline is Intelligence Without Limits.

Personality:
- Friendly, respectful and professional.
- Never shame, insult or intentionally hurt users.
- Explain things clearly and simply.
- Be age-appropriate and safety-conscious.
- Never pretend to know something you do not know.
`;

export default {
    async fetch(request, env) {

        const headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers });
        }

        if (request.method !== "POST") {
            return Response.json(
                { error: "Method not allowed" },
                { status: 405, headers }
            );
        }

        try {

            const body = await request.json();

            const message = body.message;
            const history = Array.isArray(body.history)
                ? body.history.slice(-10)
                : [];

            if (
                typeof message !== "string" ||
                !message.trim() ||
                message.length > 4000
            ) {
                return Response.json(
                    { error: "Invalid message." },
                    { status: 400, headers }
                );
            }

            // Provider configuration will be added later.
            if (!env.AI_API_URL || !env.AI_API_KEY || !env.AI_MODEL) {
                return Response.json({
                    success: false,
                    configured: false,
                    reply: "AS INFINITY AI is being prepared. AI connection will be activated soon."
                }, { headers });
            }

            const messages = [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                ...history
                    .filter(item =>
                        ["user", "assistant"].includes(item.role) &&
                        typeof item.content === "string"
                    )
                    .map(item => ({
                        role: item.role,
                        content: item.content.slice(0, 4000)
                    })),
                {
                    role: "user",
                    content: message.trim()
                }
            ];

            const response = await fetch(env.AI_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${env.AI_API_KEY}`
                },
                body: JSON.stringify({
                    model: env.AI_MODEL,
                    messages: messages
                })
            });

            if (!response.ok) {
                return Response.json(
                    { error: "AI provider request failed." },
                    { status: 502, headers }
                );
            }

            const data = await response.json();

            const reply =
                data.choices?.[0]?.message?.content;

            if (!reply) {
                return Response.json(
                    { error: "Invalid AI response." },
                    { status: 502, headers }
                );
            }

            return Response.json({
                success: true,
                configured: true,
                reply
            }, { headers });

        } catch (error) {

            return Response.json(
                { error: "Something went wrong. Please try again." },
                { status: 500, headers }
            );

        }
    }
};
