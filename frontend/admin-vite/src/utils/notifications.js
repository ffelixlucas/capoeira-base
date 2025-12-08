export async function solicitarPermissaoNotificacoes() {
    if (!("Notification" in window)) {
      console.warn("Notificações não são suportadas neste navegador.");
      return;
    }
  
    const permissao = await Notification.requestPermission();
    console.log("Permissão de notificação:", permissao);
  
    return permissao;
  }
  