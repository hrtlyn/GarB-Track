import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token'); // check if logged in
  const userRole = localStorage.getItem('role'); // stored role

  if (!token) {
    return <Navigate to="/login" />; // not logged in
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />; // wrong role
  }

  return children; // allow access
}

export default PrivateRoute;
