const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  constructor(sender, receiver, data, type) {
    this.id = uuidv4();
    this.timestamp = new Date().toISOString();
    this.sender = sender;
    this.receiver = receiver;
    this.data = data;
    this.type = type; // 'PRODUCE_REGISTER', 'OWNERSHIP_TRANSFER', 'PRICE_UPDATE', 'TRANSPORT_UPDATE', 'QUALITY_CHECK'
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return CryptoJS.SHA256(
      this.id + this.timestamp + this.sender + this.receiver + JSON.stringify(this.data) + this.type
    ).toString();
  }
}

class Block {
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return CryptoJS.SHA256(
      this.index +
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`  ⛏️  Block mined: ${this.hash}`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 0;
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, new Date().toISOString(), [{
      id: 'genesis',
      timestamp: new Date().toISOString(),
      sender: 'SYSTEM',
      receiver: 'SYSTEM',
      data: { message: 'AgroChain Genesis Block - Supply Chain Transparency Initiative' },
      type: 'GENESIS',
      hash: 'genesis_hash'
    }], '0');
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.sender || !transaction.receiver) {
      throw new Error('Transaction must include sender and receiver');
    }
    this.pendingTransactions.push(transaction);
    return transaction;
  }

  minePendingTransactions() {
    if (this.pendingTransactions.length === 0) {
      return null;
    }

    const block = new Block(
      this.chain.length,
      new Date().toISOString(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendingTransactions = [];
    return block;
  }

  // Auto-mine: create a block for each transaction immediately
  addAndMineTransaction(transaction) {
    this.addTransaction(transaction);
    return this.minePendingTransactions();
  }

  getTransactionsByAddress(address) {
    const transactions = [];
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.sender === address || tx.receiver === address) {
          transactions.push({ ...tx, blockIndex: block.index, blockHash: block.hash });
        }
      }
    }
    return transactions;
  }

  getTransactionsByType(type) {
    const transactions = [];
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.type === type) {
          transactions.push({ ...tx, blockIndex: block.index, blockHash: block.hash });
        }
      }
    }
    return transactions;
  }

  getTransactionById(txId) {
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.id === txId) {
          return { ...tx, blockIndex: block.index, blockHash: block.hash };
        }
      }
    }
    return null;
  }

  getTransactionsByProduceId(produceId) {
    const transactions = [];
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.data && tx.data.produceId === produceId) {
          transactions.push({ ...tx, blockIndex: block.index, blockHash: block.hash });
        }
      }
    }
    return transactions;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Recalculate hash and verify
      const recalculatedHash = new Block(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.transactions,
        currentBlock.previousHash
      );
      recalculatedHash.nonce = currentBlock.nonce;

      if (currentBlock.hash !== recalculatedHash.calculateHash()) {
        return { valid: false, error: `Block ${i} has been tampered with` };
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return { valid: false, error: `Block ${i} has invalid previous hash link` };
      }
    }
    return { valid: true, error: null };
  }

  getChainStats() {
    let totalTransactions = 0;
    const typeCounts = {};

    for (const block of this.chain) {
      totalTransactions += block.transactions.length;
      for (const tx of block.transactions) {
        typeCounts[tx.type] = (typeCounts[tx.type] || 0) + 1;
      }
    }

    return {
      totalBlocks: this.chain.length,
      totalTransactions,
      transactionTypes: typeCounts,
      chainValid: this.isChainValid().valid,
      latestBlockHash: this.getLatestBlock().hash,
      difficulty: this.difficulty
    };
  }

  getFullChain() {
    return this.chain.map(block => ({
      index: block.index,
      timestamp: block.timestamp,
      transactionCount: block.transactions.length,
      transactions: block.transactions,
      previousHash: block.previousHash,
      hash: block.hash,
      nonce: block.nonce
    }));
  }
}

// Singleton instance
const agroChain = new Blockchain();

module.exports = { Blockchain, Block, Transaction, agroChain };
