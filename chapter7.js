// =============================================================================
// CHAPTER 7 — THE MUSIC & THE SIGNATURES
//
// Requires opentype.js loaded BEFORE this file, e.g. in your <head> or
// right before this <script> tag:
//   <script src="https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js"></script>
//
// What opentype.js does here: it reads the real Great Vibes font file and
// turns "Bitiiiii" / "Anuj" into actual pen-stroke SVG paths (the same
// curves the font itself draws), instead of just showing flat text. We
// then reveal that path with a stroke animation, so it looks like it's
// being written live rather than fading in. If the font can't load (slow
// connection, offline testing, etc.) it falls back to a plain soft
// fade-in — the page never gets stuck waiting.
// =============================================================================
console.log("✅ SUCCESS: chapter7.js has loaded into the browser!");

(function () {

  // ---------------------------------------------------------------------
  // 👉 EDIT THESE — everything you'll want to change lives here
  // ---------------------------------------------------------------------
  const CH7_CONFIG = {
    audioSrc: 'music3.mp3',
    trackName: 'Tera Mera Pyar Amar',
    fontUrl: 'https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf',
    signatureName1: 'Bitiiiii',
    signatureName2: 'Anuj',
    // 👉 TODO: paste a direct .mp4 URL here — e.g. a Firebase Storage
    // download URL or a Cloudinary video URL. See the notes below for why.
    videoUrl: '',
    linkLabel: 'Tap here 💌'   // 👉 change the label if you want
  };

  const chapter7Container = document.getElementById('chapter7-container');
  const page1 = document.getElementById('ch7-page1');
  const page2 = document.getElementById('ch7-page2');

  const audio = document.getElementById('ch7-audio');
  const playBtn = document.getElementById('ch7-play-btn');
  const playIcon = document.getElementById('ch7-play-icon');
  const pauseIcon = document.getElementById('ch7-pause-icon');
  const vinyl = document.getElementById('ch7-vinyl');
  const progressFill = document.getElementById('ch7-progress-fill');
  const trackNameEl = document.getElementById('ch7-track-name');
  const nextBtn = document.getElementById('ch7-next-btn');

  // Site-wide background music (plays through earlier chapters) — needs to
  // stop once Chapter 7's own player takes over.
  const siteAudio1 = document.getElementById('site-audio-1');
  const siteAudio2 = document.getElementById('site-audio-2');

  const sigSvg = document.getElementById('ch7-sig-svg');
  const name1Path = document.getElementById('ch7-sig-name1');
  const heartPath = document.getElementById('ch7-sig-heart');
  const name2Path = document.getElementById('ch7-sig-name2');
  const fallbackWrap = document.getElementById('ch7-fallback-sig');
  const linkWrap = document.getElementById('ch7-link-wrap');
  const linkEl = document.getElementById('ch7-link');
  const endText = document.getElementById('ch7-end-text');

  const videoPopup = document.getElementById('ch7-video-popup');
  const videoEl = document.getElementById('ch7-video-el');
  const videoCloseBtn = document.getElementById('ch7-video-close');
  const videoBackdrop = document.getElementById('ch7-video-backdrop');

  // Fill in config-driven content
  trackNameEl.textContent = CH7_CONFIG.trackName;
  audio.src = CH7_CONFIG.audioSrc;
  linkEl.textContent = CH7_CONFIG.linkLabel;

  // ---------------------------------------------------------------------
  // VIDEO POPUP — plays a real video file inside the site, no navigation,
  // no YouTube page/branding, no ads.
  //
  // Why a direct <video> file instead of an embed:
  //  - Full control over playback (no related videos, no third-party UI)
  //  - `playsinline` keeps it inside this popup on iPhone instead of
  //    forcing the OS's native fullscreen video player
  //  - One less external service in the loop → faster start, nothing can
  //    change behavior on us later
  //
  // Why NOT GitHub raw as the host: GitHub raw isn't built for serving
  // media — it doesn't reliably support the byte-range requests mobile
  // browsers need to start playback quickly or let her scrub the
  // timeline, it has practical file-size limits, and repeated hotlinking
  // of a large file can get rate-limited. Firebase Storage (you're
  // already using Firebase for this project — see the SDK scripts below)
  // or Cloudinary are built for exactly this: proper streaming, a CDN in
  // front of it, and no surprise throttling. Either works — just grab the
  // public download URL and paste it into CH7_CONFIG.videoUrl above.
  //
  // Why we lazy-load: the <video> tag has `preload="none"`, and we only
  // set its `src` the first time she taps — so nothing downloads or
  // shows a loading spinner until she actually asks for it.
  // ---------------------------------------------------------------------
  function openVideoPopup() {
    // Load the file on first tap only (keeps the page light until needed)
    if (!videoEl.src) {
      videoEl.src = CH7_CONFIG.videoUrl;
    }

    videoPopup.classList.remove('hidden');
    videoPopup.classList.add('ch7-video-open');
    gsap.to(videoPopup, { opacity: 1, duration: 0.35 });

    // IMPORTANT: this .play() call happens synchronously, directly inside
    // the tap handler — not after the animation above, not inside a
    // setTimeout. That's what makes it count as "triggered by a user
    // gesture" to the browser, which is required or iOS Safari and
    // Chrome on Android will silently block playback.
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(function (err) {
        console.warn('[Chapter 7] Video play was blocked — she may need to tap the play button on the video itself:', err);
      });
    }
  }

  function closeVideoPopup() {
    gsap.to(videoPopup, {
      opacity: 0, duration: 0.3, onComplete: function () {
        videoPopup.classList.add('hidden');
        videoPopup.classList.remove('ch7-video-open');
        videoEl.pause();
        videoEl.currentTime = 0; // so it restarts from the beginning next time
      }
    });
  }

  linkEl.addEventListener('click', openVideoPopup);
  linkEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideoPopup(); }
  });
  videoCloseBtn.addEventListener('click', closeVideoPopup);
  videoBackdrop.addEventListener('click', closeVideoPopup);

  let signatureFont = null;
  let fontLoadFailed = false;

  // A generic decorative heart in local 0-200 / -10-180 units. Positioned
  // with an SVG `transform` on the <path> itself — transforms don't affect
  // getTotalLength(), so the stroke-draw math below still stays correct.
  const HEART_D = "M100,180 C40,120 0,80 0,45 C0,10 25,-10 55,-10 C75,-10 95,5 100,25 " +
                  "C105,5 125,-10 145,-10 C175,-10 200,10 200,45 C200,80 160,120 100,180 Z";
  const HEART_TRANSFORM = "translate(232,235) scale(0.68)";

  // ---------------------------------------------------------------------
  // FONT PRELOAD — starts the moment Chapter 7 opens (during Page 1),
  // so it's ready long before she taps "Next". Great Vibes is a tiny
  // font file, so this is a one-time, sub-second cost even on a slow
  // connection — never something that happens per-frame.
  // ---------------------------------------------------------------------
  function preloadSignatureFont() {
    if (typeof opentype === 'undefined') {
      fontLoadFailed = true;
      console.warn('[Chapter 7] opentype.js not found — add the CDN script tag before chapter7.js. Using fallback.');
      return;
    }
    opentype.load(CH7_CONFIG.fontUrl, function (err, font) {
      if (err) {
        fontLoadFailed = true;
        console.warn('[Chapter 7] Signature font failed to load, using fallback:', err);
        return;
      }
      signatureFont = font;
    });
  }

  // Builds a path for `text` at `fontSize`, horizontally centered on centerX,
  // with its baseline at baselineY.
  function getCenteredPathData(font, text, fontSize, centerX, baselineY) {
    const measured = font.getPath(text, 0, 0, fontSize);
    const box = measured.getBoundingBox();
    const width = box.x2 - box.x1;
    const startX = centerX - width / 2 - box.x1;
    return font.getPath(text, startX, baselineY, fontSize).toPathData(2);
  }

  // ---------------------------------------------------------------------
  // STROKE-DRAW — traces a path like ink being written, then settles into
  // a solid fill. Only ever animates stroke-dashoffset + opacity, both
  // compositor-friendly, and only ONE path animates at a time, so this
  // stays smooth even on weak phones.
  // ---------------------------------------------------------------------
  function strokeDrawIn(pathEl, tl, drawSpeed) {
    const length = pathEl.getTotalLength();
    gsap.set(pathEl, {
      strokeDasharray: length,
      strokeDashoffset: length,
      fillOpacity: 0,
      opacity: 1
    });
    const duration = Math.min(3, Math.max(1.1, length / (drawSpeed || 260)));
    tl.to(pathEl, { strokeDashoffset: 0, duration: duration, ease: "power1.inOut" });
    tl.to(pathEl, { fillOpacity: 1, duration: 0.5, ease: "sine.out" }, "-=0.15");
  }

  function buildAndPlaySignatures() {
    const useFont = signatureFont && !fontLoadFailed;

    if (useFont) {
      name1Path.setAttribute('d', getCenteredPathData(signatureFont, CH7_CONFIG.signatureName1, 120, 300, 150));
      heartPath.setAttribute('d', HEART_D);
      heartPath.setAttribute('transform', HEART_TRANSFORM);
      name2Path.setAttribute('d', getCenteredPathData(signatureFont, CH7_CONFIG.signatureName2, 120, 300, 470));

      const tl = gsap.timeline();
      strokeDrawIn(name1Path, tl, 260);
      tl.to({}, { duration: 0.35 });
      strokeDrawIn(heartPath, tl, 90);
      tl.to(heartPath, { scale: 1.15, duration: 0.35, yoyo: true, repeat: 1, transformOrigin: "50% 50%", ease: "sine.inOut" });
      tl.to({}, { duration: 0.35 });
      strokeDrawIn(name2Path, tl, 260);
      tl.to({}, { duration: 0.4 });
      tl.call(revealLinkAndEnd);
    } else {
      // Fallback: same fonts/colors, simple soft fade-in, no stroke draw —
      // guarantees the page never hangs waiting on a network font fetch.
      sigSvg.style.display = 'none';
      fallbackWrap.classList.remove('hidden');
      document.getElementById('ch7-fallback-name1').textContent = CH7_CONFIG.signatureName1;
      document.getElementById('ch7-fallback-name2').textContent = CH7_CONFIG.signatureName2;

      const tl = gsap.timeline();
      tl.to('#ch7-fallback-name1', { opacity: 1, duration: 1 });
      tl.to('#ch7-fallback-heart', { opacity: 1, scale: 1, duration: 0.8 }, "+=0.3");
      tl.to('#ch7-fallback-name2', { opacity: 1, duration: 1 }, "+=0.3");
      tl.call(revealLinkAndEnd, null, "+=0.4");
    }
  }

  function revealLinkAndEnd() {
    const tl = gsap.timeline();
    tl.call(() => linkWrap.classList.remove('hidden'));
    tl.to(linkWrap, { opacity: 1, duration: 1 });
    tl.call(() => endText.classList.remove('hidden'), null, "+=0.5");
    tl.to(endText, { opacity: 1, duration: 1.2 }, "<");
  }

  // ---------------------------------------------------------------------
  // PAGE 1 — MUSIC PLAYER
  // ---------------------------------------------------------------------
  function updateProgress() {
    if (!audio.duration) return;
    progressFill.style.transform = `scaleX(${audio.currentTime / audio.duration})`;
  }
  audio.addEventListener('timeupdate', updateProgress);

  playBtn.addEventListener('click', function () {
    if (audio.paused) {
      audio.play().catch(err => console.warn('[Chapter 7] Playback blocked:', err));
    } else {
      audio.pause();
    }
  });
  audio.addEventListener('play', function () {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    vinyl.classList.add('ch7-spinning');
  });
  audio.addEventListener('pause', function () {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    vinyl.classList.remove('ch7-spinning');
  });

  function goToPage2() {
    audio.pause(); // keep it quiet so the signature moment lands
    gsap.to(page1, {
      opacity: 0, duration: 0.6, onComplete: () => {
        page1.classList.add('hidden');
        page2.classList.remove('hidden');
        gsap.to(page2, { opacity: 1, duration: 0.8, onComplete: buildAndPlaySignatures });
      }
    });
  }
  nextBtn.addEventListener('click', goToPage2);

  // Fades out and stops any site-wide background track that's still
  // playing (music1/music2 from earlier chapters), so it doesn't overlap
  // with Chapter 7's own player. Only ever animates `volume`, so it's a
  // single lightweight tween — not per-frame work.
  function stopBackgroundMusic() {
    [siteAudio1, siteAudio2].forEach(function (el) {
      if (!el || el.paused) return;
      gsap.to(el, {
        volume: 0,
        duration: 1,
        onComplete: function () {
          el.pause();
          el.volume = 1; // reset in case it's ever played again
        }
      });
    });
  }

  // ---------------------------------------------------------------------
  // ENTRY POINT — called by chapter6.js once the wish animation ends
  // ---------------------------------------------------------------------
  window.startChapter7 = function () {
    console.log('[Chapter 7] Starting The Music & The Signatures...');
    stopBackgroundMusic();
    const chapter6Container = document.getElementById('chapter6-container');
    if (chapter6Container) {
      gsap.to(chapter6Container, { opacity: 0, duration: 1, pointerEvents: 'none' });
    }
    chapter7Container.style.pointerEvents = 'auto';
    gsap.to(chapter7Container, { opacity: 1, duration: 1 });
    preloadSignatureFont();
  };

  // --- MANUAL TEST TRIGGER ---
  window.skipToChapter7 = function () {
    console.log('[Chapter 7] MANUALLY TRIGGERED!');
    ['chapter2-container', 'chapter4-container', 'chapter5-container', 'chapter6-container'].forEach(id => {
      const el = document.getElementById(id);
      if (el) gsap.set(el, { opacity: 0, pointerEvents: 'none' });
    });
    window.startChapter7();
  };

})();
