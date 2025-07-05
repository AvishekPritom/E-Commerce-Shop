import HomeCard from "./HomeCard";

const CardContainer = ({ product = [] }) => {
  return (
    <section className="py-5" id="shop">
      <h4 style={{ textAlign: "center" }}>Our Products</h4>
      <div className="container px-4 px-lg-5  mt-5">
        <div className="row justify-content-center">
          {product.map((Products) => (
            <HomeCard key={Products.id} product={Products} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardContainer;
