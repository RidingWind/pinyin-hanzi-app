// 生成 hanzi-strokes.js：从 data.js 提取所有汉字，抓取 hanzi-writer 笔画数据并打包
const fs = require('fs');
const path = require('path');

const dataSrc = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');

// 提取所有 c:'X' 的汉字 + 拼音练习里 ['字','拼音'] 的字
const chars = new Set();
for (const m of dataSrc.matchAll(/c:'([^'])'/g)) chars.add(m[1]);
for (const m of dataSrc.matchAll(/\['([^'])','[^']+'\]/g)) chars.add(m[1]);
// tone rows & pinyin tables 里代表字
for (const m of dataSrc.matchAll(/\['([一-龥])','[^']*'\]/g)) chars.add(m[1]);

const list = [...chars].filter(c => /[\u4e00-\u9fff]/.test(c));
console.log(`需要 ${list.length} 个汉字的笔画数据`);

(async () => {
  const out = {};
  let fail = [];
  const CONC = 8;
  for (let i = 0; i < list.length; i += CONC) {
    const batch = list.slice(i, i + CONC);
    await Promise.all(batch.map(async ch => {
      try {
        const res = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(ch)}.json`);
        if (!res.ok) throw new Error(res.status);
        const j = await res.json();
        if (!j.strokes || !j.medians) throw new Error('bad data');
        out[ch] = j;
      } catch (e) { fail.push(ch + ':' + e.message); }
    }));
    process.stdout.write(`\r${Math.min(i + CONC, list.length)}/${list.length}`);
  }
  console.log('');
  if (fail.length) console.log('失败:', fail.join(', '));
  fs.writeFileSync(path.join(__dirname, 'hanzi-strokes.js'),
    '/* 本地笔画数据库（来源 hanzi-writer-data，MIT） */\nwindow.HANZI_DATA = ' + JSON.stringify(out) + ';\n');
  console.log('已写出 hanzi-strokes.js，', Object.keys(out).length, '字');
})();
