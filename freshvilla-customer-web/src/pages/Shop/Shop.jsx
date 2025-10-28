import React, { useEffect, useState } from "react";
import { MagnifyingGlass } from 'react-loader-spinner'
import assortment from "../../images/assortment-citrus-fruits.png";
import { Link } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import ScrollToTop from "../ScrollToTop";
import ProductCard from '../../Component/ProductCard';
import { productsAPI } from '../../services/api';

const dropdownData = [
  {
    title: "Dairy, Bread & Eggs",
    items: [
      "Milk",
      "Milk Drinks",
      "Curd & Yogurt",
      "Eggs",
      "Bread",
      "Buns & Bakery",
      "Butter & More",
      "Cheese",
      "Paneer & Tofu",
      "Cream & Whitener",
      "Condensed Milk",
      "Vegan Drinks",
    ],
  },
  {
    title: "Snacks & Munchies",
    items: [
      "Chips & Crisps",
      "Nachos",
      "Popcorn",
      "Bhujia & Mixtures",
      "Namkeen Snacks",
      "Healthy Snacks",
      "Cakes & Rolls",
      "Energy Bars",
      "Papad & Fryums",
      "Rusks & Wafers",
    ],
  },
  {
    title: "Fruits & Vegetables",
    items: [
      "Fresh Vegetables",
      "Herbs & Seasonings",
      "Fresh Fruits",
      "Organic Fruits & Vegetables",
      "Cuts & Sprouts",
      "Exotic Fruits & Veggies",
      "Flower Bouquets, Bunches",
    ],
  },
  {
    title: "Cold Drinks & Juices",
    items: [
      "Soft Drinks",
      "Fruit Juices",
      "Coldpress",
      "Energy Drinks",
      "Water & Ice Cubes",
      "Soda & Mixers",
      "Concentrates & Syrups",
      "Detox & Energy Drinks",
      "Juice Collection",
    ],
  },
];

function Dropdown() {
  const [openDropdowns, setOpenDropdowns] = useState([]);
  const [loaderStatus, setLoaderStatus] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setTimeout(() => {
        setLoaderStatus(false);
      }, 500);
    }
  };

  const toggleDropdown = (index) => {
    if (openDropdowns.includes(index)) {
      setOpenDropdowns(openDropdowns.filter((item) => item !== index));
    } else {
      setOpenDropdowns([...openDropdowns, index]);
    }
  };
   
  return (
    <div>
    {loaderStatus ? (
      <div className="loader-container">
        <MagnifyingGlass
visible={true}
height="100"
width="100"
ariaLabel="magnifying-glass-loading"
wrapperStyle={{}}
wrapperclassName="magnifying-glass-wrapper"
glassColor="#c0efff"
color="#0aad0a"
/>
      </div>
    ) : (
      <>
       <>
            <ScrollToTop/>
            </>
    <div className="container ">
      
      <div className="row">
        {/* Vertical Dropdowns Column */}
        <h5 className="mb-3 mt-8">Categories</h5>
        <div className="col-md-3">
          {dropdownData.map((dropdown, index) => (
            <ul className="nav flex-column" key={index}>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to="#"
                  onClick={() => toggleDropdown(index)}
                  aria-expanded={
                    openDropdowns.includes(index) ? "true" : "false"
                  }
                  aria-controls={`categoryFlush${index + 1}`}
                >
                  {dropdown.title} <i className="fa fa-chevron-down"  />

                </Link>
                <div
                  className={`collapse ${
                    openDropdowns.includes(index) ? "show" : ""
                  }`}
                  id={`categoryFlush${index + 1}`}
                >
                  <div>
                    <ul className="nav flex-column ms-3">
                      {dropdown.items.map((item, itemIndex) => (
                        <li className="nav-item" key={itemIndex}>
                          <Link className="nav-link" to="#">
                            {item} 
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          ))}
          <div>
            <div className="py-4">
              <h5 className="mb-3">Stores</h5>
              <div className="my-4">
                {/* input */}
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search by store"
                />
              </div>
              {/* form check */}
              <div className="form-check mb-2">
                {/* input */}
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue
                  id="eGrocery"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="eGrocery">
                  E-Grocery
                </label>
              </div>
              {/* form check */}
              <div className="form-check mb-2">
                {/* input */}
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue
                  id="DealShare"
                />
                <label className="form-check-label" htmlFor="DealShare">
                  DealShare
                </label>
              </div>
              {/* form check */}
              <div className="form-check mb-2">
                {/* input */}
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue
                  id="Dmart"
                />
                <label className="form-check-label" htmlFor="Dmart">
                  DMart
                </label>
              </div>
              {/* form check */}
              <div className="form-check mb-2">
                {/* input */}
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue
                  id="Blinkit"
                />
                <label className="form-check-label" htmlFor="Blinkit">
                  Blinkit
                </label>
              </div>
              {/* form check */}
              <div className="form-check mb-2">
                {/* input */}
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue
                  id="BigBasket"
                />
                <label className="form-check-label" htmlFor="BigBasket">
                  BigBasket
                </label>
              </div>
              {/* form check */}
              <div className="form-check mb-2">
                {/* input */}
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue
                  id="StoreFront"
                />
                <label className="form-check-label" htmlFor="StoreFront">
                  StoreFront
                </label>
              </div>
              {/* form check */}
              <div className="form-check mb-2">
                {/* input */}
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue
                  id="Spencers"
                />
                <label className="form-check-label" htmlFor="Spencers">
                  Spencers
                </label>
              </div>
              {/* form check */}
              <div className="form-check mb-2">
                {/* input */}
                <input
                  className="form-check-input"
                  type="checkbox"
                  defaultValue
                  id="onlineGrocery"
                />
                <label className="form-check-label" htmlFor="onlineGrocery">
                  Online Grocery
                </label>
              </div>
            </div>
            <div className="py-4">
              {/* price */}
              <h5 className="mb-3">Price</h5>
              <div>
                {/* range */}
                <div id="priceRange" className="mb-3" />
                <small className="text-muted">Price:</small>{" "}
                <span id="priceRange-value" className="small" />
              </div>
            </div>
            {/* rating */}
            <div className="py-4">
              <h5 className="mb-3">Rating</h5>
              <div>
                {/* form check */}
                <div className="form-check mb-2">
                  {/* input */}
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultValue
                    id="ratingFive"
                  />
                  <label className="form-check-label" htmlFor="ratingFive">
                    <i className="bi bi-star-fill text-warning" />
                    <i className="bi bi-star-fill text-warning " />
                    <i className="bi bi-star-fill text-warning " />
                    <i className="bi bi-star-fill text-warning " />
                    <i className="bi bi-star-fill text-warning " />
                  </label>
                </div>
                {/* form check */}
                <div className="form-check mb-2">
                  {/* input */}
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultValue
                    id="ratingFour"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="ratingFour">
                    <i className="bi bi-star-fill text-warning" />
                    <i className="bi bi-star-fill text-warning " />
                    <i className="bi bi-star-fill text-warning " />
                    <i className="bi bi-star-fill text-warning " />
                    <i className="bi bi-star text-warning" />
                  </label>
                </div>
                {/* form check */}
                <div className="form-check mb-2">
                  {/* input */}
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultValue
                    id="ratingThree"
                  />
                  <label className="form-check-label" htmlFor="ratingThree">
                    <i className="bi bi-star-fill text-warning" />
                    <i className="bi bi-star-fill text-warning " />
                    <i className="bi bi-star-fill text-warning " />
                    <i className="bi bi-star text-warning" />
                    <i className="bi bi-star text-warning" />
                  </label>
                </div>
                {/* form check */}
                <div className="form-check mb-2">
                  {/* input */}
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultValue
                    id="ratingTwo"
                  />
                  <label className="form-check-label" htmlFor="ratingTwo">
                    <i className="bi bi-star-fill text-warning" />
                    <i className="bi bi-star-fill text-warning" />
                    <i className="bi bi-star text-warning" />
                    <i className="bi bi-star text-warning" />
                    <i className="bi bi-star text-warning" />
                  </label>
                </div>
                {/* form check */}
                <div className="form-check mb-2">
                  {/* input */}
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultValue
                    id="ratingOne"
                  />
                  <label className="form-check-label" htmlFor="ratingOne">
                    <i className="bi bi-star-fill text-warning" />
                    <i className="bi bi-star text-warning" />
                    <i className="bi bi-star text-warning" />
                    <i className="bi bi-star text-warning" />
                    <i className="bi bi-star text-warning" />
                  </label>
                </div>
              </div>
            </div>
            <div className="py-4">
              {/* Banner Design */}
              {/* Banner Content */}
              <div className="position-absolute p-5 py-8">
                <h3 className="mb-0">Fresh Fruits </h3>
                <p>Get Upto 25% Off</p>
                <Link to="#" className="btn btn-dark">
                  Shop Now
                  <i className="feather-icon icon-arrow-right ms-1" />
                </Link>
              </div>
              {/* Banner Content */}
              {/* Banner Image */}
              {/* img */}
              <img
                src={assortment}
                alt="assortment"
                className="img-fluid rounded-3"
              />
              {/* Banner Image */}
            </div>
            {/* Banner Design */}
          </div>
        </div>
        {/* Cards Column */}
        <div className="col-lg-9 col-md-8">
          {/* card */}
          <div className="card mb-4 bg-light border-0">
            {/* card body */}
            <div className=" card-body p-9">
              <h1 className="mb-0">All Products</h1>
            </div>
          </div>
          {/* list icon */}
          <div className="d-md-flex justify-content-between align-items-center">
            <div>
              <p className="mb-3 mb-md-0">
                {" "}
                <span className="text-dark">{products.length} </span> Products found{" "}
              </p>
            </div>
            {/* icon */}
            <div className="d-flex justify-content-between align-items-center">
              <Link to="/ShopListCol" className="text-muted me-3">
                <i className="bi bi-list-ul" />
              </Link>
              <Link to="/ShopGridCol3" className=" me-3 text-muted">
                <i className="bi bi-grid" />
              </Link>
              <Link to="/Shop" className="me-3 active">
                <i className="bi bi-grid-3x3-gap" />
              </Link>
              <div className="me-2">
                {/* select option */}
                <select
                  className="form-select"
                  aria-label="Default select example"
                >
                  <option selected>Show: 50</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>
              <div>
                {/* select option */}
                <select
                  className="form-select"
                  aria-label="Default select example"
                >
                  <option selected>Sort by: Featured</option>
                  <option value="Low to High">Price: Low to High</option>
                  <option value="High to Low"> Price: High to Low</option>
                  <option value="Release Date"> Release Date</option>
                  <option value="Avg. Rating"> Avg. Rating</option>
                </select>
              </div>
            </div>
          </div>
          {/* row */}
          <div className="row g-4 row-cols-xl-4 row-cols-lg-3 row-cols-2 row-cols-md-2 mt-2">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <p>No products found. Add products from admin panel.</p>
              </div>
            )}
          </div>
          <div className="row mt-8">
            <div className="col">
              {/* nav */}
              <nav>
                <ul className="pagination">
                  <li className="page-item disabled">
                    <Link
                      className="page-link  mx-1 rounded-3 "
                      to="#"
                      aria-label="Previous"
                    >
                      <i className="fa fa-chevron-left" />
                    </Link>
                  </li>
                  <li className="page-item ">
                    <Link className="page-link  mx-1 rounded-3 active" to="#">
                      1
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link mx-1 rounded-3 text-body" to="#">
                      2
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link mx-1 rounded-3 text-body" to="#">
                      ...
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link mx-1 rounded-3 text-body" to="#">
                      12
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link
                      className="page-link mx-1 rounded-3 text-body"
                      to="#"
                      aria-label="Next"
                    >
                      <i className="fa fa-chevron-right" />
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
)}
</div>
  );
}

export default Dropdown;
