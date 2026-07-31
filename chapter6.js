// =============================================================================
// CHAPTER 6 — THE WISH
// =============================================================================
console.log("✅ SUCCESS: chapter6.js has loaded into the browser!");

(function () {
  
  const chapter6Container = document.getElementById('chapter6-container');
  const card = document.getElementById('ch6-card');
  const wishInput = document.getElementById('ch6-wish-input');
  const sendBtn = document.getElementById('ch6-send-btn');
  const btnText = document.querySelector('.ch6-btn-text');
  const btnLoader = document.querySelector('.ch6-btn-loader');
  const successMessage = document.getElementById('ch6-success-message');
  const butterfly = document.getElementById('ch6-butterfly');
  const particlesContainer = document.getElementById('ch6-particles');
  const sparklesContainer = document.getElementById('ch6-sparkles-container');

  let activeHeartSpawner = null; // Controls our continuous heart stream

  // Spawn lightweight ambient CSS particles
  function spawnAmbientParticles() {
    const count = window.innerWidth < 768 ? 15 : 30;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'ch6-particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 4}s`;
      p.style.animationDuration = `${4 + Math.random() * 4}s`;
      particlesContainer.appendChild(p);
    }
  }

  // Auto-resize the textarea gracefully
  wishInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  window.startChapter6 = function () {
    console.log('[Chapter 6] Starting The Wish scene...');

    const chapter5Container = document.getElementById('chapter5-container');
    if (chapter5Container) {
      gsap.to(chapter5Container, { opacity: 0, duration: 1, pointerEvents: 'none' });
    }

    chapter6Container.style.pointerEvents = 'auto';
    spawnAmbientParticles();
    
    gsap.to(chapter6Container, { opacity: 1, duration: 1, ease: 'sine.inOut' });
    
    setTimeout(() => {
      card.classList.add('ch6-visible');
    }, 500); 
  };

  // --- MANUAL TEST TRIGGER ---
  window.skipToChapter6 = function () {
    console.log('[Chapter 6] MANUALLY TRIGGERED!');
    ['chapter2-container', 'chapter4-container', 'chapter5-container'].forEach(id => {
      const el = document.getElementById(id);
      if (el) gsap.set(el, { opacity: 0, pointerEvents: 'none' });
    });
    window.startChapter6();
  };

  // --- Core Interaction ---
  sendBtn.addEventListener('click', async () => {
    const wishText = wishInput.value.trim();
    
    if (!wishText) {
      wishInput.style.borderColor = '#ff4d4d';
      setTimeout(() => wishInput.style.borderColor = 'rgba(255, 182, 193, 0.4)', 1000);
      return;
    }

    // Capture the button's exact coordinates before it fades away
    const rect = sendBtn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    // Start a continuous stream of glowing hearts (every 300ms)
    activeHeartSpawner = gsap.to({}, {
      duration: 0.3,
      repeat: -1,
      onRepeat: () => spawnGlowingHearts(originX, originY)
    });
    
    // Spawn an immediate initial burst of hearts for good feedback
    spawnGlowingHearts(originX, originY);
    spawnGlowingHearts(originX, originY);

    // Disable UI & Show Loading State
    sendBtn.disabled = true;
    wishInput.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    await saveWishToFirebase(wishText);

    triggerSuccessAnimation();
  });

  // REAL Firebase Integration
  async function saveWishToFirebase(message) {
    try {
      // Connects to the 'db' we initialized in index.html
      // Creates a folder called 'wishes' and saves the message and exact time
      await db.collection('wishes').add({
        wish: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log("Success! Wish saved to database.");
      
    } catch (error) {
      console.error("Error saving wish:", error);
      // Fallback delay just in case of internet failure so the animation still plays
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }



  function triggerSuccessAnimation() {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    setTimeout(() => card.classList.add('hidden'), 1000);

    spawnSparkles();

    butterfly.classList.remove('hidden');
    butterfly.classList.add('ch6-fly-animation');

    setTimeout(() => {
      successMessage.classList.remove('hidden'); 
      setTimeout(() => {
        successMessage.classList.add('ch6-show');
      }, 50);
    }, 800);

    // Fade out message and STOP hearts
    setTimeout(() => {
      successMessage.classList.remove('ch6-show');
      
      // 👇 THE FIX: Stop the continuous heart stream once the message fades
      if (activeHeartSpawner) {
        activeHeartSpawner.kill();
      }
      
      setTimeout(() => {
        if (typeof window.startChapter7 === 'function') {
          window.startChapter7();
        } else {
          console.warn('[Chapter 6] startChapter7() is not defined yet.');
        }
      }, 1500); 
      
    }, 4500); 
  }

  function spawnSparkles() {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 12 : 25;
    
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'ch6-tiny-sparkle';
      
      const posX = 40 + Math.random() * 20; 
      const posY = 40 + Math.random() * 20;
      
      sparkle.style.left = `${posX}%`;
      sparkle.style.top = `${posY}%`;
      
      sparklesContainer.appendChild(sparkle);
      
      gsap.to(sparkle, {
        x: (Math.random() - 0.5) * (isMobile ? 150 : 300),
        y: (Math.random() - 0.5) * (isMobile ? 150 : 300),
        opacity: 1,
        scale: Math.random() * 1.5 + 0.5,
        duration: 0.8 + Math.random() * 0.5,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(sparkle, {
            opacity: 0,
            y: "+=30",
            duration: 1 + Math.random(),
            ease: 'sine.in',
            onComplete: () => sparkle.remove()
          });
        }
      });
    }
  }

  // Spawns BIGGER glowing neon hearts that float continuously
  function spawnGlowingHearts(startX, startY) {
    // Spawn 1 or 2 hearts per tick so it looks like a continuous natural flow
    const count = 1 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < count; i++) {
      const heartWrap = document.createElement('div');
      heartWrap.className = 'ch6-floating-heart';
      
      heartWrap.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
      
      document.body.appendChild(heartWrap);

      // 👇 BIGNESS UPGRADE: Sizes now range from 60px to 120px 
      const size = 60 + Math.random() * 60;
      
      gsap.set(heartWrap, {
        x: startX - size / 2,
        y: startY - size / 2,
        width: size,
        height: size,
        opacity: 0,
        scale: 0.5
      });

      // Spread further horizontally, and float much higher into the sky
      const xOffset = (Math.random() - 0.5) * 250;
      const yOffset = -350 - Math.random() * 350;

      gsap.to(heartWrap, {
        x: `+=${xOffset}`,
        y: `+=${yOffset}`,
        scale: 1 + Math.random() * 0.8, 
        rotation: (Math.random() - 0.5) * 45, 
        duration: 2.5 + Math.random() * 2, // Travel slower/longer
        ease: "power1.out",
        force3D: true 
      });

      // Fade in smoothly, stay visible, then fade out just before removed
      gsap.to(heartWrap, {
        opacity: 1,
        duration: 0.4,
        onComplete: () => {
          gsap.to(heartWrap, {
            opacity: 0,
            duration: 1.5,
            delay: 1.0 + Math.random(),
            onComplete: () => heartWrap.remove() // Zero lag because DOM is cleaned instantly!
          });
        }
      });
    }
  }

})();
