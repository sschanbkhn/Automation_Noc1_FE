import React from "react";
import "../styles/bootstrap-override.scss"; // Hoặc bootstrap-override.scss tùy bạn

const BlankLayout = ({ children }) => {
  return <div className="app-layout">{children}</div>;
};

export default BlankLayout;
