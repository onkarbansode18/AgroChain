require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require('crypto-js');
const User = require('./models/User');
const Produce = require('./models/Produce');
const SupplyTransaction = require('./models/SupplyTransaction');
const OTP = require('./models/OTP');
const Dispute = require('./models/Dispute');
const connectDB = require('./config/db');
const { registerProduce, transferOwnership, updateTransport } = require('./blockchain/smartContracts');
const QRCode = require('qrcode');

const generateAddr = (email) => '0x' + CryptoJS.SHA256(email + uuidv4()).toString().substring(0, 40);

const seed = async () => {
  await connectDB();

  // Clear all collections
  await User.deleteMany({});
  await Produce.deleteMany({});
  await SupplyTransaction.deleteMany({});
  await OTP.deleteMany({});
  await Dispute.deleteMany({});

  console.log('  🌱 Seeding database...\n');

  const salt = await bcrypt.genSalt(12);
  const hashedPw = await bcrypt.hash('password123', salt);

  // Create users with full real-world data
  const admin = await User.create({
    name: 'Admin User', email: 'admin@agrochain.com', password: hashedPw,
    role: 'admin', blockchainAddress: generateAddr('admin'),
    isVerified: true, isEmailVerified: true, phone: '9000000001',
    address: { city: 'Bhubaneswar', state: 'Odisha', pincode: '751001', country: 'India' }
  });

  const farmer1 = await User.create({
    name: 'Rajesh Kumar', email: 'farmer@agrochain.com', password: hashedPw,
    role: 'farmer', farmName: 'Kumar Organic Farm', farmLocation: 'Bhubaneswar, Odisha',
    farmSize: '5 acres', farmType: 'organic',
    blockchainAddress: generateAddr('farmer1'), isVerified: true, isEmailVerified: true,
    phone: '9876543210',
    address: { city: 'Bhubaneswar', state: 'Odisha', pincode: '751002', country: 'India' },
    location: { type: 'Point', coordinates: [85.8245, 20.2961] }
  });

  const farmer2 = await User.create({
    name: 'Sunita Devi', email: 'farmer2@agrochain.com', password: hashedPw,
    role: 'farmer', farmName: 'Devi Natural Farm', farmLocation: 'Cuttack, Odisha',
    farmSize: '3 acres', farmType: 'organic',
    blockchainAddress: generateAddr('farmer2'), isVerified: true, isEmailVerified: true,
    phone: '9876543211',
    address: { city: 'Cuttack', state: 'Odisha', pincode: '753001', country: 'India' },
    location: { type: 'Point', coordinates: [85.8830, 20.4625] }
  });

  const dist1 = await User.create({
    name: 'Amit Patel', email: 'distributor@agrochain.com', password: hashedPw,
    role: 'distributor', businessName: 'Amit Agro Distributors',
    licenseNumber: 'DL-OD-2024-001', gstNumber: '21ABCDE1234F1Z5',
    blockchainAddress: generateAddr('dist1'), isVerified: true, isEmailVerified: true,
    phone: '9876543212',
    address: { city: 'Bhubaneswar', state: 'Odisha', pincode: '751003', country: 'India' }
  });

  const ret1 = await User.create({
    name: 'Priya Sharma', email: 'retailer@agrochain.com', password: hashedPw,
    role: 'retailer', businessName: 'FreshMart Retail Store',
    licenseNumber: 'RT-OD-2024-001', gstNumber: '21FGHIJ5678K1Z3',
    blockchainAddress: generateAddr('ret1'), isVerified: true, isEmailVerified: true,
    phone: '9876543213',
    address: { city: 'Bhubaneswar', state: 'Odisha', pincode: '751004', country: 'India' }
  });

  const consumer1 = await User.create({
    name: 'Vikram Singh', email: 'consumer@agrochain.com', password: hashedPw,
    role: 'consumer', blockchainAddress: generateAddr('consumer1'),
    isVerified: true, isEmailVerified: true, phone: '9876543214'
  });

  console.log('  ✅ 6 Users created\n');

  // Create produce with realistic data
  const crops = [
    { farmer: farmer1, cropType: 'Tomato', variety: 'Cherry', quantity: 500, qualityGrade: 'A+', price: 20, certs: ['Organic', 'Pesticide-Free'], desc: 'Fresh organic cherry tomatoes grown without chemicals in Odisha' },
    { farmer: farmer2, cropType: 'Rice', variety: 'Basmati', quantity: 1000, qualityGrade: 'A', price: 45, certs: ['Organic'], desc: 'Premium basmati rice, naturally grown using traditional methods' },
    { farmer: farmer1, cropType: 'Potato', variety: 'Kufri Jyoti', quantity: 800, qualityGrade: 'A', price: 15, certs: ['Chemical-Free'], desc: 'High-quality potatoes, stored in cold storage' },
    { farmer: farmer2, cropType: 'Onion', variety: 'Red', quantity: 600, qualityGrade: 'A+', price: 25, certs: ['Organic', 'Non-GMO'], desc: 'Organically grown red onions' },
    { farmer: farmer1, cropType: 'Wheat', variety: 'Sharbati', quantity: 2000, qualityGrade: 'A', price: 30, certs: ['Chemical-Free'], desc: 'Premium Sharbati wheat, mill-ready' },
  ];

  const produceList = [];
  for (const crop of crops) {
    const produceId = 'PRD-' + uuidv4().substring(0, 8).toUpperCase();
    const { transaction, block } = registerProduce(crop.farmer.blockchainAddress, {
      produceId, cropType: crop.cropType, quantity: crop.quantity, unit: 'kg',
      qualityGrade: crop.qualityGrade, harvestDate: new Date().toISOString(),
      farmLocation: crop.farmer.farmLocation, farmerName: crop.farmer.name,
      price: crop.price, certifications: crop.certs, description: crop.desc
    });

    const traceUrl = `http://localhost:5173/trace/${produceId}`;
    const qrCode = await QRCode.toDataURL(JSON.stringify({ produceId, type: 'agrochain-produce', url: traceUrl }), { width: 300, margin: 2, color: { dark: '#10b981', light: '#0a0f1a' } });

    const produce = await Produce.create({
      produceId, farmer: crop.farmer._id, cropType: crop.cropType, variety: crop.variety,
      quantity: crop.quantity, unit: 'kg', qualityGrade: crop.qualityGrade,
      harvestDate: new Date(), farmLocation: crop.farmer.farmLocation, price: crop.price,
      description: crop.desc, certifications: crop.certs,
      currentOwner: crop.farmer._id, currentOwnerRole: 'farmer',
      priceHistory: [{ price: crop.price, setBy: crop.farmer._id, role: 'farmer' }],
      blockchainTxIds: [transaction.id], registrationBlockHash: block.hash, qrCode
    });
    produceList.push(produce);
    console.log(`  🌿 ${crop.cropType} (${produceId})`);
  }

  // Simulate a full supply chain for the first produce (Tomato)
  const tomato = produceList[0];
  console.log(`\n  🔄 Simulating full supply chain for ${tomato.cropType}...`);

  // Distributor buys from farmer
  const { transaction: buyTx, block: buyBlock } = transferOwnership(
    farmer1.blockchainAddress, dist1.blockchainAddress,
    { produceId: tomato.produceId, quantity: tomato.quantity, unit: 'kg', purchasePrice: 28, previousPrice: 20, senderName: farmer1.name, receiverName: dist1.name, senderRole: 'farmer', receiverRole: 'distributor' }
  );
  tomato.status = 'with_distributor';
  tomato.currentOwner = dist1._id;
  tomato.currentOwnerRole = 'distributor';
  tomato.priceHistory.push({ price: 28, setBy: dist1._id, role: 'distributor' });
  tomato.blockchainTxIds.push(buyTx.id);
  await tomato.save();
  await SupplyTransaction.create({
    produce: tomato._id, produceId: tomato.produceId, from: farmer1._id, to: dist1._id,
    fromRole: 'farmer', toRole: 'distributor', quantity: tomato.quantity, unit: 'kg',
    price: 28, totalAmount: 28 * tomato.quantity, transactionType: 'purchase',
    blockchainTxId: buyTx.id, blockHash: buyBlock.hash, blockIndex: buyBlock.index
  });
  console.log('  ✅ Distributor purchased from farmer at ₹28/kg');

  // Transport
  const { transaction: transTx, block: transBlock } = updateTransport(dist1.blockchainAddress, {
    produceId: tomato.produceId, vehicleType: 'Refrigerated Truck', vehicleNumber: 'OD-02-AB-7890',
    origin: 'Bhubaneswar Warehouse', destination: 'FreshMart Store, Cuttack',
    temperature: '4°C', humidity: '65%', departureTime: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 4 * 3600000).toISOString(), transporterName: dist1.name
  });
  tomato.status = 'in_transit';
  tomato.blockchainTxIds.push(transTx.id);
  await tomato.save();
  await SupplyTransaction.create({
    produce: tomato._id, produceId: tomato.produceId, from: dist1._id, to: dist1._id,
    fromRole: 'distributor', toRole: 'distributor', quantity: tomato.quantity, unit: 'kg',
    transactionType: 'transport',
    transport: { vehicleType: 'Refrigerated Truck', vehicleNumber: 'OD-02-AB-7890', origin: 'Bhubaneswar Warehouse', destination: 'FreshMart Store, Cuttack', temperature: '4°C', humidity: '65%' },
    blockchainTxId: transTx.id, blockHash: transBlock.hash, blockIndex: transBlock.index
  });
  console.log('  ✅ Transport recorded (Refrigerated Truck)');

  // Retailer buys from distributor
  const { transaction: retTx, block: retBlock } = transferOwnership(
    dist1.blockchainAddress, ret1.blockchainAddress,
    { produceId: tomato.produceId, quantity: tomato.quantity, unit: 'kg', purchasePrice: 45, previousPrice: 28, senderName: dist1.name, receiverName: ret1.name, senderRole: 'distributor', receiverRole: 'retailer' }
  );
  tomato.status = 'with_retailer';
  tomato.currentOwner = ret1._id;
  tomato.currentOwnerRole = 'retailer';
  tomato.priceHistory.push({ price: 45, setBy: ret1._id, role: 'retailer' });
  tomato.blockchainTxIds.push(retTx.id);
  const newQR = await QRCode.toDataURL(JSON.stringify({ produceId: tomato.produceId, type: 'agrochain-produce', url: `http://localhost:5173/trace/${tomato.produceId}` }), { width: 300, margin: 2, color: { dark: '#10b981', light: '#0a0f1a' } });
  tomato.qrCode = newQR;
  await tomato.save();
  await SupplyTransaction.create({
    produce: tomato._id, produceId: tomato.produceId, from: dist1._id, to: ret1._id,
    fromRole: 'distributor', toRole: 'retailer', quantity: tomato.quantity, unit: 'kg',
    price: 45, totalAmount: 45 * tomato.quantity, transactionType: 'purchase',
    blockchainTxId: retTx.id, blockHash: retBlock.hash, blockIndex: retBlock.index
  });
  console.log('  ✅ Retailer purchased at ₹45/kg (125% total markup from farmer)');

  console.log('\n  ✅ Seed complete!');
  console.log(`\n  🍅 Full trace demo: http://localhost:5173/trace/${tomato.produceId}`);
  console.log('\n  📧 Login credentials (all passwords: password123):');
  console.log('     Admin:       admin@agrochain.com');
  console.log('     Farmer:      farmer@agrochain.com');
  console.log('     Farmer 2:    farmer2@agrochain.com');
  console.log('     Distributor: distributor@agrochain.com');
  console.log('     Retailer:    retailer@agrochain.com');
  console.log('     Consumer:    consumer@agrochain.com\n');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
