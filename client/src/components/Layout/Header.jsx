import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faRotateLeft,
  faGift,
  faStreetView,
  faSearch,
  faBagShopping,
  faEllipsisVertical,
  faBars,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { useApp } from "../../context/AppContext";
import styles from "./Header.module.css";

import logoImg from "../../assets/CBNK-logo6-bgRemove1.png";
import nav1 from "../../assets/DesktopNav-characterworld26-26MAR26.webp";
import nav2 from "../../assets/MAX-WomenL2-Block6-24Feb2026.webp";
import nav3 from "../../assets/Chhaya-woman2.png";
import nav4 from "../../assets/MAX-Dept-Nav-Men-15OCT25.webp";
import nav5 from "../../assets/MAX-Dept-Nav-Kids-18AUG25.webp";
import nav6 from "../../assets/MAX-WomenL2-polos-25Feb2026.webp";
import nav7 from "../../assets/MAX-Dept-Nav-Urban-14MAY25.webp";

const categories = [
  { name: "Character World", img: nav1 },
  { name: "Sleepwear", img: nav2 },
  { name: "Women", img: nav3 },
  { name: "Men", img: nav4 },
  { name: "Kids", img: nav5 },
  { name: "Polo Shop", img: nav6 },
  { name: "GenZ Store", img: nav7 },
];

const Header = () => {
  const { totalItems, toggleCart } = useApp();

  return (
    <header className={styles.header}>
      {/* ================= TOP INFORMATION BAR ================= */}
      <div className={styles.topBarWrapper}>
        <div className={styles.topBar}>
          <div className={styles.topLeft}>
            <span>
              <FontAwesomeIcon icon={faTruck} />
              Free Shipping
            </span>

            <span>
              <FontAwesomeIcon icon={faRotateLeft} />
              Return To Store
            </span>

            <span>
              <FontAwesomeIcon icon={faGift} />
              Online Gift Card
            </span>
          </div>

          <div className={styles.topRight}>
            <span>
              <FontAwesomeIcon icon={faStreetView} />
              Delivering To
            </span>

            <span>Download Our Apps</span>
            <span>Store Locator</span>
            <span>Help</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
      <div className={styles.mainHeader}>
        <div className={styles.mainHeaderInner}>
          {/* Mobile Menu */}
          <button className={styles.mobileMenu} type="button">
            <FontAwesomeIcon icon={faBars} />
          </button>

          {/* Logo */}
          <div className={styles.logo}>
            <a href="/" aria-label="CBNK Home">
              <img src={logoImg} alt="CBNK" />
            </a>
          </div>

          {/* Search */}
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />

            <input
              type="text"
              placeholder="Search for products, brands and more..."
              className={styles.searchInput}
              aria-label="Search products"
            />
          </div>

          {/* Desktop Actions */}
          <div className={styles.headerActions}>
            <button className={styles.accountButton} type="button">
              <FontAwesomeIcon icon={faUser} />
              <span>
                <small>Welcome</small>
                <strong>Sign Up / Sign In</strong>
              </span>
            </button>

            <button className={styles.actionButton} type="button">
              <FontAwesomeIcon icon={faHeart} />
              <span>Favourites</span>
            </button>

            <button
              className={styles.actionButton}
              type="button"
              onClick={toggleCart}
            >
              <span className={styles.iconWrapper}>
                <FontAwesomeIcon icon={faBagShopping} />

                {totalItems > 0 && (
                  <span className={styles.cartBadge}>{totalItems}</span>
                )}
              </span>

              <span>Basket</span>
            </button>

            <button className={styles.actionButton} type="button">
              <FontAwesomeIcon icon={faEllipsisVertical} />
              <span>More</span>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className={styles.mobileActions}>
            <button type="button" aria-label="Search">
              <FontAwesomeIcon icon={faSearch} />
            </button>

            <button type="button" aria-label="Account">
              <FontAwesomeIcon icon={faUser} />
            </button>

            <button
              type="button"
              aria-label="Basket"
              onClick={toggleCart}
              className={styles.mobileCart}
            >
              <span className={styles.iconWrapper}>
                <FontAwesomeIcon icon={faBagShopping} />

                {totalItems > 0 && (
                  <span className={styles.cartBadge}>{totalItems}</span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className={styles.mobileSearch}>
          <FontAwesomeIcon icon={faSearch} />

          <input
            type="text"
            placeholder="Search products, brands and more..."
            aria-label="Search products"
          />
        </div>
      </div>

      {/* ================= CATEGORY NAVIGATION ================= */}
      <nav className={styles.categoryNav}>
        <div className={styles.categoryContainer}>
          {categories.map((category) => (
            <a href="#" key={category.name} className={styles.categoryItem}>
              <div className={styles.categoryImageWrapper}>
                <img src={category.img} alt={category.name} loading="lazy" />
              </div>

              <span>{category.name}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* ================= OFFER BAR ================= */}
      <div className={styles.offerBar}>
        <div className={styles.offerTrack}>
          <span>Flat ₹300 off on ₹1999. Code: CBNK300</span>

          <span className={styles.offerDivider}>•</span>

          <span>Flat ₹200 off on ₹1499. Code: CBNK200</span>

          <span className={styles.offerDivider}>•</span>

          <span>Free shipping on orders above ₹999</span>

          <span className={styles.offerDivider}>•</span>

          <span>Flat ₹300 off on ₹1999. Code: CBNK300</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
