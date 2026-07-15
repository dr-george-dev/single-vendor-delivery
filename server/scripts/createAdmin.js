/**
 * Create (or promote) a kitchen admin user.
 *
 * Usage (from /server):
 *   node scripts/createAdmin.js
 *   node scripts/createAdmin.js kitchen@demo.com "Kitchen Boss" mypassword
 *
 * Defaults:
 *   email:    kitchen@demo.com
 *   name:     Kitchen Admin
 *   password: kitchen123
 */
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const [emailArg, nameArg, passwordArg] = process.argv.slice(2);

const email = (emailArg || 'kitchen@demo.com').toLowerCase();
const name = nameArg || 'Kitchen Admin';
const password = passwordArg || 'kitchen123';

const run = async () => {
  await connectDB();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'admin';
      user.name = name;
      user.password = hashed;
      await user.save();
      console.log(`✅ Promoted existing user to admin: ${email}`);
    } else {
      user = await User.create({
        name,
        email,
        password: hashed,
        role: 'admin',
      });
      console.log(`✅ Created kitchen admin: ${email}`);
    }

    console.log('   Login with this account in the app → Profile → Kitchen board');
    console.log(`   email:    ${email}`);
    console.log(`   password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
  }
};

run();
