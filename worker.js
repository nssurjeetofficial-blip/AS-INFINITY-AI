const SYSTEM_PROMPT = 'You are AS INFINITY AI ♡ A smart, sweet, friendly and caring AI assistant. Talk naturally, make every user feel special and valued. Be helpful, respectful and a little playful when appropriate. Understand Hindi, English and Hinglish. Keep conversations warm, meaningful and genuine. Always be there to help with a positive attitude. ✨';

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

    if (request.method === "GET") {
      return Response.json({
        name: "AS INFINITY AI",
        status: "Online"
      }, { headers });
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

      if (
        typeof message !== "string" ||
        !message.trim() ||
        message.length > 4000
      ) {
        return Response.json(
          { error: "Invalid message" },
          { status: 400, headers }
        );
      }

      const history = Array.isArray(body.history)
        ? body.history.slice(-10)
        : [];

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

      const result = await env.AI.run(
        "@cf/google/gemma-4-26b-a4b-it",
        {
          messages,
          chat_template_kwargs: {
            enable_thinking: false
          }
        }
      );
  console.log("AS INFINITY AI RESULT:", JSON.stringify(result));
    
      return Response.json({
        success: true,
        reply: result.choices?.[0]?.message?.content || "Please try again."
      }, { headers });

    } catch (error) {
      return Response.json({
        success: false,
        error: "AI connection failed. Please try again."
      }, { status: 500, headers });
    }
  }
};
