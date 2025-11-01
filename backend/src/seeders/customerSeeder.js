/**
 * ==============================================
 * CUSTOMER SEEDER
 * ==============================================
 * Tạo khách hàng mẫu
 */

const Customer = require('../models/Customer');

const customers = [
  {
    email: 'customer1@gmail.com',
    password: 'customer123',
    fullName: 'Nguyễn Văn A',
    phone: '0912345678',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3B82F6&color=fff',
    dateOfBirth: new Date('2000-05-15'),
    gender: 'male',
    isActive: true,
  },
  {
    email: 'customer2@gmail.com',
    password: 'customer123',
    fullName: 'Trần Thị B',
    phone: '0923456789',
    avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=EC4899&color=fff',
    dateOfBirth: new Date('1998-08-20'),
    gender: 'female',
    isActive: true,
  },
  {
    email: 'customer3@gmail.com',
    password: 'customer123',
    fullName: 'Lê Văn C',
    phone: '0934567890',
    avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=10B981&color=fff',
    dateOfBirth: new Date('2002-03-10'),
    gender: 'male',
    isActive: true,
  },
];

const seedCustomers = async () => {
  try {
    await Customer.deleteMany({});
    console.log('🗑️  Deleted old customers');
    
    const createdCustomers = await Customer.create(customers);
    console.log(`✅ Created ${createdCustomers.length} customers`);
    
    return createdCustomers;
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    throw error;
  }
};

module.exports = seedCustomers;