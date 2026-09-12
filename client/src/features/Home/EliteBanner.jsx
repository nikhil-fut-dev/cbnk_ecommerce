import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faCakeCandles,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import logoElite from "../../assets/CBNK-LOGO.png";
import styles from "./EliteBanner.module.css";

const EliteBanner = () => {
  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.left}>
          <h1>Unlock Savings Worth ₹1000+</h1>
          <div className={styles.benefit}>
            <FontAwesomeIcon icon={faTruck} className={styles.icon} />
            <div>
              <h3>Free Delivery</h3>
              <p>On all orders, for 365 days!</p>
            </div>
          </div>
          <div className={styles.benefit}>
            <FontAwesomeIcon icon={faCakeCandles} className={styles.icon} />
            <div>
              <h3>Birthday Vouchers</h3>
              <p>For you & your loved one!</p>
            </div>
          </div>
          <div className={styles.benefit}>
            <FontAwesomeIcon icon={faStar} className={styles.icon} />
            <div>
              <h3>Pre-sale Benefits</h3>
              <p>Exclusive early access & more</p>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.card}>
            <p className={styles.eliteLogo}>
              <img src={logoElite} alt="Elite Logo" />
            </p>
            <h2>elite</h2>
            <span className={styles.sub}>NEW LOOK. NEW REWARDS.</span>
            <div className={styles.elitePrice}>
              <p className={styles.mrp}>₹499</p>
              <p className={styles.now}>₹249</p>
              <span>Inclusive of all taxes</span>
            </div>
            <div className={styles.valid}>Valid for 12 Months</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EliteBanner;
