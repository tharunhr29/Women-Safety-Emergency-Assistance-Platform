const net = require('net');

console.log('Testing connection to MongoDB Atlas on port 27017...');

const client = new net.Socket();
client.setTimeout(5000);

client.connect(27017, 'cluster0-shard-00-00.p6eyige.mongodb.net', () => {
    console.log('SUCCESS: Port 27017 is OPEN! The issue is definitely the IP Whitelist in MongoDB Atlas.');
    client.destroy();
});

client.on('error', (err) => {
    console.log('FAILED: Port 27017 is BLOCKED by your Wi-Fi network or ISP.');
    console.log('Error details:', err.message);
});

client.on('timeout', () => {
    console.log('FAILED: Connection timed out. Port 27017 is BLOCKED by your Wi-Fi network.');
    client.destroy();
});
