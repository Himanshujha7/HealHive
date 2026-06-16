import { useState, useEffect } from "react";

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to Top"
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: 999,
        background: "linear-gradient(135deg, #10b981, #059669, #0d9488)",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "52px",
        height: "52px",
        fontSize: "22px",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.5)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.1)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.7)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.5)";
      }}
    >
      ↑
    </button>
  );
}

export default BackToTop;
