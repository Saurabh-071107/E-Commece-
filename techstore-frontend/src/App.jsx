import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";

function NotFound(){return <div className="page-wrap not-found"><p className="eyebrow">404 / WRONG TURN</p><h1>This page took<br/><em>the scenic route.</em></h1><p>We couldn’t find what you were looking for.</p><a href="/" className="button button-dark mt-5">Back to home</a></div>}
export default function App(){
 return <Routes><Route element={<Layout/>}><Route path="/" element={<Home/>}/><Route path="/shop" element={<Shop/>}/><Route path="/product/:id" element={<Product/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/><Route path="/account" element={<Account/>}/><Route path="/orders" element={<Orders/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<NotFound/>}/></Route></Routes>;
}
