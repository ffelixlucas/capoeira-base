import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LayoutAdmin from "./components/LayoutAdmin";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Galeria from "./pages/Galeria";
import Agenda from "./pages/Agenda";
import Alunos from "./pages/Alunos";
import Mensalidades from "./pages/Mensalidades";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirecionamento inicial */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas com layout administrativo */}
          <Route element={<PrivateRoute><LayoutAdmin /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/mensalidades" element={<Mensalidades />} />
          </Route>

          {/* Rota de fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
