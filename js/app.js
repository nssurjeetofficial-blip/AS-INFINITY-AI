import {
    syncAll,
    syncChatsOnly
} from "./cloud-sync.js";

import { loadChats, saveChats } from "./storage.js";

import {
    getMemories,
    addMemory,
    editMemory,
    deleteMemory
} from "./memory.js";

import { sendToAI } from "./chat.js";

import { renderSidebarHistory } from "./sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
    // =================================
    // 1. HTML ELEMENTS
    // =================================

    const app = document.querySelector(".app");
    const main = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");
    const sidebarToggle = document.querySelector("#sidebarToggle");

    const homeScreen = document.querySelector(".home-screen");
    const homeCenter = document.querySelector(".home-center");

    // SPECIALIST HEADER
const specialistInfo = {
    medical: {
        icon: "🏥",
        name: "AS MEDICAL AI",
        subtitle: "Your Healthcare Assistant"
    },
    study: {
        icon: "🎓",
        name: "AS STUDY AI",
        subtitle: "Your Smart Learning Partner"
    },
    friend: {
        icon: "❤️",
        name: "AS FRIEND AI",
        subtitle: "Your Friendly Companion"
    }
};

const currentSpecialist =
    specialistInfo[activeCategory] || specialistInfo.friend;

const specialistHeader = document.createElement("div");

specialistHeader.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    margin: 12px 16px;
    background: rgba(255, 63, 164, 0.08);
    border: 1px solid rgba(255, 63, 164, 0.25);
    border-radius: 16px;
`;

specialistHeader.innerHTML = `
    <div>
        <div style="font-size:17px;font-weight:700;color:white;">
            ${currentSpecialist.icon} ${currentSpecialist.name}
        </div>
        <div style="font-size:12px;color:#c5aebe;margin-top:4px;">
            ${currentSpecialist.subtitle}
        </div>
    </div>
    <button id="switchSpecialist"
        style="background:#ff3fa4;color:white;border:0;
        padding:10px 13px;border-radius:10px;font-weight:600;">
        Switch AI
    </button>
`;

homeScreen.prepend(specialistHeader);

specialistHeader.querySelector("#switchSpecialist")
    .addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    
    const chatBox = document.querySelector(".chat-box");
    const input = chatBox?.querySelector("input");
    const sendButton = chatBox?.querySelector("button");

    const topbarRight = document.querySelector(".topbar-right");

    const newChatButton = document.querySelector(".new-chat-btn");

    const historyContainer = document.querySelector(
        "#sidebarChatHistory"
    );

    if (
        !app ||
        !main ||
        !sidebar ||
        !homeScreen ||
        !homeCenter ||
        !chatBox ||
        !input ||
        !sendButton ||
        !topbarRight ||
        !newChatButton ||
        !historyContainer
    ) {
        console.error("AS INFINITY AI: Required HTML element missing.");
        return;
    }

    // =================================
// 2. CHAT DATA
// =================================

const activeCategory =
    new URLSearchParams(window.location.search).get("category") || "friend";
// INITIAL CLOUD SYNC
try {
    await syncAll();
    console.log("AS INFINITY AI Cloud Sync Successful");
} catch (error) {
    console.error("Cloud Sync Error:", error);
}
    
let chats = loadChats();

chats = chats.map(chat => ({
const chat = {
    id: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
    category: activeCategory,
    updated: Date.now()
};

// Preserve existing chats.
// Old chats without a category are assigned to Friend AI.
saveChats(chats);

let activeChatId = null;
let isSending = false;

function getActiveChat() {
    return chats.find(chat => chat.id === activeChatId);
}

let cloudSyncTimer;

function saveData() {
    saveChats(chats);

    clearTimeout(cloudSyncTimer);

    cloudSyncTimer = setTimeout(async () => {
        try {
            await syncChatsOnly();
            console.log("Cloud Sync Successful");
        } catch (error) {
            console.error("Cloud Sync Error:", error);
        }
    }, 1000);
}
    
    

    // =================================
    // 3. MESSAGE CONTAINER
    // =================================

    const messageContainer = document.createElement("div");

    messageContainer.id = "chatMessages";

    messageContainer.style.cssText = `
        display:none;
        flex-direction:column;
        gap:14px;
        flex:1;
        width:100%;
        max-width:900px;
        min-height:200px;
        max-height:65vh;
        overflow-y:auto;
        margin:15px auto;
        padding:12px;
    `;

    homeScreen.insertBefore(messageContainer, chatBox);

    // =================================
    // 4. RENDER MESSAGES
    // =================================

    function renderMessages(messages) {

        messageContainer.replaceChildren();

        messages.forEach(message => {

            const row = document.createElement("div");

            row.style.cssText = `
                display:flex;
                width:100%;
                justify-content:${
                    message.role === "user"
                        ? "flex-end"
                        : "flex-start"
                };
                margin:5px 0;
            `;

            const bubble = document.createElement("div");

            bubble.textContent = message.content || "";

            bubble.style.cssText = `
                max-width:80%;
                width:fit-content;
                padding:13px 17px;
                border-radius:15px;
                line-height:1.7;
                font-size:14px;
                overflow-wrap:anywhere;
                white-space:pre-wrap;
                color:#fff7fc;
                background:${
                    message.role === "user"
                        ? "rgba(255,63,164,.16)"
                        : "rgba(25,17,28,.95)"
                };
                border:1px solid rgba(255,80,170,.22);
                border-bottom-right-radius:${
                    message.role === "user" ? "4px" : "15px"
                };
                border-bottom-left-radius:${
                    message.role === "assistant" ? "4px" : "15px"
                };
            `;

            row.appendChild(bubble);
            messageContainer.appendChild(row);
        });

        messageContainer.scrollTop =
            messageContainer.scrollHeight;
    }

    function showLoading() {

        const loading = document.createElement("div");

        loading.id = "aiLoading";

        loading.textContent =
            "∞ AS INFINITY AI is thinking...";

        loading.style.cssText = `
            align-self:flex-start;
            max-width:80%;
            padding:13px 17px;
            margin:5px 0;
            border-radius:15px;
            background:#19121c;
            border:1px solid rgba(255,80,170,.22);
            color:#ff80c5;
            font-size:13px;
        `;

        messageContainer.appendChild(loading);

        messageContainer.scrollTop =
            messageContainer.scrollHeight;
    }

    // =================================
    // 5. SIDEBAR HISTORY
    // =================================

    function updateSidebar() {
    renderSidebarHistory(
        chats.filter(chat => chat.category === activeCategory),
        activeChatId,
        openChat
    );
    }

    // =================================
    // 6. OPEN CHAT
    // =================================

    function renderChat() {

        const chat = getActiveChat();

        if (!chat) return;

        homeCenter.style.display = "none";

        messageContainer.style.display = "flex";

        renderMessages(chat.messages);
    }

    function openChat(id) {


        const selectedChat = chats.find(chat => chat.id === id);

if (!selectedChat || selectedChat.category !== activeCategory) return;
        
    const chat = chats.find(item => item.id === id);

    if (!chat) return;

    activeChatId = id;

    renderChat();
    updateSidebar();

    // Automatically close mobile sidebar
    if (window.innerWidth <= 650) {
        sidebar.classList.remove("mobile-open");
    }

    input.focus();
    }

    // =================================
    // 7. NEW CHAT
    // =================================

    function newChat() {

        activeChatId = null;

        homeCenter.style.display = "";

        messageContainer.style.display = "none";

        messageContainer.replaceChildren();

        input.value = "";

        updateSidebar();

        input.focus();
    }

    function createChat() {

        const chat = {
            id: crypto.randomUUID(),
            title: "New Chat",
            messages: [],
            updated: Date.now()
        };

        chats.unshift(chat);

        activeChatId = chat.id;

        saveData();
        updateSidebar();

        return chat;
    }

    // =================================
    // 8. SEND MESSAGE
    // =================================

    async function sendMessage() {

        const message = input.value.trim();

        if (!message || isSending) return;

        let chat = getActiveChat();

        if (!chat) {
            chat = createChat();
        }

        if (chat.messages.length === 0) {
            chat.title = message.slice(0, 35);
        }

        chat.messages.push({
            role: "user",
            content: message
        });

        chat.updated = Date.now();

        input.value = "";

        isSending = true;
        sendButton.disabled = true;

        renderChat();
        updateSidebar();
        saveData();

        showLoading();

        try {

            const history = chat.messages.slice(0, -1);

            const category = new URLSearchParams(window.location.search)
    .get("category") || "friend";

const reply = await sendToAI(
    message,
    history,
    getMemories(),
    category
);

            const loading =
                document.querySelector("#aiLoading");

            loading?.remove();

            chat.messages.push({
                role: "assistant",
                content: String(reply)
            });

            chat.updated = Date.now();

            saveData();
            renderChat();
            updateSidebar();

        } catch (error) {

            document.querySelector("#aiLoading")?.remove();

            console.error("AI ERROR:", error);

            chat.messages.push({
                role: "assistant",
                content:
                    "Sorry, I couldn't connect right now. Please try again."
            });

            saveData();
            renderChat();

        } finally {

            isSending = false;
            sendButton.disabled = false;

            input.focus();
        }
    }

    // =================================
    // 9. SEND BUTTON
    // =================================

    sendButton.addEventListener("click", sendMessage);

    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
        }
    });

    // =================================
    // 10. NEW CHAT BUTTON
    // =================================

    newChatButton.removeAttribute("onclick");

    newChatButton.addEventListener("click", event => {

        event.preventDefault();

        newChat();
    });

    // =================================
    // 11. SIDEBAR TOGGLE
    // =================================

    sidebarToggle.addEventListener("click", () => {

        if (window.innerWidth <= 650) {

            sidebar.classList.toggle("mobile-open");

        } else {

            app.classList.toggle("sidebar-collapsed");
        }

        sidebarToggle.setAttribute(
            "aria-expanded",
            sidebar.classList.contains("mobile-open") ||
            !app.classList.contains("sidebar-collapsed")
                ? "true"
                : "false"
        );
    });

    // =================================
    // 12. MEMORY BUTTON
    // =================================

    const memoryButton = document.createElement("button");

    memoryButton.type = "button";

    memoryButton.textContent = "♡ Memory";

    memoryButton.style.cssText = `
        padding:10px 13px;
        margin-right:5px;
        border:1px solid #ff3fa4;
        border-radius:11px;
        background:#19121c;
        color:#ff80c5;
        font-size:12px;
        font-weight:600;
        cursor:pointer;
        white-space:nowrap;
    `;

    topbarRight.insertBefore(
        memoryButton,
        topbarRight.firstChild
    );

    // =================================
    // 13. MEMORY MANAGER
    // =================================

    function openMemoryManager() {

        const overlay = document.createElement("div");

        overlay.style.cssText = `
            position:fixed;
            inset:0;
            z-index:99999;
            background:rgba(0,0,0,.82);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:15px;
        `;

        const box = document.createElement("div");

        box.style.cssText = `
            width:100%;
            max-width:430px;
            max-height:85vh;
            overflow-y:auto;
            padding:22px;
            border:1px solid #ff3fa4;
            border-radius:18px;
            background:#151015;
            color:white;
            box-shadow:0 0 35px rgba(255,63,164,.2);
        `;

        const heading = document.createElement("h2");

        heading.textContent = "♡ Memory Manager";

        heading.style.cssText = `
            margin-bottom:18px;
            color:#ff80c5;
            font-size:21px;
        `;

        box.appendChild(heading);

        function styleButton(button) {

            button.type = "button";

            button.style.cssText = `
                display:block;
                width:100%;
                padding:12px;
                margin:9px 0;
                border:1px solid rgba(255,63,164,.45);
                border-radius:10px;
                background:#211622;
                color:#fff;
                font-size:13px;
                cursor:pointer;
            `;
        }

        function refresh() {

            overlay.remove();

            openMemoryManager();
        }

        // ADD MEMORY

        const addButton = document.createElement("button");

        addButton.textContent = "+ Add Memory";

        styleButton(addButton);

        addButton.onclick = () => {

            const value = prompt("Enter your memory:");

            if (value === null) return;

            if (!addMemory(value)) {

                alert(
                    "Memory could not be saved. Check that it isn't empty and that the 12-memory limit hasn't been reached."
                );

                return;
            }

            refresh();
        };

        box.appendChild(addButton);

        // SAVED MEMORIES

        const memories = getMemories();

        const listHeading = document.createElement("h3");

        listHeading.textContent = "Saved Memories";

        listHeading.style.cssText = `
            margin:20px 0 10px;
            font-size:15px;
            color:#ff80c5;
        `;

        box.appendChild(listHeading);

        if (memories.length === 0) {

            const empty = document.createElement("p");

            empty.textContent = "No memories saved yet.";

            empty.style.cssText = `
                padding:12px 0;
                color:#a99ba8;
                font-size:13px;
            `;

            box.appendChild(empty);
        }

        memories.forEach((memory, index) => {

            const row = document.createElement("div");

            row.style.cssText = `
                padding:13px 0;
                border-bottom:1px solid #40313e;
            `;

            const text = document.createElement("p");

            text.textContent = memory;

            text.style.cssText = `
                margin-bottom:10px;
                font-size:13px;
                line-height:1.6;
                overflow-wrap:anywhere;
            `;

            const edit = document.createElement("button");

            edit.textContent = "Edit";

            styleButton(edit);

            edit.onclick = () => {

                const value = prompt("Edit memory:", memory);

                if (value === null) return;

                if (!editMemory(index, value)) {

                    alert("Memory could not be updated.");

                    return;
                }

                refresh();
            };

            const remove = document.createElement("button");

            remove.textContent = "Delete";

            styleButton(remove);

            remove.onclick = () => {

                if (!confirm("Delete this memory?")) return;

                deleteMemory(index);

                refresh();
            };

            row.append(text, edit, remove);

            box.appendChild(row);
        });

        // USER NICKNAME

        const nicknameButton = document.createElement("button");

        nicknameButton.textContent = "♡ Save My Nickname";

        styleButton(nicknameButton);

        nicknameButton.onclick = () => {

            const value = prompt(
                "What nickname should AI use for you?"
            );

            if (value === null || !value.trim()) return;

            const current = getMemories();

            const existing = current.findIndex(
                item => item.startsWith("User nickname:")
            );

            const memory = "User nickname: " + value.trim();

            const success = existing >= 0
                ? editMemory(existing, memory)
                : addMemory(memory);

            if (!success) {

                alert("Could not save nickname. Memory limit may be reached.");

                return;
            }

            refresh();
        };

        // AI NICKNAME

        const aiNicknameButton = document.createElement("button");

        aiNicknameButton.textContent = "♡ Save AI Nickname";

        styleButton(aiNicknameButton);

        aiNicknameButton.onclick = () => {

            const value = prompt(
                "What nickname should you use for AI?"
            );

            if (value === null || !value.trim()) return;

            const current = getMemories();

            const existing = current.findIndex(
                item => item.startsWith("AI nickname:")
            );

            const memory = "AI nickname: " + value.trim();

            const success = existing >= 0
                ? editMemory(existing, memory)
                : addMemory(memory);

            if (!success) {

                alert("Could not save nickname. Memory limit may be reached.");

                return;
            }

            refresh();
        };

        // CLOSE

        const closeButton = document.createElement("button");

        closeButton.textContent = "Close";

        styleButton(closeButton);

        closeButton.onclick = () => overlay.remove();

        box.append(
            nicknameButton,
            aiNicknameButton,
            closeButton
        );

        overlay.appendChild(box);

        overlay.addEventListener("click", event => {

            if (event.target === overlay) {
                overlay.remove();
            }
        });

        document.body.appendChild(overlay);
    }

    memoryButton.addEventListener(
        "click",
        openMemoryManager
    );

    // =================================
    // 14. STARTUP
    // =================================

    updateSidebar();

    newChat();

    console.log(
        "AS INFINITY AI initialized successfully."
    );

});
