import Header from "./Header";
import CardContainer from "./CardContainer";
import { useEffect, useState } from "react";
import api from "../../api";
import Error from "../ui/Error";
import PlaceHolderContainer from "../ui/PlaceHolderContainer";
import { randomValue } from "../../GenerateCardCode";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState('default');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  useEffect(function () {
    if (localStorage.getItem("cart_code") == null) {
      localStorage.setItem("cart_code", randomValue);
    }
  }, []);

  useEffect(function () {
    setLoading(true);
    api
      .get("products/")
      .then((res) => {
        const productsData = res.data;
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        setLoading(false);
        setError("");
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
        setError(err.message);
      });
  }, []);

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterProducts(category, searchTerm);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterProducts(selectedCategory, term);
  };

  const filterProducts = (category, search) => {
    let filtered = products;
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }
    
    // Filter by search term
    if (search.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply current sorting if not default
    if (sortBy !== 'default') {
      filtered = applySorting(filtered, sortBy, sortOrder);
    }
    
    console.log('Filtered products:', filtered.length, 'Sort:', sortBy, sortOrder); // Debug log
    setFilteredProducts(filtered);
  };

  // Enhanced sorting function
  const applySorting = (productArray, sortType, order) => {
    let sortedProducts = [...productArray];
    
    console.log('Applying sorting:', sortType, order, 'to', productArray.length, 'products'); // Debug log
    
    switch(sortType) {
      case 'name':
        sortedProducts.sort((a, b) => {
          const comparison = a.name.localeCompare(b.name);
          return order === 'asc' ? comparison : -comparison;
        });
        break;
      case 'price':
        sortedProducts.sort((a, b) => {
          const comparison = a.price - b.price;
          return order === 'asc' ? comparison : -comparison;
        });
        break;
      case 'rating':
        sortedProducts.sort((a, b) => {
          const comparison = (a.rating || 0) - (b.rating || 0);
          return order === 'desc' ? comparison : -comparison; // Default to highest rating first
        });
        break;
      case 'newest':
        sortedProducts.sort((a, b) => {
          const dateA = new Date(a.created_at || a.id);
          const dateB = new Date(b.created_at || b.id);
          const comparison = dateB - dateA; // Newest first by default
          return order === 'asc' ? -comparison : comparison;
        });
        break;
      default:
        // Keep original order for 'default'
        console.log('Default sort - keeping original order'); // Debug log
        break;
    }
    
    console.log('Sorted products:', sortedProducts.slice(0, 3).map(p => ({ name: p.name, price: p.price }))); // Debug log
    return sortedProducts;
  };

  // Handle sort selection
  const handleSort = (sortType, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Sort clicked:', sortType); // Debug log
    
    let newSortOrder = sortOrder;
    
    // If clicking the same sort type, toggle order
    if (sortBy === sortType) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newSortOrder);
    } else {
      setSortBy(sortType);
      // Set default order based on sort type
      newSortOrder = sortType === 'price' ? 'asc' : sortType === 'rating' ? 'desc' : 'asc';
      setSortOrder(newSortOrder);
    }
    
    // Immediately apply sorting to current filtered products
    const sorted = applySorting(filteredProducts, sortType, newSortOrder);
    setFilteredProducts(sorted);
  };

  // Remove the problematic useEffect that was causing issues
  // Apply sorting whenever sortBy or sortOrder changes
  useEffect(() => {
    if (filteredProducts.length > 0 && sortBy !== 'default') {
      console.log('Applying sort:', sortBy, sortOrder); // Debug log
      const sorted = applySorting(filteredProducts, sortBy, sortOrder);
      setFilteredProducts(sorted);
    }
  }, []); // Empty dependency array - we'll handle sorting manually

  const clearSearch = () => {
    setSearchTerm('');
    filterProducts(selectedCategory, '');
  };

  return (
    <>
      <Header />
      
      {/* Search Panel */}
      <section className="py-4 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="search-container">
                    <h5 className="text-center mb-4">
                      <i className="fas fa-search me-2 text-primary"></i>
                      Find Your Perfect Product
                    </h5>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 border-end-0"
                        placeholder="Search products by name, description, or category..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ boxShadow: 'none' }}
                      />
                      {searchTerm && (
                        <button 
                          className="input-group-text bg-white border-start-0 btn btn-link p-0 px-3"
                          onClick={clearSearch}
                          title="Clear search"
                        >
                          <i className="fas fa-times text-muted"></i>
                        </button>
                      )}
                    </div>
                    
                    {/* Search Results Info */}
                    {searchTerm && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            {filteredProducts.length > 0 
                              ? `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} for "${searchTerm}"`
                              : `No products found for "${searchTerm}"`
                            }
                          </small>
                          {filteredProducts.length === 0 && (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={clearSearch}
                            >
                              <i className="fas fa-undo me-1"></i>
                              Clear search
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Popular Searches */}
                    {!searchTerm && (
                      <div className="mt-3">
                        <small className="text-muted d-block mb-2">Popular searches:</small>
                        <div className="d-flex flex-wrap gap-2">
                          {['laptop', 'watch', 'phone', 'headphones', 'tablet'].map(term => (
                            <button
                              key={term}
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleSearch(term)}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Category Filter Section */}
      <section className="mb-4">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h4 className="text-center mb-4">
                {searchTerm ? 'Filter Search Results' : 'Browse by Category'}
              </h4>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <button
                  className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleCategoryFilter('all')}
                >
                  <i className="fas fa-th-large me-2"></i>
                  All Products ({products.length})
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleCategoryFilter(category)}
                  >
                    <i className={`fas ${getCategoryIcon(category)} me-2`}></i>
                    {category} ({products.filter(p => p.category === category).length})
                  </button>
                ))}
              </div>
              
              {/* Active Filters Display */}
              {(searchTerm || selectedCategory !== 'all') && (
                <div className="mt-3 text-center">
                  <small className="text-muted me-2">Active filters:</small>
                  {searchTerm && (
                    <span className="badge bg-info me-2">
                      Search: "{searchTerm}"
                      <button 
                        className="btn-close btn-close-white ms-2 small"
                        onClick={clearSearch}
                        style={{ fontSize: '0.6rem' }}
                      ></button>
                    </span>
                  )}
                  {selectedCategory !== 'all' && (
                    <span className="badge bg-primary me-2">
                      Category: {selectedCategory}
                      <button 
                        className="btn-close btn-close-white ms-2 small"
                        onClick={() => handleCategoryFilter('all')}
                        style={{ fontSize: '0.6rem' }}
                      ></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-4" id="shop">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>
                  {selectedCategory === 'all' ? 'All Products' : selectedCategory}
                  <span className="text-muted ms-2">({filteredProducts.length} items)</span>
                </h4>
                
                {/* Enhanced Sort Dropdown */}
                <div className="d-flex align-items-center gap-3">
                  {/* Sort Type Dropdown */}
                  <div className="dropdown">
                    <button 
                      className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center" 
                      type="button" 
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fas fa-sort me-2"></i>
                      Sort: {getSortLabel(sortBy)}
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'default' ? 'active' : ''}`}
                          onClick={(e) => handleSort('default', e)}
                          type="button"
                        >
                          <i className="fas fa-list me-2"></i>
                          Default Order
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'name' ? 'active' : ''}`}
                          onClick={(e) => handleSort('name', e)}
                          type="button"
                        >
                          <i className="fas fa-font me-2"></i>
                          Name
                          {sortBy === 'name' && (
                            <i className={`fas fa-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-2 text-primary`}></i>
                          )}
                        </button>
                      </li>
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'price' ? 'active' : ''}`}
                          onClick={(e) => handleSort('price', e)}
                          type="button"
                        >
                          <i className="fas fa-dollar-sign me-2"></i>
                          Price
                          {sortBy === 'price' && (
                            <i className={`fas fa-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-2 text-primary`}></i>
                          )}
                        </button>
                      </li>
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'rating' ? 'active' : ''}`}
                          onClick={(e) => handleSort('rating', e)}
                          type="button"
                        >
                          <i className="fas fa-star me-2"></i>
                          Rating
                          {sortBy === 'rating' && (
                            <i className={`fas fa-arrow-${sortOrder === 'desc' ? 'down' : 'up'} ms-2 text-primary`}></i>
                          )}
                        </button>
                      </li>
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'newest' ? 'active' : ''}`}
                          onClick={(e) => handleSort('newest', e)}
                          type="button"
                        >
                          <i className="fas fa-clock me-2"></i>
                          Newest First
                          {sortBy === 'newest' && (
                            <i className={`fas fa-arrow-${sortOrder === 'desc' ? 'down' : 'up'} ms-2 text-primary`}></i>
                          )}
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Sort Order Toggle Button */}
                  {sortBy !== 'default' && (
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'} order`}
                    >
                      <i className={`fas fa-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                      <span className="ms-1 d-none d-md-inline">
                        {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                      </span>
                    </button>
                  )}

                  {/* Active Sort Indicator */}
                  {sortBy !== 'default' && (
                    <span className="badge bg-primary d-none d-lg-inline">
                      <i className="fas fa-check me-1"></i>
                      {getSortLabel(sortBy)} 
                      ({sortOrder === 'asc' ? '↑' : '↓'})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {loading ? (
            <PlaceHolderContainer />
          ) : filteredProducts.length > 0 ? (
            <CardContainer product={filteredProducts} />
          ) : searchTerm ? (
            <div className="text-center py-5">
              <i className="fas fa-search-minus mb-3" style={{ fontSize: '48px', color: '#6c757d' }}></i>
              <h5 className="text-muted">No products found for "{searchTerm}"</h5>
              <p className="text-muted">Try different keywords or browse by category.</p>
              <div className="d-flex justify-content-center gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={clearSearch}
                >
                  <i className="fas fa-times me-2"></i>
                  Clear Search
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => handleCategoryFilter('all')}
                >
                  <i className="fas fa-th-large me-2"></i>
                  View All Products
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-search mb-3" style={{ fontSize: '48px', color: '#6c757d' }}></i>
              <h5 className="text-muted">No products found</h5>
              <p className="text-muted">Try selecting a different category or check back later.</p>
              <button 
                className="btn btn-primary"
                onClick={() => handleCategoryFilter('all')}
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-light py-5 mt-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-3">
              <div className="h2 text-primary fw-bold">{products.length}+</div>
              <p className="text-muted">Products Available</p>
            </div>
            <div className="col-md-3 mb-3">
              <div className="h2 text-primary fw-bold">{categories.length}+</div>
              <p className="text-muted">Categories</p>
            </div>
            <div className="col-md-3 mb-3">
              <div className="h2 text-primary fw-bold">4.8★</div>
              <p className="text-muted">Average Rating</p>
            </div>
            <div className="col-md-3 mb-3">
              <div className="h2 text-primary fw-bold">24/7</div>
              <p className="text-muted">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {error && <Error error={error} />}
    </>
  );

  // Helper function to get category icons
  function getCategoryIcon(category) {
    const icons = {
      'Electronics': 'fa-laptop',
      'Watches': 'fa-clock',
      'Fashion': 'fa-tshirt',
      'Furniture': 'fa-couch',
      'Home & Kitchen': 'fa-home'
    };
    return icons[category] || 'fa-tag';
  }

  // Helper function to get sort labels
  function getSortLabel(sortType) {
    const labels = {
      'default': 'Default',
      'name': 'Name',
      'price': 'Price',
      'rating': 'Rating',
      'newest': 'Newest'
    };
    return labels[sortType] || 'Default';
  }
};

export default HomePage;
