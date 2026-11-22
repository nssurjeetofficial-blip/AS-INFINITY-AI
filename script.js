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
            return Array.isArray(data) ? data.filter(x => typeof x === "string") : [];
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
                openChat();
                closeMobileSidebar();
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

                    <button data-remove-memory="${index}">
                        Delete
                    </button>
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

            if (!confirm("Do you want AS INFINITY AI to save this memory?")) {
                return;
            }

            memories.push(value);
            saveMemories();

            input.value = "";
            renderMemoryList();

            alert("Memory saved successfully! ♡");

        });

        renderMemoryList();
    }

    // OPEN CHAT
    function openChat() {

        if (!main) return;

        const chat = getActiveChat();

        if (!chat) {
            showHome();
            return;
        }

        main.innerHTML = `

            <section class="ai-chat-page">

                <header class="chat-topbar">

                    <button class="chat-home-button" id="backHomeBtn">⌂</button>

                    <div class="chat-brand">
                        <span class="brand-infinity">∞</span>
                        <span>AS INFINITY AI</span>
                        <span class="brand-dot"></span>
                    </div>

                    <div class="chat-actions">
                        <button class="memory-open-button" id="memoryOpenBtn">♡</button>
                        <button class="chat-new-button" id="chatMenuBtn">+</button>
                    </div>

                </header>

                <div class="chat-messages" id="chatMessages"></div>

                <div class="chat-composer-area">

                    <div class="chat-composer">

                        <textarea
                            id="aiMessageInput"
                            placeholder="Message AS INFINITY AI..."
                            rows="1"
                        ></textarea>

                        <button id="aiSendButton">↑</button>

                    </div>

                    <div class="chat-disclaimer">
                        AS INFINITY AI can make mistakes.
                        Verify important information.
                    </div>

                </div>

            </section>
        `;

        document.querySelector("#backHomeBtn").onclick = showHome;
        document.querySelector("#chatMenuBtn").onclick = createChat;
        document.querySelector("#memoryOpenBtn").onclick = showMemoryManager;

        const input = document.querySelector("#aiMessageInput");
        const button = document.querySelector("#aiSendButton");

        renderMessages();
        renderSidebarHistory();

        // SEND MESSAGE
        async function sendChat() {

            const message = input.value.trim();

            if (!message || button.disabled) return;

            const currentChat = getActiveChat();
            if (!currentChat) return;

            currentChat.messages.push({
                role: "user",
                content: message
            });

            currentChat.updated = Date.now();

            if (
                currentChat.title === "New Chat" &&
                currentChat.messages.length === 1
            ) {
                currentChat.title =
                    message.length > 28
                        ? message.substring(0, 28) + "..."
                        : message;
            }

            input.value = "";
            input.style.height = "auto";

            saveChats();
            renderMessages();
            renderSidebarHistory();

            button.disabled = true;

            const messagesBox = document.querySelector("#chatMessages");

            const typing = document.createElement("div");
            typing.className = "ai-message";

            typing.innerHTML = `
                <div class="message-avatar">∞</div>
                <div class="message-content">
                    <span class="typing-indicator">
                        <span></span><span></span><span></span>
                    </span>
                </div>
            `;

            messagesBox.appendChild(typing);
            messagesBox.scrollTop = messagesBox.scrollHeight;

            try {

                // Current message is already pushed.
                // Worker adds it separately, so send previous messages only.
                const history = currentChat.messages
                    .slice(0, -1)
                    .slice(-10);

                const response = await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        message: message,
                        history: history,
                        memories: memories
                    })

                });

                if (!response.ok) {
                    throw new Error("Server error: " + response.status);
                }

                const result = await response.json();

                const reply =
                    result.reply ||
                    result.choices?.[0]?.message?.content ||
                    result.response ||
                    result.message ||
                    "";

                if (!reply) {
                    throw new Error("Empty AI response");
                }

                currentChat.messages.push({
                    role: "assistant",
                    content: reply
                });

                currentChat.updated = Date.now();

                saveChats();
                renderMessages();
                renderSidebarHistory();

            } catch (error) {

                console.error("AI Error:", error);

                typing.innerHTML = `
                    <div class="message-avatar">∞</div>
                    <div class="message-content">
                        Sorry, connection problem.
                        Please try again.
                    </div>
                `;

            } finally {

                if (typing.isConnected) typing.remove();

                button.disabled = false;

            }
        }

        button.addEventListener("click", sendChat);

        input.addEventListener("keydown", event => {

            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendChat();
            }

        });

        input.addEventListener("input", () => {

            input.style.height = "auto";
            input.style.height =
                Math.min(input.scrollHeight, 130) + "px";

        });
    }

    // RENDER MESSAGES
    function renderMessages() {

        const box = document.querySelector("#chatMessages");
        const chat = getActiveChat();

        if (!box || !chat) return;

        if (!chat.messages || !chat.messages.length) {
            box.innerHTML = "";
            return;
        }

        box.innerHTML = chat.messages.map(message => {

            const isUser = message.role === "user";

            return `
                <div class="message-row ${isUser ? "user-row" : "assistant-row"}">

                    ${isUser ? "" : `<div class="message-avatar">∞</div>`}

                    <div class="message-content">
                        ${escapeHTML(message.content).replace(/\n/g, "<br>")}
                    </div>

                </div>
            `;

        }).join("");

        box.scrollTop = box.scrollHeight;
    }

    // HOME PAGE
    function showHome() {

        if (!main) return;

        activeChatId = null;
        main.innerHTML = homeContent;

        attachHomeEvents();
        renderSidebarHistory();
        closeMobileSidebar();
    }

    // HOME EVENTS
    function attachHomeEvents() {

        const chatInput = document.querySelector(".chat-box input");
        const chatButton = document.querySelector(".chat-box button");

        if (chatInput && chatButton) {

            chatButton.addEventListener("click", () => {

                const message = chatInput.value.trim();
                if (!message) return;

                createChat();

                setTimeout(() => {

                    const input = document.querySelector("#aiMessageInput");
                    const button = document.querySelector("#aiSendButton");

                    if (input && button) {
                        input.value = message;
                        button.click();
                    }

                }, 100);

            });

            chatInput.addEventListener("keydown", event => {

                if (event.key === "Enter") {
                    event.preventDefault();
                    chatButton.click();
                }

            });
        }

        document.querySelectorAll(".feature-card").forEach(card => {

            card.addEventListener("click", () => {

                const title = card.querySelector("h3")?.textContent || "Feature";

                alert(title + " is coming soon to AS INFINITY AI.");

            });

        });

        document.querySelectorAll("nav a").forEach(link => {

            link.addEventListener("click", event => {

                const text = link.textContent.trim().toLowerCase();

                if (text.includes("new chat") || text.includes("chat")) {
                    event.preventDefault();
                    createChat();
                }

            });

        });
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

    if (sidebarToggle && sidebar) {

        sidebarToggle.addEventListener("click", () => {

            sidebar.classList.toggle("mobile-open");
            updateSidebarButton();

        });
    }

    // SIDEBAR NEW CHAT
    if (sidebarNewChat) {

        sidebarNewChat.addEventListener("click", event => {

            event.preventDefault();
            createChat();
            closeMobileSidebar();

        });
    }

    // RESPONSIVE CSS
    const responsiveStyle = document.createElement("style");

    responsiveStyle.textContent = `

        .ai-chat-page {
            width:100%;
            height:100%;
            min-height:0;
            display:flex;
            flex-direction:column;
            overflow:hidden;
            background:#08080d;
            color:white;
        }

        .chat-topbar {
            height:62px;
            min-height:62px;
            display:flex;
            align-items:center;
            justify-content:space-between;
            padding:0 18px;
            border-bottom:1px solid rgba(255,255,255,.08);
            position:relative;
        }

        .chat-home-button,
        .chat-new-button,
        .memory-open-button {
            width:38px;
            height:38px;
            border:1px solid rgba(255,255,255,.12);
            border-radius:12px;
            background:#15121b;
            color:#ff70b8;
            font-size:22px;
            cursor:pointer;
        }

        .chat-actions {
            display:flex;
            gap:8px;
            align-items:center;
        }

        .chat-brand {
            position:absolute;
            left:50%;
            transform:translateX(-50%);
            display:flex;
            align-items:center;
            gap:7px;
            white-space:nowrap;
            font-size:14px;
            font-weight:800;
            letter-spacing:1px;
        }

        .brand-infinity {
            color:#ff70b8;
            font-size:25px;
        }

        .brand-dot {
            width:7px;
            height:7px;
            border-radius:50%;
            background:#ff70b8;
        }

        .chat-messages {
            flex:1;
            min-height:0;
            overflow-y:auto;
            padding:22px 16px;
            display:flex;
            flex-direction:column;
            gap:20px;
            overscroll-behavior:contain;
        }

        .message-row {
            display:flex;
            align-items:flex-start;
            gap:10px;
            max-width:850px;
            width:100%;
            margin:0 auto;
        }

        .user-row {
            justify-content:flex-end;
        }

        .assistant-row .message-content {
            background:#17141d;
            color:#f5f1f7;
            border:1px solid rgba(255,255,255,.06);
            border-bottom-left-radius:4px;
        }

        .chat-composer-area {
            flex-shrink:0;
            padding:12px 15px 10px;
            background:#08080d;
            border-top:1px solid rgba(255,255,255,.06);
        }

        .chat-composer {
            max-width:850px;
            margin:0 auto;
            display:flex;
            align-items:flex-end;
            gap:10px;
            padding:10px 12px;
            background:#17141d;
            border:1px solid rgba(255,112,184,.25);
            border-radius:17px;
        }

        .chat-composer textarea {
            flex:1;
            min-width:0;
            max-height:130px;
            resize:none;
            border:none;
            outline:none;
            background:transparent;
            color:white;
            font:inherit;
            font-size:15px;
            padding:7px 3px;
        }

        .chat-composer textarea::placeholder {
            color:#8d8493;
        }

        .chat-composer button {
            width:38px;
            height:38px;
            min-width:38px;
            border:none;
            border-radius:12px;
            background:#ff70b8;
            color:#190b13;
            font-size:23px;
            font-weight:bold;
            cursor:pointer;
        }

        .chat-composer button:disabled {
            opacity:.5;
            cursor:not-allowed;
        }

        .chat-disclaimer {
            padding-top:8px;
            text-align:center;
            color:#77717e;
            font-size:10px;
        }

        .typing-indicator {
            display:flex;
            gap:5px;
            padding:5px 0;
        }

        .typing-indicator span {
            width:7px;
            height:7px;
            border-radius:50%;
            background:#ff70b8;
            animation:aiTyping 1s infinite alternate;
        }

        .typing-indicator span:nth-child(2) {
            animation-delay:.2s;
        }

        .typing-indicator span:nth-child(3) {
            animation-delay:.4s;
        }

        @keyframes aiTyping {
            from {opacity:.3;transform:translateY(0);}
            to {opacity:1;transform:translateY(-4px);}
        }

        .history-item {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:5px;
            margin:4px 7px;
            border-radius:9px;
        }

        .history-item.active {
            background:rgba(255,112,184,.12);
        }

        .history-chat-button {
            flex:1;
            min-width:0;
            display:flex;
            align-items:center;
            gap:8px;
            padding:10px;
            border:none;
            background:transparent;
            color:#eee;
            text-align:left;
            cursor:pointer;
        }

        .history-title {
            overflow:hidden;
            white-space:nowrap;
            text-overflow:ellipsis;
            font-size:13px;
        }

        .history-delete {
            border:none;
            background:transparent;
            color:#aaa;
            padding:8px;
            cursor:pointer;
            font-size:19px;
        }

        .history-empty {
            padding:12px;
            color:#8d8493;
            font-size:12px;
        }

        /* MEMORY MANAGER */

        #memoryModal {
            position:fixed;
            inset:0;
            z-index:99999;
            background:rgba(0,0,0,.78);
            display:flex;
            justify-content:center;
            align-items:center;
            padding:15px;
        }

        .memory-panel {
            width:100%;
            max-width:440px;
            max-height:85vh;
            overflow-y:auto;
            background:#15121b;
            border:1px solid rgba(255,112,184,.35);
            border-radius:20px;
            padding:20px;
            color:white;
            box-shadow:0 0 35px rgba(255,112,184,.12);
        }

        .memory-heading {
            display:flex;
            justify-content:space-between;
            align-items:center;
        }

        .memory-heading h2 {
            margin:0;
            color:#ff70b8;
            font-size:20px;
        }

        .memory-heading p,
        .memory-note {
            color:#999;
            font-size:12px;
        }

        #closeMemoryModal {
            background:transparent;
            border:none;
            color:white;
            font-size:27px;
            cursor:pointer;
        }

        .memory-info {
            background:rgba(255,112,184,.10);
            padding:12px;
            border-radius:12px;
            font-size:12px;
            line-height:1.5;
            margin:15px 0;
            color:#f5d9e8;
        }

        .memory-item {
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:10px;
            background:#211b29;
            border:1px solid rgba(255,255,255,.06);
            border-radius:11px;
            padding:11px;
            margin-bottom:9px;
            font-size:13px;
            overflow-wrap:anywhere;
        }

        .memory-item button {
            background:rgba(255,112,184,.13);
            color:#ff70b8;
            border:0;
            border-radius:8px;
            padding:7px 9px;
            cursor:pointer;
            flex-shrink:0;
        }

        .memory-empty {
            text-align:center;
            color:#999;
            padding:20px 5px;
            font-size:13px;
        }

        .memory-add-area {
            margin-top:15px;
        }

        .memory-add-area textarea {
            width:100%;
            min-height:85px;
            resize:vertical;
            box-sizing:border-box;
            background:#0d0b12;
            border:1px solid rgba(255,112,184,.3);
            border-radius:11px;
            padding:12px;
            color:white;
            outline:none;
            font:inherit;
            font-size:13px;
        }

        #saveMemoryBtn {
            width:100%;
            margin-top:10px;
            padding:12px;
            background:#ff70b8;
            color:#190b13;
            border:0;
            border-radius:11px;
            font-weight:bold;
            cursor:pointer;
        }

        .memory-note {
            text-align:center;
            margin-bottom:0;
        }

        @media(max-width:650px) {

            .ai-chat-page {
                height:100%;
                height:100dvh;
            }

            .chat-topbar {
                height:56px;
                min-height:56px;
                padding:0 12px;
            }

            .chat-messages {
                padding:16px 11px;
            }

            .message-content {
                max-width:88%;
                font-size:14px;
            }

            .chat-composer-area {
                padding:9px 10px 8px;
            }

        }

    `;

    document.head.appendChild(responsiveStyle);

    // INITIALIZE
    renderSidebarHistory();
    attachHomeEvents();
    updateSidebarButton();

});

