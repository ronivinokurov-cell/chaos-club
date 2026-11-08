const fs = require('fs');
const css = fs.readFileSync('src/styles.css', 'utf8');
const files = ['core.js','games-common.js','games-brain.js','games-party.js','games-music.js','games-create.js','games-speed.js','games-words.js','games-numbers.js','games-geo.js','games-science.js','games-sport.js','games-food.js','games-cook2.js','games-cook2-recipes.js','games-board.js','games-table.js','games-history.js','games-screen.js','games-logic.js','games-luck.js','games-extra.js'];
const js = files.map(f => `/* ===== ${f} ===== */\n` + fs.readFileSync('src/' + f, 'utf8')).join('\n\n');
const catCount = (fs.readFileSync('src/core.js','utf8').match(/const CATS = \[([\s\S]*?)\n\];/)[1].match(/\{ id: '/g) || []).length;
const gameCount = (js.match(/registerGame\(\{|quizGame\(\{|registerGame\(Object\.assign/g) || []).length;
const html = `<!DOCTYPE html>
<html lang="he" dir="rtl" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>CHAOS CLUB</title>
<meta name="description" content="CHAOS CLUB — משחקים לכל המשפחה">
<meta name="theme-color" content="#08080f">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CHAOS CLUB">
<meta property="og:title" content="CHAOS CLUB">
<meta property="og:description" content="מוח וחידות, משחקי חברה, מוזיקה, יצירתיות, מהירות, סדנת בישול ועוד אינטראקטיביים, ניקוד, מטבעות וחנות. לחיצה אחת ומתחילים.">
<meta property="og:locale" content="he_IL">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="CHAOS CLUB">
<meta name="twitter:description" content="משחקים לכל המשפחה — ניקוד, מטבעות וחנות, ישר בדפדפן.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎮</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<div id="boot" style="font-family:Heebo,system-ui,sans-serif;color:#fff;background:#0b0b14;min-height:100vh;display:flex;align-items:center;justify-content:center;font-size:17px;text-align:center;padding:24px">טוען את CHAOS CLUB…</div>
<script>window.addEventListener('error',function(e){var b=document.getElementById('boot');if(b){b.style.color='#ff8080';b.textContent='שגיאה בטעינה: '+(e.message||'unknown');}});</script>
<noscript><div style="padding:30px;text-align:center;font-family:sans-serif">CHAOS CLUB דורש JavaScript. הפעילו אותו בדפדפן ונסו שוב.</div></noscript>
<script>
${js}
</script>
</body>
</html>
`;
fs.writeFileSync('index.html', html);
console.log('counts', gameCount, catCount);
console.log('built', (html.length/1024).toFixed(1)+'KB');
