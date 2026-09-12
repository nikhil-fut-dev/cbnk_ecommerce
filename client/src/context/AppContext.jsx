import React, { createContext, useState, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsCartOpen(false);
  };

  const addToCart = (name, price) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.name === name);
      if (existing) {
        return prevCart.map((item) =>
          item.name === name ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prevCart, { name, price, qty: 1 }];
    });
  };

  const changeQty = (name, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.name === name ? { ...item, qty: item.qty + delta } : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <AppContext.Provider
      value={{
        isMenuOpen,
        isCartOpen,
        isPopupOpen,
        cart,
        totalItems,
        totalPrice,
        toggleMenu,
        toggleCart,
        togglePopup,
        closeAll,
        addToCart,
        changeQty,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
