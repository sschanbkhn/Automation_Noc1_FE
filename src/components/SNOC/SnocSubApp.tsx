// src/components/SNOC/SnocSubApp.tsx  (nếu dùng JS thì bỏ kiểu TS)
import React from "react";
import { Provider } from "react-redux";
import { Outlet } from "react-router-dom";
import snocStore from "./store/snocStore";

const SnocSubApp = () => (
  <Provider store={snocStore}>
    <Outlet />
  </Provider>
);

export default SnocSubApp;
