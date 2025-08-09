import api from '../api';

export class AIAssistant {
  constructor(userLanguage = 'en', user = null) {
    this.userLanguage = userLanguage;
    this.user = user;
    this.products = [];
    this.orders = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Fetch products for recommendations
      const productsResponse = await api.get('/products/');
      this.products = productsResponse.data;

      // Fetch user orders if logged in
      if (this.user) {
        try {
          const ordersResponse = await api.get('/orders/my-orders/');
          this.orders = ordersResponse.data;
        } catch (error) {
          console.log('Could not fetch orders:', error);
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing AI Assistant:', error);
    }
  }

  async generateResponse(userMessage, context = {}) {
    await this.initialize();
    
    const message = userMessage.toLowerCase();
    const intent = this.detectIntent(message);
    
    switch (intent) {
      case 'product_search':
        return this.handleProductSearch(message);
      case 'product_recommendation':
        return this.handleProductRecommendation(message);
      case 'order_inquiry':
        return this.handleOrderInquiry(message);
      case 'pricing_inquiry':
        return this.handlePricingInquiry(message);
      case 'category_browse':
        return this.handleCategoryBrowse(message);
      case 'comparison_request':
        return this.handleProductComparison(message);
      case 'support_request':
        return this.handleSupportRequest(message);
      case 'greeting':
        return this.handleGreeting();
      
      // New specific question handlers
      case 'shipping_policy':
        return this.handleShippingPolicy(message);
      case 'return_policy':
        return this.handleReturnPolicy(message);
      case 'payment_methods':
        return this.handlePaymentMethods(message);
      case 'warranty_info':
        return this.handleWarrantyInfo(message);
      case 'size_guide':
        return this.handleSizeGuide(message);
      case 'availability_check':
        return this.handleAvailabilityCheck(message);
      case 'bulk_order':
        return this.handleBulkOrder(message);
      case 'technical_specs':
        return this.handleTechnicalSpecs(message);
      case 'store_location':
        return this.handleStoreLocation(message);
      case 'account_help':
        return this.handleAccountHelp(message);
        
      default:
        return this.handleDefault(message);
    }
  }

  detectIntent(message) {
    const intents = {
      product_search: ['search', 'find', 'looking for', 'show me', 'need', 'want', 'available'],
      product_recommendation: ['recommend', 'suggest', 'best', 'popular', 'trending', 'top rated'],
      order_inquiry: ['order', 'delivery', 'shipping', 'track', 'status', 'when will', 'arrived'],
      pricing_inquiry: ['price', 'cost', 'expensive', 'cheap', 'discount', 'offer', 'sale', 'how much'],
      category_browse: ['category', 'electronics', 'watches', 'fashion', 'books', 'sports', 'home'],
      comparison_request: ['compare', 'vs', 'versus', 'difference', 'better', 'which one'],
      support_request: ['help', 'support', 'problem', 'issue', 'contact', 'complain'],
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'thanks', 'thank you'],
      
      // New specific question intents
      shipping_policy: ['shipping', 'delivery time', 'how long', 'when arrive', 'shipping cost', 'free delivery'],
      return_policy: ['return', 'refund', 'exchange', 'money back', 'not satisfied', 'cancel order'],
      payment_methods: ['payment', 'pay', 'credit card', 'bkash', 'nagad', 'cash on delivery', 'cod'],
      warranty_info: ['warranty', 'guarantee', 'repair', 'replacement', 'coverage', 'defective'],
      size_guide: ['size', 'measurement', 'fit', 'dimension', 'length', 'width', 'height'],
      availability_check: ['in stock', 'available', 'out of stock', 'when restock', 'inventory'],
      bulk_order: ['bulk', 'wholesale', 'quantity', 'large order', 'business', 'corporate'],
      technical_specs: ['specification', 'specs', 'features', 'technical', 'details', 'model'],
      store_location: ['store', 'location', 'address', 'visit', 'physical store', 'branch'],
      account_help: ['account', 'login', 'password', 'register', 'profile', 'update info']
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return intent;
      }
    }

    return 'default';
  }

  handleProductSearch(message) {
    const searchTerms = this.extractSearchTerms(message);
    const results = this.searchProducts(searchTerms);
    
    if (results.length === 0) {
      return this.getLocalizedMessage('no_products_found', { searchTerms: searchTerms.join(', ') });
    }

    const topResults = results.slice(0, 3);
    return this.formatProductResults(topResults, 'search_results');
  }

  handleProductRecommendation(message) {
    let recommendations = [];
    
    if (this.user && this.orders.length > 0) {
      // Personalized recommendations based on order history
      recommendations = this.getPersonalizedRecommendations();
    } else {
      // General popular products
      recommendations = this.getPopularProducts();
    }

    return this.formatProductResults(recommendations, 'recommendations');
  }

  handleOrderInquiry(message) {
    if (!this.user) {
      return this.getLocalizedMessage('login_required_orders');
    }

    if (this.orders.length === 0) {
      return this.getLocalizedMessage('no_orders_found');
    }

    const recentOrder = this.orders[0];
    return this.formatOrderInfo(recentOrder);
  }

  handlePricingInquiry(message) {
    const searchTerms = this.extractSearchTerms(message);
    const products = this.searchProducts(searchTerms);

    if (products.length === 0) {
      return this.getLocalizedMessage('no_products_for_pricing');
    }

    return this.formatPricingInfo(products.slice(0, 3));
  }

  handleCategoryBrowse(message) {
    const category = this.extractCategory(message);
    const categoryProducts = this.products.filter(p => 
      p.category && p.category.toLowerCase().includes(category.toLowerCase())
    );

    if (categoryProducts.length === 0) {
      return this.getLocalizedMessage('no_category_products', { category });
    }

    return this.formatProductResults(categoryProducts.slice(0, 3), 'category_browse');
  }

  handleProductComparison(message) {
    const searchTerms = this.extractSearchTerms(message);
    const products = this.searchProducts(searchTerms);

    if (products.length < 2) {
      return this.getLocalizedMessage('insufficient_products_comparison');
    }

    return this.formatProductComparison(products.slice(0, 2));
  }

  handleSupportRequest(message) {
    return this.getLocalizedMessage('support_response');
  }

  handleGreeting() {
    const userName = this.user ? this.user.name : null;
    return this.getLocalizedMessage('greeting', { userName });
  }

  handleDefault(message) {
    return this.getLocalizedMessage('default_response');
  }

  // New specific question handlers
  handleShippingPolicy(message) {
    return this.getLocalizedMessage('shipping_policy');
  }

  handleReturnPolicy(message) {
    return this.getLocalizedMessage('return_policy');
  }

  handlePaymentMethods(message) {
    return this.getLocalizedMessage('payment_methods');
  }

  handleWarrantyInfo(message) {
    const searchTerms = this.extractSearchTerms(message);
    const products = this.searchProducts(searchTerms);
    
    if (products.length > 0) {
      return this.getLocalizedMessage('warranty_info_with_product', { 
        productName: products[0].name 
      });
    }
    return this.getLocalizedMessage('warranty_info_general');
  }

  handleSizeGuide(message) {
    const searchTerms = this.extractSearchTerms(message);
    const products = this.searchProducts(searchTerms);
    
    if (products.length > 0) {
      const product = products[0];
      if (product.category && (product.category.toLowerCase().includes('fashion') || 
                             product.category.toLowerCase().includes('clothing'))) {
        return this.getLocalizedMessage('size_guide_clothing');
      }
    }
    return this.getLocalizedMessage('size_guide_general');
  }

  handleAvailabilityCheck(message) {
    const searchTerms = this.extractSearchTerms(message);
    const products = this.searchProducts(searchTerms);
    
    if (products.length > 0) {
      const product = products[0];
      return this.getLocalizedMessage('availability_check_specific', {
        productName: product.name,
        inStock: product.in_stock,
        stockQuantity: product.stock_quantity || 0
      });
    }
    return this.getLocalizedMessage('availability_check_general');
  }

  handleBulkOrder(message) {
    return this.getLocalizedMessage('bulk_order');
  }

  handleTechnicalSpecs(message) {
    const searchTerms = this.extractSearchTerms(message);
    const products = this.searchProducts(searchTerms);
    
    if (products.length > 0) {
      const product = products[0];
      return this.formatTechnicalSpecs(product);
    }
    return this.getLocalizedMessage('technical_specs_general');
  }

  handleStoreLocation(message) {
    return this.getLocalizedMessage('store_location');
  }

  handleAccountHelp(message) {
    if (message.includes('login') || message.includes('password')) {
      return this.getLocalizedMessage('account_login_help');
    } else if (message.includes('register') || message.includes('signup')) {
      return this.getLocalizedMessage('account_register_help');
    }
    return this.getLocalizedMessage('account_general_help');
  }

  // Utility Methods
  extractSearchTerms(message) {
    const commonWords = ['i', 'want', 'need', 'looking', 'for', 'show', 'me', 'find', 'search'];
    return message.split(' ')
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 3);
  }

  extractCategory(message) {
    const categories = ['electronics', 'watches', 'fashion', 'books', 'sports', 'home'];
    return categories.find(cat => message.includes(cat)) || 'general';
  }

  searchProducts(searchTerms) {
    if (searchTerms.length === 0) return this.products.slice(0, 5);

    return this.products.filter(product => {
      const searchText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term.toLowerCase()));
    });
  }

  getPersonalizedRecommendations() {
    // Get categories from user's order history
    const userCategories = [...new Set(
      this.orders.flatMap(order => 
        order.items.map(item => item.category).filter(Boolean)
      )
    )];

    // Recommend products from similar categories
    return this.products
      .filter(product => userCategories.includes(product.category))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }

  getPopularProducts() {
    return this.products
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }

  // Formatting Methods
  formatProductResults(products, type) {
    const introMessage = this.getLocalizedMessage(`${type}_intro`);
    const productList = products.map((product, index) => 
      `${index + 1}. **${product.name}** - ৳${product.price}\n   ${product.description?.substring(0, 80)}...`
    ).join('\n\n');

    return `${introMessage}\n\n${productList}\n\n${this.getLocalizedMessage('more_help')}`;
  }

  formatOrderInfo(order) {
    return this.getLocalizedMessage('order_info', {
      orderId: order.order_id,
      status: order.order_status,
      total: order.total_amount
    });
  }

  formatPricingInfo(products) {
    const priceList = products.map(product =>
      `• **${product.name}**: ৳${product.price}`
    ).join('\n');

    return `${this.getLocalizedMessage('pricing_info')}\n\n${priceList}`;
  }

  formatProductComparison(products) {
    const [product1, product2] = products;
    return this.getLocalizedMessage('product_comparison', {
      product1: product1.name,
      price1: product1.price,
      product2: product2.name,
      price2: product2.price
    });
  }

  formatTechnicalSpecs(product) {
    let specs = `**${product.name}** - Technical Specifications:\n\n`;
    
    if (product.price) {
      specs += `💰 **Price**: ৳${product.price}\n`;
    }
    
    if (product.category) {
      specs += `📂 **Category**: ${product.category}\n`;
    }
    
    if (product.brand) {
      specs += `🏷️ **Brand**: ${product.brand}\n`;
    }
    
    if (product.features && product.features.length > 0) {
      specs += `✨ **Features**:\n`;
      product.features.slice(0, 5).forEach(feature => {
        specs += `   • ${feature}\n`;
      });
    }
    
    if (product.description) {
      specs += `📝 **Description**: ${product.description}\n`;
    }
    
    if (product.stock_quantity !== undefined) {
      specs += `📦 **Stock**: ${product.stock_quantity} units available\n`;
    }
    
    specs += `\n${this.getLocalizedMessage('need_more_specs')}`;
    
    return specs;
  }

  // Localization
  getLocalizedMessage(key, params = {}) {
    const messages = {
      en: {
        // Existing messages
        no_products_found: `I couldn't find any products matching "${params.searchTerms}". Would you like me to show you our popular items instead?`,
        search_results_intro: "Here are the products I found for you:",
        recommendations_intro: this.user 
          ? `Based on your shopping history, here are my recommendations for you, ${this.user.name}:`
          : "Here are some popular products you might like:",
        category_browse_intro: "Here are some great products in this category:",
        login_required_orders: "To check your orders, please log in to your account first.",
        no_orders_found: "You don't have any orders yet. Would you like to browse our products?",
        no_products_for_pricing: "I couldn't find products to show pricing for. Could you be more specific?",
        no_category_products: `I couldn't find products in the ${params.category} category. Let me know what else you're looking for!`,
        insufficient_products_comparison: "I need at least 2 products to compare. Could you specify which products you'd like to compare?",
        support_response: "I'm here to help! For complex issues, you can also contact our support team at support@yourstore.com or call +880-XXXX-XXXX.",
        greeting: params.userName 
          ? `Hello ${params.userName}! 👋 Welcome back! How can I help you find the perfect product today?`
          : "Hello! 👋 Welcome to our store! I'm your AI shopping assistant. How can I help you today?",
        default_response: "I'd be happy to help you! Could you tell me more about what you're looking for?",
        more_help: "Would you like more details about any of these products?",
        pricing_info: "Here are the current prices:",
        order_info: `Your recent order ${params.orderId} is currently ${params.status}. Total amount: ৳${params.total}`,
        product_comparison: `Comparing **${params.product1}** (৳${params.price1}) vs **${params.product2}** (৳${params.price2}). Would you like detailed specifications?`,

        // New detailed policy messages
        shipping_policy: `🚚 **Shipping & Delivery Information**

**Delivery Areas**: We deliver nationwide in Bangladesh
**Delivery Time**: 
   • Dhaka: 1-2 business days
   • Other cities: 2-4 business days
   • Remote areas: 3-7 business days

**Shipping Costs**:
   • FREE shipping on orders over ৳1000
   • Dhaka: ৳60
   • Outside Dhaka: ৳100-150

**Delivery Options**:
   • Standard delivery
   • Express delivery (extra charges apply)
   • Cash on Delivery (COD) available

**Tracking**: You'll receive SMS/email with tracking details once shipped.

Need help with a specific order? Just ask! 📦`,

        return_policy: `🔄 **Return & Refund Policy**

**Return Window**: 7 days from delivery date
**Condition**: Items must be unused, in original packaging

**What can be returned**:
   ✅ Damaged or defective items
   ✅ Wrong item received
   ✅ Items not as described

**What cannot be returned**:
   ❌ Used/worn items
   ❌ Custom/personalized products
   ❌ Electronics after 7 days

**Refund Process**:
   1. Contact us within 7 days
   2. Return the item (we arrange pickup)
   3. Refund processed within 5-7 business days

**How to return**: Call +880-XXXX-XXXX or email returns@yourstore.com

Questions about a specific order? I'm here to help! 💙`,

        payment_methods: `💳 **Payment Methods We Accept**

**Mobile Banking**:
   📱 bKash - Instant payment
   📱 Nagad - Quick & secure
   📱 Rocket - Fast transfers

**Online Banking**:
   🏦 All major banks supported
   💻 Visa/MasterCard
   💻 American Express

**Cash Payment**:
   💰 Cash on Delivery (COD)
   📍 Pay at our physical store

**Digital Wallets**:
   📲 PayPal (coming soon)
   📲 Google Pay (coming soon)

**Security**: All payments are SSL encrypted and 100% secure.

**Payment Issues?** Contact our payment support team anytime! 🔒`,

        warranty_info_general: `🛡️ **Warranty Information**

**Standard Warranty**: 1 year on all electronics
**Extended Warranty**: Available for purchase

**What's Covered**:
   ✅ Manufacturing defects
   ✅ Hardware malfunctions
   ✅ Free repair/replacement

**What's NOT Covered**:
   ❌ Physical damage
   ❌ Water damage
   ❌ Normal wear & tear

**Claim Process**:
   1. Contact us with order details
   2. Send photos if needed
   3. We arrange pickup/repair
   4. Free replacement if unrepairable

**Contact**: warranty@yourstore.com | +880-XXXX-XXXX

Which product warranty are you asking about? 🔧`,

        warranty_info_with_product: `🛡️ **Warranty for ${params.productName}**

This product comes with:
   • 1 year manufacturer warranty
   • Free repair/replacement for defects
   • 24/7 customer support

**To claim warranty**: Contact us with your order number and issue description.

Need more specific warranty details? Let me know! 🔧`,

        size_guide_clothing: `📏 **Clothing Size Guide**

**How to Measure**:
   • Chest: Around fullest part
   • Waist: Around narrowest part
   • Hips: Around fullest part

**Size Chart**:
   • **XS**: Chest 32-34", Waist 26-28"
   • **S**: Chest 34-36", Waist 28-30"
   • **M**: Chest 36-38", Waist 30-32"
   • **L**: Chest 38-40", Waist 32-34"
   • **XL**: Chest 40-42", Waist 34-36"

**Tips**:
   • Measure with light clothing
   • Use a flexible measuring tape
   • When in doubt, size up

**Still unsure?** Contact us with your measurements! 👗`,

        size_guide_general: `📏 **Size & Measurement Guide**

For accurate sizing:
   1. Check product description for dimensions
   2. Compare with items you already own
   3. Contact us if measurements aren't clear

**Need help with specific product sizing?** Just tell me which item you're interested in!

**Measurement questions?** Our team can help: +880-XXXX-XXXX 📐`,

        availability_check_specific: params.inStock 
          ? `✅ **${params.productName}** is currently IN STOCK!

📦 **Available quantity**: ${params.stockQuantity} units
🚚 **Delivery**: Ships within 1-2 business days
💨 **Fast checkout**: Add to cart now to secure your item

Want to place an order? I can guide you through the process! 🛒`
          : `❌ **${params.productName}** is currently OUT OF STOCK

📧 **Get notified**: We'll email you when it's back
🔄 **Restock estimate**: Usually 1-2 weeks
🔍 **Alternatives**: Let me suggest similar products

Would you like me to show you similar items that are available? 🔍`,

        availability_check_general: `📦 **Stock Information**

Most of our products are in stock and ready to ship!

To check specific product availability:
   • Search for the product name
   • Check the product page for stock status
   • Ask me about any specific item

**Need immediate availability?** Tell me which product you're looking for! 🔍`,

        bulk_order: `📦 **Bulk & Wholesale Orders**

**Minimum Order**: 10+ pieces for bulk pricing
**Discounts Available**:
   • 10-50 pieces: 5% off
   • 51-100 pieces: 10% off
   • 100+ pieces: 15% off (custom quote)

**Business Benefits**:
   ✅ Priority support
   ✅ Flexible payment terms
   ✅ Custom packaging available
   ✅ Dedicated account manager

**Industries We Serve**:
   • Corporate offices
   • Educational institutions
   • Retail resellers
   • Event organizers

**Contact**: bulk@yourstore.com | +880-XXXX-XXXX
**Requirements**: Business license may be required for wholesale pricing

Ready to place a bulk order? Let me connect you with our business team! 🏢`,

        technical_specs_general: `🔧 **Technical Specifications**

For detailed product specifications:
   1. Visit the product page
   2. Check the "Technical Details" section
   3. Download product manuals if available

**Need specific tech info?** Tell me which product you're interested in, and I'll provide detailed specifications!

**Technical support**: tech@yourstore.com | +880-XXXX-XXXX 💻`,

        need_more_specs: "Need more detailed specifications? Visit the product page or contact our technical team!",

        store_location: `📍 **Store Locations & Contact**

**Main Store**:
   📍 123 Main Street, Dhaka-1000
   🕒 Open: 9:00 AM - 9:00 PM (7 days)
   📞 Phone: +880-2-XXXX-XXXX

**Branch Locations**:
   📍 Chittagong: City Center Mall
   📍 Sylhet: Zindabazar Shopping Complex
   📍 Khulna: Royal Shopping Center

**Online Support**:
   💬 Live Chat: Available 24/7
   📧 Email: info@yourstore.com
   📱 WhatsApp: +880-1XXXX-XXXXX

**Directions**: Use Google Maps to find the nearest store
**Parking**: Free parking available at all locations

Planning to visit? Check our holiday hours first! 🏪`,

        account_login_help: `🔐 **Login Help**

**Forgot Password?**
   1. Click "Forgot Password" on login page
   2. Enter your email address
   3. Check email for reset link
   4. Create new password

**Can't Access Email?**
   • Contact support: +880-XXXX-XXXX
   • Provide: Name, phone number, recent order details

**Login Issues?**
   • Clear browser cache/cookies
   • Try different browser
   • Disable ad blockers

**Create Account**: Click "Register" if you don't have an account yet

Still having trouble? I'm here to help! 🆘`,

        account_register_help: `📝 **Create New Account**

**Registration Steps**:
   1. Click "Register" button
   2. Fill in: Name, Email, Phone, Password
   3. Verify email address
   4. Start shopping!

**Account Benefits**:
   ✅ Faster checkout
   ✅ Order tracking
   ✅ Wishlist & favorites
   ✅ Exclusive offers
   ✅ Reward points

**Requirements**:
   • Valid email address
   • Bangladesh phone number
   • Password (8+ characters)

**Privacy**: Your information is 100% secure and never shared

Ready to create your account? Click the register button! 🎉`,

        account_general_help: `👤 **Account Support**

**Common Account Tasks**:
   • Update profile information
   • Change password
   • View order history
   • Manage addresses
   • Check reward points

**Need Help With**:
   🔐 Login issues
   📝 Account registration
   ✏️ Profile updates
   📧 Email preferences
   🎁 Reward program

**Contact Account Support**:
   📞 Phone: +880-XXXX-XXXX
   📧 Email: accounts@yourstore.com
   💬 Live chat available 24/7

What specific account help do you need? 🤝`
      },

      bn: {
        // Bengali translations for key messages
        greeting: params.userName 
          ? `হ্যালো ${params.userName}! 👋 আবার স্বাগতম! আজ আমি কীভাবে আপনাকে নিখুঁত পণ্য খুঁজে পেতে সাহায্য করতে পারি?`
          : "হ্যালো! 👋 আমাদের দোকানে স্বাগতম! আমি আপনার AI শপিং সহায়ক। আমি কীভাবে আপনাকে সাহায্য করতে পারি?",
        
        shipping_policy: `🚚 **শিপিং ও ডেলিভারি তথ্য**

**ডেলিভারি এলাকা**: আমরা সারা বাংলাদেশে ডেলিভারি দিই
**ডেলিভারি সময়**: 
   • ঢাকা: ১-২ কার্যদিবস
   • অন্যান্য শহর: ২-৪ কার্যদিবস
   • দূরবর্তী এলাকা: ৩-৭ কার্যদিবস

**শিপিং খরচ**:
   • ১০০০ টাকার উপরে অর্ডারে বিনামূল্যে শিপিং
   • ঢাকা: ৬০ টাকা
   • ঢাকার বাইরে: ১০০-১৫০ টাকা

আরো জানতে চান? প্রশ্ন করুন! 📦`,

        return_policy: `🔄 **রিটার্ন ও রিফান্ড নীতি**

**রিটার্ন সময়**: ডেলিভারির ৭ দিনের মধ্যে
**শর্ত**: পণ্য অব্যবহৃত ও মূল প্যাকেজিং-এ থাকতে হবে

**যা রিটার্ন করা যাবে**:
   ✅ ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ পণ্য
   ✅ ভুল পণ্য পেলে
   ✅ বর্ণনার সাথে মিল না থাকলে

**রিফান্ড প্রক্রিয়া**: ৫-৭ কার্যদিবসের মধ্যে

কোন অর্ডার নিয়ে প্রশ্ন? আমি সাহায্য করব! 💙`
      },

      hi: {
        // Hindi translations for key messages
        greeting: params.userName 
          ? `नमस्ते ${params.userName}! 👋 आपका स्वागत है! आज मैं आपको सही उत्पाद खोजने में कैसे मदद कर सकता हूँ?`
          : "नमस्ते! 👋 हमारे स्टोर में आपका स्वागत है! मैं आपका AI शॉपिंग असिस्टेंट हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
        
        shipping_policy: `🚚 **शिपिंग और डिलीवरी की जानकारी**

**डिलीवरी क्षेत्र**: हम पूरे बांग्लादेश में डिलीवरी करते हैं
**डिलीवरी समय**: 
   • ढाका: 1-2 कार्य दिवस
   • अन्य शहर: 2-4 कार्य दिवस
   • दूरदराज के क्षेत्र: 3-7 कार्य दिवस

**शिपिंग लागत**:
   • ৳1000 से अधिक के ऑर्डर पर मुफ्त शिपिंग
   • ढाका: ৳60
   • ढाका के बाहर: ৳100-150

और जानकारी चाहिए? पूछिए! 📦`,

        return_policy: `🔄 **वापसी और रिफंड नीति**

**वापसी की अवधि**: डिलीवरी के 7 दिन के भीतर
**शर्त**: उत्पाद अप्रयुक्त और मूल पैकेजिंग में होना चाहिए

**क्या वापस किया जा सकता है**:
   ✅ क्षतिग्रस्त या दोषपूर्ण उत्पाद
   ✅ गलत उत्पाद मिलने पर
   ✅ विवरण से मेल न खाने पर

**रिफंड प्रक्रिया**: 5-7 कार्य दिवसों में

कोई ऑर्डर के बारे में सवाल? मैं मदद करूंगा! 💙`
      }
    };

    return messages[this.userLanguage]?.[key] || messages.en[key] || "I'm here to help!";
  }
}
