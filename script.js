// ==========================================
// AS INFINITY AI
// Intelligence Without Limits.
// Complete Frontend Script
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // CONFIGURATION
    const API_URL = "https://as-infinity-ai.nssurjeetofficial.workers.dev";

    const STORAGE_KEY = "as_infinity_ai_chats";
    const MEMORY_KEY = "as_infinity_ai_memories";

    // ELEMENTS
    const app = document.querySelector(".app");
    const sidebar = document.querySelector(".sidebar");
    const main = document.querySelector(".main");

    const sidebarToggle = document.querySelector("#sidebarToggle");
    const sidebarNewChat = document.querySelector("#sidebarNewChat");

    const homeContent = main ? main.innerHTML : "";

    // STORAGE
    function loadChats() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function saveChats() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }

    function loadMemories() {
        try {
            const data = JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
            return Array.isArray(data)
                ? data.filter(item => typeof item === "string")
                : [];
        } catch {
            return [];
        }
    }

    function saveMemories() {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(memories));
    }

    // STATE
    let chats = loadChats();
    let memories = loadMemories();
    let activeChatId = null;

    // HELPERS
    function createId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function getActiveChat() {
        return chats.find(chat => chat.id === activeChatId);
    }

    // MOBILE SIDEBAR
    function closeMobileSidebar() {
        if (!sidebar) return;

        sidebar.classList.remove("mobile-open");
        updateSidebarButton();
    }

    function updateSidebarButton() {
        if (!sidebarToggle || !sidebar) return;

        sidebarToggle.textContent =
            sidebar.classList.contains("mobile-open") ? "✕" : "☰";
    }

    // CREATE CHAT
    function createChat() {
        const chat = {
            id: createId(),
            title: "New Chat",
            messages: [],
            updated: Date.now()
        };

        chats.unshift(chat);
        activeChatId = chat.id;

        saveChats();
        renderSidebarHistory();
        openChat();

        return chat;
    }

    // SIDEBAR HISTORY
    function renderSidebarHistory() {
        const history =
            document.querySelector("#sidebarChatHistory") ||
            document.querySelector("#chatHistory");

        if (!history) return;

        if (!chats.length) {
            history.innerHTML = `<div class="history-empty">No conversations yet</div>`;
            return;
        }

        history.innerHTML = chats.map(chat => `
            <div class="history-item ${chat.id === activeChatId ? "active" : ""}">
                <button class="history-chat-button" data-open-chat="${escapeHTML(chat.id)}">
                    <span>💬</span>
                    <span class="history-title">${escapeHTML(chat.title)}</span>
                </button>

                <button class="history-delete"
                    data-delete-chat="${escapeHTML(chat.id)}">×</button>
            </div>
        `).join("");

        history.querySelectorAll("[data-open-chat]").forEach(button => {
            button.addEventListener("click", () => {
                activeChatId = button.dataset.openChat;
                closeMobileSidebar();
                openChat();
            });
        });

        history.querySelectorAll("[data-delete-chat]").forEach(button => {
            button.addEventListener("click", event => {
                event.stopPropagation();

                const id = button.dataset.deleteChat;

                if (!confirm("Delete this conversation?")) return;

                chats = chats.filter(chat => chat.id !== id);

                if (activeChatId === id) {
                    activeChatId = null;
                    showHome();
                }

                saveChats();
                renderSidebarHistory();
            });
        });
    }

    // MEMORY MANAGER
    function showMemoryManager() {
        const oldModal = document.querySelector("#memoryModal");
        if (oldModal) oldModal.remove();

        const modal = document.createElement("div");
        modal.id = "memoryModal";

        modal.innerHTML = `
            <div class="memory-panel">
                <div class="memory-heading">
                    <div>
                        <h2>♡ Memory Manager</h2>
                        <p>Your memories, your control.</p>
                    </div>
                    <button id="closeMemoryModal">×</button>
                </div>

                <div class="memory-info">
                    AS INFINITY AI will only save information
                    that you choose to add here.
                </div>

                <div id="memoryList"></div>

                <div class="memory-add-area">
                    <textarea
                        id="memoryInput"
                        maxlength="500"
                        placeholder="Write something you want AI to remember..."
                    ></textarea>
                    <button id="saveMemoryBtn">＋ Save Memory</button>
                </div>

                <p class="memory-note">
                    Memories are stored in this browser only.
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        const list = modal.querySelector("#memoryList");
        const input = modal.querySelector("#memoryInput");

        function renderMemoryList() {
            if (!memories.length) {
                list.innerHTML = `
                    <div class="memory-empty">
                        No saved memories yet.
                    </div>
                `;
                return;
            }

            list.innerHTML = memories.map((memory, index) => `
                <div class="memory-item">
                    <span>${escapeHTML(memory)}</span>
                    <button data-remove-memory="${index}">Delete</button>
                </div>
            `).join("");

            list.querySelectorAll("[data-remove-memory]").forEach(button => {
                button.addEventListener("click", () => {
                    const index = Number(button.dataset.removeMemory);

                    if (!confirm("Delete this saved memory?")) return;

                    memories.splice(index, 1);
                    saveMemories();
                    renderMemoryList();
                });
            });
        }

        modal.querySelector("#closeMemoryModal").onclick = () => modal.remove();

        modal.addEventListener("click", event => {
            if (event.target === modal) modal.remove();
        });

        modal.querySelector("#saveMemoryBtn").addEventListener("click", () => {
            const value = input.value.trim();

            if (!value) {
                alert("Please enter a memory first.");
                return;
            }

            if (memories.length >= 12) {
                alert("Memory limit reached. Delete an old memory first.");
                return;
            }

            if (!confirm("Do you want AS INFINITY AI to save this memory?")) return;

                              memories.push(value);
            saveMemories();

            input.value = "";
            renderMemoryList();
        });

        renderMemoryList();
    }

    // NICKNAME MEMORY
    function saveNickname(type) {
        const isUser = type === "user";

        const nickname = prompt(
            isUser
                ? "What nickname should I remember for you?"
                : "What should I call AS INFINITY AI?"
        );

        if (nickname === null) return;

        const value = nickname.trim();

        if (!value) {
            alert("Please enter a nickname.");
            return;
        }

        const prefix = isUser ? "User nickname: " : "AI nickname: ";

        // Replace previous nickname of the same type
        memories = memories.filter(memory =>
            !memory.startsWith(prefix)
        );

        memories.push(prefix + value);
        saveMemories();

        alert("♡ Nickname saved successfully!");
    }

    // FORMAT AI RESPONSE
    function formatMessage(text) {
        let safe = escapeHTML(text);

        safe = safe.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );

        safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");
        safe = safe.replace(/\n/g, "<br>");

        return safe;
    }

    // MESSAGE HTML
    function createMessageHTML(message, index) {
        const isUser = message.role === "user";

        return `
            <div class="message ${isUser ? "user-message" : "ai-message"}">
                <div class="message-avatar">
                    ${isUser ? "👤" : "✦"}
                </div>

                <div class="message-content">
                    <div class="message-role">
                        ${isUser ? "You" : "AS INFINITY AI"}
                    </div>

                    <div class="message-text">
                        ${isUser
                            ? escapeHTML(message.content).replace(/\n/g, "<br>")
                            : formatMessage(message.content)}
                    </div>

                    ${!isUser ? `
                        <div class="nickname-actions">
                            <button class="save-user-nickname">
                                ♡ Save My Nickname
                            </button>

                            <button class="save-ai-nickname">
                                ♡ Save AI Nickname
                            </button>
                        </div>
                    ` : ""}
                </div>
            </div>
        `;
    }

    // RENDER MESSAGES
    function renderMessages() {
        const messageArea = document.querySelector("#messages");

        if (!messageArea) return;

        const chat = getActiveChat();

        if (!chat) {
            showHome();
            return;
        }

        messageArea.innerHTML = chat.messages
            .map((message, index) => createMessageHTML(message, index))
            .join("");

        messageArea.querySelectorAll(".save-user-nickname").forEach(button => {
            button.addEventListener("click", () => saveNickname("user"));
        });

        messageArea.querySelectorAll(".save-ai-nickname").forEach(button => {
            button.addEventListener("click", () => saveNickname("ai"));
        });

        messageArea.scrollTop = messageArea.scrollHeight;
    }

    // HOME SCREEN
    function showHome() {
        if (!main) return;

        activeChatId = null;

        main.innerHTML = homeContent;

        attachHomeEvents();
        renderSidebarHistory();
    }

    // HOME SCREEN EVENTS
    function attachHomeEvents() {
        const input =
            document.querySelector("#messageInput") ||
            document.querySelector("#promptInput");

        const sendButton =
            document.querySelector("#sendButton") ||
            document.querySelector("#sendBtn");

        const memoryButton =
            document.querySelector("#memoryButton") ||
            document.querySelector("#memoryBtn");

        const newChatButton =
            document.querySelector("#newChatButton") ||
            document.querySelector("#newChatBtn");

        if (memoryButton) {
            memoryButton.onclick = showMemoryManager;
        }

        if (newChatButton) {
            newChatButton.onclick = () => createChat();
        }

        if (sendButton && input) {
            sendButton.onclick = () => {
                sendMessage(input.value);
            };
        }

        if (input) {
            input.addEventListener("keydown", event => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage(input.value);
                }
            });
        }

        // Suggestion prompts
        document.querySelectorAll("[data-prompt]").forEach(button => {
            button.addEventListener("click", () => {
                const promptText = button.dataset.prompt;

                if (promptText) sendMessage(promptText);
            });
        });
    }

    // OPEN CHAT
    function openChat() {
        const chat = getActiveChat();

        if (!chat || !main) {
            showHome();
            return;
        }

        main.innerHTML = `
            <div class="chat-header">
                <button id="backHomeButton">←</button>
                <div class="chat-header-title">
                    <h3>AS INFINITY AI</h3>
                    <span>Intelligence Without Limits.</span>
                </div>
                <button id="chatMemoryButton">♡</button>
            </div>

            <div id="messages" class="messages-area"></div>

            <div class="chat-input-area">
                <textarea
                    id="messageInput"
                    placeholder="Message AS INFINITY AI..."
                    rows="1"
                ></textarea>

                <button id="sendButton">➤</button>
            </div>
        `;

        document.querySelector("#backHomeButton").onclick = showHome;

        document.querySelector("#chatMemoryButton").onclick =
            showMemoryManager;

        const input = document.querySelector("#messageInput");

        input.addEventListener("input", () => {
            input.style.height = "auto";
            input.style.height = Math.min(input.scrollHeight, 150) + "px";
        });

        attachHomeEvents();
        renderMessages();
        renderSidebarHistory();

        input.focus();
    }

                              // SEND MESSAGE
    async function sendMessage(text) {
        const message = String(text || "").trim();

        if (!message) return;

        let chat = getActiveChat();

        if (!chat) {
            chat = createChat();
        }

        chat.messages.push({
            role: "user",
            content: message
        });

        if (chat.messages.length === 1) {
            chat.title = message.length > 35
                ? message.slice(0, 35) + "..."
                : message;
        }

        chat.updated = Date.now();

        saveChats();
        openChat();

        const input = document.querySelector("#messageInput");
        if (input) input.value = "";

        chat.messages.push({
            role: "assistant",
            content: "Thinking..."
        });

        renderMessages();

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    history: chat.messages
                        .filter(item => item.content !== "Thinking...")
                        .slice(-20),
                    memories: memories
                })
            });

            if (!response.ok) {
                throw new Error("Server error: " + response.status);
            }

            const data = await response.json();

            const aiReply =
                data.response ||
                data.reply ||
                data.result ||
                data.message ||
                "Sorry, I couldn't generate a response.";

            chat.messages[chat.messages.length - 1] = {
                role: "assistant",
                content: aiReply
            };

            chat.updated = Date.now();

            saveChats();
            renderMessages();
            renderSidebarHistory();

        } catch (error) {
            console.error("AS INFINITY AI Error:", error);

            chat.messages[chat.messages.length - 1] = {
                role: "assistant",
                content: "I'm having trouble connecting right now. Please try again."
            };

            saveChats();
            renderMessages();
        }
    }

    // SIDEBAR TOGGLE
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            if (!sidebar) return;

            sidebar.classList.toggle("mobile-open");
            updateSidebarButton();
        });
    }

    // NEW CHAT BUTTON
    if (sidebarNewChat) {
        sidebarNewChat.addEventListener("click", () => {
            closeMobileSidebar();
            createChat();
        });
    }

    // TOPBAR MEMORY BUTTON
    document.querySelectorAll(
        "#memoryButton, #memoryBtn, [data-memory-manager]"
    ).forEach(button => {
        button.addEventListener("click", showMemoryManager);
    });

    // TOPBAR NEW CHAT BUTTON
    document.querySelectorAll(
        "#newChatButton, #newChatBtn, [data-new-chat]"
    ).forEach(button => {
        button.addEventListener("click", () => {
            createChat();
        });
    });

    // INITIALIZE
    function initializeApp() {
        renderSidebarHistory();

        if (chats.length > 0) {
            const latestChat = [...chats].sort(
                (a, b) => (b.updated || 0) - (a.updated || 0)
            )[0];

            activeChatId = latestChat.id;
            openChat();
        } else {
            showHome();
        }
    }

    initializeApp();
    // RESPONSIVE SIDEBAR
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }
    });

    // CLOSE SIDEBAR AFTER CHAT SELECTION
    document.addEventListener("click", event => {
        if (
            window.innerWidth <= 768 &&
            sidebar &&
            sidebar.classList.contains("mobile-open") &&
            !sidebar.contains(event.target) &&
            event.target !== sidebarToggle
        ) {
            closeMobileSidebar();
        }
    });

    // KEYBOARD SHORTCUT: NEW CHAT
    document.addEventListener("keydown", event => {
        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {
            event.preventDefault();
            createChat();
        }
    });

    // FINAL INITIALIZATION
    console.log("AS INFINITY AI initialized successfully.");
    console.log("Saved chats:", chats.length);
    console.log("Saved memories:", memories.length);

});

                          
