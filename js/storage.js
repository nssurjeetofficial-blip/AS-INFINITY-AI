import {
    STORAGE_KEY,
    MEMORY_KEY
} from "./config.js";

let activeChatKey = STORAGE_KEY;
let activeMemoryKey = MEMORY_KEY;

export function setStorageUser(userId) {
    if (!userId) return;

    const chatKey = `${STORAGE_KEY}_${userId}`;
    const memoryKey = `${MEMORY_KEY}_${userId}`;

    const migrationKey = "as_infinity_ai_storage_migrated";

    // Migrate old local data only once.
    if (!localStorage.getItem(migrationKey)) {
        const oldChats = localStorage.getItem(STORAGE_KEY);
        const oldMemories = localStorage.getItem(MEMORY_KEY);

        if (oldChats !== null && !localStorage.getItem(chatKey)) {
            localStorage.setItem(chatKey, oldChats);
        }

        if (oldMemories !== null && !localStorage.getItem(memoryKey)) {
            localStorage.setItem(memoryKey, oldMemories);
        }

        localStorage.setItem(migrationKey, userId);
    }

    activeChatKey = chatKey;
    activeMemoryKey = memoryKey;
}

export function loadChats() {
    try {
        const data = JSON.parse(
            localStorage.getItem(activeChatKey) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Chat loading error:", error);
        return [];
    }
}

export function saveChats(chats) {
    localStorage.setItem(activeChatKey, JSON.stringify(chats));
}

export function loadMemories() {
    try {
        const data = JSON.parse(
            localStorage.getItem(activeMemoryKey) || "[]"
        );

        return Array.isArray(data)
            ? data.filter(item => typeof item === "string")
            : [];
    } catch (error) {
        console.error("Memory loading error:", error);
        return [];
    }
}

export function saveMemories(memories) {
    localStorage.setItem(
        activeMemoryKey,
        JSON.stringify(memories)
    );
}
