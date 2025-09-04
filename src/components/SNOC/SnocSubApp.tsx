// src/components/SNOC/SnocSubApp.tsx  (nếu dùng JS thì bỏ kiểu TS)
import React from "react";
import { Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import snocStore from "../SNOC/store/snocStore";

const SnocSubApp = () => (
  <Provider store={snocStore}>
    <Outlet />
  </Provider>
);

export default SnocSubApp;
