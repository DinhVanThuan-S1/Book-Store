/**
 * ==============================================
 * PUBLISHER SEEDER
 * ==============================================
 */

const Publisher = require('../models/Publisher');

const publishers = [
  {
    name: 'NXB Kim Đồng',
    address: '55 Quang Trung, Hà Nội',
    phone: '024 3942 3448',
    email: 'kimdong@nxbkimdong.com.vn',
    website: 'https://nxbkimdong.com.vn',
  },
  {
    name: 'NXB Trẻ',
    address: '161B Lý Chính Thắng, Q.3, TP.HCM',
    phone: '028 3930 5409',
    email: 'info@nxbtre.com.vn',
    website: 'https://nxbtre.com.vn',
  },
  {
    name: 'NXB Văn học',
    address: '18 Nguyễn Trường Tộ, Hà Nội',
    phone: '024 3822 3440',
    email: 'nxbvanhoc@gmail.com',
    website: 'https://nxbvanhoc.com.vn',
  },
  {
    name: 'NXB Lao động',
    address: '175 Giảng Võ, Hà Nội',
    phone: '024 3851 3671',
    email: 'nxblaodong@gmail.com',
    website: 'https://nxblaodong.com.vn',
  },
  {
    name: 'NXB Tổng hợp TP.HCM',
    address: '62 Nguyễn Thị Minh Khai, Q.1, TP.HCM',
    phone: '028 3822 5340',
    email: 'tonghop@hcm.vnn.vn',
    website: 'https://nxbtonghop.com.vn',
  },
  {
    name: 'NXB Hội Nhà văn',
    address: '65 Nguyễn Du, Hà Nội',
    phone: '024 3822 3837',
    email: 'nxbhoinhavan@gmail.com',
    website: 'https://nxbhoinhavan.com.vn',
  },
  {
    name: 'NXB Giáo dục Việt Nam',
    address: '81 Trần Hưng Đạo, Hà Nội',
    phone: '024 3822 4011',
    email: 'nxbgdvn@vnn.vn',
    website: 'https://nxbgd.vn',
  },
  {
    name: 'NXB Dân Trí',
    address: '123 Võ Văn Tần, Q.3, TP.HCM',
    phone: '028 3930 6868',
    email: 'info@nxbdantri.com.vn',
    website: 'https://nxbdantri.com.vn',
  },
  {
    name: 'Alphabooks',
    address: '145 Pasteur, Q.1, TP.HCM',
    phone: '028 3822 0202',
    email: 'info@alphabooks.vn',
    website: 'https://alphabooks.vn',
  },
  {
    name: 'First News',
    address: '88 Nguyễn Văn Trỗi, TP.HCM',
    phone: '028 3844 4244',
    email: 'contact@firstnews.com.vn',
    website: 'https://firstnews.com.vn',
  },
];

const seedPublishers = async () => {
  try {
    await Publisher.deleteMany({});
    console.log('🗑️  Deleted old publishers');
    
    const createdPublishers = await Publisher.create(publishers);
    console.log(`✅ Created ${createdPublishers.length} publishers`);
    
    return createdPublishers;
  } catch (error) {
    console.error('❌ Error seeding publishers:', error);
    throw error;
  }
};

module.exports = seedPublishers;