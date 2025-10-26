import React, { useEffect, useState } from 'react'

const ScrollToTop = () => {

    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
  
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };
  
    useEffect(() => {
      window.addEventListener("scroll", toggleVisibility);
      return () => {
        window.removeEventListener("scroll", toggleVisibility);
      };
    }, []);
  
  return null; // Hidden
}

export default ScrollToTop