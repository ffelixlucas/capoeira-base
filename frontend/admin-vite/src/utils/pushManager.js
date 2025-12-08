import api from "../services/api";

// 🔓 Chave pública VAPID gerada
const VAPID_PUBLIC_KEY =
  "BFk52Yye8zMU3p_0UhCueMr7x_eEuqkJDmKZPwzLMItW6TlrGWpWzLlDnINBiN68qXaxmyI839DarH5hKIdTfNE";

// 🔄 Converte base64 para Uint8Array (obrigatório pelo Web Push)
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * 🔥 REGISTRA PUSH SUBSCRIPTION PARA O USUÁRIO LOGADO
 * - Garante subscription única
 * - Salva no backend com usuario_id + organizacao_id (via token)
 */
export async function registrarPushSubscription(usuario) {
  try {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker não suportado neste navegador.");
      return null;
    }

    // Aguarda o Service Worker ficar pronto
    const registration = await navigator.serviceWorker.ready;

    // Verifica se já existe subscription
    const existing = await registration.pushManager.getSubscription();

    if (existing) {
      console.log("📌 Já existe inscrição push:", existing);

      const json = existing.toJSON();

      // 🔥 Envia ao backend no formato correto
      await api.post("/notificacoes-push/salvar", {
        subscription: {
          endpoint: json.endpoint,
          keys: {
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
          },
        },
      });

      return existing;
    }

    // Criar uma nova subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log("🆕 Nova inscrição push gerada:", subscription);

    const json = subscription.toJSON();

    // 🔥 Envia ao backend no formato correto
    await api.post("/notificacoes-push/salvar", {
      subscription: {
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        },
      },
    });

    console.log("✅ Subscription enviada ao backend com sucesso!");

    return subscription;
  } catch (err) {
    console.error("❌ Erro ao registrar push:", err);
    return null;
  }
}
