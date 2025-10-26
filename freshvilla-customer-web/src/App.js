// react 
import React from "react";
// css
import "./App.css";
// browserrouter 
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// Components
import Header from './Component/Header';
import Footer from "./Component/Footer";
import WhatsAppButton from './Component/WhatsAppButton';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductsList from './pages/Admin/Products/ProductsList';
import ProductCreate from './pages/Admin/Products/ProductCreate';
import CouponsList from './pages/Admin/Coupons/CouponsList';
import CouponCreate from './pages/Admin/Coupons/CouponCreate';
import OrdersList from './pages/Admin/Orders/OrdersList';
// pages
import Home from "./pages/Home";
// About pages
import AboutUs from "./pages/About/AboutUs";
import Blog from "./pages/About/Blog";
import BlogCategory from "./pages/About/BlogCategory";
import Contact from "./pages/About/Contact";
// Shop pages
import Shop from "./pages/Shop/Shop";
import ShopGridCol3 from "./pages/Shop/ShopGridCol3";
import ShopListCol from "./pages/Shop/ShopListCol";
import ShopCart from "./pages/Shop/ShopCart";
import ShopCheckOut from "./pages/Shop/ShopCheckOut";
import ShopWishList from "./pages/Shop/ShopWishList";
import EnhancedCheckout from "./pages/Shop/EnhancedCheckout";
// Store pages
import StoreList from "./pages/store/StoreList";
import SingleShop from "./pages/store/SingleShop";
// Account pages
import MyAccountOrder from "./pages/Accounts/MyAccountOrder";
import MyAccountSetting from "./pages/Accounts/MyAcconutSetting";
import MyAcconutNotification from "./pages/Accounts/MyAcconutNotification";
import MyAcconutPaymentMethod from "./pages/Accounts/MyAcconutPaymentMethod";
import MyAccountAddress from "./pages/Accounts/MyAccountAddress";
import MyAccountForgetPassword from "./pages/Accounts/MyAccountForgetPassword";
import MyAccountSignIn from "./pages/Accounts/MyAccountSignIn";
import MyAccountSignUp from "./pages/Accounts/MyAccountSignUp";
import PasswordReset from "./pages/Accounts/PasswordReset";
import FAQ from "./pages/FooterElements/Faq";
import Coupons from "./pages/FooterElements/Coupons";
import Careers from "./pages/FooterElements/Careers";
import HelpCenter from "./pages/FooterElements/HelpCenter";
import AdminSettings from './pages/AdminSettings';
import NotFound from './pages/NotFound';
const App = () => {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <div>
            <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Shop pages */}
          <Route path="/Shop" element={<Shop />} />
          <Route path="/ShopGridCol3" element={<ShopGridCol3 />} />
          <Route path="/ShopListCol" element={<ShopListCol />} />
          <Route path="/ShopWishList" element={<ShopWishList />} />
          <Route path="/ShopCheckOut" element={<CustomerProtectedRoute><ShopCheckOut /></CustomerProtectedRoute>} />
          <Route path="/ShopCart" element={<ShopCart />} />
          <Route path="/Checkout" element={<CustomerProtectedRoute><EnhancedCheckout /></CustomerProtectedRoute>} />
          {/* Store pages */}
          <Route path="/StoreList" element={<StoreList />} />
          <Route path="/SingleShop" element={<SingleShop />} />
          {/* Accounts pages - Protected */}
          <Route path="/MyAccountOrder" element={<CustomerProtectedRoute><MyAccountOrder /></CustomerProtectedRoute>} />
          <Route path="/MyAccountSetting" element={<CustomerProtectedRoute><MyAccountSetting /></CustomerProtectedRoute>} />
          <Route path="/MyAcconutNotification" element={<CustomerProtectedRoute><MyAcconutNotification /></CustomerProtectedRoute>} />
          <Route path="/MyAcconutPaymentMethod" element={<CustomerProtectedRoute><MyAcconutPaymentMethod /></CustomerProtectedRoute>} />
          <Route path="/MyAccountAddress" element={<CustomerProtectedRoute><MyAccountAddress /></CustomerProtectedRoute>} />
          <Route path="/MyAccountForgetPassword" element={<MyAccountForgetPassword />} />
          <Route path="/MyAccountSignIn" element={<MyAccountSignIn />} />
          <Route path="/MyAccountSignUp" element={<MyAccountSignUp />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          {/* About pages */}
          <Route path="/Blog" element={<Blog />} />
          <Route path="/BlogCategory" element={<BlogCategory />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          {/* Footer Elements */}
          <Route path="/Faq" element={<FAQ />} />
          <Route path="/Coupons" element={<Coupons />} />
          <Route path="/Careers" element={<Careers />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><ProductsList /></ProtectedRoute>} />
          <Route path="/admin/products/create" element={<ProtectedRoute><ProductCreate /></ProtectedRoute>} />
          <Route path="/admin/products/edit/:id" element={<ProtectedRoute><ProductCreate /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute><CouponsList /></ProtectedRoute>} />
          <Route path="/admin/coupons/create" element={<ProtectedRoute><CouponCreate /></ProtectedRoute>} />
          <Route path="/admin/coupons/edit/:id" element={<ProtectedRoute><CouponCreate /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          {/* Catch-all 404 route - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer/>
        <WhatsAppButton />
            </Router>
          </div>
        </CartProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
};

export default App;
