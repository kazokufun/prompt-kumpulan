-- ==============================================================================
-- SUPABASE SCHEMA UNTUK PROMPT STUDIO
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Buat Tabel `prompts`
CREATE TABLE IF NOT EXISTS public.prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'image')),
  prompt TEXT NOT NULL,
  negative_prompt TEXT DEFAULT '',
  aspect_ratio TEXT DEFAULT '16:9',
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  model TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Keamanan: Izinkan Siapa Saja (Publik) Membaca Data Prompts
CREATE POLICY "Izinkan publik membaca prompts" 
ON public.prompts 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 4. Kebijakan Keamanan: Izinkan Menambah Prompt Baru
CREATE POLICY "Izinkan publik menambahkan prompts" 
ON public.prompts 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- ==============================================================================
-- 5. Data Awal (Seed Data 12 Karya Lengkap)
-- ==============================================================================
INSERT INTO public.prompts (id, title, type, prompt, negative_prompt, aspect_ratio, media_url, thumbnail_url, model, tags, description)
VALUES
(
  'dark-redemption',
  'Dark Redemption: A New Order Begins',
  'video',
  'Epic cinematic wide poster of a dark sci-fi thriller, intense crimson red lighting, mist and lightning storm in the background, three heroic characters with dramatic expressions in dark red silhouettes, 8k resolution, IMAX film still, volumetric red fog, moody cinematic masterpiece.',
  'low resolution, artifacts, cartoonish, washed out colors, oversaturated, blurry',
  '16:9',
  'assets/videos/hero_red.mp4',
  'assets/images/hero_red.jpg',
  'Runway Gen-3 / Midjourney',
  ARRAY['Action', 'Thriller', 'Cinematic', 'Sci-Fi'],
  'Poster sinematik bernuansa merah kirmizi pekat dengan siluet tiga pahlawan di tengah badai petir kota distopia.'
),
(
  'skycar-chase',
  'Neo-Tokyo High-Speed Skycar Pursuit',
  'video',
  'Cinematic first-person drone shot chasing a sleek aerodynamic chrome hovercar through futuristic neon megacity canyon clouds at sunset, vivid magenta and cyan neon holographic billboards, dynamic motion blur, hyper-speed, photorealistic sci-fi render, 60fps.',
  'blur, low resolution, cartoonish, stutter, distortion, artifacts, dark corners, oversaturated',
  '16:9',
  'assets/videos/skycar.mp4',
  'assets/images/skycar.jpg',
  'Runway Gen-3 Alpha',
  ARRAY['Sci-Fi', 'Cyberpunk', 'Cinematic', 'Aerial'],
  'Kamera drone FPV berkecepatan tinggi meluncur di sela gedung pencakar langit bernuansa cyberpunk dengan pantulan sunset dramatis.'
),
(
  'cyberpunk-samurai',
  'Cyberpunk Ronin Under Holographic Rain',
  'video',
  'Cinematic medium shot of a neo-tokyo cyberpunk ronin standing under torrential holographic rain, neon reflections on wet asphalt, intricate carbon-fiber armor with glowing cyan kanji runes, volumetric fog, anamorphic lens flare, 8k resolution, octane render.',
  'blurry, duplicate limbs, low detail, washed out colors, deformed hands',
  '16:9',
  'assets/videos/samurai.mp4',
  'assets/images/samurai.jpg',
  'Kling AI v1.5',
  ARRAY['Cyberpunk', 'Character', 'Atmospheric'],
  'Pendekar ronin modern berselimut armor karbon dengan runik kanji bercahaya di tengah guyuran hujan hologram kota neon.'
),
(
  'crystal-jellyfish',
  'Abyssal Crystal Cathedral of Bioluminescence',
  'video',
  'Cinematic underwater shot of an immense ancient sunken crystalline cathedral illuminated by hundreds of giant glowing translucent cyan and magenta jellyfish, god rays slicing through deep sapphire water, schools of bioluminescent silver fish, ultra-detailed 8k render, unreal engine 5.',
  'murky, muddy colors, noise, low poly, bad lighting, low contrast',
  '16:9',
  'assets/videos/jellyfish.mp4',
  'assets/images/jellyfish.jpg',
  'Luma Dream Machine',
  ARRAY['Fantasy', 'Underwater', 'Bioluminescence'],
  'Katedral kristal bawah laut raksasa dengan ubur-ubur pendar megah yang memancarkan cahaya mistis menembus air safir gelap.'
),
(
  'mecha-titan',
  'Ancient Titan Mecha Awakening in Sandstorm',
  'video',
  'Epic cinematic wide shot of a colossal ancient weathered biomechanical titan mecha half-buried in a desert sandstorm, glowing red eye sensor flaring through swirling dust, glowing heat vents, photorealistic military sci-fi, cinematic lighting, IMAX 70mm film grain.',
  'plastic texture, cartoon, oversaturated, low detail, toy-like',
  '16:9',
  'assets/videos/mecha.mp4',
  'assets/images/mecha.jpg',
  'OpenAI Sora',
  ARRAY['Sci-Fi', 'Mecha', 'Cinematic', 'Epic'],
  'Robot titan purba terbangun di tengah badai gurun pasir dengan kilatan sensor optik merah menyala.'
),
(
  'bioluminescent-butterfly',
  'Ethereal Crystal Butterfly in Midnight Grove',
  'image',
  'Macro photography of an ethereal bioluminescent butterfly resting on an iridescent crystal flower in a deep enchanted jungle at midnight, glowing spores floating in the air, soft purple and turquoise neon luminescence, high contrast, cinematic depth of field, 8k render.',
  'noisy, jpeg compression, blur, flat lighting, dull colors',
  '1:1',
  'assets/images/creature.jpg',
  'assets/images/creature.jpg',
  'Midjourney v6.1',
  ARRAY['Macro', 'Nature', 'Fantasy', 'Glow'],
  'Foto makro kupu-kupu kaca kristal dengan pendaran neon ungu dan toska di hutan malam magis.'
),
(
  'mars-cafe',
  'Golden Hour Espresso at Martian Geodesic Cafe',
  'image',
  'Cinematic medium shot of an astronaut inside a futuristic glass geodesic dome cafe on Mars, sitting at a minimalist black marble table sipping coffee from a floating magnetic cup, golden hour Martian sunset illuminating red canyons outside, Earth visible in the sky, photorealistic 8k, Hasselblad medium format.',
  'deformed face, unnatural hands, extra fingers, cartoonish, low resolution',
  '4:3',
  'assets/images/mars.jpg',
  'assets/images/mars.jpg',
  'Flux.1 Pro',
  ARRAY['Sci-Fi', 'Photorealistic', 'Space', 'Lifestyle'],
  'Suasana santai seorang astronot menikmati kopi di dalam kubah kaca Mars saat senja keemasan dengan pemandangan ngarai merah.'
),
(
  'ghibli-train',
  'Summer Seaside Nostalgia Express',
  'image',
  'Studio Ghibli style anime aesthetic, vintage teal coastal train moving along train tracks next to the glittering azure ocean, summer afternoon golden sunlight, fluffy cumulus clouds, wildflowers blowing in the breeze, vibrant nostalgic colors, hand-painted anime background, makoto shinkai aesthetic, 4k.',
  'photorealistic, 3d render, dark, moody, modern graffiti, depressing',
  '16:9',
  'assets/images/ghibli.jpg',
  'assets/images/ghibli.jpg',
  'Niji Journey v6',
  ARRAY['Anime', 'Scenery', 'Ghibli', 'Warm'],
  'Gaya anime lukisan tangan Studio Ghibli yang hangat, kereta pesisir melintasi hamparan padang bunga tepi laut biru berkilau.'
),
(
  'liquid-gold-sculpture',
  'Zero-Gravity Molten Gold & Obsidian Ribbon',
  'image',
  'Dynamic contemporary art sculpture of floating fluid molten 24k gold entwined with liquid mercury and obsidian crystal ribbons, suspended weightlessly in mid-air, dramatic museum spotlight, dark matte studio background, caustic reflections, hyper-detailed luxury 3D render.',
  'flat colors, low poly, noisy background, muddy reflection, dull metal',
  '3:4',
  'assets/images/sculpture.jpg',
  'assets/images/sculpture.jpg',
  'Stable Diffusion 3.5',
  ARRAY['3D Render', 'Abstract', 'Luxury'],
  'Instalasi seni cairan emas 24 karat berpadu dengan air raksa dan pita kristal obsidian yang melayang anggun di udara hampa.'
),
(
  'cyber-panther',
  'Apex Bionic Panther in Cyber Alley',
  'image',
  'Close-up portrait of a sleek robotic black panther with glowing geometric turquoise circuits, glowing amber feline eyes, carbon fiber texture, misty neon cyber city alley background with rainy reflections, unreal engine 5, 8k resolution.',
  'blurry, low poly, unnatural anatomy, bad eyes, washed out',
  '1:1',
  'assets/images/panther.jpg',
  'assets/images/panther.jpg',
  'Flux.1 Dev',
  ARRAY['Cyberpunk', 'Animal', 'Concept Art'],
  'Potret macan tutul bionik hitam dengan sirkuit bercahaya toska dan tatapan tajam bermata amber di gang kota masa depan.'
),
(
  'kintsugi-geisha',
  'Kintsugi Porcelain Android Geisha',
  'image',
  'Hauntingly beautiful porcelain android geisha with cracked kintsugi gold seams on face, glowing crimson eyes, intricate cherry blossom floral cybernetic headdress, kimono woven with fiber optic threads, hyper-detailed portrait, cinematic soft lighting, award winning portrait photography.',
  'disfigured, bad anatomy, flat lighting, plastic face, messy lines',
  '3:4',
  'assets/images/geisha.jpg',
  'assets/images/geisha.jpg',
  'Midjourney v6.1',
  ARRAY['Portrait', 'Cyberpunk', 'Artistic'],
  'Perpaduan estetika tradisional Jepang dan masa depan: geisha porselen dengan retakan emas teknik kintsugi dan aksen optik.'
),
(
  'celestial-garden',
  'Celestial Floating Garden in Nebula Void',
  'image',
  'Ethereal surreal landscape of a glowing crystalline botanical garden floating in outer space near a violet cosmic nebula, stardust waterfalls flowing into the void, iridescent translucent flora, cinematic wide angle, dreamlike lighting, masterpiece.',
  'dull, dark, low contrast, pixelated, ugly terrain, chaotic noise',
  '16:9',
  'assets/images/nebula.jpg',
  'assets/images/nebula.jpg',
  'Midjourney v6',
  ARRAY['Surreal', 'Space', 'Landscape', 'Fantasy'],
  'Taman botani kristal kosmik yang melayang di angkasa dengan air terjun debu bintang mengalir menuju kehampaan galaksi.'
)
ON CONFLICT (id) DO NOTHING;
