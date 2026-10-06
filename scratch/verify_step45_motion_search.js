const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9299;
const ARTIFACTS_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\f7146f29-bd94-4d09-8a54-d58e5dd1b822';

const VIEWPORTS = [
  { width: 375, height: 812, name: '375px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 1024, height: 768, name: '1024px' },
  { width: 1280, height: 800, name: '1280px' },
  { width: 1440, height: 900, name: '1440px' }
];

async function runStep45Verification() {
  console.log('====================================================');
  console.log('🚀 STEP 4.5: GLOBAL MOTION & UNIVERSAL SEARCH AUDIT');
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

    async function evalVal(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res && res.exceptionDetails) {
        throw new Error(JSON.stringify(res.exceptionDetails));
      }
      return res && res.result ? res.result.value : undefined;
    }

    async function setViewport(w, h) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: w < 768
      });
      await evalVal(`window.dispatchEvent(new Event('resize'))`);
      await new Promise(r => setTimeout(r, 250));
    }

    async function setTheme(themeName) {
      await evalVal(`(() => {
        const html = document.documentElement;
        if ('${themeName}' === 'light') {
          html.classList.add('light');
          html.classList.remove('dark');
        } else {
          html.classList.remove('light');
          html.classList.add('dark');
        }
        localStorage.setItem('theme', '${themeName}');
      })()`);
      await new Promise(r => setTimeout(r, 200));
    }

    async function captureScreenshot(filename) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      console.log(`  📸 Screenshot captured: ${filename}`);
      return filePath;
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log('\n[1] Logging in as Alex (Student)...');
    // Wait for login page mount
    await new Promise(r => setTimeout(r, 2000));

    await evalVal(`(async () => {
      const alexBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex'));
      if (alexBtn) alexBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    })()`);

    await new Promise(r => setTimeout(r, 2500));
    const currentUrl = await evalVal(`window.location.href`);
    console.log(`  ✓ Authenticated. Current page: ${currentUrl}`);

    // Set dark theme
    await setTheme('dark');

    // [2] Test Tuned Tier 3 Floating Glass (Dark Mode)
    console.log('\n[2] Testing Tuned Tier 3 Floating Glass (Dark Mode)...');
    // Open Profile dropdown
    await evalVal(`(() => {
      const trigger = document.querySelector('button[aria-haspopup="menu"]');
      if (trigger) trigger.click();
    })()`);
    await new Promise(r => setTimeout(r, 400));

    const darkMenuStyles = await evalVal(`(() => {
      const menu = document.querySelector('div[role="menu"]');
      if (!menu) return { error: 'Profile menu not found' };
      const s = window.getComputedStyle(menu);
      return {
        backgroundColor: s.backgroundColor,
        backdropFilter: s.backdropFilter || s.webkitBackdropFilter,
        border: s.border,
        boxShadow: s.boxShadow,
        borderRadius: s.borderRadius
      };
    })()`);
    console.log('  Dark Tier 3 Floating Menu Styles:', JSON.stringify(darkMenuStyles, null, 2));

    // Verify unread badge has NO animate-pulse
    const badgePulseCheck = await evalVal(`(() => {
      const bell = document.querySelector('button[aria-label="Notifications"]');
      const badge = bell ? bell.querySelector('span.animate-pulse') : null;
      return Boolean(badge);
    })()`);
    console.log(`  Continuous pulse removed from badge: ${!badgePulseCheck ? '✅ YES (pulse-free)' : '❌ NO'}`);

    await captureScreenshot('step45_floating_popovers_tuned_dark.png');

    // Close profile dropdown
    await evalVal(`(() => {
      const trigger = document.querySelector('button[aria-haspopup="menu"]');
      if (trigger) trigger.click();
    })()`);
    await new Promise(r => setTimeout(r, 300));

    // [3] Test Tuned Tier 3 Floating Glass (Light Mode)
    console.log('\n[3] Testing Tuned Tier 3 Floating Glass (Light Mode)...');
    await setTheme('light');

    // Open Profile dropdown in Light mode
    await evalVal(`(() => {
      const trigger = document.querySelector('button[aria-haspopup="menu"]');
      if (trigger) trigger.click();
    })()`);
    await new Promise(r => setTimeout(r, 400));

    const lightMenuStyles = await evalVal(`(() => {
      const menu = document.querySelector('div[role="menu"]');
      if (!menu) return { error: 'Profile menu not found' };
      const s = window.getComputedStyle(menu);
      return {
        backgroundColor: s.backgroundColor,
        backdropFilter: s.backdropFilter || s.webkitBackdropFilter,
        border: s.border,
        boxShadow: s.boxShadow
      };
    })()`);
    console.log('  Light Tier 3 Floating Menu Styles:', JSON.stringify(lightMenuStyles, null, 2));
    await captureScreenshot('step45_floating_popovers_tuned_light.png');

    // Close dropdown
    await evalVal(`(() => {
      const trigger = document.querySelector('button[aria-haspopup="menu"]');
      if (trigger) trigger.click();
    })()`);
    await new Promise(r => setTimeout(r, 300));

    // Switch back to Dark mode
    await setTheme('dark');

    // [4] Test Card Micro-Choreography on /hackathons
    console.log('\n[4] Testing Card Micro-Choreography on /hackathons...');
    await evalVal(`window.__navigate ? window.__navigate('/hackathons') : (window.location.href = '/hackathons')`);
    await new Promise(r => setTimeout(r, 2500));

    const cardChoreographyAudit = await evalVal(`(() => {
      const card = document.querySelector('.card-choreography');
      if (!card) return { found: false };

      const title = card.querySelector('.card-title');
      const chips = card.querySelectorAll('.card-chip');
      const icon = card.querySelector('.card-action-icon');

      return {
        found: true,
        hasChoreographyClass: card.classList.contains('card-choreography'),
        titleFound: Boolean(title),
        chipsCount: chips.length,
        iconFound: Boolean(icon),
      };
    })()`);
    console.log('  Card Choreography Inspection:', JSON.stringify(cardChoreographyAudit, null, 2));
    await captureScreenshot('step45_card_choreography_dark.png');

    // [5] Test Universal Search Command Palette (Dark Mode)
    console.log('\n[5] Testing Universal Search Command Palette...');
    
    // Open Universal Search via desktop button trigger or Ctrl+K
    await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Universal Command Search"]');
      if (btn) btn.click();
      else {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      }
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const searchDialogOpen = await evalVal(`(() => {
      const dialog = document.querySelector('div[role="dialog"][aria-label="Universal Search Command Palette"]');
      return Boolean(dialog);
    })()`);
    console.log(`  Universal Search dialog opened: ${searchDialogOpen ? '✅ YES' : '❌ NO'}`);
    await captureScreenshot('step45_universal_search_open_dark.png');

    // Type query "hack"
    console.log('\n[6] Typing search query "hack" into Universal Search...');
    await evalVal(`(() => {
      const input = document.querySelector('div[role="dialog"] input[type="text"]');
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(input, 'hack');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`);

    // Wait 600ms for debounce & API return
    await new Promise(r => setTimeout(r, 600));

    const searchResultsAudit = await evalVal(`(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      if (!dialog) return null;
      const results = dialog.querySelectorAll('[data-selected]');
      const highlightSpans = dialog.querySelectorAll('span.font-semibold.text-indigo-600, span.font-semibold.text-indigo-400');
      return {
        resultsCount: results.length,
        highlightsCount: highlightSpans.length,
        firstResultTitle: results[0] ? results[0].innerText.split('\\n')[0] : null
      };
    })()`);
    console.log('  Search Results Audit:', JSON.stringify(searchResultsAudit, null, 2));
    await captureScreenshot('step45_universal_search_results_dark.png');

    // Test ArrowDown keyboard navigation
    console.log('\n[7] Testing ArrowDown keyboard navigation in search results...');
    await evalVal(`(() => {
      const input = document.querySelector('div[role="dialog"] input[type="text"]');
      if (input) {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      }
    })()`);
    await new Promise(r => setTimeout(r, 150));

    const activeItemAfterDown = await evalVal(`(() => {
      const selected = document.querySelector('[data-selected="true"]');
      return selected ? selected.innerText.split('\\n')[0] : null;
    })()`);
    console.log(`  Selected item after ArrowDown: "${activeItemAfterDown}"`);

    // Dismiss search with Escape
    console.log('\n[8] Testing Escape dismissal...');
    await evalVal(`(() => {
      const input = document.querySelector('div[role="dialog"] input[type="text"]');
      if (input) {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      }
    })()`);
    await new Promise(r => setTimeout(r, 200));

    const isSearchClosed = await evalVal(`(() => {
      const dialog = document.querySelector('div[role="dialog"][aria-label="Universal Search Command Palette"]');
      return !dialog;
    })()`);
    console.log(`  Search modal dismissed on Escape: ${isSearchClosed ? '✅ YES' : '❌ NO'}`);

    // Switch to Light Mode and open Universal Search
    console.log('\n[9] Testing Universal Search Palette in Light Mode...');
    await setTheme('light');

    await evalVal(`(() => {
      const btn = document.querySelector('button[aria-label*="Universal Command Search"]');
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 400));
    await captureScreenshot('step45_universal_search_open_light.png');

    // Close search
    await evalVal(`(() => {
      const input = document.querySelector('div[role="dialog"] input[type="text"]');
      if (input) {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      }
    })()`);
    await new Promise(r => setTimeout(r, 200));

    // [10] Responsive Matrix Audit across 5 Viewports x 2 Themes
    console.log('\n[10] Testing Responsive Matrix (375px, 768px, 1024px, 1280px, 1440px) across Dark & Light...');
    for (const theme of ['dark', 'light']) {
      await setTheme(theme);
      console.log(`  --- Theme: ${theme.toUpperCase()} ---`);
      for (const vp of VIEWPORTS) {
        await setViewport(vp.width, vp.height);
        const metrics = await evalVal(`(() => {
          const doc = document.documentElement;
          const scrollW = doc.scrollWidth;
          const winW = window.innerWidth;
          const hasOverflow = scrollW > winW;
          const searchBtnDesktop = document.querySelector('button[aria-label*="Universal Command Search"]');
          const searchBtnMobile = document.querySelector('button[aria-label*="Universal Search"]');
          return {
            scrollW,
            winW,
            hasOverflow,
            desktopSearchVisible: searchBtnDesktop ? window.getComputedStyle(searchBtnDesktop).display !== 'none' : false,
            mobileSearchVisible: searchBtnMobile ? window.getComputedStyle(searchBtnMobile).display !== 'none' : false
          };
        })()`);
        console.log(`    Viewport ${vp.name.padEnd(6)}: winW=${metrics.winW}, scrollW=${metrics.scrollW}, overflow=${metrics.hasOverflow ? '❌ OVERFLOW' : '✅ 0px'}, desktopBtn=${metrics.desktopSearchVisible}, mobileBtn=${metrics.mobileSearchVisible}`);
      }
    }

    console.log('\n====================================================');
    console.log('🎉 ALL STEP 4.5 MOTION & SEARCH CHECKS COMPLETED!');
    console.log('====================================================\n');

  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    try {
      edgeProc.kill('SIGKILL');
    } catch (e) {}
  }
}

runStep45Verification().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
