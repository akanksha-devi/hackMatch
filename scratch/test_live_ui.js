const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9301;
const ARTIFACTS_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\f7146f29-bd94-4d09-8a54-d58e5dd1b822';

async function testLive() {
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    `${APP_URL}/login`
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    const callbacks = new Map();
    ws.onmessage = (e) => {
      const resp = JSON.parse(e.data);
      if (resp.id && callbacks.has(resp.id)) {
        const cb = callbacks.get(resp.id);
        callbacks.delete(resp.id);
        cb(resp);
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
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return res && res.result ? res.result.value : undefined;
    }

    await send('Page.enable');
    await send('Runtime.enable');

    // Wait for login page
    await new Promise(r => setTimeout(r, 1500));
    console.log('Login page title:', await evalVal('document.title'));

    // Click Alex demo button and submit
    await evalVal(`(async () => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex'));
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 200));
      const submit = document.querySelector('button[type="submit"]');
      if (submit) submit.click();
    })()`);

    await new Promise(r => setTimeout(r, 2000));
    console.log('After login URL:', await evalVal('window.location.href'));

    // Check navbar elements
    const navbarCheck = await evalVal(`(() => {
      return {
        hasNavbar: Boolean(document.querySelector('nav')),
        hasSearchDesktop: Boolean(document.querySelector('button[aria-label*="Universal Command Search"]')),
        hasSearchMobile: Boolean(document.querySelector('button[aria-label*="Universal Search"]')),
        hasProfileTrigger: Boolean(document.querySelector('button[aria-haspopup="menu"]')),
        hasNotifBell: Boolean(document.querySelector('button[aria-label="Notifications"]'))
      };
    })()`);
    console.log('Navbar check:', navbarCheck);

  } finally {
    edgeProc.kill('SIGKILL');
  }
}

testLive().catch(console.error);
