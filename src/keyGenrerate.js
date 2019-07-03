const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const key = ec.genKeyPair();
const pubKey = key.getPublic('hex');
const priKey = key.getPrivate('hex');

console.log('private key:: ', priKey);
console.log('public key:: ', pubKey);
