const { spawn } = require('child_process');

const edgeProc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=9304',
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:5173/login'
]);

setTimeout(async () => {
  try {
    const tabs = await (await fetch('http://127.0.0.1:9304/json')).json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = async () => {
      ws.send(JSON.stringify({ id: 1, method: 'Log.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({
        id: 3,
        method: 'Runtime.evaluate',
        params: {
          expression: `(async () => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex'));
            if (btn) btn.click();
            await new Promise(r => setTimeout(r, 200));
            const sub = document.querySelector('button[type="submit"]');
            if (sub) sub.click();
          })()`,
          awaitPromise: true
        }
      }));
    };

    const errors = [];
    ws.onmessage = (e) => {
      const resp = JSON.parse(e.data);
      if (resp.method === 'Runtime.consoleAPICalled') {
        console.log('[Console]', resp.params.type, resp.params.args.map(a => a.value || a.description).join(' '));
      }
      if (resp.method === 'Runtime.exceptionThrown') {
        console.error('[Exception]', resp.params.exceptionDetails);
        errors.push(resp.params.exceptionDetails);
      }
    };

    setTimeout(() => {
      console.log('Total exceptions:', errors.length);
      edgeProc.kill('SIGKILL');
      process.exit(0);
    }, 4000);
  } catch(e) {
    console.error(e);
    edgeProc.kill('SIGKILL');
    process.exit(1);
  }
}, 2000);
