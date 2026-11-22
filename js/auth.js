import { supabase } from "./supabase.js";

// SIGN UP
export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) throw error;
    return data;
}

// LOGIN
export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
}

// LOGOUT
export async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
}

// GET CURRENT USER
export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;
    return data.user;
}

// GET SESSION
export async function getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;
    return data.session;
}
