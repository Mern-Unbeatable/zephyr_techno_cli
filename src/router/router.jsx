import React from "react";
import { createBrowserRouter } from "react-router";
import MainLayout from "../layout/MainLayout";
import AdminLayout from "../layout/AdminLayout";
import UserDashboardLayout from "../layout/UserDashboardLayout";
import NotFound from "../pages/404/NotFound";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgetPass from "../pages/auth/ForgetPass";
import Otp from "../pages/auth/Otp";
import ResetPass from "../pages/auth/ResetPass";
import Home from "../pages/public/home/Home";
import Products from "../pages/public/products/Products";
import Contact from "../pages/public/contact/Contact";
import ProductDetails from "../pages/public/productDetails/ProductDetails";
import AdminOverview from "../pages/admin/overview/AdminOverview";
import UserOrders from "../pages/user/orders/UserOrders";
import Account from "../pages/user/account/Account";
import Listings from "../pages/admin/listings/Listings";
import Addlisting from "../pages/admin/addlisting/Addlisting";
import Editlisting from "../pages/admin/editListing/Editlisting";
import Order from "../pages/admin/order/Order";
import CellPhoneMange from "../pages/admin/cellphoneMange/CellPhoneMange";
import PromoCode from "../pages/admin/promoCode/PromoCode";
import CreatePromo from "../pages/admin/createPromo/CreatePromo";
import UserManagement from "../pages/admin/userManagement/UserManagement";
import AdminProfile from "../pages/admin/adminProfile/AdminProfile";
import Settings from "../pages/admin/settings/Settings";
import Cart from "../pages/public/cart/Cart";
import AboutUs from "../pages/public/aboutUs/AboutUs";
import ForBusinesses from "../pages/public/forBusinesses/ForBusinesses";
import Sell from "../pages/public/sellYourPhone/Sell";
import SellWorth from "../pages/public/sellWorth/SellWorth";
import AboutDevice from "../pages/public/aboutdevice/AboutDevice";
import FinalizeSale from "../pages/public/finalizeSale/FinalizeSale";
import Checkout from "../pages/public/checkout/Checkout";
import CheckoutSuccess from "../pages/public/checkout/CheckoutSuccess";
import CheckoutCancel from "../pages/public/checkout/CheckoutCancel";
import BusinessQuery from "../pages/admin/businessQuery/BusinessQuery";
import ContactManagement from "../pages/admin/contactManagement/ContactManagement";
import ForgetCode from "../pages/auth/ForgetCode";
import Privacy from "../pages/public/privacy-policy/Privacy";
import Terms from "../pages/public/terms-condition/Terms";
import Refund from "../pages/public/refund-policy/Refund";
import Shipping from "../pages/public/shipping-policy/Shipping";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "product-details/:id",
        element: <ProductDetails />,
      },
      {
        path: "about-us",
        element: <AboutUs />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "checkout/success",
        element: <CheckoutSuccess />,
      },
      {
        path: "checkout/cancel",
        element: <CheckoutCancel />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "privacy-policy",
        element: <Privacy />,
      },
      {
        path: "terms-condition",
        element: <Terms />,
      },
      {
        path: "refund-policy",
        element: <Refund />,
      },
      {
        path: "shipping-policy",
        element: <Shipping />,
      },
      {
        path: "for-businesses",
        element: <ForBusinesses />,
      },
      {
        path: "sell",
        element: <Sell />,
      },
      {
        path: "sell-worth",
        element: <SellWorth />,
      },
      {
        path: "confirm-sale",
        element: <AboutDevice />,
      },
      { path: "finalize-sale", element: <FinalizeSale /> },
    ],
  },

  // admin dashboard routes
  {
    path: "/dashboard/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: "listing", element: <Listings /> },
      {
        path: "add-listing",
        element: <Addlisting />,
      },
      { path: "edit-listing/:id", element: <Editlisting /> },
      { path: "order", element: <Order /> },
      { path: "cell-phone", element: <CellPhoneMange /> },
      { path: "promo-code", element: <PromoCode /> },
      { path: "create-promo", element: <CreatePromo /> },
      { path: "user-management", element: <UserManagement /> },
      { path: "business-queries", element: <BusinessQuery /> },
      { path: "contact-management", element: <ContactManagement /> },
      { path: "settings", element: <Settings /> },
      { path: "profile", element: <AdminProfile /> },
    ],
  },

  // user dashboard routes
  {
    path: "/dashboard/user",
    element: <UserDashboardLayout />,
    children: [
      { index: true, element: <UserOrders /> },
      { path: "account", element: <Account /> },
    ],
  },

  // auth routes
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forget-password", element: <ForgetPass /> },
  { path: "/reset-password", element: <ResetPass /> },
  { path: "/otp-verification", element: <Otp /> },
  { path: "/verify-code", element: <ForgetCode /> },

  // not found route
  {
    path: "*",
    element: <NotFound />,
  },

  
]);

export default router;
