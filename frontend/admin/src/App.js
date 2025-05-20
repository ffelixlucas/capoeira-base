import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Galeria from './pages/Galeria';
import Agenda from './pages/Agenda';
import Alunos from './pages/Alunos';
import Mensalidades from './pages/Mensalidades';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/galeria" element={
            <PrivateRoute><Galeria /></PrivateRoute>
          } />
          <Route path="/agenda" element={
            <PrivateRoute><Agenda /></PrivateRoute>
          } />
          <Route path="/alunos" element={
            <PrivateRoute><Alunos /></PrivateRoute>
          } />
          <Route path="/mensalidades" element={
            <PrivateRoute><Mensalidades /></PrivateRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
