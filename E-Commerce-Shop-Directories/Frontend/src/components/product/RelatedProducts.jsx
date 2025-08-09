import React from "react";
import HomeCard from "../home/HomeCard";

const RelatedProducts = ({ products = [] }) => {
  // Don't render the section if no products
  if (!products || products.length === 0) {
    return (
      <section className="py-3 bg-light">
        <div className="container px-4 px-lg-5 mt-3">
          <h2 className="fw-bolder mb-4">Related products</h2>
          <div className="text-center py-4">
            <p className="text-muted">No related products found in this category.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-3 bg-light">
      <div className="container px-4 px-lg-5 mt-3">
        <h2 className="fw-bolder mb-4">Related products</h2>
        <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
          {products.map((product) => (
            <HomeCard key={product._id || product.slug || product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;