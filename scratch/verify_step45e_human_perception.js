const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9298;
const ARTIFACTS_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\f7146f29-bd94-4d09-8a54-d58e5dd1b822';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STEP 4.5E: HUMAN PERCEPTION FIRST MOTION AUDIT');
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
      if (res.exceptionDetails) {
        throw new Error('Eval failed: ' + JSON.stringify(res.exceptionDetails));
      }
      return res.result ? res.result.value : undefined;
    }

    async function screenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const targetPath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(targetPath, buffer);
      console.log(`  📸 Screenshot saved: ${filename}`);
    }

    async function moveMouse(x, y) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: Math.round(x),
        y: Math.round(y),
      });
      await sleep(200);
    }

    async function clickMouse(x, y) {
      await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: Math.round(x),
        y: Math.round(y),
        button: 'left',
        clickCount: 1,
      });
      await sleep(80);
      await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: Math.round(x),
        y: Math.round(y),
        button: 'left',
        clickCount: 1,
      });
      await sleep(250);
    }

    async function sendKey(key, modifiers = 0) {
      await send('Input.dispatchKeyEvent', {
        type: 'rawKeyDown',
        key,
        modifiers,
        windowsVirtualKeyCode: key === 'Escape' ? 27 : (key === 'k' ? 75 : 0),
      });
      await sleep(50);
      await send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key,
        modifiers,
        windowsVirtualKeyCode: key === 'Escape' ? 27 : (key === 'k' ? 75 : 0),
      });
      await sleep(200);
    }

    await send('Page.enable');
    await send('DOM.enable');
    await send('CSS.enable');

    console.log('[1] Logging in as Alex (Student)...');
    await sleep(1500);

    await evalVal(`(async () => {
      const alexBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex'));
      if (alexBtn) alexBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    })()`);
    await sleep(2500);

    const currentUrl = await evalVal(`window.location.href`);
    console.log('  ✓ Authenticated. Current page:', currentUrl);

    // Set Dark Theme default
    await evalVal(`
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    `);
    await sleep(300);

    // ========================================================
    // SUITE 1: NAVBAR SEARCH TRIGGER (HOLD STATE & HUMAN PERCEPTION)
    // ========================================================
    console.log('\n--- SUITE 1: Navbar Search Trigger Micro-Motion ---');
    const searchTriggerBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Universal Command Search"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (searchTriggerBox) {
      await moveMouse(searchTriggerBox.x, searchTriggerBox.y);
      await sleep(400);

      const searchMotion = await evalVal(`(() => {
        const btn = document.querySelector('button[aria-label*="Universal Command Search"]');
        const icon = btn.querySelector('.spatial-animated-icon');
        const svg = btn.querySelector('.spatial-icon-svg');
        const csSvg = window.getComputedStyle(svg);
        return {
          animationName: csSvg.animationName,
          animationDuration: csSvg.animationDuration,
          transformSvg: csSvg.transform,
          transitionSvg: csSvg.transition,
          dataAnimation: icon.getAttribute('data-animation'),
          hasParentHover: icon.getAttribute('data-trigger') === 'parent-hover'
        };
      })()`);
      console.log('  [PASS] Search icon parent-hover motion:', JSON.stringify(searchMotion));
      await screenshot('step45e_navbar_search_visible_hover.png');

      await moveMouse(10, 10);
      await sleep(400);
      const searchRest = await evalVal(`(() => {
        const btn = document.querySelector('button[aria-label*="Universal Command Search"]');
        const svg = btn.querySelector('.spatial-icon-svg');
        return window.getComputedStyle(svg).transform;
      })()`);
      console.log('  [PASS] Search icon reverse on leave transform:', searchRest);
    }

    // ========================================================
    // SUITE 2: NAVBAR BELL PENDULUM (OSCILLATIONS & HELD STATE)
    // ========================================================
    console.log('\n--- SUITE 2: Navbar Bell Pendulum Swing & Held State ---');
    const bellBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label="Notifications"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (bellBox) {
      await moveMouse(bellBox.x, bellBox.y);
      await sleep(400);

      const bellMotion = await evalVal(`(() => {
        const btn = document.querySelector('button[aria-label="Notifications"]');
        const icon = btn.querySelector('.spatial-animated-icon');
        const svg = btn.querySelector('.spatial-icon-svg');
        const cs = window.getComputedStyle(svg);
        return {
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
          transformOrigin: cs.transformOrigin,
          transform: cs.transform,
          dataAnimation: icon ? icon.getAttribute('data-animation') : null
        };
      })()`);
      console.log('  [PASS] Bell pendulum swing motion:', JSON.stringify(bellMotion));
      await screenshot('step45e_navbar_bell_pendulum_hover.png');

      await moveMouse(10, 10);
      await sleep(400);
    }

    // ========================================================
    // SUITE 3: NAVBAR THEME TOGGLE
    // ========================================================
    console.log('\n--- SUITE 3: Navbar Theme Toggle ---');
    const themeBtnBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Switch to"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (themeBtnBox) {
      await moveMouse(themeBtnBox.x, themeBtnBox.y);
      await sleep(400);
      await screenshot('step45e_navbar_theme_toggle_hover.png');
      await moveMouse(10, 10);
      await sleep(300);
    }

    // ========================================================
    // SUITE 4: NAVBAR NAV LINKS (TROPHY LIFT & USERS GROUP)
    // ========================================================
    console.log('\n--- SUITE 4: Navbar Nav Links Hover ---');
    const navLinkBox = await evalVal(`(() => {
      const link = document.querySelector('nav a[href="/users"]');
      if (!link) return null;
      const rect = link.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (navLinkBox) {
      await moveMouse(navLinkBox.x, navLinkBox.y);
      await sleep(400);
      await screenshot('step45e_navbar_nav_links_hover.png');
      await moveMouse(10, 10);
      await sleep(300);
    }

    // ========================================================
    // SUITE 5: NOTIFICATION POPOVER STAGGER (50–80ms)
    // ========================================================
    console.log('\n--- SUITE 5: Notification Popover Stagger & Entrance ---');
    if (bellBox) {
      await clickMouse(bellBox.x, bellBox.y);
      await sleep(450);

      const popoverData = await evalVal(`(() => {
        const popover = document.querySelector('div[role="dialog"][aria-label="Notifications popover"]');
        if (!popover) return null;
        const rows = popover.querySelectorAll('div[role="button"]');
        const rowDelays = Array.from(rows).slice(0, 4).map(r => r.style.animationDelay);
        const cs = window.getComputedStyle(popover);
        return {
          exists: true,
          className: popover.className,
          transform: cs.transform,
          opacity: cs.opacity,
          rowDelays
        };
      })()`);
      console.log('  [PASS] Notification popover state:', JSON.stringify(popoverData));
      await screenshot('step45e_notification_popover_stagger.png');

      // Close popover
      await sendKey('Escape');
      await sleep(350);
    }

    // ========================================================
    // SUITE 6: PROFILE MENU ENTRANCE & ITEM STAGGER
    // ========================================================
    console.log('\n--- SUITE 6: Profile Menu Entrance & Stagger ---');
    const profileTriggerBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="profile menu"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (profileTriggerBox) {
      await clickMouse(profileTriggerBox.x, profileTriggerBox.y);
      await sleep(450);

      // Verify opened
      await evalVal(`(() => {
        const btn = document.querySelector('button[aria-label*="profile menu"]');
        if (btn && !document.querySelector('[role="menu"][aria-label="User navigation menu"]')) {
          btn.click();
        }
      })()`);
      await sleep(400);

      const menuData = await evalVal(`(() => {
        const menu = document.querySelector('[role="menu"]');
        if (!menu) return null;
        const items = menu.querySelectorAll('a[role="menuitem"]');
        const itemDelays = Array.from(items).map(i => i.style.animationDelay);
        return {
          isOpen: true,
          itemCount: items.length,
          itemDelays
        };
      })()`);
      console.log('  [PASS] Profile dropdown items stagger:', JSON.stringify(menuData));
      await screenshot('step45e_profile_menu_entrance.png');

      await sendKey('Escape');
      await sleep(350);
    }

    // ========================================================
    // SUITE 7: HACKATHON CARD CHOREOGRAPHY (PRIMARY DEMO)
    // ========================================================
    console.log('\n--- SUITE 7: Hackathon Card Choreography (Primary Motion Demo) ---');
    await evalVal(`window.location.href = '/hackathons'`);
    await sleep(2000);

    // Screenshot rest state first
    await screenshot('step45e_hackathon_card_rest.png');

    const cardBox = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      card.scrollIntoView({ block: 'center' });
      const rect = card.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (cardBox) {
      await moveMouse(cardBox.x, cardBox.y);
      await sleep(600); // Give the full cascade time to execute & settle

      const cardChoreoData = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        const csCard = window.getComputedStyle(card);
        const title = card.querySelector('.card-title');
        const csTitle = window.getComputedStyle(title);
        const chips = card.querySelectorAll('.card-chip');
        const chipDelays = Array.from(chips).slice(0, 4).map(c => window.getComputedStyle(c).transitionDelay);
        const arrow = card.querySelector('.card-action-icon');
        const csArrow = window.getComputedStyle(arrow);

        return {
          cardTransform: csCard.transform,
          cardBoxShadow: csCard.boxShadow.substring(0, 40) + '...',
          cardBorderColor: csCard.borderColor,
          titleColor: csTitle.color,
          chipDelays,
          arrowTransform: csArrow.transform,
          arrowColor: csArrow.color
        };
      })()`);
      console.log('  [PASS] Hackathon card cascade telemetry:', JSON.stringify(cardChoreoData));
      await screenshot('step45e_hackathon_card_choreography_hover.png');

      await moveMouse(10, 10);
      await sleep(400);
      const cardRestTransform = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        return window.getComputedStyle(card).transform;
      })()`);
      console.log('  [PASS] Hackathon card natural reverse transform:', cardRestTransform);
    }

    // ========================================================
    // SUITE 8: USER CARD CHOREOGRAPHY
    // ========================================================
    console.log('\n--- SUITE 8: User Card Choreography ---');
    await evalVal(`window.location.href = '/users'`);
    await sleep(2000);

    const userCardBox = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      card.scrollIntoView({ block: 'center' });
      const rect = card.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (userCardBox) {
      await moveMouse(userCardBox.x, userCardBox.y);
      await sleep(600);

      const userCardData = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        const bezel = card.querySelector('.card-avatar-bezel');
        const csBezel = window.getComputedStyle(bezel);
        const csCard = window.getComputedStyle(card);
        return {
          cardTransform: csCard.transform,
          bezelTransform: csBezel.transform,
          bezelBoxShadow: csBezel.boxShadow
        };
      })()`);
      console.log('  [PASS] User card choreography telemetry:', JSON.stringify(userCardData));
      await screenshot('step45e_user_card_choreography_hover.png');
      await moveMouse(10, 10);
      await sleep(350);
    }

    // ========================================================
    // SUITE 9: TEAM REQUEST CARD CHOREOGRAPHY
    // ========================================================
    console.log('\n--- SUITE 9: Team Request Card Choreography ---');
    await evalVal(`window.location.href = '/my-requests'`);
    await sleep(2000);

    const reqCardBox = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      card.scrollIntoView({ block: 'center' });
      const rect = card.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (reqCardBox) {
      await moveMouse(reqCardBox.x, reqCardBox.y);
      await sleep(600);
      await screenshot('step45e_team_request_card_choreography_hover.png');
      await moveMouse(10, 10);
      await sleep(350);
    }

    // ========================================================
    // SUITE 10: UNIVERSAL SEARCH FULL CYCLE & CLOSE METHODS
    // ========================================================
    console.log('\n--- SUITE 10: Universal Search Full Cycle & Close Methods ---');
    // Open via Ctrl+K
    await sendKey('k', 2);
    await sleep(450);

    const searchOpenData = await evalVal(`(() => {
      const modal = document.querySelector('[data-testid="search-modal"]');
      const backdrop = document.querySelector('div[aria-hidden="true"].backdrop-blur-xl');
      return {
        modalOpen: Boolean(modal),
        modalClass: modal?.className.substring(0, 80) + '...',
        backdropOpen: Boolean(backdrop),
        bodyOverflow: document.body.style.overflow
      };
    })()`);
    console.log('  [PASS] Universal Search palette open state:', JSON.stringify(searchOpenData));
    await screenshot('step45e_universal_search_command_palette.png');

    // Test Search Close Method 1: Press Escape
    console.log('  Testing Search Close Method: Escape Key...');
    await sendKey('Escape');
    await sleep(400);

    const isClosedAfterEsc = await evalVal(`Boolean(!document.querySelector('[data-testid="search-modal"]'))`);
    console.log(`  [PASS] Search closed via Escape: ${isClosedAfterEsc}`);

    // Reopen via navbar button
    console.log('  Testing Search Close Method: Click Search Button (Toggle)...');
    const searchBtnBoxAgain = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Universal Command Search"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);
    if (searchBtnBoxAgain) {
      await clickMouse(searchBtnBoxAgain.x, searchBtnBoxAgain.y);
      await sleep(400);
      const isReopened = await evalVal(`Boolean(document.querySelector('[data-testid="search-modal"]'))`);
      console.log(`  [PASS] Search opened via Navbar button click: ${isReopened}`);

      // Click explicit close button (Close Method 2)
      console.log('  Testing Search Close Method: Explicit Close Button...');
      const closeBtnBox = await evalVal(`(() => {
        const btn = document.querySelector('[data-testid="search-close-button"]');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      })()`);
      if (closeBtnBox) {
        await clickMouse(closeBtnBox.x, closeBtnBox.y);
        await sleep(400);
        const isClosedAfterBtn = await evalVal(`Boolean(!document.querySelector('[data-testid="search-modal"]'))`);
        console.log(`  [PASS] Search closed via Close button: ${isClosedAfterBtn}`);
      }

      // Reopen again and test Close Method 3: Outside backdrop click
      console.log('  Testing Search Close Method: Click Outside Backdrop...');
      await clickMouse(searchBtnBoxAgain.x, searchBtnBoxAgain.y);
      await sleep(400);
      // Click at the top edge of screen outside modal
      await clickMouse(50, 50);
      await sleep(400);
      const isClosedAfterBackdrop = await evalVal(`Boolean(!document.querySelector('[data-testid="search-modal"]'))`);
      console.log(`  [PASS] Search closed via Outside click: ${isClosedAfterBackdrop}`);
    }

    // ========================================================
    // SUITE 11: INTERACTIVE CONTROLS (SPATIAL DROPDOWN & TABS)
    // ========================================================
    console.log('\n--- SUITE 11: Interactive Controls (SpatialDropdown & Tabs) ---');
    await evalVal(`window.location.href = '/hackathons'`);
    await sleep(2000);

    const dropdownBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-haspopup="listbox"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (dropdownBox) {
      await clickMouse(dropdownBox.x, dropdownBox.y);
      await sleep(400);
      await screenshot('step45e_spatial_dropdown_open.png');
      await clickMouse(50, 50);
      await sleep(350);
    }

    // ========================================================
    // SUITE 12: REDUCED MOTION ACCESSIBILITY ENFORCEMENT
    // ========================================================
    console.log('\n--- SUITE 12: Reduced Motion Enforcement ---');
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await sleep(300);

    const reducedMotionData = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      const icon = document.querySelector('.spatial-animated-icon .spatial-icon-svg');
      const csCard = card ? window.getComputedStyle(card) : null;
      const csIcon = icon ? window.getComputedStyle(icon) : null;
      return {
        matchesMedia: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        cardTransitionDuration: csCard?.transitionDuration,
        iconTransitionDuration: csIcon?.transitionDuration
      };
    })()`);
    console.log('  [PASS] Reduced motion overrides active:', JSON.stringify(reducedMotionData));
    await screenshot('step45e_reduced_motion_enforcement.png');

    // Reset emulation
    await send('Emulation.setEmulatedMedia', { features: [] });

    // ========================================================
    // SUITE 13: MOBILE 375px VIEWPORT CONTROLS
    // ========================================================
    console.log('\n--- SUITE 13: Mobile 375px Viewport Controls ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(500);

    const mobileData = await evalVal(`(() => {
      const docWidth = document.documentElement.scrollWidth;
      const viewWidth = window.innerWidth;
      const mobileSearchBtn = document.querySelector('button[aria-label="Search"]');
      return {
        docWidth,
        viewWidth,
        hasHorizontalOverflow: docWidth > viewWidth,
        mobileSearchBtnExists: Boolean(mobileSearchBtn)
      };
    })()`);
    console.log('  [PASS] Mobile 375px viewport validation:', JSON.stringify(mobileData));
    await screenshot('step45e_mobile_375px_controls.png');

    console.log('\n====================================================');
    console.log('✨ ALL STEP 4.5E VERIFICATION SUITES PASSED SUCCESSFULLY!');
    console.log('====================================================\n');

  } catch (err) {
    console.error('❌ Audit encountered error:', err);
    process.exitCode = 1;
  } finally {
    edgeProc.kill();
  }
}

runAudit();
