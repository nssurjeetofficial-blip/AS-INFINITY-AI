import { supabase } from "./supabase.js";
import { getCurrentUser } from "./auth.js";

import {
    loadChats,
    saveChats,
    loadMemories,
    saveMemories,
    setStorageUser
} from "./storage.js";

// =====================================
// 1. MAIN CLOUD SYNC
// =====================================

export async function syncAll() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Please login first.");
    }

    setStorageUser(user.id);

    await syncChats(user.id);
    await syncMemories(user.id);

    return true;
}

// =====================================
// 2. CHAT ONLY SYNC
// =====================================

export async function syncChatsOnly() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Please login first.");
    }

    setStorageUser(user.id);

    await syncChats(user.id);

    return true;
}

// =====================================
// 3. CHAT CLOUD SYNC
// =====================================

async function syncChats(userId) {
    const localChats = loadChats();

    const { data: cloudChats, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", userId);

    if (error) throw error;

    const merged = new Map();

    // Cloud chats
    for (const chat of cloudChats || []) {
        merged.set(chat.id, {
            id: chat.id,
            title: chat.title || "New Chat",
            messages: Array.isArray(chat.messages)
                ? chat.messages
                : [],
            category: chat.category || "friend",
            updated: chat.updated_at
                ? new Date(chat.updated_at).getTime()
                : 0
        });
    }

    // Merge local chats
    for (const chat of localChats || []) {
        if (!chat || !chat.id) continue;

        const existing = merged.get(chat.id);

        if (
            !existing ||
            (chat.updated || 0) >= existing.updated
        ) {
            merged.set(chat.id, {
                ...chat,
                title: chat.title || "New Chat",
                messages: Array.isArray(chat.messages)
                    ? chat.messages
                    : [],
                category: chat.category || "friend",
                updated: chat.updated || Date.now()
            });
        }
    }

    const finalChats = Array.from(merged.values());

    // Prepare database rows
    const rows = finalChats.map(chat => ({
        id: chat.id,
        user_id: userId,
        title: chat.title,
        messages: chat.messages,
        category: chat.category,
        updated_at: new Date(
            chat.updated || Date.now()
        ).toISOString()
    }));

    // Upload merged chats
    if (rows.length > 0) {
        const { error: saveError } = await supabase
            .from("chats")
            .upsert(rows, {
                onConflict: "id"
            });

        if (saveError) throw saveError;
    }

    saveChats(finalChats);
}

// =====================================
// 4. INITIAL MEMORY SYNC
// =====================================

async function syncMemories(userId) {
    const localMemories = loadMemories();

    const { data: cloudMemories, error } = await supabase
        .from("memories")
        .select("content")
        .eq("user_id", userId);

    if (error) throw error;

    const merged = new Set();

    // Cloud memories
    for (const item of cloudMemories || []) {
        if (
            typeof item.content === "string" &&
            item.content.trim()
        ) {
            merged.add(item.content.trim());
        }
    }

    // Local memories
    for (const memory of localMemories || []) {
        if (
            typeof memory === "string" &&
            memory.trim()
        ) {
            merged.add(memory.trim());
        }
    }

    const finalMemories = Array.from(merged);

    const existing = new Set(
        (cloudMemories || []).map(item => item.content)
    );

    const newRows = finalMemories
        .filter(memory => !existing.has(memory))
        .map(content => ({
            user_id: userId,
            content
        }));

    if (newRows.length > 0) {
        const { error: saveError } = await supabase
            .from("memories")
            .insert(newRows);

        if (saveError) throw saveError;
    }

    saveMemories(finalMemories);
}

// =====================================
// 5. SAVE MEMORY CHANGES TO CLOUD
// =====================================

export async function syncMemoriesToCloud(localMemories) {
    const user = await getCurrentUser();

    if (!user) return false;

    const safeMemories = [
        ...new Set(
            (Array.isArray(localMemories) ? localMemories : [])
                .filter(item =>
                    typeof item === "string" && item.trim()
                )
                .map(item => item.trim())
        )
    ];

    const { data: cloudMemories, error } = await supabase
        .from("memories")
        .select("id, content")
        .eq("user_id", user.id);

    if (error) throw error;

    const cloudSet = new Set(
        (cloudMemories || []).map(item => item.content)
    );

    const localSet = new Set(safeMemories);

    // Insert new memories first
    const newRows = safeMemories
        .filter(memory => !cloudSet.has(memory))
        .map(content => ({
            user_id: user.id,
            content
        }));

    if (newRows.length > 0) {
        const { error: insertError } = await supabase
            .from("memories")
            .insert(newRows);

        if (insertError) throw insertError;
    }

    // Delete memories removed locally
    const obsoleteIds = (cloudMemories || [])
        .filter(item => !localSet.has(item.content))
        .map(item => item.id);

    if (obsoleteIds.length > 0) {
        const { error: deleteError } = await supabase
            .from("memories")
            .delete()
            .eq("user_id", user.id)
            .in("id", obsoleteIds);

        if (deleteError) throw deleteError;
    }

    return true;
}
// =====================================
// 6. DELETE CHAT FROM CLOUD
// =====================================

export async function deleteChatFromCloud(chatId) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Please login first.");
    }

    const { error } = await supabase
        .from("chats")
        .delete()
        .eq("id", chatId)
        .eq("user_id", user.id);

    if (error) throw error;

    return true;
}

