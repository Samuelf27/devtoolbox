// ===== Helpers =====
const $ = (s, ctx = document) => ctx.querySelector(s);
const el = (id) => document.getElementById(id);
function toast(msg = 'Copiado! ✓') {
  const t = el('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1500);
}
function copy(text) { navigator.clipboard.writeText(text).then(() => toast()); }
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// ===== Ferramentas =====
const TOOLS = [
  {
    id: 'json', icon: '{ }', name: 'JSON', title: 'Formatador / Validador JSON',
    desc: 'Formate, minifique e valide JSON com mensagens de erro claras.',
    render: () => `
      <div class="field"><label>Entrada</label><textarea id="jsonIn" placeholder='{"hello":"world"}'></textarea></div>
      <div class="btns">
        <button class="btn btn--primary" id="jsonFmt">Formatar</button>
        <button class="btn" id="jsonMin">Minificar</button>
        <button class="btn" id="jsonCopy">Copiar</button>
      </div>
      <div class="result" id="jsonOut">Resultado aparece aqui...</div>`,
    init: () => {
      const out = el('jsonOut');
      const parse = () => JSON.parse(el('jsonIn').value);
      const show = (txt, ok = true) => { out.textContent = txt; out.className = 'result ' + (ok ? 'result--ok' : 'result--err'); };
      el('jsonFmt').onclick = () => { try { show(JSON.stringify(parse(), null, 2)); } catch (e) { show('❌ ' + e.message, false); } };
      el('jsonMin').onclick = () => { try { show(JSON.stringify(parse())); } catch (e) { show('❌ ' + e.message, false); } };
      el('jsonCopy').onclick = () => copy(out.textContent);
    },
  },
  {
    id: 'base64', icon: '64', name: 'Base64', title: 'Base64 Encode / Decode',
    desc: 'Converta texto para Base64 e vice-versa (com suporte a UTF-8).',
    render: () => `
      <div class="field"><label>Texto</label><textarea id="b64In" placeholder="Digite o texto..."></textarea></div>
      <div class="btns">
        <button class="btn btn--primary" id="b64Enc">Codificar →</button>
        <button class="btn" id="b64Dec">← Decodificar</button>
        <button class="btn" id="b64Copy">Copiar</button>
      </div>
      <div class="result" id="b64Out"></div>`,
    init: () => {
      const out = el('b64Out');
      el('b64Enc').onclick = () => { try { out.textContent = btoa(unescape(encodeURIComponent(el('b64In').value))); out.className = 'result result--ok'; } catch (e) { out.textContent = '❌ ' + e.message; out.className = 'result result--err'; } };
      el('b64Dec').onclick = () => { try { out.textContent = decodeURIComponent(escape(atob(el('b64In').value))); out.className = 'result result--ok'; } catch (e) { out.textContent = '❌ Base64 inválido'; out.className = 'result result--err'; } };
      el('b64Copy').onclick = () => copy(out.textContent);
    },
  },
  {
    id: 'jwt', icon: '🔑', name: 'JWT', title: 'Decodificador de JWT',
    desc: 'Decodifique o header e o payload de um token JWT (sem verificar a assinatura).',
    render: () => `
      <div class="field"><label>Token JWT</label><textarea id="jwtIn" placeholder="eyJhbGci..."></textarea></div>
      <div class="btns"><button class="btn btn--primary" id="jwtDec">Decodificar</button></div>
      <div class="grid2">
        <div><label class="note">HEADER</label><div class="result" id="jwtHead"></div></div>
        <div><label class="note">PAYLOAD</label><div class="result" id="jwtPay"></div></div>
      </div>
      <p class="note">⚠️ Decodificação apenas — a assinatura não é verificada.</p>`,
    init: () => {
      const decode = (part) => JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(part.replace(/-/g, '+').replace(/_/g, '/'))))), null, 2);
      el('jwtDec').onclick = () => {
        const parts = el('jwtIn').value.trim().split('.');
        const h = el('jwtHead'), p = el('jwtPay');
        if (parts.length < 2) { h.textContent = p.textContent = '❌ JWT inválido'; h.className = p.className = 'result result--err'; return; }
        try { h.textContent = decode(parts[0]); p.textContent = decode(parts[1]); h.className = p.className = 'result result--ok'; }
        catch (e) { h.textContent = p.textContent = '❌ ' + e.message; h.className = p.className = 'result result--err'; }
      };
    },
  },
  {
    id: 'hash', icon: '#', name: 'Hash', title: 'Gerador de Hash (SHA)',
    desc: 'Gere hashes SHA-1, SHA-256 e SHA-512 com a Web Crypto API.',
    render: () => `
      <div class="field"><label>Texto</label><textarea id="hashIn" placeholder="Digite o texto..."></textarea></div>
      <div class="field"><label>Algoritmo</label>
        <select id="hashAlg"><option>SHA-256</option><option>SHA-1</option><option>SHA-512</option></select></div>
      <div class="btns"><button class="btn btn--primary" id="hashGo">Gerar hash</button><button class="btn" id="hashCopy">Copiar</button></div>
      <div class="result" id="hashOut"></div>`,
    init: () => {
      const out = el('hashOut');
      el('hashGo').onclick = async () => {
        const data = new TextEncoder().encode(el('hashIn').value);
        const buf = await crypto.subtle.digest(el('hashAlg').value, data);
        out.textContent = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
        out.className = 'result result--ok';
      };
      el('hashCopy').onclick = () => copy(out.textContent);
    },
  },
  {
    id: 'uuid', icon: '🆔', name: 'UUID', title: 'Gerador de UUID v4',
    desc: 'Gere identificadores únicos (UUID v4) com crypto.randomUUID().',
    render: () => `
      <div class="field"><label>Quantidade</label><input id="uuidQty" type="number" value="5" min="1" max="100" /></div>
      <div class="btns"><button class="btn btn--primary" id="uuidGo">Gerar</button><button class="btn" id="uuidCopy">Copiar tudo</button></div>
      <div class="result" id="uuidOut"></div>`,
    init: () => {
      const out = el('uuidOut');
      const gen = () => { const n = Math.min(100, Math.max(1, +el('uuidQty').value || 1)); out.textContent = Array.from({ length: n }, () => crypto.randomUUID()).join('\n'); out.className = 'result result--ok'; };
      el('uuidGo').onclick = gen; el('uuidCopy').onclick = () => copy(out.textContent); gen();
    },
  },
  {
    id: 'timestamp', icon: '🕐', name: 'Timestamp', title: 'Conversor de Timestamp',
    desc: 'Converta entre Unix timestamp e data legível (e vice-versa).',
    render: () => `
      <div class="field"><label>Unix timestamp (segundos)</label><input id="tsUnix" placeholder="ex.: 1700000000" /></div>
      <div class="btns"><button class="btn btn--primary" id="tsToDate">→ Data</button><button class="btn" id="tsNow">Agora</button></div>
      <div class="result" id="tsOut"></div>`,
    init: () => {
      const out = el('tsOut');
      el('tsToDate').onclick = () => {
        const n = Number(el('tsUnix').value);
        if (Number.isNaN(n)) { out.textContent = '❌ Número inválido'; out.className = 'result result--err'; return; }
        const d = new Date(n * 1000);
        out.textContent = `Local:  ${d.toLocaleString('pt-BR')}\nISO:    ${d.toISOString()}\nUTC:    ${d.toUTCString()}`;
        out.className = 'result result--ok';
      };
      el('tsNow').onclick = () => { const n = Math.floor(Date.now() / 1000); el('tsUnix').value = n; el('tsToDate').click(); };
    },
  },
  {
    id: 'url', icon: '%', name: 'URL', title: 'URL Encode / Decode',
    desc: 'Codifique e decodifique componentes de URL.',
    render: () => `
      <div class="field"><label>Texto</label><textarea id="urlIn" placeholder="https://exemplo.com/?q=olá mundo"></textarea></div>
      <div class="btns"><button class="btn btn--primary" id="urlEnc">Codificar</button><button class="btn" id="urlDec">Decodificar</button><button class="btn" id="urlCopy">Copiar</button></div>
      <div class="result" id="urlOut"></div>`,
    init: () => {
      const out = el('urlOut');
      el('urlEnc').onclick = () => { out.textContent = encodeURIComponent(el('urlIn').value); out.className = 'result result--ok'; };
      el('urlDec').onclick = () => { try { out.textContent = decodeURIComponent(el('urlIn').value); out.className = 'result result--ok'; } catch { out.textContent = '❌ Sequência inválida'; out.className = 'result result--err'; } };
      el('urlCopy').onclick = () => copy(out.textContent);
    },
  },
  {
    id: 'color', icon: '🎨', name: 'Cor', title: 'Conversor de Cores',
    desc: 'Converta entre HEX, RGB e HSL.',
    render: () => `
      <div class="field"><label>Cor HEX</label><input id="colorIn" value="#2f81f7" /></div>
      <div class="btns"><button class="btn btn--primary" id="colorGo">Converter</button></div>
      <div class="result" id="colorOut"></div>
      <div class="swatch" id="swatch"></div>`,
    init: () => {
      const out = el('colorOut'), sw = el('swatch');
      const conv = () => {
        const hex = el('colorIn').value.trim().replace('#', '');
        if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) { out.textContent = '❌ HEX inválido'; out.className = 'result result--err'; return; }
        const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
        const r = parseInt(full.slice(0, 2), 16), g = parseInt(full.slice(2, 4), 16), b = parseInt(full.slice(4, 6), 16);
        const r1 = r / 255, g1 = g / 255, b1 = b / 255, mx = Math.max(r1, g1, b1), mn = Math.min(r1, g1, b1);
        let h = 0, s = 0, l = (mx + mn) / 2;
        if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
          h = mx === r1 ? (g1 - b1) / d + (g1 < b1 ? 6 : 0) : mx === g1 ? (b1 - r1) / d + 2 : (r1 - g1) / d + 4; h *= 60; }
        out.textContent = `HEX:  #${full}\nRGB:  rgb(${r}, ${g}, ${b})\nHSL:  hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
        out.className = 'result result--ok';
        sw.style.background = '#' + full;
      };
      el('colorGo').onclick = conv; conv();
    },
  },
  {
    id: 'lorem', icon: '¶', name: 'Lorem', title: 'Gerador de Lorem Ipsum',
    desc: 'Gere parágrafos de texto fictício para protótipos.',
    render: () => `
      <div class="field"><label>Parágrafos</label><input id="loremQty" type="number" value="3" min="1" max="20" /></div>
      <div class="btns"><button class="btn btn--primary" id="loremGo">Gerar</button><button class="btn" id="loremCopy">Copiar</button></div>
      <div class="result" id="loremOut"></div>`,
    init: () => {
      const W = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat'.split(' ');
      const out = el('loremOut');
      const sentence = () => { const n = 8 + Math.floor(Math.random() * 8); const s = Array.from({ length: n }, () => W[Math.floor(Math.random() * W.length)]).join(' '); return s[0].toUpperCase() + s.slice(1) + '.'; };
      const gen = () => { const n = Math.min(20, Math.max(1, +el('loremQty').value || 1)); out.textContent = Array.from({ length: n }, () => Array.from({ length: 3 + Math.floor(Math.random() * 3) }, sentence).join(' ')).join('\n\n'); out.className = 'result result--ok'; };
      el('loremGo').onclick = gen; el('loremCopy').onclick = () => copy(out.textContent); gen();
    },
  },
];

// ===== Render & navegação =====
const menu = el('menu'), tools = el('tools');
menu.innerHTML = TOOLS.map((t, i) => `<button data-i="${i}"><span style="font-family:'JetBrains Mono',monospace">${t.icon}</span> ${t.name}</button>`).join('');

function open(i) {
  const t = TOOLS[i];
  tools.innerHTML = `<section class="tool"><div class="tool__head"><h1>${t.icon ? `<span>${t.icon}</span>` : ''} ${t.title}</h1><p>${t.desc}</p></div>${t.render()}</section>`;
  t.init();
  menu.querySelectorAll('button').forEach(b => b.classList.toggle('active', +b.dataset.i === i));
  $('.sidebar')?.classList.remove('open');
  location.hash = t.id;
}

menu.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) open(+b.dataset.i); });
el('menuToggle').onclick = () => $('.sidebar').classList.toggle('open');

// Abre a ferramenta da hash da URL, ou a primeira
const startIdx = Math.max(0, TOOLS.findIndex(t => t.id === location.hash.slice(1)));
open(startIdx);
