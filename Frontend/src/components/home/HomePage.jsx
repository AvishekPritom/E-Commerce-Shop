import Header from "./Header";
import CardContainer from "./CardContainer";
import { useEffect, useState } from "react";
import api from "../../api";

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("products")
      .then((res) => {
        // Adjust this line if your API response structure is different
        setProducts(res.data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  return (
    <>
      <Header />
      <CardContainer product={products} />
    </>
  );
};

export default HomePage;
