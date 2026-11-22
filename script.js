// ========================================
// AS INFINITY AI
// COMPLETE CHAT SYSTEM
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "https://as-infinity-ai.nssurjeetofficial.workers.dev";
    const STORAGE_KEY = "as_infinity_ai_chats";

    const main = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");

    if (!main) return;

    let chats = [];
    let activeChatId = null;

    // ========================================
    // LOAD SAVED CHATS
    // ========================================

    try {
        chats = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (!Array.isArray(chats)) chats = [];
    } catch {
        chats = [];
    }

    function saveChats() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }

    function createChat() {

        const chat = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
            title: "New Conversation",
            messages: [],
            updated: Date.now()
        };

        chats.unshift(chat);
        activeChatId = chat.id;

        saveChats();
        renderSidebarHistory();

        return chat;
    }

    function getActiveChat() {
        return chats.find(chat => chat.id === activeChatId);
    }

    // ========================================
    // NOTIFICATION
    // ========================================

    function notify(message) {

        document.querySelector(".toast")?.remove();

        const toast = document.createElement("div");

        toast.className = "toast";
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    // ========================================
    // CHAT STYLES
    // ========================================

    const chatStyles = document.createElement("style");

    chatStyles.textContent = `

        .ai-chat-page {
            max-width: 1000px;
            margin: 15px auto;
            min-height: calc(100vh - 110px);
            display: flex;
            flex-direction: column;
            padding: 10px 20px;
        }

        .chat-topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .back-home,
        .chat-new-button {
            padding: 10px 15px;
            border-radius: 10px;
            cursor: pointer;
            border: 1px solid #493044;
            background: #1b111a;
            color: #ff83bd;
        }

        .chat-new-button {
            background: #ff3d9a;
            color: white;
            border: none;
        }

        .chat-heading {
            text-align: center;
            padding: 18px 10px;
        }

        .chat-heading h2 {
            color: #ff65ad;
            font-size: 27px;
        }

        .chat-heading p {
            color: #aaa;
            font-size: 13px;
            margin-top: 7px;
        }

        #chatMessages {
            flex: 1;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
            padding: 20px 5px;
            overflow-y: auto;
        }

        .chat-message {
            max-width: 80%;
            padding: 13px 17px;
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
            color: white;
        }

        .ai-message {
            align-self: flex-start;
            background: #171215;
            border: 1px solid #493044;
            color: white;
        }

        .chat-label {
            display: block;
            font-size: 10px;
            color: #ff83bd;
            margin-bottom: 6px;
        }

        .chat-composer {
            display: flex;
            gap: 10px;
            padding: 10px;
            background: #141112;
            border: 1px solid #7d2855;
            border-radius: 14px;
            position: sticky;
            bottom: 10px;
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
            cursor: pointer;
        }

        .chat-composer button:disabled {
            opacity: .5;
            cursor: not-allowed;
        }

        .typing {
            color: #ff83bd;
            font-size: 12px;
            padding: 10px;
        }

        #sidebarChatHistory {
            display: flex;
            flex-direction: column;
            gap: 5px;
            overflow-y: auto;
            max-height: 40vh;
        }

        #sidebarChatHistory .history-item {
            width: 100%;
            text-align: left;
            padding: 10px;
            border: 1px solid transparent;
            border-radius: 8px;
            background: transparent;
            color: #c9bdc5;
            cursor: pointer;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
        }

        #sidebarChatHistory .history-item.active {
            background: #291522;
            border-color: #ff3d9a;
            color: #ff83bd;
        }

        #sidebarChatHistory .empty-history {
            color: #888;
            font-size: 12px;
            padding: 10px;
        }

        @media(max-width:650px) {

            .ai-chat-page {
                padding: 8px 10px;
                min-height: calc(100vh - 80px);
            }

            .chat-heading h2 {
                font-size: 22px;
            }

            .chat-message {
                max-width: 90%;
                font-size: 13px;
            }

        }

    `;

    document.head.appendChild(chatStyles);


    // ========================================
    // HOME PAGE BACKUP
    // ========================================

    const homeContent = main.innerHTML;


    // ========================================
    // ADD MESSAGE
    // ========================================

    function addMessage(message, sender) {

        const messages = document.querySelector("#chatMessages");

        if (!messages) return;

        const bubble = document.createElement("div");

        bubble.className =
            "chat-message " +
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


    // ========================================
    // SIDEBAR CHAT HISTORY
    // ========================================

    function renderSidebarHistory() {

        const historyBox = document.querySelector("#sidebarChatHistory");

        if (!historyBox) return;

        historyBox.innerHTML = "";

        if (chats.length === 0) {

            historyBox.innerHTML =
                '<div class="empty-history">No conversations yet</div>';

            return;
        }

        chats.forEach(chat => {

            const item = document.createElement("button");

            item.type = "button";

            item.className =
                "history-item" +
                (chat.id === activeChatId ? " active" : "");

            item.textContent = chat.title || "New Conversation";

            item.addEventListener("click", () => {

                activeChatId = chat.id;

                openChat();

                closeMobileSidebar();

            });

            historyBox.appendChild(item);

        });
    }


    // ========================================
    // RENDER MESSAGES
    // ========================================

    function renderMessages() {

        const messages = document.querySelector("#chatMessages");

        if (!messages) return;

        // Clear old messages before rendering.
        messages.innerHTML = "";

        const chat = getActiveChat();

        if (!chat || chat.messages.length === 0) {
    return;
        }

        chat.messages.forEach(message => {

            addMessage(
                message.content,
                message.role === "user" ? "user" : "ai"
            );

        });
    }


    // ========================================
    // OPEN CHAT
    // ========================================

    function openChat() {

        if (!getActiveChat()) {
            createChat();
        }

        main.innerHTML = `

            <section class="ai-chat-page">

                <div class="chat-topbar">

                    <button class="back-home" id="backHomeBtn">
                        ← Home
                    </button>

                    <button class="chat-new-button" id="newChatBtn">
                        + New Chat
                    </button>

                </div>

                <div class="chat-heading">

                    <div style="font-size:42px;color:#ff3d9a;">
                        ∞
                    </div>

                    <h2>AS INFINITY AI</h2>

                    <p>Your space to think, learn and create.</p>

                </div>

                <div id="chatMessages"></div>

                <div class="chat-composer">

                    <input
                        id="aiMessageInput"
                        type="text"
                        maxlength="4000"
                        placeholder="Message AS INFINITY AI..."
                        autocomplete="off"
                    >

                    <button id="aiSendButton" type="button">
                        ➤
                    </button>

                </div>

            </section>

        `;

        document.querySelector("#backHomeBtn")
            .addEventListener("click", showHome);

        document.querySelector("#newChatBtn")
            .addEventListener("click", () => {

                createChat();
                openChat();

                notify("New conversation started!");

            });

        renderMessages();
        renderSidebarHistory();

        const input = document.querySelector("#aiMessageInput");
        const button = document.querySelector("#aiSendButton");


        // ========================================
        // SEND MESSAGE
        // ========================================

        async function sendChat() {

            const message = input.value.trim();

            if (!message || button.disabled) return;

            const chat = getActiveChat();

            if (!chat) return;

            const previousHistory = chat.messages.map(item => ({

                role: item.role === "assistant" ? "assistant" : "user",
                content: item.content

            }));

            // Save user message exactly once.
            chat.messages.push({

                role: "user",
                content: message

            });

            if (chat.messages.length === 1) {

                chat.title = message.length > 30
                    ? message.substring(0, 30) + "..."
                    : message;

            }

            chat.updated = Date.now();

            saveChats();

            // Display user message exactly once.
            addMessage(message, "user");

            renderSidebarHistory();

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

                        history: previousHistory.slice(-10)

                    })

                });

                const data = await response.json();

                if (!response.ok || !data.success || !data.reply) {

                    throw new Error(data.error || "AI request failed");

                }

                const reply = data.reply;

                // Save AI reply exactly once.
                chat.messages.push({

                    role: "assistant",
                    content: reply

                });

                chat.updated = Date.now();

                saveChats();

                addMessage(reply, "ai");

            } catch (error) {

                console.error("AS INFINITY AI Error:", error);

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

            if (event.key === "Enter") {

                event.preventDefault();

                sendChat();

            }

        });

        input.focus();
    }


    // ========================================
    // CLOSE MOBILE SIDEBAR
    // ========================================

    function closeMobileSidebar() {

        const side = document.querySelector(".sidebar");

        if (side && window.innerWidth <= 650) {

            side.classList.remove("mobile-open");

        }
    }


    // ========================================
    // NEW CHAT FROM SIDEBAR
    // ========================================

    const sidebarNewChat = document.querySelector(
        ".sidebar .new-chat-btn"
    );

    if (sidebarNewChat) {

        // Remove old inline click handler.
        sidebarNewChat.removeAttribute("onclick");

        sidebarNewChat.addEventListener("click", () => {

            createChat();

            openChat();

            closeMobileSidebar();

            notify("New conversation started!");

        });
    }


    // ========================================
    // HOME PAGE
    // ========================================

    function showHome() {

        main.innerHTML = homeContent;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        attachHomeEvents();

        renderSidebarHistory();
    }


    // ========================================
    // HOME PAGE EVENTS
    // ========================================

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

                createChat();

                openChat();

                const chatInput =
                    document.querySelector("#aiMessageInput");

                chatInput.value = message;

                document.querySelector("#aiSendButton").click();

            });


            input.addEventListener("keydown", event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    button.click();

                }

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


    // ========================================
    // NAVIGATION
    // ========================================

    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            navLinks.forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            const name =
                link.querySelector("span")?.textContent?.trim();

            if (name === "Home") {

                showHome();

            } else if (name === "AI Chat") {

                openChat();

            } else {

                notify(name + " module is under development.");

            }

            closeMobileSidebar();

        });

    });


    // ========================================
    // INITIALIZE
    // ========================================

    attachHomeEvents();

    renderSidebarHistory();

});


// ========================================
// SIDEBAR CONTROL
// ========================================

(() => {

    const app = document.querySelector(".app");

    const sidebar = document.querySelector(".sidebar");

    const toggle = document.getElementById("sidebarToggle");

    if (!app || !sidebar || !toggle) return;

    const mobile = window.matchMedia("(max-width: 650px)");

    if (!mobile.matches) {

        const savedState =
            localStorage.getItem("as_sidebar_collapsed");

        if (savedState === "true") {

            app.classList.add("sidebar-collapsed");

        }

    }


    function updateButton() {

        const isOpen = mobile.matches
            ? sidebar.classList.contains("mobile-open")
            : !app.classList.contains("sidebar-collapsed");

        toggle.setAttribute("aria-expanded", String(isOpen));

    }


    toggle.addEventListener("click", () => {

        if (mobile.matches) {

            sidebar.classList.toggle("mobile-open");

        } else {

            app.classList.toggle("sidebar-collapsed");

            localStorage.setItem(
                "as_sidebar_collapsed",
                app.classList.contains("sidebar-collapsed")
            );

        }

        updateButton();

    });


    sidebar.querySelectorAll("nav a").forEach(link => {

        link.addEventListener("click", () => {

            if (mobile.matches) {

                sidebar.classList.remove("mobile-open");

                updateButton();

            }

        });

    });


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            sidebar.classList.remove("mobile-open");

            updateButton();

        }

    });


    mobile.addEventListener("change", () => {

        sidebar.classList.remove("mobile-open");

        updateButton();

    });


    updateButton();

})();

   
