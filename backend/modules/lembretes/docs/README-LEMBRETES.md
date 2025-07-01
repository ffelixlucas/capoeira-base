# ✅ Módulo Lembretes (To-do List) – Capoeira Base

## 💪 Objetivo

Criar um sistema funcional e leve de lembretes internos para a equipe administrativa, 100% focado em uso mobile mas adaptável ao desktop.

## 🌐 Visão Geral

* Permite registrar, editar, concluir e excluir lembretes internos.
* Ajuda na organização de tarefas pendentes (ex: "levar caixa de som").
* Permite priorizar tarefas por cor (baixa, média, alta).

## 🔹 Tabela `lembretes`

```sql
CREATE TABLE lembretes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  prioridade ENUM('baixa', 'media', 'alta') DEFAULT 'baixa',
  status ENUM('pendente', 'feito') DEFAULT 'pendente',
  data DATE,
  criado_por INT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔹 API REST Backend

| Verbo  | Rota                             | Ação                      |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/api/lembretes`                 | Listar todos os lembretes |
| GET    | `/api/lembretes?status=pendente` | Listar apenas pendentes   |
| POST   | `/api/lembretes`                 | Criar lembrete            |
| PUT    | `/api/lembretes/:id`             | Editar lembrete           |
| DELETE | `/api/lembretes/:id`             | Excluir lembrete          |

> Protegido por `verifyToken` e `checkRole(['admin', 'instrutor'])` quando aplicável.

## 🔹 Frontend (Admin)

### Componentes React:

```
src/components/lembretes/
├── ModalLembretes.jsx     // modal central com scroll
├── LembreteCard.jsx       // item individual com cor e risco
├── LembreteForm.jsx       // criar/editar lembrete
├── LembreteLista.jsx      // lista geral no modal
```

### Hook:

`useLembretes.js` → controlar CRUD, loading e estado local.

### Service:

`lembretesService.js` → comunicação com a API REST.

### Comportamento UX:

* ✅ Pendentes: texto normal, prioridade com cor (sem cor, amarela, vermelha).
* ✔️ Feitos: texto com `line-through` e opacidade menor. (admin e instrutores)
* ➕ Criar: botão verde flutuante no modal. (admin e instrutores)
* ✏️ Editar: caneta (visível apenas se admin e instrutores).
* ❌ Excluir: lixeira (apenas se admin).

## 🔹 Integração com Dashboard

* Mostra apenas o **número de lembretes pendentes**.
* Ao clicar, abre o `ModalLembretes` com todos os lembretes organizados por prioridade > data.

## ⚡ Acessibilidade e Mobile

* 100% mobile-first (scroll vertical suave no modal).
* Foco no `input` ao abrir `LembreteForm`.
* Botões responsivos e acessíveis (aria-labels).
* Modal fecha com ESC ou clique fora.

## 🔹 Permissões (RBAC)

| Papel     | Ver | Criar | Editar | Excluir |
| --------- | --- | ----- | ------ | ------- |
| admin     | ✅   | ✅     | ✅      | ✅       |
| instrutor | ✅   | ✅     | ✅      | ❌       |
| outros    | ❌   | ❌     | ❌      | ❌       |

## 🌟 Melhorias Futuras

* [ ] Marcar como "feito" por gesto (drag ou swipe).
* [ ] Filtros por categoria/etiqueta.
* [ ] Log de quem concluiu a tarefa.
* [ ] Permitir comentários em lembretes.

## ✅ Status

* [x] Banco criado
* [x] Backend iniciado
* [ ] Frontend em planejamento
* [x] Documentação inicial definida
