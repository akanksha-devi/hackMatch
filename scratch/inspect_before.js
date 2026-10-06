const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9296;

async function inspectBefore() {
  console.log('--- Launching Edge for BEFORE inspection ---');
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
    if (!tab) throw new Error('No tab');

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

    await send('Page.enable');
    await send('Runtime.enable');

    // Login as Alex Rivera
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
    console.log('Logged in successfully');

    // Go to dashboard
    await send('Runtime.evaluate', {
      expression: `window.__navigate ? window.__navigate('/dashboard') : (window.location.href = '/dashboard')`
    });
    await new Promise(r => setTimeout(r, 1500));

    // Inspect Profile Menu BEFORE
    // Click on Profile menu trigger
    await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.querySelector('button[aria-haspopup="menu"]');
        if (trigger) trigger.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    const profileBefore = await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.querySelector('button[aria-haspopup="menu"]');
        if (!trigger) return { error: 'Profile trigger not found' };
        
        // Find dropdown menu
        const menu = trigger.nextElementSibling;
        if (!menu) return { error: 'Profile menu not found next to trigger' };
        
        const cs = window.getComputedStyle(menu);
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
          hasLiquidGlass: menu.classList.contains('liquid-glass-floating')
        };
      })()`,
      returnByValue: true
    });

    // Close profile menu
    await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.querySelector('button[aria-haspopup="menu"]');
        if (trigger) trigger.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    // Inspect Notification Popover BEFORE (DARK)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const bellBtn = document.querySelector('button[aria-label="Notifications"]');
        if (bellBtn) bellBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    const notifBefore = await send('Runtime.evaluate', {
      expression: `(() => {
        const bellBtn = document.querySelector('button[aria-label="Notifications"]');
        if (!bellBtn) return { error: 'Bell button not found' };
        const popover = document.querySelector('.liquid-glass-floating') || (bellBtn.parentElement && bellBtn.parentElement.querySelector('.absolute'));
        if (!popover) return { error: 'Notification popover not found' };
        const cs = window.getComputedStyle(popover);
        const header = popover.querySelector('.border-b');
        const footer = popover.querySelector('.border-t');
        const headerCs = header ? window.getComputedStyle(header) : null;
        const footerCs = footer ? window.getComputedStyle(footer) : null;
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
          innerFooterBg: footerCs ? footerCs.backgroundColor : 'none'
        };
      })()`,
      returnByValue: true
    });

    console.log('PROFILE MENU BEFORE (DARK):', JSON.stringify(profileBefore.result.value, null, 2));
    console.log('NOTIFICATION POPOVER BEFORE (DARK):', JSON.stringify(notifBefore.result.value, null, 2));

    // Switch to Light Mode
    await send('Runtime.evaluate', {
      expression: `(() => {
        if (window.__setTheme) window.__setTheme('light');
        const html = document.documentElement;
        html.classList.add('light');
        html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
        html.style.colorScheme = 'light';
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    // Profile menu BEFORE (LIGHT)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.querySelector('button[aria-haspopup="menu"]');
        if (trigger) trigger.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    const profileBeforeLight = await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.querySelector('button[aria-haspopup="menu"]');
        if (!trigger) return { error: 'Profile trigger not found' };
        const menu = trigger.nextElementSibling;
        if (!menu) return { error: 'Profile menu not found' };
        const cs = window.getComputedStyle(menu);
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
          hasLiquidGlass: menu.classList.contains('liquid-glass-floating')
        };
      })()`,
      returnByValue: true
    });
    console.log('PROFILE MENU BEFORE (LIGHT):', JSON.stringify(profileBeforeLight.result.value, null, 2));

    // Close profile menu
    await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.querySelector('button[aria-haspopup="menu"]');
        if (trigger) trigger.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    // Notification Popover BEFORE (LIGHT)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const bellBtn = document.querySelector('button[aria-label="Notifications"]');
        if (bellBtn) bellBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    const notifBeforeLight = await send('Runtime.evaluate', {
      expression: `(() => {
        const bellBtn = document.querySelector('button[aria-label="Notifications"]');
        if (!bellBtn) return { error: 'Bell button not found' };
        const popover = document.querySelector('.liquid-glass-floating') || (bellBtn.parentElement && bellBtn.parentElement.querySelector('.absolute'));
        if (!popover) return { error: 'Notification popover not found' };
        const cs = window.getComputedStyle(popover);
        const header = popover.querySelector('.border-b');
        const footer = popover.querySelector('.border-t');
        const headerCs = header ? window.getComputedStyle(header) : null;
        const footerCs = footer ? window.getComputedStyle(footer) : null;
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
          innerFooterBg: footerCs ? footerCs.backgroundColor : 'none'
        };
      })()`,
      returnByValue: true
    });
    console.log('NOTIFICATION POPOVER BEFORE (LIGHT):', JSON.stringify(notifBeforeLight.result.value, null, 2));

    ws.close();
  } finally {
    edgeProc.kill('SIGKILL');
  }
}

inspectBefore().catch(console.error);
