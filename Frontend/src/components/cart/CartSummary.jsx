import { Link } from "react";

const CartSummary = ({ cartTotal, tax }) => {
  const subTotal = cartTotal.toFixed(2);
  const cartTax = tax.toFixed(2);
  const total = cartTotal + tax;
  return (
    <div className="col-md-4 align-self-start">
      <div className="card">
        <div className="cardbody">
          <h5 className="card-title">Cart Summary</h5>
          <hr />
          <div className="d-flex justify-content-between">
            <span>{`$$({subTotal)`}</span>
            <span>$40.00</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>{`$$({cartTax)`}</span>
            <span>$4.00</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>{`$$({total)`}</span>
            <strong>$44.00</strong>
          </div>
          <Link to="/checkout">
            <button
              className="btn btn-primary w-100"
              style={{ backgroundColor: "#6050DC", borderColor: "#6050DC" }}
            >
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
