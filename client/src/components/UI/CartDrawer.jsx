import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../context/AppContext";
import styles from "./CartDrawer.module.css";

const CartDrawer = () => {
  const { isCartOpen, toggleCart, cart, changeQty, totalPrice } = useApp();

  return (
    <div className={`${styles.drawer} ${isCartOpen ? styles.active : ""}`}>
      <span className={styles.closeBtn} onClick={toggleCart}>
        <FontAwesomeIcon icon={faXmark} />
      </span>
      <h2>Your Cart</h2>
      <div className={styles.itemsContainer}>
        {cart.map((item, index) => (
          <div key={index} className={styles.item}>
            <div>
              <strong>{item.name}</strong>
              <br />₹{item.price}
            </div>
            <div className={styles.qtyControls}>
              <button
                className={styles.qtyBtn}
                onClick={() => changeQty(item.name, -1)}
              >
                -
              </button>
              <span>{item.qty}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => changeQty(item.name, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <h3>Total: ₹{totalPrice}</h3>
    </div>
  );
};

export default CartDrawer;
