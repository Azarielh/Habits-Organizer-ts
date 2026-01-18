;(async ()=>{
  try{
    const ngrok = require('@expo/ngrok');
    const url = await ngrok.connect({ addr: 3002 });
    console.log('NGROK_URL=' + url);

    // fetch the habits endpoint
    const res = await (await fetch(url + '/api/habits')).text();
    console.log('RESPONSE=' + res);

    await ngrok.disconnect();
  }catch(e){
    console.error('ERR', e && (e.message || e));
    process.exit(2);
  }
})();
