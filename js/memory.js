import {
    loadMemories,
    saveMemories
} from "./storage.js";

export function getMemories() {
    return loadMemories();
}

export function addMemory(memory) {
    const memories = loadMemories();

    if (memories.length >= 12) {
        return false;
    }

    const value = memory.trim();

    if (!value) return false;

    memories.push(value);
    saveMemories(memories);

    return true;
}

export function editMemory(index, newValue) {
    const memories = loadMemories();
    const value = newValue.trim();

    if (!memories[index] || !value) {
        return false;
    }

    memories[index] = value;
    saveMemories(memories);

    return true;
}

export function deleteMemory(index) {
    const memories = loadMemories();

    if (index < 0 || index >= memories.length) {
        return false;
    }

    memories.splice(index, 1);
    saveMemories(memories);

    return true;
}
