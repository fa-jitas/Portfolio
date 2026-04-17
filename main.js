/* ══ TIMESTAMP ══ */
const tsEl = document.getElementById('chat-timestamp');
function updateTimestamp() {
  if (!tsEl) return;
  const now = new Date();
  tsEl.textContent = 'Today ' + now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
updateTimestamp();
setInterval(updateTimestamp, 1000);

/* ══ LIGHTBOX ══ */
function openLightbox(src, alt) {
  const lb = document.getElementById('cs-lightbox');
  const img = document.getElementById('cs-lightbox-img');
  if (!lb || !img) return;
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('cs-lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLightbox(); closeCase(); } });
document.addEventListener('click', e => {
  const img = e.target.closest('.cs-carousel-track img');
  if (img) { e.stopPropagation(); openLightbox(img.src, img.alt); }
});

/* ══ NAV SMOOTH SCROLL ══ */
document.querySelectorAll('nav a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ══ CHAT BUBBLES ══ */
const bubbles = [
  { text: 'hey! i\'m focused on human-centered design + research \n❤️' },
  { text: 'i got into this after working in healthcare settings and noticing how disconnected tools can shape everyday experiences' },
  { text: 'outside of work, i’m usually walking my puppy or training her for competitions 🐕🏆' },
];

function typeBubble(container, text, onDone) {
  const indicator = document.createElement('div');
  indicator.className = 'bubble bubble-typing';
  indicator.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
  const typingDuration = Math.min(text.length * 28, 1400);
  setTimeout(() => {
    indicator.remove();
    const bubble = document.createElement('div');
    bubble.className = 'bubble bubble-in';
    const p = document.createElement('p');
    bubble.appendChild(p);
    container.appendChild(bubble);
    let i = 0;
    const iv = setInterval(() => {
      p.innerHTML = text.slice(0, ++i).replace(/\n/g, '<br>');
      container.scrollTop = container.scrollHeight;
      if (i >= text.length) { clearInterval(iv); if (onDone) onDone(); }
    }, 18);
  }, typingDuration);
}

function startChat() {
  const container = document.getElementById('chat-bubbles');
  if (!container) return;
  let idx = 0;
  function next() {
    if (idx >= bubbles.length) { setTimeout(() => appendGamePigeon(container), 700); return; }
    const { text } = bubbles[idx++];
    setTimeout(() => typeBubble(container, text, next), 600);
  }
  next();
}

startChat();

/* ══ GAME PIGEON ══ */
function appendGamePigeon(container) {
  const wrap = document.createElement('div');
  wrap.className = 'gp-bubble';
  wrap.innerHTML = `
    <div class="gp-body">
      <div class="cup-stage" id="cup-stage">
        <div class="cup" id="cup0" style="left:0px" onclick="pickCup(0)">🐶<div class="ball" id="ball0">🎾</div></div>
        <div class="cup" id="cup1" style="left:76px" onclick="pickCup(1)">🐶<div class="ball" id="ball1">🎾</div></div>
        <div class="cup" id="cup2" style="left:152px" onclick="pickCup(2)">🐶<div class="ball" id="ball2">🎾</div></div>
        <div class="gp-play-wrap visible" id="gp-play-wrap">
          <button class="gp-play-circle" onclick="startOrResetGame()">
            <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      </div>
      <div class="gp-status" id="gp-status"></div>
      <button class="gp-btn" id="gp-btn" onclick="startOrResetGame()" style="display:none">Play Again</button>
    </div>
    <div class="gp-header">
      <div class="gp-icon"><img src="images_hp/yeona.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></div>
      <div class="gp-meta">
        <div class="gp-title">FIND THE BALL!</div>
        <div class="gp-sub"></div>
      </div>
    </div>`;
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

let slots = [0,1,2], cupSlot = [0,1,2], ballCup = 0, canPick = false;
const CW = 76;

function setCupPosition(cup, slot, dur) {
  const el = document.getElementById('cup' + cup);
  if (!el) return;
  el.style.transition = dur ? `left ${dur}ms ease-in-out` : 'none';
  el.style.left = (slot * CW) + 'px';
}

function initGame() {
  ballCup = Math.floor(Math.random() * 3);
  canPick = false;
  slots = [0,1,2]; cupSlot = [0,1,2];
  const status = document.getElementById('gp-status');
  if (status) { status.textContent = 'Shuffling...'; status.className = 'gp-status'; }
  [0,1,2].forEach(c => {
    setCupPosition(c, c, 0);
    const b = document.getElementById('ball' + c); if (b) b.style.opacity = '0';
    const el = document.getElementById('cup' + c); if (el) el.style.pointerEvents = 'none';
  });
  setTimeout(() => {
    const bb = document.getElementById('ball' + ballCup);
    if (bb) bb.style.opacity = '1';
    setTimeout(() => {
      if (bb) bb.style.opacity = '0';
      setTimeout(() => doShuffle(6), 300);
    }, 900);
  }, 100);
}

function doShuffle(remaining) {
  if (remaining <= 0) {
    canPick = true;
    const status = document.getElementById('gp-status');
    if (status) status.textContent = 'Pick a puppy!';
    [0,1,2].forEach(c => { const el = document.getElementById('cup' + c); if (el) el.style.pointerEvents = 'auto'; });
    return;
  }
  const speed = Math.max(160, 420 - (6 - remaining) * 40);
  const slotA = Math.floor(Math.random() * 3);
  const slotB = (slotA + 1 + Math.floor(Math.random() * 2)) % 3;
  const cupA = slots[slotA], cupB = slots[slotB];
  setCupPosition(cupA, slotB, speed); setCupPosition(cupB, slotA, speed);
  slots[slotA] = cupB; slots[slotB] = cupA;
  cupSlot[cupA] = slotB; cupSlot[cupB] = slotA;
  setTimeout(() => doShuffle(remaining - 1), speed + 80);
}

function pickCup(cup) {
  if (!canPick) return;
  canPick = false;
  [0,1,2].forEach(c => { const el = document.getElementById('cup' + c); if (el) el.style.pointerEvents = 'none'; });
  const bb = document.getElementById('ball' + ballCup); if (bb) bb.style.opacity = '1';
  const status = document.getElementById('gp-status');
  const playWrap = document.getElementById('gp-play-wrap');
  if (status) { status.textContent = cup === ballCup ? '🎉 Yay, you found it!' : '🙈 Oops, try again!'; status.className = 'gp-status ' + (cup === ballCup ? 'win' : 'lose'); }
  if (playWrap) playWrap.classList.add('visible');
}

function startOrResetGame() {
  const playWrap = document.getElementById('gp-play-wrap');
  if (playWrap) playWrap.classList.remove('visible');
  initGame();
}

/* ══ CASE DATA ══ */
const cases = [
  {
    emoji: '✈️', bg: '#ffffff',
    heroImgs: ['images_fb/onboarding1.png', 'images_fb/onboarding2.png', 'images_fb/onboarding3.png'],
    label: 'Product Design · UX Research · 2025',
    title: 'FlyBites',
    duration: '2 weeks',
    team: 'Eric Khuu, Jasmine Danila, Nicole Fajardo, Laiy Joshi',
    tags: ['iOS', 'UX Research', 'Prototyping', 'Systems Thinking', 'Usability Testing'],
    overview: 'Air travelers struggle to order food without risking delays or missed flights. FlyBites addresses this by integrating real-time flight data with food discovery and ordering so travelers can eat without the stress of missing their boarding call.',
    hmw: 'How might we help travelers conveniently order food by integrating real-time flight tracking so they can receive their meals on time?',
    problem: 'Air travelers often face difficulty coordinating meals with <span class="cs-highlight">rigid flight schedules</span>, <span class="cs-highlight">limited airport familiarity</span>, and <span class="cs-highlight">unpredictable wait times</span> which often lead to rushed decisions or skipped meals. Our solution connects flight tracking with food ordering so travelers can pre-order, track readiness, and pick up without the stress.',
    research: 'We interviewed both travelers and food workers, then ran a competitive analysis across food and travel apps. Food and flight information usually are in separate apps but travelers need them together.',
    insights: [
      { q: 'Travelers skip meals', a: 'Unclear wait times make ordering feel too risky under time pressure' },
      { q: 'Gate context is missing', a: 'Most travelers have no idea what food is near their gate' },
      { q: 'Trust breaks the experience', a: 'Fear of missing boarding stops people from ordering at all' },
    ],
    steps: [
      { title: 'Wireframes & Low-fi', body: 'Mapped core user flows flight input, food discovery, order tracking focusing on information hierarchy and cognitive load', img: 'images_fb/low-fi.png' },
      { title: 'Mid-fidelity & Testing', body: 'Refined layout with the team, removed redundant interactions, and aligned with iOS standards. Tested within the group before converting hi-fi', img: 'images_fb/mid-fi.png' },
      { title: 'Usability Study (28 participants)', body: 'Led high-fidelity prototype testing. Results drove improvements in map readability, accessibility, and menu clarity', img: 'images_fb/hi-fi.png' },
    ],
    outcome: 'Three features define the final product',
    flows: [
      { title: 'Onboarding', body: 'Allows user to input flight information and airport name to minimize time spent before browsing food', img: 'images_fb/onboarding.gif' },
      { title: 'Main Menu & Flight-Aware Discovery', body: 'Nearby food options prioritized, with a collapsible flight panel keeping boarding information visible throughout ordering', img: 'images_fb/ordering.gif' },
      { title: 'Post-Order Guided Pickup', body: 'Navigate to pickup while monitoring flight status via a color-coded bar. A map directory also lets travelers explore nearby restaurants near their gate', img: 'images_fb/navigation.gif' },
    ],
    usability: {
      style: 'findings',
      intro: 'We ran a usability study with 28 participants on our high-fidelity prototype, focusing on three important features.',
      findings: [
        {
          icon: '🗺️',
          title: 'Directory Readability',
          observed: 'Users struggled to distinguish and read locations on the map',
          fixed: 'Color-coded, enlarged, and spaced out dining, restroom, and gate icons for clarity',
        },
        {
          icon: '⏱️',
          title: 'Order tracking',
          observed: 'Users had no way to track pickup time while browsing after ordering',
          fixed: 'Added a persistent bottom bar showing the restaurant and pickup time while browsing',
        },
        {
          icon: '✋',
          title: 'Map Accessibility',
          observed: 'Users struggled to notice the boarding status indicator at a glance',
          fixed: 'Changed the boarding status bar to a full green background for improved visibility',
        },
      ],
    },
    reflection: 'This project pushed me to think more about designing within real-time systems and constraints. Because flight data, food preparation, and pickup timing are tightly interconnected, small UX decisions had a direct impact on user stress and trust. Designing FlyBites reinforced how important clarity and timing are when users are making decisions under pressure',
    takeaways: [
      { title: 'Clarity over features', body: 'Under pressure, users need to know what\'s happening, not more options' },
      { title: 'Design the full system', body: 'The app only works if the vendor side works too' },
      { title: 'Words reduce anxiety', body: 'The right status message at the right moment had more impact than visuals alone' },
    ],
    images: {
      insights: 'images_fb/interview.png', insightsCaption: '📋 Interview Questions', insightsDesc: 'Informed our decision to prioritize gate-aware ordering, wait time transparency, and flight-synced pickups',
      competitive: 'images_fb/competitive.png', competitiveCaption: '🔍 Competitive Analysis', competitiveDesc: 'Revealed a gap: no existing app combined flight data + food ordering.',
    },
    stats: [{ num: 'Eric K. · Jasmine D. · Nicole F. · Laiy J.', lbl: 'Team' }, { num: '2 weeks', lbl: 'Duration' }, { num: 'Map Design · Research Lead · Usability Testing', lbl: 'My Role' }],
  },
  {
    emoji: '🏠', bg: '#EAF4F0',
    heroImgs: ['images_hh/home2.png', 'images_hh/home.png', 'images_hh/crisis.png'],
    phonesStyle: 'phones-perspective',
    label: 'Research & Design · 2025',
    title: 'Hope Haven',
    duration: '1 day',
    team: 'Nicole Fajardo, Jennie Le, Noor Haider, Rishab Bajaj',
    tags: ['Mobile', 'Android', 'Service Design', 'Accessibility', 'Designathon'],
    overview: 'Finding reliable resources while unhoused is overwhelming due to confusing, outdated, and unverified information. Hope Haven is a mobile tool that provides trusted, community-verified updates on shelters, food, and essential services; designed for low-stress use.',
    hmw: 'How might we design a mobile tool that makes finding and verifying local resources intuitive, fast, and low-stress for people without stable housing?',
    problem: 'People experiencing housing insecurity often rely on <span class="cs-highlight">word of mouth</span> or <span class="cs-highlight">outdated tools</span> to find food, shelter, and services. This <span class="cs-highlight">lack of verified, trustworthy information</span> creates fear, uncertainty, and missed opportunities for support.',
    research: 'To understand who we were designing for, we spoke with case managers, dug into government data, and used AI to synthesize existing research. We learned that 64% of unhoused individuals in SF are entirely unsheltered, most rely on low-resource phones, and nearly every existing digital tool assumes resources people simply don\'t have',
    insights: [
      { q: 'Stigma blocks help-seeking', a: 'Many felt embarrassed or exposed seeking help. Community voices reduce that barrier' },
      { q: 'Trust must be earned fast', a: 'Match case manager credibility with verified info' },
      { q: 'Crisis = no time to waste', a: 'Make essential services instantly accessible' },
    ],
    steps: [
      { title: 'AI-accelerated wireframing', body: 'Used UX Pilot to quickly explore user flows and generate low-fi wireframe variations.', img: 'images_hh/aiprompts.png' },
      { title: 'What we kept & why', body: 'Chose a category dashboard over an intake form since forms add friction for users in crisis.', img: 'images_hh/whatwekept.png' },
      { title: 'Refinement after winning', body: 'Post-Designathon: added AI chat, aligned with Android, removed the map, and improved the crisis page.', img: 'images_hh/iteration.png' },
    ],
    outcome: 'Built in 8 hours, Hope Haven won the Best Novel award at the Google x Designathon for its voice snippet feature',
    solutionImg: 'images_hh/winner.png',
    flows: [],
    refinement: {
      intro: 'After winning, I went back to improve the design',
      gifPrototype: 'images_hh/prototype.gif',
      flows: [
        { icon: '💬', title: 'Added AI Chat', body: 'An AI-powered chat handles nuanced queries that category browsing couldn\'t' },
        { icon: '🗺️', title: 'Removed the Map', body: 'Distance labels replaced geography — less cognitive load, same utility' },
        { icon: '📱', title: 'Android Realignment', body: 'Navigation, type, and components realigned to Material Design guidelines' },
      ],
    },
    reflection: 'Redesigning Hope Haven reminded me how important it is to remove obstacles by simplifying navigation. I also got better at using AI to speed up the process without letting it make decisions for me.',
    takeaways: [
      { title: 'Design advocacy', body: 'Designing for vulnerable users means advocating for clarity and accessibility, especially in high-stress situations' },
      { title: 'AI as a tool', body: 'AI sped up research and ideation, which freed time for refinement and validation' },
      { title: 'Trust is everything', body: 'Verified resources, transparency, and community context are just as important as visual design' },
    ],
    images: {
      insights: 'images_hh/persona.png', insightsCaption: '👤 User Persona', insightsDesc: 'Helped us understand the emotional and practical needs of unhoused individuals',
      competitive: 'images_hh/userflow.png', competitiveCaption: '🗺️ User Flow', competitiveDesc: 'Mapped the key paths users take to find resources quickly under stress',
    },
    stats: [{ num: 'Nicole F. · Jennie L. · Noor H. · Rishab B.', lbl: 'Team' }, { num: '1 day', lbl: 'Duration' }, { num: 'Research & Advocacy · Wireframing · Design Refinement', lbl: 'My Role' }],
  },
  {
    emoji: '🧠', bg: '#EEF0F9',
    flowsStyle: 'flows-free',
    label: 'Wearable · FigBuild · 2026',
    heroImg: 'images_ms/mnemo.gif',
    title: 'MnemoSense',
    team: 'Tereese Bangayan, Anvitha Goli, Diane Pang, Nicole Fajardo',
    tags: ['Figma', 'FigMake', 'Wearable', 'Health Tech', 'Interaction Design'],
    overview: 'MnemoSense is a wearable sensory node system designed to help people living with phantom limb sensations reclaim control over how their body feels. Using vibration, pressure, and temperature feedback, it acts as a neural override giving the brain the missing sensory input it\'s seeking.',
    hmw: 'How might we give people with phantom limb sensations real-time sensory feedback so the brain can interrupt the phantom loop and feel whole again?',
    problem: 'After amputation, the brain doesn\'t simply forget.  It keeps sending motor commands to a limb that\'s no longer there, stuck in a signal loop. Existing treatments (mirror therapy, VR, medications) focus mainly on <span class="cs-highlight">phantom limb pain</span>, leaving a gap: few wearable systems help users <span class="cs-highlight">interpret or regulate phantom limb sensations</span> during early recovery.',
    research: 'We reviewed clinical literature on phantom limb phenomena and existing interventions, then analyzed Reddit communities to understand how people describe and live with phantom sensations in daily life.',
    insights: [
      { q: 'Phantom sensations are normal', a: '80–100% of people feel sensations immediately after amputation.' },
      { q: 'Current treatments focus on pain', a: 'Mirror therapy, VR, and motor imagery treat pain but leave sensation gaps.' },
      { q: 'Sensory feedback can help', a: 'The right sensory input at the right time can interrupt the phantom loop.' },
    ],
    process: 'We mapped key moments where users lose trust in their body:',
    steps: [
      { title: 'Scenario 1: The Phantom Trip', body: 'False tripping sensation while moving', img: 'images_ms/journeymap.png' },
      { title: 'Scenario 2: The Telescoping Effect', body: 'Limb feels like it is shrinking', img: 'images_ms/journeymap.png' },
      { title: 'Scenario 3: The Thermal Ghost', body: 'Temperature misinterpreted as swelling', img: 'images_ms/journeymap.png' },
    ],
    outcome: 'We designed a wearable node system that lets users adjust sensory feedback in real time.',
    flows: [
      { title: 'On-body + app control', body: 'Users can adjust feedback directly from the wearable node for quick interaction' },
      { title: 'Sensory adjustment', body: 'Feedback (vibration, pressure, temperature) can be changed instantly, allowing users to respond as sensations happen', img: 'images_ms/mnemo.gif' },
      { title: 'Targeted feedback', body: 'Users can control intensity or fine-tune individual nodes depending on their needs' },
    ],
    reflection: 'Designing MnemoSense was tricky because I wasn\'t designing for something you can see, but something you feel',
    images: {
      insights: 'images_ms/insights.png', insightsCaption: '📋 Affinity Map', insightsDesc: '',
    },
    takeaways: [
      { title: 'Design for the invisible', body: 'If users can\'t see what is happening, then the interaction needs to be clear' },
      { title: 'Scenario-first > feature-first', body: 'Thinking through actual moments helped inform design decisions' },
      { title: 'Interface isn\'t just the screen', body: 'The experience depended on how the wearable and app worked together' },
    ],
    stats: [{ num: 'Tereese B. · Anvitha G. · Diane P. · Nicole F.', lbl: 'Team' }, { num: '3 days', lbl: 'Duration' }, { num: 'Project Management · Research & Design Lead · Interaction Refinement', lbl: 'My Role' }],
  },
];

/* ══ CAROUSEL ══ */
function buildCarousel(container, images) {
  const carousel = document.createElement('div');
  carousel.className = 'cs-carousel';
  const track = document.createElement('div');
  track.className = 'cs-carousel-track';
  images.forEach(({ src, alt }) => {
    const img = document.createElement('img');
    img.src = src; img.alt = alt; img.loading = 'lazy';
    track.appendChild(img);
  });
  const prev = document.createElement('button');
  prev.className = 'cs-carousel-btn cs-carousel-prev'; prev.innerHTML = '‹';
  const next = document.createElement('button');
  next.className = 'cs-carousel-btn cs-carousel-next'; next.innerHTML = '›';
  const dots = document.createElement('div'); dots.className = 'cs-carousel-dots';
  const caption = document.createElement('div'); caption.className = 'cs-carousel-caption'; caption.textContent = images[0].caption || '';
  const desc = document.createElement('div'); desc.className = 'cs-carousel-desc'; desc.textContent = images[0].description || '';
  let current = 0; const total = images.length;
  images.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'cs-carousel-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goTo(i); dots.appendChild(dot);
  });
  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('.cs-carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    caption.textContent = images[current].caption || '';
    desc.textContent = images[current].description || '';
  }
  prev.onclick = () => goTo(current - 1);
  next.onclick = () => goTo(current + 1);
  if (total > 1) { carousel.appendChild(prev); carousel.appendChild(next); }
  carousel.appendChild(track);
  const footer = document.createElement('div'); footer.className = 'cs-carousel-footer';
  const captionWrap = document.createElement('div');
  captionWrap.appendChild(caption); captionWrap.appendChild(desc);
  footer.appendChild(captionWrap); footer.appendChild(dots);
  carousel.appendChild(footer);
  container.appendChild(carousel);
}

/* ══ OPEN CASE ══ */
function openCase(i) {
  const p = cases[i];
  if (!p) return;
  const cs = document.getElementById('case-study');
  if (!cs) return;

  cs.addEventListener('scroll', () => {
    const btn = document.getElementById('back-to-top');
    if (btn) {
      btn.onclick = () => cs.scrollTo({ top: 0, behavior: 'smooth' });
      btn.classList.toggle('visible', cs.scrollTop > 300);
}
  });
  
  const heroEl = cs.querySelector('.cs-hero');
  const phonesWrap = document.getElementById('cs-hero-phones-wrap');
  heroEl.classList.remove('cs-hero--phones');
  heroEl.style.cssText = ''; heroEl.innerHTML = '';
  phonesWrap.classList.remove('active'); phonesWrap.innerHTML = '';

  if (p.heroImgs && p.heroImgs.length) {
    heroEl.classList.add('cs-hero--phones');
    phonesWrap.classList.add('active');
    const mid = Math.floor(p.heroImgs.length / 2);
    phonesWrap.innerHTML = `<div class="cs-hero-phones-bg ${p.phonesStyle || ''}">${p.heroImgs.map((src, idx) => `<img class="${idx === mid ? 'ph-center' : 'ph-side'}" src="${src}" alt="${p.title} screen ${idx+1}">`).join('')}</div>`;
  } else if (p.heroImg) {
    heroEl.style.background = p.bg;
    heroEl.innerHTML = `<img class="cs-hero-img" src="${p.heroImg}" alt="${p.title}">`;
  } else {
    heroEl.style.background = p.bg;
    heroEl.innerHTML = `<span class="cs-hero-emoji">${p.emoji}</span>`;
  }

  // cs.querySelector('.cs-label').textContent = p.label; // label hidden
  cs.querySelector('.cs-title').textContent = p.title;
  cs.querySelector('.cs-tags').innerHTML = p.tags.map(t => `<span>${t}</span>`).join('');
  cs.querySelector('.cs-meta-team').textContent = p.team;
  const durWrap = cs.querySelector('.cs-meta-duration-wrap');
  if (p.duration) { cs.querySelector('.cs-meta-duration').textContent = p.duration; durWrap.style.display = ''; }
  else { durWrap.style.display = 'none'; }
  cs.querySelector('.cs-overview p').textContent = p.overview;
  const hmwEl = cs.querySelector('.cs-hmw');
  if (p.hmw) { cs.querySelector('.cs-hmw-text').innerHTML = p.hmw; hmwEl.style.display = ''; }
  else { hmwEl.style.display = 'none'; }
  cs.querySelector('.cs-problem p').innerHTML = p.problem;
  cs.querySelector('.cs-research p').textContent = p.research;

  (p.insights || []).forEach((ins, idx) => {
    const card = cs.querySelector(`.cs-insight-${idx}`);
    if (!card) return;
    card.querySelector('.cs-insight-num').textContent = ['😢','💡','⚠️','✦'][idx] || '✦';
    card.querySelector('.cs-insight-text').innerHTML = `<strong>${ins.q}</strong>${ins.a}`;
    card.style.display = '';
  });
  const ins3 = cs.querySelector('.cs-insight-3');
  if (ins3) ins3.style.display = (p.insights || [])[3] ? '' : 'none';

  const resWrap = cs.querySelector('.cs-research-img-wrap');
  resWrap.innerHTML = '';
  if (p.images && p.images.insights) {
    buildCarousel(resWrap, [
      { src: p.images.insights, alt: 'Research', caption: p.images.insightsCaption || '', description: p.images.insightsDesc || '' },
      ...(p.images.competitive ? [{ src: p.images.competitive, alt: 'Competitive', caption: p.images.competitiveCaption || '', description: p.images.competitiveDesc || '' }] : [])
    ]);
  }

  const ideationIntro = cs.querySelector('.cs-ideation-intro');
  if (ideationIntro) ideationIntro.textContent = p.process || '';
  const ideationEl = cs.querySelector('.cs-steps');
  const stepData = p.steps || [];
  const ideationSection = document.getElementById('cs-ideation');
  if (stepData.length) {
    let activeStep = 0;
    function setIdeaStep(idx) {
      activeStep = ((idx % stepData.length) + stepData.length) % stepData.length;
      const ph = document.getElementById('cs-idea-ph');
      if (ph) {
        const imgSrc = stepData[activeStep].img;
        const hasImg = !!imgSrc;
        ph.style.backgroundImage = imgSrc ? `url(${imgSrc})` : '';
        ph.style.backgroundSize = 'cover'; ph.style.backgroundPosition = 'center';
        ph.querySelector('.cs-idea-ph-num').textContent = `Step ${activeStep+1} of ${stepData.length}`;
        ph.querySelector('.cs-idea-ph-num').style.display = hasImg ? 'none' : '';
        ph.querySelector('.cs-idea-ph-title').textContent = stepData[activeStep].title;
        ph.querySelector('.cs-idea-ph-title').style.display = hasImg ? 'none' : '';
        ph.querySelector('.cs-idea-ph-hint').textContent = activeStep === stepData.length-1 ? 'Back to start ↩' : 'Click to advance →';
        ph.querySelector('.cs-idea-ph-hint').style.display = hasImg ? 'none' : '';
        ph.onclick = hasImg ? () => openLightbox(imgSrc) : () => setIdeaStep(activeStep+1);
      }
      cs.querySelectorAll('.cs-idea-step').forEach((el, i) => el.classList.toggle('cs-idea-active', i === activeStep));
    }
    window.cycleIdeaStep = () => setIdeaStep(activeStep+1);
    ideationEl.innerHTML = stepData.map((s, i) => `
      <div class="cs-idea-step${i===0?' cs-idea-active':''}" data-idea-idx="${i}">
        <span class="cs-idea-num">0${i+1}</span>
        <div class="cs-idea-body"><div class="cs-idea-title">${s.title}</div><div class="cs-idea-text">${s.body}</div></div>
      </div>`).join('');
    ideationEl.querySelectorAll('.cs-idea-step').forEach(el => el.addEventListener('click', () => setIdeaStep(parseInt(el.dataset.ideaIdx))));
    setIdeaStep(0);
    if (ideationSection) ideationSection.style.display = '';
  } else {
    if (ideationSection) ideationSection.style.display = 'none';
  }

  cs.querySelector('.cs-solution p').textContent = p.outcome;
  const flowsEl = cs.querySelector('.cs-flows');
  flowsEl.className = 'cs-flows' + (p.flowsStyle ? ' ' + p.flowsStyle : '');
  flowsEl.innerHTML = '';
  const flowData = p.flows || [];
  if (p.solutionImg) {
    flowsEl.innerHTML = `<img src="${p.solutionImg}" alt="${p.title} solution" style="width:100%;border-radius:16px;display:block;">`;
  } else {
    flowsEl.innerHTML = p.flowsStyle === 'flows-free'
      ? `<div style="display:flex;gap:28px;align-items:flex-start;"><div style="flex:1;">${flowData.map(f=>`<div class="cs-flow-row"><div class="cs-flow-text"><div class="cs-flow-title">${f.title}</div><div class="cs-flow-body">${f.body}</div></div></div>`).join('')}</div><div class="cs-flow-img">${flowData.find(f=>f.img)?`<img src="${flowData.find(f=>f.img).img}" style="width:100%;border-radius:16px;">`:''}
</div></div>`
      : flowData.map(f=>`<div class="cs-flow-row"><div class="cs-flow-text"><div class="cs-flow-title">${f.title}</div><div class="cs-flow-body">${f.body}</div></div><div class="cs-flow-img">${f.img?`<img src="${f.img}" alt="${f.title}">`:''}
</div></div>`).join('');
  }

  const contribSection = document.getElementById('cs-contribution');
  if (contribSection) contribSection.style.display = 'none';

  // Remove any previously injected dynamic sections
  cs.querySelectorAll('.cs-dynamic-section').forEach(el => el.remove());
  cs.querySelectorAll('.cs-nav-link[data-dynamic]').forEach(el => el.remove());

  const csBody = cs.querySelector('.cs-body');
  const solutionSection = document.getElementById('cs-solution');
  const reflectionSection = document.getElementById('cs-reflection');
  const sidenav = cs.querySelector('.cs-sidenav');

  function buildDynamicSection(id, label, data) {
    const sec = document.createElement('div');
    sec.id = id;
    sec.className = 'cs-section cs-dynamic-section';

    const hasGif = !!data.gifPrototype;
    const isFindings = data.style === 'findings';

    let innerHTML = `<h3>${label}</h3><p>${data.intro}</p>`;

    if (isFindings) {
      // Finding cards: icon + title + observed → fixed
      innerHTML += `<div class="cs-findings">
        ${(data.findings || []).map((f, i) => `
          <div class="cs-finding">
            <div class="cs-finding-header">
              <span class="cs-finding-icon">${f.icon || '🔍'}</span>
              <span class="cs-finding-title">${f.title}</span>
            </div>
            <div class="cs-finding-body">
              <div class="cs-finding-row cs-finding-observed">
                <span class="cs-finding-badge cs-badge-observed">Observed</span>
                <p>${f.observed}</p>
              </div>
              <div class="cs-finding-row cs-finding-fixed">
                <span class="cs-finding-badge cs-badge-fixed">Fixed</span>
                <p>${f.fixed}</p>
              </div>
            </div>
          </div>`).join('')}
      </div>`;
    } else if (hasGif) {
      // Gif prototype display + changelog chips layout
      innerHTML += `
        <div class="cs-refinement-proto-wrap">
          <div class="cs-refinement-gif-frame">
            <img src="${data.gifPrototype}" alt="${label} prototype" class="cs-refinement-gif">
          </div>
          ${data.gifCaption ? `<p class="cs-refinement-gif-caption">${data.gifCaption}</p>` : ''}
        </div>
        <div class="cs-changelog">
          ${(data.flows || []).map(f => `
            <div class="cs-changelog-item">
              ${f.icon ? `<span class="cs-changelog-icon">${f.icon}</span>` : ''}
              <div class="cs-changelog-title">${f.title}</div>
              <div class="cs-changelog-body">${f.body}</div>
            </div>`).join('')}
        </div>`;
    } else {
      // Default: standard flow-rows
      innerHTML += `${data.img ? `<img src="${data.img}" alt="${label}" style="width:100%;border-radius:16px;display:block;margin-top:24px;">` : ''}
        <div class="cs-flows" style="margin-top:${data.img ? '28px' : '0'}">${
          (data.flows || []).map(f => `<div class="cs-flow-row"><div class="cs-flow-text"><div class="cs-flow-title">${f.title}</div><div class="cs-flow-body">${f.body}</div></div>${f.img ? `<div class="cs-flow-img"><img src="${f.img}" alt="${f.title}"></div>` : ''}</div>`).join('')
        }</div>`;
    }

    sec.innerHTML = innerHTML;
    // Add sidenav link
    const navLink = document.createElement('a');
    navLink.className = 'cs-nav-link';
    navLink.setAttribute('data-target', id);
    navLink.setAttribute('data-dynamic', '1');
    navLink.textContent = label;
    return { sec, navLink };
  }

  if (p.usability) {
    const { sec, navLink } = buildDynamicSection('cs-usability', 'Usability', p.usability);
    solutionSection.insertAdjacentElement('beforebegin', sec);
    const solutionNav = sidenav.querySelector('[data-target="cs-solution"]');
    if (solutionNav) solutionNav.insertAdjacentElement('beforebegin', navLink);
  }

  if (p.refinement) {
    const { sec, navLink } = buildDynamicSection('cs-refinement', 'Refinement', p.refinement);
    reflectionSection.insertAdjacentElement('beforebegin', sec);
    const reflectionNav = sidenav.querySelector('[data-target="cs-reflection"]');
    if (reflectionNav) reflectionNav.insertAdjacentElement('beforebegin', navLink);
  }

  cs.querySelector('.cs-reflection-text').textContent = p.reflection;
  cs.querySelector('.cs-takeaways').innerHTML = (p.takeaways||[]).map(t=>`
    <div class="cs-takeaway"><span class="cs-takeaway-num">TAKEAWAY</span>
    <div><div class="cs-takeaway-title">${t.title}</div><div class="cs-takeaway-body">${t.body}</div></div></div>`).join('');
  const rolestat = p.stats.find(s => s.lbl === 'My Role');
  const durstat = p.stats.find(s => s.lbl === 'Duration');
  const teamstat = p.stats.find(s => s.lbl === 'Team');
  cs.querySelector('.cs-stats').innerHTML = `
    <div class="cs-stat-row">
      ${teamstat ? `<div class="cs-stat"><span class="cs-stat-num">${teamstat.num}</span><span class="cs-stat-lbl">Team</span></div>` : ''}
      ${durstat ? `<div class="cs-stat"><span class="cs-stat-num">${durstat.num}</span><span class="cs-stat-lbl">Duration</span></div>` : ''}
    </div>
    ${rolestat ? `<div class="cs-stat cs-stat--full"><span class="cs-stat-num">${rolestat.num}</span><span class="cs-stat-lbl">My Role</span></div>` : ''}`;

  cs.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));
  cs.classList.add('open');
  requestAnimationFrame(() => { cs.scrollTop = 0; });
  document.body.style.overflow = 'hidden';

  const progressEl = document.getElementById('cs-progress');
  cs.removeEventListener('scroll', cs._progressHandler);
  cs._progressHandler = () => { const max = cs.scrollHeight - cs.clientHeight; if (max > 0 && progressEl) progressEl.style.width = (cs.scrollTop/max*100)+'%'; };
  cs.addEventListener('scroll', cs._progressHandler);

  setTimeout(() => {
    const sectionIds = ['cs-intro','cs-problem','cs-research','cs-ideation','cs-usability','cs-solution','cs-refinement','cs-reflection'].filter(id => !!document.getElementById(id));
    const secObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('cs-visible'); });
    }, { root: cs, threshold: 0 });
    cs.querySelectorAll('.cs-section').forEach(s => { secObs.observe(s); if (s.getBoundingClientRect().top < window.innerHeight) s.classList.add('cs-visible'); });

    // getBoundingClientRect is always accurate regardless of CSS positioning
    function getSectionScrollTarget(el) {
      return el.getBoundingClientRect().top - cs.getBoundingClientRect().top + cs.scrollTop;
    }

    cs._navScrolling = false;
    clearTimeout(cs._navScrollTimer);

    cs.querySelectorAll('.cs-nav-link').forEach(a => a.classList.remove('cs-nav-active'));
    const firstNav = cs.querySelector('[data-target="cs-intro"]');
    if (firstNav) firstNav.classList.add('cs-nav-active');
    cs.querySelectorAll('.cs-nav-link').forEach(a => {
      a.onclick = () => {
        const target = document.getElementById(a.getAttribute('data-target'));
        if (target) {
          cs.querySelectorAll('.cs-nav-link').forEach(l => l.classList.remove('cs-nav-active'));
          a.classList.add('cs-nav-active');
          cs._navScrolling = true;
          clearTimeout(cs._navScrollTimer);
          cs._navScrollTimer = setTimeout(() => { cs._navScrolling = false; }, 900);
          cs.scrollTo({ top: getSectionScrollTarget(target) - 32, behavior: 'smooth' });
        }
      };
    });
    cs.removeEventListener('scroll', cs._scrollSpy);
    cs._scrollSpy = () => {
      if (cs._navScrolling) return;
      // If near the bottom of the page, always highlight the last section
      if (cs.scrollTop + cs.clientHeight >= cs.scrollHeight - 80) {
        const lastId = sectionIds[sectionIds.length - 1];
        cs.querySelectorAll('.cs-nav-link').forEach(a => a.classList.toggle('cs-nav-active', a.getAttribute('data-target') === lastId));
        return;
      }
      const csTop = cs.getBoundingClientRect().top;
      let current = sectionIds[0];
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        // elOffset is how far the section top is from the visible top of the scroll container
        if (el.getBoundingClientRect().top - csTop <= 140) current = id;
      });
      cs.querySelectorAll('.cs-nav-link').forEach(a => a.classList.toggle('cs-nav-active', a.getAttribute('data-target') === current));
    };
    cs.addEventListener('scroll', cs._scrollSpy);

    const researchSection = document.getElementById('cs-research');
    if (researchSection) {
      const insightObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { cs.querySelectorAll('.cs-insight').forEach(c=>c.classList.add('visible')); insightObs.disconnect(); } });
      }, { root: cs, threshold: 0 });
      insightObs.observe(researchSection);
    }
  }, 60);
}

function closeCase() {
  const cs = document.getElementById('case-study');
  if (!cs) return;
  cs.classList.remove('open');
  cs.scrollTop = 0;
  document.body.style.overflow = '';
  const btn = document.getElementById('back-to-top');
  if (btn) btn.classList.remove('visible');
}

cs.addEventListener('scroll', () => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.classList.toggle('visible', cs.scrollTop > 300);
  btn.onclick = () => cs.scrollTo({ top: 0, behavior: 'smooth' });
});
