import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Error = ({ error }) => {
  return (
    <div className="alert alert-danger my-5" role="alert">
      {error}
    </div>
  );
};

export default Error;
