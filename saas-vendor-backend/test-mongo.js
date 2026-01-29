const mongoose = require('mongoose');

const uri = 'mongodb+srv://hardikbansal619_db_user:OaDjuICctlXrGBOn@cluster0.hv4jy2r.mongodb.net/saas-vendor?retryWrites=true&w=majority';

console.log('🔄 Attempting to connect to MongoDB...');
console.log('📍 URI:', uri);

mongoose.connect(uri, {
  retryWrites: true,
  w: 'majority',
})
.then(() => {
  console.log('✅ MONGODB CONNECTED SUCCESSFULLY!');
  console.log('✅ Connection is working perfectly!');
  process.exit(0);
})
.catch((err) => {
  console.log('❌ CONNECTION ERROR:', err.message);
  console.log('❌ Full error:', err);
  process.exit(1);
});
