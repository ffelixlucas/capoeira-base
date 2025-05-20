import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Galeria from "./pages/Galeria";
import RedirectBasedOnAuth from "./components/RedirectBasedOnAuth";


const PrivateRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="galeria" />} />
          <Route path="galeria" element={<Galeria />} />
        </Route>

        <Route path="*" element={<RedirectBasedOnAuth />} />
      </Routes>
    </Router>
  );
};

export default App;
