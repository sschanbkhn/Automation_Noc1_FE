import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isSnocAuthed } from "./snocApi";

export default function RequireSnocAuth({ children }) {
  const loc = useLocation();
  if (!isSnocAuthed()) {
    return <Navigate to="/snoc/login" replace state={{ from: loc }} />;
  }
  return <>{children}</>;
}
