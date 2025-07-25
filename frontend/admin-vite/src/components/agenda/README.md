# 🗂️ Componentes do Módulo Agenda

Este diretório concentra todos os componentes relacionados à **gestão de eventos (Agenda)**.

---

## **1️⃣ Carrossel.jsx**
- Exibe os eventos **um por vez** com botões de navegação (anterior/próximo).
- Utiliza o componente `Item.jsx` internamente para renderizar cada evento.
- Usado na tela principal de **Agenda.jsx**.

---

## **2️⃣ Item.jsx**
- Card individual de evento.
- Exibe título, data, descrição curta, imagem, local e botões de ações (editar, excluir, expandir detalhes).
- Quando o usuário clica em "Ver mais informações", mostra o `Detalhe.jsx`.
- Também chama o `ImageModal.jsx` quando clicamos na imagem do evento.

---

## **3️⃣ Detalhe.jsx**
- Exibe informações **completas** do evento (descrição longa).
- É carregado dentro do `Item.jsx` quando o evento é expandido.

---

## **4️⃣ Lista.jsx**
- Lista **vários eventos em formato de grade**.
- Usa o `Item.jsx` para cada evento.
- **(Atualmente não está em uso no Carrossel, mas pode ser usado em futuras telas de listagem.)**

---

## **5️⃣ Preview.jsx**
- Exibe um **preview do evento** (card isolado).
- Usado no `Form.jsx` enquanto você preenche os dados, para ver como ficará o card.
- Usa o `Item.jsx` internamente.

---

## **6️⃣ Form.jsx**
- Formulário de criação/edição de evento.
- Permite preencher título, descrição, datas, imagem e outros campos.
- Quando enviado, chama o backend (`criarEvento` ou `atualizarEvento`).

---

## **7️⃣ ModalEvento.jsx**
- Modal que envolve o `Form.jsx`.
- Possui o botão de fechar (X) e a lógica de abrir/fechar o formulário.

---

## **8️⃣ ImageModal.jsx**
- Mostra a **imagem do evento em tela cheia**.
- É chamado pelo `Item.jsx` quando o usuário clica na imagem.

---

## **Fluxo geral**
1. **Agenda.jsx** → usa **Carrossel.jsx**
2. **Carrossel.jsx** → renderiza **Item.jsx**
3. **Item.jsx**:
   - pode abrir **Detalhe.jsx** (mais informações)
   - pode abrir **ImageModal.jsx** (imagem em tela cheia)
4. Para criar/editar evento → abre **ModalEvento.jsx**
5. Dentro do modal → mostra **Form.jsx** + **Preview.jsx**

---

> **Dica:** Este README serve como um mapa rápido para entender a função de cada componente sem ter que abrir os arquivos.
