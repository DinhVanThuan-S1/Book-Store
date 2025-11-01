/**
 * ==============================================
 * ADMIN SEEDER
 * ==============================================
 * Tạo tài khoản admin mẫu
 * Author: DinhVanThuan-S1
 * Date: 2025-10-31
 */

const Admin = require('../models/Admin');

const admins = [
  {
    email: 'admin@bookstore.com',
    password: 'admin123456', // Sẽ được hash tự động
    fullName: 'Administrator',
    phone: '0901234567',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff',
  },
  {
    email: 'manager@bookstore.com',
    password: 'manager123456',
    fullName: 'Manager User',
    phone: '0901234568',
    avatar: 'https://ui-avatars.com/api/?name=Manager&background=10B981&color=fff',
  },
];

/**
 * Seed admins
 */
const seedAdmins = async () => {
  try {
    // Xóa tất cả admins cũ
    await Admin.deleteMany({});
    console.log('🗑️  Deleted old admins');
    
    // Tạo admins mới
    const createdAdmins = await Admin.create(admins);
    console.log(`✅ Created ${createdAdmins.length} admins`);
    
    return createdAdmins;
  } catch (error) {
    console.error('❌ Error seeding admins:', error);
    throw error;
  }
};

module.exports = seedAdmins;