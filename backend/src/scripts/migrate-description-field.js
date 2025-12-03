/**
 * ==============================================
 * MIGRATION: Gộp description và fullDescription
 * ==============================================
 * Script để gộp 2 trường mô tả thành 1
 * - Ưu tiên fullDescription nếu có (HTML rich text)
 * - Fallback sang description và wrap trong <p>
 * - Xóa trường fullDescription sau khi gộp
 * 
 * Usage: node src/scripts/migrate-description-field.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookstore';

async function migrateDescriptions() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const booksCollection = db.collection('books');

    // Lấy tất cả sách
    const books = await booksCollection.find({}).toArray();
    console.log(`📚 Found ${books.length} books to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const book of books) {
      // Quyết định nội dung mô tả
      let newDescription = '';
      
      // Ưu tiên fullDescription (HTML) nếu có
      if (book.fullDescription) {
        newDescription = book.fullDescription;
      } 
      // Nếu không có fullDescription, dùng description và wrap trong <p>
      else if (book.description) {
        // Convert plain text to HTML với text-align justify
        const paragraphs = book.description.split('\n').filter(p => p.trim());
        newDescription = paragraphs.map(p => `<p style="text-align: justify;">${p}</p>`).join('');
      } 
      // Nếu không có gì, tạo placeholder
      else {
        newDescription = `<h3>${book.title}</h3><p style="text-align: justify;">Chưa có mô tả cho sách này.</p>`;
      }

      // Cập nhật và xóa fullDescription
      const result = await booksCollection.updateOne(
        { _id: book._id },
        { 
          $set: { description: newDescription },
          $unset: { fullDescription: '' }
        }
      );

      if (result.modifiedCount > 0) {
        updated++;
        console.log(`✅ Updated: ${book.title}`);
      } else {
        skipped++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   - Total books: ${books.length}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log('✅ Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
migrateDescriptions();
