import React, { useState, useEffect } from 'react';

function DynamicLogo({ className, style, alt = "FreshVilla Logo" }) {
  const [logo, setLogo] = useState(
    localStorage.getItem('storeLogo') || '/images/logo/freshvilla-logo.svg'
  );

  useEffect(() => {
    // Listen for logo changes
    const handleLogoChange = (e) => {
      setLogo(e.detail);
    };

    window.addEventListener('logoChanged', handleLogoChange);
    
    return () => {
      window.removeEventListener('logoChanged', handleLogoChange);
    };
  }, []);

  return (
    <img 
      src={logo} 
      alt={alt} 
      className={className}
      style={style}
    />
  );
}

export default DynamicLogo;
