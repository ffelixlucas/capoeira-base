# 📅 Módulo Agenda – Frontend (Admin)

## ✅ Objetivo

Este módulo é responsável por permitir que os administradores cadastrem, editem, visualizem e excluam **eventos (Agenda)** no painel administrativo.  
Ele consome os endpoints do backend `/api/agenda` e está diretamente ligado ao que será exibido na **Landing Page pública**.

---

## **🏗️ Estrutura**

### **Página Principal: `Agenda.jsx`**
- Mostra o título "Gerenciar Agenda".
- Usa o **hook `useAgenda`** para listar os eventos.
- Mostra os eventos no **Carrossel** (um por vez).
- Permite abrir o **ModalEvento** para criar ou editar um evento.

---

### **📂 Componentes do módulo (`/components/agenda`)**

1. **Carrossel.jsx**  
   - Exibe os eventos **um por vez** com setas de navegação.  
   - Usa o `Item.jsx` para renderizar o card do evento.

2. **Item.jsx**  
   - Card do evento com título, data, descrição curta e botões:  
     - **Editar** → abre ModalEvento com os dados.  
     - **Excluir** → remove o evento.  
     - **Ver mais informações** → mostra `Detalhe.jsx`.  
     - Clicar na imagem → abre `ImageModal.jsx`.

3. **Detalhe.jsx**  
   - Exibe a **descrição completa** e mais detalhes do evento.
   - Aparece dentro do `Item.jsx` quando expandido.

4. **Lista.jsx** *(não usado ainda)*  
   - Lista de eventos em grade.  
   - Futuro: pode ser usado em telas de listagem.

5. **Preview.jsx**  
   - Exibe uma pré-visualização de como ficará o card do evento durante o preenchimento do formulário.  
   - Usa o `Item.jsx`.

6. **Form.jsx**  
   - Formulário de cadastro/edição:  
     - Campos: título, descrições, datas, local, imagem, inscrição obrigatória etc.  
     - Ao salvar → chama backend (`criarEvento` ou `atualizarEvento`).

7. **ModalEvento.jsx**  
   - Modal que encapsula o `Form.jsx`.  
   - Tem botão de fechar (X).

8. **ImageModal.jsx**  
   - Exibe imagem do evento em tela cheia quando clicada.

---

## **🔗 Fluxo de uso**

1. O admin acessa **Agenda.jsx**.  
2. O hook `useAgenda` carrega os eventos do backend (`GET /api/agenda`).  
3. Os eventos são exibidos no **Carrossel** (um por vez).  
4. O usuário pode:  
   - **Criar evento:** clicar "+ Novo Evento" → abre Modal com Form.  
   - **Editar evento:** clicar ✏️ no card → abre Modal com dados carregados.  
   - **Excluir evento:** clicar 🗑️ no card → remove evento.  
   - **Ver mais:** expandir detalhes no card.  
   - **Clicar na imagem:** abre ImageModal.  

---

## **🛠️ Integração com Backend**

- **Listar eventos:** `GET /api/agenda`  
- **Criar evento:** `POST /api/agenda` ou `POST /api/agenda/upload-imagem`  
- **Atualizar evento:** `PUT /api/agenda/:id`  
- **Excluir evento:** `DELETE /api/agenda/:id`

> Todos os métodos utilizam o token JWT no `Authorization: Bearer`.

---

## **🚀 Melhorias Futuras**
- Adicionar filtros (eventos futuros, passados, com inscrição obrigatória).
- Paginação no Carrossel (se muitos eventos).
- Usar `Lista.jsx` para visualização em grid.
- Implementar loading com spinner customizado.
- Criar página de **gerenciamento de inscrições** ligada a cada evento.

---

## **📜 Documento**
**Local:** `/frontend/admin-vite/docs/README-AGENDA.md`  
**Status:** Funcional, refatorado e documentado.  