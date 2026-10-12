const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\f7146f29-bd94-4d09-8a54-d58e5dd1b822';

async function run() {
  console.log('Logging in as alex@example.com...');
  const authResp = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@example.com', password: 'password123' })
  });
  const authData = await authResp.json();
  const token = authData.token;
  console.log('Got token for:', authData.user?.name);

  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9288',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1536,960',
    `http://localhost:5173/?auth_token=${token}`
  ]);

  await new Promise(r => setTimeout(r, 2500));
  const tabs = await (await fetch('http://127.0.0.1:9288/json')).json();
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let nextId = 1;
  function sendCdp(method, params = {}) {
    return new Promise((resolve) => {
      const id = nextId++;
      const handler = (e) => {
        const data = JSON.parse(e.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCdp('Page.enable');
  await sendCdp('Runtime.enable');

  // Click theme button to transition to light mode
  await sendCdp('Runtime.evaluate', {
    expression: `(() => {
      const themeBtn = document.querySelector('button[aria-label*="light theme"]');
      if (themeBtn) themeBtn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1000));

  // 1. Screenshot of default logged-in navbar in light mode
  const shot1 = await sendCdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_navbar_light_loggedin.png'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved verify_navbar_light_loggedin.png');

  // 2. Open Notification bell
  await sendCdp('Runtime.evaluate', {
    expression: `(() => {
      const bell = document.querySelector('button[aria-label="Notifications"]');
      if (bell) bell.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const shot2 = await sendCdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_navbar_notifications_dropdown.png'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved verify_navbar_notifications_dropdown.png');

  // 3. Close notification & Open Profile menu
  await sendCdp('Runtime.evaluate', {
    expression: `(() => {
      const profileTrigger = document.querySelector('button[aria-haspopup="menu"]');
      if (profileTrigger) profileTrigger.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const shot3 = await sendCdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_navbar_profile_dropdown.png'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved verify_navbar_profile_dropdown.png');

  proc.kill();
  console.log('Done!');
}

run().catch(console.error);
