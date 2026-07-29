// =============================================================================
// CHAPTER 4 — THE FINAL MESSAGE
// =============================================================================
console.log("✅ SUCCESS: chapter4.js has loaded into the browser!");

(function () {

  const chapter4Container = document.getElementById('chapter4-container');

  // Your beautiful message broken into paragraphs
  const messageParagraphs = [
    "Today is your special day, and I just want you to know how much precious you are to mehhh...forreverr 🥹🫀💗🫠",
    "May every birthdayyy of your life bring countless reasons to smile. I wish Radha-Krishna 💕✨💞 always take care of you....💝🫶🧿 in every situation, and may all your problems become mine, as always, and my happiness become yourrss. 😽🌷",
    "No matter how much time passes, I will always keep you in my mind and heart as well. 😂😘😝",
    "At last, I want you to know that you're the reason for my smileee. 🤌💓🫣🌼"
  ];

  // Called by chapter3.js once the crystal-shatter + camera zoom finishes[span_1](start_span)[span_1](end_span).
  window.startChapter4 = function () {
    console.log('[Chapter 4] Starting...');

    if (!chapter4Container) {
      console.warn('[Chapter 4] #chapter4-container not found in the HTML.');
      return;
    }

    // Hide the whole Chapter 2/3 overlay now that we're handing off, so
    // nothing from the old scene lingers underneath Chapter 4[span_2](start_span)[span_2](end_span).
    if (window.ch2API && window.ch2API.container) {
      window.ch2API.container.style.opacity = '0';
      window.ch2API.container.style.pointerEvents = 'none';
    }

    chapter4Container.style.pointerEvents = 'auto';
    
    // The Chapter 3 flash peaks at exactly 2.8 seconds.
    // We delay Chapter 4's appearance to match that peak so the transition is seamless!
    gsap.to(chapter4Container, {
      opacity: 1,
      duration: 0.1, // Instant reveal while the screen is blinding white
      delay: 0, 
      onComplete: scene1Chapter4
    });
  };

  // -------------------------------------------------------------------
  // Scene 1 — The Message
  // -------------------------------------------------------------------
    function scene1Chapter4() {
    const masterContainer = document.createElement('div');
    masterContainer.id = 'ch4-master-container';
    chapter4Container.appendChild(masterContainer);

    const cameraDirections = [
      { scale: 1.15, x: "-6%", y: "0%" },   // 1. Right + Forward
      { scale: 1.15, x: "6%", y: "6%" },    // 2. Left + Forward + Upward
      { scale: 1.15, x: "-6%", y: "-6%" },  // 3. Right + Forward + Lower
      { scale: 1.20, x: "0%", y: "0%" }     // 4. Center intense zoom
    ];

    // Build all scenes initially (hidden)
    messageParagraphs.forEach((text, index) => {
      const scene = document.createElement('div');
      scene.className = `ch4-scene ch4-scene-${index + 1}`;
      
      const bg = document.createElement('div');
      bg.className = `ch4-bg ch4-bg-${index + 1}`;
      
      const textWrap = document.createElement('div');
      textWrap.className = 'ch4-text-wrap';
      
      const p = document.createElement('p');
      p.className = 'ch4-paragraph';
      p.textContent = text;
      
      textWrap.appendChild(p);
      scene.appendChild(bg);
      scene.appendChild(textWrap);
      masterContainer.appendChild(scene);
    });

    // Create the Next button
    const nextBtn = document.createElement('div');
    nextBtn.id = 'ch4-next-btn';
    nextBtn.textContent = 'Next ➔';
    chapter4Container.appendChild(nextBtn);

    let currentStep = 0;

    // Function to play a specific scene
    function showScene(stepIndex) {
      const scene = document.querySelector(`.ch4-scene-${stepIndex + 1}`);
      const bg = scene.querySelector('.ch4-bg');
      const textWrap = scene.querySelector('.ch4-text-wrap');
      const cam = cameraDirections[stepIndex];

      // Fade in the new scene over the old one
      gsap.to(scene, { opacity: 1, duration: 1.5, ease: "sine.inOut" });

      // Start a very slow, continuous camera pan (20 seconds so it keeps moving while she reads)
      gsap.to(bg, { 
        scale: cam.scale, x: cam.x, y: cam.y, 
        duration: 20, ease: "power1.out", force3D: true 
      });

      // Float the text in gently
      gsap.fromTo(textWrap, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 2, ease: "power2.out", delay: 0.5, force3D: true }
      );

      // Manage the Next Button
      if (stepIndex < messageParagraphs.length - 1) {
        // Show the button after 2.5 seconds (gives her time to start reading)
        gsap.to(nextBtn, { 
          opacity: 1, 
          duration: 1, 
          delay: 2.5, 
          onComplete: () => { nextBtn.style.pointerEvents = 'auto'; } 
        });
        
        // Make the button pulse slightly so she knows to click it
        gsap.to(nextBtn, { scale: 1.05, duration: 1, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.5 });
      } else {
        // If it's the final paragraph, add the floating breathing effect to the text instead
        gsap.to(textWrap, { y: "-=10", duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.5 });

        // Give her time to read the last paragraph, then hand off to the finale.
        gsap.delayedCall(8, () => {
          if (typeof window.startChapter5 === 'function') {
            window.startChapter5();
          } else {
            console.warn('[Chapter 4] window.startChapter5 is not defined — is chapter5.js loaded?');
          }
        });
      }
    }

    // Button Click Event
    nextBtn.addEventListener('click', () => {
      // Instantly disable the button so she can't double-click
      nextBtn.style.pointerEvents = 'none';
      
      // Hide the button and stop its pulsing
      gsap.killTweensOf(nextBtn, "scale");
      gsap.to(nextBtn, { opacity: 0, scale: 1, duration: 0.5 });

      // Fade out the current text upward
      const oldText = document.querySelector(`.ch4-scene-${currentStep + 1} .ch4-text-wrap`);
      gsap.to(oldText, { opacity: 0, y: -20, duration: 1, ease: "power2.in" });

      // Advance to the next step after the text fades out
      currentStep++;
      gsap.delayedCall(0.8, () => {
        showScene(currentStep);
      });
    });

    // Start the first scene after a short delay (waiting for the Chapter 3 white flash to settle)
    gsap.delayedCall(1.5, () => {
      showScene(0);
    });
  }

})();
