const fs=require('fs'); const LZ=require('lz-string');
const html=fs.readFileSync('chaos-club.html','utf8');
const files={'index.html':{content:html},'sandbox.config.json':{content:'{"template":"static"}'},'package.json':{content:JSON.stringify({name:'chaos-club',version:'1.1.0',description:'CHAOS CLUB - 83 games'})}};
fs.writeFileSync('csb-parameters.txt', LZ.compressToBase64(JSON.stringify({files})));
console.log('payload', fs.statSync('csb-parameters.txt').size);
