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

const Header = () => {
  const { totalItems, toggleCart } = useApp();

  const categories = [
    { name: "Character World", img: nav1 },
    { name: "Sleepwear", img: nav2 },
    { name: "Women", img: nav3 },
    { name: "Men", img: nav4 },
    { name: "Kids", img: nav5 },
    { name: "Polo Shop", img: nav6 },
    { name: "GenZ Store", img: nav7 },
  ];

  return (
    <header>
      <div className={styles.rootBlack}>
        <div className={styles.topBar}>
          <div className={styles.topLeft}>
            <span>
              <FontAwesomeIcon icon={faTruck} /> Free Shipping
            </span>
            <span>
              <FontAwesomeIcon icon={faRotateLeft} /> Return To Store
            </span>
            <span>
              <FontAwesomeIcon icon={faGift} /> Online Gift Card
            </span>
          </div>
          <div className={styles.topRight}>
            <span>
              <FontAwesomeIcon icon={faStreetView} /> Delivering To
            </span>
            |<span>Download Our Apps</span>|<span>Store Locator</span>|
            <span>Help</span>
          </div>
        </div>
      </div>

      <div className={styles.rootFull}>
        <div className={styles.rootContainer}>
          <div className={styles.navbar}>
            <div className={styles.logo}>
              <a href="/">
                <img src={logoImg} alt="Logo" />
              </a>
            </div>
            <div className={styles.searchBox}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="What are you looking for?"
                className={styles.searchInput}
              />
            </div>
            <div className={styles.space}></div>
            <div className={styles.navRight}>
              <button className={styles.loginBtn}>SIGN UP / SIGN IN</button>
            </div>
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faHeart} className={styles.faIcon} />
              <span>Favourites</span>
            </div>
            <div className={styles.icon} onClick={toggleCart}>
              <div className={styles.badgeWrapper}>
                <FontAwesomeIcon
                  icon={faBagShopping}
                  className={styles.faIcon}
                />
                {totalItems > 0 && (
                  <span className={styles.cartBadge}>{totalItems}</span>
                )}
                <span>Basket</span>
              </div>
            </div>
            <div className={styles.icon}>
              <FontAwesomeIcon
                icon={faEllipsisVertical}
                className={styles.faIcon}
              />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rootBottom}>
        {categories.map((cat, i) => (
          <div key={i} className={styles.items}>
            <img src={cat.img} alt={cat.name} />
            <div>{cat.name}</div>
          </div>
        ))}
      </div>

      <div className={styles.offerBar}>
        <div className={styles.offerContainer}>
          Flat 300 off on 1999. Code: CBNK300 | Flat 200 off on 1499. Code:
          CBNK200 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;›
        </div>
      </div>
    </header>
  );
};

export default Header;
