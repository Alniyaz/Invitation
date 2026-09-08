(() => {
  // PERSONAL GALLERY PHOTOS
  // 1. Put your image files inside: assets/gallery/
  // 2. Replace the empty quotes below with the matching file paths.
  // Example: 'assets/gallery/parthiban-manjula-01.jpg'
  // Leave a line empty to keep the original ornamental fallback image.
  const galleryPhotos = [
   'assets/gallery/groom.png',
  'assets/gallery/bride.png',
  'assets/gallery/my love.png'
  ];

  function applyGalleryPhotos() {
    document.querySelectorAll('[data-gallery-slot]').forEach((frame) => {
      const imagePath = galleryPhotos[Number(frame.dataset.gallerySlot)];
      if (!imagePath) return;

      const image = new Image();
      image.onload = () => {
        frame.style.setProperty('--gallery-photo', `url("${imagePath}")`);
        frame.classList.add('has-personal-photo');
      };
      image.src = imagePath;
    });
  }
  applyGalleryPhotos();

  const splash = document.getElementById('splash');
  const openInvitation = document.getElementById('openInvitation');
  const musicToggle = document.getElementById('musicToggle');
  const musicText = musicToggle.querySelector('.sound-toggle__text');
  let audioContext;
  let musicTimer;
  let musicOn = false;

  function hideSplash() {
    splash.classList.add('is-hidden');
    splash.setAttribute('aria-hidden', 'true');
  }

  openInvitation.addEventListener('click', hideSplash);

  function createTone(frequency, start, duration, volume, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  }

  function playTemplePhrase() {
    const now = audioContext.currentTime + 0.06;
    const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63];
    notes.forEach((note, index) => createTone(note, now + index * 0.47, index === 3 ? 1.4 : 0.82, index === 3 ? 0.048 : 0.025, index === 3 ? 'triangle' : 'sine'));
    createTone(130.81, now, 3.15, 0.013, 'sine');
  }

  function toggleMusic(forceOn) {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const shouldPlay = typeof forceOn === 'boolean' ? forceOn : !musicOn;
    if (shouldPlay) {
      audioContext.resume();
      musicOn = true;
      playTemplePhrase();
      musicTimer = window.setInterval(playTemplePhrase, 3600);
      musicToggle.setAttribute('aria-pressed', 'true');
      musicText.textContent = 'Music on';
    } else {
      musicOn = false;
      window.clearInterval(musicTimer);
      musicToggle.setAttribute('aria-pressed', 'false');
      musicText.textContent = 'Music off';
      audioContext.suspend();
    }
  }
  musicToggle.addEventListener('click', () => toggleMusic());

  const eventTime = new Date('2026-09-17T18:00:00+05:30').getTime();
  const countdownElements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  };
  function updateCountdown() {
    const distance = Math.max(0, eventTime - Date.now());
    const values = {
      days: Math.floor(distance / 86400000),
      hours: Math.floor((distance % 86400000) / 3600000),
      minutes: Math.floor((distance % 3600000) / 60000),
      seconds: Math.floor((distance % 60000) / 1000)
    };
    Object.entries(values).forEach(([key, value]) => {
      countdownElements[key].textContent = String(value).padStart(2, '0');
    });
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const canvas = document.getElementById('scratchCanvas');
  const scratchFrame = canvas.parentElement;
  const resetScratch = document.getElementById('resetScratch');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  let isScratching = false;
  let lastPoint = null;
  let revealed = false;

  function drawFoil() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.globalCompositeOperation = 'source-over';
    const foil = context.createLinearGradient(0, 0, rect.width, rect.height);
    foil.addColorStop(0, '#7c470b');
    foil.addColorStop(.14, '#e6ae38');
    foil.addColorStop(.27, '#8d5412');
    foil.addColorStop(.46, '#f6ce61');
    foil.addColorStop(.61, '#9a5c12');
    foil.addColorStop(.79, '#e7b441');
    foil.addColorStop(1, '#764207');
    context.fillStyle = foil;
    context.fillRect(0, 0, rect.width, rect.height);
    context.globalAlpha = .34;
    for (let x = 11; x < rect.width; x += 19) {
      for (let y = 11; y < rect.height; y += 19) {
        context.fillStyle = (x + y) % 38 === 0 ? '#fff2ae' : '#5b2e06';
        context.fillRect(x, y, 1.2, 1.2);
      }
    }
    context.globalAlpha = 1;
    context.strokeStyle = 'rgba(255, 238, 171, .8)';
    context.lineWidth = 1;
    context.strokeRect(10, 10, rect.width - 20, rect.height - 20);
    context.fillStyle = '#3c1804';
    context.textAlign = 'center';
    context.font = '600 12px Cinzel, Georgia, serif';
    context.fillText('SCRATCH TO REVEAL', rect.width / 2, rect.height / 2 - 9);
    context.font = '18px Georgia, serif';
    context.fillText('✦', rect.width / 2, rect.height / 2 + 22);
    revealed = false;
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function scratchAt(point) {
    const rect = canvas.getBoundingClientRect();
    context.globalCompositeOperation = 'destination-out';
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = Math.max(38, rect.width * .09);
    context.beginPath();
    if (lastPoint) context.moveTo(lastPoint.x, lastPoint.y);
    else context.moveTo(point.x, point.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPoint = point;
  }
  function finishScratch() {
    if (!isScratching) return;
    isScratching = false;
    lastPoint = null;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let i = 3; i < pixels.length; i += 64) if (pixels[i] < 30) cleared += 1;
    if (cleared / (pixels.length / 64) > .53 && !revealed) {
      revealed = true;
      canvas.style.transition = 'opacity .6s ease';
      canvas.style.opacity = '.05';
      canvas.style.pointerEvents = 'none';
    }
  }
  canvas.addEventListener('pointerdown', (event) => {
    isScratching = true;
    canvas.setPointerCapture(event.pointerId);
    scratchAt(pointFromEvent(event));
  });
  canvas.addEventListener('pointermove', (event) => { if (isScratching) scratchAt(pointFromEvent(event)); });
  canvas.addEventListener('pointerup', finishScratch);
  canvas.addEventListener('pointercancel', finishScratch);
  resetScratch.addEventListener('click', () => {
    canvas.style.opacity = '1';
    canvas.style.pointerEvents = 'auto';
    drawFoil();
  });
  const resizeObserver = new ResizeObserver(drawFoil);
  resizeObserver.observe(scratchFrame);
})();
