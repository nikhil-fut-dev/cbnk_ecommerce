import React from "react";
import styles from "./PromoBanner.module.css";

const PromoBanner = ({
  title,
  bgImage,
  subtitle,
  heading,
  pricing,
  altStyle,
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.title}>{title}</div>
      <div className={styles.banner}>
        <img src={bgImage} alt={title} />
        <div className={styles.overlay}></div>
        <div className={altStyle ? styles.altContent : styles.content}>
          <p>{subtitle}</p>
          <h1>{heading}</h1>
          <span>{pricing}</span>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
