const { spawn } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const APP_URL = 'http://localhost:5173';
const PORT = 9295;

async function main() {
  const p = spawn(edgePath, ['--headless=new', '--remote-debugging-port=' + PORT, '--disable-gpu', '--no-sandbox', '--window-size=1440,900', APP_URL + '/login']);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json')).json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      const handler = (e) => {
        const resp = JSON.parse(e.data);
        if (resp.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(resp.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
    await send('Page.enable');
    await send('DOM.enable');
    await new Promise(r => setTimeout(r, 1000));

    // Log in as Alex
    await send('Runtime.evaluate', {
      expression: `(async () => {
        const alexBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex'));
        if (alexBtn) alexBtn.click();
        await new Promise(r => setTimeout(r, 300));
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 2500));

    await send('Runtime.evaluate', { expression: `window.location.href = '/dashboard'` });
    await new Promise(r => setTimeout(r, 2500));

    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const nav = document.querySelector('nav');
        const inner = nav.querySelector('div > div');
        const left = inner.children[0];
        const right = inner.children[1];
        const profile = right ? right.querySelector('[aria-label*="profile menu"]') : null;
        return {
          windowWidth: window.innerWidth,
          navScrollWidth: nav.scrollWidth,
          innerClientWidth: inner.clientWidth,
          leftRect: left ? left.getBoundingClientRect() : null,
          rightRect: right ? right.getBoundingClientRect() : null,
          profileRect: profile ? profile.getBoundingClientRect() : null
        };
      })()`,
      returnByValue: true
    });
    console.log(JSON.stringify(res.result.value, null, 2));
    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    p.kill();
    process.exit(0);
  }
}
main();
