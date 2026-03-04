export async function solicitarPermissaoNotificacoes() {
  if (!("Notification" in window)) {
    console.warn("Notificações não são suportadas neste navegador.");
    return "unsupported";
  }

  // Evita solicitar novamente quando já está bloqueado/concedido
  if (Notification.permission === "denied") {
    console.log("Permissão de notificação já negada.");
    return "denied";
  }

  if (Notification.permission === "granted") {
    console.log("Permissão de notificação já concedida.");
    return "granted";
  }

  const permissao = await Notification.requestPermission();
  console.log("Permissão de notificação:", permissao);

  return permissao;
}
