// =============================================================================
// CHAPTER 5 — THE GRAND FINALE
// Cake reveal -> wind & blowout -> smoke -> looping canvas fireworks -> final vow
//
// PERFORMANCE CONTRACT (read before editing!):
//   1. Every DOM tween below only ever touches `transform` / `opacity`.
//   2. All firework particles live on ONE <canvas> — zero DOM per particle.
//   3. Particles (and rockets) are drawn from a pre-allocated OBJECT POOL.
//      Nothing is ever `new`'d or discarded inside the animation loop, so
//      there is no per-frame garbage for the GC to clean up.
//   4. The canvas loop never touches shadowBlur / ctx.filter. "Glow" is
//      faked with two cheap solid-color arcs (small bright core + larger
//      low-alpha halo) instead.
//   5. Particle counts and canvas resolution are capped on mobile so
//      older phones don't drop frames.
// =============================================================================
console.log("✅ SUCCESS: chapter5.js has loaded into the browser!");

(function () {

  const chapter5Container = document.getElementById('chapter5-container');

  // ---------------------------------------------------------------------
  // Match #ch5-cake-wrapper's aspect-ratio to the REAL cake.png the moment
  // it loads. The candles below are positioned with % top/height, which
  // only resolves correctly once the wrapper has a determinate height —
  // the static 4/5 fallback in chapter5.css is just a same-frame guess.
  // ---------------------------------------------------------------------
  function syncCakeAspectRatio() {
    const cakeImg = document.getElementById('ch5-cake-img');
    const cakeWrapper = document.getElementById('ch5-cake-wrapper');
    if (!cakeImg || !cakeWrapper) return;

    const applyRatio = () => {
      if (cakeImg.naturalWidth && cakeImg.naturalHeight) {
        cakeWrapper.style.aspectRatio = `${cakeImg.naturalWidth} / ${cakeImg.naturalHeight}`;
      }
    };

    if (cakeImg.complete) {
      applyRatio();
    } else {
      cakeImg.addEventListener('load', applyRatio);
    }
  }
  syncCakeAspectRatio();

  // ---------------------------------------------------------------------
  // Tuck #ch5-cake-table snugly under the cake's REAL rendered position,
  // once it has finished landing. A static CSS percentage can't account
  // for transparent padding baked into cake.png itself, which is what
  // caused a visible gap between the cake and the stand — measuring the
  // actual box removes the guesswork. A deliberate overlap pulls the
  // stand a bit further up than the measured edge, as a safety margin:
  // a slightly hidden stand always looks better than a visible gap.
  // ---------------------------------------------------------------------
  function positionCakeTable(cakeWrapper, cakeTable) {
    if (!cakeWrapper || !cakeTable) return;
    const rect = cakeWrapper.getBoundingClientRect();
    const overlap = 30; // px the stand tucks up behind the cake's visible base
    cakeTable.style.bottom = (window.innerHeight - rect.bottom + overlap) + 'px';
  }

  window.startChapter5 = function () {
    console.log('[Chapter 5] Starting the grand finale...');

    if (!chapter5Container) {
      console.warn('[Chapter 5] #chapter5-container not found in the HTML.');
      return;
    }

    // Hand off from Chapter 4, exactly the same pattern chapter4.js used for ch2/ch3.
    const chapter4Container = document.getElementById('chapter4-container');
    if (chapter4Container) {
      gsap.to(chapter4Container, { opacity: 0, duration: 1, pointerEvents: 'none' });
    }

    chapter5Container.style.pointerEvents = 'auto';
    gsap.to(chapter5Container, { opacity: 1, duration: 1.2, ease: 'sine.inOut' });

    runSequence();
  };

  // -------------------------------------------------------------------------
  // THE MASTER TIMELINE — orchestrates every beat described in the brief.
  // -------------------------------------------------------------------------
  function runSequence() {
    const cakeWrapper   = document.getElementById('ch5-cake-wrapper');
    const cakeTable      = document.getElementById('ch5-cake-table');
    const wishText       = document.getElementById('ch5-wish-text');
    const flames          = Array.from(document.querySelectorAll('.ch5-flame'));
    const smokeWisps      = Array.from(document.querySelectorAll('.ch5-smoke'));
    const darkenOverlay   = document.getElementById('ch5-darken-overlay');
    const finalVow        = document.getElementById('ch5-final-vow');

    const tl = gsap.timeline();

    const wishBtn = document.getElementById('ch5-wish-btn');

    // --- 1. THE CAKE REVEAL ------------------------------------------------
    // CSS anchors the wrapper's resting spot with `bottom: 22%`; the base
    // transform starts it 40vh lower (off-screen-ish), so animating y back
    // to 0 brings it to rest exactly where the CSS placed it — just above
    // the button.
    tl.to(cakeWrapper, {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 1.6,
      ease: 'power3.out',
      force3D: true
    }, 0);

    // --- 2. THE BUTTON — appears at the bottom once the cake has landed -----
    tl.call(() => {
      showWishButton(wishBtn, wishText, cakeWrapper, cakeTable, flames, smokeWisps, darkenOverlay, finalVow);
    }, null, 1.8);
  }

  // "Make a wish..." now lives up in the sky (top: 14%, set in chapter5.css)
  // rather than being measured off the cake's rendered top edge, so it never
  // ends up floating right in front of the cake.

  // Reveal the bottom "Make a Wish" button and wire up its tap. Everything
  // after this point (wish text -> wind -> smoke -> fireworks -> vow) only
  // fires once she actually taps it.
  function showWishButton(wishBtn, wishText, cakeWrapper, cakeTable, flames, smokeWisps, darkenOverlay, finalVow) {
    if (!wishBtn) return;

    positionCakeTable(cakeWrapper, cakeTable);
    window.addEventListener('resize', () => positionCakeTable(cakeWrapper, cakeTable));

    wishBtn.style.pointerEvents = 'auto';
    gsap.to(wishBtn, { y: 0, opacity: 1, duration: 1, ease: 'power2.out', force3D: true });
    // Gentle pulse so it reads as tappable
    gsap.to(wishBtn, { scale: 1.05, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    const onTap = () => {
      wishBtn.removeEventListener('click', onTap);
      wishBtn.style.pointerEvents = 'none';
      gsap.killTweensOf(wishBtn, 'scale');
      gsap.to(wishBtn, { opacity: 0, y: 20, scale: 1, duration: 0.6, ease: 'power2.in' });

      playWishAndFinale(wishText, cakeWrapper, cakeTable, flames, smokeWisps, darkenOverlay, finalVow);
    };
    wishBtn.addEventListener('click', onTap);
    wishBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onTap();
      }
    });
  }

  // The rest of the finale, kicked off the moment the button is tapped.
  function playWishAndFinale(wishText, cakeWrapper, cakeTable, flames, smokeWisps, darkenOverlay, finalVow) {
    const tl = gsap.timeline();

    // --- 3. "Make a wish..." appears above the cake --------------------------
    tl.to(wishText, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out',
      force3D: true
    }, 0);

    // Gentle infinite breathing float for the wish text while she reads it
    tl.to(wishText, {
      y: -10,
      duration: 2.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    }, 1.2);

    // --- 4. THE WIND & THE BLOWOUT ------------------------------------------
    // Give her a few seconds with the candles lit before the wind arrives.
    tl.call(() => {
      // Stop the wish-text float and let it drift gently downward/away
      gsap.killTweensOf(wishText);
      gsap.to(wishText, { opacity: 0, y: -30, duration: 1, ease: 'power1.in' });

      flames.forEach((flame, i) => {
        flame.classList.add('ch5-wind-hit');
        // After the wild flicker plays out, snuff the flame for good
        gsap.delayedCall(0.5 + i * 0.08, () => {
          flame.classList.remove('ch5-wind-hit');
          flame.classList.add('ch5-extinguished');
        });
      });

      // Screen darkens slightly as the candlelight dies
      gsap.to(darkenOverlay, { opacity: 0.35, duration: 1.2, ease: 'sine.inOut' });
    }, null, 3.2);

    // --- 5. THE SMOKE --------------------------------------------------------
    tl.call(() => {
      smokeWisps.forEach((wisp, i) => {
        gsap.delayedCall(i * 0.1, () => animateSmokeWisp(wisp));
      });
    }, null, 4.0);

    // --- 6. THE FIREWORKS ERUPTION (canvas) ----------------------------------
    tl.call(() => {
      gsap.to(darkenOverlay, { opacity: 0, duration: 1.5, ease: 'sine.inOut' });
      startFireworksLoop();
    }, null, 4.8);

    // --- 6b. THE CAKE (AND STAND) FADE AWAY -----------------------------------
    // Her job is done — candles blown out, wish made. Let the cake and its
    // stand dissolve together into the fireworks so the final vow has the
    // whole screen to itself instead of sitting on top of the cake artwork.
    tl.to([cakeWrapper, cakeTable].filter(Boolean), {
      opacity: 0,
      y: -20,
      scale: 0.94,
      duration: 1.3,
      ease: 'power2.inOut',
      force3D: true,
      onComplete: () => {
        cakeWrapper.style.pointerEvents = 'none';
        if (cakeTable) cakeTable.style.pointerEvents = 'none';
      }
    }, 5.0);

    // --- 7. THE FINAL VOW ------------------------------------------------------
    tl.to(finalVow, {
      opacity: 1,
      scale: 1,
      duration: 2,
      ease: 'power2.out',
      force3D: true
    }, 6.2);

    // Soft, continuous glow "breathing" — opacity only, cheap
    tl.to(finalVow, {
      opacity: 0.85,
      duration: 2.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    }, 8.2);

    tl.call(() => {
      spawnDriftingHearts();
    }, null, 6.4);
    //Wait ~6 seconds after the final vow appears (6.2s + 5.8s = 12.0s timeline position)
   tl.call(() => {
      if (typeof window.startChapter6 === 'function') {
        window.startChapter6();
      } else {
        console.warn('[Chapter 5] startChapter6() is not defined yet.');
      }
    }, null, 12.0); 
  }

  // A single smoke wisp: drifts up, widens slightly, fades away. Pure
  // transform/opacity tween — cheap even though several run in parallel.
  function animateSmokeWisp(wisp) {
    gsap.set(wisp, { opacity: 0, y: 0, scale: 1 });
    gsap.to(wisp, {
      opacity: 0.7,
      duration: 0.4,
      ease: 'sine.out'
    });
    gsap.to(wisp, {
      y: -70,
      scale: 2.4,
      opacity: 0,
      duration: 2.8,
      ease: 'sine.in',
      delay: 0.2,
      force3D: true
    });
  }

  // A small fixed pool of drifting hearts around the final vow text.
  // They're plain DOM nodes animated entirely by the CSS keyframe
  // `ch5-heart-drift` defined in style.css — no JS animation loop needed.
  function spawnDriftingHearts() {
    const container = document.getElementById('ch5-hearts-container');
    if (!container) return;

    const HEART_COUNT = window.innerWidth < 768 ? 9 : 14;
    const glyphs = ['💗', '💕', '💖'];

    for (let i = 0; i < HEART_COUNT; i++) {
      const heart = document.createElement('span');
      heart.className = 'ch5-heart';
      heart.textContent = glyphs[i % glyphs.length];
      heart.style.left = `${5 + Math.random() * 90}%`;
      const duration = 6 + Math.random() * 5;
      heart.style.animationDuration = `${duration}s`;
      heart.style.animationDelay = `${Math.random() * duration}s`;
      container.appendChild(heart);
    }
  }

  // =============================================================================
  // CANVAS FIREWORKS ENGINE — object-pooled, DOM-free, 60fps-on-mobile target
  // =============================================================================

  function startFireworksLoop() {
    const canvas = document.getElementById('ch5-fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    // ---- Device-aware scaling -------------------------------------------------
    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    const MAX_PARTICLES_PER_BURST = isMobile ? 45 : 100;
    const MAX_CONCURRENT_ROCKETS  = isMobile ? 2 : 4;
    const PARTICLE_POOL_SIZE      = isMobile ? 260 : 620;
    const ROCKET_POOL_SIZE        = MAX_CONCURRENT_ROCKETS + 2;

    const PALETTE = [
      ['#ff6fae', '#ffd3e6'], // pink core / pink-white halo
      ['#ffd766', '#fff3c4'], // gold
      ['#7ec8ff', '#dff2ff'], // glowing blue
      ['#ffffff', '#ffffff'], // pure white
      ['#ff9dcb', '#ffe1f0']  // soft rose
    ];

    let width = 0, height = 0;

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ---- Object pools -----------------------------------------------------
    // Particles: plain objects reused forever. `active` flags which slots
    // are currently "alive" — we never push/splice the array.
    const particlePool = new Array(PARTICLE_POOL_SIZE);
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      particlePool[i] = {
        active: false,
        x: 0, y: 0, vx: 0, vy: 0,
        core: '#fff', halo: '#fff',
        alpha: 0, decay: 0, size: 0
      };
    }
    let particleCursor = 0; // round-robin pointer so we don't re-scan from 0 every time

    function getParticle() {
      // Round-robin search for a free slot — bounded to one pass of the pool.
      for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        const idx = (particleCursor + i) % PARTICLE_POOL_SIZE;
        if (!particlePool[idx].active) {
          particleCursor = (idx + 1) % PARTICLE_POOL_SIZE;
          return particlePool[idx];
        }
      }
      return null; // pool exhausted — simply skip spawning, never allocate more
    }

    const rocketPool = new Array(ROCKET_POOL_SIZE);
    for (let i = 0; i < ROCKET_POOL_SIZE; i++) {
      rocketPool[i] = {
        active: false,
        x: 0, y: 0, vx: 0, vy: 0,
        targetY: 0, trail: [],
        color: '#fff'
      };
      // Small fixed-length trail buffer per rocket (also pre-allocated)
      for (let t = 0; t < 5; t++) rocketPool[i].trail.push({ x: 0, y: 0 });
    }

    function getRocket() {
      for (let i = 0; i < ROCKET_POOL_SIZE; i++) {
        if (!rocketPool[i].active) return rocketPool[i];
      }
      return null;
    }

    // ---- Spawning -----------------------------------------------------------
    function launchRocket() {
      let activeCount = 0;
      for (let i = 0; i < ROCKET_POOL_SIZE; i++) if (rocketPool[i].active) activeCount++;
      if (activeCount >= MAX_CONCURRENT_ROCKETS) return;

      const rocket = getRocket();
      if (!rocket) return;

      const [core, halo] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      rocket.active = true;
      rocket.x = width * (0.25 + Math.random() * 0.5);
      rocket.y = height;
      rocket.vx = (Math.random() - 0.5) * 0.6;
      rocket.vy = -(height * 0.0068 + Math.random() * (height * 0.0022)); // upward speed scaled to screen
      rocket.targetY = height * (0.18 + Math.random() * 0.28);
      rocket.color = core;
      rocket.haloColor = halo;
      for (let t = 0; t < rocket.trail.length; t++) {
        rocket.trail[t].x = rocket.x;
        rocket.trail[t].y = rocket.y;
      }
    }

    function explode(x, y, core, halo) {
      const count = MAX_PARTICLES_PER_BURST;
      const speedBase = Math.min(width, height) * 0.0045;

      for (let i = 0; i < count; i++) {
        const p = getParticle();
        if (!p) break; // pool exhausted this frame — gracefully cap the burst

        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.15;
        const speed = speedBase * (0.5 + Math.random() * 0.9);

        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.core = core;
        p.halo = halo;
        p.alpha = 1;
        p.decay = 0.010 + Math.random() * 0.012;
        p.size = 1.6 + Math.random() * 1.6;
      }
    }

    // ---- Update + Draw --------------------------------------------------------
    const GRAVITY = Math.min(window.innerWidth, window.innerHeight) * 0.000075;

    function update(dt) {
      // Rockets
      for (let i = 0; i < ROCKET_POOL_SIZE; i++) {
        const r = rocketPool[i];
        if (!r.active) continue;

        // shift trail buffer
        for (let t = r.trail.length - 1; t > 0; t--) {
          r.trail[t].x = r.trail[t - 1].x;
          r.trail[t].y = r.trail[t - 1].y;
        }
        r.trail[0].x = r.x;
        r.trail[0].y = r.y;

        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy += GRAVITY * 0.3 * dt; // slight deceleration on the way up

        if (r.y <= r.targetY || r.vy >= 0) {
          explode(r.x, r.y, r.color, r.haloColor);
          r.active = false;
        }
      }

      // Particles
      for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        const p = particlePool[i];
        if (!p.active) continue;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += GRAVITY * dt;
        p.vx *= 0.988; // gentle air drag
        p.vy *= 0.994;
        p.alpha -= p.decay * dt;

        if (p.alpha <= 0) p.active = false;
      }
    }

    function draw() {
      // Fading fill instead of clearRect -> leaves soft trails (cheap, single op)
      ctx.fillStyle = 'rgba(4, 0, 15, 0.28)';
      ctx.fillRect(0, 0, width, height);

      // Rocket trails — thin fading line segments, no glow filter needed
      for (let i = 0; i < ROCKET_POOL_SIZE; i++) {
        const r = rocketPool[i];
        if (!r.active) continue;

        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        for (let t = 0; t < r.trail.length - 1; t++) {
          ctx.globalAlpha = (1 - t / r.trail.length) * 0.8;
          ctx.beginPath();
          ctx.moveTo(r.trail[t].x, r.trail[t].y);
          ctx.lineTo(r.trail[t + 1].x, r.trail[t + 1].y);
          ctx.stroke();
        }
      }

      // Particles — cheap two-arc "glow": dim halo + bright core, no shadowBlur
      for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        const p = particlePool[i];
        if (!p.active) continue;

        ctx.globalAlpha = p.alpha * 0.35;
        ctx.fillStyle = p.halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.core;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    // ---- Main loop --------------------------------------------------------------
    let lastTime = performance.now();

    function frame(now) {
      const dt = Math.min((now - lastTime) / 16.6667, 2.5); // normalize to ~60fps steps, clamp spikes
      lastTime = now;

      update(dt);
      draw();

      requestAnimationFrame(frame);
    }

    // Separate, simple wall-clock accumulator for launch cadence (decoupled
    // from the dt-normalized physics loop above so timing stays predictable).
    let rawLast = performance.now();
    let launchAccumulator = 0;
    let nextLaunchIn = 300; // ms, randomized per-shot below
    function launchScheduler(now) {
      const rawDelta = now - rawLast;
      rawLast = now;
      launchAccumulator += rawDelta;

      if (launchAccumulator >= nextLaunchIn) {
        launchAccumulator = 0;
        nextLaunchIn = 550 + Math.random() * 700;
        launchRocket();
      }
      requestAnimationFrame(launchScheduler);
    }

    // Kick off two lightweight rAF loops: physics/draw, and launch cadence.
    requestAnimationFrame(frame);
    requestAnimationFrame(launchScheduler);

    // Fire the very first rocket immediately so the sky isn't empty on arrival.
    launchRocket();
  }

})();
