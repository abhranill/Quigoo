"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

export type QuigooMenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isVeg: boolean;
  isPopular: boolean;
};

export type QuigooRestaurant = {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  category: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  imageUrl: string;
  area: string;
  isPromoted: boolean;
  menuItems: QuigooMenuItem[];
};

type CartLine = QuigooMenuItem & { quantity: number; restaurantName: string };
type IconName = "search" | "pin" | "chevron" | "plus" | "bag" | "user" | "arrow" | "heart" | "close" | "clock" | "star" | "leaf" | "minus" | "trash" | "bike" | "spark" | "filter";

const categories = [
  { name: "All spots", icon: "✳", filter: "All" },
  { name: "Indian", icon: "🍛", filter: "Indian" },
  { name: "Pizza", icon: "🍕", filter: "Pizza" },
  { name: "Burgers", icon: "🍔", filter: "Burgers" },
  { name: "Asian", icon: "🍜", filter: "Asian" },
  { name: "South Indian", icon: "🥞", filter: "South Indian" },
  { name: "Healthy", icon: "🥗", filter: "Healthy" },
  { name: "Sweet stuff", icon: "🍰", filter: "Desserts" },
];

const numberFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const formatPrice = (price: number) => `₹${numberFormat.format(price)}`;

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const drawings: Record<IconName, ReactNode> = {
    search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></>,
    pin: <><path d="M19 10c0 5.1-7 11-7 11S5 15.1 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.1" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    heart: <path d="M20.8 8.7c0 5.1-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.7A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.6Z" />,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    star: <path d="m12 3 2.7 5.5 6 .9-4.4 4.3 1 6.1-5.3-2.9-5.3 2.9 1-6.1-4.4-4.3 6-.9L12 3Z" />,
    leaf: <><path d="M20 4c-9 0-15 3-15 10a6 6 0 0 0 6 6c7 0 9-8 9-16Z" /><path d="M4 21c2-5 5-8 11-11" /></>,
    minus: <path d="M5 12h14" />,
    trash: <><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3" /></>,
    bike: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="m6 17 4-8h4l4 8M10 9H7m8 0h2" /><path d="m11 13 4 0" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    filter: <><path d="M4 6h16M7 12h10m-7 6h4" /><circle cx="8" cy="6" r="1" /><circle cx="15" cy="12" r="1" /></>,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {drawings[name]}
    </svg>
  );
}

async function sendJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result: unknown = await response.json();
  if (!response.ok) {
    const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
      ? result.error
      : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return result as T;
}

function RestaurantCard({
  restaurant,
  onOpen,
  isSaved,
  onToggleSaved,
}: {
  restaurant: QuigooRestaurant;
  onOpen: () => void;
  isSaved: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <article className="restaurant-card">
      <div className="restaurant-photo-wrap">
        <button className="restaurant-photo-button" type="button" onClick={onOpen} aria-label={`View ${restaurant.name} menu`}>
          <Image
            src={restaurant.imageUrl}
            alt={`${restaurant.cuisine} from ${restaurant.name}`}
            fill
            unoptimized
            sizes="(max-width: 640px) 92vw, (max-width: 1000px) 45vw, 30vw"
            className="restaurant-photo"
          />
          <span className="photo-shade" />
          {restaurant.isPromoted && <span className="photo-pick"><Icon name="spark" size={13} /> QUI-GOO PICK</span>}
          <span className="photo-open" aria-hidden="true"><Icon name="arrow" size={18} /></span>
        </button>
        <button
          className={`favorite-button ${isSaved ? "is-saved" : ""}`}
          type="button"
          aria-label={isSaved ? `Remove ${restaurant.name} from favourites` : `Save ${restaurant.name} to favourites`}
          onClick={onToggleSaved}
        >
          <Icon name="heart" size={18} />
        </button>
        {restaurant.deliveryFee === 0 && <span className="photo-ribbon">FREE DELIVERY</span>}
      </div>
      <button className="restaurant-card-info" type="button" onClick={onOpen}>
        <span className="restaurant-card-title-row">
          <span className="restaurant-card-name">{restaurant.name}</span>
          <span className="restaurant-rating"><Icon name="star" size={13} /> {restaurant.rating.toFixed(1)}</span>
        </span>
        <span className="restaurant-card-cuisine">{restaurant.cuisine}</span>
        <span className="restaurant-card-bottom">
          <span><Icon name="clock" size={14} /> {restaurant.deliveryTime}</span>
          <span className="meta-divider" />
          <span>{restaurant.deliveryFee === 0 ? "Free delivery" : `${formatPrice(restaurant.deliveryFee)} delivery`}</span>
          <span className="meta-dot">·</span>
          <span>{restaurant.area}</span>
        </span>
      </button>
    </article>
  );
}

export function QuigooApp({ initialRestaurants }: { initialRestaurants: QuigooRestaurant[] }) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recommended");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState<"basket" | "checkout">("basket");
  const [savedRestaurants, setSavedRestaurants] = useState<string[]>([]);
  const [managementOpen, setManagementOpen] = useState(false);
  const [managementTab, setManagementTab] = useState<"restaurant" | "item">("restaurant");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [toast, setToast] = useState("");
  const [orderConfirmation, setOrderConfirmation] = useState<{ id: string; total: number; restaurantName: string; deliveryTime: string } | null>(null);

  const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ?? null;
  const cartRestaurant = restaurants.find((restaurant) => restaurant.id === cart[0]?.restaurantId) ?? null;
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const deliveryFee = subtotal >= 499 ? 0 : (cartRestaurant?.deliveryFee ?? 0);
  const total = subtotal + deliveryFee;

  const filteredRestaurants = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const matches = restaurants.filter((restaurant) => {
      const matchesCategory = category === "All" || restaurant.category.toLowerCase() === category.toLowerCase();
      const searchable = [
        restaurant.name,
        restaurant.cuisine,
        restaurant.category,
        restaurant.area,
        ...restaurant.menuItems.map((item) => `${item.name} ${item.category}`),
      ].join(" ").toLowerCase();
      return matchesCategory && (!cleanQuery || searchable.includes(cleanQuery));
    });
    return [...matches].sort((left, right) => {
      if (sortOrder === "rating") return right.rating - left.rating;
      if (sortOrder === "fastest") return left.deliveryTime.localeCompare(right.deliveryTime, "en", { numeric: true });
      return Number(right.isPromoted) - Number(left.isPromoted) || right.rating - left.rating;
    });
  }, [restaurants, category, query, sortOrder]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  function jumpToRestaurants() {
    document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addToCart(item: QuigooMenuItem, restaurant: QuigooRestaurant) {
    const switchingRestaurants = cart.length > 0 && cart[0].restaurantId !== restaurant.id;
    setCart((current) => {
      if (current.length > 0 && current[0].restaurantId !== restaurant.id) {
        return [{ ...item, quantity: 1, restaurantName: restaurant.name }];
      }
      const existing = current.find((line) => line.id === item.id);
      if (existing) {
        return current.map((line) => line.id === item.id ? { ...line, quantity: Math.min(line.quantity + 1, 20) } : line);
      }
      return [...current, { ...item, quantity: 1, restaurantName: restaurant.name }];
    });
    notify(switchingRestaurants ? `Your basket is now with ${restaurant.name}.` : `${item.name} added to your basket.`);
  }

  function adjustQuantity(id: string, delta: number) {
    setCart((current) => current
      .map((line) => line.id === id ? { ...line, quantity: line.quantity + delta } : line)
      .filter((line) => line.quantity > 0));
  }

  function toggleSaved(id: string) {
    setSavedRestaurants((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);
  }

  async function submitRestaurant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      cuisine: String(form.get("cuisine") ?? ""),
      category: String(form.get("category") ?? "Indian"),
      area: String(form.get("area") ?? ""),
      description: String(form.get("description") ?? ""),
      imageUrl: String(form.get("imageUrl") ?? ""),
      deliveryTime: String(form.get("deliveryTime") ?? "25–35 min"),
      deliveryFee: Number(form.get("deliveryFee") ?? 0),
      firstItem: {
        name: String(form.get("itemName") ?? ""),
        description: String(form.get("itemDescription") ?? ""),
        category: String(form.get("itemCategory") ?? "Popular"),
        price: Number(form.get("itemPrice") ?? 0),
        isVeg: form.get("isVeg") === "on",
      },
    };

    try {
      const result = await sendJson<{ restaurant: QuigooRestaurant }>("/api/restaurants", payload);
      setRestaurants((current) => [result.restaurant, ...current]);
      setManagementOpen(false);
      notify(`${result.restaurant.name} is now on Quigoo!`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "We couldn't add that restaurant.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitMenuItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      restaurantId: String(form.get("restaurantId") ?? ""),
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      category: String(form.get("category") ?? "Popular"),
      price: Number(form.get("price") ?? 0),
      imageUrl: String(form.get("imageUrl") ?? ""),
      isVeg: form.get("isVeg") === "on",
    };

    try {
      const result = await sendJson<{ menuItem: QuigooMenuItem }>("/api/menu-items", payload);
      setRestaurants((current) => current.map((restaurant) => restaurant.id === result.menuItem.restaurantId
        ? { ...restaurant, menuItems: [...restaurant.menuItems, result.menuItem] }
        : restaurant));
      setManagementOpen(false);
      notify(`${result.menuItem.name} has been added to the menu.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "We couldn't add that menu item.");
    } finally {
      setIsSaving(false);
    }
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cartRestaurant || cart.length === 0) return;
    setIsOrdering(true);
    setFormError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      restaurantId: cartRestaurant.id,
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      deliveryAddress: String(form.get("deliveryAddress") ?? ""),
      paymentMethod: String(form.get("paymentMethod") ?? "Cash on delivery"),
      items: cart.map((line) => ({ id: line.id, quantity: line.quantity })),
    };

    try {
      const result = await sendJson<{
        order: { id: string; total: number };
        restaurantName: string;
        deliveryTime: string;
      }>("/api/orders", payload);
      setOrderConfirmation({
        id: result.order.id,
        total: result.order.total,
        restaurantName: result.restaurantName,
        deliveryTime: result.deliveryTime,
      });
      setCart([]);
      setCartStep("basket");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "We couldn't place your order.");
    } finally {
      setIsOrdering(false);
    }
  }

  function openBasket() {
    setSelectedRestaurantId(null);
    setOrderConfirmation(null);
    setCartStep("basket");
    setCartOpen(true);
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="announcement-bar">
        <span className="announcement-spark">✳</span> Fresh food. Familiar faces. A little more joy in every delivery.
        <span className="announcement-right">DELIVERING THE GOOD STUFF <span>✳</span></span>
      </div>

      <header className="site-header">
        <div className="header-main">
          <a href="#top" className="brand-lockup" aria-label="Quigoo home">
            <span className="brand-word">qui<span>goo</span></span>
            <span className="brand-sparkle">✳</span>
          </a>
          <button className="delivery-location" type="button" onClick={() => notify("We're delivering around Indiranagar, Bengaluru.")}>
            <span className="location-icon"><Icon name="pin" size={17} /></span>
            <span className="location-copy"><small>DELIVERING TO</small><strong>Indiranagar, Bengaluru</strong></span>
            <Icon name="chevron" size={16} />
          </button>
          <label className="header-search">
            <Icon name="search" size={19} />
            <input
              type="search"
              placeholder="Dishes, restaurants, cravings..."
              aria-label="Search restaurants and dishes"
              value={query}
              onChange={(event) => { setQuery(event.target.value); if (event.target.value) jumpToRestaurants(); }}
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="header-actions">
            <button className="owner-link" type="button" onClick={() => { setManagementOpen(true); setFormError(""); }}><span className="owner-link-icon"><Icon name="plus" size={16} /></span> Add your place</button>
            <button className="signin-button" type="button" onClick={() => notify("Good news — you can order as a guest. No sign-in needed.")}><Icon name="user" size={19} /><span>Sign in</span></button>
            <button className="cart-header-button" type="button" onClick={openBasket} aria-label={`Open basket, ${itemCount} items`}>
              <Icon name="bag" size={20} /><span>Basket</span><span className="cart-header-count">{itemCount}</span>
            </button>
          </div>
        </div>
        <div className="mobile-location"><Icon name="pin" size={16} /><span>Delivering to <strong>Indiranagar, Bengaluru</strong></span><Icon name="chevron" size={15} /></div>
      </header>

      <main id="main-content">
        <div className="page-wrap">
          <section className="hero-section" aria-labelledby="hero-title">
            <div className="hero-content">
              <span className="hero-eyebrow"><span className="eyebrow-dot" /> YOUR NEIGHBOURHOOD, ON A PLATE</span>
              <h1 id="hero-title">Good food.<br /><span>Good mood.</span></h1>
              <p>Big cravings, little wait. Your local favourites are just a few taps away.</p>
              <div className="hero-ctas">
                <button className="button button-lime" type="button" onClick={jumpToRestaurants}>Find your flavour <Icon name="arrow" size={18} /></button>
                <span className="hero-proof"><span className="proof-avatars"><i>👩🏽‍🍳</i><i>🧑🏻‍🍳</i><i>👨🏾‍🍳</i></span> Good people, good food</span>
              </div>
            </div>
            <div className="hero-note"><span className="hero-note-spark">✳</span><span><strong>Food that feels<br />like a good idea.</strong><small>ORDER LOCAL. EAT HAPPY.</small></span></div>
            <div className="hero-caption"><span>01 — LITTLE LOCAL LOVES</span><span>BENGALURU, INDIA</span></div>
          </section>

          <div className="service-promise">
            <div className="promise-item"><span className="promise-icon promise-green"><Icon name="bike" size={18} /></span><span><strong>25–35 min</strong><small>at your doorstep</small></span></div>
            <span className="promise-divider" />
            <div className="promise-item"><span className="promise-icon promise-peach">✳</span><span><strong>Made nearby</strong><small>from local favourites</small></span></div>
            <span className="promise-divider" />
            <div className="promise-item"><span className="promise-icon promise-yellow">♡</span><span><strong>Good food energy</strong><small>in every single order</small></span></div>
            <span className="promise-side-note">A little closer to your cravings <span>↗</span></span>
          </div>

          <section className="category-section" aria-labelledby="category-title">
            <div className="section-heading category-heading">
              <div><span className="eyebrow-label">WHAT SOUNDS GOOD?</span><h2 id="category-title">Pick your kind of happy.</h2></div>
              <span className="category-helper">A good place to start <span>↓</span></span>
            </div>
            <div className="category-list" role="group" aria-label="Filter restaurants by category">
              {categories.map((item) => (
                <button
                  key={item.filter}
                  type="button"
                  className={`category-chip ${category === item.filter ? "category-chip-active" : ""}`}
                  onClick={() => { setCategory(item.filter); jumpToRestaurants(); }}
                >
                  <span className="category-icon">{item.icon}</span><span>{item.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="offers-section" id="offers" aria-label="Quigoo offers">
            <article className="offer-card offer-card-dark">
              <div className="offer-content"><span className="offer-kicker"><Icon name="spark" size={14} /> FIRST BITE, ON US</span><h3>More joy.<br />Less delivery fee.</h3><p>Get free delivery on orders over ₹499.</p><button type="button" onClick={jumpToRestaurants}>Find something lovely <Icon name="arrow" size={16} /></button></div>
              <span className="offer-art offer-art-dark">₹<strong>0</strong><small>DELIVERY</small></span>
              <span className="offer-number">01 / 02</span>
            </article>
            <article className="offer-card offer-card-orange">
              <div className="offer-content"><span className="offer-kicker"><Icon name="heart" size={14} /> YOUR NEIGHBOURHOOD, BUT CLOSER</span><h3>Good food<br />lives nearby.</h3><p>Local spots, lovely people, very good lunch.</p><button type="button" onClick={() => { setCategory("All"); jumpToRestaurants(); }}>Meet the locals <Icon name="arrow" size={16} /></button></div>
              <span className="offer-stamp">LOCAL<br /><strong>LOVE</strong><i>✳</i></span>
              <span className="offer-number">02 / 02</span>
            </article>
          </section>

          <section className="restaurant-section" id="restaurants" aria-labelledby="restaurant-title">
            <div className="restaurant-section-topline"><span className="eyebrow-label"><span className="eyebrow-dot eyebrow-dot-orange" /> THE GOOD STUFF AROUND YOU</span><span className="subtle-note">Curated with love, delivered with care.</span></div>
            <div className="restaurant-title-row">
              <div><h2 id="restaurant-title">Good eats, <span>right around you.</span></h2><p>{filteredRestaurants.length} lovely spots, ready when you are.</p></div>
              <div className="restaurant-tools">
                <label className="sort-control"><Icon name="filter" size={16} /><span className="sr-only">Sort restaurants</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="recommended">For you</option><option value="rating">Top rated</option><option value="fastest">Fastest</option></select><Icon name="chevron" size={14} /></label>
              </div>
            </div>
            <div className="active-filters">
              {category !== "All" && <button type="button" onClick={() => setCategory("All")} className="active-filter">{categories.find((item) => item.filter === category)?.name ?? category}<Icon name="close" size={13} /></button>}
              {query && <button type="button" onClick={() => setQuery("")} className="active-filter">“{query}”<Icon name="close" size={13} /></button>}
            </div>
            {filteredRestaurants.length > 0 ? (
              <div className="restaurant-grid">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onOpen={() => setSelectedRestaurantId(restaurant.id)}
                    isSaved={savedRestaurants.includes(restaurant.id)}
                    onToggleSaved={() => toggleSaved(restaurant.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-results"><span>🍽️</span><h3>No bites found (yet).</h3><p>Try another dish, neighbourhood, or cuisine.</p><button className="button button-dark" type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Show me everything</button></div>
            )}
          </section>

          <section className="owner-banner">
            <div className="owner-banner-mark">✳</div>
            <div className="owner-banner-copy"><span className="eyebrow-label">GOOD FOOD DESERVES A BIGGER TABLE</span><h2>Have a place that<br /><span>makes people happy?</span></h2><p>Bring your restaurant to the neighbourhood. Add your spot and first dish in a couple of minutes.</p></div>
            <button className="button button-lime owner-banner-button" type="button" onClick={() => { setManagementTab("restaurant"); setFormError(""); setManagementOpen(true); }}>Add your restaurant <Icon name="arrow" size={18} /></button>
            <span className="owner-banner-scribble">GOOD FOOD<br />GOES AROUND <b>↗</b></span>
          </section>
        </div>
      </main>

      <footer className="site-footer" id="top">
        <div className="footer-main"><a href="#top" className="brand-lockup footer-brand" aria-label="Quigoo home"><span className="brand-word">qui<span>goo</span></span><span className="brand-sparkle">✳</span></a><span className="footer-tagline">A little joy, delivered.</span><div className="footer-links"><a href="#restaurants">Find a restaurant</a><button type="button" onClick={() => { setManagementTab("restaurant"); setManagementOpen(true); }}>Partner with us</button><a href="#offers">Our little perks</a></div></div>
        <div className="footer-bottom"><span>© 2026 Quigoo. Made for good food people.</span><span className="footer-location">BENGALURU, INDIA <span>✳</span></span><span>Eat well. Be well. <b>♡</b></span></div>
      </footer>

      {selectedRestaurant && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRestaurantId(null); }}>
          <section className="menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-dialog-title">
            <div className="menu-dialog-cover">
              <Image src={selectedRestaurant.imageUrl} alt="" fill unoptimized sizes="(max-width: 760px) 100vw, 740px" className="menu-cover-photo" />
              <span className="menu-cover-shade" />
              <button className="dialog-close" type="button" onClick={() => setSelectedRestaurantId(null)} aria-label="Close menu"><Icon name="close" size={20} /></button>
              {selectedRestaurant.isPromoted && <span className="menu-cover-badge"><Icon name="spark" size={13} /> QUI-GOO PICK</span>}
              <div className="menu-cover-title"><span className="eyebrow-label">{selectedRestaurant.category.toUpperCase()} · {selectedRestaurant.area.toUpperCase()}</span><h2 id="menu-dialog-title">{selectedRestaurant.name}</h2><p>{selectedRestaurant.cuisine}</p></div>
            </div>
            <div className="menu-dialog-meta"><span><Icon name="star" size={15} /> {selectedRestaurant.rating.toFixed(1)} <small>· Great taste</small></span><i /><span><Icon name="clock" size={15} /> {selectedRestaurant.deliveryTime}</span><i /><span><Icon name="bike" size={16} /> {selectedRestaurant.deliveryFee === 0 ? "Free delivery" : `${formatPrice(selectedRestaurant.deliveryFee)} delivery`}</span></div>
            <div className="menu-list-heading"><span className="eyebrow-label">GOOD THINGS TO EAT</span><h3>The menu <span>we love.</span></h3><p>Cooked fresh. Picked for you.</p></div>
            <div className="menu-items-list">
              {selectedRestaurant.menuItems.length > 0 ? selectedRestaurant.menuItems.map((item) => {
                const inCart = cart.find((line) => line.id === item.id);
                return (
                  <article className="menu-item-row" key={item.id}>
                    <div className="menu-item-copy"><span className={`diet-mark ${item.isVeg ? "diet-veg" : "diet-nonveg"}`} title={item.isVeg ? "Vegetarian" : "Non-vegetarian"}><i /></span><span className="menu-item-category">{item.category}{item.isPopular ? <span> · FAVOURITE</span> : null}</span><h4>{item.name}</h4><p>{item.description}</p><strong>{formatPrice(item.price)}</strong></div>
                    <div className="menu-item-image"><Image src={item.imageUrl || selectedRestaurant.imageUrl} alt={item.name} fill unoptimized sizes="112px" /></div>
                    <button className={`add-item-button ${inCart ? "item-added" : ""}`} type="button" onClick={() => addToCart(item, selectedRestaurant)} aria-label={`Add ${item.name} to basket`}>{inCart ? `ADDED · ${inCart.quantity}` : "ADD +"}</button>
                  </article>
                );
              }) : <p className="no-menu-items">This kitchen is setting the table. Check back for the menu soon.</p>}
            </div>
            {cart.length > 0 && cart[0].restaurantId === selectedRestaurant.id && <div className="menu-cart-cta"><span><strong>{itemCount} {itemCount === 1 ? "item" : "items"}</strong><small>{formatPrice(total)} including delivery</small></span><button type="button" onClick={openBasket}>View basket <Icon name="arrow" size={17} /></button></div>}
          </section>
        </div>
      )}

      {cartOpen && (
        <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="drawer-header">
              {cartStep === "checkout" && !orderConfirmation ? <button className="drawer-back-button" type="button" onClick={() => { setCartStep("basket"); setFormError(""); }}>← <span>Basket</span></button> : <span className="drawer-kicker">YOUR LITTLE BASKET</span>}
              <button className="drawer-close" type="button" onClick={() => setCartOpen(false)} aria-label="Close basket"><Icon name="close" size={20} /></button>
              <h2 id="cart-title">{orderConfirmation ? "You made a good choice." : cartStep === "checkout" ? "One last thing." : "Your basket."}</h2>
              {orderConfirmation ? <p>Something lovely is on its way.</p> : cartStep === "checkout" ? <p>Where should we bring the good stuff?</p> : <p>{cartRestaurant ? `A little something from ${cartRestaurant.name}.` : "It's looking a little empty in here."}</p>}
            </div>
            {orderConfirmation ? (
              <div className="order-success">
                <span className="success-stamp">✳</span>
                <span className="eyebrow-label">ORDER CONFIRMED</span>
                <h3>Good things<br /><span>are on the way.</span></h3>
                <p>Your order from <strong>{orderConfirmation.restaurantName}</strong> is being prepared and should reach you in about <strong>{orderConfirmation.deliveryTime}</strong>.</p>
                <div className="order-receipt"><span>ORDER NUMBER</span><strong>#{orderConfirmation.id.slice(0, 8).toUpperCase()}</strong><i /><span>PAID AT THE DOOR</span><strong>{formatPrice(orderConfirmation.total)}</strong></div>
                <div className="success-delivery"><span>🚲</span><span><strong>We'll keep an eye on it.</strong><small>Thanks for choosing local. You just made somebody's day.</small></span></div>
                <button className="button button-dark success-button" type="button" onClick={() => { setCartOpen(false); setOrderConfirmation(null); jumpToRestaurants(); }}>Find your next happy <Icon name="arrow" size={18} /></button>
              </div>
            ) : cartStep === "checkout" ? (
              <form className="checkout-form" onSubmit={placeOrder}>
                <div className="checkout-fields"><label>Your name<input name="customerName" autoComplete="name" placeholder="The name on the door" required minLength={2} maxLength={80} /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="10-digit mobile number" required minLength={10} maxLength={25} /></label><label>Delivery address<textarea name="deliveryAddress" autoComplete="street-address" placeholder="Flat, building, street, and a nearby landmark" required minLength={10} maxLength={300} rows={3} /></label><label>How would you like to pay?<select name="paymentMethod" defaultValue="Cash on delivery"><option>Cash on delivery</option><option>UPI on delivery</option></select></label></div>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="checkout-summary"><div><span>{itemCount} {itemCount === 1 ? "item" : "items"}</span><strong>{formatPrice(subtotal)}</strong></div><div><span>Delivery</span><strong>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</strong></div><div className="checkout-total"><span>Total to pay</span><strong>{formatPrice(total)}</strong></div></div>
                <button className="button button-dark checkout-submit" type="submit" disabled={isOrdering}>{isOrdering ? <><span className="loading-dot" /> Placing your order...</> : <>Place my order · {formatPrice(total)} <Icon name="arrow" size={17} /></>}</button>
                <p className="secure-note"><Icon name="heart" size={14} /> Freshly prepared. Kindly delivered. Paid at the door.</p>
              </form>
            ) : cart.length === 0 ? (
              <div className="empty-basket"><span className="empty-basket-art">🥡</span><h3>Good things go<br />in here.</h3><p>Find a neighbourhood favourite and add something lovely to your basket.</p><button className="button button-dark" type="button" onClick={() => { setCartOpen(false); jumpToRestaurants(); }}>Explore the menu <Icon name="arrow" size={18} /></button></div>
            ) : (
              <div className="basket-content">
                <div className="basket-restaurant-line"><span className="basket-restaurant-icon">✳</span><span><strong>{cartRestaurant?.name}</strong><small>One restaurant per little basket</small></span></div>
                <div className="basket-items">{cart.map((line) => <article className="basket-item" key={line.id}><div className="basket-item-image"><Image src={line.imageUrl || cartRestaurant?.imageUrl || "/images/quigoo-hero.jpg"} alt="" fill unoptimized sizes="80px" /></div><div className="basket-item-copy"><strong>{line.name}</strong><span>{formatPrice(line.price)} each</span><div className="quantity-control"><button type="button" onClick={() => adjustQuantity(line.id, -1)} aria-label={`Remove one ${line.name}`}><Icon name={line.quantity === 1 ? "trash" : "minus"} size={13} /></button><span>{line.quantity}</span><button type="button" onClick={() => adjustQuantity(line.id, 1)} aria-label={`Add one ${line.name}`}><Icon name="plus" size={13} /></button></div></div><strong className="basket-line-total">{formatPrice(line.price * line.quantity)}</strong></article>)}</div>
                <button className="basket-add-more" type="button" onClick={() => { setCartOpen(false); if (cartRestaurant) setSelectedRestaurantId(cartRestaurant.id); }}>+ Add one more lovely thing</button>
                <div className="basket-bill"><h3>The little details</h3><div><span>Item total</span><span>{formatPrice(subtotal)}</span></div><div><span>Delivery fee {subtotal >= 499 && <small>· on us!</small>}</span><span className={deliveryFee === 0 ? "bill-free" : ""}>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span></div><div className="basket-total"><span>Total</span><strong>{formatPrice(total)}</strong></div><p>{subtotal < 499 && cartRestaurant ? `Add ${formatPrice(499 - subtotal)} more to get free delivery.` : "Lovely choice. You've unlocked free delivery."}</p></div>
                <button className="button button-dark checkout-button" type="button" onClick={() => { setCartStep("checkout"); setFormError(""); }}>Continue to delivery <Icon name="arrow" size={18} /></button>
                <p className="secure-note"><Icon name="heart" size={14} /> Good food is just one more tap away.</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {managementOpen && (
        <div className="dialog-backdrop partner-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setManagementOpen(false); }}>
          <section className="partner-dialog" role="dialog" aria-modal="true" aria-labelledby="partner-title">
            <button className="partner-close" type="button" onClick={() => { setManagementOpen(false); setFormError(""); }} aria-label="Close restaurant manager"><Icon name="close" size={20} /></button>
            <div className="partner-dialog-head"><span className="partner-head-mark">✳</span><span className="eyebrow-label">A BIGGER TABLE FOR GOOD FOOD</span><h2 id="partner-title">Let&apos;s get your<br /><span>place on the map.</span></h2><p>Add your restaurant and dish to the Quigoo neighbourhood.</p></div>
            <div className="partner-tabs" role="tablist" aria-label="Manage your restaurant">
              <button type="button" role="tab" aria-selected={managementTab === "restaurant"} className={managementTab === "restaurant" ? "partner-tab-active" : ""} onClick={() => { setManagementTab("restaurant"); setFormError(""); }}>Add a restaurant</button>
              <button type="button" role="tab" aria-selected={managementTab === "item"} className={managementTab === "item" ? "partner-tab-active" : ""} onClick={() => { setManagementTab("item"); setFormError(""); }}>Add a menu item</button>
            </div>
            {formError && <p className="form-error partner-error" role="alert">{formError}</p>}
            {managementTab === "restaurant" ? (
              <form className="partner-form" onSubmit={submitRestaurant}>
                <div className="form-section-heading"><span>01</span><strong>Tell us about your place</strong></div>
                <div className="form-grid"><label className="form-span">Restaurant name<input name="name" placeholder="e.g. The Sunday Table" required minLength={2} maxLength={80} /></label><label>Cuisine<input name="cuisine" placeholder="e.g. South Indian · Breakfast" required maxLength={100} /></label><label>Food category<select name="category" defaultValue="Indian"><option>Indian</option><option>Pizza</option><option>Burgers</option><option>Asian</option><option>South Indian</option><option>Healthy</option><option>Desserts</option></select></label><label>Neighbourhood<input name="area" placeholder="e.g. Indiranagar" required maxLength={80} /></label><label>Delivery estimate<select name="deliveryTime" defaultValue="25–35 min"><option>15–25 min</option><option>20–30 min</option><option>25–35 min</option><option>30–40 min</option><option>40–50 min</option></select></label><label className="form-span">A little about your food<textarea name="description" placeholder="What makes your food special?" required minLength={8} maxLength={320} rows={2} /></label><label className="form-span">Restaurant photo URL <span className="optional-label">OPTIONAL</span><input name="imageUrl" type="url" placeholder="https://your-photo.jpg" /></label></div>
                <div className="form-section-heading form-section-menu"><span>02</span><strong>Start with your first dish</strong><small>Every good story starts with a first bite.</small></div>
                <div className="form-grid"><label>First menu item<input name="itemName" placeholder="e.g. House special dosa" required minLength={2} maxLength={80} /></label><label>Menu category<input name="itemCategory" placeholder="e.g. Signatures" maxLength={40} /></label><label className="form-span">A little description<textarea name="itemDescription" placeholder="What's in the dish?" required minLength={5} maxLength={240} rows={2} /></label><label>Price (₹)<input name="itemPrice" type="number" min="1" max="20000" step="1" placeholder="249" required /></label><label>Delivery fee (₹)<input name="deliveryFee" type="number" min="0" max="500" step="1" defaultValue="0" required /></label><label className="veg-checkbox form-span"><input type="checkbox" name="isVeg" defaultChecked /><span className="diet-mark diet-veg"><i /></span> This dish is vegetarian</label></div>
                <button className="button button-dark partner-submit" type="submit" disabled={isSaving}>{isSaving ? <><span className="loading-dot" /> Adding your place...</> : <>Add my place to Quigoo <Icon name="arrow" size={18} /></>}</button>
                <p className="partner-footnote"><Icon name="heart" size={14} /> Your restaurant and first dish go live as soon as you submit.</p>
              </form>
            ) : (
              <form className="partner-form" onSubmit={submitMenuItem}>
                {restaurants.length === 0 ? <p className="no-menu-items">Add a restaurant first, then come back to build your menu.</p> : <>
                  <div className="form-section-heading"><span>01</span><strong>Choose your kitchen</strong></div>
                  <label className="single-form-field">Restaurant<select name="restaurantId" required defaultValue=""><option value="" disabled>Choose a restaurant</option>{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name} · {restaurant.area}</option>)}</select></label>
                  <div className="form-section-heading form-section-menu"><span>02</span><strong>Add a menu item</strong></div>
                  <div className="form-grid"><label className="form-span">Item name<input name="name" placeholder="e.g. Crispy chilli paneer" required minLength={2} maxLength={80} /></label><label>Price (₹)<input name="price" type="number" min="1" max="20000" step="1" placeholder="249" required /></label><label>Menu category<input name="category" placeholder="e.g. Small plates" maxLength={40} /></label><label className="form-span">A little description<textarea name="description" placeholder="Tell them what makes it lovely." required minLength={5} maxLength={240} rows={2} /></label><label className="form-span">Dish photo URL <span className="optional-label">OPTIONAL</span><input name="imageUrl" type="url" placeholder="Leave blank to use your restaurant photo" /></label><label className="veg-checkbox form-span"><input type="checkbox" name="isVeg" defaultChecked /><span className="diet-mark diet-veg"><i /></span> This dish is vegetarian</label></div>
                  <button className="button button-dark partner-submit" type="submit" disabled={isSaving}>{isSaving ? <><span className="loading-dot" /> Adding to the menu...</> : <>Add this lovely dish <Icon name="arrow" size={18} /></>}</button>
                  <p className="partner-footnote"><Icon name="heart" size={14} /> Your new dish appears in the menu right away.</p>
                </>}
              </form>
            )}
          </section>
        </div>
      )}

      {toast && <div className="toast-message" role="status"><span>✳</span>{toast}</div>}
      {itemCount > 0 && !cartOpen && <button type="button" className="mobile-cart-button" onClick={openBasket}><span className="mobile-cart-count">{itemCount}</span><span><strong>View basket</strong><small>{cartRestaurant?.name}</small></span><b>{formatPrice(total)} <Icon name="arrow" size={17} /></b></button>}
    </div>
  );
}
