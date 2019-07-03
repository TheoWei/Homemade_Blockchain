const { Blockchain, Transaction, ec } = require('./blockchain');
const prikey = ec.keyFromPrivate('ef1b2e4cac4a61e46789d36a79c36e695f543fb079db337d65a304ce5d66642c');
const sender = prikey.getPublic('hex');

const testChain = new Blockchain();
testChain.setDiffStandard(4);
const tx1 = new Transaction(sender, 'someone', 100);
const tx2 = new Transaction(sender, 'someone', 200);
const tx3 = new Transaction(sender, 'someone', 300);
const tx4 = new Transaction(sender, 'someone', 400);
tx1.signTransaction(prikey);
// console.log(tx1.isValid());

testChain.addTransaction(tx1);
testChain.setMiner(sender);
testChain.mining();
console.dir(testChain, {depth: null});

