/* ══ SPA REDIRECT (restores deep-link path after the GitHub Pages 404 fallback) ══ */
(function () {
  try {
    const r = sessionStorage.getItem('spa-redirect');
    if (r) {
      sessionStorage.removeItem('spa-redirect');
      if (r !== location.pathname + location.search + location.hash) {
        history.replaceState(null, '', r);
      }
    }
  } catch (e) {}
})();

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
    slug: 'foodlens',
    label: 'Product Design · UX Research · 2026',
    title: 'FoodLens',
    role: ['Founder', 'UX / Product Designer'],
    team: 'Solo project',
    timeline: 'June 2026 – ongoing',
    tools: ['Figma', 'Figma MCP', 'Claude Code', 'Claude Design', 'GitHub', 'VS Code', 'TestFlight'],
    overview: 'FoodLens is a hands-free food scanner for smart glasses, built for people who check ingredients while shopping before they buy it. When the smart glasses are not connected, the feature falls back to the phone. This case study covers the phone experience, and the moment scanners fail most often, which is when a product isn\'t in the database.',
    subheads: {
      intro: 'A smart-glasses food scanner for allergies, sensitivities, and dietary restrictions.',
      problem: 'A food scanner is only as good as its database.',
      research: 'In a competitor\'s app, the shopper left without knowing if the food was safe.',
      ideation: 'The label scan has to be findable without making people look for it.',
      solution: 'The label scan coexists with the barcode scanner, before anything fails.',
      reflection: 'Designing for the moment it doesn\'t work.',
    },
    hmw: 'How might we give someone an answer about an unrecognized product while they\'re still standing in the aisle?',
    problem: 'Food scanners depend on barcode databases that don\'t have every product. Store brands, imported goods, and anything new to the shelf are the most likely to be missing in the database. When a barcode scan does fail, most apps ask shoppers to photograph the product and wait days for a response. Meanwhile, the shopper has to decide whether to verify the ingredients themselves or wait on days for an answer.',
    research: 'During a competitive usability study, I observed people using Fig, a food scanner app, to check an unrecognized product, then ran the same task on my own build. The first session, I watched them use the barcode scanner feature without intervening. The second, I asked them to complete the upload prompt, to see what happens after someone gives Fig what it asks for. Alongside the session I went through Fig\'s own documentation and app-store reviews to understand how the missing-product flow is meant to work. ',
    insights: [
      { q: 'Barcode scanning only works on products it already knows', a: 'It failed on imported products in the session, as it does on store brands and anything new to the database.' },
      { q: 'The upload prompt was abandoned on the first attempt', a: 'When the app asked the participant tophotograph the product for Fig\'s database, the participant backed out without completing it, and only tried again when prompted.' },
      { q: 'Completing the upload returned nothing', a: 'The app went back to the camera screen which had no confirmation, no timeline, no explanation of what the photo would be used for. Participant had no idea whether it had worked.' },
      { q: 'A new way to find the information went unnoticed', a: 'Fig can check a product by brand name through manual search. Nothing on the miss screen pointed to that feature, and the participant didn\'t know it existed.' },
    ],
    researchVisual: [
      { src: 'images_fl/Foodlens_Research.png', alt: 'A comparative journey map of the observed session, tracking each step and emotional low as the shopper scanned an unrecognized product in Fig and in my build.' },
      { src: 'images_fl/fig_prompt.PNG', small: true, alt: 'Fig\'s screen asking the user to photograph the unrecognized product to help build its database, with no result shown in return.' },
    ],
    process: 'From the two participants who scanned products Fig didn\'t recognize: one backed out of the upload prompt and the other completed it and was returned to the camera with no confirmation. Neither knew Fig\'s manual search existed. Instead of relying on the database, I noticed that every package already has an ingredient label, so instead of waiting on a database, the app can read that label and flag ingredients based on the users profile. <span class="cs-highlight">So, should the fallback appear only when a scan fails, or keep it available from the start?</span>',
    steps: [
      {
        title: 'Offer it on failure',
        body: 'The fallback appears in the miss modal, at the moment when a user needs it',
        imgs: [{ src: 'images_fl/ideation1.png', alt: 'Wireframes of the barcode-first flow, where the ingredient-label option only appears after a scan fails.' }],
        tradeoffs: [
          { type: 'pro', text: 'It keeps the default path, barcode scan, simple and familiar for users' },
          { type: 'con', text: 'The user has to fail first to discover it. However, this risks losing the user.' },
        ],
      },
      {
        title: 'Keep it always available',
        body: 'Include barcode and ingredient-label scanning together, which is usable before any barcode scan attempt',
        imgs: [{ src: 'images_fl/ideation2.png', alt: 'Higher-fidelity screens of the hybrid flow, with barcode and ingredient-label scanning available side by side.' }],
        tradeoffs: [
          { type: 'pro', text: 'Users with unlabeled or unrecognized products can skip the barcode entirely' },
          { type: 'con', text: 'Risks pulling users onto the slower label scan when barcode would have worked in two seconds' },
        ],
      },
    ],
    outcome: 'Both participants stopped using Fig even though it had a search feature that would have answered their question. They didn\'t know it was there. So I put the label scan directly on the scanner screen instead of only showing it after a failed scan. The downside is that people might tap it when scanning the barcode would have been faster.',
    flows: [
      { title: 'Skip the barcode, read the ingredient label', body: '"Scan ingredients label instead" sits under the camera view. Tapping it photographs the ingredients label and reads it directly, with no barcode attempt needed.', img: 'images_fl/finaldesign-label.png', alt: 'The scanner screen with a "Scan ingredients label instead" button placed directly beneath the camera view.' },
      { title: 'Labels in other languages', body: 'If the label is in another language, the scan translates it, so imported products work the same as English ones.', img: 'images_fl/finaldesign-translate.png', alt: 'An ingredient-label scan result for an imported product, translated into English as it is read.' },
    ],
    reflection: 'I started out assuming barcode scanning would be enough until I tested on multiple products and hit barcodes that weren\'t in the database, or didn\'t exist at all. What I took from the experience was to design for the failure, so that users always get an answer instead of having to wait for one.',
    takeaways: [
      { title: 'What I\'d change', body: 'Test the label placement. I need to check whether visible button gets noticed.' },
      { title: 'What\'s still open', body: 'The label path doesn\'t show a product image. I need to research how to pull one when there\'s no barcode.' },
      { title: 'What\'s next', body: 'Exploring how AI can read the whole package instead of a barcode or label.' },
    ],
  },
  {
    emoji: '👁️', bg: '#EEF0F9',
    slug: 'co-op-watch',
    label: 'Interaction Design · UX Research · 2026',
    title: 'Co-op Watch',
    role: ['Interaction Designer', 'UX Research', 'Product Management'],
    team: ['UI Developer', 'UI Designer', 'UX Research', 'Principal Investigator'],
    timeline: 'March 2026 – ongoing',
    tools: ['Figma', 'Claude Code', 'GitHub'],
    subheads: {
      intro: 'A surveillance game played on an interactive tabletop display.',
      problem: 'Players were giving orders instead of talking or collaborating.',
      research: 'One player read the screen and everyone waited for instructions.',
      ideation: 'Ensuring players care about the discussion and not just answering it.',
      solution: 'Every game incident\'s consequences are decided by a discussion.',
      reflection: 'The narrative version hasn\'t been tested yet.',
    },
    overview: 'Co-op Watch is a cooperative game where players work together to remove surveillance devices spreading across their city before the community\'s trust collapses. It runs on a shared single-touch table, which means all four players see the same information at the same time, but only one can touch the screen at a time. The game was built as both a game and a research tool, to study how people talk about surveillance when they have to make decisions about it together.',
    hmw: 'How might we design game moments that require players to discuss with each other rather than just delivering instructions to each other?',
    problem: 'Co-op Watch is designed to spark discourse on surveillance through shared decision-making, but if players default to <span class="cs-highlight">delivering instructions</span> to each other, it loses its <span class="cs-highlight">conversational value</span>. In a cooperative game the fastest way to win is for one person to figure out the best move and tell everyone else what to do. In early playtests, players coordinated moves efficiently and never discussed the topic at all.',
    research: 'We started with a literature review on shared tabletop displays, cooperative game design, and surveillance as a discussion topic. Then we ran peer playtests with 2–4 players and took observation notes on how they communicated. Afterward we went back to the literature to check what we\'d seen, which made us explore using embedded narrative to facilitate discussion and collaboration.',
    insights: [
      { q: 'One player became the leader', a: 'A single player ended up telling everyone where to move, explaining the mechanics, and answering questions. Prior research on single-touch shared displays reports the same pattern regardless of the task, so the input model may be causing this as much as the game is.' },
      { q: 'Other players stopped making their own decisions', a: 'Players asked the leader what to do, and asked whether they were allowed to make certain moves.' },
      { q: 'Leading was tiring', a: 'The leading player showed visible fatigue but kept doing it.' },
      { q: 'The core mechanic gave players nothing to talk about', a: 'Removing devices was a placement decision, not a judgment call. Players said the game felt long and repetitive.' },
    ],
    researchVisual: { src: 'images_cw/Research.png', alt: 'Playtest observation notes grouped into themes about how one player took over and the others deferred to them.' },
    process: 'The second literature review allowed us to explore embedded narrative which means conveying information through the story of the game. Instead of verbally asking questions regarding surveillance while they are playing, we thought of ways we can include narrative elements in the game. We prototyped two ways to prompt discussion and tested both using paper prototyping.',
    steps: [
      {
        title: 'Direct Questions',
        body: 'Ask players a direct surveillance-related question each round. They engaged at first, but over time answered blindly just to get it out of the way.',
        imgs: [{ src: 'images_cw/ideation1.png', alt: 'Sketch of the direct-questions approach, where a surveillance question is posed to players each round.' }],
        tradeoffs: [
          { type: 'pro', text: 'Fast to prototype and easy for players to understand' },
          { type: 'con', text: 'Players engaged at first, then answered blindly to move the game along' },
        ],
      },
      {
        title: 'Narrative Events',
        body: 'Reframe the questions as narrative events tied to the game\'s surveillance incidents, so the discussion comes out of what\'s happening in the game.',
        imgs: [{ src: 'images_cw/ideation2.png', alt: 'Sketch of the narrative-events approach, where discussion prompts are tied to the game\'s surveillance incidents.' }],
        tradeoffs: [
          { type: 'pro', text: 'Discussion came from the game rather than interrupting the game flow' },
          { type: 'con', text: 'More design work to write events for every incident event' },
        ],
      },
    ],
    outcome: 'Once all players finish their turn, a surveillance incident comes up and the group decides together whether to approve the devices. Each choice comes with a cost by either adding surveillance devices and/or decreasing the privacy and trust meter, so players have a reason to talk it through.',
    flows: [
      { title: 'Consequences stay hidden until the next board phase', body: 'Players can\'t see what either choice will cost while they\'re deciding. If the costs were visible, the discussion would be about optimizing numbers instead of what the group thinks should happen.', img: 'images_cw/finaldesign-hidden.png', alt: 'A surveillance incident screen where the cost of each option is concealed while players decide.' },
    ],
    solutionVideo: 'images_cw/surveillance_game.mp4',
    rulesTitle: 'How to Play Co-op Watch',
    rules: [
      { title: 'Setup', text: 'Placeholder — describe the board, where the four players sit, and the components each player starts with.' },
      { title: 'On your turn', text: 'Placeholder — what a player does on their turn (adding or removing a surveillance device, etc.).' },
      { title: 'Surveillance incident', text: 'Once every player has taken a turn, a surveillance incident appears. Players discuss and vote together on whether to approve the devices added or removed — each decision carries a cost.' },
      { title: 'Ending the game', text: 'Placeholder — the win/lose condition and how the game concludes.' },
    ],
    reflection: 'The pilot playtests ran on a version without the narrative or discussion prompts, so what we observed came from an incomplete design. The formal study is IRB-approved and testing begins in September 2026.',
    takeaways: [
      { title: 'What I\'d change', body: 'Run comparative playtests on two narrative framings instead of assuming one was right based on early feedback.' },
      { title: 'What\'s still open', body: 'Whether the narrative prompts change the leader dynamic at all.' },
      { title: 'Where this goes next', body: 'Observing 2–4 players across eight narrative rounds, with a post-game survey and a group debrief afterward.' },
    ],
  },
  {
    emoji: '🤝', bg: '#EAF4F0',
    slug: 'mentorship-platform',
    label: 'Product Design · UX Research · 2026',
    title: 'Mentorship Platform',
    role: ['UX Designer', 'UX Research', 'Project Lead'],
    team: ['2 Design Teams', '2 Developers', 'Chair of the MS HCI Department'],
    timeline: 'July 2026 – ongoing',
    tools: ['Figma', 'Figma MCP', 'Claude Code', 'VS Code', 'GitHub'],
    subheads: {
      intro: 'An onboarding flow for a HCI master\'s mentorship program that currently matches by hand.',
      problem: 'The chair manages 30 forms each semester while verifying 50 mentors one at a time.',
      research: 'Mentor and mentee information was missing or out-of-date.',
      ideation: 'Two ways to reduce the amount of time spent on filling in a profile.',
      solution: 'People import their information to fill out their profile.',
    },
    overview: 'The mentor coalition pairs UX and HCI professionals from industry and non-profit organizations with students in UC Santa Cruz\'s HCI master\'s program. This case study covers the onboarding flow for the platform that automates the matching process.',
    hmw: 'Collect mentor and mentee information in a way that stays accurate and can be updated?',
    problem: 'The chair matches mentors and mentees by hand. Mentors never fill out a form at all, so their background has to be looked up on LinkedIn one at a time — around 50 of them. Mentees do submit a form, but by the time matching happens they often don\'t remember what they wrote, and there\'s no way for them to go back and update it.<br><br>The chair ends up matching people based on <span class="cs-highlight">information nobody can confirm is still accurate</span>.',
    research: 'We interviewed mentors and mentees, ran affinity mapping across both groups, mapped the chair\'s current process, and looked at how other platforms handle onboarding.',
    insights: [
      { q: 'Mentors never submitted anything', a: 'Their background had to be gathered from LinkedIn by hand, one profile at a time.' },
      { q: 'Mentees couldn\'t remember or change what they wrote', a: 'The form was filled out months before matching, and there was no way to go back and update it.' },
      { q: 'Shared context helped mentorships last', a: 'Pairs with something in common sustained the relationship more easily.' },
      { q: 'Every platform we looked at offered import', a: 'None of them asked people to type their background from scratch.' },
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
function openCase(i, push = true) {
  const p = cases[i];
  if (!p) return;
  if (push && p.slug) {
    history.pushState({ caseIndex: i }, '', '/' + p.slug);
  }
  document.title = p.title + ' — Nicole Fajardo';
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

  const subheads = p.subheads || {};
  cs.querySelectorAll('.cs-section-sub').forEach(el => {
    el.textContent = subheads[el.dataset.sub] || 'Work in progress';
  });
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
  if (p.hmw) {
    cs.querySelector('.cs-hmw-text').innerHTML = p.hmw.replace(/^how might we\s+/i, '');
    hmwEl.style.display = '';
  } else { hmwEl.style.display = 'none'; }
  cs.querySelector('.cs-problem p').innerHTML = p.problem;
  cs.querySelector('.cs-research p').textContent = p.research;

  const insightData = p.insights || [];
  const insightsLabel = cs.querySelector('.cs-insights-label');
  if (insightsLabel) insightsLabel.style.display = insightData.length ? '' : 'none';
  const insightsEl = cs.querySelector('.cs-insights');
  if (insightsEl) {
    insightsEl.innerHTML = insightData.map(ins => `
      <div class="cs-insight">
        <span class="cs-insight-num" aria-hidden="true">✦</span>
        <div class="cs-insight-body">
          <div class="cs-insight-q">${ins.q}</div>
          ${ins.a ? `<div class="cs-insight-a">${ins.a}</div>` : ''}
        </div>
      </div>`).join('');
  }

  const visualEl = cs.querySelector('.cs-research-visual');
  if (visualEl) {
    let rvRaw = p.researchVisual || (p.images && p.images.insights
      ? { src: p.images.insights, label: p.images.insightsCaption || '' } : null);
    const rvList = (Array.isArray(rvRaw) ? rvRaw : (rvRaw ? [rvRaw] : []))
      .map(v => typeof v === 'string' ? { src: v, label: '' } : v);
    if (rvList.length) {
      visualEl.innerHTML = rvList.map(rv => `
        <figure class="cs-rfig${rv.small ? ' cs-rfig--small' : ''}">
          <button type="button" class="cs-rfig-btn" aria-label="Expand image: ${rv.alt || rv.label || 'research visual'}">
            <img src="${rv.src}" alt="${rv.alt || rv.label || 'Research visual'}" loading="lazy" onerror="this.closest('.cs-rfig').classList.add('is-missing')">
            <span class="cs-rfig-zoom" aria-hidden="true">⤢</span>
          </button>
        </figure>`).join('');
      visualEl.classList.toggle('cs-research-visual--multi', rvList.length > 1);
      visualEl.style.display = '';
      visualEl.querySelectorAll('.cs-rfig-btn').forEach(btn => {
        const img = btn.querySelector('img');
        btn.addEventListener('click', () => {
          if (img && !btn.closest('.cs-rfig').classList.contains('is-missing')) openLightbox(img.src, img.alt);
        });
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
        <figure class="cs-idea-fig" role="img" aria-label="${(im.alt || im.label || s.title || '').replace(/"/g, '&quot;')}">
          <img src="${im.src}" alt="" loading="lazy" onerror="this.closest('.cs-idea-fig').classList.add('is-missing')">
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
        <figure class="cs-idea-fig" role="img" aria-label="${(im.alt || im.label || 'Ideation image').replace(/"/g, '&quot;')}">
          <img src="${im.src}" alt="" loading="lazy" onerror="this.closest('.cs-idea-fig').classList.add('is-missing')">
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
  const flowItemsHtml = data => data.map(f => `<div class="cs-flow-item">
      ${('img' in f) ? `<figure class="cs-sol-fig cs-sol-fig--phone" role="img" aria-label="${(f.alt || f.title || '').replace(/"/g, '&quot;')}"><img src="${f.img || ''}" alt="" loading="lazy" onerror="this.closest('.cs-sol-fig').classList.add('is-missing')"></figure>` : ''}
      <div class="cs-flow-text"><div class="cs-flow-title">${f.title}</div><div class="cs-flow-body">${f.body}</div></div>
    </div>`).join('');
  if (p.solutionVideo) {
    flowsEl.innerHTML = `
      ${flowData.length ? flowItemsHtml(flowData) : ''}
      <div class="cs-video-wrap">
        <video class="cs-video" controls playsinline preload="metadata"${p.solutionVideoPoster ? ` poster="${p.solutionVideoPoster}"` : ''}>
          <source src="${p.solutionVideo}" type="${/\.mov$/i.test(p.solutionVideo) ? 'video/mp4' : 'video/' + (p.solutionVideo.split('.').pop() || 'mp4')}">
          Your browser doesn&#39;t support embedded video.
        </video>
      </div>
      ${(p.rules && p.rules.length) ? `<button type="button" class="cs-rules-btn" onclick="openRules(${i})">Written Rules</button>` : ''}`;
  } else if (p.solutionImg && !flowData.length) {
    flowsEl.innerHTML = `<img src="${p.solutionImg}" alt="${p.title} solution" style="width:100%;border-radius:16px;display:block;">`;
  } else {
    let html = p.flowsStyle === 'flows-free'
      ? `<div style="display:flex;gap:28px;align-items:flex-start;"><div style="flex:1;">${flowData.map(f=>`<div class="cs-flow-row"><div class="cs-flow-text"><div class="cs-flow-title">${f.title}</div><div class="cs-flow-body">${f.body}</div></div></div>`).join('')}</div><div class="cs-flow-img">${flowData.find(f=>f.img)?`<img src="${flowData.find(f=>f.img).img}" style="width:100%;border-radius:16px;">`:''}
</div></div>`
      : flowItemsHtml(flowData);
    if (p.solutionImg) {
      html += `<figure class="cs-sol-fig" role="img" aria-label="${p.title} final design"><img src="${p.solutionImg}" alt="" loading="lazy" onerror="this.closest('.cs-sol-fig').classList.add('is-missing')"></figure>`;
    }
    flowsEl.innerHTML = html;
  }
  flowsEl.querySelectorAll('.cs-sol-fig img').forEach(im => im.addEventListener('click', () => {
    if (!im.closest('.cs-sol-fig').classList.contains('is-missing')) openLightbox(im.src, im.alt);
  }));

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
    <div class="cs-takeaway">
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

function closeCase(push = true) {
  const cs = document.getElementById('case-study');
  if (!cs) return;
  cs.classList.remove('open');
  cs.scrollTop = 0;
  document.body.style.overflow = '';
  const btn = document.getElementById('back-to-top');
  if (btn) btn.classList.remove('visible');
  document.title = 'Nicole Fajardo';
  if (push) {
    if (history.state && history.state.caseIndex != null) history.back();
    else if (location.pathname !== '/') history.pushState({}, '', '/');
  }
}

/* ══ ROUTING ══ */
function caseIndexForPath() {
  const slug = decodeURIComponent(location.pathname.replace(/^\/+|\/+$/g, ''));
  if (!slug) return -1;
  return cases.findIndex(c => c.slug === slug);
}
function syncRoute() {
  const i = caseIndexForPath();
  const cs = document.getElementById('case-study');
  if (i >= 0) {
    openCase(i, false);
  } else if (cs && cs.classList.contains('open')) {
    closeCase(false);
  } else {
    document.title = 'Nicole Fajardo';
  }
}
window.addEventListener('popstate', syncRoute);
syncRoute();
