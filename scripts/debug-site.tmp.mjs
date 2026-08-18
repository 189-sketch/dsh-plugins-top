// Fetch the deployed site and inspect the payload + client logic for the suspects tab.
const res = await fetch('https://189-sketch.github.io/dsh-plugins-top/', { headers: { 'User-Agent': 'dsh-debug' } });
console.log('HTTP', res.status);
const html = await res.text();
console.log('size:', (html.length / 1024 / 1024).toFixed(2), 'MB');

const m = html.match(/<script id="payload" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.log('NO PAYLOAD BLOCK'); process.exit(0); }
const data = JSON.parse(m[1]);
console.log('items:', data.items.length, 'suspects:', data.suspects.length, 'growthBase:', data.growthBase);
if (data.suspects.length) {
  console.log('first suspect:', JSON.stringify(data.suspects[0]).slice(0, 200));
}
// Check the client script's suspects path
const client = html.match(/<script>([\s\S]*?)<\/script>/)[1];
console.log('has suspects tab def:', client.includes("id: 'suspects'"));
console.log('has suspects branch:', client.includes("state.tab === 'suspects'"));
