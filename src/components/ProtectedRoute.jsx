import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserState } from "../App";

const ProtectedRoute = () => {
  const { user } = useContext(UserState);

  if (!user) {
    // user not signed in → redirect to login
    return <Navigate to="/login" replace />;
  }

  // user is signed in → render child routes
  return <Outlet />;
};

export default ProtectedRoute;
