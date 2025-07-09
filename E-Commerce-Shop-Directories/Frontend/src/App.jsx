import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import HomePage from "./components/home/HomePage";
import NotFoundPage from "./components/ui/NotFoundPage";
import ProductPage from "./components/product/ProductPage";
import CartPage from "./components/cart/CartPage";
import { useEffect, useState } from "react";
import api from "./api";

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout numCartItems={numCartItems} />}>
          <Route index element={<HomePage />} />
          <Route path="products/:slug" element={<ProductPage setNumCartItems={setNumCartItems} />} />
          <Route path="cart" element={<CartPage setNumCartItems={setNumCartItems} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
