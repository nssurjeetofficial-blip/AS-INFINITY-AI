// AS INFINITY AI - Real AI Connection

document.addEventListener("DOMContentLoaded", () => {

const API_URL = "https://as-infinity-ai.nssurjeetofficial.workers.dev";

const main = document.querySelector(".main");
const navLinks = document.querySelectorAll("nav a");

let chatHistory = [];

function notify(message) {
    document.querySelector(".toast")?.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Chat styles
const chatStyles = document.createElement("style");

chatStyles.textContent = `
.ai-chat-page {
    max-width: 900px;
    margin: 25px auto;
    min-height: 65vh;
    display: flex;
    flex-direction: column;
}

.chat-heading {
    text-align: center;
    padding: 25px 10px;
}

.chat-heading h2 {
    font-size: 28px;
    color: #ff3d9a;
}

.chat-heading p {
    color: #a49ba1;
    font-size: 13px;
    margin-top: 8px;
}

.chat-messages {
    flex: 1;
    min-height: 300px;
    padding: 15px 5px;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.chat-message {
    max-width: 82%;
    padding: 14px 17px;
    border-radius: 15px;
    font-size: 14px;
    line-height: 1.7;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
}

.user-message {
    align-self: flex-end;
    background: #38152a;
    border: 1px solid #ff3d9a;
}

.ai-message {
    align-self: flex-start;
    background: #171215;
    border: 1px solid #38232f;
}

.chat-label {
    display: block;
    font-size: 10px;
    color: #ff75bd;
    margin-bottom: 6px;
}

.chat-composer {
    display: flex;
    gap: 8px;
    padding: 10px;
    background: #141112;
    border: 1px solid #7d2855;
    border-radius: 14px;
    position: sticky;
    bottom: 78px;
}

.chat-composer input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: white;
    padding: 12px;
    font-size: 14px;
}

.chat-composer button {
    width: 45px;
    border: none;
    border-radius: 10px;
    background: #ff3d9a;
    color: white;
    font-size: 19px;
}

.chat-composer button:disabled {
    opacity: .5;
}

.typing {
    color: #ff75bd;
    font-size: 12px;
    padding: 10px;
}

.back-home {
    background: #21101a;
    color: #ff75bd;
    border: 1px solid #402033;
    padding: 10px 16px;
    border-radius: 9px;
    margin-bottom: 15px;
}

@media(max-width:600px) {
    .ai-chat-page {
        margin: 10px auto;
        min-height: 70vh;
    }

    .chat-heading h2 {
        font-size: 23px;
    }

    .chat-message {
        max-width: 92%;
        font-size: 13px;
    }

    .chat-composer {
        bottom: 75px;
    }
}
`;

document.head.appendChild(chatStyles);

const homeContent = main.innerHTML;

// Add message
function addMessage(message, sender) {
    const messages = document.querySelector("#chatMessages");
    if (!messages) return;

    const bubble = document.createElement("div");

    bubble.className = "chat-message " +
        (sender === "user" ? "user-message" : "ai-message");

    const label = document.createElement("span");
    label.className = "chat-label";
    label.textContent =
        sender === "user" ? "YOU" : "AS INFINITY AI";

    const content = document.createElement("div");
    content.textContent = message;

    bubble.appendChild(label);
    bubble.appendChild(content);

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
}

// Open chat
function openChat() {
    main.innerHTML = `
        <section class="ai-chat-page">

            <button class="back-home">← Back to Home</button>

            <div class="chat-heading">
                <div style="font-size:45px;color:#ff3d9a;">∞</div>
                <h2>AS INFINITY AI</h2>
                <p>Your space to think, learn and create.</p>
            </div>

            <div class="chat-messages" id="chatMessages">
                <div class="chat-message ai-message">
                    <span class="chat-label">AS INFINITY AI</span>
                    Hello! Welcome to AS INFINITY AI.
                    How can I help you today?
                </div>
            </div>

            <div class="chat-composer">
                <input
                    id="aiMessageInput"
                    type="text"
                    maxlength="4000"
                    placeholder="Message AS INFINITY AI..."
                >
                <button id="aiSendButton">➤</button>
            </div>

        </section>
    `;

    document.querySelector(".back-home")
        .addEventListener("click", showHome);

    const input = document.querySelector("#aiMessageInput");
    const button = document.querySelector("#aiSendButton");

    async function sendChat() {
        const message = input.value.trim();

        if (!message || button.disabled) return;

        addMessage(message, "user");

        input.value = "";
        button.disabled = true;

        const messages = document.querySelector("#chatMessages");

        const typing = document.createElement("div");
        typing.className = "typing";
        typing.textContent = "AS INFINITY AI is thinking...";
        messages.appendChild(typing);

        messages.scrollTop = messages.scrollHeight;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory.slice(-10)
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.reply) {
                throw new Error(data.error || "AI request failed");
            }

            chatHistory.push(
                { role: "user", content: message },
                { role: "assistant", content: data.reply }
            );

            addMessage(data.reply, "ai");

        } catch (error) {
            console.error("AI Error:", error);

            addMessage(
                "Sorry! AI connection failed. Please try again.",
                "ai"
            );

        } finally {
            typing.remove();
            button.disabled = false;
            input.focus();
        }
    }

    button.addEventListener("click", sendChat);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") sendChat();
    });

    input.focus();
}

// Homepage
function showHome() {
    main.innerHTML = homeContent;
    window.scrollTo({ top: 0, behavior: "smooth" });
    attachHomeEvents();
}

// Homepage events
function attachHomeEvents() {
    const input = document.querySelector(".chat-box input");
    const button = document.querySelector(".chat-box button");

    if (input && button) {
        button.addEventListener("click", () => {
            const message = input.value.trim();

            if (!message) {
                notify("Please enter your message.");
                return;
            }

            openChat();

            const chatInput =
                document.querySelector("#aiMessageInput");

            chatInput.value = message;
            document.querySelector("#aiSendButton").click();
        });

        input.addEventListener("keydown", event => {
            if (event.key === "Enter") button.click();
        });
    }

    document.querySelectorAll(".feature-card").forEach(card => {
        card.addEventListener("click", () => {
            const title =
                card.querySelector("h3")?.textContent;

            if (title === "AI Chat") {
                openChat();
            } else {
                notify(title + " module is under development.");
            }
        });
    });
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        navLinks.forEach(item =>
            item.classList.remove("active")
        );

        link.classList.add("active");

        const name = link.querySelector("span")?.textContent;

        if (name === "Home") {
            showHome();
        } else if (name === "AI Chat") {
            openChat();
        } else {
            notify(name + " module is under development.");
        }
    });
});

attachHomeEvents();

});i
