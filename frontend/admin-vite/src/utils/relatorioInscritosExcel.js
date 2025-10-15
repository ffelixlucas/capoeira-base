// utils/relatorioInscritosExcel.js
// Dependência: npm i xlsx
import * as XLSX from "xlsx";

/** Normaliza texto: Primeira letra maiúscula de cada palavra */
function formatarTexto(valor) {
  if (!valor) return "-";
  return valor
    .toLowerCase()
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/** Ajusta larguras padrão de coluna (em caracteres) */
function aplicarLarguras(worksheet, widths) {
  worksheet["!cols"] = widths.map((wch) => ({ wch }));
}

/**
 * ✅ Lista simples de confirmados (com coluna de assinatura)
 * Colunas: Nº | Nome | Apelido | Graduação | Categoria | Camiseta | Assinatura
 */
export function exportarListaExcel(inscritos, eventoId) {
  // Filtra pagos e ordena por nome (pt-BR, case-insensitive)
  const confirmados = inscritos
    .filter((i) => i.status === "pago")
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));

  const cabecalho = [
    "Nº",
    "Nome",
    "Apelido",
    "Graduação",
    "Categoria",
    "Camiseta",
    "Assinatura",
  ];

  const linhas = confirmados.map((i, idx) => [
    idx + 1,
    formatarTexto(i.nome),
    formatarTexto(i.apelido),
    formatarTexto(i.graduacao),
    formatarTexto(i.categoria),
    (i.tamanho_camiseta || "-").toUpperCase(),
    "", // Espaço para assinatura
  ]);

  const aoa = [cabecalho, ...linhas];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Larguras pensadas p/ Canva (evitar quebra e manter colunas "retas")
  aplicarLarguras(ws, [6, 36, 22, 18, 20, 12, 28]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lista");

  const nomeArquivo = `lista_confirmados_${eventoId}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}

/**
 * ✅ Relatório completo (versão Excel)
 * Abas:
 *  - Resumo
 *  - Camisetas
 *  - Confirmados (com assinatura)
 *
 * Mantém estrutura simples (sem formatação avançada) para máxima compatibilidade com Canva.
 */
export function exportarRelatorioExcel(inscritos, evento, eventoId) {
  const wb = XLSX.utils.book_new();

  // -------- RESUMO --------
  const totalInscritosPagos = Number(evento.total_inscritos ?? 0);
  const totalBruto = Number(evento.valor_bruto_total ?? 0).toFixed(2);
  const totalLiquido = Number(evento.valor_liquido_total ?? 0).toFixed(2);
  const qtdPix = inscritos.filter((i) => i.metodo_pagamento === "pix").length;
  const qtdCartao = inscritos.filter((i) => i.metodo_pagamento === "cartao").length;

  const resumoAOA = [
    ["Métrica", "Valor"],
    ["Total inscritos pagos", String(totalInscritosPagos)],
    ["Total bruto", `R$ ${totalBruto}`],
    ["Total líquido", `R$ ${totalLiquido}`],
    ["Pix", `${qtdPix} inscritos`],
    ["Cartão", `${qtdCartao} inscritos`],
  ];
  const wsResumo = XLSX.utils.aoa_to_sheet(resumoAOA);
  aplicarLarguras(wsResumo, [28, 22]);
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

  // -------- CAMISETAS --------
  const tamanhos = {};
  inscritos
    .filter((i) => i.status === "pago")
    .forEach((i) => {
      const t = (i.tamanho_camiseta || "-").toUpperCase();
      tamanhos[t] = (tamanhos[t] || 0) + 1;
    });
  const camisetasAOA = [
    ["Tamanho", "Quantidade"],
    ...Object.entries(tamanhos).map(([tam, qtd]) => [tam, qtd]),
  ];
  const wsCamisetas = XLSX.utils.aoa_to_sheet(camisetasAOA);
  aplicarLarguras(wsCamisetas, [14, 14]);
  XLSX.utils.book_append_sheet(wb, wsCamisetas, "Camisetas");

  // -------- CONFIRMADOS --------
  const confirmados = inscritos
    .filter((i) => i.status === "pago")
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));

  const cabecalhoConfirmados = [
    "Nº",
    "Nome",
    "Documento",
    "Categoria",
    "Camiseta",
    "Assinatura",
  ];
  const linhasConfirmados = confirmados.map((i, idx) => [
    idx + 1,
    formatarTexto(i.nome),
    i.cpf || "-",
    formatarTexto(i.categoria),
    (i.tamanho_camiseta || "-").toUpperCase(),
    "", // assinatura
  ]);
  const wsConfirmados = XLSX.utils.aoa_to_sheet([
    ...[cabecalhoConfirmados],
    ...linhasConfirmados,
  ]);
  aplicarLarguras(wsConfirmados, [6, 36, 20, 22, 12, 28]);
  XLSX.utils.book_append_sheet(wb, wsConfirmados, "Confirmados");

  const nomeArquivo = `relatorio_evento_${eventoId}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}
