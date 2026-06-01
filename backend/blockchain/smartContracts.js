const { Transaction, agroChain } = require('./blockchain');

/**
 * Smart Contract: Register Produce
 * Called when a farmer registers new agricultural produce
 */
function registerProduce(farmerId, produceData) {
  const transaction = new Transaction(
    farmerId,
    'SYSTEM',
    {
      produceId: produceData.produceId,
      cropType: produceData.cropType,
      quantity: produceData.quantity,
      unit: produceData.unit,
      qualityGrade: produceData.qualityGrade,
      harvestDate: produceData.harvestDate,
      farmLocation: produceData.farmLocation,
      farmerName: produceData.farmerName,
      price: produceData.price,
      certifications: produceData.certifications || [],
      description: produceData.description || ''
    },
    'PRODUCE_REGISTER'
  );

  const block = agroChain.addAndMineTransaction(transaction);
  return { transaction, block };
}

/**
 * Smart Contract: Transfer Ownership
 * Called when produce changes hands (farmer->distributor, distributor->retailer)
 */
function transferOwnership(senderId, receiverId, transferData) {
  const transaction = new Transaction(
    senderId,
    receiverId,
    {
      produceId: transferData.produceId,
      quantity: transferData.quantity,
      unit: transferData.unit,
      purchasePrice: transferData.purchasePrice,
      previousPrice: transferData.previousPrice,
      priceChange: transferData.purchasePrice - transferData.previousPrice,
      priceChangePercent: ((transferData.purchasePrice - transferData.previousPrice) / transferData.previousPrice * 100).toFixed(2),
      senderName: transferData.senderName,
      receiverName: transferData.receiverName,
      senderRole: transferData.senderRole,
      receiverRole: transferData.receiverRole
    },
    'OWNERSHIP_TRANSFER'
  );

  const block = agroChain.addAndMineTransaction(transaction);
  return { transaction, block };
}

/**
 * Smart Contract: Update Transport
 * Called when transport details are logged
 */
function updateTransport(transporterId, transportData) {
  const transaction = new Transaction(
    transporterId,
    transportData.destination,
    {
      produceId: transportData.produceId,
      vehicleType: transportData.vehicleType,
      vehicleNumber: transportData.vehicleNumber,
      origin: transportData.origin,
      destination: transportData.destination,
      temperature: transportData.temperature,
      humidity: transportData.humidity,
      departureTime: transportData.departureTime,
      estimatedArrival: transportData.estimatedArrival,
      transporterName: transportData.transporterName
    },
    'TRANSPORT_UPDATE'
  );

  const block = agroChain.addAndMineTransaction(transaction);
  return { transaction, block };
}

/**
 * Smart Contract: Update Price
 * Called when a stakeholder updates the price
 */
function updatePrice(stakeholderId, priceData) {
  const transaction = new Transaction(
    stakeholderId,
    'MARKET',
    {
      produceId: priceData.produceId,
      oldPrice: priceData.oldPrice,
      newPrice: priceData.newPrice,
      reason: priceData.reason,
      stakeholderRole: priceData.stakeholderRole,
      stakeholderName: priceData.stakeholderName
    },
    'PRICE_UPDATE'
  );

  const block = agroChain.addAndMineTransaction(transaction);
  return { transaction, block };
}

/**
 * Smart Contract: Quality Check
 * Record quality assessment
 */
function recordQualityCheck(inspectorId, qualityData) {
  const transaction = new Transaction(
    inspectorId,
    'QUALITY_BOARD',
    {
      produceId: qualityData.produceId,
      grade: qualityData.grade,
      notes: qualityData.notes,
      inspectorName: qualityData.inspectorName,
      certifications: qualityData.certifications,
      passedInspection: qualityData.passedInspection
    },
    'QUALITY_CHECK'
  );

  const block = agroChain.addAndMineTransaction(transaction);
  return { transaction, block };
}

/**
 * Trace produce journey — get all blockchain records for a produce
 */
function traceProduceJourney(produceId) {
  const transactions = agroChain.getTransactionsByProduceId(produceId);
  
  const journey = {
    produceId,
    totalSteps: transactions.length,
    registration: null,
    transfers: [],
    transportUpdates: [],
    priceUpdates: [],
    qualityChecks: [],
    timeline: []
  };

  for (const tx of transactions) {
    const timelineEntry = {
      timestamp: tx.timestamp,
      type: tx.type,
      blockIndex: tx.blockIndex,
      blockHash: tx.blockHash,
      transactionHash: tx.hash,
      data: tx.data
    };

    journey.timeline.push(timelineEntry);

    switch (tx.type) {
      case 'PRODUCE_REGISTER':
        journey.registration = timelineEntry;
        break;
      case 'OWNERSHIP_TRANSFER':
        journey.transfers.push(timelineEntry);
        break;
      case 'TRANSPORT_UPDATE':
        journey.transportUpdates.push(timelineEntry);
        break;
      case 'PRICE_UPDATE':
        journey.priceUpdates.push(timelineEntry);
        break;
      case 'QUALITY_CHECK':
        journey.qualityChecks.push(timelineEntry);
        break;
    }
  }

  // Sort timeline by timestamp
  journey.timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return journey;
}

module.exports = {
  registerProduce,
  transferOwnership,
  updateTransport,
  updatePrice,
  recordQualityCheck,
  traceProduceJourney
};
