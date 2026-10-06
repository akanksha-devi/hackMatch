const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9299;
const ARTIFACTS_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\f7146f29-bd94-4d09-8a54-d58e5dd1b822';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STEP 4.5B: MOTION & UNIVERSAL SEARCH UX HARDENING');
  console.log('====================================================\n');

  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    `${APP_URL}/login`
  ]);

  await sleep(2500);

  try {
    const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    const tab = tabs.find((t) => t.type === 'page');
    if (!tab) throw new Error('No page tab found in Edge CDP');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let msgId = 1;
    const callbacks = new Map();
    ws.onmessage = (e) => {
      try {
        const resp = JSON.parse(e.data);
        if (resp.id && callbacks.has(resp.id)) {
          const cb = callbacks.get(resp.id);
          callbacks.delete(resp.id);
          cb(resp);
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, (resp) => {
          if (resp.error) reject(resp.error);
          else resolve(resp.result);
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evalVal(expr) {
      const res = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true,
        awaitPromise: true,
      });
      return res && res.result ? res.result.value : undefined;
    }

    async function screenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`  📸 Screenshot saved: ${filename}`);
    }

    async function setViewport(width, height) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 768,
      });
      await sleep(250);
    }

    async function moveMouse(x, y) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: Math.round(x),
        y: Math.round(y),
      });
      await sleep(150);
    }

    async function clickMouse(x, y) {
      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: Math.round(x),
        y: Math.round(y),
        button: 'left',
        clickCount: 1,
      });
      await sleep(50);
      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: Math.round(x),
        y: Math.round(y),
        button: 'left',
        clickCount: 1,
      });
      await sleep(200);
    }

    async function sendKey(key, modifiers = 0) {
      await send('Input.dispatchKeyEvent', {
        type: 'rawKeyDown',
        key,
        modifiers,
      });
      await sleep(50);
      await send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key,
        modifiers,
      });
      await sleep(100);
    }

    await send('Page.enable');
    await send('DOM.enable');
    await send('Runtime.enable');

    await sleep(1000);

    // --------------------------------------------------------------------------
    // AUTHENTICATION: Login as Alex (Student)
    // --------------------------------------------------------------------------
    console.log('[1] Logging in as Alex (Student)...');
    await evalVal(`(async () => {
      const alexBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex'));
      if (alexBtn) alexBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    })()`);
    await sleep(2500);

    const currentUrl = await evalVal(`window.location.href`);
    console.log(`  ✓ Authenticated. Current page: ${currentUrl}`);

    // Set Dark Theme
    await evalVal(`
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    `);
    await sleep(300);

    // --------------------------------------------------------------------------
    // TEST 1: HOME PAGE HERO OVERLAY FIX & ALL CLOSE METHODS
    // --------------------------------------------------------------------------
    console.log('\n[2] Testing Universal Search Overlay on Home Page Hero...');
    await evalVal(`window.__navigate ? window.__navigate('/') : (window.location.href = '/')`);
    await sleep(1200);

    // 2a. Open by Ctrl+K on Home page
    console.log('  2a. Opening search via Ctrl+K on Home page...');
    await sendKey('k', 2);
    await sleep(350);

    const homeSearchState = await evalVal(`(() => {
      const modal = document.querySelector('[data-testid="search-modal"]');
      const backdrop = document.querySelector('[data-testid="search-backdrop"]');
      const closeBtn = document.querySelector('[data-testid="search-close-button"]');
      const bodyOverflow = document.body.style.overflow;
      const bodyPaddingRight = document.body.style.paddingRight;
      
      return {
        modalFound: Boolean(modal),
        backdropFound: Boolean(backdrop),
        closeBtnFound: Boolean(closeBtn),
        bodyOverflow,
        bodyPaddingRight,
        backdropZIndex: backdrop ? window.getComputedStyle(backdrop).zIndex : null,
        modalZIndex: modal ? window.getComputedStyle(modal.parentElement).zIndex : null,
        isPortaledToBody: modal ? modal.parentElement.parentElement === document.body : false,
      };
    })()`);

    console.log('  Home Search Overlay Telemetry:', homeSearchState);
    await screenshot('step45b_search_home_hero_fixed_dark.png');

    // 2b. Test Explicit Close Button
    console.log('  2b. Testing explicit close button click...');
    const closeBtnBox = await evalVal(`(() => {
      const btn = document.querySelector('[data-testid="search-close-button"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (closeBtnBox) {
      await clickMouse(closeBtnBox.x, closeBtnBox.y);
      await sleep(300);
    }
    const closedAfterBtn = await evalVal(`Boolean(document.querySelector('[data-testid="search-modal"]'))`);
    console.log('  Closed via explicit Close button:', closedAfterBtn ? '❌ FAILED' : '✅ PASSED');

    // 2c. Test Open via Desktop Navbar Search Trigger Click
    console.log('  2c. Opening search via Navbar trigger click...');
    const navSearchTrigger = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Universal Command Search"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (navSearchTrigger) {
      await clickMouse(navSearchTrigger.x, navSearchTrigger.y);
      await sleep(350);
    }
    const reopenedViaNav = await evalVal(`Boolean(document.querySelector('[data-testid="search-modal"]'))`);
    console.log('  Re-opened via Navbar search trigger:', reopenedViaNav ? '✅ PASSED' : '❌ FAILED');

    // 2d. Test Click Search Trigger AGAIN when open (Toggle behavior)
    console.log('  2d. Clicking Navbar search trigger again (Toggle test)...');
    if (navSearchTrigger) {
      await clickMouse(navSearchTrigger.x, navSearchTrigger.y);
      await sleep(350);
    }
    const closedAfterToggle = await evalVal(`Boolean(document.querySelector('[data-testid="search-modal"]'))`);
    console.log('  Toggled closed by clicking trigger again:', closedAfterToggle ? '❌ FAILED' : '✅ PASSED');

    // 2e. Re-open and test Click Outside on Backdrop
    console.log('  2e. Re-opening and testing Click Outside on Backdrop...');
    await sendKey('k', 2);
    await sleep(350);

    // Click on empty top-left backdrop area (x: 50, y: 50)
    await clickMouse(50, 50);
    await sleep(300);
    const closedAfterClickOutside = await evalVal(`Boolean(document.querySelector('[data-testid="search-modal"]'))`);
    console.log('  Closed via Click Outside on Backdrop:', closedAfterClickOutside ? '❌ FAILED' : '✅ PASSED');

    // 2f. Re-open and test Escape Key Dismissal
    console.log('  2f. Testing Escape key dismissal...');
    await sendKey('k', 2);
    await sleep(350);
    await sendKey('Escape');
    await sleep(300);
    const closedAfterEscape = await evalVal(`Boolean(document.querySelector('[data-testid="search-modal"]'))`);
    console.log('  Closed via Escape key:', closedAfterEscape ? '❌ FAILED' : '✅ PASSED');

    // --------------------------------------------------------------------------
    // TEST 2: AUTHENTICATED SEARCH RESULTS & KEYBOARD NAVIGATION
    // --------------------------------------------------------------------------
    console.log('\n[3] Testing authenticated multi-category search with live backend...');
    await evalVal(`window.__navigate ? window.__navigate('/dashboard') : (window.location.href = '/dashboard')`);
    await sleep(1000);

    // Open search
    await sendKey('k', 2);
    await sleep(350);

    // Focus input and type query "hack" using Input.insertText
    console.log('  Typing query "hack" via Input.insertText...');
    await evalVal(`document.querySelector('[data-testid="search-modal"] input')?.focus()`);
    await sleep(100);
    await send('Input.insertText', { text: 'hack' });
    await sleep(650);

    const searchResultsData = await evalVal(`(() => {
      const modal = document.querySelector('[data-testid="search-modal"]');
      const items = modal.querySelectorAll('[data-selected]');
      const highlighted = modal.querySelectorAll('span.font-semibold.text-indigo-600, span.font-semibold.text-indigo-400');
      return {
        resultsCount: items.length,
        highlightsCount: highlighted.length,
        firstTitle: items.length > 0 ? items[0].querySelector('p')?.textContent : null,
      };
    })()`);

    console.log('  Search Results:', searchResultsData);
    await screenshot('step45b_search_results_authenticated_dark.png');

    // 3b. Test ArrowDown & ArrowUp Navigation
    console.log('  3b. Testing ArrowDown navigation...');
    await sendKey('ArrowDown');
    await sleep(150);

    const activeAfterDown = await evalVal(`(() => {
      const el = document.querySelector('[data-testid="search-modal"] [data-selected="true"]');
      return el ? el.querySelector('p')?.textContent : null;
    })()`);
    console.log(`  Selected after ArrowDown: "${activeAfterDown}"`);

    // 3c. Test Enter selection
    console.log('  3c. Testing Enter key selection...');
    await sendKey('Enter');
    await sleep(400);

    const closedAfterEnter = await evalVal(`Boolean(document.querySelector('[data-testid="search-modal"]'))`);
    const currentPathAfterEnter = await evalVal(`window.location.pathname`);
    console.log(`  Closed after Enter: ${closedAfterEnter ? '❌ NO' : '✅ YES'}, Navigated to: ${currentPathAfterEnter}`);

    // --------------------------------------------------------------------------
    // TEST 3: CARD MICRO-CHOREOGRAPHY ON HACKATHONCARD, USERCARD & TEAMREQUESTCARD
    // --------------------------------------------------------------------------
    console.log('\n[4] Testing Real Pointer Card Micro-Choreography...');

    // 4A: HackathonCard on /hackathons
    console.log('  4A: Testing HackathonCard on /hackathons...');
    await evalVal(`window.__navigate ? window.__navigate('/hackathons') : (window.location.href = '/hackathons')`);
    await sleep(1200);

    // Scroll first card to center of viewport
    await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (card) card.scrollIntoView({ block: 'center' });
    })()`);
    await sleep(350);

    const hackCardBefore = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      const style = window.getComputedStyle(card);
      const title = card.querySelector('.card-title');
      const r = card.getBoundingClientRect();
      return {
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height,
        cardTransform: style.transform,
        cardBorder: style.borderColor,
        titleColor: title ? window.getComputedStyle(title).color : null,
      };
    })()`);

    console.log('    HackathonCard Baseline:', {
      cardTransform: hackCardBefore?.cardTransform,
      cardBorder: hackCardBefore?.cardBorder,
      titleColor: hackCardBefore?.titleColor,
    });

    const hackCenterX = hackCardBefore.x + hackCardBefore.width / 2;
    const hackCenterY = hackCardBefore.y + hackCardBefore.height / 2;
    console.log(`    Moving pointer onto HackathonCard (${hackCenterX}, ${hackCenterY})...`);
    await moveMouse(hackCenterX, hackCenterY);
    await sleep(350);

    const hackCardHover = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      const style = window.getComputedStyle(card);
      const title = card.querySelector('.card-title');
      const meta = card.querySelector('.card-meta');
      const desc = card.querySelector('.card-desc');
      const chip = card.querySelector('.card-chip');
      const icon = card.querySelector('.card-action-icon');
      return {
        cardTransform: style.transform,
        cardBorder: style.borderColor,
        cardShadow: style.boxShadow?.substring(0, 45) + '...',
        titleColor: title ? window.getComputedStyle(title).color : null,
        metaTransform: meta ? window.getComputedStyle(meta).transform : null,
        descOpacity: desc ? window.getComputedStyle(desc).opacity : null,
        chipTransform: chip ? window.getComputedStyle(chip).transform : null,
        iconTransform: icon ? window.getComputedStyle(icon).transform : null,
      };
    })()`);

    console.log('    HackathonCard Hover State:', hackCardHover);
    await screenshot('step45b_hackathon_card_hover_measured.png');

    const hackLifted = hackCardHover.cardTransform !== 'none' && hackCardHover.cardTransform.includes('matrix');
    const hackBorder = hackCardHover.cardBorder !== hackCardBefore.cardBorder;
    const hackTitle = hackCardHover.titleColor !== hackCardBefore.titleColor;
    console.log(`    ✓ HackathonCard Lift: ${hackLifted ? '✅ YES' : '❌ NO'}`);
    console.log(`    ✓ HackathonCard Border Rim: ${hackBorder ? '✅ YES' : '❌ NO'}`);
    console.log(`    ✓ HackathonCard Title Emphasis: ${hackTitle ? '✅ YES' : '❌ NO'}`);

    // Move pointer away
    await moveMouse(10, 10);
    await sleep(250);

    // 4B: UserCard on /users
    console.log('  4B: Testing UserCard on /users...');
    await evalVal(`window.__navigate ? window.__navigate('/users') : (window.location.href = '/users')`);
    await sleep(1200);

    await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (card) card.scrollIntoView({ block: 'center' });
    })()`);
    await sleep(350);

    const userCardBefore = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      const style = window.getComputedStyle(card);
      const title = card.querySelector('.card-title');
      const r = card.getBoundingClientRect();
      return {
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height,
        cardTransform: style.transform,
        cardBorder: style.borderColor,
        titleColor: title ? window.getComputedStyle(title).color : null,
      };
    })()`);

    const userCenterX = userCardBefore.x + userCardBefore.width / 2;
    const userCenterY = userCardBefore.y + userCardBefore.height / 2;
    console.log(`    Moving pointer onto UserCard (${userCenterX}, ${userCenterY})...`);
    await moveMouse(userCenterX, userCenterY);
    await sleep(350);

    const userCardHover = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      const style = window.getComputedStyle(card);
      const title = card.querySelector('.card-title');
      return {
        cardTransform: style.transform,
        cardBorder: style.borderColor,
        titleColor: title ? window.getComputedStyle(title).color : null,
      };
    })()`);

    console.log('    UserCard Hover State:', userCardHover);
    await screenshot('step45b_user_card_hover_measured.png');

    const userLifted = userCardHover.cardTransform !== 'none' && userCardHover.cardTransform.includes('matrix');
    console.log(`    ✓ UserCard Lift & Highlight: ${userLifted ? '✅ YES' : '❌ NO'}`);

    // Move pointer away
    await moveMouse(10, 10);
    await sleep(250);

    // 4C: TeamRequestCard on /profile
    console.log('  4C: Testing TeamRequestCard on /profile...');
    await evalVal(`window.__navigate ? window.__navigate('/profile') : (window.location.href = '/profile')`);
    await sleep(1200);

    await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (card) card.scrollIntoView({ block: 'center' });
    })()`);
    await sleep(350);

    const teamCardBefore = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      const style = window.getComputedStyle(card);
      const title = card.querySelector('.card-title');
      const r = card.getBoundingClientRect();
      return {
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height,
        cardTransform: style.transform,
        cardBorder: style.borderColor,
        titleColor: title ? window.getComputedStyle(title).color : null,
      };
    })()`);

    if (teamCardBefore) {
      const teamCenterX = teamCardBefore.x + teamCardBefore.width / 2;
      const teamCenterY = teamCardBefore.y + teamCardBefore.height / 2;
      console.log(`    Moving pointer onto TeamRequestCard (${teamCenterX}, ${teamCenterY})...`);
      await moveMouse(teamCenterX, teamCenterY);
      await sleep(350);

      const teamCardHover = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        if (!card) return null;
        const style = window.getComputedStyle(card);
        const title = card.querySelector('.card-title');
        return {
          cardTransform: style.transform,
          cardBorder: style.borderColor,
          titleColor: title ? window.getComputedStyle(title).color : null,
        };
      })()`);

      console.log('    TeamRequestCard Hover State:', teamCardHover);
      await screenshot('step45b_team_request_card_hover_measured.png');
      const teamLifted = teamCardHover.cardTransform !== 'none' && teamCardHover.cardTransform.includes('matrix');
      console.log(`    ✓ TeamRequestCard Lift & Highlight: ${teamLifted ? '✅ YES' : '❌ NO'}`);
    }

    // Move pointer away
    await moveMouse(10, 10);
    await sleep(250);

    // --------------------------------------------------------------------------
    // TEST 4: PROFILE MENU & NOTIFICATION POPOVER HOVER & ROW MOTIONS
    // --------------------------------------------------------------------------
    console.log('\n[5] Testing Profile & Notification Popover Hover Interactions...');
    await evalVal(`window.scrollTo(0, 0)`);
    await sleep(200);

    // 5a. Profile Trigger Hover
    const profileTriggerBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="profile menu"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (profileTriggerBox) {
      await moveMouse(profileTriggerBox.x, profileTriggerBox.y);
      await sleep(250);
    }
    await screenshot('step45b_profile_trigger_hover.png');

    // 5b. Notification Bell Hover & Open
    const notifBellBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Notifications"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (notifBellBox) {
      await moveMouse(notifBellBox.x, notifBellBox.y);
      await sleep(200);
      await clickMouse(notifBellBox.x, notifBellBox.y);
      await sleep(400);
    }

    const notifPopoverOpen = await evalVal(`Boolean(document.querySelector('[role="dialog"][aria-label="Notifications popover"]'))`);
    console.log('  Notification Popover Open:', notifPopoverOpen ? '✅ PASSED' : '❌ FAILED');
    await screenshot('step45b_notification_popover_open_dark.png');

    // Dismiss notification popover
    await sendKey('Escape');
    await sleep(250);

    // --------------------------------------------------------------------------
    // TEST 5: LIGHT MODE VERIFICATION & SCREENSHOT
    // --------------------------------------------------------------------------
    console.log('\n[6] Testing Light Mode Universal Search & Card Choreography...');
    await evalVal(`
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    `);
    await sleep(300);

    // Open search in light mode
    await sendKey('k', 2);
    await sleep(350);

    const searchLightData = await evalVal(`(() => {
      const modal = document.querySelector('[data-testid="search-modal"]');
      const backdrop = document.querySelector('[data-testid="search-backdrop"]');
      return {
        modalBg: modal ? window.getComputedStyle(modal).backgroundColor : null,
        backdropBg: backdrop ? window.getComputedStyle(backdrop).backgroundColor : null,
        modalBorder: modal ? window.getComputedStyle(modal).borderColor : null,
      };
    })()`);
    console.log('  Light Mode Command Search Styles:', searchLightData);
    await screenshot('step45b_search_open_light.png');

    // Dismiss search
    await sendKey('Escape');
    await sleep(250);

    // --------------------------------------------------------------------------
    // TEST 6: REDUCED MOTION ACCESSIBILITY VERIFICATION
    // --------------------------------------------------------------------------
    console.log('\n[7] Testing prefers-reduced-motion Accessibility Enforcement...');
    await evalVal(`window.__navigate ? window.__navigate('/hackathons') : (window.location.href = '/hackathons')`);
    await sleep(1000);

    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await sleep(200);

    const reducedMotionStyles = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      const style = window.getComputedStyle(card);
      return {
        animationDuration: style.animationDuration,
        transitionDuration: style.transitionDuration,
      };
    })()`);
    console.log('  Reduced Motion Enforcement Telemetry:', reducedMotionStyles);

    // Reset emulation
    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [],
    });

    // --------------------------------------------------------------------------
    // TEST 7: MOBILE VIEWPORT & TOUCH TAP OUTSIDE (375px)
    // --------------------------------------------------------------------------
    console.log('\n[8] Testing Mobile (375px) Viewport, Trigger, & Tap Outside...');
    await setViewport(375, 667);
    await sleep(300);

    const mobileSearchBtn = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Universal Search"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (mobileSearchBtn) {
      await clickMouse(mobileSearchBtn.x, mobileSearchBtn.y);
      await sleep(350);
    }

    const mobileSearchOpen = await evalVal(`Boolean(document.querySelector('[data-testid="search-modal"]'))`);
    console.log('  Mobile search opened via mobile trigger:', mobileSearchOpen ? '✅ PASSED' : '❌ FAILED');
    await screenshot('step45b_search_mobile_375px.png');

    // Tap outside on mobile backdrop at bottom area (x: 180, y: 640)
    console.log('  Tapping outside on mobile backdrop (180, 640)...');
    await clickMouse(180, 640);
    await sleep(300);

    const mobileClosedAfterTap = await evalVal(`Boolean(document.querySelector('[data-testid="search-modal"]'))`);
    console.log('  Mobile search closed after tap outside:', mobileClosedAfterTap ? '❌ FAILED' : '✅ PASSED');

    // Reset desktop viewport
    await setViewport(1440, 900);
    await sleep(200);

    console.log('\n====================================================');
    console.log('🎉 ALL STEP 4.5B UX & MOTION CHECKS COMPLETED!');
    console.log('====================================================');
    edgeProc.kill();
    process.exit(0);
  } catch (err) {
    console.error('Audit failed with error:', err);
    edgeProc.kill();
    process.exit(1);
  }
}

runAudit();
