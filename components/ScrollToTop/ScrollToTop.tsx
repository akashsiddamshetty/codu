"use client";

import { useEffect, useState } from "react";

const ScrollToTop = () => {
  const [visibleButton, setVisibleButton] = useState(false);

  const handleScroll = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleDisplayButton = () => {
      if (window.scrollY >= 200) return setVisibleButton(true);

      return setVisibleButton(false);
    };

    window.addEventListener("scroll", handleDisplayButton);

    return () => window.removeEventListener("scroll", handleDisplayButton);
  }, []);

  return (
    <button
      className={
        visibleButton
          ? "fixed bottom-10 right-10 border-2 rounded-full p-4 text-white  bg-gradient-to-r from-orange-400 to-pink-600"
          : "hidden"
      }
      onClick={() => handleScroll()}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8 "
        transform="rotate(-180)"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"
        />
      </svg>
    </button>
  );
};

export default ScrollToTop;
