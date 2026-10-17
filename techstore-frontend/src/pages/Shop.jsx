import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Grid3X3, LayoutGrid, Search, RotateCcw } from "lucide-react";
import { categories, products } from "../data/products";
import { productService } from "../services/api";
import { ProductCard, PageLoader, ErrorState, EmptyState } from "../components/ui";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(params.get("category") || "All products");
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState(params.get("search") || "");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columns, setColumns] = useState(4); // 3 or 4

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await productService.list({ search, category, sort });
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("We couldn't load the collection. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCategory(params.get("category") || "All products");
    setSearch(params.get("search") || "");
  }, [params]);

  useEffect(() => {
    load();
  }, [category, sort, search]);

  const visible = items.filter(p => p.price <= maxPrice);

  const resetAll = () => {
    setCategory("All products");
    setMaxPrice(20000);
    setSearch("");
    setParams({});
  };

  const hasActiveFilters = category !== "All products" || maxPrice < 20000 || search.trim() !== "";

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <p className="eyebrow flex items-center gap-2">
          <span className="eyebrow-dot" /> THE FORM ARCHIVE & COLLECTION
        </p>
        <h1>
          Find your <em>everyday.</em>
        </h1>
        <p className="max-w-xl text-muted text-sm leading-relaxed mt-2">
          Precision audio, tactile instruments, and quiet desktop accessories. Every piece crafted with intentional materials and built to endure.
        </p>
      </div>

      <div className="shop-toolbar">
        <div className="flex items-center gap-3">
          <button
            className={`filter-toggle ${filtersOpen ? "is-active" : ""}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {hasActiveFilters && <span className="active-dot" />}
          </button>

          <span className="text-muted text-xs hidden sm:inline">
            {loading ? "Discovering pieces…" : `${visible.length} ${visible.length === 1 ? "piece" : "pieces"} available`}
          </span>
        </div>

        <div className="toolbar-actions">
          <div className="grid-switcher hidden md:flex items-center gap-1 border border-line p-0.5 rounded">
            <button
              onClick={() => setColumns(3)}
              className={`p-1 rounded ${columns === 3 ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
              title="3 Columns"
              aria-label="3 Columns"
            >
              <Grid3X3 size={15} />
            </button>
            <button
              onClick={() => setColumns(4)}
              className={`p-1 rounded ${columns === 4 ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
              title="4 Columns"
              aria-label="4 Columns"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <label className="sort-label">
            <span>Sort:</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </label>
        </div>
      </div>

      {/* ACTIVE FILTER CHIPS */}
      {hasActiveFilters && (
        <div className="active-filter-chips">
          <span className="text-[11px] font-semibold text-muted">Active filters:</span>
          {category !== "All products" && (
            <button className="chip" onClick={() => { setCategory("All products"); setParams(p => { p.delete("category"); return p; }); }}>
              {category} <X size={12} />
            </button>
          )}
          {maxPrice < 20000 && (
            <button className="chip" onClick={() => setMaxPrice(20000)}>
              Under ₹{maxPrice.toLocaleString("en-IN")} <X size={12} />
            </button>
          )}
          {search && (
            <button className="chip" onClick={() => { setSearch(""); setParams(p => { p.delete("search"); return p; }); }}>
              Search: "{search}" <X size={12} />
            </button>
          )}
          <button className="chip chip-clear" onClick={resetAll}>
            <RotateCcw size={11} /> Reset all
          </button>
        </div>
      )}

      <div className="shop-layout">
        {filtersOpen && (
          <aside className="filters-panel">
            <div className="filter-section">
              <div className="flex items-center justify-between mb-3">
                <h3>Category</h3>
                {category !== "All products" && (
                  <button className="text-[10px] text-muted underline" onClick={() => setCategory("All products")}>Reset</button>
                )}
              </div>
              <div className="filter-options-group">
                {categories.map(c => {
                  const count = c === "All products" ? products.length : products.filter(p => p.category === c).length;
                  return (
                    <button
                      key={c}
                      className={`filter-option ${category === c ? "active" : ""}`}
                      onClick={() => {
                        setCategory(c);
                        setParams(p => {
                          if (c === "All products") p.delete("category");
                          else p.set("category", c);
                          return p;
                        });
                      }}
                    >
                      <span>{c}</span>
                      <span className="count-pill">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filter-section">
              <h3>Maximum Price</h3>
              <p className="text-sm font-semibold text-ink mb-2">₹{maxPrice.toLocaleString("en-IN")}</p>
              <input
                type="range"
                min="2000"
                max="20000"
                step="500"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="price-range"
              />
              <div className="range-labels">
                <span>₹2,000</span>
                <span>₹20,000</span>
              </div>
            </div>

            <button className="reset-filters" onClick={resetAll}>
              Reset all filters
            </button>
          </aside>
        )}

        <div className="shop-results">
          {error ? (
            <ErrorState message={error} retry={load} />
          ) : loading ? (
            <PageLoader />
          ) : visible.length ? (
            <div className={`product-grid ${columns === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
              {visible.map(p => (
                <ProductCard product={p} key={p.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="search"
              title="No matching objects found."
              detail="Try expanding your price range or clearing selected category filters."
              action="Reset filters"
              to="/shop"
            />
          )}
        </div>
      </div>
    </div>
  );
}
