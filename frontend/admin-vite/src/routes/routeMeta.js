// src/routes/routeMeta.js
// Padrão mobile-first: título curto e pai explícito.
// Só rotas do LayoutAdmin (área admin).

export const routeMeta = [
    // nível raiz
    { pattern: "/dashboard", title: "Início", parent: null },
  
    // módulos
    { pattern: "/equipe", title: "Equipe", parent: "/dashboard" },
    { pattern: "/turmas", title: "Turmas", parent: "/dashboard" },
    { pattern: "/agenda", title: "Eventos", parent: "/dashboard" },
    { pattern: "/galeria", title: "Galeria", parent: "/dashboard" },
    { pattern: "/alunos", title: "Alunos", parent: "/dashboard" },
    { pattern: "/mensalidades", title: "Mensalidades", parent: "/dashboard" },
    { pattern: "/uniformes", title: "Loja", parent: "/dashboard" },
    { pattern: "/video-aulas", title: "Aulas", parent: "/dashboard" },
    { pattern: "/contatos", title: "Contatos", parent: "/dashboard" },
    { pattern: "/inscricoes", title: "Inscrições", parent: "/dashboard" },
    { pattern: "/horarios", title: "Horários de aulas", parent: "/dashboard" },
  
    // detalhes/nível 2 (mesmo que ainda não existam telas, já fica pronto)
    { pattern: "/agenda/:id", title: "Detalhe do Evento", parent: "/agenda" },
    { pattern: "/alunos/:id", title: "Aluno", parent: "/alunos" },
    { pattern: "/turmas/:id", title: "Turma", parent: "/turmas" },
    { pattern: "/inscricoes/:eventoId", title: "Inscritos do Evento", parent: "/inscricoes" },
  ];
  
  export const DEFAULT_FALLBACK = "/dashboard";
  