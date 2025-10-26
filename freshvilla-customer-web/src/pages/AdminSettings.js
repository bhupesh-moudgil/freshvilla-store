import React, { useState } from 'react';

function AdminSettings() {
  const [logo, setLogo] = useState(localStorage.getItem('storeLogo') || '/images/logo/freshvilla-logo.svg');
  const [storeName, setStoreName] = useState(localStorage.getItem('storeName') || 'FreshVilla');

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('File size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        localStorage.setItem('storeLogo', base64String);
        setLogo(base64String);
        
        // Trigger custom event to update logo across app
        window.dispatchEvent(new CustomEvent('logoChanged', { detail: base64String }));
        
        alert('✅ Logo updated successfully! Navigate to other pages to see the change.');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefault = () => {
    localStorage.removeItem('storeLogo');
    setLogo('/images/logo/freshvilla-logo.svg');
    window.dispatchEvent(new CustomEvent('logoChanged', { detail: '/images/logo/freshvilla-logo.svg' }));
    alert('✅ Logo reset to default');
  };

  const handleStoreNameChange = (e) => {
    const newName = e.target.value;
    setStoreName(newName);
    localStorage.setItem('storeName', newName);
    window.dispatchEvent(new CustomEvent('storeNameChanged', { detail: newName }));
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-8 offset-lg-2">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0"><i className="bi bi-gear-fill me-2"></i>Store Settings</h3>
            </div>
            <div className="card-body p-4">
              
              {/* Store Name Section */}
              <div className="mb-5">
                <h5 className="text-success mb-3">
                  <i className="bi bi-shop me-2"></i>Store Name
                </h5>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={storeName}
                  onChange={handleStoreNameChange}
                  placeholder="Enter store name"
                />
              </div>

              <hr />

              {/* Logo Preview */}
              <div className="mb-4">
                <h5 className="text-success mb-3">
                  <i className="bi bi-image me-2"></i>Current Logo
                </h5>
                <div className="border rounded p-4 bg-light text-center">
                  <img 
                    src={logo} 
                    alt="Store Logo" 
                    style={{ maxHeight: '120px', maxWidth: '250px', objectFit: 'contain' }}
                  />
                </div>
              </div>

              {/* Upload New Logo */}
              <div className="mb-4">
                <h5 className="text-success mb-3">
                  <i className="bi bi-upload me-2"></i>Upload New Logo
                </h5>
                <input
                  type="file"
                  className="form-control form-control-lg"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoUpload}
                />
                <small className="text-muted d-block mt-2">
                  <i className="bi bi-info-circle me-1"></i>
                  Supported formats: PNG, JPG, SVG (Max 2MB) • Recommended: Transparent background
                </small>
              </div>

              {/* Actions */}
              <div className="d-flex gap-3 mb-4">
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={resetToDefault}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Reset to Default
                </button>
              </div>

              {/* Instructions */}
              <div className="alert alert-info border-0 shadow-sm">
                <h6 className="alert-heading">
                  <i className="bi bi-lightbulb-fill me-2"></i>How It Works
                </h6>
                <ul className="mb-0 ps-3">
                  <li>Logo changes are <strong>reflected immediately</strong> across all pages</li>
                  <li>Settings are saved in your browser (localStorage)</li>
                  <li>For production, logos will be stored in <strong>AWS S3</strong> with CDN</li>
                  <li>Clear browser cache to reset to defaults</li>
                </ul>
              </div>

              {/* Demo Tips */}
              <div className="alert alert-success border-0 shadow-sm mt-3">
                <h6 className="alert-heading">
                  <i className="bi bi-check-circle-fill me-2"></i>Testing Tips
                </h6>
                <ol className="mb-0 ps-3">
                  <li>Upload a logo (PNG/JPG/SVG)</li>
                  <li>Navigate to <a href="/" className="alert-link">Home</a> or <a href="/shop-grid" className="alert-link">Shop</a> page</li>
                  <li>See your new logo in the header!</li>
                  <li>Refresh the page - logo persists ✨</li>
                </ol>
              </div>

            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-4 text-center">
            <a href="/" className="btn btn-link text-success">
              <i className="bi bi-house-fill me-2"></i>Go to Home
            </a>
            <a href="/shop-grid" className="btn btn-link text-success">
              <i className="bi bi-grid-fill me-2"></i>View Shop
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
