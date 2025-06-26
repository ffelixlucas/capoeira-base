✅ Controle de Exibição por Permissão (RBAC – Frontend)
As interfaces administrativas agora respeitam o papel do usuário logado, ocultando automaticamente itens do menu e botões de acesso rápido com base no papel atribuído.

🔒 Implementações aplicadas:
LayoutAdmin.jsx:

Menus como "Horários" só aparecem se o usuário tiver o papel admin ou instrutor.

Dashboard.jsx:

Os botões de acesso rápido (ex: "Mensalidades", "Loja") são renderizados com base no papel do usuário, por meio da função temPapel do hook usePermissao.

📌 Detalhes Técnicos:
Hook usePermissao verifica localmente os papéis da AuthContext.

Exemplo de uso:

js
Copiar
Editar
temPapel(["admin", "midia"])
Oculta ou exibe elementos com base nas permissões do usuário.

🛡️ Impacto:
Evita que usuários vejam rotas não autorizadas.

Garante uma navegação visual limpa e contextualizada.

