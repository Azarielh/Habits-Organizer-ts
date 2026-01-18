const PUBLIC_URL = process.env.PUBLIC_TUNNEL_URL || 'https://every-eggs-smoke.loca.lt';

async function check(path) {
  const url = PUBLIC_URL + path;
  console.log('\nRequesting', url);
  try {
    const res = await fetch(url);
    console.log('  Without header: status', res.status);
    const txt = await res.text();
    console.log('  Body snippet:', txt.slice(0, 800).replace(/\n/g, ' '));
  } catch (e) {
    console.error('  Error without header:', e.message);
  }

  try {
    const res2 = await fetch(url, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
    console.log('  With header:    status', res2.status);
    const txt2 = await res2.text();
    console.log('  Body snippet:', txt2.slice(0, 800).replace(/\n/g, ' '));
  } catch (e) {
    console.error('  Error with header:', e.message);
  }
}

(async () => {
  await check('/api/habits');
})();
