import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareGithub,
  faInstagram,
  faSquareTwitter,
} from "@fortawesome/free-brands-svg-icons";
import styles from "./Footer.module.css";

const Footer = () => {
  const [activeAccordion, setActiveAccordion] = useState({
    family: false,
    services: false,
    help: false,
    about: false,
  });

  const toggleSection = (section) => {
    setActiveAccordion((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.col}>
          <h3>Join CBNK Family</h3>
          <p>
            Enjoy member-only discounts & offers, early access to sale and much
            more.
          </p>
          <button className={styles.btn}>Join the club</button>
          <h3 className={styles.mt}>CBNK Business Network</h3>
          <p>
            Join the membership program for business customers with exciting
            benefits.
          </p>
          <button className={styles.btn}>Join now</button>
        </div>

        <div
          className={`${styles.col} ${styles.mobileAccordion} ${activeAccordion.family ? styles.active : ""}`}
        >
          <h4 onClick={() => toggleSection("family")}>CBNK Family</h4>
          <ul>
            <li>Log in</li>
            <li>Join CBNK Family</li>
            <li>Member offers</li>
            <li>Workshops & Events</li>
          </ul>
        </div>

        <div
          className={`${styles.col} ${styles.mobileAccordion} ${activeAccordion.services ? styles.active : ""}`}
        >
          <h4 onClick={() => toggleSection("services")}>Services</h4>
          <ul>
            <li>Delivery Service</li>
            <li>Click & Collect</li>
            <li>Personal Shopper</li>
            <li>Online Planning</li>
            <li>Assembly Service</li>
          </ul>
        </div>

        <div
          className={`${styles.col} ${styles.mobileAccordion} ${activeAccordion.help ? styles.active : ""}`}
        >
          <h4 onClick={() => toggleSection("help")}>Help</h4>
          <ul>
            <li>How to shop</li>
            <li>Return policy</li>
            <li>Contact us</li>
            <li>FAQ's</li>
          </ul>
        </div>

        <div
          className={`${styles.col} ${styles.mobileAccordion} ${activeAccordion.about ? styles.active : ""}`}
        >
          <h4 onClick={() => toggleSection("about")}>About CBNK</h4>
          <ul>
            <li>This is CBNK</li>
            <li>Careers at CBNK</li>
            <li>Sustainability</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© Inter CBNK Systems B.V. 2026</p>
        <div className={styles.socialIcons}>
          <a href="https://github.com/nikhil-fut-dev">
            <FontAwesomeIcon icon={faSquareGithub} />
          </a>
          <a href="#">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="#">
            <FontAwesomeIcon icon={faSquareTwitter} />
          </a>
        </div>
        <div className={styles.links}>
          <a href="#">Privacy policy</a>
          <a href="#">Cookie policy</a>
          <a href="#">Cookie setting</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
