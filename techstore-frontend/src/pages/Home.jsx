import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles, Star, Headphones, Laptop, Sliders, Check } from "lucide-react";
import { products } from "../data/products";
import { ProductCard, SectionHeading } from "../components/ui";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filterCategories = ["All", "Audio", "Accessories", "Workspace", "Wearables"];

  const filteredProducts = activeCategory === "All"
    ? products.slice(0, 8)
    : products.filter(p => p.category === activeCategory);

  const handleSubscribe = e => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 3500);
  };

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" /> A MORE CONSIDERED COLLECTION
          </p>
          <h1>
            Pure form.<br />
            <em>Quiet power.</em>
          </h1>
          <p className="hero-description">
            Precision audio, tactile keyboards, and workspace tools designed for focus. Technology stripped of distractions and built to endure.
          </p>

          <div className="hero-actions">
            <Link to="/shop" className="button button-dark">
              Explore the collection <ArrowUpRight size={17} />
            </Link>
            <a href="#featured" className="button button-outline">
              The Shortlist <ArrowDownRight size={16} />
            </a>
          </div>

          <div className="hero-specs-row">
            <div className="spec-item">
              <strong>40mm</strong>
              <span>Custom Drivers</span>
            </div>
            <div className="spec-divider" />
            <div className="spec-item">
              <strong>45h</strong>
              <span>Battery Reserve</span>
            </div>
            <div className="spec-divider" />
            <div className="spec-item">
              <strong>Anodized</strong>
              <span>Solid Aluminum</span>
            </div>
          </div>

          <div className="hero-note">
            <span>EDITION 01 / 2026</span>
            <span>SHIPS GLOBALLY WITH CARE</span>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=90"
            alt="Studio Wireless Headphones on minimalist surface"
          />
          <div className="hero-stamp">
            <span>LESS,</span>
            <span>BUT</span>
            <span>BETTER.</span>
            <small>FORM DESIGN Nº 01</small>
          </div>

          <div className="hero-floating-card">
            <div className="flex items-center gap-2">
              <span className="status-dot" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Spotlight Model</span>
            </div>
            <p className="font-semibold text-xs mt-1">Studio Wireless 01</p>
            <p className="text-[10px] text-zinc-400">Acoustic neutrality • Active noise cancelling</p>
          </div>

          <div className="hero-caption">
            <span>Objects for mindful work</span>
            <span>Curated by FORM Studio ↓</span>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <section className="ticker" aria-label="Brand manifesto">
        <div>
          ACOUSTIC NEUTRALITY <span>✳</span> TACTILE HARMONY <span>✳</span> BUILT FOR LIFE <span>✳</span> THOUGHTFULLY SELECTED <span>✳</span> ZERO COMPROMISE <span>✳</span> ACOUSTIC NEUTRALITY <span>✳</span> TACTILE HARMONY <span>✳</span> BUILT FOR LIFE <span>✳</span>
        </div>
      </section>

      {/* ASSURANCE PILLARS */}
      <section className="pillars-bar">
        <div className="pillar-item">
          <Truck size={20} className="text-ink" />
          <div>
            <h4>Complimentary Shipping</h4>
            <p>Free express delivery on orders over ₹5,000.</p>
          </div>
        </div>
        <div className="pillar-item">
          <ShieldCheck size={20} className="text-ink" />
          <div>
            <h4>2-Year Craftsmanship</h4>
            <p>Full replacement warranty on all electronics.</p>
          </div>
        </div>
        <div className="pillar-item">
          <RefreshCw size={20} className="text-ink" />
          <div>
            <h4>30-Day In-Home Trial</h4>
            <p>Experience in your everyday rituals, risk-free.</p>
          </div>
        </div>
        <div className="pillar-item">
          <Sparkles size={20} className="text-ink" />
          <div>
            <h4>Acoustic Perfection</h4>
            <p>Every audio unit individually frequency-calibrated.</p>
          </div>
        </div>
      </section>

      {/* SHORTLIST WITH INTERACTIVE CATEGORY TABS */}
      <section className="section-wrap" id="featured">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="eyebrow mb-2 flex items-center gap-2">
              <span className="eyebrow-dot" /> THE SHORTLIST
            </p>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Things worth keeping.</h2>
            <p className="mt-2 text-muted text-sm max-w-lg">
              A curated snapshot of our everyday companions. Useful by design, timeless by nature.
            </p>
          </div>

          <div className="category-chips">
            {filterCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-chip ${activeCategory === cat ? "active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.map(p => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      </section>

      {/* EDITORIAL BENTO CARDS */}
      <section className="section-wrap pt-0">
        <div className="bento-grid">
          <div className="bento-card bento-wide">
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85"
              alt="High-fidelity audio experience"
              className="bento-bg"
            />
            <div className="bento-overlay" />
            <div className="bento-content text-white">
              <p className="eyebrow text-accent">ACOUSTIC ARCHITECTURE</p>
              <h3>Pure signal.<br />Uncolored response.</h3>
              <p className="text-xs text-zinc-300 max-w-md mt-2">
                Engineered for sound engineers, producers, and discerning ears who value true source material over boosted bass.
              </p>
              <Link to="/shop?category=Audio" className="button button-accent mt-5">
                Explore Studio Audio <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="bento-card">
            <img
              src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85"
              alt="Compact tactile mechanical keyboard"
              className="bento-bg"
            />
            <div className="bento-overlay" />
            <div className="bento-content text-white">
              <p className="eyebrow text-white/70">TACTILE ESSENTIALS</p>
              <h3>Mechanical 75%</h3>
              <p className="text-xs text-zinc-300 mt-1">Lubed switches with custom dampening.</p>
              <Link to="/product/mechanical-keyboard" className="text-link text-white mt-4">
                View keyboard <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <div className="bento-card">
            <img
              src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"
              alt="Minimal desk light"
              className="bento-bg"
            />
            <div className="bento-overlay" />
            <div className="bento-content text-white">
              <p className="eyebrow text-white/70">DESK SANCTUARY</p>
              <h3>Ambient Light</h3>
              <p className="text-xs text-zinc-300 mt-1">Circadian color temperature curve.</p>
              <Link to="/product/desk-lamp" className="text-link text-white mt-4">
                View lighting <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY FEATURE */}
      <section className="category-feature">
        <div className="category-image">
          <img
            src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85"
            alt="Laptop and clean workspace"
          />
        </div>
        <div className="category-copy">
          <p className="eyebrow">THE WORKSPACE EDIT</p>
          <h2>
            Make room<br />
            for <em>good ideas.</em>
          </h2>
          <p>
            Small upgrades change how your entire day unfolds. Eliminate cable clutter, adjust lighting for eye comfort, and create an environment worthy of your best work.
          </p>
          <Link to="/shop?category=Workspace" className="button button-dark">
            Shop workspace collection <ArrowUpRight size={17} />
          </Link>
          <span className="category-index">COLLECTION 02 — WORK / CREATE / REPEAT</span>
        </div>
      </section>

      {/* PRESS & TESTIMONIALS */}
      <section className="section-wrap bg-paper">
        <SectionHeading
          eyebrow="REPUTATION"
          title="Designed for discerning minds."
          detail="What designers, musicians, and creators have to say about FORM hardware."
        />
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="flex gap-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="testimonial-quote">
              “The wireless headphones deliver unbelievable spatial separation. Zero auditory fatigue during 8-hour mixing sessions.”
            </p>
            <div className="testimonial-author">
              <strong>Devon R.</strong>
              <span>Sound Designer, Berlin</span>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="flex gap-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="testimonial-quote">
              “Finally, a tech brand that understands less is more. The mechanical keyboard is weighted perfection and looks gorgeous on oak.”
            </p>
            <div className="testimonial-author">
              <strong>Priya K.</strong>
              <span>Product Architect, Bengaluru</span>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="flex gap-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="testimonial-quote">
              “Build quality is unmatched. You can feel the cold-machined aluminum every time you adjust the desk stand. 10/10.”
            </p>
            <div className="testimonial-author">
              <strong>Liam M.</strong>
              <span>Industrial Designer, Tokyo</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PHILOSOPHY VALUES */}
      <section className="section-wrap border-t border-line">
        <SectionHeading eyebrow="DESIGN PHILOSOPHY" title="The details matter." />
        <div className="values-grid">
          <div>
            <span className="value-number">01</span>
            <h3>Considered, not crowded.</h3>
            <p>We keep the collection intentional so finding the right companion feels effortless and calm.</p>
          </div>
          <div>
            <span className="value-number">02</span>
            <h3>Tactile integrity.</h3>
            <p>Every switch, dial, and machined surface must provide precise, satisfying haptic feedback.</p>
          </div>
          <div>
            <span className="value-number">03</span>
            <h3>Repairable & lasting.</h3>
            <p>Thoughtful material choices, modular wear components, and firmware built without planned obsolescence.</p>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <div>
          <p className="eyebrow">THE OCCASIONAL DISPATCH</p>
          <h2>A little more intention<br />in your inbox.</h2>
          <p className="text-zinc-400 text-xs mt-3 max-w-sm">
            Receive exclusive invitations to experimental audio runs and seasonal collections. No spam, ever.
          </p>
        </div>

        <form onSubmit={handleSubscribe}>
          <label htmlFor="newsletter-email">Join 24,000+ creators and engineers.</label>
          <div className="newsletter-input">
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
            />
            <button aria-label="Subscribe" type="submit">
              {subscribed ? <Check size={18} /> : <ArrowRight size={19} />}
            </button>
          </div>
          <small>{subscribed ? "Thank you for subscribing to FORM." : "No noise. One-click unsubscribe whenever."}</small>
        </form>
      </section>
    </div>
  );
}
