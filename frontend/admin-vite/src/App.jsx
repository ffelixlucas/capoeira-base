import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./contexts/AuthContext";
import { FamilyAuthProvider } from "./contexts/FamilyAuthContext";
import PrivateRoute from "./components/layout/PrivateRoute";
import RoleRoute from "./components/RoleRoute";
import LayoutAdmin from "./components/layout/LayoutAdmin";
import FamilyPrivateRoute from "./components/layout/FamilyPrivateRoute";

// Imports de páginas administrativas

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Galeria from "./pages/Galeria";
import Agenda from "./pages/Agenda";
import Alunos from "./pages/Alunos";
import Mensalidades from "./pages/Mensalidades";
import NotFound from "./pages/NotFound";
import NaoAutorizado from "./pages/NaoAutorizado";
import Equipe from "./pages/Equipe";
import Turmas from "./pages/Turmas";
import Contatos from "./pages/Contatos";
import Inscricoes from "./pages/Inscricoes";
import InscritosEvento from "./pages/InscritosEvento.jsx";
import Presencas from "./pages/Presencas.jsx";
import EditarPerfil from "./pages/EditarPerfil.jsx";
import ConfigSistema from "./pages/ConfigSistema.jsx";
import Loja from "./pages/Loja.jsx";
import PedidoDetalhe from "./pages/PedidoDetalhe.jsx";
import ProdutoGerenciarPage from './pages/produtos/ProdutoGerenciarPage'

// Imports de páginas públicas
import LayoutPublic from "./components/layout/LayoutPublic";
import InscricoesPublic from "./pages/public/InscricoesPublic";
import InscricaoEventoPublic from "./pages/public/InscricaoEventoPublic";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CartaoPagamento from "./components/public/pagamento/CartaoPagamento.jsx";
import PreMatriculaPublic from "./pages/public/PreMatriculaPublic.jsx";
import LojaPublic from "./pages/public/loja/LojaPublic.jsx";
import { CarrinhoProvider } from "./contexts/public/loja/CarrinhoContext";
import LojaWrapper from "./pages/public/loja/LojaWrapper.jsx";
import CheckoutPublic from "./pages/public/loja/CheckoutPublic.jsx";
import PedidoConfirmado from "./pages/public/loja/PedidoConfirmado.jsx"
import { ProdutosPage } from "./pages/produtos/ProdutosPage";
import FamiliaLogin from "./pages/public/familia/FamiliaLogin.jsx";
import FamiliaPainel from "./pages/public/familia/FamiliaPainel.jsx";

function App() {
  return (
    <AuthProvider>
      <FamilyAuthProvider>
        <Router>
          <Routes>
          {/* Redirecionamento inicial */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rota pública */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/nao-autorizado" element={<NaoAutorizado />} />
          <Route path="/loja/:slug" element={<LojaWrapper />}>
            <Route index element={<LojaPublic />} />
            <Route path="checkout" element={<CheckoutPublic />} />
            <Route path="pedido/:id/confirmado" element={<PedidoConfirmado />} />
          </Route>

          <Route path="/matricula/:slug" element={<PreMatriculaPublic />} />






          {/* Rotas protegidas com layout administrativo */}
          <Route
            element={
              <PrivateRoute>
                <LayoutAdmin />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route
              path="/turmas"
              element={
                <RoleRoute permitido={["admin", "instrutor"]}>
                  <Turmas />
                </RoleRoute>
              }
            />

            <Route path="/noticias" element={<Galeria />} />
            <Route path="/galeria" element={<Navigate to="/noticias" replace />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/mensalidades" element={<Mensalidades />} />
            <Route path="/loja" element={<RoleRoute permitido={["admin", "loja"]}><Loja /></RoleRoute>} />
            <Route path="/loja/pedido/:id" element={<RoleRoute permitido={["admin", "loja"]}><PedidoDetalhe /></RoleRoute>} />
            <Route path="/admin/produtos" element={<ProdutosPage />} />
            <Route
  path="/admin/produtos/:id"
  element={<ProdutoGerenciarPage />}
/>
            <Route path="/contatos" element={<Contatos />} />
            <Route path="/inscricoes" element={<Inscricoes />} />
            <Route path="/inscricoes/:eventoId" element={<InscritosEvento />} />
            <Route path="/presencas" element={<Presencas />} />
            <Route path="/perfil" element={<EditarPerfil />} />
            <Route path="/config" element={<ConfigSistema />} />

          </Route>

          {/* Rota de fallback */}
          <Route path="*" element={<NotFound />} />

            <Route element={<LayoutPublic />}>
              {/* 🔹 Multi-org: listagem e inscrição de eventos */}
              <Route path="/inscrever/:slug" element={<InscricoesPublic />} />
              <Route
                path="/inscrever/:slug/:eventoId"
                element={<InscricaoEventoPublic />}
              />
              <Route path="/cartao-pagamento" element={<CartaoPagamento />} />
              <Route path="/familia/:slug/login" element={<FamiliaLogin />} />
              <Route
                path="/familia/:slug"
                element={
                  <FamilyPrivateRoute>
                    <FamiliaPainel />
                  </FamilyPrivateRoute>
                }
              />
            </Route>
          </Routes>
        </Router>

        {/* 🔥 Toast Global */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          pauseOnHover
          theme="light"
        />
      </FamilyAuthProvider>
    </AuthProvider>
  );
}

export default App;
