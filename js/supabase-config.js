/**
 * SUPABASE CLIENT & CONFIGURATION
 * 
 * Anda bisa mengisi kredensial Supabase Anda di sini,
 * ATAU memasukkannya langsung melalui tombol pengaturan "Koneksi Supabase" di website.
 */

// Kredensial Default (Kosongkan jika belum ada, atau isi langsung di sini)
const DEFAULT_SUPABASE_URL = "";
const DEFAULT_SUPABASE_ANON_KEY = "";

// Mengambil kredensial dari localStorage (jika diinput melalui modal website) atau fallback ke nilai default di atas
function getSupabaseCredentials() {
  const storedUrl = localStorage.getItem('PROMPT_STUDIO_SUPABASE_URL');
  const storedKey = localStorage.getItem('PROMPT_STUDIO_SUPABASE_KEY');

  const url = (storedUrl && storedUrl.trim() !== '') ? storedUrl.trim() : DEFAULT_SUPABASE_URL.trim();
  const key = (storedKey && storedKey.trim() !== '') ? storedKey.trim() : DEFAULT_SUPABASE_ANON_KEY.trim();

  return { url, key };
}

let supabaseClient = null;

// Inisialisasi Supabase Client
function initSupabaseClient() {
  const { url, key } = getSupabaseCredentials();

  if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      return supabaseClient;
    } catch (e) {
      console.warn("Gagal menginisialisasi Supabase:", e);
      supabaseClient = null;
      return null;
    }
  }
  supabaseClient = null;
  return null;
}

// Cek apakah Supabase sudah terkonfigurasi
function isSupabaseConfigured() {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

// Simpan kredensial baru
function saveSupabaseCredentials(url, key) {
  if (url) localStorage.setItem('PROMPT_STUDIO_SUPABASE_URL', url.trim());
  if (key) localStorage.setItem('PROMPT_STUDIO_SUPABASE_KEY', key.trim());
  return initSupabaseClient();
}

// Hapus kredensial (kembali ke data lokal)
function resetSupabaseCredentials() {
  localStorage.removeItem('PROMPT_STUDIO_SUPABASE_URL');
  localStorage.removeItem('PROMPT_STUDIO_SUPABASE_KEY');
  supabaseClient = null;
}

// Ambil data prompts dari Supabase
async function fetchPromptsFromSupabase() {
  if (!supabaseClient) {
    initSupabaseClient();
  }

  if (!supabaseClient) {
    throw new Error("Supabase client belum terkonfigurasi.");
  }

  const { data, error } = await supabaseClient
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  // Normalisasi data dari tabel Supabase ke format aplikasi
  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    type: row.type,
    prompt: row.prompt,
    negativePrompt: row.negative_prompt || '',
    aspectRatio: row.aspect_ratio || '16:9',
    mediaUrl: row.media_url,
    thumbnailUrl: row.thumbnail_url || row.media_url,
    model: row.model || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    description: row.description || '',
    date: row.created_at ? row.created_at.split('T')[0] : ''
  }));
}

// Tambah prompt baru ke Supabase
async function insertPromptToSupabase(item) {
  if (!supabaseClient) {
    initSupabaseClient();
  }

  if (!supabaseClient) {
    throw new Error("Supabase client belum terkonfigurasi.");
  }

  const payload = {
    id: item.id || 'prompt-' + Date.now(),
    title: item.title,
    type: item.type,
    prompt: item.prompt,
    negative_prompt: item.negativePrompt || '',
    aspect_ratio: item.aspectRatio || '16:9',
    media_url: item.mediaUrl,
    thumbnail_url: item.thumbnailUrl || item.mediaUrl,
    model: item.model || '',
    tags: item.tags || [],
    description: item.description || ''
  };

  const { data, error } = await supabaseClient
    .from('prompts')
    .insert([payload])
    .select();

  if (error) {
    throw error;
  }

  return data;
}

// Inisialisasi saat script dimuat
window.addEventListener('DOMContentLoaded', () => {
  initSupabaseClient();
});
