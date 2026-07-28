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
    // 1. Build the text container
    const textContainer = document.createElement('div');
    textContainer.id = 'ch4-text-container';
    chapter4Container.appendChild(textContainer);

    // 2. Build the paragraphs and add them to the screen (invisible at first)
    const domParas = messageParagraphs.map(text => {
      const p = document.createElement('p');
      p.className = 'ch4-paragraph';
      p.textContent = text;
      textContainer.appendChild(p);
      return p;
    });

    // 3. Animate the paragraphs one by one
    let tl = gsap.timeline();

    // Wait 1.5 seconds after the flash fades away before showing the first text
    tl.to({}, { duration: 1.5 });

    domParas.forEach((p, index) => {
      // Float up and fade in smoothly
      tl.fromTo(p, 
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 2.5, ease: "power2.out", force3D: true }
      );
      
      // Pause so the reader has time to read the paragraph before the next one appears
      // (The second paragraph is longer, so it gets a 4.5s pause instead of 3.0s)
      const readTime = index === 1 ? 4.5 : 3.0; 
      tl.to({}, { duration: readTime });
    });

    // 4. Once all text is on screen, give it a subtle, continuous "living" float
    tl.call(() => {
      domParas.forEach((p, i) => {
        gsap.to(p, {
          y: "-=8",
          duration: 2.5 + Math.random(),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.3,
          force3D: true
        });
      });
    });
  }

})();
