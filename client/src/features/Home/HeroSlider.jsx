import React, { useState, useEffect, useRef } from "react";
// Import the FontAwesome component and explicit chevron icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./HeroSlider.module.css";

// Asset references
import slide1 from "../../assets/exclusive-new-style.jpg";
import slide2 from "../../assets/chhaya-slider.png";
import slide3 from "../../assets/new-collection.jpg";
import slide4 from "../../assets/women-wears.webp";
import slide5 from "../../assets/kids-wears.jpg";

const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const [transitionStyle, setTransitionStyle] = useState("0.6s ease");
  const timeoutRef = useRef(null);

  const initialSlides = [
    {
      img: slide1,
      badge: "NEW STYLES",
      price: "Starting at ₹399",
      title: "FANDOM MERCH",
    },
    {
      img: slide2,
      badge: "YOUR WORLD",
      price: "Starting at ₹399",
      title: "YOUR STYLE",
    },
    {
      img: slide3,
      badge: "LIMITED OFFER",
      price: "Starting at ₹499",
      title: "NEW COLLECTION",
    },
    {
      img: slide4,
      badge: "TRENDING",
      price: "Starting at ₹599",
      title: "NEW ARRIVALS",
    },
    {
      img: slide5,
      badge: "KIDS WEAR",
      price: "Starting at ₹699",
      title: "FASHION SALE",
    },
  ];

  const total = initialSlides.length;
  const slidesList = [...initialSlides, initialSlides[0]];

  const nextSlide = () => {
    setTransitionStyle("0.6s ease");
    setIndex((prevIndex) => prevIndex + 1);
  };

  const prevSlide = () => {
    if (index === 0) {
      setTransitionStyle("none");
      setIndex(total);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setTransitionStyle("0.6s ease");
        setIndex(total - 1);
      }, 10);
    } else {
      setTransitionStyle("0.6s ease");
      setIndex((prevIndex) => prevIndex - 1);
    }
  };

  useEffect(() => {
    if (index === total) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setTransitionStyle("none");
        setIndex(0);
      }, 600);
    }
  }, [index, total]);

  useEffect(() => {
    const autoInterval = setInterval(nextSlide, 4000);
    return () => {
      clearInterval(autoInterval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const activeDotIndex = index < total ? index : 0;

  return (
    <div className={styles["Cbn-slider"]}>
      <div
        className={styles["Cbn-slides"]}
        style={{
          transition: transitionStyle,
          transform: `translateX(-${index * 100}%)`,
        }}
      >
        {slidesList.map((slide, i) => (
          <div className={styles["Cbn-slide"]} key={i}>
            <img src={slide.img} alt={slide.title} />
            <div className={styles["Cbn-content"]}>
              <div className={styles["Cbn-badge"]}>{slide.badge}</div>
              <div className={styles["Cbn-price"]}>{slide.price}</div>
              <h1>{slide.title}</h1>
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.arrow} ${styles.left}`} onClick={prevSlide}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </div>
      <div className={`${styles.arrow} ${styles.right}`} onClick={nextSlide}>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>

      <div className={styles.dots}>
        {initialSlides.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${activeDotIndex === i ? styles.active : ""}`}
            onClick={() => {
              setTransitionStyle("0.6s ease");
              setIndex(i);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
