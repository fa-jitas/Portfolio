/* ══ CHAT TIMESTAMP ══ */
const tsEl = document.getElementById('chat-timestamp');
function updateTimestamp() {
  if (!tsEl) return;
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  tsEl.textContent = 'Today ' + time;
}
updateTimestamp();
setInterval(updateTimestamp, 1000);

/* ══ LIGHTBOX ══ */
function openLightbox(src, alt) {
  const lb = document.getElementById('cs-lightbox');
  const img = document.getElementById('cs-lightbox-img');
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('cs-lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
document.addEventListener('click', e => {
  const img = e.target.closest('.cs-carousel-track img');
  if (img) { e.stopPropagation(); openLightbox(img.src, img.alt); }
});

/* ══ CUSTOM CURSOR ══ */


/* nav smooth scroll */
document.querySelectorAll('nav a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    target.classList.add('in'); // reveal if not yet visible
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
const revealObs = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: .1 });
document.querySelectorAll('.fade').forEach(el => revealObs.observe(el));

/* stagger work items */
const itemObs = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.work-item').forEach((item, i) => {
        setTimeout(() => item.classList.add('in'), i * 80);
      });
      itemObs.unobserve(e.target);
    }
  });
}, { threshold: .05 });
document.querySelectorAll('.work-list').forEach(el => itemObs.observe(el));

/* ══ TEXT SCRAMBLE on work items ══ */

/* ══ ABOUT TYPEWRITER iMessage style ══ */
const bubbles = [
  { text: 'Hi! I\'m a master student studying HCI at UCSC, \n❤️ing research & design', delay: 400 },
  { text: 'Prior to this, I did my Master in Social Welfare at UC Berkeley 🎓 where I worked with children and older adults', delay: 1800 },
  { text: 'In my free time, I love walking my puppy and training her for competitions 🐕🏆', delay: 3200 },
];

function typeBubble(container, text, onDone) {
  // typing indicator bubble
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
      p.textContent = text.slice(0, ++i).replace(/\n/g, '\n');
      // handle newlines
      p.innerHTML = text.slice(0, i).replace(/\n/g, '<br>');
      container.scrollTop = container.scrollHeight;
      if (i >= text.length) {
        clearInterval(iv);
        if (onDone) onDone();
      }
    }, 18);
  }, typingDuration);
}

let chatStarted = false;
function unlockAndStart() {
  if (chatStarted) return;
  chatStarted = true;
  getAudioCtx();
  startChat();
}

function startChat() {
  const container = document.getElementById('chat-bubbles');
  if (!container) return;

  let idx = 0;
  function next() {
    if (idx >= bubbles.length) {
      setTimeout(() => appendGamePigeon(container), 700);
      return;
    }
    const { text, delay } = bubbles[idx++];
    setTimeout(() => typeBubble(container, text, next), idx === 1 ? delay + 300 : 600);
  }
  next();
}

/* ══ GAME PIGEON Cup Shuffle ══ */
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
  // don't auto-start wait for Play button
}

// slots[slot] = which cup index occupies that slot
// cupSlot[cup] = which slot that cup is currently in
let slots = [0,1,2], cupSlot = [0,1,2];
let ballCup = 0, canPick = false;
const CW = 76; // 64px cup + 12px gap

function setCupPosition(cup, slot, dur) {
  const el = document.getElementById('cup' + cup);
  if (!el) return;
  el.style.transition = dur ? `left ${dur}ms ease-in-out` : 'none';
  el.style.left = (slot * CW) + 'px';
}

function initGame() {
  ballCup = Math.floor(Math.random() * 3);
  canPick = false;
  slots = [0,1,2];
  cupSlot = [0,1,2];

  const btn = document.getElementById('gp-btn');
  const status = document.getElementById('gp-status');
  if (btn) { btn.disabled = true; btn.textContent = 'Play Again'; btn.style.display = 'none'; }
  if (status) { status.textContent = 'Shuffling...'; status.className = 'gp-status'; }

  // place cups instantly at their starting slots, hide balls
  [0,1,2].forEach(c => {
    setCupPosition(c, c, 0);
    const b = document.getElementById('ball' + c);
    if (b) b.style.opacity = '0';
    const el = document.getElementById('cup' + c);
    if (el) el.style.pointerEvents = 'none';
  });

  // briefly flash the ball so player sees where it is
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
    [0,1,2].forEach(c => {
      const el = document.getElementById('cup' + c);
      if (el) el.style.pointerEvents = 'auto';
    });
    return;
  }

  const speed = Math.max(160, 420 - (6 - remaining) * 40);

  // pick two different slots
  const slotA = Math.floor(Math.random() * 3);
  let slotB = (slotA + 1 + Math.floor(Math.random() * 2)) % 3;
  const cupA = slots[slotA];
  const cupB = slots[slotB];

  setCupPosition(cupA, slotB, speed);
  setCupPosition(cupB, slotA, speed);

  // update tracking arrays
  slots[slotA] = cupB;
  slots[slotB] = cupA;
  cupSlot[cupA] = slotB;
  cupSlot[cupB] = slotA;

  setTimeout(() => doShuffle(remaining - 1), speed + 80);
}

function pickCup(cup) {
  if (!canPick) return;
  canPick = false;
  [0,1,2].forEach(c => {
    const el = document.getElementById('cup' + c);
    if (el) el.style.pointerEvents = 'none';
  });

  // reveal ball under correct cup
  const bb = document.getElementById('ball' + ballCup);
  if (bb) bb.style.opacity = '1';

  const status = document.getElementById('gp-status');
  const btn = document.getElementById('gp-btn');
  const playWrap = document.getElementById('gp-play-wrap');
  if (cup === ballCup) {
    status.textContent = '🎉 Yay, you found it!';
    status.className = 'gp-status win';
  } else {
    status.textContent = '🙈 Oops, try again!';
    status.className = 'gp-status lose';
  }
  if (btn) { btn.disabled = false; btn.style.display = 'none'; }
  if (playWrap) { playWrap.classList.add('visible'); }
}

function startOrResetGame() {
  const btn = document.getElementById('gp-btn');
  const playWrap = document.getElementById('gp-play-wrap');
  if (btn) { btn.style.display = 'none'; }
  if (playWrap) { playWrap.classList.remove('visible'); }
  initGame();
}

function resetGame() { startOrResetGame(); }

/* trigger chat when about section enters view */
const aboutObs = new IntersectionObserver(es => {
  es.forEach(e => {
    if (e.isIntersecting) {
      if (!chatStarted) { chatStarted = true; startChat(); }
      aboutObs.unobserve(e.target);
    }
  });
}, { threshold: .2 });
const aboutSec = document.getElementById('about');
if (aboutSec) aboutObs.observe(aboutSec);
/* ══ CASE STUDIES ══ */
const cases = [
  {
    emoji: '✈️', bg: '#ffffff', heroImg: '',
    heroImgs: ['images_fb/onboarding1.png',
      'images_fb/onboarding2.png',
      'images_fb/onboarding3.png'
    ],
    label: 'Product Design · UX Research · 2025',
    title: 'FlyBites',
    duration: '2 weeks',
    team: 'Eric Khuu, Jasmine Danila, Nicole Fajardo, Laiy Joshi',
    role: 'UX/UI Designer & Research Lead',
    tags: ['iOS', 'UX Research', 'Prototyping', 'Systems Thinking', 'Usability Testing'],
    overview: 'Air travelers struggle to order food without risking delays or missed flights. FlyBites addresses this by integrating real-time flight data with food discovery and ordering so travelers can eat without the stress of missing their boarding call.',
    hmw: 'How might we help travelers conveniently order food by integrating real-time flight tracking so they can receive their meals on time?',
    problem: 'Air travelers often face difficulty coordinating meals with <span class="cs-highlight">rigid flight schedules</span>, <span class="cs-highlight">limited airport familiarity</span>, and <span class="cs-highlight">unpredictable wait times</span> which often lead to rushed decisions or skipped meals. Our solution connects flight tracking with food ordering so travelers can pre-order, track readiness, and pick up without the stress.',
    research: 'We interviewed both travelers and food workers, then ran a competitive analysis across food and travel apps. Food and flight information usually are in separate apps but travelers need them together.',
    insights: [
      { q: 'Travelers skip meals', a: 'Unclear wait times make ordering feel too risky under time pressure.' },
      { q: 'Gate context is missing', a: 'Most travelers have no idea what food is near their gate.' },
      { q: 'Trust breaks the experience', a: 'Fear of missing boarding stops people from ordering at all.' },
    ],
    process: '',
    //images: { process: '' },
    steps: [
      { title: 'Wireframes & Low-fi', body: 'Mapped core user flows flight input, food discovery, order tracking focusing on information hierarchy and cognitive load', img: 'images_fb/low-fi.png' },
      { title: 'Mid-fidelity & Testing', body: 'Refined layout with the team, removed redundant interactions, and aligned with iOS standards. Tested within the group before converting hi-fi', img: 'images_fb/mid-fi.png' },
      { title: 'Usability Study (28 participants)', body: 'Led high-fidelity prototype testing. Results drove improvements in map readability, accessibility, and menu clarity', img: 'images_fb/hi-fi.png' },
    ],
    outcome: 'Three core flows define the final product.',
    flows: [
      { title: 'Onboarding', body: 'Allows user to input flight information and airport name to minimizes time spent before browsing food', img: 'images_fb/onboarding.gif' },
      { title: 'Main Menu & Flight-Aware Discovery', body: 'Nearby food options prioritized, with a collapsible flight panel keeping boarding information visible throughout ordering', img: 'images_fb/ordering.gif' },
      { title: 'Post-Order Guided Pickup', body: 'Navigate to pickup while monitoring flight status via a color-coded bar. A map directory also lets travelers explore nearby restaurants near their gate', img: 'images_fb/navigation.gif' },
    ],
    reflection: 'This project pushed me to think more about designing within real-time systems and constraints. Because flight data, food preparation, and pickup timing are tightly interconnected, small UX decisions had a direct impact on user stress and trust. Designing FlyBites reinforced how important clarity and timing are when users are making decisions under pressure',
    takeaways: [
      { title: 'Clarity over features', body: 'Under pressure, users need to know what\'s happening not more options' },
      { title: 'Design the full system', body: 'The app only works if the vendor side works too' },
      { title: 'Words reduce anxiety', body: 'The right status message at the right moment had more impact on users than only relaying on visuals' },
    ],
    images: {
      hero: '',
      research: '',
      insights: 'images_fb/interview.png',
      insightsCaption: '📋 Interview Questions',
      insightsDesc: 'Informed our decision to prioritize gate-aware ordering, wait time transparency, and flight-synced pickups',
      competitive: 'images_fb/competitive.png',
      competitiveCaption: '🔍 Competitive Analysis',
      competitiveDesc: 'Revealed a gap: no existing app combined flight data + food ordering',
      wireframes: null,
      process: '',
      highfi: '',
    },
    stats: [{ num: 'Eric K. · Jasmine D. · Nicole F. · Laiy J.', lbl: 'Team' }, { num: '2 weeks', lbl: 'Duration' }],
  },
  {
    emoji: '🏠', bg: '#EAF4F0',
    heroImgs:[
      'images_hh/home2.png',
      'images_hh/home.png',
      'images_hh/crisis.png',
    ],
    phonesStyle: 'phones-perspective',
    label: 'Research & Design · 2025',
    title: 'Hope Haven',
    duration: '1 day',
    team: 'Nicole Fajardo, Jennie Le, Noor Haider, Rishab Bajaj',
    role: 'UX/UI Designer',
    tags: ['Mobile', 'Android', 'Service Design', 'Accessibility', 'Designathon'],
    overview: 'Finding reliable resources while unhoused is overwhelming due to confusing, outdated, and unverified information. Hope Haven is a mobile tool that provides trusted, community-verified updates on shelters, food, and essential services designed for low-stress use.',
    hmw: 'How might we design a mobile tool that makes finding and verifying local resources intuitive, fast, and low-stress for people without stable housing?',
    problem: 'People experiencing housing insecurity often rely on <span class="cs-highlight">word of mouth</span> or <span class="cs-highlight">outdated tools</span> to find food, shelter, and services. This <span class="cs-highlight"> lack of verified, trustworthy information</span> creates fear, uncertainty, and missed opportunities for support.',
    research: 'To understand who we were designing for, we spoke with case managers, dug into government data, and used AI to synthesize existing research. We learned that 64% of unhoused individuals in SF are entirely unsheltered, most rely on low-resource phones, and nearly every existing digital tool assumes resources people simply don\'t have.',
    
    insights: [
      { q: 'Stigma blocks help-seeking', a: 'Many felt embarrassed or exposed seeking help. Community voices reduce that barrier.' },
      { q: 'Trust must be earned fast', a: 'Match case manager credibility with verified info.' },
      { q: 'Crisis = no time to waste', a: 'Make essential services instantly accessible.' },
    ],
    process: '',
    steps: [
      { title: 'AI-accelerated wireframing', body: 'Used UX Pilot to quickly explore user flows and generate low-fi wireframe variations', img: 'images_hh/aiprompts.png' },
      { title: 'What we kept & why', body: 'Chose a category dashboard over an intake form since forms add friction for users in crisis', img: 'images_hh/whatwekept.png' },
      { title: 'Refinement after winning', body: 'Post–Designathon: added AI chat, aligned with Android, removed the map, and improved the crisis page to simplify user flow', img:'images_hh/iteration.png' },
    ],
    outcome: 'Built in 8 hours, Hope Haven won the Best Novel award at the Google x Designathon.',
    flows: [
      { title: 'Resource Discovery', body: 'Quick-access category pills and a location-based search let users find relevant resources immediately. Users can also describe their situation in text or chat with an AI bot for personalized help', img: 'images_hh/home.png' },
      { title: 'Community Verification', body: 'Locally verified resources with community posts and updates build trust fast', img: 'images_hh/home2.png' },
      { title: 'Crisis Access', body: 'Crisis tab in the nav bar reachable from anywhere in the app at any moment', img: 'images_hh/crisis.png'  },
    ],
    reflection: 'Redesigning Hope Haven reminded me about how important it is to remove obstacles by simplifying navigation. I also got better at using AI to speed up the process without letting it make decisions for me',
    takeaways: [
      { title: 'Design advocacy', body: 'Designing for vulnerable users means advocating for clarity and accessibility, especially in high-stress situations' },
      { title: 'AI as a Tool', body: 'AI sped up research and ideation which freed time for refinement and validation' },
      { title: 'Trust is importantt', body: 'Verified resources, transparency, and community context are just as important as visual design' },
    ],
    images: {
      hero: '',
      insights: 'images_hh/persona.png',
      insightsCaption: '👤 User Persona',
      insightsDesc: 'Helped us understand the emotional and practical needs of unhoused individuals',
      competitive: 'images_hh/userflow.png',
      competitiveCaption: '🗺️ User Flow',
      competitiveDesc: 'Mapped the key paths users take to find resources quickly under stress',
      wireframes: null,
      process: '',
      highfi: '',
    },
    stats: [{ num: 'Nicole F. · Jennie L. · Noor H. · Rishab B.', lbl: 'Team' }, { num: '1 day', lbl: 'Duration' }],
  },
  {
    emoji: '🧠', bg: '#EEF0F9',
    flowsStyle: 'flows-free',
    label: 'Wearable · FigBuild · 2026',
    heroImg: 'images_ms/mnemo.gif',
    title: 'MnemoSense',
    team: 'Tereese Bangayan, Anvitha Goli, Diane Pang, Nicole Fajardo',
    role: 'UX Designer · UC Santa Cruz SVC Extension',
    tags: ['Figma', 'FigMake', 'Wearable', 'Health Tech', 'Interaction Design'],
    overview: 'MnemoSense is a wearable sensory node system designed to help people living with phantom limb sensations reclaim control over how their body feels. Using vibration, pressure, and temperature feedback, it acts as a neural override giving the brain the missing sensory input it\'s been craving.',
    hmw: 'How might we give people with phantom limb sensations real-time sensory feedback so the brain can interrupt the phantom loop and feel whole again?',
    problem: 'After amputation, the brain doesn\'t simply forget. It keeps sending motor commands to a limb that\'s no longer there, stuck in a signal loop. Existing treatments (mirror therapy, VR, medications) focus mainly on <span class="cs-highlight">phantom limb pain</span>, leaving a gap: few wearable systems help users <span class="cs-highlight">interpret or regulate phantom limb sensations</span> during early recovery. The brain keeps signaling, but what if we could redirect them?',
    research: 'We reviewed clinical literature on phantom limb phenomena and existing interventions, then synthesized key patterns into three design-driving insights. We also analyzed Reddit communities to understand how people with phantom limb syndrome experience and describe their symptoms in daily life.',
    insights: [
      { q: 'Phantom sensations are normal', a: '80–100% of people feel sensations immediately after amputation.' },
      { q: 'Current treatments focus on pain', a: 'Mirror therapy, VR, and motor imagery treat pain but leae sensation gaps.' },
      { q: 'Sensory feedback can help', a: 'The right sensory input at the right time can interrupt the phantom loop.' },
    ],
    process: 'We mapped key moments where users lose trust in their body:',
    steps: [
      { title: 'Scenario 1: The Phantom Trip', body: 'False tripping sensation while moving', img: 'images_ms/journeymap.png' },
      { title: 'Scenario 2: The Telescoping Effect', body: 'Limb feels like it is shrinking', img: 'images_ms/journeymap.png' },
      { title: 'Scenario 3: The Thermal Ghost', body: 'Temperature misinterpreted as swelling',  img: 'images_ms/journeymap.png' },
    ],
    outcome: 'We designed a wearable node system that lets users adjust sensory feedback in real time',
    flows: [
      { title: 'On-body + app control', body: 'Users can adjust feedback directly from the wearable node for quick interaction'},
      { title: 'Sensory adjustment', body: 'Feedback (vibration, pressure, temperature) can be changed instantly, allowing users to respond as sensations happen', img: 'images_ms/mnemo.gif' },
      { title: 'Targeted feedback', body: 'Users can control intensity or fine-tine individual nodes depending on their needs' },
    ],
    reflection: 'Designing MnemoSense was tricky because I wasn\’t designing for something you can see, but something you feel.',
    
    images: {
      insights: 'images_ms/insights.png',
      insightsCaption: '📋 Affinity Map',
      insightsDesc: '',
    },
    takeaways: [
      { title: 'Design for the invisible', body: 'If users can\'t see what is happening, then the interaction needs to be clear' },
      { title: 'Scenario-first > feature-first', body: 'Thinking through actual moments helped inform design decisions' },
      { title: 'Interface isn\'t just the screen', body: 'The experience depended on how the wearable & app worked together' },
    ],
    stats: [{ num: 'Tereese B. · Anvitha G. · Diane P. · Nicole F.', lbl: 'Team' }, { num: '3 days', lbl: 'Duration' }],
  },
  {
    emoji: '✦', bg: '#F8F8F8',
    label: 'Type · Year',
    title: 'New Project',
    team: 'TBD',
    role: 'Your Role',
    tags: ['Tag 1', 'Tag 2', 'Tag 3'],
    overview: 'A short overview of the project — what it is, who it\'s for, and why it matters.',
    hmw: 'How might we [problem] so that [outcome]?',
    problem: 'Describe the problem this project was solving.',
    research: 'What research or insights informed your approach?',
    insights: ['Key insight one.', 'Key insight two.', 'Key insight three.'],
    process: [
      { title: 'Step 1', body: 'Describe your first ideation or design step.' },
      { title: 'Step 2', body: 'Describe your second step.' },
      { title: 'Step 3', body: 'Describe your third step.' },
    ],
    outcome: 'What was the result or impact of this project?',
    reflection: 'What did you learn? What would you do differently?',
    takeaways: [
      { title: 'Takeaway one', body: 'Expand on the lesson here.' },
      { title: 'Takeaway two', body: 'Expand on the lesson here.' },
    ],
    flows: [],
    stats: [{ num: '—', lbl: 'Stat 1' }, { num: '—', lbl: 'Stat 2' }, { num: '—', lbl: 'Stat 3' }],
  },
  {
    emoji: '📱', bg: '#F9EEED',
    label: 'Product Design · 2023',
    title: 'Fintech App Redesign',
    team: '2 designers, 4 engineers, 1 PM',
    role: 'Lead Product Designer',
    tags: ['Figma', 'UX Research', 'Mobile', 'Prototyping'],
    overview: 'End-to-end redesign of a fintech app struggling with high drop-off during onboarding. The goal: make financial tools feel approachable and trustworthy.',
    problem: 'User research revealed that 60% of new users abandoned the app during the 7-step onboarding. The flows were long, jargon-heavy, and didn\'t build trust progressively.',
    research: 'Five in-depth user interviews and a session recording review surfaced three core pain points: overwhelming information density on step 2, confusing ID verification language, and no sense of progress. I mapped a full emotional journey across the existing flow.',
    process: 'I ran five user interviews, mapped the existing flow, identified the three biggest friction points, then rebuilt onboarding from scratch reducing it from 7 steps to 3, with progressive disclosure throughout.',
    outcome: 'The redesigned onboarding reduced drop-off by 40%. Session length increased by 22% and support tickets related to confusion dropped by half.',
    reflection: 'I underestimated how much the copy tone mattered versus the layout changes. In retrospect, pairing a content strategist from the start would have saved a full iteration cycle. The final result was stronger for it, but the path was longer than needed.',
    stats: [{ num: '40%', lbl: 'Drop-off reduced' }, { num: '22%', lbl: 'Longer sessions' }, { num: '3', lbl: 'Steps (was 7)' }],
  },
  {
    emoji: '⚡', bg: '#F9EEED',
    label: 'Motion · 2023',
    title: 'Motion Campaign',
    team: 'Solo + sound designer',
    role: 'Motion Designer & Director',
    tags: ['After Effects', 'Direction', 'Social', 'Brand film'],
    overview: 'Animated social assets and a 60-second brand film for a consumer brand launch. The brief: make people feel something in under a minute.',
    problem: 'The brand had strong product and copy but zero motion presence. All social content was static, and they needed a launch film that could anchor a paid campaign.',
    research: 'I reviewed the brand\'s existing visual assets, studied the competitive landscape in the category, and benchmarked 20 high-performing social campaigns from adjacent industries. Tone references were collected via a collaborative mood board session with the founder.',
    process: 'I wrote a concept brief, created a storyboard, and designed all motion assets in After Effects. Worked closely with the founder to iterate on pacing and tone across three rounds of feedback.',
    outcome: 'The film reached 2M+ impressions in the first month and became the top-performing creative in their paid social campaigns.',
    reflection: 'The three-round feedback loop was necessary but expensive in time. Next time I\'d front-load more alignment on pacing and tone at the animatic stage before going into full motion one round of animatic review would have collapsed two feedback rounds into one.',
    stats: [{ num: '2M+', lbl: 'Impressions' }, { num: '#1', lbl: 'Paid creative' }, { num: '60s', lbl: 'Brand film' }],
  },
  {
    emoji: '🧩', bg: '#F9EEED',
    label: 'Systems · 2024',
    title: 'Design System',
    team: '1 designer (me), 3 engineers',
    role: 'Design Systems Lead',
    tags: ['Figma', 'Tokens', 'Systems', 'Documentation'],
    overview: 'Built a scalable design system for a growing SaaS product 80+ components, dark/light modes, and a Figma-to-code token pipeline. Currently in progress.',
    problem: 'The product had accumulated 4 years of inconsistent UI decisions. New features took longer to design because nothing was reusable, and dev handoff was chaotic.',
    research: 'A full UI audit catalogued 340 unique component variants across the product most with subtle but breaking inconsistencies. Engineer interviews revealed that handoff confusion was costing ~2 hours per feature sprint. That became the north star metric for the system.',
    process: 'Starting with an audit of existing UI, I identified the core patterns, built a token structure (colour, spacing, type), and documented everything in Figma with usage guidelines and interactive examples.',
    outcome: 'In progress. 80+ components shipped so far. The engineering team reports ~30% faster implementation time on new features using the system.',
    reflection: 'Documentation is the hardest part and the easiest to skip. Early in the project I underinvested in it components were built but usage guidelines lagged. I\'ve since made docs a first-class deliverable, shipped alongside the component, not after.',
    stats: [{ num: '80+', lbl: 'Components' }, { num: '30%', lbl: 'Faster dev' }, { num: '2', lbl: 'Modes (light/dark)' }],
  },
  {
    emoji: '🛍', bg: '#F9EEED',
    label: 'Product Design · 2022',
    title: 'E-commerce Redesign',
    team: 'Solo',
    role: 'UX & Visual Designer',
    tags: ['Framer', 'UX', 'E-commerce', 'Conversion'],
    overview: 'Redesigned a luxury e-commerce store to improve product discovery and streamline checkout resulting in a measurable lift in conversion.',
    problem: 'The existing site had high bounce rates on product pages and a 7-step checkout flow that was losing customers at payment. The design also didn\'t match the brand\'s luxury positioning.',
    research: 'Analytics showed 68% of drop-offs happened between product page and cart. Heatmaps revealed users were ignoring the primary CTA in favour of zooming product images. Three qualitative sessions confirmed that trust and presentation not price were the hesitation drivers.',
    process: 'I audited analytics data, ran a heuristic evaluation, and rebuilt the product page and checkout flow in Framer. Focused on reducing cognitive load and adding trust signals throughout.',
    outcome: 'Conversion rate increased by 18% after launch. Average order value also increased, attributed to improved product discovery and upsell moments built into the new flow.',
    reflection: 'The biggest win came from the smallest change rewriting the CTA copy from "Add to bag" to "Reserve yours." That single change drove a measurable uptick before the visual redesign even shipped. Worth the reminder that words are design too.',
    stats: [{ num: '+18%', lbl: 'Conversion' }, { num: '3 step', lbl: 'Checkout (was 7)' }, { num: '+12%', lbl: 'Avg order value' }],
  },
  {
    emoji: '🎬', bg: '#F9EEED',
    label: 'Motion · 2022',
    title: 'Brand Film',
    team: 'Solo + sound designer',
    role: 'Director & Motion Designer',
    tags: ['After Effects', 'Direction', 'Film', 'Storyboard'],
    overview: 'Directed and designed a 90-second brand film for a consumer startup concept through final edit, including storyboard, motion design, and sound direction.',
    problem: 'The startup was preparing for a Series A and needed a brand film that could live on their homepage, investor deck, and social channels simultaneously punchy and emotionally resonant.',
    research: 'I watched 30+ brand films across DTC, SaaS, and consumer categories, cataloguing what made the memorable ones land nearly always pacing and a single emotional truth, not feature lists. I also interviewed three team members to find the authentic "why" behind the company.',
    process: 'I pitched three creative concepts, aligned on a narrative-first approach, built a 24-panel storyboard, and produced all motion in After Effects. Collaborated with a sound designer for the final audio mix.',
    outcome: 'The film was featured on the homepage and in the Series A deck. The round closed successfully. The founder described it as "the single best investment we made in our brand."',
    reflection: 'Sound was an afterthought in the brief but ended up being 40% of the emotional impact. I\'d involve a sound designer from concept stage on every future project music and SFX shape the edit more than people expect, and retrofitting audio to finished visuals always costs something.',
    stats: [{ num: '90s', lbl: 'Brand film' }, { num: '3', lbl: 'Creative concepts' }, { num: '✓', lbl: 'Series A closed' }],
  },
];

function buildCarousel(container, images) {
  const carousel = document.createElement('div');
  carousel.className = 'cs-carousel';

  const track = document.createElement('div');
  track.className = 'cs-carousel-track';

  images.forEach(({ src, alt }) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    track.appendChild(img);
  });

  const prev = document.createElement('button');
  prev.className = 'cs-carousel-btn cs-carousel-prev';
  prev.innerHTML = '‹';

  const next = document.createElement('button');
  next.className = 'cs-carousel-btn cs-carousel-next';
  next.innerHTML = '›';

  const dots = document.createElement('div');
  dots.className = 'cs-carousel-dots';

  const caption = document.createElement('div');
  caption.className = 'cs-carousel-caption';
  caption.textContent = images[0].caption || '';

  const desc = document.createElement('div');
  desc.className = 'cs-carousel-desc';
  desc.textContent = images[0].description || '';

  let current = 0;
  const total = images.length;

  images.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'cs-carousel-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goTo(i);
    dots.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('.cs-carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
    caption.textContent = images[current].caption || '';
    desc.textContent = images[current].description || '';
  }

  prev.onclick = () => goTo(current - 1);
  next.onclick = () => goTo(current + 1);

  if (total > 1) {
    carousel.appendChild(prev);
    carousel.appendChild(next);
  }
  carousel.appendChild(track);

  const footer = document.createElement('div');
  footer.className = 'cs-carousel-footer';
  const captionWrap = document.createElement('div');
  captionWrap.appendChild(caption);
  captionWrap.appendChild(desc);
  footer.appendChild(captionWrap);
  footer.appendChild(dots);
  carousel.appendChild(footer);

  container.appendChild(carousel);
}

function openCase(i) {
  const p = cases[i];
  const cs = document.getElementById('case-study');

  const heroEl = cs.querySelector('.cs-hero');
  const phonesWrap = document.getElementById('cs-hero-phones-wrap');
  heroEl.classList.remove('cs-hero--phones');
  heroEl.style.cssText = '';
  heroEl.innerHTML = '';
  phonesWrap.classList.remove('active');
  phonesWrap.innerHTML = '';
  void phonesWrap.offsetWidth;

  if (p.heroImgs && p.heroImgs.length) {
    heroEl.classList.add('cs-hero--phones');
    phonesWrap.classList.add('active');
    const total = p.heroImgs.length;
    const mid = Math.floor(total / 2);
    phonesWrap.innerHTML = `<div class="cs-hero-phones-bg ${p.phonesStyle || ''}">${p.heroImgs.map((src, i) => `<img class="${i === mid ? 'ph-center' : 'ph-side'}" src="${src}" alt="${p.title} screen ${i + 1}">`).join('')}</div>`;
  } else if (p.heroImg) {
    heroEl.style.background = p.bg;
    heroEl.innerHTML = `<img class="cs-hero-img" src="${p.heroImg}" alt="${p.title}">`;
  } else {
    heroEl.style.background = p.bg;
    heroEl.innerHTML = `<span class="cs-hero-emoji"></span>`;
    cs.querySelector('.cs-hero-emoji').textContent = p.emoji;
  }
  cs.querySelector('.cs-label').textContent = p.label;
  cs.querySelector('.cs-title').textContent = p.title;
  cs.querySelector('.cs-tags').innerHTML = p.tags.map(t => `<span>${t}</span>`).join('');
  cs.querySelector('.cs-meta-team').textContent = p.team;

  // Duration
  const durWrap = cs.querySelector('.cs-meta-duration-wrap');
  if (p.duration) { cs.querySelector('.cs-meta-duration').textContent = p.duration; durWrap.style.display = ''; }
  else { durWrap.style.display = 'none'; }

  cs.querySelector('.cs-overview p').textContent = p.overview;

  // HMW block
  const hmwEl = cs.querySelector('.cs-hmw');
  if (p.hmw) { cs.querySelector('.cs-hmw-text').innerHTML = p.hmw; hmwEl.style.display = ''; }
  else { hmwEl.style.display = 'none'; }

  // Intro hero image
  cs.querySelector('.cs-problem p').innerHTML = p.problem;

  cs.querySelector('.cs-research p').textContent = p.research;

  // Research insights
  const insightData = p.insights || [
    { q: 'Key insight', a: 'Insight from your research' },
    { q: 'Key insight', a: 'Insight from your research' },
    { q: 'Key insight', a: 'Insight from your research' },
  ];
  insightData.forEach((ins, idx) => {
    const card = cs.querySelector(`.cs-insight-${idx}`);
    if (card) { 
      const emoji = ['😢','💡','⚠️','✦'][idx] || '✦';
      card.querySelector('.cs-insight-num').textContent = emoji;
      card.querySelector('.cs-insight-text').innerHTML = '<strong>' + ins.q + '</strong>' + ins.a;
      card.style.display = ''; 
    }
  });
  const ins3 = cs.querySelector('.cs-insight-3');
  if (ins3) ins3.style.display = insightData[3] ? '' : 'none';

  // Research image / stats
  const resWrap = cs.querySelector('.cs-research-img-wrap');
  resWrap.innerHTML = '';
  if (p.researchStats) {
    const statsEl = document.createElement('div');
    statsEl.className = 'cs-research-stats';
    statsEl.innerHTML = p.researchStats.map(s => `
      <div class="cs-research-stat">
        <div class="cs-research-stat-num">${s.num}</div>
        <div class="cs-research-stat-label">${s.label}</div>
      </div>`).join('') + '<div class="cs-research-source">Source: SF Homeless Point-in-Time Count (2019)</div>';
    resWrap.appendChild(statsEl);
  } else if (p.images && p.images.insights) {
    const imgs = [
      { src: p.images.insights, alt: 'Interview questions', caption: p.images.insightsCaption || '📋 Interview Questions', description: p.images.insightsDesc || '' },
      ...(p.images.competitive ? [{ src: p.images.competitive, alt: 'Competitive analysis', caption: p.images.competitiveCaption || '🔍 Competitive Analysis', description: p.images.competitiveDesc || '' }] : [])
    ];
    buildCarousel(resWrap, imgs);
  } else {
    resWrap.innerHTML = '<div class="cs-img-placeholder cs-img-full"><span class="ph-icon">📋</span><span class="ph-label">Research Synthesis / Affinity Map</span><span class="ph-sub">Interview notes, user personas, or competitive analysis</span></div>';
  }

  // Ideation steps
  const ideationIntro = cs.querySelector('.cs-ideation-intro');
if (ideationIntro) ideationIntro.textContent = p.process || '';

const ideationEl = cs.querySelector('.cs-steps');
const stepData = p.steps || [];
if (stepData.length) {
  let activeStep = 0;
  // ... rest stays the same

    function setIdeaStep(idx) {
      activeStep = ((idx % stepData.length) + stepData.length) % stepData.length;
      const ph = document.getElementById('cs-idea-ph');
      if (ph) {
        ph.querySelector('.cs-idea-ph-num').textContent = `Step ${activeStep + 1} of ${stepData.length}`;
        ph.querySelector('.cs-idea-ph-title').textContent = stepData[activeStep].title;
        ph.querySelector('.cs-idea-ph-hint').textContent = activeStep === stepData.length - 1 ? 'Back to start ↩' : 'Click to advance →';
        const imgSrc = stepData[activeStep].img;
        ph.style.backgroundImage = imgSrc ? `url(${imgSrc})` : '';
        ph.style.backgroundSize = 'cover';
        ph.style.backgroundPosition = 'center';
        const hasImg = !!imgSrc;
        ph.querySelector('.cs-idea-ph-num').style.display = hasImg ? 'none' : '';
        ph.querySelector('.cs-idea-ph-title').style.display = hasImg ? 'none' : '';
        ph.querySelector('.cs-idea-ph-hint').style.display = hasImg ? 'none' : '';
        ph.onclick = function() {
          if (hasImg) {
            openLightbox(imgSrc);
          } else {
            cycleIdeaStep();
          }
        };
      }
      cs.querySelectorAll('.cs-idea-step').forEach((el, i) => el.classList.toggle('cs-idea-active', i === activeStep));
    }

    window.cycleIdeaStep = function() { setIdeaStep(activeStep + 1); };

    ideationEl.innerHTML = stepData.map((s, i) => `
      <div class="cs-idea-step${i === 0 ? ' cs-idea-active' : ''}" data-idea-idx="${i}">
        <span class="cs-idea-num">0${i + 1}</span>
        <div class="cs-idea-body">
          <div class="cs-idea-title">${s.title}</div>
          <div class="cs-idea-text">${s.body}</div>
        </div>
      </div>`).join('');

    ideationEl.querySelectorAll('.cs-idea-step').forEach(el => {
      el.addEventListener('click', () => setIdeaStep(parseInt(el.dataset.ideaIdx)));
    });

    setIdeaStep(0);
    document.getElementById('cs-ideation').style.display = '';
  } else {
    document.getElementById('cs-ideation').style.display = 'none';
  }

  cs.querySelector('.cs-solution p').textContent = p.outcome;

  // Flow rows
  const flowsEl = cs.querySelector('.cs-flows');
  flowsEl.className = 'cs-flows' + (p.flowsStyle ? ' ' + p.flowsStyle : '');
  const flowData = p.flows || [];
  flowsEl.innerHTML = p.flowsStyle === 'flows-free' ? `
    <div style="display:flex; gap:28px; align-items:flex-start;">
      <div style="flex:1;">
        ${flowData.map(f => `
          <div class="cs-flow-row">
            <div class="cs-flow-text">
              <div class="cs-flow-title">${f.title}</div>
              <div class="cs-flow-body">${f.body}</div>
            </div>
          </div>`).join('')}
      </div>
      <div class="cs-flow-img">
        ${flowData.find(f => f.img) ? `<img src="${flowData.find(f => f.img).img}" style="width:100%;border-radius:16px;">` : ''}
      </div>
    </div>`
  : flowData.map(f => `
    <div class="cs-flow-row">
      <div class="cs-flow-text">
        <div class="cs-flow-title">${f.title}</div>
        <div class="cs-flow-body">${f.body}</div>
      </div>
      <div class="cs-flow-img">
        ${f.img ? `<img src="${f.img}" alt="${f.title}">` : ''}
      </div>
    </div>`).join('');

  // Solution image wrap no longer needed
  const solWrap = cs.querySelector('.cs-solution-img-wrap');
  if (solWrap) solWrap.innerHTML = '';

  // reflection
  cs.querySelector('.cs-reflection-text').textContent = p.reflection;

  // Takeaway cards
  const takeEl = cs.querySelector('.cs-takeaways');
  const takeData = p.takeaways || [];
  takeEl.innerHTML = takeData.map((t, i) => `
    <div class="cs-takeaway">
      <span class="cs-takeaway-num">TAKEAWAY</span>
      <div>
        <div class="cs-takeaway-title">${t.title}</div>
        <div class="cs-takeaway-body">${t.body}</div>
      </div>
    </div>`).join('');

  cs.querySelector('.cs-stats').innerHTML = p.stats.map((s, i) => {
    if (s.lbl === 'Team') {
      return `<div class="cs-stat cs-stat--team"><span class="cs-stat-team-names">${s.num}</span><span class="cs-stat-lbl">Team</span></div>`;
    }
    return `<div class="cs-stat"><span class="cs-stat-num">${s.num}</span><span class="cs-stat-lbl">${s.lbl}</span></div>`;
  }).join('');

  // reset section visibility
  cs.querySelectorAll('.cs-section').forEach(s => s.classList.remove('cs-visible'));

  cs.classList.add('open');
  requestAnimationFrame(() => { cs.scrollTop = 0; });
  document.body.style.overflow = 'hidden';

  // scroll progress bar
  const progressEl = document.getElementById('cs-progress');
  const onCsScroll = () => {
    const max = cs.scrollHeight - cs.clientHeight;
    if (max > 0) progressEl.style.width = (cs.scrollTop / max * 100) + '%';
  };
  cs.removeEventListener('scroll', cs._progressHandler);
  cs._progressHandler = onCsScroll;
  cs.addEventListener('scroll', onCsScroll);

  // section reveal observer (runs inside the scroll container)
  setTimeout(() => {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('cs-visible'); });
    }, { root: cs, threshold: 0.1 });
    cs.querySelectorAll('.cs-section').forEach(s => revealObs.observe(s));
    // immediately reveal what's in view on open
    cs.querySelectorAll('.cs-section').forEach(s => {
      const rect = s.getBoundingClientRect();
      if (rect.top < window.innerHeight) s.classList.add('cs-visible');
    });
  }, 60);

  // reset nav active state
  cs.querySelectorAll('.cs-nav-link').forEach(a => a.classList.remove('cs-nav-active'));
  cs.querySelector('[data-target="cs-intro"]').classList.add('cs-nav-active');

  const sectionIds = ['cs-intro','cs-problem','cs-research','cs-ideation','cs-solution','cs-reflection'];

  // wait for layout then cache positions and wire up clicks
  setTimeout(() => {
    const content = cs; // cs is the scrolling container

    cs.querySelectorAll('.cs-nav-link').forEach(a => {
      a.onclick = () => {
        const id = a.getAttribute('data-target');
        const target = document.getElementById(id);
        if (target) {
          cs.querySelectorAll('.cs-nav-link').forEach(l => l.classList.remove('cs-nav-active'));
          a.classList.add('cs-nav-active');
          cs.scrollTo({ top: target.offsetTop - 32, behavior: 'smooth' });
        }
      };
    });

    // scroll spy
    if (cs._scrollSpy) cs.removeEventListener('scroll', cs._scrollSpy);
    cs._scrollSpy = () => {
      const scroll = cs.scrollTop + 120;
      let current = sectionIds[0];
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scroll) current = id;
      });
      cs.querySelectorAll('.cs-nav-link').forEach(a => {
        a.classList.toggle('cs-nav-active', a.getAttribute('data-target') === current);
      });
    };
    cs.addEventListener('scroll', cs._scrollSpy);

    // animate insight cards when research section enters view
    const researchSection = document.getElementById('cs-research');
    if (researchSection) {
      const insightObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            cs.querySelectorAll('.cs-insight').forEach(card => card.classList.add('visible'));
            insightObs.disconnect();
          }
        });
      }, { root: cs, threshold: 0.2 });
      insightObs.observe(researchSection);
    }
  }, 50);
}

function closeCase() {
  const cs = document.getElementById('case-study');
  cs.classList.remove('open');
  cs.scrollTop = 0;
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCase(); });
