import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useApp } from "../../context/AppContext";
import styles from "./WhatsappPopup.module.css";

const WhatsappPopup = () => {
  const { isPopupOpen, togglePopup } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `Hello, I want to visit your CBNK - Store.%0AName: ${formData.name}%0APhone: ${formData.phone}%0AAddress: ${formData.address}%0AEmail: ${formData.email}%0AMessage: ${formData.message}`;
    const whatsappNumber = "919839507418";
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <>
      <button className={styles.floatingBtn} onClick={togglePopup}>
        <FontAwesomeIcon icon={faWhatsapp} />
      </button>

      <div className={`${styles.popup} ${isPopupOpen ? styles.active : ""}`}>
        <span className={styles.closeBtn} onClick={togglePopup}>
          <FontAwesomeIcon icon={faXmark} />
        </span>
        <h3>Contact Us</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="name"
            placeholder="Your Name"
            required
            onChange={handleChange}
          />
          <input
            type="tel"
            id="phone"
            placeholder="Your Phone"
            required
            onChange={handleChange}
          />
          <input
            type="text"
            id="address"
            placeholder="Your Address"
            required
            onChange={handleChange}
          />
          <input
            type="email"
            id="email"
            placeholder="abc@gmail.com"
            required
            onChange={handleChange}
          />
          <textarea
            id="message"
            placeholder="Your Message"
            required
            onChange={handleChange}
          ></textarea>
          <button className={styles.submitBtn} type="submit">
            Send Message
          </button>
        </form>
      </div>
    </>
  );
};

export default WhatsappPopup;
