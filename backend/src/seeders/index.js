/**
 * ==============================================
 * MAIN SEEDER
 * ==============================================
 * Chạy tất cả seeders theo thứ tự
 * Usage: npm run seed
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

const dotenv = require('dotenv');
const connectDatabase = require('../config/database');

// Load env
dotenv.config();

// Import seeders
const seedAdmins = require('./adminSeeder');
const seedCategories = require('./categorySeeder');
const seedAuthors = require('./authorSeeder');
const seedPublishers = require('./publisherSeeder');
const seedBooks = require('./bookSeeder');
const seedCustomers = require('./customerSeeder');

/**
 * Main seeder function
 */
const runSeeders = async () => {
  try {
    console.log('');
    console.log('🌱 Starting Database Seeding...');
    console.log('='.repeat(50));
    
    // Kết nối database
    await connectDatabase();
    
    // Chạy seeders theo thứ tự
    console.log('\n📝 Seeding Admins...');
    await seedAdmins();
    
    console.log('\n📝 Seeding Categories...');
    await seedCategories();
    
    console.log('\n📝 Seeding Authors...');
    await seedAuthors();
    
    console.log('\n📝 Seeding Publishers...');
    await seedPublishers();
    
    console.log('\n📝 Seeding Books and Copies...');
    await seedBooks();
    
    console.log('\n📝 Seeding Customers...');
    await seedCustomers();
    
    console.log('\n');
    console.log('='.repeat(50));
    console.log('✅ Database seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📋 Test Accounts:');
    console.log('   Admin: admin@bookstore.com / admin123456');
    console.log('   Customer: customer1@gmail.com / customer123');
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Chạy seeders
runSeeders();