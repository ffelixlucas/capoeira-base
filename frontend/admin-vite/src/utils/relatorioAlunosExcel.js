// utils/relatorioAlunosExcel.js
// Dependência: npm i xlsx
import * as XLSX from "xlsx";

/** Normaliza texto: Primeira letra maiúscula */
function formatarTexto(valor) {
  if (!valor) return "-";
  return valor
    .toLowerCase()
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/** Ajusta largura das colunas */
function aplicarLarguras(worksheet, widths) {
  worksheet["!cols"] = widths.map((wch) => ({ wch }));
}

/* ============================================================================
   📄 1) LISTA SIMPLES DE ALUNOS (EXCEL)
   Colunas: Nº | Nome | Apelido | Turma | Categoria | Graduação | Telefone | Responsável | Status
============================================================================ */
export function exportarListaExcelAlunos(alunos) {
  const ordenados = [...alunos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
  );

  const cabecalho = [
    "Nº",
    "Nome",
    "Apelido",
    "Turma",
    "Categoria",
    "Graduação",
    "Telefone",
    "Responsável",
    "Status",
  ];

  const linhas = ordenados.map((a, idx) => [
    idx + 1,
    formatarTexto(a.nome),
    formatarTexto(a.apelido),
    formatarTexto(a.turma),
    formatarTexto(a.categoria),
    formatarTexto(a.graduacao),
    a.telefone || "-",
    a.responsavel_nome || "-",
    a.status || "ativo",
  ]);

  const aoa = [cabecalho, ...linhas];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  aplicarLarguras(ws, [6, 34, 22, 20, 18, 18, 18, 26, 12]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lista");

  XLSX.writeFile(wb, "lista_alunos.xlsx");
}

/* ============================================================================
   📊 2) RELATÓRIO COMPLETO (EXCEL)
   Abas:
   - Resumo
   - Por Turma
   - Por Categoria
   - Por Graduação
   - Lista Final
============================================================================ */
export function exportarRelatorioExcelAlunos(alunos) {
  const wb = XLSX.utils.book_new();

  /* -------------------- RESUMO -------------------- */
  const total = alunos.length;
  const ativos = alunos.filter(a => a.status === "ativo").length;
  const inativos = alunos.filter(a => a.status !== "ativo").length;

  const menores = alunos.filter(a => a.idade < 18).length;
  const maiores = alunos.filter(a => a.idade >= 18).length;

  const resumoAOA = [
    ["Métrica", "Valor"],
    ["Total de alunos", total],
    ["Ativos", ativos],
    ["Inativos", inativos],
    ["Menores de 18", menores],
    ["Maiores de 18", maiores],
  ];

  const wsResumo = XLSX.utils.aoa_to_sheet(resumoAOA);
  aplicarLarguras(wsResumo, [28, 20]);
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  /* -------------------- POR TURMA -------------------- */
  const gruposTurma = {};
  alunos.forEach(a => {
    const key = a.turma || "Sem Turma";
    gruposTurma[key] = (gruposTurma[key] || 0) + 1;
  });

  const turmaAOA = [
    ["Turma", "Quantidade"],
    ...Object.entries(gruposTurma),
  ];

  const wsTurma = XLSX.utils.aoa_to_sheet(turmaAOA);
  aplicarLarguras(wsTurma, [28, 14]);
  XLSX.utils.book_append_sheet(wb, wsTurma, "Por Turma");

  /* -------------------- POR CATEGORIA -------------------- */
  const gruposCategoria = {};
  alunos.forEach(a => {
    const key = a.categoria || "-";
    gruposCategoria[key] = (gruposCategoria[key] || 0) + 1;
  });

  const categoriaAOA = [
    ["Categoria", "Quantidade"],
    ...Object.entries(gruposCategoria),
  ];

  const wsCategoria = XLSX.utils.aoa_to_sheet(categoriaAOA);
  aplicarLarguras(wsCategoria, [28, 14]);
  XLSX.utils.book_append_sheet(wb, wsCategoria, "Por Categoria");

  /* -------------------- POR GRADUAÇÃO -------------------- */
  const gruposGraduacao = {};
  alunos.forEach(a => {
    const key = a.graduacao || "-";
    gruposGraduacao[key] = (gruposGraduacao[key] || 0) + 1;
  });

  const graduacaoAOA = [
    ["Graduação", "Quantidade"],
    ...Object.entries(gruposGraduacao),
  ];

  const wsGraduacao = XLSX.utils.aoa_to_sheet(graduacaoAOA);
  aplicarLarguras(wsGraduacao, [28, 14]);
  XLSX.utils.book_append_sheet(wb, wsGraduacao, "Por Graduação");

  /* -------------------- LISTA FINAL -------------------- */
  const cabecalho = [
    "Nº",
    "Nome",
    "Apelido",
    "Turma",
    "Categoria",
    "Graduação",
    "Telefone",
    "Responsável",
    "Status",
  ];

  const linhas = alunos
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }))
    .map((a, idx) => [
      idx + 1,
      formatarTexto(a.nome),
      formatarTexto(a.apelido),
      formatarTexto(a.turma),
      formatarTexto(a.categoria),
      formatarTexto(a.graduacao),
      a.telefone || "-",
      a.responsavel_nome || "-",
      a.status || "ativo",
    ]);

  const wsLista = XLSX.utils.aoa_to_sheet([cabecalho, ...linhas]);
  aplicarLarguras(wsLista, [6, 34, 22, 20, 18, 18, 18, 26, 12]);
  XLSX.utils.book_append_sheet(wb, wsLista, "Lista Final");

  XLSX.writeFile(wb, "relatorio_completo_alunos.xlsx");
}
