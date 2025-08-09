// src/hooks/useRouteHistory.js
import { useEffect } from "react";

const KEY = "adminRouteHistory";
const ADMIN_PREFIXES = [
  "/dashboard","/agenda","/inscricoes","/alunos","/turmas","/galeria",
  "/equipe","/uniformes","/video-aulas","/horarios","/contatos","/mensalidades"
];

function isAdminPath(path) {
  return ADMIN_PREFIXES.some((p) => path.startsWith(p));
}

function getStack() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch { return []; }
}
function setStack(stack) {
  sessionStorage.setItem(KEY, JSON.stringify(stack.slice(-25)));
}

export function useRouteHistory(pathname) {
  useEffect(() => {
    if (!isAdminPath(pathname)) return;
    const stack = getStack();
    const last = stack[stack.length - 1];
    if (last !== pathname) {
      stack.push(pathname);
      setStack(stack);
    }
  }, [pathname]);

  const popPrev = () => {
    const stack = getStack();
    if (!stack.length) return null;

    // Remove a rota atual
    stack.pop();

    // Pega e remove a anterior (destino do "voltar")
    const prev = stack.pop() || null;

    setStack(stack);
    return prev;
  };

  const peekPrev = () => {
    const stack = getStack();
    return stack.length > 1 ? stack[stack.length - 2] : null;
  };

  return { popPrev, peekPrev };
}
