const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9297;
const ARTIFACTS_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\f7146f29-bd94-4d09-8a54-d58e5dd1b822';

const VIEWPORTS = [
  { width: 375, height: 812, name: '375px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 1024, height: 768, name: '1024px' },
  { width: 1280, height: 800, name: '1280px' },
  { width: 1440, height: 900, name: '1440px' }
];

async function runStep44AVerification() {
  console.log('====================================================');
  console.log('🚀 STEP 4.4A: FLOATING GLASS AUDIT & VERIFICATION');
  console.log('====================================================');

  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    `${APP_URL}/login`
  ]);

  await new Promise(r => setTimeout(r, 2200));

  try {
    const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) throw new Error('No page tab found in Edge CDP');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

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
      } catch (err) {}
    };

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const timer = setTimeout(() => {
          callbacks.delete(id);
          reject(new Error('timeout ' + method));
        }, 15000);
        callbacks.set(id, (resp) => {
          clearTimeout(timer);
          if (resp.error) reject(resp.error);
          else resolve(resp.result);
        });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    console.log(`✓ Connected to Edge CDP on port ${PORT}`);
    await send('Page.enable');
    await send('Runtime.enable');

    async function setViewport(w, h) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: w < 768
      });
      await new Promise(r => setTimeout(r, 250));
    }

    async function setTheme(themeName) {
      await send('Runtime.evaluate', {
        expression: `(() => {
          if (window.__setTheme) window.__setTheme('${themeName}');
          const html = document.documentElement;
          if ('${themeName}' === 'light') {
            html.classList.add('light');
            html.classList.remove('dark');
            html.setAttribute('data-theme', 'light');
            html.style.colorScheme = 'light';
          } else {
            html.classList.remove('light');
            html.classList.add('dark');
            html.setAttribute('data-theme', 'dark');
            html.style.colorScheme = 'dark';
          }
        })()`
      });
      await new Promise(r => setTimeout(r, 300));
    }

    async function takeScreenshot(filename) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const dest = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(dest, Buffer.from(data, 'base64'));
      console.log(`  📸 Screenshot saved: ${dest}`);
    }

    // Authenticate as Alex Rivera
    await new Promise(r => setTimeout(r, 1500));
    await send('Runtime.evaluate', {
      expression: `(async () => {
        const alexBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex'));
        if (alexBtn) alexBtn.click();
        await new Promise(r => setTimeout(r, 300));
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()`,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 2000));
    console.log('✓ Authenticated as Alex Rivera');

    // Go to dashboard so we have rich content, WebGL particles, and glows
    await send('Runtime.evaluate', {
      expression: `window.__navigate ? window.__navigate('/dashboard') : (window.location.href = '/dashboard')`
    });
    await new Promise(r => setTimeout(r, 2000));

    const auditResults = {
      computedStyles: {},
      accessibility: {},
      responsive: [],
      visualDiffusionVerified: false
    };

    // ========================================================
    // 1. AUDIT TARGET 1: PROFILE MENU (DARK & LIGHT)
    // ========================================================
    console.log('\n--- Auditing Target 1: Profile Menu ---');
    for (const theme of ['dark', 'light']) {
      await setTheme(theme);
      await setViewport(1440, 900);

      // Open profile menu
      await send('Runtime.evaluate', {
        expression: `(() => {
          const trigger = document.querySelector('button[aria-haspopup="menu"]');
          if (trigger) trigger.click();
        })()`
      });
      await new Promise(r => setTimeout(r, 400));

      const profileEval = await send('Runtime.evaluate', {
        expression: `(() => {
          const menu = document.querySelector('[role="menu"]');
          if (!menu) return { error: 'Profile menu [role="menu"] not found' };
          const cs = window.getComputedStyle(menu);
          const rect = menu.getBoundingClientRect();
          const trigger = document.querySelector('button[aria-haspopup="menu"]');
          const triggerRect = trigger ? trigger.getBoundingClientRect() : null;
          
          return {
            tagName: menu.tagName,
            className: menu.className,
            backgroundColor: cs.backgroundColor,
            opacity: cs.opacity,
            backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter || 'none',
            webkitBackdropFilter: cs.webkitBackdropFilter || 'none',
            border: cs.border,
            boxShadow: cs.boxShadow,
            borderRadius: cs.borderRadius,
            zIndex: cs.zIndex,
            position: cs.position,
            hasLiquidGlass: menu.classList.contains('liquid-glass-floating'),
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height, bottom: rect.bottom, right: rect.right },
            triggerAriaExpanded: trigger ? trigger.getAttribute('aria-expanded') : null,
            triggerAriaHasPopup: trigger ? trigger.getAttribute('aria-haspopup') : null,
            menuRole: menu.getAttribute('role'),
            menuAriaLabel: menu.getAttribute('aria-label'),
            itemCount: menu.querySelectorAll('[role="menuitem"]').length
          };
        })()`,
        returnByValue: true
      });

      auditResults.computedStyles[`profile_${theme}`] = profileEval.result.value;
      console.log(`Profile Menu Computed (${theme.toUpperCase()}):`, JSON.stringify(profileEval.result.value, null, 2));

      // Capture screenshot
      const shotName = `step44a_profile_menu_open_${theme}.png`;
      await takeScreenshot(shotName);

      // Test Escape key close
      await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await new Promise(r => setTimeout(r, 300));

      const closedCheck = await send('Runtime.evaluate', {
        expression: `!document.querySelector('[role="menu"]')`
      });
      auditResults.accessibility[`profile_escape_close_${theme}`] = closedCheck.result.value;
      console.log(`✓ Profile Menu Escape Close (${theme}):`, closedCheck.result.value ? 'PASS' : 'FAIL');
    }

    // ========================================================
    // 2. AUDIT TARGET 2: NOTIFICATION POPOVER (DARK & LIGHT)
    // ========================================================
    console.log('\n--- Auditing Target 2: Notification Popover ---');
    for (const theme of ['dark', 'light']) {
      await setTheme(theme);
      await setViewport(1440, 900);

      // Open notification popover
      await send('Runtime.evaluate', {
        expression: `(() => {
          const bellBtn = document.querySelector('button[aria-label="Notifications"]');
          if (bellBtn) bellBtn.click();
        })()`
      });
      await new Promise(r => setTimeout(r, 400));

      const notifEval = await send('Runtime.evaluate', {
        expression: `(() => {
          const popover = document.querySelector('[role="dialog"][aria-label="Notifications popover"]');
          if (!popover) return { error: 'Notification popover not found' };
          const cs = window.getComputedStyle(popover);
          const rect = popover.getBoundingClientRect();
          const header = popover.querySelector('.border-b');
          const footer = popover.querySelector('.border-t');
          const headerCs = header ? window.getComputedStyle(header) : null;
          const footerCs = footer ? window.getComputedStyle(footer) : null;
          const bellBtn = document.querySelector('button[aria-label="Notifications"]');

          return {
            tagName: popover.tagName,
            className: popover.className,
            backgroundColor: cs.backgroundColor,
            opacity: cs.opacity,
            backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter || 'none',
            webkitBackdropFilter: cs.webkitBackdropFilter || 'none',
            border: cs.border,
            boxShadow: cs.boxShadow,
            borderRadius: cs.borderRadius,
            zIndex: cs.zIndex,
            position: cs.position,
            hasLiquidGlass: popover.classList.contains('liquid-glass-floating'),
            innerHeaderBg: headerCs ? headerCs.backgroundColor : 'none',
            innerFooterBg: footerCs ? footerCs.backgroundColor : 'none',
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height, bottom: rect.bottom, right: rect.right },
            triggerAriaExpanded: bellBtn ? bellBtn.getAttribute('aria-expanded') : null,
            triggerAriaHasPopup: bellBtn ? bellBtn.getAttribute('aria-haspopup') : null,
            popoverRole: popover.getAttribute('role'),
            popoverAriaLabel: popover.getAttribute('aria-label')
          };
        })()`,
        returnByValue: true
      });

      auditResults.computedStyles[`notification_${theme}`] = notifEval.result.value;
      console.log(`Notification Popover Computed (${theme.toUpperCase()}):`, JSON.stringify(notifEval.result.value, null, 2));

      // Capture screenshot
      const shotName = `step44a_notification_popover_open_${theme}.png`;
      await takeScreenshot(shotName);

      // Test Escape key close
      await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await new Promise(r => setTimeout(r, 300));

      const closedCheck = await send('Runtime.evaluate', {
        expression: `!document.querySelector('[role="dialog"][aria-label="Notifications popover"]')`
      });
      auditResults.accessibility[`notification_escape_close_${theme}`] = closedCheck.result.value;
      console.log(`✓ Notification Popover Escape Close (${theme}):`, closedCheck.result.value ? 'PASS' : 'FAIL');
    }

    // ========================================================
    // 3. RESPONSIVE MATRIX TESTING (5 VIEWPORTS x 2 THEMES)
    // ========================================================
    console.log('\n--- Testing Responsive Matrix (375px, 768px, 1024px, 1280px, 1440px) ---');
    for (const theme of ['dark', 'light']) {
      await setTheme(theme);

      for (const vp of VIEWPORTS) {
        await setViewport(vp.width, vp.height);

        // Test Profile menu at this viewport
        await send('Runtime.evaluate', {
          expression: `(() => {
            const trigger = document.querySelector('button[aria-haspopup="menu"]');
            if (trigger) trigger.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 200));

        const vpEval = await send('Runtime.evaluate', {
          expression: `(() => {
            const menu = document.querySelector('[role="menu"]');
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const hasHOverflow = docWidth > winWidth;
            
            let menuClipped = false;
            let menuRight = 0;
            if (menu) {
              const r = menu.getBoundingClientRect();
              menuRight = r.right;
              menuClipped = r.right > winWidth || r.left < 0;
            }

            return {
              viewport: ${vp.width},
              docWidth,
              winWidth,
              hasHOverflow,
              menuOpen: Boolean(menu),
              menuClipped,
              menuRight
            };
          })()`,
          returnByValue: true
        });

        // Close menu
        await send('Runtime.evaluate', {
          expression: `(() => {
            const trigger = document.querySelector('button[aria-haspopup="menu"]');
            if (trigger) trigger.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 150));

        const rData = vpEval.result.value;
        auditResults.responsive.push({
          theme,
          ...rData
        });
        console.log(`  Viewport ${vp.width}px (${theme}): overflow=${rData.hasHOverflow ? 'YES (FAIL)' : 'NO (PASS)'}, menuClipped=${rData.menuClipped ? 'YES (FAIL)' : 'NO (PASS)'}`);
      }
    }

    // ========================================================
    // 4. ENVIRONMENTAL DIFFUSION & STACKING CONTEXT VERIFICATION
    // ========================================================
    console.log('\n--- Verifying Stacking Context and Environmental Diffusion ---');
    await setTheme('dark');
    await setViewport(1440, 900);

    const stackingEval = await send('Runtime.evaluate', {
      expression: `(() => {
        const nav = document.querySelector('nav');
        const navCs = window.getComputedStyle(nav);
        const webglCanvas = document.querySelector('canvas');
        const bgGlow = document.querySelector('.bg-mesh-glow');

        return {
          navPosition: navCs.position,
          navZIndex: navCs.zIndex,
          navOverflow: navCs.overflow,
          navBackdropFilter: navCs.backdropFilter,
          hasWebGLCanvas: Boolean(webglCanvas),
          hasBgGlow: Boolean(bgGlow)
        };
      })()`,
      returnByValue: true
    });
    console.log('Stacking Context & Background Environment:', JSON.stringify(stackingEval.result.value, null, 2));

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'scratch', 'step44a_audit_results.json'),
      JSON.stringify(auditResults, null, 2)
    );

    console.log('\n====================================================');
    console.log('🎉 AUDIT COMPLETE: All tests captured and written!');
    console.log('====================================================');

    ws.close();
  } finally {
    edgeProc.kill('SIGKILL');
  }
}

runStep44AVerification().catch(console.error);
