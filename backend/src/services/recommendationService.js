/**
 * ==============================================
 * RECOMMENDATION SERVICE
 * ==============================================
 * Service xử lý logic gợi ý sách thông minh
 * Sử dụng: TF-IDF, Cosine Similarity, Content-based Filtering
 * 
 * GIẢI THÍCH THUẬT TOÁN:
 * ----------------------
 * 1. TF-IDF (Term Frequency - Inverse Document Frequency):
 *    - Đo lường tầm quan trọng của từ trong văn bản
 *    - TF: Tần suất từ xuất hiện trong văn bản
 *    - IDF: Mức độ phổ biến của từ trong toàn bộ tập dữ liệu
 *    - Từ xuất hiện nhiều trong 1 văn bản nhưng ít trong các văn bản khác -> quan trọng
 * 
 * 2. Cosine Similarity:
 *    - Đo độ tương đồng giữa 2 vector
 *    - Giá trị từ 0 (hoàn toàn khác) đến 1 (giống hệt)
 *    - Công thức: cos(θ) = (A·B) / (||A|| * ||B||)
 * 
 * 3. Content Vector Construction:
 *    - Tạo vector đặc trưng cho mỗi sách
 *    - Bao gồm: title, description, category, author
 *    - Vector này được dùng để tính similarity
 */

const Book = require('../models/Book');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Recommendation = require('../models/Recommendation');

/**
 * ==============================================
 * UTILITY FUNCTIONS
 * ==============================================
 */

/**
 * Tokenize text - tách văn bản thành các từ
 * VD: "Lập Trình JavaScript" -> ["lập", "trình", "javascript"]
 */
const tokenize = (text) => {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .normalize('NFD') // Chuẩn hóa Unicode (xử lý tiếng Việt)
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/[^a-z0-9\s]/g, ' ') // Chỉ giữ chữ và số
    .split(/\s+/) // Tách theo khoảng trắng
    .filter(word => word.length > 2); // Bỏ từ quá ngắn
};

/**
 * Tính TF (Term Frequency) - Tần suất từ
 * VD: ["javascript", "javascript", "book"] 
 *     -> { javascript: 2/3, book: 1/3 }
 */
const calculateTF = (tokens) => {
  const tf = {};
  const totalTokens = tokens.length;
  
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  
  // Normalize: chia cho tổng số từ
  Object.keys(tf).forEach(token => {
    tf[token] = tf[token] / totalTokens;
  });
  
  return tf;
};

/**
 * Tính IDF (Inverse Document Frequency)
 * VD: Từ "javascript" xuất hiện trong 5/100 sách
 *     -> IDF = log(100/5) = 1.3
 * Từ càng phổ biến -> IDF càng nhỏ
 */
const calculateIDF = (documents) => {
  const idf = {};
  const totalDocs = documents.length;
  
  // Đếm số document chứa mỗi từ
  const docFrequency = {};
  documents.forEach(tokens => {
    const uniqueTokens = [...new Set(tokens)];
    uniqueTokens.forEach(token => {
      docFrequency[token] = (docFrequency[token] || 0) + 1;
    });
  });
  
  // Tính IDF
  Object.keys(docFrequency).forEach(token => {
    idf[token] = Math.log(totalDocs / docFrequency[token]);
  });
  
  return idf;
};

/**
 * Tính TF-IDF vector cho một document
 * VD: TF-IDF = TF * IDF
 *     Kết quả: { javascript: 0.26, book: 0.13 }
 */
const calculateTFIDF = (tokens, idf) => {
  const tf = calculateTF(tokens);
  const tfidf = {};
  
  Object.keys(tf).forEach(token => {
    tfidf[token] = tf[token] * (idf[token] || 0);
  });
  
  return tfidf;
};

/**
 * Tính Cosine Similarity giữa 2 vector
 * Công thức: cos(θ) = (A·B) / (||A|| * ||B||)
 * 
 * VD: 
 * vectorA = { javascript: 0.5, book: 0.3 }
 * vectorB = { javascript: 0.4, programming: 0.6 }
 * 
 * Dot product (A·B) = 0.5*0.4 + 0.3*0 = 0.2
 * ||A|| = sqrt(0.5² + 0.3²) = 0.58
 * ||B|| = sqrt(0.4² + 0.6²) = 0.72
 * Cosine = 0.2 / (0.58 * 0.72) = 0.48
 */
const cosineSimilarity = (vectorA, vectorB) => {
  // Tính dot product (tích vô hướng)
  let dotProduct = 0;
  const keysA = Object.keys(vectorA);
  const keysB = Object.keys(vectorB);
  
  keysA.forEach(key => {
    if (vectorB[key]) {
      dotProduct += vectorA[key] * vectorB[key];
    }
  });
  
  // Tính magnitude (độ dài vector)
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  keysA.forEach(key => {
    magnitudeA += vectorA[key] * vectorA[key];
  });
  
  keysB.forEach(key => {
    magnitudeB += vectorB[key] * vectorB[key];
  });
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  // Tránh chia cho 0
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * ==============================================
 * CONTENT VECTOR CONSTRUCTION
 * ==============================================
 */

/**
 * Tạo content vector cho một sách
 * Kết hợp: title (weight: 3), description (weight: 1), category, author
 * 
 * VD: Book "Lập Trình JavaScript Nâng Cao"
 * -> Vector bao gồm: 
 *    - Title words (x3): lap, trinh, javascript, nang, cao
 *    - Description words: huong, dan, chi, tiet...
 *    - Category: lap-trinh
 *    - Author: nguyen-van-a
 */
const buildContentVector = (book) => {
  const tokens = [];
  
  // Title - quan trọng nhất (weight = 3)
  if (book.title) {
    const titleTokens = tokenize(book.title);
    tokens.push(...titleTokens, ...titleTokens, ...titleTokens);
  }
  
  // Description - quan trọng thứ 2 (weight = 1)
  if (book.description) {
    // Lấy 200 ký tự đầu để tránh quá dài
    const shortDesc = book.description.substring(0, 200);
    tokens.push(...tokenize(shortDesc));
  }
  
  // Category - thêm nhiều lần để tăng weight
  if (book.category) {
    const categoryName = typeof book.category === 'object' 
      ? book.category.name 
      : book.category.toString();
    const categoryTokens = tokenize(categoryName);
    tokens.push(...categoryTokens, ...categoryTokens);
  }
  
  // Author - thêm nhiều lần để tăng weight
  if (book.author) {
    const authorName = typeof book.author === 'object' 
      ? book.author.name 
      : book.author.toString();
    const authorTokens = tokenize(authorName);
    tokens.push(...authorTokens, ...authorTokens);
  }
  
  return tokens;
};

/**
 * ==============================================
 * MAIN RECOMMENDATION FUNCTIONS
 * ==============================================
 */

/**
 * 1. Gợi ý cho khách hàng cũ - Personalized Recommendations
 * Dựa trên: Wishlist + Order history
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Lấy sách từ wishlist và order history
 * 2. Build content vector cho mỗi sách đã xem/mua
 * 3. Tạo "user profile vector" = trung bình các vector sách
 * 4. Tìm sách mới có vector tương đồng với user profile
 * 5. Sắp xếp theo similarity score
 */
const getPersonalizedRecommendations = async (customerId, limit = 8) => {
  try {
    // 1. Lấy wishlist
    const wishlist = await Wishlist.findOne({ customer: customerId })
      .populate({
        path: 'books.book',
        select: 'title description category author',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'author', select: 'name' }
        ]
      });
    
    // 2. Lấy order history (delivered)
    const orders = await Order.find({
      customer: customerId,
      status: 'delivered',
    })
      .populate({
        path: 'items.book',
        select: 'title description category author',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'author', select: 'name' }
        ]
      })
      .limit(10)
      .sort('-createdAt');
    
    // 3. Thu thập tất cả sách đã tương tác
    const interactedBooks = [];
    const interactedBookIds = new Set();
    
    // Từ wishlist
    if (wishlist && wishlist.books) {
      wishlist.books.forEach(item => {
        if (item.book && item.book._id) {
          interactedBooks.push(item.book);
          interactedBookIds.add(item.book._id.toString());
        }
      });
    }
    
    // Từ orders
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.type === 'book' && item.book && item.book._id) {
          const bookId = item.book._id.toString();
          if (!interactedBookIds.has(bookId)) {
            interactedBooks.push(item.book);
            interactedBookIds.add(bookId);
          }
        }
      });
    });
    
    // Nếu chưa có tương tác nào, trả về trending
    if (interactedBooks.length === 0) {
      return await getTrendingBooks(limit);
    }
    
    // 4. Build content vectors cho sách đã tương tác
    const userVectors = interactedBooks.map(book => buildContentVector(book));
    
    // 5. Tạo "User Profile Vector" = trung bình các vector
    const userProfile = {};
    const allTokens = userVectors.flat();
    const uniqueTokens = [...new Set(allTokens)];
    
    uniqueTokens.forEach(token => {
      let sum = 0;
      userVectors.forEach(vector => {
        const count = vector.filter(t => t === token).length;
        sum += count / vector.length;
      });
      userProfile[token] = sum / userVectors.length;
    });
    
    // 6. Lấy tất cả sách active (loại sách đã tương tác)
    const candidateBooks = await Book.find({
      _id: { $nin: Array.from(interactedBookIds) },
      isActive: true,
    })
      .populate('category', 'name')
      .populate('author', 'name')
      .limit(100); // Giới hạn để tăng performance
    
    if (candidateBooks.length === 0) {
      return [];
    }
    
    // 7. Tính similarity cho mỗi sách
    const recommendations = candidateBooks.map(book => {
      const bookVector = buildContentVector(book);
      const bookTF = calculateTF(bookVector);
      
      // Tính cosine similarity
      const similarity = cosineSimilarity(userProfile, bookTF);
      
      return {
        book: book._id,
        score: parseFloat(similarity.toFixed(4)),
        reason: 'Based on your interests',
        bookData: book,
      };
    });
    
    // 8. Sắp xếp theo score và lấy top N
    recommendations.sort((a, b) => b.score - a.score);
    
    return recommendations.slice(0, limit);
    
  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error);
    return [];
  }
};

/**
 * 2. Gợi ý sách liên quan - Similar Books
 * Dựa trên: Title similarity, Category, Author
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Build vector cho sách gốc
 * 2. Tìm sách cùng category hoặc author
 * 3. Tính TF-IDF similarity cho title
 * 4. Kết hợp các điểm số (title: 50%, category: 30%, author: 20%)
 */
const getSimilarBooks = async (bookId, limit = 8) => {
  try {
    // 1. Lấy sách gốc
    const sourceBook = await Book.findById(bookId)
      .populate('category', 'name')
      .populate('author', 'name');
    
    if (!sourceBook) {
      return [];
    }
    
    // 2. Build vector cho sách gốc
    const sourceVector = buildContentVector(sourceBook);
    const sourceTF = calculateTF(sourceVector);
    
    // 3. Lấy sách candidates (cùng category hoặc author)
    const query = {
      _id: { $ne: bookId },
      isActive: true,
    };
    
    // Ưu tiên sách cùng category hoặc author
    if (sourceBook.category || sourceBook.author) {
      const orConditions = [];
      if (sourceBook.category) {
        orConditions.push({ category: sourceBook.category._id });
      }
      if (sourceBook.author) {
        orConditions.push({ author: sourceBook.author._id });
      }
      query.$or = orConditions;
    }
    
    const candidateBooks = await Book.find(query)
      .populate('category', 'name')
      .populate('author', 'name')
      .limit(50);
    
    if (candidateBooks.length === 0) {
      // Fallback: lấy sách trending
      return await getTrendingBooks(limit);
    }
    
    // 4. Tính similarity cho mỗi sách
    const recommendations = candidateBooks.map(book => {
      const bookVector = buildContentVector(book);
      const bookTF = calculateTF(bookVector);
      
      // Tính title similarity (TF-IDF)
      const titleSimilarity = cosineSimilarity(sourceTF, bookTF);
      
      // Bonus score cho cùng category
      let categoryBonus = 0;
      if (sourceBook.category && book.category && 
          sourceBook.category._id.toString() === book.category._id.toString()) {
        categoryBonus = 0.3;
      }
      
      // Bonus score cho cùng author
      let authorBonus = 0;
      if (sourceBook.author && book.author && 
          sourceBook.author._id.toString() === book.author._id.toString()) {
        authorBonus = 0.2;
      }
      
      // Tổng hợp score
      // Title: 50%, Category: 30%, Author: 20%
      const finalScore = (titleSimilarity * 0.5) + categoryBonus + authorBonus;
      
      let reason = 'Similar book';
      if (categoryBonus > 0 && authorBonus > 0) {
        reason = 'Same category and author';
      } else if (categoryBonus > 0) {
        reason = 'Same category';
      } else if (authorBonus > 0) {
        reason = 'Same author';
      } else if (titleSimilarity > 0.5) {
        reason = 'Similar title';
      }
      
      return {
        book: book._id,
        score: parseFloat(finalScore.toFixed(4)),
        reason,
        bookData: book,
      };
    });
    
    // 5. Sắp xếp và lấy top N
    recommendations.sort((a, b) => b.score - a.score);
    
    return recommendations.slice(0, limit);
    
  } catch (error) {
    console.error('Error in getSimilarBooks:', error);
    return [];
  }
};

/**
 * 3. Gợi ý sách trending - Popular Books
 * Dựa trên: Purchase count, Rating, View count
 * 
 * SCORE = (purchaseCount * 0.5) + (averageRating * 10 * 0.3) + (viewCount * 0.0001 * 0.2)
 */
const getTrendingBooks = async (limit = 8) => {
  try {
    const books = await Book.find({ isActive: true })
      .populate('category', 'name')
      .populate('author', 'name')
      .limit(100)
      .sort('-purchaseCount -averageRating');
    
    const recommendations = books.map(book => {
      // Tính trending score
      const purchaseScore = book.purchaseCount * 0.5;
      const ratingScore = book.averageRating * 10 * 0.3;
      const viewScore = book.viewCount * 0.0001 * 0.2;
      
      const trendingScore = purchaseScore + ratingScore + viewScore;
      
      return {
        book: book._id,
        score: parseFloat(trendingScore.toFixed(4)),
        reason: 'Trending book',
        bookData: book,
      };
    });
    
    recommendations.sort((a, b) => b.score - a.score);
    
    return recommendations.slice(0, limit);
    
  } catch (error) {
    console.error('Error in getTrendingBooks:', error);
    return [];
  }
};

/**
 * ==============================================
 * CACHE MANAGEMENT
 * ==============================================
 */

/**
 * Lưu recommendation vào database (cache)
 */
const saveRecommendationCache = async (customerId, type, sourceBook, recommendations) => {
  try {
    // Xóa cache cũ
    await Recommendation.deleteMany({
      customer: customerId,
      recommendationType: type,
      sourceBook: sourceBook || undefined,
    });
    
    // Tạo cache mới
    const recommendation = await Recommendation.create({
      customer: customerId,
      recommendationType: type,
      sourceBook: sourceBook,
      algorithm: 'hybrid',
      recommendedBooks: recommendations.map(rec => ({
        book: rec.book,
        score: rec.score,
        reason: rec.reason,
      })),
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 ngày
    });
    
    return recommendation;
  } catch (error) {
    console.error('Error saving recommendation cache:', error);
    return null;
  }
};

/**
 * Lấy recommendation từ cache
 */
const getRecommendationCache = async (customerId, type, sourceBook = null) => {
  try {
    const query = {
      customer: customerId,
      recommendationType: type,
      expiresAt: { $gt: new Date() },
    };
    
    if (sourceBook) {
      query.sourceBook = sourceBook;
    }
    
    const recommendation = await Recommendation.findOne(query)
      .populate({
        path: 'recommendedBooks.book',
        select: 'title slug images salePrice originalPrice averageRating reviewCount purchaseCount',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'author', select: 'name' }
        ]
      });
    
    return recommendation;
  } catch (error) {
    console.error('Error getting recommendation cache:', error);
    return null;
  }
};

/**
 * Xóa toàn bộ cache recommendations của customer
 * (Gọi khi user thay đổi wishlist hoặc tạo order mới)
 */
const clearRecommendationCacheForCustomer = async (customerId) => {
  try {
    const result = await Recommendation.deleteMany({ customer: customerId });
    console.log(`🗑️ Cleared ${result.deletedCount} recommendation cache(s) for customer ${customerId}`);
    return result;
  } catch (error) {
    console.error('Error clearing recommendation cache:', error);
    return null;
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getSimilarBooks,
  getTrendingBooks,
  saveRecommendationCache,
  getRecommendationCache,
  clearRecommendationCacheForCustomer,
  
  // Export utility functions cho testing
  tokenize,
  calculateTF,
  calculateIDF,
  calculateTFIDF,
  cosineSimilarity,
  buildContentVector,
};
