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

    // 👇 AUDIO LOGIC: Switch the music!
    const audio1 = document.getElementById('site-audio-1');
    const audio2 = document.getElementById('site-audio-2');
    
    // Pause the first track
    if (audio1) {
      audio1.pause();
    }
    
    // Play the second track
    if (audio2) {
      audio2.play().catch(error => {
        console.warn("Audio 2 playback was prevented by the browser:", error);
      });
    }

    // Proceed with the visual animation
    window.ch2API.burstSparkle(ctaButton, '255,182,220');
    console.log('[Chapter 3] Button clicked! Starting Chapter 4 transition...');

    ctaButton.style.pointerEvents = 'none';
    gsap.killTweensOf(ctaButton);

    startDisintegrationTransition();
  });

  function startDisintegrationTransition() {
    // 1. Blow the button away smoothly in the wind
    gsap.to(ctaButton, {
      x: "+=150",
      opacity: 0,
      rotation: 45,
      duration: 0.8,
      ease: "power2.in",
      force3D: true
    });

    // 2. Fade out background elements without heavy camera zooming
    gsap.to(['#forest-img', '#moon', '.asset-img', '#stars-container'], {
      opacity: 0,
      x: "+=50",
      duration: 1.5,
      ease: "power2.inOut",
      force3D: true
    });

    // 3. SHATTER THE TEXT: Blow the greeting and lower messages away
    // We target the top lines and the individual words (.ch2-word) of the bottom lines
    gsap.to(['#ch2-greeting-line1', '#ch2-greeting-line2', '.ch2-word'], {
      x: () => "+=" + (150 + Math.random() * 200), // Random fly distance right
      y: () => (Math.random() - 0.5) * 150,        // Scatter randomly up and down
      rotation: () => (Math.random() - 0.5) * 80,  // Spin in the wind
      opacity: 0,
      scale: 0.4,                                  // Shrink as they blow away
      duration: 0.9,
      delay: 0.2,                                  // 👇 The exactly requested 0.2s delay!
      ease: "power2.in",
      stagger: 0.03,                               // Breaks them apart sequentially
      force3D: true
    });

    // 4. Trigger the lightweight wind sweep animation
    createWindSweep();

    // 5. White flash overlay & Chapter 4 trigger
    gsap.delayedCall(1.2, () => {
      const flashEl = document.getElementById('flash-overlay');
      if (!flashEl) return;

      gsap.to(flashEl, {
        opacity: 1, 
        duration: 0.4, 
        ease: "power1.in",
        onComplete: () => {
          if (typeof window.startChapter4 === 'function') {
            window.startChapter4();
          } else {
            console.warn('[Chapter 3] window.startChapter4 is not defined.');
          }
          
          gsap.to(flashEl, { opacity: 0, duration: 1.2, ease: "power1.out", delay: 0.2 });
        }
      });
    });
  }

  function createWindSweep() {
    const layer = document.createElement('div');
    layer.style.position = 'fixed';
    layer.style.top = '0';
    layer.style.left = '0';
    layer.style.width = '100%';
    layer.style.height = '100%';
    layer.style.pointerEvents = 'none';
    layer.style.zIndex = '300';
    layer.style.overflow = 'hidden';
    document.body.appendChild(layer);

    // 35 lightweight CSS petals
    for (let i = 0; i < 35; i++) {
      const petal = document.createElement('div');
      petal.style.position = 'absolute';
      petal.style.left = '-10%';
      petal.style.top = Math.random() * 100 + '%';
      
      const size = 8 + Math.random() * 10;
      petal.style.width = size + 'px';
      petal.style.height = (size * 1.5) + 'px';
      petal.style.background = Math.random() > 0.4 ? '#ffb7c5' : '#ffffff';
      
      petal.style.borderRadius = '50% 0 50% 0';
      petal.style.boxShadow = '0 0 6px rgba(255, 183, 197, 0.5)';
      petal.style.opacity = '0.85';
      petal.style.willChange = 'transform';

      layer.appendChild(petal);

      gsap.to(petal, {
        x: window.innerWidth + 200, 
        y: `+=${(Math.random() - 0.5) * 150}`, 
        rotation: Math.random() * 500, 
        duration: 0.7 + Math.random() * 0.7,
        delay: Math.random() * 0.4,
        ease: "power1.inOut",
        force3D: true
      });
    }

    // 8 glowing light streaks
    for (let i = 0; i < 8; i++) {
      const streak = document.createElement('div');
      streak.style.position = 'absolute';
      streak.style.left = '-20%';
      streak.style.top = Math.random() * 100 + '%';
      streak.style.width = (60 + Math.random() * 150) + 'px';
      streak.style.height = (1 + Math.random() * 2) + 'px';
      streak.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)';
      streak.style.willChange = 'transform';
      
      layer.appendChild(streak);

      gsap.to(streak, {
        x: window.innerWidth + 400,
        duration: 0.4 + Math.random() * 0.4,
        delay: Math.random() * 0.3,
        ease: "power2.in",
        force3D: true
      });
    }

    gsap.delayedCall(2.0, () => layer.remove());
  }

})();
