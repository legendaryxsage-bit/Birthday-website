const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const orb = document.getElementById('scene1-orb');
const text = document.getElementById('scene1-text');
const nightBg = document.getElementById('night-bg');
const heartWrap = document.getElementById('heart-wrapper');
const crystalBox = document.getElementById('crystal-container');
const flash = document.getElementById('flash-overlay');
const butterflyWrap = document.getElementById('butterfly-wrapper');
const cloud1 = document.getElementById('cloud1');
const cloud2 = document.getElementById('cloud2');
const cloud3 = document.getElementById('cloud3');
const cloud4 = document.getElementById('cloud4');
const cloud5 = document.getElementById('cloud5');
const cloud6 = document.getElementById('cloud6');
const cloud7 = document.getElementById('cloud7');
const moon = document.getElementById('moon');
const appContainer = document.getElementById('app-container');
const starsContainer = document.getElementById('stars-container');
const forestImg = document.getElementById('forest-img'); // Changed from beachVideo
const firefliesContainer = document.getElementById('fireflies-container');

// ---------------------------------------------------------------------
// VIRTUAL CAMERA
// ---------------------------------------------------------------------
const camera = {
  x: 0,
  y: 0,
  scale: 1,
  targetX: 0,
  targetY: 0,
  targetScale: 1,
  followTarget: null,
  followX: false,
  followY: true,
  smoothing: 1
};

function updateCamera() {
  if (camera.followTarget) {
    if (camera.followX) camera.targetX = -gsap.getProperty(camera.followTarget, "x");
    if (camera.followY) camera.targetY = -gsap.getProperty(camera.followTarget, "y");
  }
  camera.x += (camera.targetX - camera.x) * camera.smoothing;
  camera.y += (camera.targetY - camera.y) * camera.smoothing;
  camera.scale += (camera.targetScale - camera.scale) * camera.smoothing;

  gsap.set(appContainer, { x: camera.x, y: camera.y, scale: camera.scale });
}
gsap.ticker.add(updateCamera);

// ---------------------------------------------------------------------
// CAMERA BRIDGE
// ---------------------------------------------------------------------
window.pushChapter1CameraZoom = function (targetScale, duration, ease) {
  camera.followY = false; 
  gsap.to(camera, { targetScale: targetScale, duration: duration, ease: ease || "power2.in" });
};

gsap.to([orb, text], { opacity: 1, duration: 2, delay: 0.5 });

orb.addEventListener('click', () => {
  gsap.to([orb, text], { opacity: 0, duration: 0.5, onComplete: startScene2 });
});

function startScene2() {
  orb.classList.add('hidden');
  text.classList.add('hidden');
  
  gsap.to(nightBg, { opacity: 1, duration: 1.5 });
  
  gsap.delayedCall(2.5, () => {
    heartWrap.classList.remove('hidden');
    gsap.fromTo(heartWrap, { scale: 0, opacity: 0 }, { 
      scale: 1, 
      opacity: 1, 
      duration: 1, 
      ease: "back.out(1.5)",
      onComplete: () => {
        let beatTl = gsap.timeline({ onComplete: startScene3 });
        beatTl.to(heartWrap, { scale: 1.2, duration: 1, yoyo: true, repeat: 5 });
      }
    });
  });
}

function startScene3() {
  const numCrystals = 12;
  let domCrystals = [];
  
  for(let i=0; i<numCrystals; i++) {
    let el = document.createElement('div');
    el.className = 'dom-crystal';
    crystalBox.appendChild(el);
    domCrystals.push(el);
  }

  let spiralData = { radius: 100, rotation: 0 };
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  function updateCrystals() {
    domCrystals.forEach((el, i) => {
      let angle = (Math.PI * 2 / numCrystals) * i + spiralData.rotation;
      let x = centerX + Math.cos(angle) * spiralData.radius - 5;
      let y = centerY + Math.sin(angle) * spiralData.radius - 8;
      
      gsap.set(el, { x: x, y: y, rotation: (angle * 180 / Math.PI) + 90, opacity: 1 });
    });
  }

  let ritualTl = gsap.timeline({ onUpdate: updateCrystals, onComplete: startScene4 });
  
  ritualTl.to(spiralData, { radius: 180, duration: 1.5, ease: "power2.out" });
  ritualTl.to(spiralData, { radius: 130, duration: 1.5, ease: "power2.inOut" });
  ritualTl.to(spiralData, { radius: 0, rotation: Math.PI * 6, duration: 2.5, ease: "power3.in" });
  ritualTl.to('.dom-crystal', { opacity: 0, duration: 0.1, onComplete: () => crystalBox.innerHTML = '' });
}

function startScene4() {
  let flashTl = gsap.timeline({ onComplete: startSceneSkyReveal });
  
  flashTl.to(heartWrap, { scale: 1.3, duration: 1 });
  flashTl.to(flash, { opacity: 1, duration: 0.65 });
  
  flashTl.call(() => {
    heartWrap.classList.add('hidden');
    butterflyWrap.classList.remove('hidden');
    gsap.fromTo(butterflyWrap, { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.65, ease: "back.out(1.7)" });
  });
  
  flashTl.to(flash, { opacity: 0, duration: 0.8 });
}

// ---------------------------------------------------------------------
// LIVING STARS
// ---------------------------------------------------------------------
function createStars() {
  if (starsContainer.dataset.built === '1') return;
  starsContainer.dataset.built = '1';

  const starCount = 20 + Math.floor(Math.random() * 11);
  const w = window.innerWidth;
  const h = window.innerHeight;

  const yMinPct = -114;
  const yMaxPct = -76;

  const moonXMinPct = 34;
  const moonXMaxPct = 66;

  const minSpacingPx = Math.min(w, h) * 0.065;
  const placed = [];

  let created = 0;
  let attempts = 0;
  const maxAttempts = starCount * 80;

  while (created < starCount && attempts < maxAttempts) {
    attempts++;

    const xPct = 2 + Math.random() * 96;
    const yPct = yMinPct + Math.random() * (yMaxPct - yMinPct);

    if (xPct > moonXMinPct && xPct < moonXMaxPct) continue;

    const xPx = (xPct / 100) * w;
    const yPx = (yPct / 100) * h;

    const tooClose = placed.some(p => {
      const dx = p.xPx - xPx, dy = p.yPx - yPx;
      return Math.sqrt(dx * dx + dy * dy) < minSpacingPx;
    });
    if (tooClose) continue;

    placed.push({ xPx, yPx });
    created++;

    const star = document.createElement('div');
    star.className = 'star';

    const size = 2 + Math.random() * 3;
    const isBright = Math.random() < 0.25;
    const baseOpacity = 0.4 + Math.random() * 0.35;
    const glowSize = isBright ? 5 + Math.random() * 3 : 2 + Math.random() * 2;
    const glowAlpha = isBright ? 0.8 : 0.5;

    star.style.left = xPct + '%';
    star.style.top = yPct + '%';
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.boxShadow = `0 0 ${glowSize}px ${glowSize / 2}px rgba(200,224,255,${glowAlpha})`;

    starsContainer.appendChild(star);

    const peakOpacity = Math.min(1, baseOpacity + (isBright ? 0.5 : 0.3) + Math.random() * 0.15);
    const peakScale = 1.3 + Math.random() * (isBright ? 1.0 : 0.6);
    const baseDuration = 1.8 + Math.random() * 2.6;
    const delay = Math.random() * 4.5;

    gsap.set(star, { opacity: baseOpacity, scale: 1, transformOrigin: "50% 50%" });

    gsap.to(star, {
      opacity: `random(${Math.max(baseOpacity, peakOpacity - 0.12)}, ${peakOpacity})`,
      scale: `random(${Math.max(1, peakScale - 0.25)}, ${peakScale})`,
      duration: () => baseDuration * (0.85 + Math.random() * 0.3),
      delay: delay,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      repeatRefresh: true
    });
  }
}

function createFireflies() {
  if (firefliesContainer.dataset.built === '1') return;
  firefliesContainer.dataset.built = '1';

  const fireflyCount = 14 + Math.floor(Math.random() * 8);
  const w = window.innerWidth;
  const h = window.innerHeight;

  const FINAL_ZOOM = 2.8; 
  const tyPx = camera.y;

  function screenPctToLocalPct(screenPct, isY) {
    const dimPx = isY ? h : w;
    const offsetPx = isY ? tyPx : 0;
    const screenPx = (screenPct / 100) * dimPx;
    const localPx = dimPx / 2 + (screenPx - offsetPx - dimPx / 2) / FINAL_ZOOM;
    return (localPx / dimPx) * 100;
  }

  const xMinPct = screenPctToLocalPct(6, false);
  const xMaxPct = screenPctToLocalPct(94, false);
  const yMinPct = screenPctToLocalPct(12, true);
  const yMaxPct = screenPctToLocalPct(92, true);

  for (let i = 0; i < fireflyCount; i++) {
    const firefly = document.createElement('div');
    firefly.className = 'firefly';

    const xPct = xMinPct + Math.random() * (xMaxPct - xMinPct);
    const yPct = yMinPct + Math.random() * (yMaxPct - yMinPct);
    const size = 5 + Math.random() * 3;

    firefly.style.left = xPct + '%';
    firefly.style.top = yPct + '%';
    firefly.style.width = size + 'px';
    firefly.style.height = size + 'px';

    firefliesContainer.appendChild(firefly);

    gsap.set(firefly, { opacity: 0, transformOrigin: "50% 50%" });

    gsap.to(firefly, {
      x: () => `random(-60, 60)`,
      y: () => `random(-40, 40)`,
      duration: () => 4 + Math.random() * 4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      repeatRefresh: true
    });

    gsap.to(firefly, {
      opacity: `random(0.45, 1)`,
      duration: () => 0.6 + Math.random() * 1.4,
      delay: Math.random() * 1.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      repeatRefresh: true
    });
  }
}

// Updated preview function for the forest image
window.previewFireflies = function () {
  forestImg.classList.remove('hidden');
  firefliesContainer.classList.remove('hidden');
  createFireflies();
  gsap.to([forestImg, firefliesContainer], { opacity: 1, duration: 1 });
};

function startSceneSkyReveal() {
  let setupTl = gsap.timeline({ onComplete: startButterflyFlight });

  setupTl.call(() => {
    cloud1.classList.remove('hidden');
    cloud2.classList.remove('hidden');
    cloud3.classList.remove('hidden');
    cloud4.classList.remove('hidden');
    cloud5.classList.remove('hidden');
    cloud6.classList.remove('hidden');
    cloud7.classList.remove('hidden');
    moon.classList.remove('hidden');
    starsContainer.classList.remove('hidden');
    createStars();
    
    gsap.set(cloud1, { x: window.innerWidth/2 + 40, opacity: 0.9 });
    gsap.set(cloud2, { x: -(window.innerWidth/2 + 40), opacity: 0.9 });
    gsap.set(cloud3, { x: window.innerWidth/2 - 80, opacity: 0.9 });
    gsap.set(moon, { opacity: 1 });

    driftClouds();
  });
}

function driftClouds() {
  const clouds = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6, cloud7];
  const flipped = new Set([cloud2, cloud7]);

  clouds.forEach((cloud, i) => {
    gsap.set(cloud, { scaleX: flipped.has(cloud) ? -1 : 1 });

    gsap.to(cloud, {
      x: `+=${6 + Math.random() * 6}`,
      y: `+=${4 + Math.random() * 5}`,
      duration: 5 + Math.random() * 3,
      delay: i * 0.35,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });
  });
}
function startButterflyFlight() {
  let flightTl = gsap.timeline();
  
  flightTl.to(butterflyWrap, { y: -20, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" });
  
  flightTl.call(() => {
    camera.followTarget = butterflyWrap;
    camera.followY = true;
  }, null, "flyUp");

  flightTl.to(butterflyWrap, { y: -850, x: -30, scale: 0.55, duration: 3.0, ease: "power1.inOut" }, "flyUp");

  flightTl.to(butterflyWrap, {
    keyframes: [
      { opacity: 1,    duration: 0.9 },
      { opacity: 0.08, duration: 0.6 },
      { opacity: 0.08, duration: 0.5 },
      { opacity: 1,    duration: 1.0 }
    ],
    ease: "sine.inOut"
  }, "flyUp");

  flightTl.to(butterflyWrap, { 
    keyframes: [
      { x: 30, y: -860, duration: 0.5, ease: "sine.inOut" },
      { x: 0, y: -850, duration: 0.5, ease: "sine.inOut" }
    ]
  });

  flightTl.addLabel("closeUp");
  flightTl.to({}, { duration: 4, });

  flightTl.to(camera, { targetScale: 2.8, duration: 10, ease: "sine.inOut" }, "<");

  // Replaced beachVideo with forestImg in the reveal logic
  flightTl.call(() => {
    forestImg.classList.remove('hidden');
    firefliesContainer.classList.remove('hidden');
    createFireflies();
  }, null, "closeUp+=1");
  flightTl.to([forestImg, firefliesContainer], { opacity: 1, duration: 2, ease: "sine.inOut" }, "closeUp+=1");
  
  flightTl.to(butterflyWrap, {  duration: 0.1, yoyo: true, repeat: 4, ease: "sine.inOut" });
  // Let go of the butterfly as the camera's follow target before it exits the
  // scene (otherwise the camera keeps snapping to its exact position and can
  // end up parked somewhere that no longer covers the full screen — black
  // bars top/bottom for the rest of Chapter 2). But we still want the camera
  // itself to keep panning upward toward the sky instead of freezing in
  // place, so we hand control over to a direct tween on camera.targetY that
  // continues in sync with the butterfly's own upward exit below.
  flightTl.call(() => { camera.followY = false; });

  flightTl.to(camera, { targetY: "+=1000", duration: 12.0, ease: "sine.inOut" }, "<");

  flightTl.to(butterflyWrap, { y: "-=1000", x: "+=320", duration: 12.0, ease: "sine.inOut" }, "<");

  flightTl.to(butterflyWrap, {
    keyframes: [
      { opacity: 1, duration: 8.0 },
      { opacity: 0, duration: 4.0, ease: "power1.in" }
    ]
  }, "<");
}
