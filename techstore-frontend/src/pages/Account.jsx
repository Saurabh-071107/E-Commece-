import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, LogOut, Package, Settings2, UserRound, Heart, Shield, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";

export default function Account() {
  const { user, logout } = useAuth();
  const { wishlist } = useStore();
  const navigate = useNavigate();

  const orders = JSON.parse(localStorage.getItem("form-orders") || "[]");

  if (!user) {
    return (
      <div className="page-wrap">
        <div className="page-intro">
          <p className="eyebrow flex items-center gap-2">
            <span className="eyebrow-dot" /> YOUR SPACE
          </p>
          <h1>It starts <em>with you.</em></h1>
          <p className="text-muted mt-2">Sign in to view orders, track packages, and manage your saved collection.</p>
          <Link to="/login" className="button button-dark mt-6">
            Sign in <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="page-wrap">
      {/* PROFILE HEADER CARD */}
      <div className="account-hero-card mb-10">
        <div className="flex items-center gap-5">
          <div className="account-avatar-large">
            {initials || <UserRound size={28} />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-medium tracking-tight m-0">{user.name}</h1>
              <span className="account-tag">{user.role === "admin" ? "Curator / Admin" : "Member"}</span>
            </div>
            <p className="text-muted text-xs mt-1">{user.email}</p>
          </div>
        </div>

        <div className="account-quick-stats">
          <div className="stat-pill">
            <strong>{orders.length}</strong>
            <span>Orders Placed</span>
          </div>
          <div className="stat-pill">
            <strong>{wishlist.length}</strong>
            <span>Saved Pieces</span>
          </div>
          <div className="stat-pill">
            <strong>Active</strong>
            <span>Member Tier</span>
          </div>
        </div>
      </div>

      <div className="account-grid">
        <Link to="/orders" className="account-card account-card-link group">
          <div className="account-card-icon"><Package size={20} /></div>
          <h2>Your Orders</h2>
          <p className="text-muted text-xs leading-relaxed">
            Track live dispatch status, delivery dates, and view digital receipts.
          </p>
          <span className="account-card-cta">
            View orders ({orders.length}) <ArrowUpRight size={15} />
          </span>
        </Link>

        <Link to="/shop" className="account-card account-card-link group">
          <div className="account-card-icon"><Heart size={20} /></div>
          <h2>Saved Wishlist</h2>
          <p className="text-muted text-xs leading-relaxed">
            Personal shortlist of audio hardware and desk gear you're eyeing.
          </p>
          <span className="account-card-cta">
            Explore saved ({wishlist.length}) <ArrowUpRight size={15} />
          </span>
        </Link>

        <div className="account-card">
          <div className="account-card-icon"><Shield size={20} /></div>
          <h2>Account & Security</h2>
          <p className="text-muted text-xs leading-relaxed">
            Multi-factor authentication, verified session encryption, and data sovereignty.
          </p>
          <span className="account-tag mt-4">Verified Safe</span>
        </div>
      </div>

      <div className="account-bottom mt-10 pt-6 border-t border-line flex flex-wrap gap-4 items-center">
        {user.role === "admin" && (
          <Link to="/admin" className="button button-dark">
            <Sparkles size={15} /> Open Admin Dashboard <ArrowUpRight size={16} />
          </Link>
        )}
        <button
          className="button button-outline"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut size={16} /> Sign out of FORM
        </button>
      </div>
    </div>
  );
}
