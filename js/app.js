import { loadChats, saveChats } from "./storage.js";

import {
    getMemories,
    addMemory,
    editMemory,
    deleteMemory
} from "./memory.js";

import { sendToAI } from "./chat.js";

import { renderSidebarHistory } from "./sidebar.js";

import { renderMessages } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTS
    const main = document.querySelector(".main");
    const sidebar = document.querySelector(".sidebar");
    const sidebarToggle = document.querySelector("#sidebarToggle");

    const homeScreen = document.querySelector(".home-screen");
    const homeCenter = document.querySelector(".home-center");
    const chatBox = document.querySelector(".chat-box");
    const input = chatBox?.querySelector("input");
    const sendButton = chatBox?.querySelector("button");

    const historyContainer =
        document.querySelector("#sidebarChatHistory");

    if (!main || !homeScreen || !input || !sendButton) {
        console.error("AS INFINITY AI: Required HTML elements missing.");
        return;
    }

    // CHAT DATA
    let chats = loadChats();

    chats = chats.map(chat => ({
        ...chat,
        id: chat.id || crypto.randomUUID(),
        title: chat.title || "New Chat",
        messages: Array.isArray(chat.messages)
            ? chat.messages
            : [],
        updated: chat.updated || Date.now()
    }));

    let activeChatId = null;

    function getActiveChat() {
        return chats.find(chat => chat.id === activeChatId);
    }

    function saveData() {
        saveChats(chats);
    }

    // CHAT INTERFACE
    const messageContainer = document.createElement("div");

    messageContainer.id = "chatMessages";

    messageContainer.style.cssText = `
        display: none;
        flex-direction: column;
        gap: 14px;
        width: 100%;
        max-width: 850px;
        margin: 20px auto;
        padding: 15px;
        max-height: 55vh;
        overflow-y: auto;
    `;

    homeScreen.insertBefore(messageContainer, chatBox);

    function updateSidebar() {
        renderSidebarHistory(
            chats,
            activeChatId,
            openChat
        );
    }

    function renderChat() {
        const chat = getActiveChat();

        if (!chat) return;

        homeCenter.style.display = "none";
        messageContainer.style.display = "flex";

        renderMessages(
            messageContainer,
            chat.messages
        );

        messageContainer.scrollTop =
            messageContainer.scrollHeight;
    }

    // NEW CHAT
    function newChat() {
        activeChatId = null;

        homeCenter.style.display = "";
        messageContainer.style.display = "none";

        messageContainer.replaceChildren();

        input.value = "";
        input.focus();

        updateSidebar();
    }

    // OPEN CHAT
    function openChat(id) {
        const chat = chats.find(item => item.id === id);

        if (!chat) return;

        activeChatId = id;
        renderChat();
        updateSidebar();
    }

    // CREATE CHAT
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

    // SEND MESSAGE
    async function sendMessage() {
        const message = input.value.trim();

        if (!message || sendButton.disabled) return;

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

        saveData();
        renderChat();
        updateSidebar();

        sendButton.disabled = true;

        const loading = document.createElement("div");
        loading.textContent = "AS INFINITY AI is thinking...";
        loading.style.cssText =
            "padding:12px;color:#ff83b5;text-align:center;";

        messageContainer.appendChild(loading);

        try {
            const history = chat.messages.slice(0, -1);

            const reply = await sendToAI(
                message,
                history,
                getMemories()
            );

            loading.remove();

            chat.messages.push({
                role: "assistant",
                content: reply
            });

            chat.updated = Date.now();

            saveData();
            renderChat();
            updateSidebar();

        } catch (error) {
            loading.remove();

            const errorMessage =
                "Sorry, AI connection failed. Please try again.";

            chat.messages.push({
                role: "assistant",
                content: errorMessage
            });

            saveData();
            renderChat();

            console.error(error);

        } finally {
            sendButton.disabled = false;
            input.focus();
        }
    }

    // SEND BUTTON
    sendButton.addEventListener("click", sendMessage);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    // NEW CHAT BUTTON
    const newChatButton =
        document.querySelector(".new-chat-btn");

    newChatButton?.addEventListener("click", event => {
        event.preventDefault();
        newChat();
    });

    // SIDEBAR TOGGLE
    sidebarToggle?.addEventListener("click", () => {
        sidebar?.classList.toggle("collapsed");
    });

    // MEMORY MANAGER
    const memoryButton = document.createElement("button");

    memoryButton.type = "button";
    memoryButton.textContent = "♡ Memory";

    memoryButton.style.cssText = `
        background:#171117;
        color:#ff83b5;
        border:1px solid #ff83b5;
        border-radius:10px;
        padding:9px 14px;
        cursor:pointer;
        margin-left:10px;
    `;

    document.querySelector(".topbar-right")
        ?.appendChild(memoryButton);

    function openMemoryManager() {
        const memories = getMemories();

        const overlay = document.createElement("div");

        overlay.style.cssText = `
            position:fixed;
            inset:0;
            z-index:9999;
            background:#000d;
            display:flex;
            justify-content:center;
            align-items:center;
            padding:15px;
        `;

        const box = document.createElement("div");

        box.style.cssText = `
            background:#151015;
            color:white;
            width:100%;
            max-width:420px;
            max-height:80vh;
            overflow:auto;
            padding:22px;
            border:1px solid #ff83b5;
            border-radius:16px;
        `;

        const heading = document.createElement("h2");
        heading.textContent = "♡ Memory Manager";

        box.appendChild(heading);

        const addButton = document.createElement("button");
        addButton.textContent = "+ Add Memory";

        addButton.onclick = () => {
            const value = prompt("Enter your memory:");

            if (value && addMemory(value)) {
                overlay.remove();
                openMemoryManager();
            } else if (value) {
                alert("Memory could not be saved. Maximum 12 memories.");
            }
        };

        box.appendChild(addButton);

        memories.forEach((memory, index) => {
            const row = document.createElement("div");

            row.style.cssText =
                "padding:12px 0;border-bottom:1px solid #444;";

            const text = document.createElement("p");
            text.textContent = memory;

            const edit = document.createElement("button");
            edit.textContent = "Edit";

            edit.onclick = () => {
                const value = prompt("Edit memory:", memory);

                if (value !== null && editMemory(index, value)) {
                    overlay.remove();
                    openMemoryManager();
                }
            };

            const remove = document.createElement("button");
            remove.textContent = "Delete";

            remove.onclick = () => {
                if (confirm("Delete this memory?")) {
                    deleteMemory(index);
                    overlay.remove();
                    openMemoryManager();
                }
            };

            row.append(text, edit, remove);
            box.appendChild(row);
        });

        const nicknameButton = document.createElement("button");
        nicknameButton.textContent = "♡ Save My Nickname";

        nicknameButton.onclick = () => {
            const value = prompt("What nickname should AI use for you?");

            if (value) {
                const existing = getMemories().findIndex(
                    item => item.startsWith("User nickname:")
                );

                if (existing >= 0) {
                    editMemory(existing, "User nickname: " + value);
                } else {
                    addMemory("User nickname: " + value);
                }

                overlay.remove();
                openMemoryManager();
            }
        };

        const aiNicknameButton = document.createElement("button");
        aiNicknameButton.textContent = "♡ Save AI Nickname";

        aiNicknameButton.onclick = () => {
            const value = prompt("What nickname should you use for AI?");

            if (value) {
                const existing = getMemories().findIndex(
                    item => item.startsWith("AI nickname:")
                );

                if (existing >= 0) {
                    editMemory(existing, "AI nickname: " + value);
                } else {
                    addMemory("AI nickname: " + value);
                }

                overlay.remove();
                openMemoryManager();
            }
        };

        const close = document.createElement("button");
        close.textContent = "Close";
        close.style.marginTop = "15px";
        close.onclick = () => overlay.remove();

        box.append(
            nicknameButton,
            aiNicknameButton,
            close
        );

        overlay.appendChild(box);
        overlay.addEventListener("click", event => {
            if (event.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
    }

    memoryButton.onclick = function () {
    console.log("Memory button clicked");
    openMemoryManager();
};
    );

    // STARTUP
    updateSidebar();
    newChat();

    console.log("AS INFINITY AI initialized successfully.");

});
