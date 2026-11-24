import {
    loadMemories,
    saveMemories
} from "./storage.js";

import { syncMemoriesToCloud } from "./cloud-sync.js";

function saveAndSync(memories) {
    saveMemories(memories);

    syncMemoriesToCloud(memories).catch(error => {
        console.error("Memory Cloud Sync Error:", error);
    });
}

export function getMemories() {
    return loadMemories();
}

export function addMemory(memory) {
    const memories = loadMemories();

    if (memories.length >= 12) return false;

    const value = memory.trim();

    if (!value) return false;

    memories.push(value);
    saveAndSync(memories);

    return true;
}

export function editMemory(index, newValue) {
    const memories = loadMemories();
    const value = newValue.trim();

    if (
        index < 0 ||
        index >= memories.length ||
        !value
    ) {
        return false;
    }

    memories[index] = value;
    saveAndSync(memories);

    return true;
}

export function deleteMemory(index) {
    const memories = loadMemories();

    if (index < 0 || index >= memories.length) {
        return false;
    }

    memories.splice(index, 1);
    saveAndSync(memories);

    return true;
}
