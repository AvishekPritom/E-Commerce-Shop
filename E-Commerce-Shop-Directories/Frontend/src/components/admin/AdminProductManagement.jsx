import React, { useState, useEffect } from 'react';
import api from '../../api';
import { BASE_URL } from '../../api';
import Toast from '../ui/Toast';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    in_stock: true,
    stock_quantity: ''
  });

  const categories = ['Electronics', 'Watches', 'Fashion', 'Home & Garden', 'Sports', 'Books'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setToast({
        show: true,
        message: 'Failed to load products',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity)
      };

      if (editingProduct) {
        // Update existing product
        await api.put(`/products/${editingProduct.slug}/`, productData);
        setToast({
          show: true,
          message: 'Product updated successfully',
          type: 'success'
        });
      } else {
        // Create new product
        await api.post('/products/', productData);
        setToast({
          show: true,
          message: 'Product created successfully',
          type: 'success'
        });
      }
      
      fetchProducts();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setToast({
        show: true,
        message: 'Failed to save product',
        type: 'error'
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || '',
      image: product.image || '',
      in_stock: product.in_stock !== false,
      stock_quantity: product.stock_quantity?.toString() || '0'
    });
    setShowModal(true);
  };

  const handleDelete = async (productSlug) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productSlug}/`);
        setToast({
          show: true,
          message: 'Product deleted successfully',
          type: 'success'
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setToast({
          show: true,
          message: 'Failed to delete product',
          type: 'error'
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      in_stock: true,
      stock_quantity: ''
    });
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="container my-5">
        <LoadingSpinner size="large" text="Loading products..." fullPage />
      </div>
    );
  }

  return (
    <div className="container-fluid my-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-boxes me-2"></i>
              Product Management
            </h2>
            <button 
              className="btn btn-primary"
              onClick={openAddModal}
            >
              <i className="fas fa-plus me-2"></i>
              Add New Product
            </button>
          </div>

          {/* Products Table */}
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id || product.slug}>
                        <td>
                          <img
                            src={product.image ? `${BASE_URL}${product.image}` : 'https://placehold.co/60x60'}
                            alt={product.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            className="rounded"
                          />
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-0">{product.name}</h6>
                            <small className="text-muted">{product.description?.substring(0, 50)}...</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{product.category || 'Uncategorized'}</span>
                        </td>
                        <td>
                          <strong>৳{product.price}</strong>
                        </td>
                        <td>
                          <span className={`badge ${product.stock_quantity > 10 ? 'bg-success' : product.stock_quantity > 0 ? 'bg-warning' : 'bg-danger'}`}>
                            {product.stock_quantity || 0} units
                          </span>
                        </td>
                        <td>
                          {product.in_stock !== false ? (
                            <span className="badge bg-success">In Stock</span>
                          ) : (
                            <span className="badge bg-danger">Out of Stock</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(product)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(product.slug)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {products.length === 0 && (
                <div className="text-center py-5">
                  <i className="fas fa-box-open mb-3" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                  <h5 className="text-muted">No products found</h5>
                  <p className="text-muted">Start by adding your first product.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={openAddModal}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        name="category"
                        className="form-select"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price (৳) *</label>
                      <input
                        type="number"
                        name="price"
                        className="form-control"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock Quantity</label>
                      <input
                        type="number"
                        name="stock_quantity"
                        className="form-control"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      name="image"
                      className="form-control"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="in_stock"
                      className="form-check-input"
                      checked={formData.in_stock}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">
                      Product is in stock
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default AdminProductManagement;
