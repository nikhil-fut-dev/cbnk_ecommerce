import React from "react";
import { useApp } from "../../context/AppContext";
import styles from "./CardRow.module.css";

const CardRow = ({ title, items, isKids }) => {
  const { addToCart } = useApp();

  return (
    <div className={isKids ? styles.kidsContainer : styles.container}>
      <div className={isKids ? styles.kidsTitle : styles.title}>{title}</div>
      <div className={isKids ? styles.kidsCardRow : styles.cardRow}>
        {items.map((item, index) => (
          <div
            key={index}
            className={isKids ? styles.kidsCard : styles.card}
            onClick={() => addToCart(item.label, item.price || 399)}
          >
            <img src={item.img} alt={item.label} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardRow;
