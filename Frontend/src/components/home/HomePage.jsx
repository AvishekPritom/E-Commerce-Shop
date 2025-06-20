import Header from "./Header";
import CardContainer from "./CardContainer";
import { useEffect, useState } from "react";
import api from "../../api";

const HomePage = () => {
  const [product, setProducts] = useState([]);

  useEffect(function () {
    api
      .get("product")
      .then((res) => {
        console.log(res.data);
        setProducts(res.data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  return (
    <>
      <Header />
      <CardContainer product={product} />
    </>
  );
};

export default HomePage;
