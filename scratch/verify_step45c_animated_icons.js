const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9295;
const ARTIFACTS_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\f7146f29-bd94-4d09-8a54-d58e5dd1b822';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STEP 4.5C: ANIMATED ICON SYSTEM & DEEP POLISH QA');
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
        windowsVirtualKeyCode: key === 'Escape' ? 27 : 0,
      });
      await sleep(50);
      await send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key,
        modifiers,
        windowsVirtualKeyCode: key === 'Escape' ? 27 : 0,
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
    // TEST 1: NAVBAR INTERACTION ICONS (SEARCH, POST REQUEST, BELL, PROFILE CHEVRON)
    // --------------------------------------------------------------------------
    console.log('\n[2] Testing Navbar Icons: Search, Post Request, Bell, Profile Trigger...');
    await evalVal(`window.scrollTo(0, 0)`);
    await sleep(200);

    // 1A. Search Trigger Icon in Navbar
    const searchTriggerBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Universal Command Search"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (searchTriggerBox) {
      const searchBaseline = await evalVal(`(() => {
        const svg = document.querySelector('button[aria-label*="Universal Command Search"] .spatial-icon-svg');
        return svg ? { transform: window.getComputedStyle(svg).transform } : null;
      })()`);
      console.log('  Search Icon Baseline:', searchBaseline);

      await moveMouse(searchTriggerBox.x, searchTriggerBox.y);
      await sleep(250);

      const searchHover = await evalVal(`(() => {
        const icon = document.querySelector('button[aria-label*="Universal Command Search"] .spatial-animated-icon');
        const svg = document.querySelector('button[aria-label*="Universal Command Search"] .spatial-icon-svg');
        return {
          animationAttr: icon ? icon.getAttribute('data-animation') : null,
          triggerAttr: icon ? icon.getAttribute('data-trigger') : null,
          animationName: svg ? window.getComputedStyle(svg).animationName : null,
          transform: svg ? window.getComputedStyle(svg).transform : null,
        };
      })()`);
      console.log('  Search Icon on Hover:', searchHover);
      await screenshot('step45c_navbar_search_icon_hover.png');

      await moveMouse(10, 10);
      await sleep(200);
    }

    // 1B. Post Team Request CTA Button (PlusCircle icon)
    const postReqBtnBox = await evalVal(`(() => {
      const btn = document.querySelector('a[href="/post-request"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (postReqBtnBox) {
      await moveMouse(postReqBtnBox.x, postReqBtnBox.y);
      await sleep(250);

      const postReqHover = await evalVal(`(() => {
        const icon = document.querySelector('a[href="/post-request"] .spatial-animated-icon');
        const svg = document.querySelector('a[href="/post-request"] .spatial-icon-svg');
        return {
          animationAttr: icon ? icon.getAttribute('data-animation') : null,
          animationName: svg ? window.getComputedStyle(svg).animationName : null,
          transform: svg ? window.getComputedStyle(svg).transform : null,
        };
      })()`);
      console.log('  Post Team Request Button Icon on Hover:', postReqHover);
      await screenshot('step45c_navbar_post_request_icon_hover.png');

      await moveMouse(10, 10);
      await sleep(200);
    }

    // 1C. Notification Bell Icon in Navbar
    const bellBtnBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Notifications"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (bellBtnBox) {
      await moveMouse(bellBtnBox.x, bellBtnBox.y);
      await sleep(280);

      const bellHover = await evalVal(`(() => {
        const icon = document.querySelector('button[aria-label*="Notifications"] .spatial-animated-icon');
        const svg = document.querySelector('button[aria-label*="Notifications"] .spatial-icon-svg');
        return {
          animationAttr: icon ? icon.getAttribute('data-animation') : null,
          animationName: svg ? window.getComputedStyle(svg).animationName : null,
          transformOrigin: svg ? window.getComputedStyle(svg).transformOrigin : null,
        };
      })()`);
      console.log('  Bell Icon on Hover:', bellHover);
      await screenshot('step45c_navbar_bell_icon_hover.png');

      // Click to open popover and test notification item icons
      await clickMouse(bellBtnBox.x, bellBtnBox.y);
      await sleep(350);

      const notifPopoverIcons = await evalVal(`(() => {
        const icons = Array.from(document.querySelectorAll('[role="dialog"][aria-label="Notifications popover"] .spatial-animated-icon'));
        return icons.map((ic) => ({
          anim: ic.getAttribute('data-animation'),
          trigger: ic.getAttribute('data-trigger'),
        }));
      })()`);
      console.log('  Notification Popover Item Icons:', notifPopoverIcons);
      await screenshot('step45c_notification_popover_animated_icons.png');

      await sendKey('Escape');
      await sleep(200);
      await moveMouse(10, 10);
      await sleep(200);
    }

    // 1D. Profile Menu Trigger & Chevron Rotation
    const profileTriggerBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="profile menu"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (profileTriggerBox) {
      await moveMouse(profileTriggerBox.x, profileTriggerBox.y);
      await sleep(200);

      await clickMouse(profileTriggerBox.x, profileTriggerBox.y);
      await sleep(300);

      const profileChevronOpen = await evalVal(`(() => {
        const icon = document.querySelector('button[aria-label*="profile menu"] .spatial-animated-icon');
        const svg = document.querySelector('button[aria-label*="profile menu"] .spatial-icon-svg');
        return {
          state: icon ? icon.getAttribute('data-state') : null,
          transform: svg ? window.getComputedStyle(svg).transform : null,
        };
      })()`);
      console.log('  Profile Trigger Chevron (Open State):', profileChevronOpen);
      await screenshot('step45c_profile_menu_chevron_open.png');

      await clickMouse(profileTriggerBox.x, profileTriggerBox.y);
      await sleep(250);
      await moveMouse(10, 10);
      await sleep(200);
    }

    // --------------------------------------------------------------------------
    // TEST 2: HACKATHON CARD INTERNAL ICON CHOREOGRAPHY (/hackathons)
    // --------------------------------------------------------------------------
    console.log('\n[3] Testing HackathonCard Deep Icon Choreography on /hackathons...');
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
      console.log('  HackathonCard Baseline:', cardBaseline);
      await screenshot('step45c_hackathon_card_baseline.png');

      await moveMouse(hackathonCardBox.x, hackathonCardBox.y);
      await sleep(300);

      const cardHoverIcons = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        const trophy = card.querySelector('[data-animation="lift"] .spatial-icon-svg');
        const calendar = card.querySelector('[data-animation="calendar-tick"] .spatial-icon-svg');
        const mapPin = card.querySelector('[data-animation="bounce"] .spatial-icon-svg');
        const clock = card.querySelector('[data-animation="tick"] .spatial-icon-svg');
        const actionIcon = card.querySelector('[data-animation="pointing"] .spatial-icon-svg');
        const extLink = card.querySelector('[data-animation="outward"] .spatial-icon-svg');

        return {
          cardTransform: window.getComputedStyle(card).transform,
          cardBorder: window.getComputedStyle(card).borderColor,
          trophy: trophy ? { anim: window.getComputedStyle(trophy).animationName, delay: window.getComputedStyle(trophy).animationDelay } : null,
          calendar: calendar ? { anim: window.getComputedStyle(calendar).animationName, delay: window.getComputedStyle(calendar).animationDelay } : null,
          mapPin: mapPin ? { anim: window.getComputedStyle(mapPin).animationName, delay: window.getComputedStyle(mapPin).animationDelay } : null,
          clock: clock ? { anim: window.getComputedStyle(clock).animationName, delay: window.getComputedStyle(clock).animationDelay } : null,
          actionIcon: actionIcon ? { anim: window.getComputedStyle(actionIcon).animationName, delay: window.getComputedStyle(actionIcon).animationDelay } : null,
          extLink: extLink ? { anim: window.getComputedStyle(extLink).animationName } : null,
        };
      })()`);
      console.log('  HackathonCard Choreographed Icons on Hover:', cardHoverIcons);
      await screenshot('step45c_hackathon_card_hover_choreography.png');

      await moveMouse(10, 10);
      await sleep(400);

      const cardReturn = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        return { cardTransform: window.getComputedStyle(card).transform };
      })()`);
      console.log('  HackathonCard Return to Rest:', cardReturn.cardTransform === 'none' ? '✅ PASSED' : cardReturn.cardTransform);
    }

    // --------------------------------------------------------------------------
    // TEST 3: SPATIAL DROPDOWN CHEVRON & CHECKMARK (/hackathons)
    // --------------------------------------------------------------------------
    console.log('\n[4] Testing SpatialDropdown Chevron & Option Checkmark...');
    const dropdownBox = await evalVal(`(() => {
      const btn = document.querySelector('button[aria-haspopup="listbox"]');
      if (!btn) return null;
      btn.scrollIntoView({ block: 'center' });
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (dropdownBox) {
      await clickMouse(dropdownBox.x, dropdownBox.y);
      await sleep(300);

      const dropdownState = await evalVal(`(() => {
        const chevron = document.querySelector('button[aria-haspopup="listbox"] .spatial-animated-icon');
        const chevronSvg = chevron ? chevron.querySelector('.spatial-icon-svg') : null;
        const checkIcon = document.querySelector('[role="listbox"] [data-animation="pop"]');
        return {
          chevronState: chevron ? chevron.getAttribute('data-state') : null,
          chevronTransform: chevronSvg ? window.getComputedStyle(chevronSvg).transform : null,
          checkIconFound: Boolean(checkIcon),
          checkAnimation: checkIcon ? checkIcon.getAttribute('data-animation') : null,
        };
      })()`);
      console.log('  SpatialDropdown Open State Telemetry:', dropdownState);
      await screenshot('step45c_spatial_dropdown_animated_icons.png');

      await clickMouse(dropdownBox.x, dropdownBox.y);
      await sleep(250);
      await moveMouse(10, 10);
      await sleep(200);
    }

    // --------------------------------------------------------------------------
    // TEST 4: USER CARD ICONS ON /users
    // --------------------------------------------------------------------------
    console.log('\n[5] Testing UserCard Icons & Socials on /users...');
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
      await sleep(300);

      const userCardIcons = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        const actionIcon = card.querySelector('[data-animation="outward"] .spatial-icon-svg');
        const codeIcon = card.querySelector('[data-animation="bracket"]');
        const shareIcon = card.querySelector('[data-animation="bloom"]');
        const globeIcon = card.querySelector('[data-animation="orbit"]');

        return {
          cardTransform: window.getComputedStyle(card).transform,
          actionIconAnim: actionIcon ? window.getComputedStyle(actionIcon).animationName : null,
          codeIconFound: Boolean(codeIcon),
          shareIconFound: Boolean(shareIcon),
          globeIconFound: Boolean(globeIcon),
        };
      })()`);
      console.log('  UserCard Icons Telemetry:', userCardIcons);
      await screenshot('step45c_user_card_hover_choreography.png');

      await moveMouse(10, 10);
      await sleep(200);
    }

    // --------------------------------------------------------------------------
    // TEST 5: TEAM REQUEST CARD ICONS ON /profile
    // --------------------------------------------------------------------------
    console.log('\n[6] Testing TeamRequestCard Icons on /profile...');
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
      await sleep(300);

      const teamReqIcons = await evalVal(`(() => {
        const card = document.querySelector('.card-choreography');
        const usersIcon = card.querySelector('[data-animation="group"] .spatial-icon-svg');
        const clockIcon = card.querySelector('[data-animation="tick"] .spatial-icon-svg');
        const actionIcon = card.querySelector('[data-animation="pointing"] .spatial-icon-svg');

        return {
          cardTransform: window.getComputedStyle(card).transform,
          usersIconAnim: usersIcon ? window.getComputedStyle(usersIcon).animationName : null,
          clockIconAnim: clockIcon ? window.getComputedStyle(clockIcon).animationName : null,
          actionIconAnim: actionIcon ? window.getComputedStyle(actionIcon).animationName : null,
        };
      })()`);
      console.log('  TeamRequestCard Icons Telemetry:', teamReqIcons);
      await screenshot('step45c_team_request_card_hover_choreography.png');

      await moveMouse(10, 10);
      await sleep(200);
    }

    // --------------------------------------------------------------------------
    // TEST 6: SPATIAL DATE PICKER ON /post-request
    // --------------------------------------------------------------------------
    console.log('\n[7] Testing SpatialDatePicker Icons on /post-request...');
    await evalVal(`window.__navigate ? window.__navigate('/post-request') : (window.location.href = '/post-request')`);
    await sleep(1500);

    const datePickerBox = await evalVal(`(() => {
      const picker = document.querySelector('div[class*="backdrop-saturate"]');
      if (!picker) return null;
      picker.scrollIntoView({ block: 'center' });
      const rect = picker.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`);

    if (datePickerBox) {
      await moveMouse(datePickerBox.x, datePickerBox.y);
      await sleep(250);

      const pickerHover = await evalVal(`(() => {
        const icon = document.querySelector('[data-animation="calendar-tick"]');
        const svg = icon ? icon.querySelector('.spatial-icon-svg') : null;
        return {
          calendarFound: Boolean(icon),
          animationName: svg ? window.getComputedStyle(svg).animationName : null,
        };
      })()`);
      console.log('  DatePicker Calendar Icon on Hover:', pickerHover);

      await clickMouse(datePickerBox.x, datePickerBox.y);
      await sleep(350);

      const calendarPortalIcons = await evalVal(`(() => {
        const leftChevron = document.querySelector('button[aria-label*="Previous month"] .spatial-animated-icon');
        const rightChevron = document.querySelector('button[aria-label*="Next month"] .spatial-animated-icon');
        return {
          leftChevronAnim: leftChevron ? leftChevron.getAttribute('data-animation') : null,
          rightChevronAnim: rightChevron ? rightChevron.getAttribute('data-animation') : null,
        };
      })()`);
      console.log('  DatePicker Portal Navigation Icons:', calendarPortalIcons);
      await screenshot('step45c_datepicker_open_animated_icons.png');

      await clickMouse(10, 10);
      await sleep(250);
    }

    // --------------------------------------------------------------------------
    // TEST 7: UNIVERSAL SEARCH COMMAND PALETTE ICONS
    // --------------------------------------------------------------------------
    console.log('\n[8] Testing Universal Search Command Palette Animated Icons...');
    await sendKey('k', 2);
    await sleep(350);

    await send('Input.insertText', { text: 'hack' });
    await sleep(500);

    const searchPaletteIcons = await evalVal(`(() => {
      const searchIcon = document.querySelector('[data-testid="search-modal"] [data-animation="magnify"]');
      const closeBtnIcon = document.querySelector('[data-testid="search-close-button"] [data-animation="cross"]');
      const resultChevron = document.querySelector('[data-testid="search-modal"] [data-animation="glide-right"]');
      const resultsCount = document.querySelectorAll('[data-testid="search-modal"] [data-selected]').length;

      return {
        searchIconFound: Boolean(searchIcon),
        closeBtnIconFound: Boolean(closeBtnIcon),
        resultChevronFound: Boolean(resultChevron),
        resultsCount,
      };
    })()`);
    console.log('  Universal Search Modal Icons Telemetry:', searchPaletteIcons);
    await screenshot('step45c_universal_search_animated_icons.png');

    await sendKey('Escape');
    await sleep(250);

    // --------------------------------------------------------------------------
    // TEST 8: REDUCED MOTION ACCESSIBILITY COMPLIANCE
    // --------------------------------------------------------------------------
    console.log('\n[9] Testing prefers-reduced-motion Accessibility Enforcement...');
    await evalVal(`window.__navigate ? window.__navigate('/hackathons') : (window.location.href = '/hackathons')`);
    await sleep(1200);

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
    await screenshot('step45c_reduced_motion_enforcement.png');

    // Reset emulation
    await send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });

    // --------------------------------------------------------------------------
    // TEST 9: MOBILE VIEWPORT & TOUCH CONTROLS (375px)
    // --------------------------------------------------------------------------
    console.log('\n[10] Testing Mobile (375px) Viewport & Touch Controls...');
    await setViewport(375, 667);
    await sleep(300);

    const mobileIcons = await evalVal(`(() => {
      const searchBtn = document.querySelector('button[aria-label*="Universal Search"] .spatial-animated-icon');
      const menuBtn = document.querySelector('button[aria-label*="Toggle navigation menu"] .spatial-animated-icon');
      return {
        mobileSearchAnim: searchBtn ? searchBtn.getAttribute('data-animation') : null,
        mobileMenuAnim: menuBtn ? menuBtn.getAttribute('data-animation') : null,
      };
    })()`);
    console.log('  Mobile Controls Icon Telemetry:', mobileIcons);
    await screenshot('step45c_mobile_animated_icons.png');

    await setViewport(1440, 900);
    await sleep(200);

    console.log('\n====================================================');
    console.log('🎉 ALL STEP 4.5C ANIMATED ICON CHECKS COMPLETED!');
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
