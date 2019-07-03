const sha256Hash = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Block{
    constructor(timestamp, transactions=[]){   
        this.blockHash = this.calculateHash();
        this.blockHeader = {
            version: 0 ,
            previousHash: '0x0000000000000000',
            merkleRoot: 0,
            nonce: 0,
            difficulty: 1,
            timestamp,
        };        
        this.transactions = transactions;
        this.transactionCounter= this.transactions.length;
    }

    calculateHash(){
        return sha256Hash(JSON.stringify(this.blockHeader)).toString();
    }
    
    minedBlock(){
        while(this.blockHash.substring(0, this.blockHeader.difficulty) !== new Array(this.blockHeader.difficulty+1).join('0')){
            this.blockHeader.nonce += 1;
            this.blockHash = this.calculateHash();                        
        } 
        console.log('Success mine the Block!','block hash:: ', this.blockHash);
    }

    // 驗證所有在 block的 transaction是否正確
    hasValidTransactions(){        
        for( let tx of this.transactions){
            if(!tx.isValid()) return false;
        }
        return true
    }
}


class Transaction{
    constructor(from, to, value){
        this.from = from;
        this.to = to;
        this.value = value;
//         this.txHash
//         this.version
//         this.inputCounter
//         this.inputs
//         this.outputCounter
//         this.outputs
//         this.locktime        
    }
//     set Input(){
//         this.txHash        
//         this.outputIndex
//         this.lockingScript
//         this.sequence
//     }

//     set Output(){
//         this.values
//         this.unlockingScript
//     }
    calculateHash(){
        return sha256Hash(this.from + this.to + this.value).toString();
    }

    signTransaction(priKey){
        // 這邊的 address預設為 public key，實際上的 address並不完全是 public key
        if(priKey.getPublic('hex') !== this.from) throw new Error('You can\'t sign other address');
        const txHash = this.calculateHash();         
        const signature = priKey.sign(txHash, 'base64');
        this.signature = signature.toDER('hex');
    }

    // 驗證 transaction signature 是否正確
    isValid(){
        if(this.from === null) return true;
        if(!this.signature || this.signature.length === 0) throw new Error('No Signature in this transaction');
        const pubKey = ec.keyFromPublic(this.from, 'hex');              
        return pubKey.verify(this.calculateHash(), this.signature);
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];    
        this.diffStandard = 5;
        this.pendingTransactions = [];        
        this.miner = '0x0000000000';
        this.reward = 100;
    }
    createGenesisBlock(){
        return new Block(Date.now(), '0x00');
    }

    getLastestBlock(){
        return this.chain[this.chain.length-1];
    }

    setDiffStandard(diffStandard){
        this.diffStandard = diffStandard;
    }

    setReward(value){
        this.reward = value;
    }

    setMiner(address){
        this.miner = address;
    }

    addTransaction(transaction){
        if(!transaction.from || !transaction.to) throw new Error('Transaction must include from and to address');
        if(!transaction.isValid) throw new Error('Can\'t not add invalid transaction in chain');
        this.pendingTransactions.push(transaction);
    }

    mining(){
        const block = new Block(Date.now(), this.pendingTransactions);
        block.blockHeader.previousHash = this.getLastestBlock().blockHash;
        // 以目前block的數量來判斷難度提升
        if( (this.chain.length % this.diffStandard) === 0) block.blockHeader.difficulty += 1;        
        block.minedBlock();
        this.chain.push(block);
        this.pendingTransactions = [];
        this.pendingTransactions.push(new Transaction(null, this.miner, this.reward));        
    }

    isChainValid(){
        for(let i = 1 ; i < this.chain.length ; i += 1){
            let currentBlock = this.chain[i];
            let previousBlock = this.chain[i -1];

            if(!currentBlock.hasValidTransactions()) return false;
            if(currentBlock.blockHash !== currentBlock.calculateHash() ) return false; //判斷原始的 blockHash 和 重新計算的 blockHash 是否一致，以防止竄改
            if(previousBlock.blockHash !== currentBlock.blockHeader.previousHash) return false;
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
module.exports.ec = ec;