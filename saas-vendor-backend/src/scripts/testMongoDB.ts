/**
 * MongoDB Connection Diagnostic Tool
 * Tests the MongoDB URI and provides troubleshooting guidance
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testMongoDBConnection(): Promise<void> {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  MongoDB Connection Diagnostic Tool    ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    console.log(`📊 MongoDB URI (censored): ${mongoUri.replace(/:.+@/, ':****@')}`);

    // Extract cluster info
    const clusterMatch = mongoUri.match(/@(.+?)\//);
    if (clusterMatch) {
      console.log(`🗄️  Cluster: ${clusterMatch[1]}`);
    }

    console.log('\n🔄 Attempting connection...');

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    );

    await Promise.race([
      mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        maxPoolSize: 5,
      } as any),
      timeoutPromise,
    ]);

    console.log('✅ MongoDB Connection SUCCESSFUL!\n');

    // Get connection info
    const connection = mongoose.connection;
    console.log(`📍 Connected to: ${connection.host}:${connection.port}`);
    console.log(`📦 Database: ${connection.name}`);

    await connection.close();
    console.log('\n✅ Diagnostic complete - Connection works!\n');

  } catch (error: any) {
    console.error('\n❌ Connection FAILED\n');
    console.error(`Error: ${error.message}\n`);

    // Provide troubleshooting guidance
    console.log('🔧 TROUBLESHOOTING GUIDE:\n');
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('getaddrinfo')) {
      console.log('Problem: Cannot reach MongoDB server');
      console.log('\nSolution:');
      console.log('1. Go to https://cloud.mongodb.com/v2');
      console.log('2. Navigate to: Security → Network Access');
      console.log('3. Click "Add IP Address"');
      console.log('4. Choose one of:');
      console.log('   - Add Current IP (if known)');
      console.log('   - Add 0.0.0.0/0 (allow all - for development only)');
      console.log('5. Wait 5-10 seconds for changes to propagate');
      console.log('6. Try connecting again\n');
    }

    if (error.message.includes('authentication failed') || error.message.includes('auth')) {
      console.log('Problem: Authentication failed (username/password)');
      console.log('\nSolution:');
      console.log('1. Verify credentials in .env file');
      console.log('2. Go to MongoDB Atlas → Database Access');
      console.log('3. Confirm username and password are correct');
      console.log('4. If unsure, create new credentials:\n');
      console.log('   - Click "Edit" on the user');
      console.log('   - Click "Edit Password"');
      console.log('   - Generate new password');
      console.log('   - Update .env file\n');
    }

    if (error.message.includes('timeout')) {
      console.log('Problem: Connection timeout - server is taking too long to respond');
      console.log('\nSolution:');
      console.log('1. Check your internet connection');
      console.log('2. Verify IP is whitelisted in MongoDB Atlas');
      console.log('3. Try pinging the cluster: ping <cluster-name>.mongodb.net');
      console.log('4. Check if MongoDB Atlas is experiencing issues\n');
    }

    process.exit(1);
  }
}

testMongoDBConnection();
