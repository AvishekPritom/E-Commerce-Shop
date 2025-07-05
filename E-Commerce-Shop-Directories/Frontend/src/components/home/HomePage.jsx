import Header from "./Header";
import CardContainer from "./CardContainer";
import { useEffect, useState } from "react";
import api from "../../api";
import Error from "../ui/Error";
import PlaceHolderContainer from "../ui/PlaceHolderContainer";
import { randomValue } from "../../GenerateCardCode";

const HomePage = () => {
  const [product, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(function () {
    if (localStorage.getItem("cart_code") == null) {
      localStorage.setItem("cart_code", randomValue);
    }
  }, []);

  useEffect(function () {
    setLoading(true);
    api
      .get("products/")
      .then((res) => {
        // Adjust this line if your API response structure is different
        setProducts(res.data);
        setLoading(false);
        setError("");
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
        setError(err.message);
      });
  }, []);

  return (
    <>
      <Header />
      {loading ? (
        <PlaceHolderContainer />
      ) : (
        <CardContainer product={product} />
      )}
      {error && <Error error={error} />}
    </>
  );
};

export default HomePage;
