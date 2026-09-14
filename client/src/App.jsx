import React from "react";
import { AppProvider } from "./context/AppContext";

import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import CartDrawer from "./components/UI/CartDrawer";
import WhatsappPopup from "./components/UI/WhatsappPopup";

import HeroSlider from "./features/Home/HeroSlider";
import EliteBanner from "./features/Home/EliteBanner";
import PromoBanner from "./features/Home/PromoBanner";

import ShopByCategory from "./pages/Home/ShopByCategory";
import ProductSection from "./pages/Home/ProductSection";

import sleepBg from "./assets/sleepwear.jpg";
import poloBg from "./assets/polo-shop7.jpg";

const HomeContent = () => {
  const handleCategoryClick = (category) => {
    if (!category?.slug) return;

    window.location.href = `/products?category=${category.slug}`;
  };

  const handleProductClick = (product) => {
    if (!product?.slug) return;

    window.location.href = `/product/${product.slug}`;
  };

  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <HeroSlider />

        {/* Categories */}
        <ShopByCategory onCategoryClick={handleCategoryClick} />

        {/* New Arrivals */}
        <ProductSection
          title="New Arrivals"
          subtitle="Fresh styles, new silhouettes and the latest CBNK drops."
          filters={{
            newArrivals: true,
            sort: "-createdAt",
          }}
          onProductClick={handleProductClick}
        />

        {/* Elite */}
        <EliteBanner />

        {/* Best Sellers */}
        <ProductSection
          title="Best Sellers"
          subtitle="The styles our customers keep coming back for."
          filters={{
            bestSeller: true,
            sort: "-rating",
          }}
          onProductClick={handleProductClick}
        />

        {/* Sleepwear */}
        <PromoBanner
          title="Sleepwear Edit"
          bgImage={sleepBg}
          subtitle="Comfort just got upgraded"
          heading="600+ Sleepwear Styles"
          pricing="Starting at ₹399"
          altStyle={false}
        />

        {/* Featured */}
        <ProductSection
          title="Featured Collection"
          subtitle="Explore pieces selected from the CBNK collection."
          filters={{
            featured: true,
            sort: "-createdAt",
          }}
          onProductClick={handleProductClick}
        />

        {/* Polo */}
        <PromoBanner
          title="The Polo Shop"
          bgImage={poloBg}
          subtitle="POLOS FOR"
          heading="EVERY OCCASION"
          pricing="Starting at ₹399"
          altStyle={true}
        />
      </main>

      <Footer />

      <CartDrawer />

      <WhatsappPopup />
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
};

export default App;
