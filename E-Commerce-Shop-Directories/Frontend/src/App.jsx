import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import HomePage from "./components/home/HomePage";
import NotFoundPage from "./components/ui/NotFoundPage";
import ProductPage from "./components/product/ProductPage";
import CartPage from "./components/cart/CartPage";
import CheckoutPage from "./components/checkout/CheckoutPage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import Dashboard from "./components/user/Dashboard";
import UserProfile from "./components/user/UserProfile";
import MyOrders from "./components/user/MyOrders";
import OrderConfirmationPage from "./components/order/OrderConfirmationPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthDebug from "./components/debug/AuthDebug";
import ChatWidget from "./components/chat/ChatWidget";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { useEffect, useState } from "react";
import api from "./api";
import './styles/payment.css';

function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const App = () => {
  const [numCartItems, setNumCartItems] = useState(0);

  useEffect(() => {
    let cart_code = localStorage.getItem("cart_code");

    if (!cart_code) {
      cart_code = generateRandomString(10);
      localStorage.setItem("cart_code", cart_code);
      console.log("Generated new cart_code:", cart_code);
    }

    api.get(`/get_cart_stat/?cart_code=${cart_code}`)
      .then(res => {
        setNumCartItems(res.data.total_items || 0);
      })
      .catch(err => {
        console.error("API Error:", err.response?.data || err.message);
      });
  }, []);

  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout numCartItems={numCartItems} />}>
              <Route index element={<HomePage />} />
              <Route path="products/:slug" element={<ProductPage setNumCartItems={setNumCartItems} />} />
              <Route path="cart" element={<CartPage setNumCartItems={setNumCartItems} />} />
              <Route 
                path="checkout" 
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="register" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <RegisterPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="forgot-password" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <ForgotPassword />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="reset-password/:token" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <ResetPassword />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="my-orders" 
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="order-confirmation/:orderId" 
                element={<OrderConfirmationPage />}
              />
              <Route path="debug" element={<AuthDebug />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          
          {/* Global Chat Widget */}
          <ChatWidget />
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
