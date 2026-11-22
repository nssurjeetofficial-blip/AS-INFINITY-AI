import { STORAGE_KEY, MEMORY_KEY } from "./config.js";

export function loadChats() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Chat loading error:", error);
        return [];
    }
}

export function saveChats(chats) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chats)
    );
}

export function loadMemories() {
    try {
        const data = JSON.parse(
            localStorage.getItem(MEMORY_KEY) || "[]"
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
        MEMORY_KEY,
        JSON.stringify(memories)
    );
}
