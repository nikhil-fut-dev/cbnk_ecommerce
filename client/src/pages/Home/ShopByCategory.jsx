import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { getCategories } from "../../api/categoryApi";
import styles from "./ShopByCategory.module.css";

const ShopByCategory = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCategories({
          active: true,
          limit: 20,
        });

        setCategories(response?.categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);

        setError("Unable to load categories.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const scroll = (direction) => {
    const container = document.getElementById("cbnk-category-scroll");

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -350 : 350,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.headingRow}>
          <div>
            <span className={styles.eyebrow}>EXPLORE CBNK</span>

            <h2 className={styles.title}>Shop by Category</h2>

            <p className={styles.subtitle}>
              Discover styles curated for every mood, moment and wardrobe.
            </p>
          </div>

          <div className={styles.controls}>
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous categories"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next categories"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {loading && (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeleton} />
            ))}
          </div>
        )}

        {!loading && error && <div className={styles.error}>{error}</div>}

        {!loading && !error && categories.length > 0 && (
          <div id="cbnk-category-scroll" className={styles.categoryScroller}>
            {categories.map((category) => (
              <button
                type="button"
                key={category._id}
                className={styles.categoryCard}
                onClick={() => onCategoryClick?.(category)}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                  />

                  <div className={styles.overlay} />

                  <div className={styles.arrow}>
                    <ArrowRight size={18} />
                  </div>
                </div>

                <div className={styles.categoryInfo}>
                  <h3>{category.name}</h3>

                  {category.description && <p>{category.description}</p>}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className={styles.empty}>No categories available.</div>
        )}
      </div>
    </section>
  );
};

export default ShopByCategory;
