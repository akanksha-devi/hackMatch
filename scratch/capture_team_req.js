const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9299;
const ARTIFACTS_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\f7146f29-bd94-4d09-8a54-d58e5dd1b822';

async function main() {
  const p = spawn(edgePath, ['--headless=new', '--remote-debugging-port=' + PORT, '--disable-gpu', '--no-sandbox', '--window-size=1440,900', APP_URL + '/login']);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json')).json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (e) => {
        const resp = JSON.parse(e.data);
        if (resp.id === msgId) {
          ws.removeEventListener('message', handler);
          if (resp.error) reject(resp.error);
          else resolve(resp.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
    await send('Page.enable');
    await send('DOM.enable');
    await new Promise(r => setTimeout(r, 1500));

    // Log in as Alex
    await send('Runtime.evaluate', {
      expression: `(async () => {
        const alexBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex'));
        if (alexBtn) alexBtn.click();
        await new Promise(r => setTimeout(r, 400));
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 2500));

    // Navigate to Home page
    await send('Runtime.evaluate', { expression: `window.location.href = '/'` });
    await new Promise(r => setTimeout(r, 2500));
    
    // Find TeamRequestCard on Home page
    const box = await send('Runtime.evaluate', {
      expression: '(() => { const cards = Array.from(document.querySelectorAll(".card-choreography")); const reqCard = cards.find(c => c.textContent.includes("needed") || c.textContent.includes("Skills Needed")); if (!reqCard) return null; reqCard.scrollIntoView({ block: "center" }); const r = reqCard.getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2 }; })()',
      returnByValue: true
    });
    if (box.result && box.result.value) {
      const { x, y } = box.result.value;
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(x), y: Math.round(y) });
      await new Promise(r => setTimeout(r, 600));
      const ss = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'step45e_team_request_card_choreography_hover.png'), Buffer.from(ss.data, 'base64'));
      console.log('Successfully captured step45e_team_request_card_choreography_hover.png');
    } else {
      console.log('TeamRequestCard still not found');
    }
    ws.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    p.kill();
    process.exit(0);
  }
}
main();
