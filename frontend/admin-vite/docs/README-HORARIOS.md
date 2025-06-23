# 📅 Módulo Horários

## 🔥 Descrição
Módulo responsável pela gestão dos horários de aula do projeto Capoeira Base. Permite cadastrar, listar, editar, excluir e **alterar a ordem de exibição** dos horários.

---

## 🚀 Funcionalidades
- ✅ CRUD completo de horários
- ✅ Gestão de ordem de exibição (subir/descer)
- ✅ Validação de campos obrigatórios
- ✅ Feedback visual (toast) e carregamento
- ✅ UX mobile-first otimizada

---

## 🏗️ Tecnologias utilizadas
- Frontend: React + TailwindCSS + Axios + React Toastify
- Backend: Node.js + Express + MySQL + JWT
- Outros: Nodemon, dotenv, cors

---

## 📂 Componentes
### Frontend
- **Page:** `Horarios.jsx`
- **Components:** 
  - `HorarioForm.jsx`
  - `HorarioList.jsx`
- **Hook:** 
  - `useHorarios.js`
- **Service:** 
  - `horariosService.js`

### Backend
- **Rotas:** `horariosRoutes.js`
- **Controller:** `horariosController.js`
- **Service:** `horariosService.js`
- **Repository:** `horariosRepository.js`

---

## 🔄 Fluxo de funcionamento
- Usuário acessa a tela de horários.
- Pode criar, editar, excluir e alterar a ordem dos horários.
- A alteração de ordem aciona a rota específica `/api/horarios/atualizar-ordem`.
- Todos os dados são persistidos no banco de dados MySQL.

---

## 🔗 Relação com a página pública
A ordem de exibição dos horários pode ser refletida diretamente na página pública, respeitando o campo `ordem`.

---

## 🚀 Melhorias futuras
- [ ] Implementar filtro por faixa etária
- [ ] Paginação (se necessário)
- [ ] Modal de confirmação mais sofisticado
- [ ] Edição inline (sem abrir form separado)
- [ ] Campo de descrição opcional por horário

---

## 📌 Status atual
✔️ **100% funcional, testado e documentado.**
