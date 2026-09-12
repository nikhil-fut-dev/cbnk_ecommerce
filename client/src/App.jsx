import React from "react";
import { AppProvider } from "./context/AppContext";

import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import CartDrawer from "./components/UI/CartDrawer";
import WhatsappPopup from "./components/UI/WhatsappPopup";
import CardRow from "./components/UI/CardRow";

import HeroSlider from "./features/Home/HeroSlider";
import EliteBanner from "./features/Home/EliteBanner";
import PromoBanner from "./features/Home/PromoBanner";

// Mocking static images definitions from layout placeholders
import char1 from "./assets/shop-man-nikhil.jpg";
import char2 from "./assets/shop-women3.jpg";
import char3 from "./assets/shop-boy.webp";
import char4 from "./assets/shop-girls.jpg";
import char5 from "./assets/shop-add-ons.webp";

import kid1 from "./assets/boys 0-2.webp";
import kid2 from "./assets/boys 2-8.jpg";
import kid3 from "./assets/boys 8-16.jpg";
import kid4 from "./assets/girls 0-8-IInd.jpg";
import kid5 from "./assets/girls 0-2.webp";
import kid6 from "./assets/girls 8-16.jpg";

import sleepBg from "./assets/sleepwear.jpg";
import poloBg from "./assets/polo-shop7.jpg";

import summer1 from "./assets/effortless-dresses.webp";
import summer2 from "./assets/easy-shorts.jpg";
import summer3 from "./assets/printed-shirt.webp";
import summer4 from "./assets/vacay-sets2.jpg";
import summer5 from "./assets/add-ons.jpg";

function App() {
  const characterItems = [
    { label: "Shop Men", img: char1, price: 599 },
    { label: "Shop Women", img: char2, price: 699 },
    { label: "Shop Boys", img: char3, price: 499 },
    { label: "Shop Girls", img: char4, price: 499 },
    { label: "Shop Add-Ons", img: char5, price: 299 },
  ];

  const kidsItems = [
    { label: "Boys(0-2 Yrs)", img: kid1 },
    { label: "Boys(2-8 Yrs)", img: kid2 },
    { label: "Boys(8-16 Yrs)", img: kid3 },
    { label: "Girls(2-8 Yrs)", img: kid4 },
    { label: "Girls(0-2 Yrs)", img: kid5 },
    { label: "Girls(8-16 Yrs)", img: kid6 },
  ];

  const summerItems = [
    { label: "EFFORTLESS DRESSES", img: summer1 },
    { label: "EASY SHORTS", img: summer2 },
    { label: "PRINTED SHIRTS", img: summer3 },
    { label: "VACAY SETS", img: summer4 },
    { label: "ADD-ONS", img: summer5 },
  ];

  return (
    <AppProvider>
      <Header />
      <HeroSlider />

      <CardRow
        title="Character Mode: On"
        items={characterItems}
        isKids={false}
      />
      <EliteBanner />
      <CardRow title="New In - Kids Sets" items={kidsItems} isKids={true} />

      <PromoBanner
        title="Sleepwear Edit"
        bgImage={sleepBg}
        subtitle="Comfort just got upgraded"
        heading="600+ Sleepwear Styles"
        pricing="Starting at ₹399"
        altStyle={false}
      />

      <PromoBanner
        title="The Polo Shop"
        bgImage={poloBg}
        subtitle="POLOS FOR"
        heading="EVERY OCCASION"
        pricing="Starting at ₹399"
        altStyle={true}
      />

      <CardRow title="Summer Ready" items={summerItems} isKids={false} />

      <Footer />

      {/* Overlays / Drawer Modals */}
      <CartDrawer />
      <WhatsappPopup />
    </AppProvider>
  );
}

export default App;
