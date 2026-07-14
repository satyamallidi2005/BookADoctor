const mongoose = require('mongoose');

/**
 * Establishes connection to the local MongoDB database.
 * Uses environment variable MONGO_URI.
 */
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book_doctor';
    
    // Sanitize any accidental copy-paste prefixes or quotes
    mongoUri = mongoUri.trim();
    mongoUri = mongoUri.replace(/^MONGO_URI\s*=\s*/i, '');
    mongoUri = mongoUri.replace(/^MONGODB_URI\s*=\s*/i, '');
    mongoUri = mongoUri.replace(/^["']|["']$/g, '');

    if (!mongoUri.includes('retryWrites=')) {
      mongoUri += mongoUri.includes('?') ? '&retryWrites=false' : '?retryWrites=false';
    }
    const conn = await mongoose.connect(mongoUri, { retryWrites: false });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Dynamically check transaction support based on deployment topology
    const topologyType = conn.connection.client.topology?.description?.type || 'Single';
    mongoose.supportsTransactions = topologyType !== 'Single';
    console.log(`MongoDB Transaction Support: ${mongoose.supportsTransactions ? 'ENABLED' : 'DISABLED'} (Topology: ${topologyType})`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
