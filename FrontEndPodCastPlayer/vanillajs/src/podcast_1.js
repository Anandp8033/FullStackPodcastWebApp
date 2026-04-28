// ==========================================
// Podcast Landing Page - Main Script
// ==========================================

let allEpisodes = [];
let filteredEpisodes = [];
let currentPage = 1;
const episodesPerPage = 7;
let player = null;
let currentEpisode = null;
let selectedLanguage = 'en';
let subtitlesOpen = false;

function initializeHeroSection() {

  console.log("Initializing hero section with first episode:", allEpisodes[0]);

  if (allEpisodes.length === 0) return;

  
  
  const firstEpisode = allEpisodes[0];
  const heroTitle = document.getElementById('hero-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const heroPlayBtn = document.getElementById('hero-play-btn');
  
  if (heroTitle) heroTitle.textContent = firstEpisode.title;
  if (heroSubtitle) heroSubtitle.textContent = `${firstEpisode.subtitle || ''} • Ep. ${String(firstEpisode.episodeNumber).padStart(2, '0')}`;
  
  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', function (event) {
      event.preventDefault();
      loadEpisode(firstEpisode);
    });
  }
}


// ==========================================
// Search Functionality
// ==========================================
function initializeSearch() {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  if (searchBtn) {
    searchBtn.addEventListener('click', function (event) {
      event.preventDefault();
      if (searchInput.style.display === 'none' || searchInput.style.display === '') {
        searchInput.style.display = 'block';
        searchInput.focus();
      } else {
        searchInput.style.display = 'none';
        searchInput.value = '';
        filterEpisodes('');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', function () {
      filterEpisodes(this.value.toLowerCase());
    });
  }
}

function getCurrentPageEpisodes() {
  const start = (currentPage - 1) * episodesPerPage;
  return filteredEpisodes.slice(start, start + episodesPerPage);
}

function updatePaginationControls() {
  const prevBtn = document.getElementById('pagination-prev');
  const nextBtn = document.getElementById('pagination-next');
  const pageInfo = document.getElementById('page-info');
  const paginationDots = document.getElementById('pagination-dots');
  const totalPages = Math.max(1, Math.ceil(filteredEpisodes.length / episodesPerPage));

  if (pageInfo) {
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
  }

  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    prevBtn.style.display = totalPages > 1 ? '' : 'none';
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.style.display = totalPages > 1 ? '' : 'none';
  }

  if (paginationDots) {
    if (totalPages > 1) {
      paginationDots.style.display = 'flex';
      paginationDots.innerHTML = Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1;
        const isActive = pageNumber === currentPage;
        return `<span class="${isActive ? 'bg-teal' : 'bg-white opacity-20'}" style="width:8px;height:8px;border-radius:50%;display:inline-block"></span>`;
      }).join('');
    } else {
      paginationDots.style.display = 'none';
    }
  }
}

function goToPage(page) {
  const totalPages = Math.max(1, Math.ceil(filteredEpisodes.length / episodesPerPage));
  currentPage = Math.max(1, Math.min(page, totalPages));
  renderEpisodeCards(getCurrentPageEpisodes());
  updatePaginationControls();
}

function filterEpisodes(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    filteredEpisodes = [...allEpisodes];
  } else {
    filteredEpisodes = allEpisodes.filter(ep => {
      const title = ep.title.toLowerCase();
      const subtitle = (ep.subtitle || '').toLowerCase();
      const episodeNumber = String(ep.episodeNumber).padStart(2, '0');

      return (
        title.includes(normalizedQuery) ||
        subtitle.includes(normalizedQuery) ||
        episodeNumber.includes(normalizedQuery) ||
        (`episode ${episodeNumber}`).includes(normalizedQuery)
      );
    });
  }

  currentPage = 1;
  renderEpisodeCards(getCurrentPageEpisodes());
  updatePaginationControls();
}

function initializePagination() {
  const prevBtn = document.getElementById('pagination-prev');
  const nextBtn = document.getElementById('pagination-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', function (event) {
      event.preventDefault();
      goToPage(currentPage - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function (event) {
      event.preventDefault();
      goToPage(currentPage + 1);
    });
  }
}

// ==========================================
// Plyr and Player Logic
// ==========================================
function initializePlyr() {
  const audioElement = document.getElementById('audio-player');
  const PlyrClass = typeof Plyr !== 'undefined' ? Plyr : window.Plyr;

  if (!audioElement || typeof PlyrClass === 'undefined') {
    console.error('Plyr initialization failed:', {
      audioElement: !!audioElement,
      PlyrType: typeof Plyr,
      windowPlyrType: typeof window.Plyr,
    });
    return;
  }

  player = new PlyrClass(audioElement, {
    controls: [],
    captions: { active: true, update: true, language: selectedLanguage },
  });

  player.on('play', () => setFooterPlayState(true));
  player.on('pause', () => setFooterPlayState(false));
  player.on('timeupdate', () => {
    updateProgressFill();
    updateFooterTimeLabels();
  });
  player.on('loadedmetadata', () => {
    if (!currentEpisode) return;
    setCaptionLanguage(selectedLanguage);
    attachCueListeners();
    updateFooterTimeLabels();
  });
}

function loadEpisode(ep) {
  if (!player) {
    initializePlyr();
  }

  currentEpisode = ep;
  console.log("Loading episode:", ep);
  selectedLanguage = selectedLanguage || 'en';
  updateFooterEpisodeInfo(ep);
  updateLanguageMenuSelection();
  setSubtitleText('Loading subtitles...');

  if (!player) {
    console.error('Plyr player failed to initialize.');
    return;
  }

  player.source = {
    type: 'audio',
    title: ep.title,
    sources: [
      {
        src: ep.audioSrc,
        type: 'audio/mp3',
      },
    ],
    tracks: Object.entries(ep.subtitles || {}).map(([lang, src]) => ({
      kind: 'captions',
      label: lang.toUpperCase(),
      srclang: lang,
      src,
      default: lang === 'en',
    })),
  };

  if (subtitlesOpen) {
    toggleSubtitles(true);
  }

  player.play().catch(() => {
    setFooterPlayState(false);
  });
}

function updateFooterEpisodeInfo(ep) {
  const cover = document.getElementById('player-cover');
  const title = document.getElementById('player-title');
  const show = document.getElementById('player-show');
  const episodeLabel = document.getElementById('player-episode');

  if (cover) {
    cover.src = ep.image;
    cover.alt = ep.title;
  }
  if (title) {
    title.textContent = ep.title;
  }
  if (show) {
    show.textContent = ep.subtitle || ep.title || 'Unknown show';
  }
  if (episodeLabel) {
    episodeLabel.textContent = `Ep. ${String(ep.episodeNumber).padStart(2, '0')} • ${ep.date || 'Unknown'}`;
  }
}

function updateFooterTimeLabels() {
  const currentLabel = document.getElementById('current-time-label');
  const durationLabel = document.getElementById('duration-time-label');
  const currentTime = player?.currentTime || 0;
  const duration = player?.duration || 0;

  if (currentLabel) {
    currentLabel.textContent = formatTimeLabel(currentTime);
  }
  if (durationLabel) {
    durationLabel.textContent = duration > 0 ? formatTimeLabel(duration) : '00:00';
  }
}

function formatTimeLabel(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateProgressFill() {
  const progressFill = document.querySelector('.progress-fill');
  if (!progressFill || !player || !player.duration) return;
  const percent = (player.currentTime / player.duration) * 100;
  progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}

function seekAudio(event) {
  const progressBar = document.querySelector('.progress-bar-custom');
  if (!progressBar || !player || !player.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percent = Math.min(1, Math.max(0, clickX / rect.width));
  player.currentTime = percent * player.duration;
  updateProgressFill();
  updateFooterTimeLabels();
}

function initializeSeekBar() {
  const progressBar = document.querySelector('.progress-bar-custom');
  if (!progressBar || !player) return;

  progressBar.style.cursor = 'pointer';
  let isDragging = false;

  progressBar.addEventListener('click', seekAudio);

  progressBar.addEventListener('pointerdown', function (event) {
    isDragging = true;
    progressBar.setPointerCapture(event.pointerId);
    seekAudio(event);
  });

  progressBar.addEventListener('pointermove', function (event) {
    if (!isDragging) return;
    seekAudio(event);
  });

  progressBar.addEventListener('pointerup', function (event) {
    isDragging = false;
    progressBar.releasePointerCapture?.(event.pointerId);
  });

  progressBar.addEventListener('pointerleave', function (event) {
    if (!isDragging) return;
    isDragging = false;
    progressBar.releasePointerCapture?.(event.pointerId);
  });
}

function setFooterPlayState(isPlaying) {
  const playPauseIcon = document.querySelector('footer.player-bar .btn-teal .material-symbols-outlined');
  if (!playPauseIcon) return;
  playPauseIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
}

function setCaptionLanguage(lang) {
  selectedLanguage = lang;
  if (!player?.media?.textTracks) return;

  Array.from(player.media.textTracks).forEach(track => {
    track.mode = track.language === lang ? 'showing' : 'disabled';
  });

  updateLanguageMenuSelection();
  updateSubtitleText();
}

function attachCueListeners() {
  if (!player?.media?.textTracks) return;
  Array.from(player.media.textTracks).forEach(track => {
    track.oncuechange = updateSubtitleText;
  });
}

function updateSubtitleText() {
  const activeTrack = Array.from(player?.media?.textTracks || []).find(track => track.mode === 'showing');
  const subtitleText = activeTrack?.activeCues?.length ?
    Array.from(activeTrack.activeCues).map(cue => cue.text).join(' ') :
    'Subtitles are ready. Play the episode to view text.';
  setSubtitleText(subtitleText);
}

function setSubtitleText(text) {
  const container = document.querySelector('#subtitles-container p');
  if (container) {
    container.textContent = text;
  }
}

function toggleSubtitles(forceOpen) {
  const subtitlesBtn = document.getElementById('subtitles-btn');
  const subtitlesContainer = document.getElementById('subtitles-container');

  subtitlesOpen = typeof forceOpen === 'boolean' ? forceOpen : !subtitlesOpen;
  if (subtitlesContainer) {
    subtitlesContainer.style.display = subtitlesOpen ? '' : 'none';
  }

  if (subtitlesBtn) {
    subtitlesBtn.classList.toggle('active', subtitlesOpen);
  }

  if (!player?.media?.textTracks) return;

  if (subtitlesOpen) {
    setCaptionLanguage(selectedLanguage);
  } else {
    Array.from(player.media.textTracks).forEach(track => {
      track.mode = 'disabled';
    });
  }
}

function initializeEpisodeCards() {
  const playButtons = document.querySelectorAll('.episode-card .play-btn');

  playButtons.forEach(button => {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      const audioSrc = this.dataset.audio;
      const ep = allEpisodes.find(item => item.audioSrc === audioSrc);
      if (ep) {
        loadEpisode(ep);
      }
    });
  });
}

function updateLanguageMenuSelection() {
  const label = document.getElementById('language-btn-label');
  if (label) {
    label.textContent = selectedLanguage.toUpperCase();
  }

  document.querySelectorAll('.lang-option').forEach(option => {
    const isSelected = option.dataset.lang === selectedLanguage;
    option.style.opacity = isSelected ? '1' : '0.65';
    option.style.fontWeight = isSelected ? '700' : '400';
  });
}

function initializeSubtitles() {
  const subtitlesBtn = document.getElementById('subtitles-btn');
  if (!subtitlesBtn) return;

  subtitlesBtn.addEventListener('click', function () {
    toggleSubtitles();
  });
}

function initializePlayerControls() {
  const audioControlButtons = document.querySelectorAll('.material-symbols-outlined');

  audioControlButtons.forEach(icon => {
    const button = icon.closest('button');
    if (!button) return;

    if (icon.textContent === 'skip_previous') {
      button.addEventListener('click', function () {
        playAdjacentEpisode(-1);
      });
    }

    if (icon.textContent === 'skip_next') {
      button.addEventListener('click', function () {
        playAdjacentEpisode(1);
      });
    }

    if (icon.textContent.trim() === 'pause' && button.classList.contains('btn-teal')) {
      button.addEventListener('click', function () {
        if (!player) return;
        if (player.playing) {
          player.pause();
        } else {
          player.play();
        }
      });
    }
  });
}

function playAdjacentEpisode(direction) {
  if (!currentEpisode) return;
  const currentIndex = allEpisodes.findIndex(ep => ep.audioSrc === currentEpisode.audioSrc);
  const nextIndex = currentIndex + direction;
  if (nextIndex >= 0 && nextIndex < allEpisodes.length) {
    loadEpisode(allEpisodes[nextIndex]);
    goToPage(Math.floor(nextIndex / episodesPerPage) + 1);
  }
}

function initializeCarousel() {
  const chevronButtons = document.querySelectorAll('button .material-symbols-outlined');
  chevronButtons.forEach(icon => {
    const button = icon.closest('button');
    if (!button || button.dataset.pagination === 'true') return;

    if (icon.textContent === 'chevron_left') {
      button.addEventListener('click', function () {
        playAdjacentEpisode(-1);
      });
    }

    if (icon.textContent === 'chevron_right') {
      button.addEventListener('click', function () {
        playAdjacentEpisode(1);
      });
    }
  });
}

async function loadEpisodes() {
  try {
    const response = await fetch('episodes.json');
    const episodes = await response.json();
    allEpisodes = Array.isArray(episodes) ? episodes : [];
    filteredEpisodes = [...allEpisodes];
    currentPage = 1;
    initializePlyr();
    initializeAudioSettings();
    initializeSeekBar();
    renderEpisodeCards(getCurrentPageEpisodes());
    updatePaginationControls();
    if (allEpisodes.length > 0) {
      loadEpisode(allEpisodes[0]);
      initializeHeroSection();
    }
  } catch (error) {
    console.error('Failed to load episodes.json', error);
  }
}

function renderEpisodeCards(episodes) {
  const container = document.querySelector('.episode-list');
  if (!container) return;

  if (!episodes || episodes.length === 0) {
    container.innerHTML = '<div class="text-white opacity-60 small">No episodes found.</div>';
    return;
  }

  container.innerHTML = episodes.map(ep => `
    <div class="episode-card p-2 d-flex align-items-center gap-2" data-audio="${ep.audioSrc}">
      <div class="episode-img-container">
        <img alt="${ep.title}" src="${ep.image}" />
      </div>
      <div class="flex-grow-1 overflow-hidden">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <div>
            <span class="d-block text-teal fw-bold text-uppercase letter-spacing-tighter lh-1" style="font-size: 9px">
              Episode ${String(ep.episodeNumber).padStart(2, '0')}
            </span>
          </div>
          <span class="text-white opacity-40 fw-medium" style="font-size: 9px">${ep.date}</span>
        </div>
        <h4 class="text-white fw-bold mb-2 clamped-1" style="font-size: 14px">${ep.title}</h4>
        <p class="text-silver opacity-60 small mb-2">${ep.subtitle || ''}</p>
        <div class="d-flex align-items-center gap-2">
          <span class="episode-duration text-white opacity-40 d-flex align-items-center gap-1 font-medium" style="font-size: 10px">
            <span class="material-symbols-outlined" style="font-size: 14px">timer</span>
            <span class="duration-text" data-audio="${ep.audioSrc}">Loading...</span>
          </span>
          <button class="btn btn-link p-0 text-teal fw-bold d-flex align-items-center gap-2 text-decoration-none play-btn"
            style="font-size: 10px"
            data-audio="${ep.audioSrc}">
            <div class="text-start">
              <span class="d-block lh-1 text-uppercase">PLAY</span>
            </div>
            <span class="material-symbols-outlined" style="font-size: 16px">play_circle</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.duration-text').forEach(span => {
    const audioSrc = span.dataset.audio;
    const ep = allEpisodes.find(item => item.audioSrc === audioSrc);
    if (ep) loadAudioDuration(ep, span);
  });

  initializeEpisodeCards();
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function loadAudioDuration(ep, durationEl) {
  const audio = new Audio();
  audio.preload = 'metadata';

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatDuration(audio.duration);
  });

  audio.addEventListener('error', () => {
    durationEl.textContent = ep.duration || '--';
  });

  audio.src = ep.audioSrc;
}

function initializeSubtitles() {
  const subtitlesBtn = document.getElementById('subtitles-btn');
  if (!subtitlesBtn) return;

  subtitlesBtn.addEventListener('click', function () {
    toggleSubtitles();
  });
}

function initializeLanguageSwitcher() {
  // Legacy placeholder for old button logic. The language dropdown is used instead.
}

function initializePlayerControls() {
  const audioControlButtons = document.querySelectorAll('.material-symbols-outlined');

  audioControlButtons.forEach(icon => {
    const button = icon.closest('button');
    if (!button) return;

    if (icon.textContent === 'skip_previous') {
      button.addEventListener('click', function () {
        playAdjacentEpisode(-1);
      });
    }

    if (icon.textContent === 'skip_next') {
      button.addEventListener('click', function () {
        playAdjacentEpisode(1);
      });
    }

    if (icon.textContent.trim() === 'pause' && button.classList.contains('btn-teal')) {
      button.addEventListener('click', function () {
        if (!player) return;
        if (player.playing) {
          player.pause();
        } else {
          player.play();
        }
      });
    }
  });
}

function updateVolumeButtonIcon(volume) {
  const volumeIcon = document.querySelector('#volume-btn .material-symbols-outlined');
  if (!volumeIcon) return;

  if (player?.muted || volume === 0) {
    volumeIcon.textContent = 'volume_off';
  } else if (volume <= 0.5) {
    volumeIcon.textContent = 'volume_down';
  } else {
    volumeIcon.textContent = 'volume_up';
  }
}

function setPlayerVolume(volume) {
  if (!player) return;
  player.volume = volume;
  if (player.muted && volume > 0) {
    player.muted = false;
  }
  updateVolumeButtonIcon(volume);
}

function toggleMute() {
  if (!player) return;
  player.muted = !player.muted;
  const effectiveVolume = player.muted ? 0 : player.volume;
  updateVolumeButtonIcon(effectiveVolume);
  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider) {
    volumeSlider.value = player.muted ? 0 : player.volume;
  }
}

function setPlaybackSpeed(speed) {
  if (!player) return;
  player.speed = speed;
  const speedBtnLabel = document.getElementById('speed-btn-label');
  if (speedBtnLabel) {
    speedBtnLabel.textContent = `${speed}x`;
  }
  document.querySelectorAll('#speed-menu .speed-option').forEach(button => {
    button.classList.toggle('active', parseFloat(button.dataset.speed) === speed);
    button.classList.toggle('text-teal', parseFloat(button.dataset.speed) === speed);
    button.classList.toggle('text-white', parseFloat(button.dataset.speed) !== speed);
  });
}

function initializeAudioSettings() {
  const volumeBtn = document.getElementById('volume-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const speedBtn = document.getElementById('speed-btn');
  const speedMenu = document.getElementById('speed-menu');
  const speedOptions = document.querySelectorAll('#speed-menu .speed-option');

  if (!player) return;

  if (volumeSlider) {
    volumeSlider.value = player.volume ?? 1;
    volumeSlider.addEventListener('input', function () {
      const volume = parseFloat(this.value);
      setPlayerVolume(volume);
    });
  }

  if (volumeBtn) {
    volumeBtn.addEventListener('click', function () {
      toggleMute();
    });
  }

  if (speedBtn && speedMenu) {
    speedBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      speedMenu.classList.toggle('d-none');
      const expanded = speedMenu.classList.contains('d-none') ? 'false' : 'true';
      speedBtn.setAttribute('aria-expanded', expanded);
    });
  }

  speedOptions.forEach(option => {
    option.addEventListener('click', function () {
      const speed = parseFloat(this.dataset.speed);
      setPlaybackSpeed(speed);
      if (speedMenu) {
        speedMenu.classList.add('d-none');
      }
      if (speedBtn) {
        speedBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!speedMenu || !speedBtn) return;
    const target = event.target;
    if (!speedBtn.contains(target) && !speedMenu.contains(target)) {
      speedMenu.classList.add('d-none');
      speedBtn.setAttribute('aria-expanded', 'false');
    }
  });

  updateVolumeButtonIcon(player.volume ?? 1);
  setPlaybackSpeed(player.speed ?? 1);
}

function playAdjacentEpisode(direction) {
  if (!currentEpisode) return;
  const currentIndex = allEpisodes.findIndex(ep => ep.audioSrc === currentEpisode.audioSrc);
  const nextIndex = currentIndex + direction;
  if (nextIndex >= 0 && nextIndex < allEpisodes.length) {
    loadEpisode(allEpisodes[nextIndex]);
    goToPage(Math.floor(nextIndex / episodesPerPage) + 1);
  }
}

function initializeCarousel() {
  const chevronButtons = document.querySelectorAll('button .material-symbols-outlined');
  chevronButtons.forEach(icon => {
    const button = icon.closest('button');
    if (!button || button.dataset.pagination === 'true') return;

    if (icon.textContent === 'chevron_left') {
      button.addEventListener('click', function () {
        playAdjacentEpisode(-1);
      });
    }

    if (icon.textContent === 'chevron_right') {
      button.addEventListener('click', function () {
        playAdjacentEpisode(1);
      });
    }
  });
}

function initializeLanguageDropdown() {
  const languageBtn = document.getElementById('language-btn');
  const languageMenu = document.getElementById('language-menu');
  if (!languageBtn || !languageMenu) return;
  

  languageBtn.addEventListener('click', function (event) {
    console.log("Initializing language dropdown:", 2);
    event.preventDefault();
    event.stopPropagation();
    if (languageMenu.style.display === 'block') {
      languageMenu.style.display = 'none';
      languageBtn.setAttribute('aria-expanded', 'false');
    } else {
      languageMenu.style.display = 'block';
      languageBtn.setAttribute('aria-expanded', 'true');
    }
  });

  languageMenu.addEventListener('click', function (event) {
    const option = event.target.closest('.lang-option');
    if (!option) return;
    const language = option.dataset.lang;
    setCaptionLanguage(language);
    languageMenu.style.display = 'none';
    languageBtn.setAttribute('aria-expanded', 'false');
    if (!subtitlesOpen) {
      toggleSubtitles(true);
    }
  });

  document.addEventListener('click', function (event) {
    if (!languageMenu || !languageBtn) return;
    if (languageMenu.style.display === 'block' && !languageBtn.contains(event.target) && !languageMenu.contains(event.target)) {
      languageMenu.style.display = 'none';
      languageBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

function updateLanguageMenuSelection() {
  const label = document.getElementById('language-btn-label');
  if (label) {
    label.textContent = selectedLanguage.toUpperCase();
  }

  document.querySelectorAll('.lang-option').forEach(option => {
    const isSelected = option.dataset.lang === selectedLanguage;
    option.style.opacity = isSelected ? '1' : '0.65';
    option.style.fontWeight = isSelected ? '700' : '400';
  });
}

function setCaptionLanguage(lang) {
  selectedLanguage = lang;
  if (!player?.media?.textTracks) return;

  Array.from(player.media.textTracks).forEach(track => {
    track.mode = track.language === lang ? 'showing' : 'disabled';
  });

  updateLanguageMenuSelection();
  updateSubtitleText();
}

function attachCueListeners() {
  if (!player?.media?.textTracks) return;
  Array.from(player.media.textTracks).forEach(track => {
    track.oncuechange = updateSubtitleText;
  });
}

function updateSubtitleText() {
  const activeTrack = Array.from(player?.media?.textTracks || []).find(track => track.mode === 'showing');
  const subtitleText = activeTrack?.activeCues?.length ?
    Array.from(activeTrack.activeCues).map(cue => cue.text).join(' ') :
    'Subtitles are ready. Play the episode to view text.';
  setSubtitleText(subtitleText);
}

function setSubtitleText(text) {
  const container = document.querySelector('#subtitles-container p');
  if (container) {
    container.textContent = text;
  }
}

function toggleSubtitles(forceOpen) {
  const subtitlesBtn = document.getElementById('subtitles-btn');
  const subtitlesContainer = document.getElementById('subtitles-container');

  subtitlesOpen = typeof forceOpen === 'boolean' ? forceOpen : !subtitlesOpen;
  if (subtitlesContainer) {
    subtitlesContainer.style.display = subtitlesOpen ? '' : 'none';
  }

  if (subtitlesBtn) {
    subtitlesBtn.classList.toggle('active', subtitlesOpen);
  }

  if (!player?.media?.textTracks) return;

  if (subtitlesOpen) {
    setCaptionLanguage(selectedLanguage);
  } else {
    Array.from(player.media.textTracks).forEach(track => {
      track.mode = 'disabled';
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initializeSearch();
  initializePagination();
  initializeSubtitles();
  initializeLanguageDropdown();
  initializePlayerControls();
  initializeCarousel();
  loadEpisodes();

  console.log('Podcast landing page initialized');
});
