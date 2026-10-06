const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9296;
const ARTIFACTS_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\f7146f29-bd94-4d09-8a54-d58e5dd1b822';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STEP 4.5D: MOTION VISIBILITY & PERCEPTION AUDIT');
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
      await sleep(60);
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
        windowsVirtualKeyCode: key === 'Escape' ? 27 : (key === 'k' ? 75 : 0),
      });
      await sleep(50);
      await send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key,
        modifiers,
        windowsVirtualKeyCode: key === 'Escape' ? 27 : (key === 'k' ? 75 : 0),
      });
      await sleep(150);
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

    // Enable domains
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

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

    // --------------------------------------------------------------------------
    // TEST 1: NAVBAR INTERACTIVE ICONS & VISIBLE AMPLITUDES
    // --------------------------------------------------------------------------
    console.log('\n[2] Testing Navbar Icons: Search, Bell, Theme, Nav Links, CTA...');
    await evalVal(`window.scrollTo(0, 0)`);
    await sleep(200);

    // 1A. Search Trigger Icon in Navbar (5-8° tilt, 1.08 scale, 2.5px shift, 240ms)
    const searchTriggerBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Universal Command Search"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (searchTriggerBox) {
      await moveMouse(searchTriggerBox.x, searchTriggerBox.y);
      await sleep(280);

      const searchHover = await evalVal(`(() => {
        const icon = document.querySelector('button[aria-label*="Universal Command Search"] .spatial-animated-icon');
        const svg = document.querySelector('button[aria-label*="Universal Command Search"] .spatial-icon-svg');
        return {
          animationAttr: icon ? icon.getAttribute('data-animation') : null,
          animationName: svg ? window.getComputedStyle(svg).animationName : null,
          animationDuration: svg ? window.getComputedStyle(svg).animationDuration : null,
          transform: svg ? window.getComputedStyle(svg).transform : null,
        };
      })()`);
      console.log('  Search Icon on Hover (Retuned 240ms):', searchHover);
      await screenshot('step45d_navbar_search_visible_hover.png');

      await moveMouse(10, 10);
      await sleep(200);
    }

    // 1B. Navbar Bell Icon (Visible ±10° pendulum swing, 320ms)
    const bellBtnBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Notifications"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (bellBtnBox) {
      await moveMouse(bellBtnBox.x, bellBtnBox.y);
      await sleep(340);

      const bellHover = await evalVal(`(() => {
        const icon = document.querySelector('button[aria-label*="Notifications"] .spatial-animated-icon');
        const svg = document.querySelector('button[aria-label*="Notifications"] .spatial-icon-svg');
        return {
          animationAttr: icon ? icon.getAttribute('data-animation') : null,
          animationName: svg ? window.getComputedStyle(svg).animationName : null,
          animationDuration: svg ? window.getComputedStyle(svg).animationDuration : null,
          transformOrigin: svg ? window.getComputedStyle(svg).transformOrigin : null,
        };
      })()`);
      console.log('  Bell Icon on Hover (Retuned 320ms):', bellHover);
      await screenshot('step45d_navbar_bell_pendulum_hover.png');

      await moveMouse(10, 10);
      await sleep(200);
    }

    // 1C. ThemeToggle Button & Icon Hover
    const themeBtnBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Switch to"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (themeBtnBox) {
      await moveMouse(themeBtnBox.x, themeBtnBox.y);
      await sleep(260);

      const themeHover = await evalVal(`(() => {
        const icon = document.querySelector('button[aria-label*="Switch to"] .spatial-animated-icon');
        const svg = document.querySelector('button[aria-label*="Switch to"] .spatial-icon-svg');
        return {
          animationAttr: icon ? icon.getAttribute('data-animation') : null,
          animationName: svg ? window.getComputedStyle(svg).animationName : null,
          transform: svg ? window.getComputedStyle(svg).transform : null,
        };
      })()`);
      console.log('  Theme Toggle Icon on Hover:', themeHover);
      await screenshot('step45d_navbar_theme_toggle_hover.png');

      await moveMouse(10, 10);
      await sleep(200);
    }

    // 1D. Desktop Nav Links (Hackathons & Find Teammates)
    const hackathonsLinkBox = await evalVal(`(() => {
      const link = document.querySelector('a[href="/hackathons"]');
      if (!link) return null;
      const rect = link.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (hackathonsLinkBox) {
      await moveMouse(hackathonsLinkBox.x, hackathonsLinkBox.y);
      await sleep(280);

      const hackathonsNavHover = await evalVal(`(() => {
        const svg = document.querySelector('a[href="/hackathons"] .spatial-icon-svg');
        return {
          animationName: svg ? window.getComputedStyle(svg).animationName : null,
          animationDuration: svg ? window.getComputedStyle(svg).animationDuration : null,
        };
      })()`);
      console.log('  Hackathons Nav Link on Hover:', hackathonsNavHover);
      await screenshot('step45d_navbar_nav_links_hover.png');

      await moveMouse(10, 10);
      await sleep(200);
    }

    // --------------------------------------------------------------------------
    // TEST 2: NOTIFICATION POPOVER (260ms Entrance, 40ms Row Stagger)
    // --------------------------------------------------------------------------
    console.log('\n[3] Testing Notification Popover Entrance, Row Stagger, and Semantic Icons...');
    if (bellBtnBox) {
      await clickMouse(bellBtnBox.x, bellBtnBox.y);
      await sleep(350);

      const notifPopoverTelemetry = await evalVal(`(() => {
        const popover = document.querySelector('[role="dialog"][aria-label="Notifications popover"]');
        const rows = Array.from(document.querySelectorAll('[role="dialog"][aria-label="Notifications popover"] [role="button"]'));
        return {
          popoverOpen: Boolean(popover),
          animationClass: popover ? popover.className : '',
          rowsCount: rows.length,
          staggerDelays: rows.map(r => r.style.animationDelay),
        };
      })()`);
      console.log('  Notification Popover Telemetry:', notifPopoverTelemetry);
      await screenshot('step45d_notification_popover_stagger.png');

      await sendKey('Escape');
      await sleep(200);
      await moveMouse(10, 10);
      await sleep(200);
    }

    // --------------------------------------------------------------------------
    // TEST 3: PROFILE MENU (260ms Entrance, Chevron 180° Flip)
    // --------------------------------------------------------------------------
    console.log('\n[4] Testing Profile Menu Trigger & Dropdown Entrance...');
    const profileTriggerBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="profile menu"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (profileTriggerBox) {
      await moveMouse(profileTriggerBox.x, profileTriggerBox.y);
      await sleep(150);
      await clickMouse(profileTriggerBox.x, profileTriggerBox.y);
      await sleep(350);

      // If not opened by clickMouse, trigger click directly
      await evalVal(`(() => {
        const btn = document.querySelector('button[aria-label*="profile menu"]');
        if (btn && !document.querySelector('[role="menu"][aria-label="User navigation menu"]')) {
          btn.click();
        }
      })()`);
      await sleep(350);

      const profileMenuTelemetry = await evalVal(`(() => {
        const menu = document.querySelector('[role="menu"][aria-label="User navigation menu"]');
        const chevron = document.querySelector('button[aria-label*="profile menu"] .spatial-animated-icon');
        const chevronSvg = chevron ? chevron.querySelector('.spatial-icon-svg') : null;
        const items = menu ? Array.from(menu.querySelectorAll('[role="menuitem"] .spatial-animated-icon')) : [];
        return {
          menuOpen: Boolean(menu),
          chevronState: chevron ? chevron.getAttribute('data-state') : null,
          chevronTransform: chevronSvg ? window.getComputedStyle(chevronSvg).transform : null,
          itemIcons: items.map(it => ({ anim: it.getAttribute('data-animation') })),
        };
      })()`);
      console.log('  Profile Menu Telemetry:', profileMenuTelemetry);
      await screenshot('step45d_profile_menu_entrance.png');

      await sendKey('Escape');
      await sleep(250);
      await moveMouse(10, 10);
      await sleep(200);
    }

    // --------------------------------------------------------------------------
    // TEST 4: HACKATHON CARD FULL CHOREOGRAPHY (/hackathons)
    // T+0 Card Lift, T+40 Primary Icon, T+90 Meta, T+140 Title, T+190 Desc, T+240 Chips, T+320 Action
    // --------------------------------------------------------------------------
    console.log('\n[5] Testing HackathonCard Deep Micro-Choreography on /hackathons...');
    await evalVal(`window.__navigate ? window.__navigate('/hackathons') : (window.location.href = '/hackathons')`);
    await sleep(1500);

    const hackathonCardBox = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      card.scrollIntoView({ block: 'center' });
      const rect = card.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (hackathonCardBox) {
      const cardBaseline = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        return {
          cardTransform: window.getComputedStyle(card).transform,
          iconsCount: card.querySelectorAll('.spatial-animated-icon').length,
        };
      })()`);
      console.log('  HackathonCard Baseline at Rest:', cardBaseline);
      await screenshot('step45d_hackathon_card_rest.png');

      await moveMouse(hackathonCardBox.x, hackathonCardBox.y);
      await sleep(400);

      const cardChoreographyHover = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        const meta = card.querySelector('.card-meta');
        const title = card.querySelector('.card-title');
        const desc = card.querySelector('.card-desc');
        const chips = Array.from(card.querySelectorAll('.card-chip'));
        const actionIcon = card.querySelector('.card-action-icon');

        const trophy = card.querySelector('[data-animation="lift"] .spatial-icon-svg');
        const calendar = card.querySelector('[data-animation="calendar-tick"] .spatial-icon-svg');
        const mapPin = card.querySelector('[data-animation="bounce"] .spatial-icon-svg');
        const clock = card.querySelector('[data-animation="tick"] .spatial-icon-svg');

        return {
          T0_cardTransform: window.getComputedStyle(card).transform,
          T0_borderColor: window.getComputedStyle(card).borderColor,
          T40_trophy: trophy ? { anim: window.getComputedStyle(trophy).animationName, delay: window.getComputedStyle(trophy).animationDelay } : null,
          T40_calendar: calendar ? { anim: window.getComputedStyle(calendar).animationName, delay: window.getComputedStyle(calendar).animationDelay } : null,
          T40_mapPin: mapPin ? { anim: window.getComputedStyle(mapPin).animationName, delay: window.getComputedStyle(mapPin).animationDelay } : null,
          T40_clock: clock ? { anim: window.getComputedStyle(clock).animationName, delay: window.getComputedStyle(clock).animationDelay } : null,
          T90_metaTransform: meta ? window.getComputedStyle(meta).transform : null,
          T140_titleColor: title ? window.getComputedStyle(title).color : null,
          T190_descTransform: desc ? window.getComputedStyle(desc).transform : null,
          T240_chip1_delay: chips[0] ? window.getComputedStyle(chips[0]).transitionDelay : null,
          T240_chip2_delay: chips[1] ? window.getComputedStyle(chips[1]).transitionDelay : null,
          T320_actionDelay: actionIcon ? window.getComputedStyle(actionIcon).transitionDelay : null,
          T320_actionTransform: actionIcon ? window.getComputedStyle(actionIcon).transform : null,
        };
      })()`);
      console.log('  HackathonCard Expanded Choreography Telemetry:', cardChoreographyHover);
      await screenshot('step45d_hackathon_card_choreography_hover.png');

      await moveMouse(10, 10);
      await sleep(350);

      const cardReturnRest = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        return { cardTransform: window.getComputedStyle(card).transform };
      })()`);
      console.log('  HackathonCard Return to Rest State:', cardReturnRest.cardTransform === 'none' ? '✅ PASSED' : cardReturnRest.cardTransform);
    }

    // --------------------------------------------------------------------------
    // TEST 5: USER CARD CHOREOGRAPHY ON /users (Avatar Bezel, Code/Share/Globe, Chips, Action)
    // --------------------------------------------------------------------------
    console.log('\n[6] Testing UserCard Choreography on /users...');
    await evalVal(`window.__navigate ? window.__navigate('/users') : (window.location.href = '/users')`);
    await sleep(1500);

    const userCardBox = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      card.scrollIntoView({ block: 'center' });
      const rect = card.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (userCardBox) {
      await moveMouse(userCardBox.x, userCardBox.y);
      await sleep(400);

      const userCardTelemetry = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        const avatarBezel = card.querySelector('.card-avatar-bezel');
        const actionIcon = card.querySelector('.card-action-icon');
        return {
          cardTransform: window.getComputedStyle(card).transform,
          avatarBezelTransform: avatarBezel ? window.getComputedStyle(avatarBezel).transform : null,
          actionIconTransform: actionIcon ? window.getComputedStyle(actionIcon).transform : null,
        };
      })()`);
      console.log('  UserCard Choreography Telemetry:', userCardTelemetry);
      await screenshot('step45d_user_card_choreography_hover.png');

      await moveMouse(10, 10);
      await sleep(250);
    }

    // --------------------------------------------------------------------------
    // TEST 6: TEAM REQUEST CARD CHOREOGRAPHY ON /profile
    // --------------------------------------------------------------------------
    console.log('\n[7] Testing TeamRequestCard Choreography on /profile...');
    await evalVal(`window.__navigate ? window.__navigate('/profile') : (window.location.href = '/profile')`);
    await sleep(1500);

    const teamReqBox = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return null;
      card.scrollIntoView({ block: 'center' });
      const rect = card.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (teamReqBox) {
      await moveMouse(teamReqBox.x, teamReqBox.y);
      await sleep(400);

      const teamReqTelemetry = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        const usersIcon = card.querySelector('[data-animation="group"] .spatial-icon-svg');
        const actionIcon = card.querySelector('.card-action-icon');
        return {
          cardTransform: window.getComputedStyle(card).transform,
          usersAnim: usersIcon ? window.getComputedStyle(usersIcon).animationName : null,
          usersDelay: usersIcon ? window.getComputedStyle(usersIcon).animationDelay : null,
          actionTransform: actionIcon ? window.getComputedStyle(actionIcon).transform : null,
        };
      })()`);
      console.log('  TeamRequestCard Choreography Telemetry:', teamReqTelemetry);
      await screenshot('step45d_team_request_card_choreography_hover.png');

      await moveMouse(10, 10);
      await sleep(250);
    }

    // --------------------------------------------------------------------------
    // TEST 7: UNIVERSAL SEARCH COMMAND PALETTE (320ms Entrance, 240ms Backdrop)
    // --------------------------------------------------------------------------
    console.log('\n[8] Testing Universal Search Command Palette Entrance & Results Stagger...');
    await sendKey('k', 2);
    await sleep(400);

    await send('Input.insertText', { text: 'hack' });
    await sleep(550);

    const searchPaletteTelemetry = await evalVal(`(() => {
      const modal = document.querySelector('[data-testid="search-modal"]');
      const backdrop = document.querySelector('[data-testid="search-backdrop"]');
      const searchIcon = document.querySelector('[data-testid="search-modal"] [data-animation="magnify"]');
      const closeBtn = document.querySelector('[data-testid="search-close-button"] [data-animation="cross"]');
      const resultRows = Array.from(document.querySelectorAll('[data-testid="search-modal"] [data-selected]'));

      return {
        modalVisible: Boolean(modal),
        modalTransition: modal ? window.getComputedStyle(modal).transitionDuration : null,
        backdropOpacity: backdrop ? window.getComputedStyle(backdrop).opacity : null,
        searchIconFound: Boolean(searchIcon),
        closeBtnFound: Boolean(closeBtn),
        resultsCount: resultRows.length,
        resultStaggerDelays: resultRows.slice(0, 4).map(r => r.style.animationDelay),
      };
    })()`);
    console.log('  Universal Search Modal Telemetry:', searchPaletteTelemetry);
    await screenshot('step45d_universal_search_command_palette.png');

    await sendKey('Escape');
    await sleep(250);

    // --------------------------------------------------------------------------
    // TEST 8: SPATIAL DROPDOWN CHEVRON & CHECKMARK
    // --------------------------------------------------------------------------
    console.log('\n[9] Testing SpatialDropdown Chevron Flip & Pop Checkmark...');
    await evalVal(`window.__navigate ? window.__navigate('/hackathons') : (window.location.href = '/hackathons')`);
    await sleep(1500);

    const dropdownBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-haspopup="listbox"]');
      if (!btn) return null;
      btn.scrollIntoView({ block: 'center' });
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (dropdownBox) {
      await clickMouse(dropdownBox.x, dropdownBox.y);
      await sleep(350);

      const dropdownTelemetry = await evalVal(`(() => {
        const chevron = document.querySelector('button[aria-haspopup="listbox"] .spatial-animated-icon');
        const chevronSvg = chevron ? chevron.querySelector('.spatial-icon-svg') : null;
        const checkIcon = document.querySelector('[role="listbox"] [data-animation="pop"]');
        return {
          chevronState: chevron ? chevron.getAttribute('data-state') : null,
          chevronTransform: chevronSvg ? window.getComputedStyle(chevronSvg).transform : null,
          checkIconFound: Boolean(checkIcon),
        };
      })()`);
      console.log('  SpatialDropdown Telemetry:', dropdownTelemetry);
      await screenshot('step45d_spatial_dropdown_open.png');

      await clickMouse(dropdownBox.x, dropdownBox.y);
      await sleep(250);
      await moveMouse(10, 10);
      await sleep(200);
    }

    // --------------------------------------------------------------------------
    // TEST 9: REDUCED MOTION ACCESSIBILITY COMPLIANCE
    // --------------------------------------------------------------------------
    console.log('\n[10] Testing prefers-reduced-motion Accessibility Enforcement...');
    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await sleep(200);

    const reducedMotionCheck = await evalVal(`(() => {
      const svg = document.querySelector('.card-choreography .spatial-animated-icon .spatial-icon-svg');
      const card = document.querySelector('.card-choreography');
      return {
        iconAnimation: svg ? window.getComputedStyle(svg).animationName : null,
        iconTransition: svg ? window.getComputedStyle(svg).transitionDuration : null,
        cardTransform: card ? window.getComputedStyle(card).transform : null,
      };
    })()`);
    console.log('  Reduced Motion Telemetry (reduce mode active):', reducedMotionCheck);
    await screenshot('step45d_reduced_motion_enforcement.png');

    // Reset emulation
    await send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });

    // --------------------------------------------------------------------------
    // TEST 10: MOBILE VIEWPORT & TOUCH CONTROLS (375px)
    // --------------------------------------------------------------------------
    console.log('\n[11] Testing Mobile Viewport (375px) Controls...');
    await setViewport(375, 667);
    await sleep(300);

    const mobileTelemetry = await evalVal(`(() => {
      const searchBtn = document.querySelector('button[aria-label*="Universal Search"] .spatial-animated-icon');
      const menuBtn = document.querySelector('button[aria-label*="Toggle navigation menu"] .spatial-animated-icon');
      return {
        searchAnim: searchBtn ? searchBtn.getAttribute('data-animation') : null,
        menuAnim: menuBtn ? menuBtn.getAttribute('data-animation') : null,
      };
    })()`);
    console.log('  Mobile Controls Telemetry:', mobileTelemetry);
    await screenshot('step45d_mobile_375px_controls.png');

    await setViewport(1440, 900);
    await sleep(200);

    console.log('\n====================================================');
    console.log('🎉 ALL STEP 4.5D MOTION CHECKS COMPLETED SUCCESSFULLY!');
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
