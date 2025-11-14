/**
 * ==============================================
 * MIGRATION SCRIPT
 * ==============================================
 * Đổi tên field 'language' thành 'bookLanguage'
 * để tránh conflict với MongoDB text index
 * 
 * Usage: node src/scripts/migrate-language-field.js
 */

const dotenv = require('dotenv');
const connectDatabase = require('../config/database');
const Book = require('../models/Book');

// Load env
dotenv.config();

const migrate = async () => {
  try {
    console.log('🔄 Starting migration: language -> bookLanguage');
    console.log('='.repeat(50));
    
    // Connect database
    await connectDatabase();
    
    // Find all books that have 'language' field
    const books = await Book.find({ language: { $exists: true } });
    
    if (books.length === 0) {
      console.log('✅ No books found with old "language" field');
      console.log('   Migration not needed or already completed');
      process.exit(0);
    }
    
    console.log(`📚 Found ${books.length} books to migrate`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const book of books) {
      try {
        // Copy language value to bookLanguage
        await Book.updateOne(
          { _id: book._id },
          {
            $set: { bookLanguage: book.language },
            $unset: { language: 1 }
          }
        );
        successCount++;
        console.log(`✅ Migrated: ${book.title}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed: ${book.title}`, error.message);
      }
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('='.repeat(50));
    
    if (errorCount === 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.warn('⚠️  Migration completed with some errors');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrate();
