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
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const rules = document.getElementById('cs-rules-modal');
  if (rules && rules.classList.contains('open')) { closeRules(); return; }
  closeLightbox(); closeCase();
});

/* ══ RULES MODAL ══ */
function openRules(i) {
  const p = cases[i];
  const modal = document.getElementById('cs-rules-modal');
  const body = document.getElementById('cs-rules-body');
  const titleEl = document.querySelector('.cs-rules-title');
  if (!p || !p.rules || !modal || !body) return;
  if (titleEl) titleEl.textContent = p.rulesTitle || 'How to Play';
  body.innerHTML = `<ol class="cs-rules-list">${p.rules.map(r =>
    `<li><span class="cs-rule-title">${r.title}</span><span class="cs-rule-text">${r.text}</span></li>`).join('')}</ol>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeRules() {
  const modal = document.getElementById('cs-rules-modal');
  if (modal) modal.classList.remove('open');
  const cs = document.getElementById('case-study');
  document.body.style.overflow = (cs && cs.classList.contains('open')) ? 'hidden' : '';
}
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
  { text: 'hey! 👋' },
  { text: 'i got into this after working in healthcare settings and noticing how disconnected tools can shape everyday experiences' },
  { text: 'outside of school, im buiding products with AI and working towards my puppies trick dog title🐕🏆' },
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
    p.innerHTML = text.replace(/\n/g, '<br>');
    bubble.appendChild(p);
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    if (onDone) onDone();
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
    emoji: '👓', bg: '#EEF2F6',
    label: 'Product Design · UX Research · 2026',
    title: 'FoodLens',
    role: ['Founder', 'UX / Product Designer'],
    team: 'Solo project',
    timeline: 'June 2026 – ongoing',
    tools: ['Figma', 'Figma MCP', 'Claude Code', 'Claude Design', 'GitHub', 'VS Code', 'TestFlight'],
    overview: 'FoodLens is an allergy-checking, hands-free app that uses smart glasses to surface food allergen information, so people don\'t have to stop and pull out their phone to check ingredients.',
    hmw: 'How might we use smart glasses to make food allergy information easily accessible?',
    problem: 'Existing allergy apps like Fig require people to <span class="cs-highlight">stop and pull out their phone</span> to check ingredients. FoodLens explores what that experience looks like through <span class="cs-highlight">smart glasses</span>, without needing to check a phone constantly.',
    research: 'I observed someone use Fig, the food allergy detecting app, to check an unrecognized product, then ran the same task on my own build, to find where barcode-based checking breaks down.',
    insights: [
      { q: 'Barcode scanning only works on products it already knows', a: 'It fails on unlabeled or foreign food whose barcode isn\'t in the database' },
      { q: 'A failed scan leaves users stuck', a: 'When Fig can\'t recognize a product it asks users to photograph it to help build the database, but gives them no information in return' },
    ],
    researchVisual: { src: 'images_fl/Foodlens_Research.png', label: 'From observed session' },
    process: 'A participant scanned a product Fig didn\'t recognize. When it asked them to photograph it for the database, they paused and left. <span class="cs-highlight">So, should the fallback appear only when a scan fails, or keep it available from the start?</span>',
    steps: [
      {
        title: 'Offer it on failure',
        body: 'The fallback appears in the miss modal, at the moment when a user needs it',
        imgs: [{ src: 'images_fl/ideation1.png' }],
        tradeoffs: [
          { type: 'pro', text: 'It keeps the default path, barcode scan, simple and familiar' },
          { type: 'con', text: 'The user has to fail first to discover it and the failure is where Fig loses its users' },
        ],
      },
      {
        title: 'Keep it always available',
        body: 'Support barcode and ingredient-label scanning together, which is usable before any barcode attempt',
        imgs: [{ src: 'images_fl/ideation2.png' }],
        tradeoffs: [
          { type: 'pro', text: 'Users with unlabled or unrecognized products can skip the barcode entirely' },
          { type: 'con', text: 'Risks pulling users onto the slower label scan when barcode would have worked in two seconds' },
        ],
      },
    ],
    outcome: 'FoodLens is hands-free by default and falls back to the phone camera when the smart glasses aren\'t connected.',
    flows: [
      { title: 'Live barcode scanning', body: 'The camera view actively scans for a barcode with a live status, so the user always knows what state they\'re in' },
      { title: 'One-tap fallback to ingredient scan', body: 'If a product isn\'t recognized, tapping "scan ingredients label instead" switches to ingredient-scan mode, which photographs the label and reads the ingredients directly' },
    ],
    reflection: 'Assuming one design — barcode scanning — would be enough held up until I tested on multiple products and found barcodes that weren\'t in the database or didn\'t exist at all. The lesson was to design for failure, so the user can always get an answer instead of waiting for one.',
    takeaways: [
      { title: 'What I\'d do differently', body: 'Look into why existing products focus only on barcode scanning and don\'t include ingredient parsing' },
    ],
  },
  {
    emoji: '👁️', bg: '#EEF0F9',
    label: 'Interaction Design · UX Research · 2026',
    title: 'Co-op Watch',
    role: ['Interaction Designer', 'UX Research', 'Product Management'],
    team: ['UI Developer', 'UI Designer', 'UX Research', 'Principal Investigator'],
    timeline: 'March 2026 – ongoing',
    tools: ['Figma', 'Claude Code', 'GitHub'],
    overview: 'Co-op Watch is a surveillance-themed interactive tabletop game that sparks discourse on surveillance through shared decision-making.',
    hmw: 'How might we design game moments that require players to discuss with each other rather than just delivering instructions to each other?',
    problem: 'Co-op Watch is designed to spark discourse on surveillance through shared decision-making, but if players default to <span class="cs-highlight">delivering instructions</span> to each other, it loses its <span class="cs-highlight">conversational value</span>.',
    research: 'We ran playtests and synthesized what we observed about how players actually communicated during the game.',
    insights: [
      { q: 'Players instructed instead of cooperating', a: 'In playtesting, players delivered instructions to each other rather than discussing their actions' },
      { q: 'The core mechanic felt flat', a: 'Removing devices didn\'t require much thought or exchange, so players said the game felt long and repetitive' },
    ],
    researchVisual: { src: 'images_cw/research-synthesis.png', label: 'Insight synthesis chart' },
    process: 'We explored two ways to prompt discussion:',
    steps: [
      {
        title: 'Direct Questions',
        body: 'Ask players a direct surveillance-related question each round. They engaged at first, but over time answered blindly just to get it out of the way.',
        imgs: [{ src: 'images_cw/ideation-direct.png', label: 'Round-question sketch' }],
        tradeoffs: [
          { type: 'pro', text: 'Fast to prototype and easy for players to understand' },
          { type: 'con', text: 'Felt bolted-on — players rushed answers to move the game along' },
        ],
      },
      {
        title: 'Narrative Events',
        body: 'Reframe the questions as narrative events tied to the game\'s surveillance incidents. Generic questions felt like an add-on; tying them to the mechanics made them feel part of the game.',
        imgs: [{ src: 'images_cw/ideation-narrative-sketch.png', label: 'Narrative event sketch' }],
        tradeoffs: [
          { type: 'pro', text: 'Discussion felt native to the game rather than an interruption' },
          { type: 'con', text: 'More design work to write events for every incident type' },
        ],
      },
    ],
    ideationImgs: [{ src: 'images_cw/ideation-narrative-matrix.png', label: 'Feasibility matrix' }],
    outcome: 'After all players finish their turn, a surveillance incident appears and players must decide together whether to approve surveillance devices added or removed — each decision carrying a cost.',
    flows: [],
    solutionVideo: 'images_cw/gameplay.mp4',
    rulesTitle: 'How to Play Co-op Watch',
    rules: [
      { title: 'Setup', text: 'Placeholder — describe the board, where the four players sit, and the components each player starts with.' },
      { title: 'On your turn', text: 'Placeholder — what a player does on their turn (adding or removing a surveillance device, etc.).' },
      { title: 'Surveillance incident', text: 'Once every player has taken a turn, a surveillance incident appears. Players discuss and vote together on whether to approve the devices added or removed — each decision carries a cost.' },
      { title: 'Ending the game', text: 'Placeholder — the win/lose condition and how the game concludes.' },
    ],
    reflection: 'Designing for collaboration in a shared physical space taught me that discussion doesn\'t come from good narratives alone — it depends on players having access to the same information at the same time. With players at four different corners of the table, information positioning and orientation can determine whether players engage as a group or default to one person becoming the source of information.',
    takeaways: [
      { title: 'What I\'d do differently', body: 'A/B test two different narrative framings against each other to see which promotes more discussion, rather than assuming one method was correct based on playtest feedback' },
    ],
  },
  {
    emoji: '🤝', bg: '#EAF4F0',
    label: 'Product Design · UX Research · 2026',
    title: 'Mentorship Platform',
    role: ['UX Designer', 'UX Research', 'Project Lead'],
    team: ['2 Design Teams', '2 Developers', 'Chair of the MS HCI Department'],
    timeline: 'July 2026 – ongoing',
    tools: ['Figma', 'Figma MCP', 'Claude Code', 'VS Code', 'GitHub'],
    overview: 'A platform that automates matching mentors and mentees for an HCI program, while keeping manual review steps before matches are confirmed.',
    hmw: 'How might we reduce the manual work of matching mentors and mentees?',
    problem: 'The stakeholder currently matches mentors and mentees manually, reviewing <span class="cs-highlight">~30 Google Form submissions</span> per cycle and <span class="cs-highlight">verifying background and fit on LinkedIn</span> before finalizing. This platform automates the matching process while keeping manual review before matches are confirmed.',
    research: 'The team ran interviews and affinity mapping across mentors and mentees, and quantified the stakeholder\'s current manual workload.',
    insights: [
      { q: 'Matching is slow and manual', a: 'The stakeholder sorts ~30 form submissions per cycle and individually verifies each person\'s background and fit on LinkedIn before finalizing' },
      { q: 'Relationships need a shared connection', a: 'Interviews and affinity mapping showed mentorships were harder to sustain without something in common between mentor and mentee' },
    ],
    researchVisual: { src: 'images_mp/research-time.png', label: 'Estimated time to manually review and create matches' },
    process: 'We weighed two ways to speed up onboarding intake:',
    steps: [
      { title: 'Voice / video intake', body: 'Users speak or record their background instead of typing it. Ruled out: users may feel uncomfortable when trust is low during onboarding, and important information could be lost.' },
      { title: 'Resume / LinkedIn import', body: 'Auto-populate onboarding fields from an existing resume or LinkedIn profile. Depends on source-data accuracy and completeness, and raises privacy questions around consent and transparency.' },
    ],
    outcome: 'Users choose to import information from an existing resume or LinkedIn profile, or fill it out manually. Importing auto-populates the relevant fields and lets users review and edit each page to confirm the information is accurate before completing their profile.',
    flows: [],
    reflection: 'This project taught me how to think about designing for integrations — evaluating different methods to pull in outside data and weighing what is actually feasible to build.',
    takeaways: [
      { title: 'What I\'d do differently', body: 'Consent for importing resume/LinkedIn data currently happens at the moment a user decides to import; I\'d explore designing consent earlier in the onboarding process instead of at the decision point' },
    ],
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

  if (p.timeline) {
    const host = (p.heroImgs && p.heroImgs.length) ? phonesWrap : heroEl;
    const year = (String(p.timeline).match(/\b20\d{2}\b/) || [p.timeline])[0];
    host.insertAdjacentHTML('beforeend',
      `<span class="cs-hero-timeline">` +
        `<span class="tl-seg tl-short"><span>${year}</span></span>` +
        `<span class="tl-seg tl-full"><span>${p.timeline}</span></span>` +
      `</span>`);
  }

  // cs.querySelector('.cs-label').textContent = p.label; // label hidden
  cs.querySelector('.cs-title').textContent = p.title;
  cs.querySelector('.cs-tags').innerHTML = (p.tags || []).map(t => `<span>${t}</span>`).join('');
  cs.querySelector('.cs-overview p').textContent = p.overview;
  const factsEl = cs.querySelector('.cs-facts');
  if (factsEl) {
    const toolsHtml = Array.isArray(p.tools) && p.tools.length
      ? `<ul class="cs-fact-tools">${p.tools.map(t => `<li>${t}</li>`).join('')}</ul>` : '';
    const stack = v => Array.isArray(v) ? { html: v.map(n => `<span>${n}</span>`).join(''), stacked: true } : { html: v, stacked: false };
    const facts = [];
    if (toolsHtml) facts.push(`<div class="cs-fact cs-fact--tools"><dt>Tools</dt><dd>${toolsHtml}</dd></div>`);
    facts.push(...[['Role', p.role], ['Team', p.team]].filter(([, v]) => v)
      .map(([k, v]) => {
        const { html, stacked } = stack(v);
        return `<div class="cs-fact${stacked ? ' cs-fact--stack' : ''}"><dt>${k}</dt><dd>${html}</dd></div>`;
      }));
    factsEl.innerHTML = facts.join('');
    factsEl.style.display = facts.length ? '' : 'none';
  }
  const hmwEl = cs.querySelector('.cs-hmw');
  if (p.hmw) { cs.querySelector('.cs-hmw-text').innerHTML = p.hmw; hmwEl.style.display = ''; }
  else { hmwEl.style.display = 'none'; }
  cs.querySelector('.cs-problem p').innerHTML = p.problem;
  cs.querySelector('.cs-research p').textContent = p.research;

  const insightData = p.insights || [];
  const insightsEl = cs.querySelector('.cs-insights');
  if (insightsEl) {
    insightsEl.innerHTML = insightData.map(ins => `
      <div class="cs-insight" tabindex="0">
        <div class="cs-insight-q">${ins.q}</div>
        ${ins.a ? `<div class="cs-insight-a"><span>${ins.a}</span></div>` : ''}
      </div>`).join('');
  }

  const visualEl = cs.querySelector('.cs-research-visual');
  if (visualEl) {
    const rvRaw = p.researchVisual || (p.images && p.images.insights
      ? { src: p.images.insights, label: p.images.insightsCaption || '' } : null);
    const rv = typeof rvRaw === 'string' ? { src: rvRaw, label: '' } : rvRaw;
    if (rv) {
      visualEl.innerHTML = `
        <figure class="cs-rfig">
          <button type="button" class="cs-rfig-btn" aria-label="Expand image">
            <img src="${rv.src}" alt="${rv.label || 'Research visual'}" loading="lazy" onerror="this.closest('.cs-rfig').classList.add('is-missing')">
            <span class="cs-rfig-zoom" aria-hidden="true">⤢</span>
          </button>
          <figcaption>${rv.label || 'Image placeholder'}</figcaption>
        </figure>`;
      visualEl.style.display = '';
      const rBtn = visualEl.querySelector('.cs-rfig-btn');
      const rImg = visualEl.querySelector('img');
      if (rBtn && rImg) rBtn.addEventListener('click', () => {
        if (!rBtn.closest('.cs-rfig').classList.contains('is-missing')) openLightbox(rImg.src, rImg.alt);
      });
    } else {
      visualEl.innerHTML = '';
      visualEl.style.display = 'none';
    }
  }

  const ideationIntro = cs.querySelector('.cs-ideation-intro');
  if (ideationIntro) ideationIntro.innerHTML = p.process || '';
  const ideaListEl = cs.querySelector('.cs-idea-list');
  const stepData = p.steps || [];
  const ideationSection = document.getElementById('cs-ideation');
  if (stepData.length && ideaListEl) {
    ideaListEl.innerHTML = stepData.map((s, idx) => {
      const rawImgs = s.imgs || (s.img ? [s.img] : []);
      const imgItems = rawImgs.map(it => typeof it === 'string' ? { src: it, label: '' } : it);
      const tradeoffs = s.tradeoffs || [];
      const hasDetail = s.body || tradeoffs.length;
      const imgsHtml = imgItems.length ? `<div class="cs-idea-imgs">${imgItems.map(im => `
        <figure class="cs-idea-fig">
          <img src="${im.src}" alt="${im.label || s.title}" loading="lazy" onerror="this.closest('.cs-idea-fig').classList.add('is-missing')">
          ${im.label ? `<figcaption>${im.label}</figcaption>` : ''}
        </figure>`).join('')}</div>` : '';
      return `
      <div class="cs-idea-card">
        ${imgsHtml}
        <div class="cs-idea-head">
          <span class="cs-idea-num">0${idx + 1}</span>
          <span class="cs-idea-title">${s.title}</span>
        </div>
        <div class="cs-idea-detail">
          ${!hasDetail ? '<p class="cs-idea-progress">In progress</p>' : ''}
          ${s.body ? `<p class="cs-idea-text">${s.body}</p>` : ''}
          ${tradeoffs.length ? `<div class="cs-idea-tradeoffs">
            <span class="cs-idea-tradeoffs-label">Trade-offs</span>
            <ul>${tradeoffs.map(t => {
              const obj = t && typeof t === 'object';
              const kind = obj ? (t.type || '') : '';
              const text = obj ? t.text : t;
              return `<li class="${kind === 'pro' ? 'cs-to-pro' : kind === 'con' ? 'cs-to-con' : ''}">${text}</li>`;
            }).join('')}</ul>
          </div>` : ''}
        </div>
      </div>`;
    }).join('');
    const trailEl = cs.querySelector('.cs-idea-trail');
    if (trailEl) {
      const trailImgs = (p.ideationImgs || []).map(it => typeof it === 'string' ? { src: it, label: '' } : it);
      trailEl.innerHTML = trailImgs.map(im => `
        <figure class="cs-idea-fig">
          <img src="${im.src}" alt="${im.label || 'Ideation'}" loading="lazy" onerror="this.closest('.cs-idea-fig').classList.add('is-missing')">
          <figcaption>${im.label || 'Image placeholder'}</figcaption>
        </figure>`).join('');
    }
    cs.querySelectorAll('.cs-idea-fig img').forEach(img => {
      img.addEventListener('click', e => {
        e.stopPropagation();
        if (!img.closest('.cs-idea-fig').classList.contains('is-missing')) openLightbox(img.src, img.alt);
      });
    });
    if (ideationSection) ideationSection.style.display = '';
  } else if (ideationSection) {
    ideationSection.style.display = 'none';
  }

  cs.querySelector('.cs-solution p').textContent = p.outcome;
  const flowsEl = cs.querySelector('.cs-flows');
  flowsEl.className = 'cs-flows' + (p.flowsStyle ? ' ' + p.flowsStyle : '');
  flowsEl.innerHTML = '';
  const flowData = p.flows || [];
  if (p.solutionVideo) {
    flowsEl.innerHTML = `
      <div class="cs-video-wrap">
        <video class="cs-video" controls playsinline preload="metadata"${p.solutionVideoPoster ? ` poster="${p.solutionVideoPoster}"` : ''}>
          <source src="${p.solutionVideo}" type="video/mp4">
          Your browser doesn&#39;t support embedded video.
        </video>
      </div>
      ${(p.rules && p.rules.length) ? `<button type="button" class="cs-rules-btn" onclick="openRules(${i})">Written Rules</button>` : ''}`;
  } else if (p.solutionImg) {
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
  const statData = p.stats || [];
  const statsWrap = cs.querySelector('.cs-stats-wrap');
  if (statData.length) {
    const rolestat = statData.find(s => s.lbl === 'My Role');
    const durstat = statData.find(s => s.lbl === 'Duration');
    const teamstat = statData.find(s => s.lbl === 'Team');
    cs.querySelector('.cs-stats').innerHTML = `
      <div class="cs-stat-row">
        ${teamstat ? `<div class="cs-stat"><span class="cs-stat-num">${teamstat.num}</span><span class="cs-stat-lbl">Team</span></div>` : ''}
        ${durstat ? `<div class="cs-stat"><span class="cs-stat-num">${durstat.num}</span><span class="cs-stat-lbl">Duration</span></div>` : ''}
      </div>
      ${rolestat ? `<div class="cs-stat cs-stat--full"><span class="cs-stat-num">${rolestat.num}</span><span class="cs-stat-lbl">My Role</span></div>` : ''}`;
    if (statsWrap) statsWrap.style.display = '';
  } else if (statsWrap) {
    statsWrap.style.display = 'none';
  }

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
