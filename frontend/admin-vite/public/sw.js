self.addEventListener("install", (event) => {
    console.log("Service Worker instalado");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("Service Worker ativado");
    return self.clients.claim();
  });
  
  // Placeholder — aqui depois vamos adicionar push notifications
  self.addEventListener("push", (event) => {
    const data = event.data?.json() || {};
    const title = data.title || "Capoeira Base";
    const body = data.body || "";
    
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png"
      })
    );
  });
  