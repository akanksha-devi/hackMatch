const { spawn } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function test() {
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9305',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'http://localhost:5173'
  ]);

  await new Promise(r => setTimeout(r, 2200));

  try {
    const tabs = await (await fetch('http://127.0.0.1:9305/json')).json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (method, params = {}) => new Promise(res => {
      const i = id++;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === i) {
          ws.removeEventListener('message', handler);
          res(d);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

    await send('Runtime.enable');
    await new Promise(r => setTimeout(r, 2000));

    const evalFn = async (expr) => {
      const res = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true
      });
      return res.result?.value;
    };

    const info0 = await evalFn(`(() => {
      const hero = document.querySelector('section.rounded-3xl');
      const pinned = hero ? hero.parentElement : null;
      const wrapper = pinned ? pinned.parentElement : null;
      return {
        scrollY: window.scrollY,
        heroRect: hero ? hero.getBoundingClientRect() : null,
        pinnedRect: pinned ? pinned.getBoundingClientRect() : null,
        pinnedStyle: pinned ? pinned.getAttribute('style') : null,
        wrapperRect: wrapper ? wrapper.getBoundingClientRect() : null,
        wrapperClass: wrapper ? wrapper.className : null
      };
    })()`);
    console.log('--- At Scroll 0 ---');
    console.log(JSON.stringify(info0, null, 2));

    await evalFn('window.scrollTo(0, 350)');
    await new Promise(r => setTimeout(r, 500));

    const info350 = await evalFn(`(() => {
      const hero = document.querySelector('section.rounded-3xl');
      const pinned = hero ? hero.parentElement : null;
      const wrapper = pinned ? pinned.parentElement : null;
      return {
        scrollY: window.scrollY,
        heroRect: hero ? hero.getBoundingClientRect() : null,
        pinnedRect: pinned ? pinned.getBoundingClientRect() : null,
        pinnedStyle: pinned ? pinned.getAttribute('style') : null,
        pinnedComputedPos: pinned ? window.getComputedStyle(pinned).position : null,
        pinnedComputedTop: pinned ? window.getComputedStyle(pinned).top : null,
        wrapperRect: wrapper ? wrapper.getBoundingClientRect() : null
      };
    })()`);
    console.log('--- At Scroll 350 ---');
    console.log(JSON.stringify(info350, null, 2));

    ws.close();
  } finally {
    proc.kill();
  }
}

test().catch(console.error);
