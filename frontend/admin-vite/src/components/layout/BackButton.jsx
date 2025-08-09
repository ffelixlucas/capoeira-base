// src/components/layout/BackButton.jsx
import React from "react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { routeMeta, DEFAULT_FALLBACK } from "../../routes/routeMeta";
import { useRouteHistory } from "../../hooks/useRouteHistory";

const ROOTS = [
  "/dashboard","/agenda","/alunos","/turmas","/galeria","/inscricoes",
  "/horarios","/equipe","/uniformes","/video-aulas","/contatos","/mensalidades",
];

const isRoot = (p) => ROOTS.includes(p);

function findParent(pathname) {
  for (const meta of routeMeta) {
    if (matchPath({ path: meta.pattern, end: true }, pathname)) {
      return meta.parent || null;
    }
  }
  return null;
}

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { popPrev } = useRouteHistory(location.pathname);

  if (location.pathname === "/dashboard") return null;

  const handleBack = () => {
    // 1) Tenta voltar usando o histórico interno e já limpa o par (atual+anterior)
    const prev = popPrev();
    if (prev) return navigate(prev);

    // 2) Sem histórico: se estou num módulo raiz, volta pro dashboard
    if (isRoot(location.pathname)) {
      return navigate("/dashboard");
    }

    // 3) Fallback por parentMap (patterns com :params)
    const parent = findParent(location.pathname);
    if (parent) return navigate(parent);

    // 4) Último fallback
    return navigate(DEFAULT_FALLBACK);
  };

  return (
    <button
      onClick={handleBack}
      className="p-2 rounded-lg hover:bg-cor-secundaria flex items-center gap-1"
      aria-label="Voltar"
    >
      <ArrowLeftOnRectangleIcon className="h-5 w-5" />
      <span className="hidden sm:inline">Voltar</span>
    </button>
  );
}
