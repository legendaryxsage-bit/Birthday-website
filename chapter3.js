// =============================================================================
// CHAPTER 3 — THE COMET & INVITATION (SCENES 9-14)
// =============================================================================
console.log("✅ SUCCESS: chapter3.js has loaded into the browser!");

(function () {

  const cometWrapper  = document.getElementById('ch2-comet-wrapper');
  const finalLine1    = document.getElementById('ch2-final-line1');
  const finalLine2    = document.getElementById('ch2-final-line2');
  const ctaButton     = document.getElementById('ch2-cta-button');

  let cinematicStarted = false;
  let greetingVisibleTimer = null;

  function watchForGreeting() {
    if (cinematicStarted) return;
    
    const target = document.getElementById('ch2-greeting-line2');
    if (!target) return;
    
    const opacity = parseFloat(window.getComputedStyle(target).opacity) || 0;
    
    if (opacity >= 0.95) {
      if (!greetingVisibleTimer) {
        greetingVisibleTimer = gsap.delayedCall(3, () => {
          cinematicStarted = true;
          scene9MagicalComet();
        });
      }
    } else {
      if (greetingVisibleTimer) {
        greetingVisibleTimer.kill();
        greetingVisibleTimer = null;
      }
    }
  }
  gsap.ticker.add(watchForGreeting);

  window.skipToChapter3 = function() {
    if (cinematicStarted) return;
    cinematicStarted = true;
    console.log('[Chapter 3] MANUALLY TRIGGERED!');
    window.ch2API.container.style.pointerEvents = 'auto';
    scene9MagicalComet();
  };

  function scene9MagicalComet() {
    gsap.set(cometWrapper, {
      xPercent: -50, yPercent: -50,
      x: window.innerWidth * 0.45,
      y: -window.innerHeight * 0.45,
      opacity: 0,
      scale: 0.6
    });

    let cometTl = gsap.timeline({ onComplete: scene10CameraMove });

    cometTl.to(cometWrapper, { opacity: 1, duration: 0.3 });
    cometTl.to(cometWrapper, {
      keyframes: [
        { x: window.innerWidth * 0.05,  y: -window.innerHeight * 0.25, scale: 0.85, duration: 1.0, ease: "sine.inOut" },
        { x: -window.innerWidth * 0.20, y: -window.innerHeight * 0.05, scale: 1,    duration: 1.0, ease: "sine.inOut" }
      ],
      onUpdate: function () {
        if (Math.random() < 0.85) {
          const rect = cometWrapper.getBoundingClientRect();
          window.ch2API.spawnGoldParticle(
            rect.left + rect.width / 2, rect.top + rect.height / 2,
            { spread: 20, vy: 4, life: 1.0, size: 1.6 + Math.random() * 1.5, color: '235,245,255' }
          );
        }
      }
    }, "<");
    
    cometTl.to(cometWrapper, { opacity: 0, scale: 0.15, duration: 0.4, ease: "power1.in" });
    cometTl.call(() => {
      const rect = cometWrapper.getBoundingClientRect();
      for (let i = 0; i < 15; i++) {
        window.ch2API.spawnGoldParticle(
          rect.left + rect.width / 2, rect.top + rect.height / 2,
          { spread: 45, vy: (Math.random() - 0.5) * 20, life: 1.2, size: 1.5 + Math.random() * 2, color: '235,245,255' }
        );
      }
    }, null, "-=0.3");
  }

  function scene10CameraMove() {
    const shiftY = Math.round(window.innerHeight * 0.20);

    gsap.to(window.ch2API.container, {
      y: "-=" + shiftY,
      scale: 1.25,
      duration: 1.5,
      ease: "power2.inOut",
      force3D: true, 
      onComplete: scene11FirstMessage
    });

    if (typeof window.pushChapter1CameraZoom === 'function') {
      window.pushChapter1CameraZoom(3.2, 1.5, "power2.inOut");
    }
  }

  function revealWords(el, text, onDone) {
    el.innerHTML = '';
    const words = text.split(' ').filter(Boolean);
    const spans = words.map((w, i) => {
      const span = document.createElement('span');
      span.className = 'ch2-word';
      span.textContent = w + (i < words.length - 1 ? '\u00A0' : '');
      el.appendChild(span);
      return span;
    });
    
    gsap.fromTo(spans,
      { opacity: 0, y: 18, textShadow: "0 0 0px rgba(255,214,160,0)" },
      { opacity: 1, y: 0, textShadow: "0 0 14px rgba(255,214,160,0.85)", duration: 0.8, stagger: 0.25, ease: "power2.out", onComplete: onDone }
    );
  }

  function scene11FirstMessage() {
    revealWords(finalLine1, "I have something special waiting for you... ✨🌸🫶💖", () => {
      gsap.delayedCall(2, scene12SecondMessage);
    });
  }

  function scene12SecondMessage() {
    revealWords(finalLine2, "🤌Will you come with me...?? 🥹💗", () => {
      gsap.delayedCall(1, scene13ButtonReveal);
    });
  }

  function scene13ButtonReveal() {
    ctaButton.textContent = "💖✨ Yes, Take Me There😘🌸";
    ctaButton.style.pointerEvents = 'auto';

    gsap.set(ctaButton, {
      xPercent: -50, yPercent: -50,
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      opacity: 0,
      scale: 0.9
    });

    const line2Rect = finalLine2.getBoundingClientRect();
    const btnRect = ctaButton.getBoundingClientRect();
    const desiredGap = 110;
    const safeBottomMargin = 32; 
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const maxCenterY = viewportHeight - safeBottomMargin - btnRect.height / 2;
    const desiredCenterY = Math.min(
      line2Rect.bottom + desiredGap + btnRect.height / 2,
      maxCenterY
    );
    const deltaY = desiredCenterY - (btnRect.top + btnRect.height / 2);

    const ctaContainerScale = gsap.getProperty(window.ch2API.container, "scale") || 1;
    gsap.set(ctaButton, { y: "+=" + ((deltaY - 40) / ctaContainerScale) });

    gsap.to(ctaButton, {
      opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)",
      onComplete: () => {
        gsap.to(ctaButton, { y: "+=12", duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.to(ctaButton, {
          boxShadow: "0 0 30px 8px rgba(255,255,255,0.8), 0 0 50px 15px rgba(255,105,180,0.65)",
          duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut"
        });
      }
    });

    gsap.killTweensOf(window.ch2API.butterflyWrap, "y");

    gsap.delayedCall(0.5, () => {
      const bRect = window.ch2API.butterflyWrap.getBoundingClientRect();
      const tRect = ctaButton.getBoundingClientRect();
      
      const flyContainerScale = (typeof camera !== 'undefined' && camera.scale) ? camera.scale : 1;
      const dx = ((tRect.right + 45) - (bRect.left + bRect.width / 2)) / flyContainerScale;
      const dy = ((tRect.top + tRect.height / 2) - (bRect.top + bRect.height / 2)) / flyContainerScale;

      let flyTl = gsap.timeline({ onComplete: scene14LivingAmbient });
      
      flyTl.to(window.ch2API.butterflyWrap, { x: "+=" + dx, y: "+=" + dy, scale: 0.65, duration: 1.5, ease: "power2.inOut" });
      flyTl.to(window.ch2API.butterflyWrap, {
        keyframes: [
          { x: "-=100", y: "-=50", duration: 0.5, ease: "sine.inOut" },
          { x: "-=100", y: "+=50", duration: 0.5, ease: "sine.inOut" },
          { x: "+=100", y: "+=50", duration: 0.5, ease: "sine.inOut" },
          { x: "+=100", y: "-=50", duration: 0.5, ease: "sine.inOut" }
        ]
      });
    });
  }

  function scene14LivingAmbient() {
    gsap.to(window.ch2API.butterflyWrap, { y: "+=10", duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    gsap.to([finalLine1, finalLine2], {
      textShadow: "0 0 20px rgba(255,214,160,0.95), 0 0 35px rgba(255,130,190,0.65)",
      duration: 2.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }

  let transitionStarted = false;

  ctaButton.addEventListener('click', () => {
    if (transitionStarted) return;
    transitionStarted = true;

    window.ch2API.burstSparkle(ctaButton, '255,182,220');
    console.log('[Chapter 3] Button clicked! Starting Chapter 4 transition...');

    ctaButton.style.pointerEvents = 'none';
    gsap.killTweensOf(ctaButton);

    startDisintegrationTransition();
  });

    function startDisintegrationTransition() {
    const rect = ctaButton.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const originXPct = (cx / window.innerWidth) * 100;
    const originYPct = (cy / window.innerHeight) * 100;
    window.ch2API.container.style.transformOrigin = originXPct + '% ' + originYPct + '%';

    const appContainerEl = document.getElementById('app-container');
    if (appContainerEl) {
      appContainerEl.style.transformOrigin = originXPct + '% ' + originYPct + '%';
    }

    shatterIntoCrystals(ctaButton, cx, cy);

    let zoomTl = gsap.timeline({
      onComplete: () => {
        if (typeof window.startChapter4 === 'function') {
          window.startChapter4();
        } else {
          console.warn('[Chapter 3] window.startChapter4 is not defined yet — did chapter4.js load?');
        }
      }
    });
    
    // 👇 FIX 1: Lower the Chapter 2 container scale from 4.5 to 2.5 to save GPU memory
    zoomTl.to(window.ch2API.container, { scale: 2.5, duration: 2.5, ease: "power2.inOut", force3D: true });

    if (typeof window.pushChapter1CameraZoom === 'function') {
      // 👇 FIX 2: Lowered the background zoom from 12x to 3x! 
      window.pushChapter1CameraZoom(3, 2.5, "power2.inOut");
    }

    // 👇 FIX 3: Rapidly fade out all the heavy background PNGs immediately when the button is clicked
    // so the phone's GPU doesn't have to calculate massive zooming clouds and forests.
    gsap.to(['#forest-img', '#moon', '.asset-img', '#stars-container'], {
      opacity: 0,
      duration: 1.0,
      ease: "power2.out"
    });

    // The white flash stays the same
    gsap.delayedCall(1.8, () => {
      const flashEl = document.getElementById('flash-overlay');
      if (!flashEl) return;
      gsap.to(flashEl, {
        opacity: 1, duration: 0.4, ease: "power1.in",
        onComplete: () => gsap.to(flashEl, { opacity: 0, duration: 0.8, ease: "power1.out" })
      });
    });

    
    zoomTl.to(window.ch2API.container, { scale: 4.5, duration: 2.9, ease: "power2.inOut", force3D: true });

    if (typeof window.pushChapter1CameraZoom === 'function') {
      window.pushChapter1CameraZoom(12, 2.9, "power2.inOut");
    }

    const frontClouds = ['cloud3', 'cloud4', 'cloud6', 'cloud7']
      .map(id => document.getElementById(id))
      .filter(Boolean);

    frontClouds.forEach((cloud, i) => {
      gsap.to(cloud, {
        scale: 2.6 + Math.random() * 0.6,
        x: "+=" + Math.round((Math.random() - 0.5) * 260),
        y: "-=" + Math.round(80 + Math.random() * 60),
        opacity: 0,
        duration: 2.5 + Math.random() * 0.3,
        delay: 0.15 + i * 0.05,
        ease: "power2.in",
        force3D: true
      });
    });

    gsap.delayedCall(2.5, () => {
      const flashEl = document.getElementById('flash-overlay');
      if (!flashEl) return;
      gsap.to(flashEl, {
        opacity: 1, duration: 0.3, ease: "power1.in",
        onComplete: () => gsap.to(flashEl, { opacity: 0, duration: 0.6, ease: "power1.out" })
      });
    });
  }

  function shatterIntoCrystals(el, originX, originY) {
    const rect = el.getBoundingClientRect();

    const layer = document.createElement('div');
    layer.id = 'ch3-crystal-layer';

    const fragment = document.createDocumentFragment();

    gsap.to(el, { opacity: 0, duration: 0.12, ease: "power1.in" });

    // 👇 OPTIMIZATION 1: Reduced shard grid from 7x4 to 5x3 to cut out lag (15 shards instead of 28)
    const cols = 5;
    const rows = 3;
    const shardW = rect.width / cols;
    const shardH = rect.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const shard = document.createElement('div');
        shard.className = 'ch3-crystal-shard';

        const w = shardW * (0.65 + Math.random() * 0.55);
        const h = shardH * (0.65 + Math.random() * 0.55);
        shard.style.width = w + 'px';
        shard.style.height = h + 'px';
        shard.style.left = (rect.left + c * shardW + (shardW - w) / 2) + 'px';
        shard.style.top = (rect.top + r * shardH + (shardH - h) / 2) + 'px';
        shard.style.willChange = 'transform, opacity'; // GPU hint

        fragment.appendChild(shard);

        const shardCx = rect.left + (c + 0.5) * shardW;
        const shardCy = rect.top + (r + 0.5) * shardH;
        let angle = Math.atan2(shardCy - originY, shardCx - originX);
        if (!isFinite(angle)) angle = Math.random() * Math.PI * 2;
        angle += (Math.random() - 0.5) * 0.6;

        const dist = 60 + Math.random() * 200;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 30;

        gsap.to(shard, {
          x: dx,
          y: dy,
          rotation: (Math.random() - 0.5) * 480,
          opacity: 0,
          // 👇 OPTIMIZATION 2: Lowered scale. (The camera zooming in 4.5x makes this huge naturally)
          scale: 1.5 + Math.random() * 1.5, 
          duration: 2.3 + Math.random() * 0.5,
          delay: (dist / 250) * 0.1,
          ease: "power2.in", 
          force3D: true
        });
      }
    }

    const flowerEmojis = ['🏵️', '🌼', '💮'];
    // 👇 OPTIMIZATION 3: Reduced flower count from 18 to 12
    for (let i = 0; i < 12; i++) {
      const flower = document.createElement('div');
      flower.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
      flower.style.position = 'absolute';
      flower.style.left = originX + 'px';
      flower.style.top = originY + 'px';
      flower.style.transform = 'translate(-50%, -50%)'; 
      flower.style.fontSize = (18 + Math.random() * 12) + 'px';
      flower.style.zIndex = 250; 
      flower.style.willChange = 'transform, opacity'; // GPU hint to prevent lag
      
      fragment.appendChild(flower);

      let angle = Math.random() * Math.PI * 2;
      let dist = 100 + Math.random() * 350; 
      let dx = Math.cos(angle) * dist;
      let dy = Math.sin(angle) * dist;

      gsap.fromTo(flower, 
        { x: 0, y: 0, scale: 0, opacity: 1, rotation: Math.random() * 360 },
        {
          x: dx,
          y: dy,
          // 👇 OPTIMIZATION 4: Realistic scale limit. Combined with the 4.5x camera zoom, 
          // they effectively hit 13x - 22x scale, which is perfect and entirely lag-free.
          scale: 3 + Math.random() * 2, 
          rotation: "+=" + ((Math.random() - 0.5) * 360),
          opacity: 0, 
          duration: 2.4 + Math.random() * 0.5,
          ease: "power2.in", 
          force3D: true
        }
      );
    }

    layer.appendChild(fragment);
    window.ch2API.container.appendChild(layer);

    for (let i = 0; i < 20; i++) {
      window.ch2API.spawnGoldParticle(
        originX, originY,
        { spread: 60, vy: (Math.random() - 0.5) * 14, life: 1.1, size: 1.2 + Math.random() * 1.8, color: '255,220,240' }
      );
    }

    gsap.delayedCall(3.1, () => layer.remove());
  }
})();
