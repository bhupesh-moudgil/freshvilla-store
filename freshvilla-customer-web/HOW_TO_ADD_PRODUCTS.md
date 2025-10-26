# How to Add/Edit Products - Agent Guide

## ✅ **Products are now in ONE FILE!**

All products are stored in: **`src/data/products.json`**

## 📝 **How to Add a New Product** (EASY!)

### Step 1: Open the File
- Go to GitHub: https://github.com/bhupesh-moudgil/freshvilla-store
- Navigate to: `src` → `data` → `products.json`
- Click the **pencil icon** (✏️) to edit

### Step 2: Copy-Paste This Template
Add this at the end of the products array (before the last `]`):

```json
{
  "id": 14,
  "name": "Product Name Here",
  "category": "Category Name",
  "price": 99,
  "originalPrice": 120,
  "discount": 18,
  "image": "image-filename.jpg",
  "rating": 4.5,
  "reviews": 100,
  "unit": "1kg",
  "inStock": true,
  "featured": true,
  "badge": "New"
}
```

### Step 3: Fill in the Details

**Required Fields:**
- `id`: **MUST be unique**! Use next number (14, 15, 16...)
- `name`: Product name (e.g., "Tata Salt")
- `category`: Category name
- `price`: Current selling price in ₹
- `inStock`: `true` or `false`

**Optional Fields:**
- `originalPrice`: Original price (for showing discount)
- `discount`: Discount percentage
- `image`: Image filename (put image in `src/images/`)
- `rating`: 0.0 to 5.0
- `reviews`: Number of reviews
- `unit`: "1kg", "500g", "1L", etc.
- `featured`: `true` to show on homepage
- `badge`: "Sale", "New", "Popular", etc.

### Step 4: Save & Commit
- Scroll down
- Click **"Commit changes"**
- Add message: "Add [Product Name]"
- Click **"Commit changes"** again

**Done!** Product will appear on site in 1-2 minutes!

---

## 📊 **Example: Adding "Aashirvaad Atta"**

```json
{
  "id": 14,
  "name": "Aashirvaad Atta",
  "category": "Atta, Rice & Dal",
  "price": 285,
  "originalPrice": 320,
  "discount": 11,
  "image": "category-atta-rice-dal.jpg",
  "rating": 4.7,
  "reviews": 523,
  "unit": "5kg",
  "inStock": true,
  "featured": true,
  "badge": "Popular"
}
```

---

## ✏️ **How to Edit a Product**

### Change Price:
1. Find the product in `products.json`
2. Change `"price": 50` to new price
3. Commit changes

### Mark Out of Stock:
1. Find the product
2. Change `"inStock": true` to `"inStock": false`
3. Commit changes

### Remove Product:
1. Find the product block (from `{` to `}`)
2. Delete the entire block
3. **Important:** Remove the comma `,` before or after if needed
4. Commit changes

---

## 🖼️ **How to Add Product Images**

### Option 1: Use Existing Images
Use one of these filenames (already in `src/images/`):
- `category-baby-care.jpg`
- `category-atta-rice-dal.jpg`
- `category-bakery-biscuits.jpg`
- `category-chicken-meat-fish.jpg`
- `category-cleaning-essentials.jpg`
- `category-dairy-bread-eggs.jpg`
- `category-instant-food.jpg`
- `category-pet-care.jpg`
- `category-snack-munchies.jpg`
- `category-tea-coffee-drinks.jpg`

### Option 2: Add New Image
1. Add image file to `src/images/` folder
2. Use filename in product: `"image": "my-new-product.jpg"`
3. Commit both JSON and image

---

## ⚠️ **Common Mistakes to Avoid**

### ❌ DON'T:
- Forget commas between products
- Use duplicate IDs
- Leave trailing comma after last product
- Use quotes inside quotes without escaping

### ✅ DO:
- Keep IDs unique and sequential
- Add comma after each product except the last one
- Test on site after changes
- Keep JSON properly formatted

---

## 📱 **Quick Reference: Product Structure**

```json
{
  "id": NUMBER (unique!),
  "name": "STRING",
  "category": "STRING",
  "price": NUMBER,
  "originalPrice": NUMBER (optional),
  "discount": NUMBER (optional),
  "image": "filename.jpg",
  "rating": NUMBER (0-5),
  "reviews": NUMBER,
  "unit": "STRING",
  "inStock": true/false,
  "featured": true/false,
  "badge": "STRING" (optional)
}
```

---

## 🎯 **Categories Available**

- Snack & Munchies
- Bakery & Biscuits
- Dairy Products
- Chicken, Meat & Fish
- Cleaning Essentials
- Dairy, Bread & Eggs
- Instant Food
- Pet Care
- Tea, Coffee & Drinks
- Fruits & Vegetables
- Atta, Rice & Dal

---

## 🔧 **Need Help?**

If JSON format is broken:
1. Go to https://jsonlint.com/
2. Paste your JSON
3. Click "Validate JSON"
4. Fix any errors shown

---

## 📈 **Advanced: Bulk Add Products**

To add many products at once:

1. Create a CSV/Excel with:
   - Name, Category, Price, etc.
2. Use online tool to convert CSV → JSON
3. Paste converted JSON into `products.json`
4. Commit changes

**CSV to JSON converters:**
- https://csvjson.com/csv2json
- https://www.convertcsv.com/csv-to-json.htm

---

## ✅ **Checklist Before Committing**

- [ ] ID is unique
- [ ] Price is correct
- [ ] Image filename exists
- [ ] Commas are correct
- [ ] inStock is true/false (not "true")
- [ ] JSON is valid (check jsonlint.com)

---

**That's it!** You can now manage all products without any coding! 🎉
