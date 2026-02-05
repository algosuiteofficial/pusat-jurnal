import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Strict check for valid configuration
const isValidUrl = (url) => {
    try {
        return url && url.startsWith('https://');
    } catch {
        return false;
    }
};

const isConfigured = isValidUrl(supabaseUrl) &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20 && // Keys are usually long
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;

if (isConfigured) {
    try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error('Supabase initialization failed:', error.message);
        supabaseClient = null;
    }
}

export const supabase = supabaseClient;

if (!supabase) {
    console.warn('Supabase is NOT ACTIVE. App running in "Local Mode" (localStorage).');
    if (supabaseUrl && !isValidUrl(supabaseUrl)) {
        console.error('ERROR: VITE_SUPABASE_URL must start with https://');
    }
}
