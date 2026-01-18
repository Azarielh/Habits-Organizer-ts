const http = require('http');
const https = require('https');
const { URL } = require('url');

function getText(url){
  return new Promise((resolve, reject) => {
    try{
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.get(u, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
    }catch(err){ reject(err); }
  });
}

(async ()=>{
  try{
    const ngrok = require('@expo/ngrok');
    const url = await ngrok.connect({ addr: 3002 });
    console.log('NGROK_URL=' + url);
    const r = await getText(url + '/api/habits');
    console.log('STATUS=' + r.status);
    console.log('RESPONSE=' + r.body);
    await ngrok.disconnect();
  }catch(e){
    console.error('ERR', e && (e.stack || e));
    process.exit(2);
  }
})();
