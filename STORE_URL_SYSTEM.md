# 🏪 FreshVilla Store URL System
## Using City/District Abbreviations

---

## 📖 **Overview**

FreshVilla stores use **abbreviation-based URLs** for SEO while displaying **full names** in the admin center.

**Format:** `{state-code}-{city-code}-{store-number}`

---

## 🎯 **Examples**

### **Delhi Stores**
| Admin Display Name | Store URL | Components |
|-------------------|-----------|------------|
| FreshVilla New Delhi | `dl-ndl-001` | DL (Delhi) + NDL (New Delhi) + 001 |
| FreshVilla Shahdara | `dl-shd-001` | DL (Delhi) + SHD (Shahdara) + 001 |
| FreshVilla South Delhi | `dl-sdl-001` | DL (Delhi) + SDL (South Delhi) + 001 |

### **Maharashtra Stores**
| Admin Display Name | Store URL | Components |
|-------------------|-----------|------------|
| FreshVilla Mumbai City | `mh-mum-001` | MH (Maharashtra) + MUM (Mumbai) + 001 |
| FreshVilla Pune | `mh-pne-001` | MH (Maharashtra) + PNE (Pune) + 001 |
| FreshVilla Thane | `mh-thn-001` | MH (Maharashtra) + THN (Thane) + 001 |

### **Karnataka Stores**
| Admin Display Name | Store URL | Components |
|-------------------|-----------|------------|
| FreshVilla Bengaluru Urban | `ka-blr-001` | KA (Karnataka) + BLR (Bengaluru) + 001 |
| FreshVilla Mysuru | `ka-mys-001` | KA (Karnataka) + MYS (Mysuru) + 001 |
| FreshVilla Mangalore | `ka-dkn-001` | KA (Karnataka) + DKN (Dakshina Kannada) + 001 |

### **Uttar Pradesh Stores**
| Admin Display Name | Store URL | Components |
|-------------------|-----------|------------|
| FreshVilla Lucknow | `up-lko-001` | UP (Uttar Pradesh) + LKO (Lucknow) + 001 |
| FreshVilla Varanasi | `up-vns-001` | UP (Uttar Pradesh) + VNS (Varanasi) + 001 |
| FreshVilla Agra | `up-agr-001` | UP (Uttar Pradesh) + AGR (Agra) + 001 |

---

## 🔧 **API Usage**

### **1. Create Store (Auto-generates URL)**

```javascript
POST /api/stores
Headers: { Authorization: "Bearer <super-admin-token>" }
Body: {
  "name": "FreshVilla New Delhi",  // Optional, auto-generates if not provided
  "city": "New Delhi",
  "state": "Delhi",
  "cityCode": "NDL",
  "stateCode": "DL",
  "address": "123 Main Street",
  "email": "delhi@freshvilla.in",
  "phone": "+91-11-12345678"
}

// Response:
{
  "success": true,
  "data": {
    "store": {
      "id": "uuid-here",
      "name": "FreshVilla New Delhi",
      "storeNumber": "001",  // Auto-generated
      "storeUrl": "dl-ndl-001",  // Auto-generated
      "city": "New Delhi",
      "cityCode": "NDL",
      "state": "Delhi",
      "stateCode": "DL"
    },
    "displayInfo": {
      "displayName": "FreshVilla New Delhi",
      "shortName": "New Delhi 001",
      "url": "dl-ndl-001",
      "location": "New Delhi, Delhi",
      "codes": { "city": "NDL", "state": "DL" }
    }
  }
}
```

---

### **2. Get Store by URL**

```javascript
GET /api/stores/url/dl-ndl-001

// Response:
{
  "success": true,
  "data": {
    "store": { /* full store details */ },
    "displayInfo": {
      "displayName": "FreshVilla New Delhi",
      "shortName": "New Delhi 001",
      "url": "dl-ndl-001",
      "urlFull": "https://freshvilla.in/store/dl-ndl-001",
      "location": "New Delhi, Delhi"
    }
  }
}
```

---

### **3. Get All Stores in a State**

```javascript
GET /api/stores/by-state/DL

// Response:
{
  "success": true,
  "count": 3,
  "stateCode": "DL",
  "data": [
    {
      "id": "uuid-1",
      "displayName": "FreshVilla New Delhi",
      "shortName": "New Delhi 001",
      "url": "dl-ndl-001",
      "city": "New Delhi",
      "state": "Delhi"
    },
    {
      "id": "uuid-2",
      "displayName": "FreshVilla Shahdara",
      "shortName": "Shahdara 001",
      "url": "dl-shd-001",
      "city": "Shahdara",
      "state": "Delhi"
    }
  ]
}
```

---

### **4. Get All Stores in a City**

```javascript
GET /api/stores/by-city/MUM

// Response:
{
  "success": true,
  "count": 2,
  "cityCode": "MUM",
  "data": [
    {
      "displayName": "FreshVilla Mumbai City",
      "shortName": "Mumbai City 001",
      "url": "mh-mum-001"
    },
    {
      "displayName": "FreshVilla Mumbai Central",
      "shortName": "Mumbai City 002",
      "url": "mh-mum-002"
    }
  ]
}
```

---

### **5. Get All Stores (Admin)**

```javascript
GET /api/stores
Headers: { Authorization: "Bearer <admin-token>" }

// Response:
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": "uuid",
      "name": "FreshVilla New Delhi",
      "storeNumber": "001",
      "storeUrl": "dl-ndl-001",
      "city": "New Delhi",
      "cityCode": "NDL",
      "state": "Delhi",
      "stateCode": "DL",
      "displayInfo": {
        "displayName": "FreshVilla New Delhi",
        "shortName": "New Delhi 001",
        "url": "dl-ndl-001",
        "urlFull": "https://freshvilla.in/store/dl-ndl-001",
        "location": "New Delhi, Delhi",
        "codes": "DL-NDL"
      }
    }
  ]
}
```

---

## 🎨 **Frontend Display**

### **Admin Center View**

```jsx
// Store List Component
<table>
  <thead>
    <tr>
      <th>Store Name</th>
      <th>Location</th>
      <th>Store URL</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {stores.map(store => (
      <tr key={store.id}>
        <td>{store.displayInfo.displayName}</td>
        <td>{store.displayInfo.location}</td>
        <td>
          <code>{store.storeUrl}</code>
          <br/>
          <small className="text-muted">
            {store.displayInfo.urlFull}
          </small>
        </td>
        <td>
          <span className={`badge ${store.isActive ? 'bg-success' : 'bg-danger'}`}>
            {store.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Example Output:**
```
Store Name              Location              Store URL                    Status
FreshVilla New Delhi    New Delhi, Delhi      dl-ndl-001                  Active
                                              freshvilla.in/store/dl-ndl-001

FreshVilla Mumbai City  Mumbai City, MH       mh-mum-001                  Active
                                              freshvilla.in/store/mh-mum-001
```

---

### **Store Switcher Dropdown**

```jsx
<select onChange={(e) => switchStore(e.target.value)}>
  <option value="">🇮🇳 Master View (All India)</option>
  <optgroup label="Delhi">
    <option value="uuid-1">FreshVilla New Delhi (dl-ndl-001)</option>
    <option value="uuid-2">FreshVilla Shahdara (dl-shd-001)</option>
  </optgroup>
  <optgroup label="Maharashtra">
    <option value="uuid-3">FreshVilla Mumbai City (mh-mum-001)</option>
    <option value="uuid-4">FreshVilla Pune (mh-pne-001)</option>
  </optgroup>
</select>
```

---

## 📊 **Store Number Auto-Generation**

Store numbers are automatically assigned per city:

```
City: New Delhi (NDL)
- First store:  dl-ndl-001
- Second store: dl-ndl-002
- Third store:  dl-ndl-003

City: Mumbai (MUM)
- First store:  mh-mum-001
- Second store: mh-mum-002
```

Each city has its own counter starting from 001.

---

## 🔍 **Abbreviation Reference**

### **Top Cities**

| City | State | City Code | State Code | Example URL |
|------|-------|-----------|------------|-------------|
| New Delhi | Delhi | NDL | DL | `dl-ndl-001` |
| Mumbai | Maharashtra | MUM | MH | `mh-mum-001` |
| Bengaluru | Karnataka | BLR | KA | `ka-blr-001` |
| Kolkata | West Bengal | KOL | WB | `wb-kol-001` |
| Chennai | Tamil Nadu | CHN | TN | `tn-chn-001` |
| Hyderabad | Telangana | HYD | TS | `ts-hyd-001` |
| Pune | Maharashtra | PNE | MH | `mh-pne-001` |
| Ahmedabad | Gujarat | AMD | GJ | `gj-amd-001` |
| Jaipur | Rajasthan | JPR | RJ | `rj-jpr-001` |
| Lucknow | Uttar Pradesh | LKO | UP | `up-lko-001` |

### **All Abbreviations**

See `indianCities.json` for complete list of 750+ city/district codes.

---

## ✅ **Benefits**

1. **SEO-Friendly URLs:** `freshvilla.in/store/dl-ndl-001` is clean and memorable
2. **Human-Readable:** Admin sees "FreshVilla New Delhi"
3. **Auto-Generated:** No manual URL creation needed
4. **Scalable:** Supports unlimited stores per city
5. **Consistent Format:** All URLs follow same pattern
6. **No Conflicts:** City code + number ensures uniqueness

---

## 🚀 **Implementation Flow**

### **Creating a New Store**

```
1. Admin selects city from dropdown
   → City: "New Delhi"
   → City Code: "NDL"
   → State: "Delhi"
   → State Code: "DL"

2. Backend auto-generates:
   → Store Number: "001" (or next available)
   → Store URL: "dl-ndl-001"
   → Display Name: "FreshVilla New Delhi"

3. Store is created with:
   - name: "FreshVilla New Delhi" (shown in admin)
   - storeUrl: "dl-ndl-001" (used in URLs)
   - storeNumber: "001"
   - cityCode: "NDL"
   - stateCode: "DL"
```

---

## 🛠️ **Utilities Provided**

```javascript
const {
  generateStoreUrl,      // Generate URL from codes
  generateStoreNumber,   // Get next available number
  generateStoreData,     // Complete store data generation
  parseStoreUrl,         // Extract components from URL
  isValidStoreUrl,       // Validate URL format
  getStoreDisplayInfo    // Get display information
} = require('./utils/storeUrlGenerator');

// Example:
const url = generateStoreUrl('DL', 'NDL', '001');
// Returns: "dl-ndl-001"

const info = await getStoreDisplayInfo('dl-ndl-001');
// Returns: { displayName, shortName, url, location, codes }
```

---

## 📝 **Database Schema**

```sql
stores table:
├── name: "FreshVilla New Delhi"      -- Full display name
├── storeNumber: "001"                 -- Auto-generated
├── storeUrl: "dl-ndl-001"             -- Auto-generated URL
├── city: "New Delhi"                  -- Full city name
├── cityCode: "NDL"                    -- City abbreviation
├── state: "Delhi"                     -- Full state name
└── stateCode: "DL"                    -- State abbreviation
```

---

## 🎯 **Summary**

- **URLs use abbreviations:** `dl-ndl-001` (Delhi-New Delhi-001)
- **Admin shows full names:** "FreshVilla New Delhi"
- **Auto-generated:** No manual intervention needed
- **SEO-optimized:** Clean, short, memorable URLs
- **Scalable:** Supports all 750+ Indian cities

---

**Built for FreshVilla Multi-Store System**  
**Version:** 2.0.0
