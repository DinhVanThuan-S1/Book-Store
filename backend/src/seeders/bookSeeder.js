/**
 * ==============================================
 * BOOK SEEDER
 * ==============================================
 * Tạo sách mẫu với dữ liệu thực tế
 */

const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Category = require('../models/Category');

/**
 * Seed books
 */
const seedBooks = async () => {
  try {
    // Xóa dữ liệu cũ
    await Book.deleteMany({});
    await BookCopy.deleteMany({});
    console.log('🗑️  Deleted old books and copies');
    
    // Lấy IDs của các entities
    const authors = await Author.find();
    const publishers = await Publisher.find();
    const categories = await Category.find();
    
    // Helper function để lấy random ID
    const getRandomId = (array) => array[Math.floor(Math.random() * array.length)]._id;
    
    // Danh sách sách mẫu
    const books = [
      // Văn học
      {
        title: 'Tôi thấy hoa vàng trên cỏ xanh',
        author: authors.find(a => a.name === 'Nguyễn Nhật Ánh')._id,
        publisher: publishers.find(p => p.name === 'NXB Trẻ')._id,
        category: categories.find(c => c.name === 'Văn học')._id,
        isbn: '9786041032305',
        publishYear: 2018,
        pages: 368,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Truyện kể về tuổi thơ nghèo khó nhưng đầy ắp tình cảm, tình bạn, tình yêu thương của ba anh em Thiều, Tường và Tùng.',
        fullDescription: '<p>Truyện kể về tuổi thơ nghèo khó nhưng đầy ắp tình cảm, tình bạn, tình yêu thương của ba anh em Thiều, Tường và Tùng.</p>',
        images: [
          'https://salt.tikicdn.com/cache/280x280/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
        ],
        originalPrice: 120000,
        salePrice: 99000,
        isActive: true,
      },
      {
        title: 'Mắt biếc',
        author: authors.find(a => a.name === 'Nguyễn Nhật Ánh')._id,
        publisher: publishers.find(p => p.name === 'NXB Trẻ')._id,
        category: categories.find(c => c.name === 'Văn học')._id,
        isbn: '9786041032299',
        publishYear: 2017,
        pages: 272,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Câu chuyện tình đầu dang dở của Ngạn và Hà Lan - một tình yêu thuần khiết, trong trắng.',
        fullDescription: '<p>Mắt Biếc là một tác phẩm văn học thuộc thể loại tiểu thuyết tình cảm lãng mạn của nhà văn Nguyễn Nhật Ánh.</p>',
        images: [
          'https://salt.tikicdn.com/cache/280x280/ts/product/a0/25/80/22c19f8c0e5e5f48bec49e6b4f8e12fa.jpg',
        ],
        originalPrice: 110000,
        salePrice: 88000,
        isActive: true,
      },
      
      // Truyện tranh
      {
        title: 'Thám tử lừng danh Conan - Tập 1',
        author: authors.find(a => a.name === 'Aoyama Gosho')._id,
        publisher: publishers.find(p => p.name === 'NXB Kim Đồng')._id,
        category: categories.find(c => c.name === 'Truyện tranh - Manga')._id,
        isbn: '9786042137652',
        publishYear: 2020,
        pages: 192,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Thám tử học sinh trung học Kudo Shinichi bị teo nhỏ thành cậu bé tiểu học và phải sống với cái tên Edogawa Conan.',
        fullDescription: '<p>Câu chuyện về cậu học sinh trung học Kudo Shinichi, một thám tử tài ba...</p>',
        images: [
          'https://salt.tikicdn.com/cache/280x280/ts/product/da/ef/45/59b821be85ea2ebdea8c0fa31e8ae6db.jpg',
        ],
        originalPrice: 25000,
        salePrice: 22000,
        isActive: true,
      },
      {
        title: 'Thám tử lừng danh Conan - Tập 2',
        author: authors.find(a => a.name === 'Aoyama Gosho')._id,
        publisher: publishers.find(p => p.name === 'NXB Kim Đồng')._id,
        category: categories.find(c => c.name === 'Truyện tranh - Manga')._id,
        isbn: '9786042137669',
        publishYear: 2020,
        pages: 192,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Conan tiếp tục hành trình phá án cùng Mori Ran và Mori Kogoro.',
        fullDescription: '<p>Tập 2 tiếp tục câu chuyện phiêu lưu của thám tử nhỏ Conan...</p>',
        images: [
          'https://salt.tikicdn.com/cache/280x280/ts/product/5e/6d/11/b7cb31fca27303c73e6bf55d8560dcc0.jpg',
        ],
        originalPrice: 25000,
        salePrice: 22000,
        isActive: true,
      },
      
      // Tâm lý - Kỹ năng sống
      {
        title: 'Đắc nhân tâm',
        author: authors.find(a => a.name === 'Dale Carnegie')._id,
        publisher: publishers.find(p => p.name === 'NXB Tổng hợp TP.HCM')._id,
        category: categories.find(c => c.name === 'Tâm lý - Kỹ năng sống')._id,
        isbn: '9786045645017',
        publishYear: 2019,
        pages: 320,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử.',
        fullDescription: '<p>Đắc Nhân Tâm của Dale Carnegie là cuốn sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại.</p>',
        images: [
          'https://salt.tikicdn.com/cache/280x280/ts/product/e6/28/9b/70e2e5c27063da2cbbbc6a5fc6f4d89e.jpg',
        ],
        originalPrice: 86000,
        salePrice: 68000,
        isActive: true,
      },
      {
        title: 'Trên đường băng',
        author: authors.find(a => a.name === 'Tony Buổi Sáng')._id,
        publisher: publishers.find(p => p.name === 'NXB Lao động')._id,
        category: categories.find(c => c.name === 'Tâm lý - Kỹ năng sống')._id,
        isbn: '9786041106338',
        publishYear: 2018,
        pages: 248,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Câu chuyện về hành trình tìm kiếm và xây dựng ước mơ.',
        fullDescription: '<p>Trên Đường Băng là những câu chuyện truyền cảm hứng về giấc mơ và khát vọng...</p>',
        images: [
          'https://salt.tikicdn.com/cache/280x280/ts/product/c9/07/be/8a8f5bc6b59e6f3974b5bb31e5cd0deb.jpg',
        ],
        originalPrice: 75000,
        salePrice: 63000,
        isActive: true,
      },
      
      // Kinh tế
      {
        title: 'Dạy con làm giàu - Tập 1',
        author: authors.find(a => a.name === 'Robert Kiyosaki')._id,
        publisher: publishers.find(p => p.name === 'NXB Lao động')._id,
        category: categories.find(c => c.name === 'Kinh tế')._id,
        isbn: '9786041032152',
        publishYear: 2019,
        pages: 288,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Cuốn sách về tư duy tài chính và đầu tư dành cho mọi người.',
        fullDescription: '<p>Cuốn sách giúp bạn hiểu về tiền bạc và cách làm việc với đồng tiền...</p>',
        images: [
          'https://salt.tikicdn.com/cache/280x280/ts/product/f6/e6/cb/2b51e56f7e3e4c36b2e79e98e6e98e93.jpg',
        ],
        originalPrice: 95000,
        salePrice: 78000,
        isActive: true,
      },
      
      // Thiếu nhi
      {
        title: 'Dế Mèn phiêu lưu ký',
        author: authors.find(a => a.name === 'Tô Hoài')._id,
        publisher: publishers.find(p => p.name === 'NXB Kim Đồng')._id,
        category: categories.find(c => c.name === 'Thiếu nhi')._id,
        isbn: '9786042007092',
        publishYear: 2018,
        pages: 176,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Câu chuyện về chú Dế Mèn và cuộc phiêu lưu kỳ thú.',
        fullDescription: '<p>Dế Mèn Phiêu Lưu Ký là tác phẩm văn học thiếu nhi kinh điển của Việt Nam...</p>',
        images: [
          'https://salt.tikicdn.com/cache/280x280/ts/product/c6/24/b7/fc4e6b7de978976bb135d3abc90b1b1b.jpg',
        ],
        originalPrice: 45000,
        salePrice: 39000,
        isActive: true,
      },
      
      // Ngoại ngữ
      {
        title: 'English Grammar in Use',
        author: getRandomId(authors),
        publisher: publishers.find(p => p.name === 'NXB Tổng hợp TP.HCM')._id,
        category: categories.find(c => c.name === 'Ngoại ngữ')._id,
        isbn: '9781108457651',
        publishYear: 2019,
        pages: 394,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Sách ngữ pháp tiếng Anh phổ biến nhất thế giới.',
        fullDescription: '<p>English Grammar in Use là cuốn sách ngữ pháp dành cho người học tiếng Anh...</p>',
        images: [
          'https://salt.tikicdn.com/cache/280x280/ts/product/32/68/35/5a86288beccccc8a34468e6dd3b4e82a.jpg',
        ],
        originalPrice: 250000,
        salePrice: 225000,
        isActive: true,
      },
      
      // Giáo khoa
      {
        title: 'Toán 10 - Sách giáo khoa',
        author: getRandomId(authors),
        publisher: publishers.find(p => p.name === 'NXB Giáo dục Việt Nam')._id,
        category: categories.find(c => c.name === 'Giáo khoa - Tham khảo')._id,
        isbn: '9786041149663',
        publishYear: 2021,
        pages: 256,
        bookLanguage: 'English',
        format: 'paperback',
        description: 'Sách giáo khoa môn Toán lớp 10.',
        fullDescription: '<p>Sách giáo khoa môn Toán lớp 10 theo chương trình mới...</p>',
        images: [
          'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=280',
        ],
        originalPrice: 50000,
        salePrice: 45000,
        isActive: true,
      },
    ];
    
    // Tạo sách
    const createdBooks = await Book.create(books);
    console.log(`✅ Created ${createdBooks.length} books`);
    
    // Tạo bản sao cho mỗi sách (10-50 copies)
    let totalCopies = 0;
    
    for (const book of createdBooks) {
      const copyCount = Math.floor(Math.random() * 41) + 10; // 10-50 copies
      const copies = [];
      
      for (let i = 0; i < copyCount; i++) {
        copies.push({
          book: book._id,
          copyCode: `${book.isbn}-${i + 1}`, // 👈 thêm dòng này
          importPrice: book.salePrice * 0.6, // 60% giá bán
          condition: 'new',
          warehouseLocation: `Kệ ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 10) + 1}`,
          status: 'available',
        });
      }
      
      await BookCopy.create(copies);
      totalCopies += copyCount;
      
      console.log(`   📦 Created ${copyCount} copies for "${book.title}"`);
    }
    
    console.log(`✅ Created total ${totalCopies} book copies`);
    
    return createdBooks;
  } catch (error) {
    console.error('❌ Error seeding books:', error);
    throw error;
  }
};

module.exports = seedBooks;
