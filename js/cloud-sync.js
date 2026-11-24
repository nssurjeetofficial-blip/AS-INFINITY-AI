import { supabase } from "./supabase.js";
import { getCurrentUser } from "./auth.js";
import {
    loadChats,
    saveChats,
    loadMemories,
    saveMemories,
    setStorageUser
} from "./storage.js";

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
export async function syncChatsOnly() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Please login first.");
    }

    setStorageUser(user.id);

    await syncChats(user.id);

    return true;
}

// ==============================
// CHAT CLOUD SYNC
// ==============================

async function syncChats(userId) {
    const localChats = loadChats();

    const { data: cloudChats, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", userId);

    if (error) throw error;

    const merged = new Map();

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
                : Date.now()
        });
    }

    for (const chat of localChats) {
        const existing = merged.get(chat.id);

        if (!existing || (chat.updated || 0) >= existing.updated) {
            merged.set(chat.id, {
                ...chat,
                category: chat.category || "friend"
            });
        }
    }

    const finalChats = Array.from(merged.values());

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

    if (rows.length) {
        const { error: saveError } = await supabase
            .from("chats")
            .upsert(rows, { onConflict: "id" });

        if (saveError) throw saveError;
    }

    saveChats(finalChats);
}

// ==============================
// MEMORY CLOUD SYNC
// ==============================

async function syncMemories(userId) {
    const localMemories = loadMemories();

    const { data: cloudMemories, error } = await supabase
        .from("memories")
        .select("content")
        .eq("user_id", userId);

    if (error) throw error;

    const merged = new Set(
        (cloudMemories || []).map(item => item.content)
    );

    localMemories.forEach(memory => {
        if (typeof memory === "string" && memory.trim()) {
            merged.add(memory);
        }
    });

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

    if (newRows.length) {
        const { error: saveError } = await supabase
            .from("memories")
            .insert(newRows);

        if (saveError) throw saveError;
    }

    saveMemories(finalMemories);
          }
// ==============================
// SAVE MEMORY CHANGES TO CLOUD
// ==============================

export async function syncMemoriesToCloud(localMemories) {
    const user = await getCurrentUser();

    if (!user) return;

    const { data: cloudMemories, error } = await supabase
        .from("memories")
        .select("id, content")
        .eq("user_id", user.id);

    if (error) throw error;

    const localSet = new Set(localMemories);

    const obsoleteIds = (cloudMemories || [])
        .filter(item => !localSet.has(item.content))
        .map(item => item.id);

    const cloudSet = new Set(
        (cloudMemories || []).map(item => item.content)
    );

    const newRows = [...localSet]
        .filter(item => !cloudSet.has(item))
        .map(content => ({
            user_id: user.id,
            content
        }));

    if (obsoleteIds.length) {
        const { error: deleteError } = await supabase
            .from("memories")
            .delete()
            .eq("user_id", user.id)
            .in("id", obsoleteIds);

        if (deleteError) throw deleteError;
    }

    if (newRows.length) {
        const { error: insertError } = await supabase
            .from("memories")
            .insert(newRows);

        if (insertError) throw insertError;
    }
}

