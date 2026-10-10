import { useEffect, useState } from "react";
import { getHomeData } from "../../services/homeApi";

import PromotionalTicker from "../../components/home/PromotionalTicker";
import HeroBanner from "../../components/home/HeroBanner";
import CharacterMode from "../../components/home/CharacterMode";
import EliteMembership from "../../components/home/EliteMembership";
import KidsSets from "../../components/home/KidsSets";
import SleepwearEdit from "../../components/home/SleepwearEdit";
import PoloShop from "../../components/home/PoloShop";

const Home = () => {
  // Promotional Ticker data
  const [promotionalTicker, setPromotionalTicker] = useState([]);

  // Hero Banner data
  const [heroBanners, setHeroBanners] = useState([]);

  // Character Mode data
  const [characterModes, setCharacterModes] = useState([]);

  // CBNK Elite Membership data
  const [eliteMembership, setEliteMembership] = useState(null);

  // Kids Sets data from backend
  const [kidsSets, setKidsSets] = useState([]);

  // Sleepwear Edit data from backend
  const [sleepwearEdits, setSleepwearEdits] = useState([]);

  // Polo Shop data from backend
  const [poloShops, setPoloShops] = useState([]);

  // Fetch Home page data from backend
  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        const response = await getHomeData();

        // Extract home data from API response
        const home = response?.home ?? response?.data?.home;

        if (!isMounted) return;

        // Set Promotional Ticker data
        setPromotionalTicker(
          Array.isArray(home?.promotionalTicker) ? home.promotionalTicker : [],
        );

        // Set Hero Banner data
        setHeroBanners(
          Array.isArray(home?.heroBanners) ? home.heroBanners : [],
        );

        // Set Character Mode data from backend
        setCharacterModes(
          Array.isArray(home?.characterModes) ? home.characterModes : [],
        );

        // Set CBNK Elite Membership data from backend
        setEliteMembership(
          home?.elite && typeof home.elite === "object" ? home.elite : null,
        );

        // Set Kids Sets data from backend
        setKidsSets(Array.isArray(home?.kidsSets) ? home.kidsSets : []);

        // Set Sleepwear Edit data from backend
        setSleepwearEdits(
          Array.isArray(home?.sleepwearEdits) ? home.sleepwearEdits : [],
        );

        // Set Polo Shop data from backend
        setPoloShops(Array.isArray(home?.poloShops) ? home.poloShops : []);
      } catch (error) {
        console.error("Home page data fetch failed:", error);
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="w-full bg-white">
      {/* =====================================================
          PROMOTIONAL TICKER
      ====================================================== */}

      <PromotionalTicker items={promotionalTicker} />

      {/* =====================================================
          HERO BANNER
      ====================================================== */}

      <HeroBanner banners={heroBanners} />

      {/* =====================================================
          CHARACTER MODE
      ====================================================== */}

      <CharacterMode characters={characterModes} />

      {/* =====================================================
          CBNK ELITE MEMBERSHIP
      ====================================================== */}

      <EliteMembership membership={eliteMembership} />

      {/* =====================================================
          NEW IN - KIDS SETS
      ====================================================== */}

      <KidsSets items={kidsSets} />

      {/* =====================================================
          SLEEPWEAR EDIT
      ====================================================== */}

      <SleepwearEdit items={sleepwearEdits} />

      {/* =====================================================
          THE POLO SHOP
      ====================================================== */}

      <PoloShop items={poloShops} />
    </main>
  );
};

export default Home;
