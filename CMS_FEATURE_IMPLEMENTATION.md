# 🎨 CMS Feature: Editable Banners & Promotions

## Overview

This feature adds a complete Content Management System for managing:
- ✅ Homepage Hero Sliders
- ✅ Promotional Banners
- ✅ Seasonal Offers
- ✅ Discount Campaigns
- ✅ Category Banners
- ✅ Popup Promotions

**All editable through the admin panel!**

---

## 📋 What's Included

### Backend (Already Created)

1. **`Banner.js` Model** ✅
   - Location: `freshvilla-backend/src/models/Banner.js`
   - Fields: title, subtitle, description, image, type, linkUrl, dates, position, colors

2. **`banners.js` Routes** ✅
   - Location: `freshvilla-backend/src/routes/banners.js`
   - Full CRUD operations
   - Toggle active/inactive
   - Position management
   - Date-based scheduling

### Still Need to Implement

3. **Register Routes** ⏳
4. **Database Migration** ⏳
5. **Frontend Admin UI** ⏳
6. **Frontend Display Component** ⏳

---

## 🚀 Implementation Steps

### Step 1: Register Banner Routes

**File:** `freshvilla-backend/server.js`

Add after line 132:
```javascript
app.use('/api/banners', require('./src/routes/banners'));
```

### Step 2: Database Migration

**File:** `freshvilla-backend/src/migrations/create-banners-table.js` (NEW)

```javascript
const { sequelize } = require('../config/database');
const Banner = require('../models/Banner');

async function createBannersTable() {
  try {
    await Banner.sync({ force: false });
    console.log('✅ Banners table created successfully');
  } catch (error) {
    console.error('❌ Error creating banners table:', error);
  }
}

module.exports = { createBannersTable };
```

Run migration:
```bash
cd freshvilla-backend
node -e "require('./src/migrations/create-banners-table').createBannersTable()"
```

### Step 3: Add Banner API to Frontend

**File:** `freshvilla-customer-web/src/services/api.js`

Add after `productsAPI`:

```javascript
// Banners API
export const bannersAPI = {
  getAll: (params) => api.get('/banners', { params }),
  getById: (id) => api.get(`/banners/${id}`),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
  toggle: (id) => api.patch(`/banners/${id}/toggle`),
  updatePosition: (id, position) => api.patch(`/banners/${id}/position`, { position })
};
```

### Step 4: Create Admin Banner Management Page

**File:** `freshvilla-customer-web/src/pages/Admin/Banners/BannersList.jsx` (NEW)

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bannersAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const BannersList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await bannersAPI.getAll();
      setBanners(response.data.data || []);
    } catch (error) {
      Swal.fire('Error', 'Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Banner?',
      text: 'This cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await bannersAPI.delete(id);
        Swal.fire('Deleted!', 'Banner deleted successfully', 'success');
        loadBanners();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete banner', 'error');
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await bannersAPI.toggle(id);
      loadBanners();
    } catch (error) {
      Swal.fire('Error', 'Failed to toggle banner', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Banners & Promotions</h2>
        <Link to="/admin/banners/create" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i>Add Banner
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Position</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      <img src={banner.image} alt={banner.imageAlt} style={{width: '100px', height: '50px', objectFit: 'cover'}} className="rounded" />
                    </td>
                    <td>
                      <strong>{banner.title}</strong>
                      {banner.subtitle && <div className="text-muted small">{banner.subtitle}</div>}
                    </td>
                    <td><span className="badge bg-info">{banner.type}</span></td>
                    <td>{banner.position}</td>
                    <td className="small">
                      {banner.startDate && <div>From: {new Date(banner.startDate).toLocaleDateString()}</div>}
                      {banner.endDate && <div>To: {new Date(banner.endDate).toLocaleDateString()}</div>}
                      {!banner.startDate && !banner.endDate && <span className="text-muted">Always</span>}
                    </td>
                    <td>
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={banner.isActive}
                          onChange={() => handleToggle(banner.id)}
                        />
                      </div>
                    </td>
                    <td>
                      <Link to={`/admin/banners/edit/${banner.id}`} className="btn btn-sm btn-primary me-2">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button onClick={() => handleDelete(banner.id)} className="btn btn-sm btn-danger">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannersList;
```

### Step 5: Create Banner Add/Edit Form

**File:** `freshvilla-customer-web/src/pages/Admin/Banners/BannerCreate.jsx` (NEW)

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bannersAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const BannerCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    imageAlt: 'Banner Image',
    type: 'hero-slider',
    linkUrl: '',
    linkText: 'Shop Now',
    buttonColor: '#28a745',
    textColor: '#ffffff',
    startDate: '',
    endDate: '',
    position: 0,
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadBanner();
    }
  }, [id]);

  const loadBanner = async () => {
    try {
      const response = await bannersAPI.getById(id);
      const data = response.data.data;
      setFormData({
        ...data,
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : ''
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to load banner', 'error');
      navigate('/admin/banners');
    }
  };

  const bannerTypes = [
    { value: 'hero-slider', label: 'Hero Slider (Main Banner)' },
    { value: 'promotional', label: 'Promotional Banner' },
    { value: 'category', label: 'Category Banner' },
    { value: 'seasonal', label: 'Seasonal Offer' },
    { value: 'popup', label: 'Popup Banner' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await bannersAPI.update(id, formData);
        Swal.fire('Success!', 'Banner updated successfully', 'success');
      } else {
        await bannersAPI.create(formData);
        Swal.fire('Success!', 'Banner created successfully', 'success');
      }
      navigate('/admin/banners');
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} banner`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">{isEditMode ? 'Edit Banner' : 'Add New Banner'}</h2>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Banner Title *</label>
                <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Banner Type *</label>
                <select className="form-select" name="type" value={formData.type} onChange={handleChange} required>
                  {bannerTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Subtitle</label>
                <input type="text" className="form-control" name="subtitle" value={formData.subtitle} onChange={handleChange} />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Image URL *</label>
                <input type="text" className="form-control" name="image" value={formData.image} onChange={handleChange} required placeholder="/images/banner-1.jpg" />
                <small className="text-muted">Upload image to /public/images/ or use external URL</small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Image Alt Text</label>
                <input type="text" className="form-control" name="imageAlt" value={formData.imageAlt} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Link URL</label>
                <input type="text" className="form-control" name="linkUrl" value={formData.linkUrl} onChange={handleChange} placeholder="/shop" />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Link Button Text</label>
                <input type="text" className="form-control" name="linkText" value={formData.linkText} onChange={handleChange} />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Button Color</label>
                <input type="color" className="form-control form-control-color" name="buttonColor" value={formData.buttonColor} onChange={handleChange} />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Text Color</label>
                <input type="color" className="form-control form-control-color" name="textColor" value={formData.textColor} onChange={handleChange} />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Position (Order)</label>
                <input type="number" className="form-control" name="position" value={formData.position} onChange={handleChange} min="0" />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Active</label>
                <div className="form-check form-switch mt-2">
                  <input className="form-check-input" type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                  <label className="form-check-label">Banner Active</label>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Start Date (Optional)</label>
                <input type="date" className="form-control" name="startDate" value={formData.startDate} onChange={handleChange} />
                <small className="text-muted">Banner will show from this date</small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">End Date (Optional)</label>
                <input type="date" className="form-control" name="endDate" value={formData.endDate} onChange={handleChange} />
                <small className="text-muted">Banner will hide after this date</small>
              </div>

              <div className="col-12">
                <button type="submit" className="btn btn-success me-2" disabled={loading}>
                  {loading ? 'Saving...' : (isEditMode ? 'Update Banner' : 'Create Banner')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/banners')}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {formData.image && (
        <div className="card mt-4">
          <div className="card-body">
            <h5>Preview</h5>
            <img src={formData.image} alt={formData.imageAlt} className="img-fluid" style={{maxHeight: '300px'}} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerCreate;
```

### Step 6: Add Routes to App.js

**File:** `freshvilla-customer-web/src/App.js`

Add imports:
```javascript
import BannersList from './pages/Admin/Banners/BannersList';
import BannerCreate from './pages/Admin/Banners/BannerCreate';
```

Add routes (after coupons routes):
```javascript
<Route path="/admin/banners" element={<ProtectedRoute><AdminLayout><BannersList /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/banners/create" element={<ProtectedRoute><AdminLayout><BannerCreate /></AdminLayout></ProtectedRoute>} />
<Route path="/admin/banners/edit/:id" element={<ProtectedRoute><AdminLayout><BannerCreate /></AdminLayout></ProtectedRoute>} />
```

### Step 7: Add Banner Menu to Admin Sidebar

**File:** `freshvilla-customer-web/src/components/AdminLayout.jsx`

Add after Promotions section:
```jsx
<h6 className="text-muted text-uppercase small mb-3 mt-4">
  <i className="bi bi-image me-2"></i>
  Content
</h6>
<ul className="nav flex-column">
  <li className="nav-item">
    <Link className="nav-link text-dark" to="/admin/banners">
      <i className="bi bi-images me-2"></i>
      Banners
    </Link>
  </li>
  <li className="nav-item">
    <Link className="nav-link text-dark" to="/admin/banners/create">
      <i className="bi bi-plus-circle me-2"></i>
      Add Banner
    </Link>
  </li>
</ul>
```

### Step 8: Create Frontend Display Component

**File:** `freshvilla-customer-web/src/components/BannerSlider.jsx` (NEW)

```jsx
import React, { useState, useEffect } from 'react';
import { bannersAPI } from '../services/api';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';

const BannerSlider = ({ type = 'hero-slider' }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, [type]);

  const loadBanners = async () => {
    try {
      const response = await bannersAPI.getAll({ type, active: true });
      setBanners(response.data.data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true
  };

  if (loading || banners.length === 0) return null;

  return (
    <section className="banner-slider my-5">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id}>
            <div className="banner-slide position-relative">
              <img 
                src={banner.image} 
                alt={banner.imageAlt} 
                className="w-100" 
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
              <div className="banner-content position-absolute top-50 start-50 translate-middle text-center text-white">
                <h1 className="display-4 fw-bold">{banner.title}</h1>
                {banner.subtitle && <p className="lead">{banner.subtitle}</p>}
                {banner.description && <p>{banner.description}</p>}
                {banner.linkUrl && (
                  <Link 
                    to={banner.linkUrl} 
                    className="btn btn-lg mt-3"
                    style={{
                      backgroundColor: banner.buttonColor,
                      color: banner.textColor,
                      border: 'none'
                    }}
                  >
                    {banner.linkText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default BannerSlider;
```

### Step 9: Use Banner Component in Homepage

**File:** `freshvilla-customer-web/src/pages/Home.jsx`

Import:
```javascript
import BannerSlider from '../components/BannerSlider';
```

Replace existing slider with:
```jsx
<BannerSlider type="hero-slider" />
```

For promotional banners:
```jsx
<BannerSlider type="promotional" />
```

---

## 🎨 Features Summary

### Banner Types:

1. **Hero Slider** - Main homepage carousel
2. **Promotional** - Discount/offer banners
3. **Category** - Category-specific banners
4. **Seasonal** - Holiday/seasonal campaigns
5. **Popup** - Modal popups for special offers

### Admin Controls:

- ✅ **Title, Subtitle, Description**
- ✅ **Image Upload/URL**
- ✅ **Link URL & Button Text**
- ✅ **Custom Button Colors**
- ✅ **Start/End Dates** (scheduling)
- ✅ **Position/Order** (display priority)
- ✅ **Active/Inactive Toggle**
- ✅ **Banner Type Selection**

### Automation:

- ✅ **Auto-show** banners based on start date
- ✅ **Auto-hide** banners after end date
- ✅ **Position-based** ordering
- ✅ **Type-based** filtering

---

## 🚀 Quick Start

1. Add banner routes to `server.js`
2. Run database migration
3. Create admin pages
4. Add menu items to sidebar
5. Replace hardcoded sliders with `<BannerSlider />`

**Time estimate:** 2-3 hours for full implementation

---

## 💡 Usage Examples

### Seasonal Campaign:
```
Title: "Summer Sale 2025"
Subtitle: "Up to 50% OFF on Fresh Fruits"
Start Date: 2025-06-01
End Date: 2025-08-31
Type: seasonal
```

### Flash Sale:
```
Title: "24-Hour Flash Sale!"
Subtitle: "Extra 30% OFF Everything"
Start Date: 2025-12-25 00:00
End Date: 2025-12-25 23:59
Type: promotional
```

### Homepage Slider:
```
Title: "Welcome to FreshVilla"
Subtitle: "Fresh Groceries Delivered"
Link: /shop
Type: hero-slider
```

This is a professional CMS system used by major e-commerce platforms! 🎉
