const { spawn } = require('child_process');

const edgeProc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=9306',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1024,768',
  'http://localhost:5173/login'
]);

setTimeout(async () => {
  try {
    const tabs = await (await fetch('http://127.0.0.1:9306/json')).json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = async () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({
        id: 2,
        method: 'Runtime.evaluate',
        params: {
          expression: `(async () => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Alex'));
            if (btn) btn.click();
            await new Promise(r => setTimeout(r, 200));
            const sub = document.querySelector('button[type="submit"]');
            if (sub) sub.click();
            await new Promise(r => setTimeout(r, 1500));
            window.location.pathname = '/hackathons';
            await new Promise(r => setTimeout(r, 2000));

            const clientW = document.documentElement.clientWidth;
            const overflowing = [];
            document.querySelectorAll('*').forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.right > clientW + 2) {
                overflowing.push({
                  tag: el.tagName,
                  className: el.className,
                  right: rect.right,
                  width: rect.width,
                  text: (el.textContent || '').slice(0, 30)
                });
              }
            });
            return { clientW, scrollW: document.documentElement.scrollWidth, overflowing: overflowing.slice(0, 10) };
          })()`,
          returnByValue: true,
          awaitPromise: true
        }
      }));
    };

    ws.onmessage = (e) => {
      const resp = JSON.parse(e.data);
      if (resp.result?.result?.value) {
        console.log('Overflow at 1024px:', JSON.stringify(resp.result.result.value, null, 2));
        edgeProc.kill('SIGKILL');
        process.exit(0);
      }
    };
  } catch(e) {
    console.error(e);
    edgeProc.kill('SIGKILL');
    process.exit(1);
  }
}, 2000);
