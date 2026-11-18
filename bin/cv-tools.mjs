// Dependency-free CV helpers: text extraction (PDF/DOCX/text), quality checks and multi-format rendering.
// Extraction is best-effort and heuristic: the owner must still confirm every parsed fact.
import zlib from 'node:zlib';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] !== '#') return ENTITIES[e.toLowerCase()] ?? m;
    const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    try { return String.fromCodePoint(code); } catch { return '\uFFFD'; }
  });
}
export const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escapeXml = s => escapeHtml(String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''));
const LIMIT = 50 * 1024 * 1024;

// ---------------------------------------------------------------- PDF text
function inflate(buf) {
  const opts = { maxOutputLength: LIMIT };
  for (const fn of [b => zlib.inflateSync(b, opts), b => zlib.inflateSync(b, { ...opts, finishFlush: zlib.constants.Z_SYNC_FLUSH }), b => zlib.inflateRawSync(b, opts)]) {
    try { return fn(buf); } catch { /* try next */ }
  }
  return null;
}
function readObjects(buf) {
  const src = buf.toString('latin1');
  const objects = new Map();
  const head = /(\d+)\s+\d+\s+obj\b/g;
  let m;
  while ((m = head.exec(src))) {
    const start = m.index + m[0].length;
    const endobj = src.indexOf('endobj', start);
    if (endobj < 0) break;
    const sm = /\bstream\r?\n/g; sm.lastIndex = start;
    const found = sm.exec(src);
    if (found && found.index < endobj) {
      const dict = src.slice(start, found.index);
      const dataStart = found.index + found[0].length;
      const length = dict.match(/\/Length\s+(\d+)(?![\d\s]*R)/);
      let dataEnd = length ? dataStart + Number(length[1]) : -1;
      if (dataEnd < dataStart || src.indexOf('endstream', dataEnd) < 0) dataEnd = src.indexOf('endstream', dataStart);
      if (dataEnd < 0) break;
      const raw = buf.subarray(dataStart, dataEnd);
      const stream = /\/FlateDecode/.test(dict) ? inflate(raw) : /\/Filter/.test(dict) ? null : raw;
      objects.set(Number(m[1]), { dict, stream });
      const end = src.indexOf('endobj', dataEnd);
      head.lastIndex = end < 0 ? src.length : end;
    } else {
      objects.set(Number(m[1]), { dict: src.slice(start, endobj), stream: null });
      head.lastIndex = endobj;
    }
  }
  for (const o of [...objects.values()]) {
    if (!/\/Type\s*\/ObjStm/.test(o.dict) || !o.stream) continue;
    const n = Number(o.dict.match(/\/N\s+(\d+)/)?.[1] || 0), first = Number(o.dict.match(/\/First\s+(\d+)/)?.[1] || 0);
    const text = o.stream.toString('latin1');
    const nums = text.slice(0, first).trim().split(/\s+/).map(Number);
    for (let i = 0; i < n; i++) {
      const id = nums[2 * i], off = nums[2 * i + 1], next = i + 1 < n ? nums[2 * i + 3] : text.length - first;
      if (Number.isFinite(id) && !objects.has(id)) objects.set(id, { dict: text.slice(first + off, first + next), stream: null });
    }
  }
  return objects;
}
const utf16 = hex => { let h = hex; if (h.length % 4) h = h.padStart(Math.ceil(h.length / 4) * 4, '0'); let s = ''; for (let i = 0; i + 3 < h.length; i += 4) s += String.fromCharCode(parseInt(h.slice(i, i + 4), 16)); return s; };
function parseCMap(text) {
  const map = new Map();
  const cs = text.match(/begincodespacerange\s*<([0-9a-fA-F]+)>/);
  const bytes = cs ? Math.max(1, cs[1].length / 2) : 1;
  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g))
    for (const e of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]*)>/g)) map.set(parseInt(e[1], 16), utf16(e[2]));
  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g))
    for (const e of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*(?:<([0-9a-fA-F]+)>|\[([^\]]*)\])/g)) {
      const lo = parseInt(e[1], 16), hi = parseInt(e[2], 16);
      if (hi < lo || hi - lo > 65535) continue;
      if (e[3] !== undefined) {
        const base = e[3].length < 4 ? e[3].padStart(4, '0') : e[3];
        const prefix = base.slice(0, -4), last = parseInt(base.slice(-4), 16);
        for (let c = lo; c <= hi; c++) map.set(c, utf16(prefix + (last + c - lo).toString(16).padStart(4, '0')));
      } else [...e[4].matchAll(/<([0-9a-fA-F]*)>/g)].forEach((x, i) => map.set(lo + i, utf16(x[1])));
    }
  return { map, bytes };
}
const WIN = { 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—', 0x85: '…', 0x80: '€' };
function decodeBytes(bytes, cmap) {
  if (!cmap) return bytes.map(b => WIN[b] ?? String.fromCharCode(b)).join('');
  let s = '';
  for (let i = 0; i + cmap.bytes <= bytes.length; i += cmap.bytes) {
    let code = 0; for (let k = 0; k < cmap.bytes; k++) code = code * 256 + bytes[i + k];
    s += cmap.map.get(code) ?? '\uFFFD';
  }
  return s;
}
const DELIM = /[\s/[\]()<>{}%]/;
function* tokens(s) {
  let i = 0; const n = s.length;
  while (i < n) {
    const c = s[i];
    if (/\s/.test(c) || c === '\0') { i++; continue; }
    if (c === '%') { while (i < n && s[i] !== '\n' && s[i] !== '\r') i++; continue; }
    if (c === '(') {
      let depth = 1; const out = []; i++;
      while (i < n) {
        const ch = s[i++];
        if (ch === '\\') {
          const e = s[i++]; const esc = { n: 10, r: 13, t: 9, b: 8, f: 12 };
          if (e in esc) out.push(esc[e]);
          else if (/[0-7]/.test(e)) { let o = e; while (o.length < 3 && /[0-7]/.test(s[i])) o += s[i++]; out.push(parseInt(o, 8) & 255); }
          else if (e === '\r') { if (s[i] === '\n') i++; }
          else if (e !== '\n' && e !== undefined) out.push(e.charCodeAt(0));
          continue;
        }
        if (ch === '(') depth++;
        else if (ch === ')' && --depth === 0) break;
        out.push(ch.charCodeAt(0));
      }
      yield { t: 'str', v: out }; continue;
    }
    if (c === '<' && s[i + 1] === '<') { i += 2; continue; }
    if (c === '>' && s[i + 1] === '>') { i += 2; continue; }
    if (c === '<') {
      const end = s.indexOf('>', i);
      let hex = s.slice(i + 1, end < 0 ? n : end).replace(/[^0-9a-fA-F]/g, '');
      if (hex.length % 2) hex += '0';
      const out = []; for (let k = 0; k < hex.length; k += 2) out.push(parseInt(hex.slice(k, k + 2), 16));
      i = end < 0 ? n : end + 1; yield { t: 'str', v: out }; continue;
    }
    if (c === '[' || c === ']') { i++; yield { t: c }; continue; }
    if (c === '{' || c === '}' || c === '>') { i++; continue; }
    if (c === '/') { let j = i + 1; while (j < n && !DELIM.test(s[j])) j++; yield { t: 'name', v: s.slice(i + 1, j) }; i = j; continue; }
    let j = i; while (j < n && !DELIM.test(s[j])) j++;
    if (j === i) { i++; continue; }
    const word = s.slice(i, j); i = j;
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(word)) yield { t: 'num', v: parseFloat(word) };
    else if (word === 'ID') { const e = s.indexOf('EI', i); i = e < 0 ? n : e + 2; }
    else yield { t: 'op', v: word };
  }
}
export function extractPdfText(buf) {
  if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') throw new Error('Not a PDF file');
  const objects = readObjects(buf);
  const trailerish = buf.toString('latin1', Math.max(0, buf.length - 4096));
  const encrypted = /\/Encrypt\s+\d+\s+\d+\s+R/.test(trailerish) || [...objects.values()].some(o => /\/Encrypt\s+\d+\s+\d+\s+R/.test(o.dict));
  const names = { font: new Map(), xobject: new Map() };
  for (const o of objects.values()) for (const [kind, key] of [['font', 'Font'], ['xobject', 'XObject']]) {
    for (const fm of o.dict.matchAll(new RegExp(`/${key}\\s*(?:<<([^<>]*)>>|(\\d+)\\s+\\d+\\s+R)`, 'g'))) {
      const inner = fm[1] ?? objects.get(Number(fm[2]))?.dict ?? '';
      for (const e of inner.matchAll(/\/([^\s/<>[\]()]+)\s+(\d+)\s+\d+\s+R/g)) if (!names[kind].has(e[1])) names[kind].set(e[1], Number(e[2]));
    }
  }
  const cmaps = new Map();
  const cmapFor = name => {
    const id = names.font.get(name);
    if (id === undefined) return null;
    if (!cmaps.has(id)) {
      const ref = objects.get(id)?.dict.match(/\/ToUnicode\s+(\d+)\s+\d+\s+R/);
      const stream = ref && objects.get(Number(ref[1]))?.stream;
      cmaps.set(id, stream ? parseCMap(stream.toString('latin1')) : null);
    }
    return cmaps.get(id);
  };
  let out = '';
  const space = () => { if (out && !/\s$/.test(out)) out += ' '; };
  const newline = () => { out = out.replace(/ +$/, ''); if (out && !out.endsWith('\n')) out += '\n'; };
  const visited = new Set();
  const run = (stream, depth) => {
    let stack = [], arr = null, font = null, lastY = null;
    for (const tk of tokens(stream.toString('latin1'))) {
      if (tk.t === '[') { arr = []; continue; }
      if (tk.t === ']') { stack.push({ t: 'arr', v: arr || [] }); arr = null; continue; }
      if (arr) { arr.push(tk); continue; }
      if (tk.t !== 'op') { stack.push(tk); continue; }
      const top = stack[stack.length - 1];
      switch (tk.v) {
        case 'Tf': font = cmapFor(stack[stack.length - 2]?.v); break;
        case 'Tj': if (top?.t === 'str') out += decodeBytes(top.v, font); break;
        case "'": case '"': newline(); if (top?.t === 'str') out += decodeBytes(top.v, font); break;
        case 'TJ': if (top?.t === 'arr') for (const e of top.v) { if (e.t === 'str') out += decodeBytes(e.v, font); else if (e.t === 'num' && e.v < -250) space(); } break;
        case 'Td': case 'TD': { const ty = Number(top?.v) || 0; if (Math.abs(ty) > 0.5) newline(); break; } // same-line moves are glyph positioning; real gaps come from space glyphs/TJ
        case 'T*': newline(); break;
        case 'Tm': { const y = Number(top?.v); if (lastY !== null && Math.abs(y - lastY) > 0.5) newline(); else space(); lastY = y; break; }
        case 'ET': space(); break;
        case 'Do': {
          const id = names.xobject.get(top?.v); const x = id !== undefined && objects.get(id);
          if (x && /\/Subtype\s*\/Form/.test(x.dict) && x.stream && depth < 5 && !visited.has(id)) { visited.add(id); run(x.stream, depth + 1); newline(); }
          break;
        }
      }
      stack = [];
    }
    newline();
  };
  const pages = [...objects.values()].filter(o => /\/Type\s*\/Page(?![s\w])/.test(o.dict));
  const contentIds = [];
  for (const p of pages) {
    const c = p.dict.match(/\/Contents\s*(?:(\d+)\s+\d+\s+R|\[([^\]]*)\])/);
    if (c?.[1]) contentIds.push(Number(c[1]));
    else if (c?.[2]) for (const r of c[2].matchAll(/(\d+)\s+\d+\s+R/g)) contentIds.push(Number(r[1]));
  }
  const streams = contentIds.length ? contentIds.map(id => objects.get(id)?.stream).filter(Boolean)
    : [...objects.values()].filter(o => o.stream && !/\/Subtype/.test(o.dict) && /\bBT\b/.test(o.stream.toString('latin1'))).map(o => o.stream);
  for (const s of streams) run(s, 0);
  const images = [...objects.values()].filter(o => /\/Subtype\s*\/Image/.test(o.dict)).length;
  return { text: out.replace(/ {2,}/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(), pages: pages.length, images, encrypted };
}

// ---------------------------------------------------------------- ZIP / DOCX
export function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Not a ZIP/DOCX container');
  const count = buf.readUInt16LE(eocd + 10); let p = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let k = 0; k < count; k++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) throw new Error('Corrupt ZIP directory');
    const nlen = buf.readUInt16LE(p + 28);
    entries.set(buf.toString('utf8', p + 46, p + 46 + nlen), { method: buf.readUInt16LE(p + 10), csize: buf.readUInt32LE(p + 20), local: buf.readUInt32LE(p + 42) });
    p += 46 + nlen + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
  }
  return {
    names: [...entries.keys()],
    get(name) {
      const e = entries.get(name); if (!e) return null;
      const start = e.local + 30 + buf.readUInt16LE(e.local + 26) + buf.readUInt16LE(e.local + 28);
      const data = buf.subarray(start, start + e.csize);
      if (e.method === 0) return data;
      if (e.method === 8) return zlib.inflateRawSync(data, { maxOutputLength: LIMIT });
      throw new Error('Unsupported ZIP compression');
    },
  };
}
export function docxToText(buf) {
  const xml = readZip(buf).get('word/document.xml');
  if (!xml) throw new Error('DOCX has no word/document.xml');
  const s = xml.toString('utf8').replace(/<w:tab\/>/g, '\t').replace(/<w:br[^>]*\/>/g, '\n').replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '');
  return decodeEntities(s).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = b => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
export function writeZip(files) {
  const locals = [], centrals = []; let offset = 0;
  for (const { name, data } of files) {
    const n = Buffer.from(name, 'utf8'), body = zlib.deflateRawSync(data), crc = crc32(data);
    const l = Buffer.alloc(30); l.writeUInt32LE(0x04034b50, 0); l.writeUInt16LE(20, 4); l.writeUInt16LE(0x0800, 6); l.writeUInt16LE(8, 8); l.writeUInt32LE(0x00210000, 10);
    l.writeUInt32LE(crc, 14); l.writeUInt32LE(body.length, 18); l.writeUInt32LE(data.length, 22); l.writeUInt16LE(n.length, 26);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(8, 10); c.writeUInt32LE(0x00210000, 12);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(body.length, 20); c.writeUInt32LE(data.length, 24); c.writeUInt16LE(n.length, 28); c.writeUInt32LE(offset, 42);
    locals.push(l, n, body); centrals.push(c, n); offset += 30 + n.length + body.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

// ---------------------------------------------------------------- quality
export function assessText(text) {
  const nonSpace = text.replace(/\s/g, '');
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’.+#-]*/gu) || [];
  const letters = (nonSpace.match(/[\p{L}\p{N}\p{M}]/gu) || []).length;
  const bad = (text.match(/[\uFFFD\u0000-\u0008\u000E-\u001F]/g) || []).length;
  const latin = words.filter(w => /^[A-Za-z]{3,}$/.test(w));
  const vowelless = latin.filter(w => !/[aeiouyAEIOUY]/.test(w)).length;
  const metrics = { words: words.length, letter_ratio: nonSpace.length ? +(letters / nonSpace.length).toFixed(3) : 0, bad_char_ratio: nonSpace.length ? +(bad / nonSpace.length).toFixed(3) : 0, vowelless_ratio: latin.length ? +(vowelless / latin.length).toFixed(3) : 0 };
  let quality = 'readable';
  if (metrics.words < 50) quality = 'unreadable';
  else if (metrics.bad_char_ratio > 0.02 || metrics.letter_ratio < 0.6 || (latin.length >= 20 && metrics.vowelless_ratio > 0.35)) quality = 'garbled';
  return { quality, ...metrics };
}
export function contactCandidates(text) {
  const urls = [...new Set(text.match(/\bhttps?:\/\/[^\s<>()"']+|\b(?:www\.)?(?:linkedin\.com|github\.com)\/[^\s<>()"']+/gi) || [])].map(u => (/^https?:/i.test(u) ? u : `https://${u}`).replace(/[.,;]+$/, ''));
  return {
    email: text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? '',
    phone_raw: text.match(/\+?\d[\d\s().-]{7,}\d/)?.[0]?.trim() ?? '',
    linkedin_url: urls.find(u => /linkedin\.com\/in\//i.test(u)) ?? '',
    github_url: urls.find(u => /github\.com\//i.test(u)) ?? '',
    other_urls: urls.filter(u => !/linkedin\.com|github\.com/i.test(u)),
  };
}

// ---------------------------------------------------------------- rendering
export function htmlToBlocks(html) {
  const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html).replace(/<(script|style|head|title)\b[\s\S]*?<\/\1>/gi, '');
  const blocks = [];
  for (const m of body.matchAll(/<(h1|h2|h3|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const text = decodeEntities(m[2].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t\r\f\v]+/g, ' ').replace(/ *\n */g, '\n').trim();
    if (text) for (const line of text.split('\n')) if (line) blocks.push({ type: m[1].toLowerCase(), text: line });
  }
  return blocks;
}
export function blocksToText(blocks) {
  const lines = blocks.map(b => b.type === 'h2' ? `\n${b.text.toUpperCase()}` : b.type === 'h3' ? `\n${b.text}` : b.type === 'li' ? `- ${b.text}` : b.text);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
export function blocksToDocx(blocks) {
  const rpr = b => `<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>${/^h/.test(b.type) ? '<w:b/>' : ''}<w:sz w:val="${b.type === 'h1' ? 36 : b.type === 'h2' ? 26 : 22}"/></w:rPr>`;
  const para = b => `<w:p><w:pPr><w:spacing w:before="${b.type === 'h2' ? 240 : 40}" w:after="60"/>${b.type === 'li' ? '<w:ind w:left="360" w:hanging="220"/>' : ''}</w:pPr><w:r>${rpr(b)}<w:t xml:space="preserve">${escapeXml(b.type === 'li' ? `• ${b.text}` : b.text)}</w:t></w:r></w:p>`;
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${blocks.map(para).join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1020" w:right="1020" w:bottom="1020" w:left="1020" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  return writeZip([
    { name: '[Content_Types].xml', data: Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
    { name: '_rels/.rels', data: Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
    { name: 'word/document.xml', data: Buffer.from(doc, 'utf8') },
  ]);
}
export function htmlToWordDoc(html) {
  const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html).replace(/<script\b[\s\S]*?<\/script>/gi, '');
  const title = escapeHtml(decodeEntities(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? 'Resume'));
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Job Hunter OS"><title>${title}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>@page WordSection1 { size: 595.3pt 841.9pt; margin: 51pt; } div.WordSection1 { page: WordSection1; } body { font-family: Arial, sans-serif; font-size: 11pt; } h1 { font-size: 18pt; } h2 { font-size: 13pt; border-bottom: 1px solid #777777; } h3 { font-size: 11pt; } a { color: #000000; text-decoration: none; }</style></head>
<body><div class="WordSection1">${body}</div></body></html>
`;
}
const UNSAFE_HTML = /<script\b|<iframe\b|<object\b|<embed\b|<link\b|<form\b|\son[a-z]+\s*=|javascript:|@import|url\(\s*['"]?(?:https?:)?\/\/|<img\b[^>]*\ssrc\s*=\s*['"]?(?:https?:)?\/\//i;
export function htmlProblems(html) {
  const problems = [];
  if (UNSAFE_HTML.test(html)) problems.push('scripts, forms, remote resources or event handlers are not allowed');
  if (/\{\{[A-Z_]+\}\}/.test(html)) problems.push('unfilled template slots remain');
  if (/example\.com|replace-with|your-handle|lorem ipsum/i.test(html)) problems.push('placeholder/example content remains');
  return problems;
}
export const documentKind = html => /<meta\s+name="job-hunter-document"\s+content="cover_letter"/i.test(html) ? 'cover_letter' : 'resume';
export const slug = s => String(s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
export const wordCount = s => (String(s).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;

const month = d => { if (!d) return 'Present'; const [y, m] = String(d).split('-'); return m ? `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m) - 1] ?? m} ${y}` : y; };
const removeSection = (html, slot) => html.replace(new RegExp(`\\s*<section><h2>[^<]*</h2>(?:<p>)?\\{\\{${slot}\\}\\}(?:</p>)?</section>`), '');
export function fillResumeTemplate(template, d) {
  const e = escapeHtml;
  const name = d.full_name || `${d.first_name} ${d.last_name}`;
  const location = [d.city, d.country].filter(Boolean).join(', ');
  const contact = [d.email, `${d.phone_country_code} ${d.phone_national}`.trim(), location].filter(Boolean).map(e).join(' · ');
  const links = [d.linkedin_url, d.github_url, d.portfolio_url].filter(Boolean).map(u => `<a href="${e(u)}">${e(u.replace(/^https:\/\//, ''))}</a>`).join(' · ');
  const skills = (d.skills_order?.length ? d.skills_order : Object.keys(d.skills_with_years || {})).map(e).join(' · ');
  const experience = (d.work_history || []).map(w => `<h3>${e(w.title)} — ${e(w.employer)}</h3><p>${[w.location, `${month(w.start_date)} – ${w.current ? 'Present' : month(w.end_date)}`].filter(Boolean).map(e).join(' · ')}</p>${w.bullets?.length ? `<ul>${w.bullets.map(b => `<li>${e(b)}</li>`).join('')}</ul>` : ''}`).join('');
  const projects = (d.projects || []).map(p => `<h3>${e(p.name)}${p.url ? ` — ${e(p.url.replace(/^https:\/\//, ''))}` : ''}</h3>${p.bullets?.length ? `<ul>${p.bullets.map(b => `<li>${e(b)}</li>`).join('')}</ul>` : ''}`).join('');
  const education = (d.education || []).map(x => `<h3>${e([x.degree, x.field_of_study].filter(Boolean).join(', '))} — ${e(x.institution)}</h3>${x.start_date || x.end_date ? `<p>${e([x.start_date, x.end_date].filter(Boolean).map(month).join(' – '))}</p>` : ''}`).join('');
  let html = template;
  for (const [slot, value] of [['SUMMARY_TEXT', d.summary ? e(d.summary) : ''], ['SKILLS_TEXT', skills], ['EXPERIENCE_HTML', experience], ['PROJECTS_HTML', projects], ['EDUCATION_HTML', education]]) if (!value) html = removeSection(html, slot);
  if (!links) html = html.replace(/<p>\{\{VERIFIED_LINKS_HTML\}\}<\/p>/, '');
  const values = { FULL_NAME: e(name), CONTACT_TEXT: contact, VERIFIED_LINKS_HTML: links, SUMMARY_TEXT: d.summary ? e(d.summary) : '', SKILLS_TEXT: skills, EXPERIENCE_HTML: experience, PROJECTS_HTML: projects, EDUCATION_HTML: education };
  return html.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => values[k] ?? m);
}
export function coverLetterProblems(d) {
  const problems = [];
  if (d.owner_approved !== true) problems.push('owner_approved must be true: show the exact letter in chat and get approval first');
  for (const k of ['full_name', 'contact_text']) if (typeof d[k] !== 'string' || !d[k].trim()) problems.push(`missing ${k}`);
  if (!d.target?.company || !d.target?.role) problems.push('target.company and target.role are required');
  if (!Array.isArray(d.paragraphs) || d.paragraphs.length < 2 || d.paragraphs.length > 6 || d.paragraphs.some(p => typeof p !== 'string' || !p.trim())) problems.push('paragraphs must be 2-6 non-empty strings');
  else { const words = wordCount(d.paragraphs.join(' ')); if (words < 80 || words > 250) problems.push(`cover letter body must be 80-250 words (got ${words}); aim for about 200`); }
  if (/example\.com|replace-with|your-handle|lorem ipsum|\{\{/i.test(JSON.stringify(d))) problems.push('placeholder/example content remains');
  return problems;
}
export function fillCoverLetterTemplate(template, d) {
  const e = escapeHtml;
  const values = {
    FULL_NAME: e(d.full_name), CONTACT_TEXT: e(d.contact_text), DATE_TEXT: e(d.date_text || new Date().toISOString().slice(0, 10)),
    RECIPIENT_TEXT: e(d.recipient || `Hiring Team, ${d.target.company}`), SUBJECT_TEXT: e(`Application for ${d.target.role}`),
    BODY_HTML: d.paragraphs.map(p => `<p>${e(p.trim())}</p>`).join(''), SIGNOFF_TEXT: e(d.sign_off || 'Kind regards,'),
  };
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => values[k] ?? m);
}
