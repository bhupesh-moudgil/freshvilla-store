import React from "react";
import ProductCard from '../Component/ProductCard';
import productsData from '../data/products.json';

const ProductItem = () => {
  // Get featured products only
  const featuredProducts = productsData.products.filter(p => p.featured).slice(0, 10);

  return (
    <div>
      {/* Popular Products Start*/}
      <section className="my-lg-14 my-8">
        <div className="container">
          <div className="row">
            <div className="col-12 mb-6">
              <div className="section-head text-center mt-8">
                <h3 className='h3style' data-title="Popular Products">Popular Products</h3>
                <div className="wt-separator bg-primarys"></div>
                <div className="wt-separator2 bg-primarys"></div>
              </div>
            </div>
          </div>
          <div className="row g-4 row-cols-lg-5 row-cols-2 row-cols-md-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      {/* Popular Products End */}
    </div>
  );
};

export default ProductItem;
