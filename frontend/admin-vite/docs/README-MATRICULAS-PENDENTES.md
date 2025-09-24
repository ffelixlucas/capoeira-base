
# 🧾 README – Módulo Matrículas Pendentes

## 🎯 Descrição e Objetivo
O módulo **Matrículas Pendentes** tem como objetivo:
- Centralizar a gestão de pré-matrículas recebidas via formulário público.  
- Permitir que apenas **admins** visualizem, aprovem ou rejeitem essas solicitações.  
- Garantir que alunos com status **pendente** não apareçam na listagem geral de alunos até aprovação.

---

## 🏗️ Estrutura Backend

### **Tabela `alunos`**
- Novo campo relevante: **status**
  - `"pendente"` → matrícula aguardando aprovação.  
  - `"ativo"` → aluno confirmado, aparece na lista principal.  
  - `"inativo"` → aluno rejeitado/excluído.  

### 📜 Endpoints REST/API
| Método | Endpoint                        | Descrição                                    | Acesso   |
|--------|---------------------------------|----------------------------------------------|----------|
| POST   | `/api/public/matricula`         | Cria novo aluno como **pendente**            | Público  |
| GET    | `/api/alunos/pendentes`         | Lista alunos pendentes                        | Admin    |
| GET    | `/api/alunos/pendentes/count`   | Retorna contador de pendentes                 | Admin    |
| PATCH  | `/api/alunos/:id/status`        | Atualiza status para **ativo** ou **inativo** | Admin    |

### 🔥 Fluxo Backend
1. **Formulário público** (`/public/matricula`) cria aluno → `status = pendente`.  
2. **Admin** acessa `/alunos/pendentes` para listar e aprovar/rejeitar.  
3. **Aprovar** → `PATCH /alunos/:id/status { "status": "ativo" }`.  
4. **Rejeitar** → `PATCH /alunos/:id/status { "status": "inativo" }`.  
5. Somente **alunos ativos** aparecem em `/alunos`.

---

## 🎨 Estrutura Frontend

### 📂 Pastas
```

src/
├─ pages/
│   └─ Alunos.jsx              # Página principal com botão pendentes (admin)
│
├─ components/alunos/
│   ├─ ModalPendentes.jsx      # Modal de listagem e ações de pendentes
│   └─ ModalAluno.jsx          # Ficha completa (usada também para pendentes)
│
├─ hooks/
│   └─ usePendentes.js         # Hook para buscar/aprovar/rejeitar pendentes

```

### 📌 Fluxo UX (Frontend)

#### 👨‍💼 Admin
- Vê botão **“Matrículas Pendentes”** com contador.  
- Ao clicar → abre **ModalPendentes**.  
- Lista mostra nome, apelido, contato e e-mail.  
- Ao clicar em um item → abre **ficha completa** (`ModalAluno`).  
- Pode:
  - ✔️ Aprovar → aluno passa a `ativo`, some do modal e entra na lista principal.  
  - ❌ Rejeitar → aluno passa a `inativo` e some de vez.  
- Contador e lista principal atualizam instantaneamente.  

#### 👨‍🏫 Instrutor
- Não vê botão nem modal.  
- Nunca tem acesso a pendentes.  

---

## 🖌️ UX/UI
- **Mobile-first:** modal ocupa tela cheia no celular.  
- **Desktop:** modal centralizado, altura 80vh, com scroll interno.  
- **Feedback visual:** toasts para aprovar/rejeitar com sucesso ou erro.  
- **Atualização instantânea:** lista e contador sincronizados após ações.  

---

## 🚀 Status Atual
- ✔️ Backend: endpoints implementados (`pendentes`, `status`, contador).  
- ✔️ Frontend: botão exclusivo admin + modal funcional.  
- ✔️ Fluxo: aprovar/rejeitar → sincroniza lista e contador.  
- ✔️ Ficha de pendente abre sem métricas de presença.  
- 🔒 Instrutores não têm acesso.

---

## 🔮 Melhorias Futuras
- [ ] Spinner de loading nos botões ✔️/❌.  
- [ ] Toasts mais descritivos (“Aluno movido para ativos”).  
- [ ] Paginação em `/alunos/pendentes` para grandes volumes.  
- [ ] Possível integração com **pagamento** para confirmar matrícula.  
- [ ] Upload de documentos (RG, CPF, comprovante) junto da matrícula pública.  

---

**Local:** `/frontend/docs/README-MATRICULAS-PENDENTES.md`  
**Versão:** 1.0 – **Status:** ✅ Finalizado (pendentes funcionando em produção)
```
