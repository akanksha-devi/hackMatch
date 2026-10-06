const { spawn } = require('child_process');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9310',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'http://localhost:5173'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const tabs = await (await fetch('http://127.0.0.1:9310/json')).json();
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
    // Wait 1.5s for PageTransition and GSAP to settle
    await new Promise(r => setTimeout(r, 1500));

    const evalFn = async (expr) => {
      const res = await send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true
      });
      return res.result?.result?.value;
    };

    const diagnose = async (label) => {
      const val = await evalFn(`(() => {
        const triggers = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
        const hero = document.querySelector('section.rounded-3xl');
        const pinned = hero ? hero.parentElement : null;
        const wrapper = pinned ? pinned.parentElement : null;
        return {
          label: "${label}",
          scrollY: window.scrollY,
          triggersCount: triggers.length,
          triggers: triggers.map(t => ({
            start: t.start,
            end: t.end,
            pin: !!t.pin,
            isActive: t.isActive,
            progress: t.progress
          })),
          heroRect: hero ? { top: hero.getBoundingClientRect().top, height: hero.getBoundingClientRect().height } : null,
          pinnedRect: pinned ? { top: pinned.getBoundingClientRect().top, height: pinned.getBoundingClientRect().height } : null,
          pinnedStyle: pinned ? pinned.getAttribute('style') : null,
          wrapperRect: wrapper ? { top: wrapper.getBoundingClientRect().top, height: wrapper.getBoundingClientRect().height } : null
        };
      })()`);
      return val;
    };

    console.log('Scroll 0:', JSON.stringify(await diagnose('Scroll 0'), null, 2));

    const domPath = await evalFn(`(() => {
      const hero = document.querySelector('section.rounded-3xl');
      let curr = hero;
      const path = [];
      while (curr) {
        const cs = window.getComputedStyle(curr);
        path.push({
          tag: curr.tagName,
          className: (curr.className && typeof curr.className === 'string') ? curr.className.slice(0, 50) : '',
          transform: cs.transform,
          position: cs.position,
          overflow: cs.overflow,
          overflowX: cs.overflowX,
          overflowY: cs.overflowY
        });
        curr = curr.parentElement;
      }
      return path;
    })()`);
    console.log('DOM Path:', JSON.stringify(domPath, null, 2));

    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 350)' });
    await new Promise(r => setTimeout(r, 600));

    const propTrap = await evalFn(`(() => {
      const el = document.querySelector('div.w-full.transition-all');
      if (!el) return 'Not found';

      const originalClass = el.className;
      const originalStyle = el.getAttribute('style');

      const testDiv = document.createElement('div');
      const hero = document.querySelector('section.rounded-3xl');
      const pinned = hero ? hero.parentElement : null;
      if (!pinned) return 'No pinned element';

      // Test effect on pinned element itself!
      el.className = 'w-full';
      el.removeAttribute('style');

      const pinnedRectNow = pinned.getBoundingClientRect().top;
      const pinnedCompPos = window.getComputedStyle(pinned).position;
      const pinnedCompTop = window.getComputedStyle(pinned).top;

      return {
        pinnedRectNow,
        pinnedCompPos,
        pinnedCompTop
      };
    })()`);
    console.log('Prop trap test:', JSON.stringify(propTrap, null, 2));

    ws.close();
  } catch(e) {
    console.error('Error:', e);
  } finally {
    try { proc.kill(); } catch(e) {}
    process.exit(0);
  }
}

main();
