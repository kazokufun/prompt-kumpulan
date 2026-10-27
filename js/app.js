/**
 * PROMPT STUDIO - STREAMING CINEMA BENTO DASHBOARD APPLICATION
 */

document.addEventListener('DOMContentLoaded', async () => {
  // App State
  let activeItemsList = [];
  let currentFilter = 'all'; // 'all' | 'video' | 'image'
  let activeTag = null;
  let searchQuery = '';
  let currentModalItem = null;
  let currentFilteredList = [];

  // Top Pick Carousel State
  const topPickIds = ['cyberpunk-samurai', 'dark-redemption', 'skycar-chase', 'crystal-jellyfish'];
  let currentTopPickIndex = 0;

  // DOM Elements - Main & Badges
  const galleryGrid = document.getElementById('galleryGrid');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const searchInput = document.getElementById('searchInput');
  const toastNotification = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');

  // Stats Elements
  const statTotalBadge = document.getElementById('statTotalBadge');
  const statVideosBadge = document.getElementById('statVideosBadge');
  const statImagesBadge = document.getElementById('statImagesBadge');

  // Database Status Badges
  const dbStatusBadge = document.getElementById('dbStatusBadge');
  const dbStatusDot = document.getElementById('dbStatusDot');
  const dbStatusText = document.getElementById('dbStatusText');

  // Sidebar Buttons
  const btnNavHome = document.getElementById('btnNavHome');
  const btnNavSearch = document.getElementById('btnNavSearch');
  const btnNavVideo = document.getElementById('btnNavVideo');
  const btnNavImage = document.getElementById('btnNavImage');
  const btnNavAddPrompt = document.getElementById('btnNavAddPrompt');
  const btnNavSupabase = document.getElementById('btnNavSupabase');
  const btnNavGuide = document.getElementById('btnNavGuide');

  // Hero & Bento Cards
  const btnHeroWatchNow = document.getElementById('btnHeroWatchNow');
  const browseItems = document.querySelectorAll('.browse-item');
  const btnExploreMore = document.getElementById('btnExploreMore');
  const btnResumeMecha = document.getElementById('btnResumeMecha');
  const btnPickPrev = document.getElementById('btnPickPrev');
  const btnPickNext = document.getElementById('btnPickNext');
  const btnTopPickWatch = document.getElementById('btnTopPickWatch');
  const watchlistToggle = document.getElementById('watchlistToggle');
  const cardTopPick = document.getElementById('cardTopPick');
  const topPickTitle = document.getElementById('topPickTitle');
  const topPickSub = document.getElementById('topPickSub');
  const btnCirclePlay = document.getElementById('btnCirclePlay');
  const circlePlayIcon = document.getElementById('circlePlayIcon');
  const autoplayToggle = document.getElementById('autoplayToggle');
  const btnNowPlayingFull = document.getElementById('btnNowPlayingFull');

  // Media Detail Lightbox Elements
  const mediaModal = document.getElementById('mediaModal');
  const modalMediaSide = document.getElementById('modalMediaSide');
  const modalTypeBadge = document.getElementById('modalTypeBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalPromptText = document.getElementById('modalPromptText');
  const modalNegativeBlock = document.getElementById('modalNegativeBlock');
  const modalNegativeText = document.getElementById('modalNegativeText');
  const modalAspectRatio = document.getElementById('modalAspectRatio');
  const modalModelWrap = document.getElementById('modalModelWrap');
  const modalModel = document.getElementById('modalModel');
  const modalTags = document.getElementById('modalTags');
  const btnModalCopy = document.getElementById('btnModalCopy');
  const btnModalDownload = document.getElementById('btnModalDownload');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalNavPrev = document.getElementById('modalNavPrev');
  const modalNavNext = document.getElementById('modalNavNext');

  // Guide Modal Elements
  const guideModal = document.getElementById('guideModal');
  const guideCloseBtn = document.getElementById('guideCloseBtn');

  // Supabase Settings Modal Elements
  const supabaseModal = document.getElementById('supabaseModal');
  const btnOpenSupabaseModal = document.getElementById('btnOpenSupabaseModal');
  const supabaseCloseBtn = document.getElementById('supabaseCloseBtn');
  const supabaseConfigForm = document.getElementById('supabaseConfigForm');
  const supabaseUrlInput = document.getElementById('supabaseUrlInput');
  const supabaseKeyInput = document.getElementById('supabaseKeyInput');
  const modalDbStatusDot = document.getElementById('modalDbStatusDot');
  const modalDbStatusTitle = document.getElementById('modalDbStatusTitle');
  const modalDbStatusSub = document.getElementById('modalDbStatusSub');
  const btnDisconnectSupabase = document.getElementById('btnDisconnectSupabase');

  // Add Prompt Modal Elements
  const addModal = document.getElementById('addModal');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const addModalCloseBtn = document.getElementById('addModalCloseBtn');
  const addPromptForm = document.getElementById('addPromptForm');

  let toastTimeout = null;
  let isPlayingAudioDemo = false;

  /* ==========================================================================
     INIT & DATA LOAD
     ========================================================================== */
  async function init() {
    await loadData();
    setupEventListeners();
    updateTopPickDisplay();
  }

  async function loadData() {
    if (typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
      try {
        setDatabaseStatus(true);
        const remotePrompts = await fetchPromptsFromSupabase();
        if (remotePrompts && remotePrompts.length > 0) {
          activeItemsList = remotePrompts;
        } else {
          activeItemsList = [...promptItems];
        }
      } catch (err) {
        console.warn("Gagal mengambil data dari Supabase, beralih ke data lokal:", err);
        setDatabaseStatus(false, "Supabase Offline");
        activeItemsList = [...promptItems];
      }
    } else {
      setDatabaseStatus(false);
      activeItemsList = [...promptItems];
    }

    renderStats();
    renderBrowseCategories();
    applyFilters();
  }

  function setDatabaseStatus(isConnected, customLabel = null) {
    if (isConnected) {
      dbStatusDot.classList.add('connected');
      dbStatusText.textContent = 'Supabase Cloud';
      modalDbStatusDot.classList.add('connected');
      modalDbStatusTitle.textContent = 'Terhubung ke Supabase Cloud';
      modalDbStatusSub.textContent = 'Data prompts dimuat langsung dari PostgreSQL database online.';
      btnDisconnectSupabase.style.display = 'block';
    } else {
      dbStatusDot.classList.remove('connected');
      dbStatusText.textContent = customLabel || 'Data Lokal';
      modalDbStatusDot.classList.remove('connected');
      modalDbStatusTitle.textContent = customLabel || 'Mode Data Lokal';
      modalDbStatusSub.textContent = 'Data dibaca dari file lokal (js/data.js).';
      btnDisconnectSupabase.style.display = 'none';
    }
  }

  /* ==========================================================================
     STATS & BROWSE CATEGORIES
     ========================================================================== */
  function renderStats() {
    const totalCount = activeItemsList.length;
    const videoCount = activeItemsList.filter(item => item.type === 'video').length;
    const imageCount = activeItemsList.filter(item => item.type === 'image').length;

    if (statTotalBadge) statTotalBadge.textContent = `${totalCount} Total Karya`;
    if (statVideosBadge) statVideosBadge.textContent = `${videoCount} Video AI`;
    if (statImagesBadge) statImagesBadge.textContent = `${imageCount} Gambar AI`;
  }

  function renderBrowseCategories() {
    const container = document.getElementById('browseListContainer');
    if (!container) return;

    // Gather tag counts and matching artwork thumbnail covers
    const tagCounts = {};
    const tagCovers = {};

    activeItemsList.forEach(item => {
      (item.tags || []).forEach(rawTag => {
        const tag = rawTag.trim();
        if (!tag) return;
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        if (!tagCovers[tag]) {
          tagCovers[tag] = item.thumbnailUrl || item.mediaUrl;
        }
      });
    });

    // Pick the top 4 most popular categories
    const sorted = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    if (sorted.length === 0) return;

    container.innerHTML = sorted.map(([tag, count]) => {
      const cover = tagCovers[tag] || 'assets/images/samurai.jpg';
      const isActive = activeTag && activeTag.toLowerCase() === tag.toLowerCase();
      return `
        <button type="button" class="browse-item ${isActive ? 'active' : ''}" data-category="${escapeHtml(tag)}">
          <div class="browse-item-left">
            <div class="browse-item-avatar">
              <img src="${cover}" alt="${escapeHtml(tag)}">
            </div>
            <div>
              <div class="browse-item-name">${escapeHtml(tag)}</div>
              <div class="browse-item-count">${count} karya</div>
            </div>
          </div>
          <span class="browse-chevron">&rsaquo;</span>
        </button>
      `;
    }).join('');

    // Attach click events
    container.querySelectorAll('.browse-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        if (activeTag && activeTag.toLowerCase() === category.toLowerCase()) {
          activeTag = null;
          container.querySelectorAll('.browse-item').forEach(b => b.classList.remove('active'));
          showToast('Filter kategori dinonaktifkan');
        } else {
          container.querySelectorAll('.browse-item').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeTag = category;
          showToast(`Kategori: ${category}`);
        }
        applyFilters();
        document.getElementById('gallerySection')?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ==========================================================================
     FILTERING & SEARCH
     ========================================================================== */
  function applyFilters() {
    currentFilteredList = activeItemsList.filter(item => {
      // Filter Type
      if (currentFilter !== 'all' && item.type !== currentFilter) {
        return false;
      }

      // Filter Category/Tag from Browse Card
      if (activeTag) {
        const queryTag = activeTag.toLowerCase();
        const matchesTag = item.tags && item.tags.some(t => t.toLowerCase() === queryTag || t.toLowerCase().includes(queryTag));
        const matchesTitle = item.title.toLowerCase().includes(queryTag);
        const matchesDesc = item.description ? item.description.toLowerCase().includes(queryTag) : false;
        if (!matchesTag && !matchesTitle && !matchesDesc) {
          return false;
        }
      }

      // Live Search Box
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(query);
        const inPrompt = item.prompt.toLowerCase().includes(query);
        const inDesc = item.description ? item.description.toLowerCase().includes(query) : false;
        const inTags = item.tags ? item.tags.some(t => t.toLowerCase().includes(query)) : false;
        const inModel = item.model ? item.model.toLowerCase().includes(query) : false;

        if (!inTitle && !inPrompt && !inDesc && !inTags && !inModel) {
          return false;
        }
      }

      return true;
    });

    // Update active category badge indicator in gallery header
    const activeCatBadge = document.getElementById('activeCategoryBadge');
    if (activeCatBadge) {
      if (activeTag) {
        activeCatBadge.style.display = 'inline-block';
        activeCatBadge.innerHTML = `
          <span class="badge-filter-active">
            Kategori: <strong>${escapeHtml(activeTag)}</strong>
            <button type="button" class="btn-clear-filter" id="btnClearActiveCat" title="Hapus filter kategori">&times;</button>
          </span>
        `;
        document.getElementById('btnClearActiveCat')?.addEventListener('click', (e) => {
          e.stopPropagation();
          activeTag = null;
          document.querySelectorAll('.browse-item').forEach(b => b.classList.remove('active'));
          applyFilters();
          showToast('Filter kategori dinonaktifkan');
        });
      } else {
        activeCatBadge.style.display = 'none';
        activeCatBadge.innerHTML = '';
      }
    }

    renderCards(currentFilteredList);
  }

  /* ==========================================================================
     RENDER GALLERY CARDS
     ========================================================================== */
  function renderCards(items) {
    if (items.length === 0) {
      galleryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1);">
          <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Tidak Ada Karya Ditemukan</h3>
          <p style="color: var(--text-dim); margin-bottom: 16px; font-size: 0.9rem;">Coba pilih kategori lain atau reset pencarian.</p>
          <button type="button" class="btn-watch-now" id="btnResetFilterInside">Reset Semua Filter</button>
        </div>
      `;

      document.getElementById('btnResetFilterInside')?.addEventListener('click', () => {
        resetAllFilters();
      });
      return;
    }

    galleryGrid.innerHTML = items.map(item => {
      const isVideo = item.type === 'video';
      const badgeClass = isVideo ? 'badge-video' : 'badge-image';
      const badgeIcon = isVideo
        ? `<svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
        : `<svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
      const badgeLabel = isVideo ? 'Video AI' : 'Image AI';

      return `
        <article class="showcase-card" data-id="${item.id}">
          <div class="card-media-wrapper">
            <div class="card-badges">
              <span class="media-type-badge ${badgeClass}">
                ${badgeIcon}
                ${badgeLabel}
              </span>
              <span class="aspect-badge">${item.aspectRatio || '16:9'}</span>
            </div>

            ${isVideo ? `
              <video 
                src="${item.mediaUrl}" 
                poster="${item.thumbnailUrl}"
                muted 
                loop 
                playsinline 
                preload="metadata"
                class="card-video-element"
              ></video>
            ` : `
              <img 
                src="${item.thumbnailUrl || item.mediaUrl}" 
                alt="${escapeHtml(item.title)}" 
                loading="lazy"
              />
            `}
          </div>

          <div class="card-content">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            
            <div class="card-prompt-preview">
              <p class="prompt-text-clamped">"${escapeHtml(item.prompt)}"</p>
            </div>

            <div class="card-footer">
              <span style="font-size: 0.7rem; color: var(--text-dim); font-family: var(--font-mono);">
                ${item.model || '#AI-Art'}
              </span>

              <button class="btn-card-copy" data-prompt="${escapeHtml(item.prompt)}" title="Salin Prompt">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <span>Salin</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    attachCardInteractions();
  }

  function attachCardInteractions() {
    const cards = galleryGrid.querySelectorAll('.showcase-card');

    cards.forEach(card => {
      const id = card.getAttribute('data-id');
      const video = card.querySelector('.card-video-element');
      const copyBtn = card.querySelector('.btn-card-copy');

      if (video) {
        card.addEventListener('mouseenter', () => {
          video.play().catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0;
        });
      }

      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const promptText = copyBtn.getAttribute('data-prompt');
          copyToClipboard(promptText, copyBtn);
        });
      }

      card.addEventListener('click', () => {
        openModal(id);
      });
    });
  }

  /* ==========================================================================
     LIGHTBOX / DETAIL MODAL
     ========================================================================== */
  function openModal(id) {
    const item = activeItemsList.find(p => p.id === id);
    if (!item) return;

    currentModalItem = item;

    if (item.type === 'video') {
      modalMediaSide.innerHTML = `
        <video 
          src="${item.mediaUrl}" 
          poster="${item.thumbnailUrl}"
          controls 
          autoplay 
          loop 
          playsinline 
          style="width: 100%; height: auto; max-height: 80vh;"
        ></video>
      `;
    } else {
      modalMediaSide.innerHTML = `
        <img 
          src="${item.mediaUrl}" 
          alt="${escapeHtml(item.title)}" 
          style="width: 100%; height: auto; max-height: 80vh; object-fit: contain;"
        />
      `;
    }

    if (item.type === 'video') {
      modalTypeBadge.className = 'media-type-badge badge-video';
      modalTypeBadge.innerHTML = `
        <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <span>Text to Video</span>
      `;
    } else {
      modalTypeBadge.className = 'media-type-badge badge-image';
      modalTypeBadge.innerHTML = `
        <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
        <span>Text to Image</span>
      `;
    }

    modalTitle.textContent = item.title;
    modalDesc.textContent = item.description || 'Karya visual AI berkualitas tinggi.';
    modalPromptText.textContent = item.prompt;

    if (item.negativePrompt) {
      modalNegativeBlock.style.display = 'block';
      modalNegativeText.textContent = item.negativePrompt;
    } else {
      modalNegativeBlock.style.display = 'none';
    }

    modalAspectRatio.textContent = item.aspectRatio || '16:9';

    if (item.model) {
      modalModelWrap.style.display = 'block';
      modalModel.textContent = item.model;
    } else {
      modalModelWrap.style.display = 'none';
    }

    modalTags.innerHTML = (item.tags || []).map(t => `<span class="meta-pill" style="font-size: 0.7rem;">#${t}</span>`).join(' ');

    btnModalCopy.onclick = () => {
      copyToClipboard(item.prompt, btnModalCopy);
    };

    if (btnModalDownload) {
      btnModalDownload.onclick = () => {
        const ext = item.type === 'video' ? 'mp4' : 'jpg';
        const filename = `${item.id || 'prompt-karya'}.${ext}`;
        downloadMedia(item.mediaUrl, filename);
      };
    }

    mediaModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    mediaModal.classList.remove('active');
    document.body.style.overflow = '';

    const video = modalMediaSide.querySelector('video');
    if (video) video.pause();
    modalMediaSide.innerHTML = '';
    currentModalItem = null;
  }

  function navigateModal(direction) {
    if (!currentModalItem || currentFilteredList.length === 0) return;

    const currentIndex = currentFilteredList.findIndex(i => i.id === currentModalItem.id);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = currentFilteredList.length - 1;
    if (nextIndex >= currentFilteredList.length) nextIndex = 0;

    openModal(currentFilteredList[nextIndex].id);
  }

  /* ==========================================================================
     TOP PICK CAROUSEL CONTROLS
     ========================================================================== */
  function updateTopPickDisplay() {
    const pickId = topPickIds[currentTopPickIndex];
    const pickItem = activeItemsList.find(i => i.id === pickId);
    if (!pickItem) return;

    const img = cardTopPick.querySelector('.bento-bg-media');
    if (img) img.src = pickItem.thumbnailUrl || pickItem.mediaUrl;
    if (topPickTitle) topPickTitle.textContent = pickItem.title.split(':')[0].substring(0, 24);
    if (topPickSub) topPickSub.textContent = (pickItem.tags && pickItem.tags[0] ? pickItem.tags[0] : 'Cinematic') + ' • 2026';
  }

  /* ==========================================================================
     RESET FILTERS HELPER
     ========================================================================== */
  function resetAllFilters() {
    currentFilter = 'all';
    activeTag = null;
    searchQuery = '';
    searchInput.value = '';

    filterTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-filter') === 'all'));
    document.querySelectorAll('.browse-item').forEach(b => b.classList.remove('active'));

    applyFilters();
  }

  /* ==========================================================================
     CLIPBOARD & TOAST
     ========================================================================== */
  function copyToClipboard(text, btnElement) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Prompt berhasil disalin ke clipboard!');
        triggerBtnFeedback(btnElement);
      }).catch(() => fallbackCopyText(text));
    } else {
      fallbackCopyText(text);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Prompt berhasil disalin!');
    } catch (err) {
      alert('Gagal menyalin prompt.');
    }
    document.body.removeChild(textArea);
  }

  async function downloadMedia(url, filename) {
    if (!url) {
      showToast('URL media tidak ditemukan');
      return;
    }

    showToast('Memulai download media...');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || url.split('/').pop() || 'media';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast('Media berhasil diunduh!');
    } catch (err) {
      // Fallback untuk cross-origin link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || url.split('/').pop() || 'media';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Membuka file untuk diunduh...');
    }
  }

  function triggerBtnFeedback(btn) {
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span>Tersalin!</span>`;
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 1800);
  }

  function showToast(message) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastText.textContent = message;
    toastNotification.classList.add('show');

    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  /* ==========================================================================
     EVENT LISTENERS
     ========================================================================== */
  function setupEventListeners() {
    // 1. Sidebar Nav
    btnNavHome?.addEventListener('click', () => {
      resetAllFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btnNavSearch?.addEventListener('click', () => {
      document.getElementById('gallerySection')?.scrollIntoView({ behavior: 'smooth' });
      searchInput?.focus();
    });

    btnNavVideo?.addEventListener('click', () => {
      currentFilter = 'video';
      filterTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-filter') === 'video'));
      applyFilters();
      document.getElementById('gallerySection')?.scrollIntoView({ behavior: 'smooth' });
    });

    btnNavImage?.addEventListener('click', () => {
      currentFilter = 'image';
      filterTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-filter') === 'image'));
      applyFilters();
      document.getElementById('gallerySection')?.scrollIntoView({ behavior: 'smooth' });
    });

    btnNavAddPrompt?.addEventListener('click', () => {
      addPromptForm.reset();
      addModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    btnNavSupabase?.addEventListener('click', () => {
      const creds = getSupabaseCredentials();
      supabaseUrlInput.value = creds.url;
      supabaseKeyInput.value = creds.key;
      supabaseModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    btnNavGuide?.addEventListener('click', () => {
      guideModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // 2. Hero Watch Now button
    btnHeroWatchNow?.addEventListener('click', () => {
      openModal('dark-redemption');
    });

    // 3. Browse Explore More Button
    btnExploreMore?.addEventListener('click', () => {
      resetAllFilters();
      showToast('Menampilkan semua karya');
      document.getElementById('gallerySection')?.scrollIntoView({ behavior: 'smooth' });
    });

    // 4. Continue Watching
    btnResumeMecha?.addEventListener('click', () => {
      openModal('mecha-titan');
    });

    // 5. Top Pick Carousel
    btnPickPrev?.addEventListener('click', () => {
      currentTopPickIndex = (currentTopPickIndex - 1 + topPickIds.length) % topPickIds.length;
      updateTopPickDisplay();
    });

    btnPickNext?.addEventListener('click', () => {
      currentTopPickIndex = (currentTopPickIndex + 1) % topPickIds.length;
      updateTopPickDisplay();
    });

    btnTopPickWatch?.addEventListener('click', () => {
      openModal(topPickIds[currentTopPickIndex]);
    });

    watchlistToggle?.addEventListener('click', () => {
      watchlistToggle.classList.toggle('active');
      const isActive = watchlistToggle.classList.contains('active');
      showToast(isActive ? 'Ditambahkan ke Watchlist' : 'Dihapus dari Watchlist');
    });

    // 6. Now Playing Controls
    btnCirclePlay?.addEventListener('click', () => {
      isPlayingAudioDemo = !isPlayingAudioDemo;
      if (isPlayingAudioDemo) {
        circlePlayIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
        showToast('Memutar cuplikan sinematik...');
      } else {
        circlePlayIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
        showToast('Jeda cuplikan');
      }
    });

    autoplayToggle?.addEventListener('click', () => {
      autoplayToggle.classList.toggle('active');
    });

    btnNowPlayingFull?.addEventListener('click', () => {
      openModal('kintsugi-geisha');
    });

    // 7. Filter Tabs in Gallery
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.getAttribute('data-filter');
        applyFilters();
      });
    });

    // 8. Search Input
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      applyFilters();
    });

    // 9. Modals Open / Close
    document.getElementById('btnOpenAddModal')?.addEventListener('click', () => {
      addPromptForm.reset();
      addModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    document.getElementById('btnOpenSupabaseModal')?.addEventListener('click', () => {
      const creds = getSupabaseCredentials();
      supabaseUrlInput.value = creds.url;
      supabaseKeyInput.value = creds.key;
      supabaseModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    dbStatusBadge?.addEventListener('click', () => {
      const creds = getSupabaseCredentials();
      supabaseUrlInput.value = creds.url;
      supabaseKeyInput.value = creds.key;
      supabaseModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    modalCloseBtn?.addEventListener('click', closeModal);
    mediaModal?.addEventListener('click', (e) => {
      if (e.target === mediaModal) closeModal();
    });
    modalNavPrev?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateModal(-1);
    });
    modalNavNext?.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateModal(1);
    });

    supabaseCloseBtn?.addEventListener('click', () => {
      supabaseModal.classList.remove('active');
      document.body.style.overflow = '';
    });
    supabaseModal?.addEventListener('click', (e) => {
      if (e.target === supabaseModal) {
        supabaseModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    addModalCloseBtn?.addEventListener('click', () => {
      addModal.classList.remove('active');
      document.body.style.overflow = '';
    });
    addModal?.addEventListener('click', (e) => {
      if (e.target === addModal) {
        addModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    guideCloseBtn?.addEventListener('click', () => {
      guideModal.classList.remove('active');
      document.body.style.overflow = '';
    });
    guideModal?.addEventListener('click', (e) => {
      if (e.target === guideModal) {
        guideModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Disconnect Supabase
    btnDisconnectSupabase?.addEventListener('click', () => {
      resetSupabaseCredentials();
      loadData();
      showToast('Koneksi Supabase diputuskan. Menggunakan data lokal.');
      supabaseModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Supabase Form Submit
    supabaseConfigForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = supabaseUrlInput.value.trim();
      const key = supabaseKeyInput.value.trim();

      saveSupabaseCredentials(url, key);
      showToast('Menghubungkan ke Supabase...');

      try {
        const remotePrompts = await fetchPromptsFromSupabase();
        setDatabaseStatus(true);
        if (remotePrompts && remotePrompts.length > 0) {
          activeItemsList = remotePrompts;
        }
        renderStats();
        applyFilters();
        showToast('Berhasil terhubung ke Supabase Database!');
        supabaseModal.classList.remove('active');
        document.body.style.overflow = '';
      } catch (err) {
        console.error("Supabase error:", err);
        alert("Gagal terhubung ke Supabase: " + err.message);
      }
    });

    // Add Prompt Form Submit
    addPromptForm?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rawTags = document.getElementById('newTags').value.trim();
      const tagsArray = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : [];

      const newItem = {
        id: 'prompt-' + Date.now(),
        title: document.getElementById('newTitle').value.trim(),
        type: document.getElementById('newType').value,
        prompt: document.getElementById('newPrompt').value.trim(),
        negativePrompt: document.getElementById('newNegativePrompt').value.trim(),
        aspectRatio: document.getElementById('newAspectRatio').value,
        mediaUrl: document.getElementById('newMediaUrl').value.trim(),
        thumbnailUrl: document.getElementById('newThumbnailUrl').value.trim() || document.getElementById('newMediaUrl').value.trim(),
        model: document.getElementById('newModel').value.trim(),
        tags: tagsArray,
        description: document.getElementById('newDesc').value.trim(),
        date: new Date().toISOString().split('T')[0]
      };

      if (typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
        try {
          showToast('Menyimpan ke Supabase...');
          await insertPromptToSupabase(newItem);
          activeItemsList.unshift(newItem);
          renderStats();
          renderBrowseCategories();
          applyFilters();
          showToast('Karya berhasil disimpan ke database Supabase!');
          addModal.classList.remove('active');
          document.body.style.overflow = '';
        } catch (err) {
          alert("Gagal menyimpan ke Supabase: " + err.message);
        }
      } else {
        activeItemsList.unshift(newItem);
        renderStats();
        renderBrowseCategories();
        applyFilters();
        showToast('Karya ditambahkan ke tampilan lokal!');
        addModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        supabaseModal?.classList.remove('active');
        addModal?.classList.remove('active');
        guideModal?.classList.remove('active');
        document.body.style.overflow = '';
      }

      if (mediaModal.classList.contains('active')) {
        if (e.key === 'ArrowLeft') navigateModal(-1);
        if (e.key === 'ArrowRight') navigateModal(1);
      }

      if (e.key === '/' && document.activeElement !== searchInput && !document.querySelector('.modal-overlay.active')) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app
  init();
});
