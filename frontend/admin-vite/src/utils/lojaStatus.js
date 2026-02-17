export function formatarStatusOperacional(status) {
  switch (status) {
    case "em_separacao":
      return "Em separação";
    case "pronto_retirada":
      return "Pronto para retirada";
    case "entregue":
      return "Entregue";
    case "cancelado":
      return "Cancelado";
    case "pendente_pagamento":
      return "Aguardando pagamento";
    default:
      return status;
  }
}

export function obterStatusOperacionalConfig(status) {
  switch (status) {
    case "em_separacao":
      return {
        label: "Em separação",
        bg: "bg-amber-500/20",
        text: "text-amber-400",
        dot: "bg-amber-500",
      };

    case "pronto_retirada":
      return {
        label: "Pronto para retirada",
        bg: "bg-green-500/20",
        text: "text-green-400",
        dot: "bg-green-500",
      };

    case "entregue":
      return {
        label: "Entregue",
        bg: "bg-gray-500/20",
        text: "text-gray-300",
        dot: "bg-gray-400",
      };

    case "cancelado":
      return {
        label: "Cancelado",
        bg: "bg-red-500/20",
        text: "text-red-400",
        dot: "bg-red-500",
      };

    case "pendente_pagamento":
      return {
        label: "Aguardando pagamento",
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        dot: "bg-blue-500",
      };

    default:
      return {
        label: status,
        bg: "bg-gray-500/20",
        text: "text-gray-300",
        dot: "bg-gray-400",
      };
  }
}
