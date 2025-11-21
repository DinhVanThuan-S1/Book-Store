/**
 * ==============================================
 * AUTHOR SEEDER
 * ==============================================
 */

const Author = require('../models/Author');

const authors = [
  {
    name: 'Nguyễn Nhật Ánh',
    bio: 'Nhà văn nổi tiếng với các tác phẩm văn học thiếu nhi Việt Nam',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    nationality: 'Việt Nam',
  },
  {
    name: 'Aoyama Gosho',
    bio: 'Tác giả manga Nhật Bản, nổi tiếng với series Thám tử lừng danh Conan',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    nationality: 'Nhật Bản',
  },
  {
    name: 'Dale Carnegie',
    bio: 'Tác giả người Mỹ, nổi tiếng với sách "Đắc nhân tâm"',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    nationality: 'Mỹ',
  },
  {
    name: 'Tony Buổi Sáng',
    bio: 'Tác giả sách về tâm lý, kỹ năng sống tại Việt Nam',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    nationality: 'Việt Nam',
  },
  {
    name: 'Paulo Coelho',
    bio: 'Nhà văn người Brazil, tác giả "Nhà giả kim"',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200',
    nationality: 'Brazil',
  },
  {
    name: 'Haruki Murakami',
    bio: 'Nhà văn Nhật Bản đương đại nổi tiếng thế giới',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
    nationality: 'Nhật Bản',
  },
  {
    name: 'J.K. Rowling',
    bio: 'Tác giả series Harry Potter',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    nationality: 'Anh',
  },
  {
    name: 'Nam Cao',
    bio: 'Nhà văn hiện thực Việt Nam, tác giả "Chí Phèo"',
    image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200',
    nationality: 'Việt Nam',
  },
  {
    name: 'Robert Kiyosaki',
    bio: 'Tác giả "Dạy con làm giàu" - sách về tài chính cá nhân',
    image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=200',
    nationality: 'Mỹ',
  },
  {
    name: 'Tô Hoài',
    bio: 'Nhà văn Việt Nam, tác giả "Dế Mèn phiêu lưu ký"',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    nationality: 'Việt Nam',
  },
];

const seedAuthors = async () => {
  try {
    await Author.deleteMany({});
    console.log('🗑️  Deleted old authors');
    
    const createdAuthors = await Author.create(authors);
    console.log(`✅ Created ${createdAuthors.length} authors`);
    
    return createdAuthors;
  } catch (error) {
    console.error('❌ Error seeding authors:', error);
    throw error;
  }
};

module.exports = seedAuthors;