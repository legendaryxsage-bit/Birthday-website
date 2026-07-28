// =============================================================================
// CHAPTER 2 — THE BIRTHDAY WISH (SCENES 1-8)
// =============================================================================
console.log("✅ SUCCESS: chapter2.js has loaded into the browser!");

(function () {

  const ch2Container      = document.getElementById('chapter2-container');
  const ch2Canvas         = document.getElementById('ch2-particle-canvas');
  const ch2Ctx            = ch2Canvas.getContext('2d');
  const goldenLight       = document.getElementById('ch2-golden-light');
  const goldenRays        = document.getElementById('ch2-golden-rays');
  const ch2ButterflyWrap  = document.getElementById('ch2-butterfly-wrapper');
  const nameText          = document.getElementById('ch2-name-text');
  const swarmContainer    = document.getElementById('ch2-swarm-container');
  const greeting          = document.getElementById('ch2-greeting');
  const greetingLine1     = document.getElementById('ch2-greeting-line1');
  const greetingLine2     = document.getElementById('ch2-greeting-line2');
  const heartsContainer   = document.getElementById('ch2-hearts-container');
  const sparklesContainer = document.getElementById('ch2-sparkles-container');

  let ch2Width  = ch2Canvas.width  = window.innerWidth;
  let ch2Height = ch2Canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    ch2Width  = ch2Canvas.width  = window.innerWidth;
    ch2Height = ch2Canvas.height = window.innerHeight;
  });

  let ch2Particles = [];
  function spawnGoldParticle(x, y, opts) {
    opts = opts || {};
    ch2Particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * (opts.spread || 30),
      vy: (opts.vy !== undefined ? opts.vy : (Math.random() - 0.5) * 30),
      life: 0,
      maxLife: opts.life || (0.8 + Math.random() * 0.6),
      size: opts.size || (2 + Math.random() * 3),
      color: opts.color || '255,214,140'
    });
  }

  function ch2ParticleLoop() {
    if (ch2Particles.length === 0) { ch2Ctx.clearRect(0, 0, ch2Width, ch2Height); return; }
    ch2Ctx.clearRect(0, 0, ch2Width, ch2Height);
    for (let i = ch2Particles.length - 1; i >= 0; i--) {
      const p = ch2Particles[i];
      p.life += 1 / 60;
      const t = p.life / p.maxLife;
      if (t >= 1) { ch2Particles.splice(i, 1); continue; }
      p.x += p.vx / 60;
      p.y += p.vy / 60;
      const alpha = 1 - t;
      const size = p.size * (1 - t * 0.4);
      ch2Ctx.beginPath();
      ch2Ctx.fillStyle = 'rgba(' + p.color + ',' + alpha + ')';
      ch2Ctx.shadowColor = 'rgba(' + p.color + ',' + alpha + ')';
      ch2Ctx.shadowBlur = 8;
      ch2Ctx.arc(p.x, p.y, Math.max(size, 0.1), 0, Math.PI * 2);
      ch2Ctx.fill();
    }
  }
  gsap.ticker.add(ch2ParticleLoop);

  function burstSparkle(el, color) {
    const rect = el.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
      const s = document.createElement('div');
      s.className = 'ch2-sparkle';
      sparklesContainer.appendChild(s);
      const x = rect.right - 8 + (Math.random() - 0.5) * 24;
      const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 24;
      gsap.set(s, { x: x, y: y, opacity: 0, scale: 0 });
      gsap.to(s, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)" });
      gsap.to(s, { opacity: 0, scale: 0, duration: 0.4, delay: 0.25, onComplete: () => s.remove() });
      spawnGoldParticle(x, y, { spread: 30, vy: -12, life: 0.6, size: 1.6, color: color || '255,150,205' });
    }
  }

  function spawnHeart() {
    const h = document.createElement('div');
    h.className = 'ch2-drift-heart';
    h.textContent = '💗';
    const x = Math.random() * window.innerWidth;
    heartsContainer.appendChild(h);
    gsap.set(h, { x: x, y: window.innerHeight + 30, opacity: 0, scale: 0.6 + Math.random() * 0.6 });
    gsap.to(h, { y: -60, duration: 6 + Math.random() * 3, ease: "sine.inOut" });
    gsap.to(h, { opacity: 1, duration: 1.2 });
    gsap.to(h, { opacity: 0, duration: 1.8, delay: 5 + Math.random() * 2, onComplete: () => h.remove() });
  }

  function spawnSparkle() {
    const s = document.createElement('div');
    s.className = 'ch2-sparkle';
    const x = window.innerWidth * 0.5 + (Math.random() - 0.5) * window.innerWidth * 0.7;
    const y = window.innerHeight * 0.42 + (Math.random() - 0.5) * window.innerHeight * 0.4;
    sparklesContainer.appendChild(s);
    gsap.set(s, { x: x, y: y, opacity: 0, scale: 0 });
    gsap.to(s, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" });
    gsap.to(s, { opacity: 0, scale: 0, duration: 0.6, delay: 0.8, onComplete: () => s.remove() });
  }

  // --- API BRIDGE: Allows Chapter 3 to safely borrow elements ---
  window.ch2API = {
    container: ch2Container,
    butterflyWrap: ch2ButterflyWrap,
    spawnGoldParticle: spawnGoldParticle,
    burstSparkle: burstSparkle
  };

  let chapter2Started = false;

  // Normal automated trigger (waits 2 seconds in silence first)
  function triggerChapter2Once(source) {
    if (chapter2Started) return;
    chapter2Started = true;
    console.log('[Chapter 2] Starting automatically (triggered by: ' + source + ')');
    ch2Container.style.pointerEvents = 'auto';
    gsap.delayedCall(2, scene2GoldenLight); 
  }

  // UPDATED MANUAL TRIGGER: Instantly skips the 2-second silence so you see immediate feedback!
  window.skipToChapter2 = function () {
    if (chapter2Started) return;
    chapter2Started = true;
    console.log('[Chapter 2] MANUALLY TRIGGERED — Skipping the 2-second silence!');
    ch2Container.style.pointerEvents = 'auto';
    scene2GoldenLight(); 
  };

  const ch1ButterflyWrap = document.getElementById('butterfly-wrapper');
  let ch1EverVisible = false;
  let ch1FadeStartTime = null;
  function watchChapter1End() {
    if (chapter2Started || !ch1ButterflyWrap) return;
    const op = parseFloat(window.getComputedStyle(ch1ButterflyWrap).opacity) || 0;
    if (!ch1EverVisible) {
      if (op > 0.4) ch1EverVisible = true;
      return;
    }
    if (op < 0.02) {
      if (ch1FadeStartTime === null) ch1FadeStartTime = performance.now();
      else if (performance.now() - ch1FadeStartTime > 800) triggerChapter2Once('opacity-watch');
    } else {
      ch1FadeStartTime = null;
    }
  }
  gsap.ticker.add(watchChapter1End);

  try {
    const originalStartButterflyFlight = window.startButterflyFlight;
    if (typeof originalStartButterflyFlight === 'function') {
      window.startButterflyFlight = function () {
        try {
          const originalTimelineFn = gsap.timeline;
          gsap.timeline = function () {
            const tl = originalTimelineFn.apply(gsap, arguments);
            gsap.timeline = originalTimelineFn;
            tl.eventCallback('onComplete', () => triggerChapter2Once('timeline-hook'));
            return tl;
          };
        } catch (e) { }
        originalStartButterflyFlight();
      };
    }
  } catch (e) { }

  const ch1Orb = document.getElementById('scene1-orb');
  if (ch1Orb) {
    ch1Orb.addEventListener('click', () => {
      gsap.delayedCall(95, () => triggerChapter2Once('fallback-timer'));
    });
  }

    function scene2GoldenLight() {
    gsap.set(goldenLight, { opacity: 1, scale: 1 });
    gsap.set(goldenRays, { opacity: 1, scale: 0.3 });

    let pulseTl = gsap.timeline({ onComplete: scene3ButterflyReturn });

    function beatParticles() {
      for (let p = 0; p < 4; p++) {
        spawnGoldParticle(window.innerWidth / 2 + (Math.random() - 0.5) * 60, window.innerHeight / 2 + (Math.random() - 0.5) * 60, { vy: -22 - Math.random() * 20, life: 1.3, color: '232,244,255' });
      }
    }

    const beats = 3;
    for (let i = 0; i < beats; i++) {
      pulseTl.fromTo(goldenLight, 
        { scale: 1 }, 
        {
          scale: 1.2, 
          boxShadow: "0 0 40px 15px rgba(248,248,255,0.9), 0 0 100px 40px rgba(232,244,255,0.55)",
          duration: 0.5, ease: "sine.out"
        }
      );
      pulseTl.fromTo(goldenRays, 
        { scale: 0.3, opacity: 0.3 }, 
        { scale: 0.5, opacity: 0.6, duration: 0.5, ease: "sine.out" }, 
        "<"
      );
      
      pulseTl.call(beatParticles);
      
      pulseTl.to(goldenLight, { 
        scale: 1, 
        boxShadow: "0 0 30px 10px rgba(248,248,255,0.85), 0 0 90px 34px rgba(232,244,255,0.5)", 
        duration: 0.4, ease: "sine.inOut" 
      });
      pulseTl.to(goldenRays, { scale: 0.3, opacity: 0.3, duration: 0.4, ease: "sine.inOut" }, "<");
    }

    // 👇 CHANGED: Removed the massive "scale: 26" explosion! 
    // Now it just gently hovers at a small size for a second before the butterfly appears.
    pulseTl.to(goldenLight, { scale: 1.1, duration: 1.4, ease: "power2.inOut" });

    gsap.to({}, {
      duration: 3,
      onUpdate: function () {
        if (Math.random() < 0.35) {
          spawnGoldParticle(window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth * 0.5, window.innerHeight / 2 + (Math.random() - 0.5) * window.innerHeight * 0.5, { vy: -14, life: 1.6, color: '232,244,255' });
        }
      }
    });
  }

  function scene3ButterflyReturn() {
    gsap.set(ch2ButterflyWrap, { xPercent: -50, yPercent: -50, x: window.innerWidth * 0.38, y: -window.innerHeight * 0.34, scale: 0.5, opacity: 0 });

    let flightTl = gsap.timeline({ onComplete: scene4WriteName });
    flightTl.to(ch2ButterflyWrap, { opacity: 1, duration: 0.3 });
    flightTl.to(ch2ButterflyWrap, {
      keyframes: [
        { x: window.innerWidth * 0.14, y: -window.innerHeight * 0.18, scale: 0.85, duration: 1.5, ease: "sine.inOut" },
        { x: -window.innerWidth * 0.06, y: window.innerHeight * 0.04, scale: 1, duration: 1.3, ease: "sine.inOut" },
        { x: 0, y: 0, scale: 1, duration: 1.1, ease: "power2.out" }
      ],
      onUpdate: function () {
        if (Math.random() < 0.6) {
          const rect = ch2ButterflyWrap.getBoundingClientRect();
          spawnGoldParticle(rect.left + rect.width / 2, rect.top + rect.height / 2, { spread: 20, vy: 12, life: 0.7, size: 2 });
        }
      }
    }, "<0.1");
    flightTl.call(() => gsap.to([goldenLight, goldenRays], { opacity: 0, duration: 0.35, ease: "power1.in" }), null, "-=0.35");
    flightTl.to(ch2ButterflyWrap, { y: "+=10", duration: 0.6, yoyo: true, repeat: 1, ease: "sine.inOut" });
  }

  function scene4WriteName() {
    gsap.to(nameText, { opacity: 1, duration: 0.3 });
    const steps = ["B", "Bi", "Bit", "Bitt", "Bitti", "Bittii", "Bittiii", "Bittiii!", "Bittiii! 💗", "Bittiii! 💗👀", "Bittiii! 💗👀😘", "Bittiii! 💗👀😘💌"];
    const stepDuration = 9 / steps.length;
    
    gsap.to(ch2ButterflyWrap, { x: "+=16", y: "-=8", duration: stepDuration, repeat: steps.length - 1, yoyo: true, ease: "sine.inOut" });
    
    let writeTl = gsap.timeline({ onComplete: scene5Celebration });
    steps.forEach((s) => {
      writeTl.call(() => {
        nameText.textContent = s;
        gsap.fromTo(nameText, { scale: 0.86 }, { scale: 1, duration: 0.32, ease: "back.out(2)" });
        burstSparkle(nameText);
      });
      writeTl.to({}, { duration: stepDuration });
    });
  }

    function scene5Celebration() {
    const count = 20 + Math.floor(Math.random() * 11);
    const swarm = [];
    const w = window.innerWidth, h = window.innerHeight;

    for (let i = 0; i < count; i++) {
      // 1. Create a wrapper <div> for GSAP to move around the screen
      const wrap = document.createElement('div');
      wrap.style.position = 'absolute';
      wrap.style.top = '0';
      wrap.style.left = '0';
      wrap.style.width = (16 + Math.random() * 36) + 'px';

      // 2. Create the <img> that handles the CSS wing-flapping
      const b = document.createElement('img');
      b.src = 'butterfly2.png';
      b.className = 'ch2-mini-butterfly';
      b.style.width = '100%'; 

      // Put the image inside the wrapper, and put the wrapper on the screen
      wrap.appendChild(b);
      swarmContainer.appendChild(wrap);
      swarm.push(wrap);

      const edge = Math.floor(Math.random() * 4);
      let startX, startY;
      if (edge === 0)      { startX = -80;    startY = Math.random() * h; }
      else if (edge === 1) { startX = w + 80;  startY = Math.random() * h; }
      else if (edge === 2) { startX = Math.random() * w; startY = -80; }
      else                 { startX = Math.random() * w; startY = h + 80; }

      const behind = Math.random() < 0.5;
      // 3. Animate the WRAPPER, not the image directly!
      gsap.set(wrap, { x: startX, y: startY, opacity: 0, scale: 0.6 + Math.random() * 0.6, zIndex: behind ? 214 : 219 });

      const midX = w / 2 + (Math.random() - 0.5) * 280;
      const midY = h / 2 + (Math.random() - 0.5) * 280;
      const delay = Math.random() * 1.3;
      const travelDur = 1.6 + Math.random() * 1.4;

      gsap.to(wrap, { opacity: 0.95, duration: 0.4, delay: delay });
      gsap.to(wrap, {
        keyframes: [
          { x: midX, y: midY, duration: travelDur, ease: "sine.inOut" },
          { x: w / 2 + (Math.random() - 0.5) * 50, y: h / 2 + (Math.random() - 0.5) * 50, duration: 1.0 + Math.random() * 0.8, ease: "power1.inOut" }
        ],
        delay: delay
      });
      gsap.to(wrap, {
        rotation: (Math.random() < 0.5 ? 1 : -1) * 360,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        ease: "none",
        delay: delay + travelDur
      });
    }

    gsap.delayedCall(3.2, () => gsap.to(nameText, { opacity: 0, duration: 0.4 }));
    gsap.delayedCall(5.5, () => scene6Reveal(swarm));
  }


  function scene6Reveal(swarm) {
    gsap.to(ch2ButterflyWrap, {
      y: "-=220",
      scale: 1.15,
      duration: 2.2,
      ease: "power2.out",
      onUpdate: function () {
        if (Math.random() < 0.7) {
          const rect = ch2ButterflyWrap.getBoundingClientRect();
          spawnGoldParticle(rect.left + rect.width / 2, rect.top + rect.height * 0.8, { vy: 32, spread: 14, life: 1.0 });
        }
      }
    });

    swarm.forEach((b) => {
      gsap.to(b, {
        x: "+=" + ((Math.random() - 0.5) * window.innerWidth * 1.2),
        y: "+=" + ((Math.random() - 0.5) * window.innerHeight * 1.2),
        opacity: 0,
        duration: 1.8 + Math.random() * 1.2,
        ease: "power1.in",
        onComplete: () => b.remove()
      });
    });

    gsap.delayedCall(0.6, () => {
      gsap.to(greeting, { opacity: 1, duration: 0.2 });
      gsap.fromTo([greetingLine1, greetingLine2],
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.4, stagger: 0.3, ease: "power2.out" }
      );
    });

    gsap.delayedCall(5.4, scene7FinalComposition);
  }

  function scene7FinalComposition() {
    const greetRect = greeting.getBoundingClientRect();
    const landX = greetRect.right - window.innerWidth / 2 - 6;
    const landY = greetRect.top - window.innerHeight / 2 - 14;

    let circleTl = gsap.timeline({ onComplete: scene8LivingEnding });
    circleTl.to(ch2ButterflyWrap, {
      keyframes: [
        { x: "+=90", y: "-=20", duration: 0.8, ease: "sine.inOut" },
        { x: "+=0",  y: "+=40", duration: 0.8, ease: "sine.inOut" },
        { x: "-=90", y: "-=20", duration: 0.8, ease: "sine.inOut" }
      ]
    });
    circleTl.to(ch2ButterflyWrap, { x: landX, y: landY, scale: 0.55, duration: 1.2, ease: "power2.inOut" });
  }

  function scene8LivingEnding() {
    gsap.to(ch2ButterflyWrap, { y: "+=8", duration: 2.2, delay: 1, yoyo: true, repeat: -1, ease: "sine.inOut" });

    gsap.to([greetingLine1, greetingLine2], {
      textShadow: "0 0 26px rgba(255,214,140,0.95), 0 0 46px rgba(255,105,180,0.6)",
      duration: 2.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    let elapsed = 0;
    let nextHeart = 2 + Math.random() * 2;
    let nextSparkle = 1 + Math.random() * 1.5;

    gsap.to({}, {
      duration: 3600,
      repeat: -1,
      onUpdate: function () {
        elapsed += gsap.ticker.deltaRatio() / 60;

        if (elapsed >= nextHeart) {
          spawnHeart();
          nextHeart = elapsed + 2.5 + Math.random() * 3;
        }
        if (elapsed >= nextSparkle) {
          spawnSparkle();
          nextSparkle = elapsed + 1.5 + Math.random() * 2;
        }
      }
    });
  }

})();
