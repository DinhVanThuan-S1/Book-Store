/**
 * ==============================================
 * CATEGORY SEEDER
 * ==============================================
 * Tạo danh mục sách mẫu
 */

const Category = require('../models/Category');

const categories = [
  {
    name: 'Văn học',
    description: 'Sách văn học trong nước và nước ngoài',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300',
    isActive: true,
  },
  {
    name: 'Kinh tế',
    description: 'Sách về kinh tế, quản trị, kinh doanh',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300',
    isActive: true,
  },
  {
    name: 'Tâm lý - Kỹ năng sống',
    description: 'Sách về tâm lý học, phát triển bản thân',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300',
    isActive: true,
  },
  {
    name: 'Thiếu nhi',
    description: 'Sách dành cho trẻ em và thanh thiếu niên',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300',
    isActive: true,
  },
  {
    name: 'Giáo khoa - Tham khảo',
    description: 'Sách giáo khoa và sách tham khảo học tập',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300',
    isActive: true,
  },
  {
    name: 'Khoa học - Công nghệ',
    description: 'Sách về khoa học, công nghệ, lập trình',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300',
    isActive: true,
  },
  {
    name: 'Lịch sử',
    description: 'Sách về lịch sử Việt Nam và thế giới',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300',
    isActive: true,
  },
  {
    name: 'Truyện tranh - Manga',
    description: 'Truyện tranh, manga, comic',
    image: 'https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=300',
    isActive: true,
  },
  {
    name: 'Ngoại ngữ',
    description: 'Sách học ngoại ngữ (Anh, Nhật, Hàn...)',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300',
    isActive: true,
  },
  {
    name: 'Nghệ thuật - Giải trí',
    description: 'Sách về nghệ thuật, âm nhạc, điện ảnh',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300',
    isActive: true,
  },
];

/**
 * Seed categories
 */
const seedCategories = async () => {
  try {
    await Category.deleteMany({});
    console.log('🗑️  Deleted old categories');
    
    const createdCategories = await Category.create(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);
    
    return createdCategories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

module.exports = seedCategories;