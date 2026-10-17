import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, ArrowUpRight, UserRound, Heart, Sparkles, Shield, ArrowRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, QuickViewModal } from "./ui";

export function Header() {
  const { itemCount, wishlist } = useStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const submit = e => {
    e.preventDefault();
    navigate(`/shop${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`);
    setOpen(false);
  };

  const navLinks = [
    { to: "/shop", label: "Shop All" },
    { to: "/shop?category=Audio", label: "Audio" },
    { to: "/shop?category=Accessories", label: "Accessories" },
    { to: "/shop?category=Workspace", label: "Workspace" },
    { to: "/shop?category=Wearables", label: "Wearables" },
  ];

  return (
    <>
      <aside className="announcement">
        <div className="announcement-inner">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles size={13} className="text-accent" />
            Curated Studio Tech
          </span>
          <span className="announcement-divider">/</span>
          <span>Free Express Shipping on orders over ₹5,000</span>
          <span className="announcement-divider hidden sm:inline">/</span>
          <span className="hidden sm:inline text-zinc-300">Use code <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[10px]">FORM10</strong> for 10% off</span>
        </div>
      </aside>

      <header className="site-header">
        <div className="header-inner">
          <button
            className="icon-button mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="wordmark" onClick={() => setOpen(false)}>
            FORM<span>®</span>
            <small>TECHNOLOGY, CONSIDERED.</small>
          </Link>

          <nav className="desktop-nav">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive && link.to === "/shop" ? "active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <form className="header-search" onSubmit={submit}>
              <Search size={15} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                aria-label="Search products"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="search-clear" aria-label="Clear">
                  <X size={12} />
                </button>
              )}
            </form>

            <Link to="/shop" className="icon-button" aria-label="Wishlist" title={`Wishlist (${wishlist.length})`}>
              <Heart size={18} />
              {wishlist.length > 0 && <span className="action-badge">{wishlist.length}</span>}
            </Link>

            <Link
              to={user ? "/account" : "/login"}
              className="icon-button account-link"
              aria-label="Account"
              title={user ? user.name : "Sign in"}
            >
              {user ? (
                <span className="user-initial">{user.name.charAt(0).toUpperCase()}</span>
              ) : (
                <UserRound size={18} />
              )}
            </Link>

            <Link to="/cart" className="icon-button bag-link" aria-label={`Cart with ${itemCount} items`}>
              <ShoppingBag size={18} />
              <span className="bag-count">{itemCount}</span>
            </Link>
          </div>
        </div>

        {open && (
          <nav className="mobile-nav">
            <form onSubmit={submit} className="mobile-search">
              <Search size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, audio, accessories..."
              />
            </form>
            <div className="mobile-nav-links">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mobile-nav-foot">
              <Link to={user ? "/account" : "/login"} onClick={() => setOpen(false)}>
                {user ? `Account (${user.name.split(" ")[0]})` : "Sign In / Register"}
              </Link>
              <Link to="/orders" onClick={() => setOpen(false)}>Orders</Link>
              <Link to="/cart" onClick={() => setOpen(false)}>Bag ({itemCount})</Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

export function Footer() {
  const [subbed, setSubbed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSub = e => {
    e.preventDefault();
    if (!email) return;
    setSubbed(true);
    setTimeout(() => setSubbed(false), 4000);
    setEmail("");
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="wordmark footer-logo">
            FORM<span>®</span>
            <small>TECHNOLOGY, CONSIDERED.</small>
          </Link>
          <p className="text-muted mt-4 max-w-sm text-xs leading-relaxed">
            A curated portfolio of precision audio, workspace tools, and quiet tech essentials engineered for focused living.
          </p>
          <div className="footer-badge-pill mt-5">
            <Shield size={13} className="text-accent" />
            <span>2-Year Warranty & 30-Day In-Home Trial</span>
          </div>
        </div>

        <div className="footer-links">
          <div>
            <p className="eyebrow mb-3.5">Discover</p>
            <Link to="/shop">Shop All</Link>
            <Link to="/shop?category=Audio">Studio Audio</Link>
            <Link to="/shop?category=Workspace">Workspace Edit</Link>
            <Link to="/shop?category=Accessories">Accessories</Link>
            <Link to="/shop?category=Wearables">Wearables</Link>
          </div>

          <div>
            <p className="eyebrow mb-3.5">Account & Orders</p>
            <Link to="/account">Your Profile</Link>
            <Link to="/orders">Order Tracking</Link>
            <Link to="/cart">Shopping Bag</Link>
            <Link to="/admin">Admin Demo</Link>
          </div>

          <div>
            <p className="eyebrow mb-3.5">Assistance</p>
            <a href="mailto:concierge@form.example">Concierge Support</a>
            <span>Shipping Policy</span>
            <span>Returns & Exchanges</span>
            <span>Authenticity Guarantee</span>
          </div>
        </div>
      </div>

      <div className="footer-newsletter">
        <div>
          <span className="eyebrow">STAY INFORMED</span>
          <h3 className="font-serif text-lg font-medium mt-1">First access to limited drops.</h3>
        </div>
        <form onSubmit={handleSub} className="footer-newsletter-form">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            aria-label="Email for newsletter"
          />
          <button type="submit" className="button button-dark">
            {subbed ? "Subscribed ✓" : "Join"} <ArrowRight size={14} />
          </button>
        </form>
      </div>

      <div className="footer-bottom">
        <span>© 2026 FORM Technology Inc. Designed with intention.</span>
        <div className="flex gap-4">
          <span>INR (₹)</span>
          <span>Privacy & Terms</span>
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="site-wrapper">
      <Header />
      <main className="min-h-[70vh]">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <QuickViewModal />
    </div>
  );
}
