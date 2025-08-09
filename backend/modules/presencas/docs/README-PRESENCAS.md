# 📋 Módulo Presenças

## 📌 Descrição e Objetivo
O módulo **Presenças** é responsável pelo controle de frequência dos alunos por turma e data.  
Permite registrar presenças e faltas, editar registros e gerar relatórios consolidados por período.

---

## 🛠 Tecnologias Utilizadas
- **Backend:** Node.js + Express + MySQL
- **Autenticação:** JWT
- **Controle de Acesso (RBAC):** Admin e Instrutor
- **Banco de Dados:** Tabelas `presencas`, `turmas`, `alunos`

---

## 🧩 Funcionalidades

### 1. CRUD de Presenças
- **Create/Update (Batch)**  
  - Endpoint: `POST /api/presencas/batch`
  - Recebe `turma_id`, `data` e `itens` com `{ aluno_id, status }`.
  - **Validação:** Todos os alunos enviados devem pertencer à turma informada.
  - **RBAC:** Instrutor só pode registrar presenças das turmas que gerencia.

- **Read (Listar por Turma e Data)**  
  - Endpoint: `GET /api/presencas?turma_id=ID&data=YYYY-MM-DD`
  - Lista alunos da turma e seus status na data informada.

- **Update (Individual)**  
  - Endpoint: `PUT /api/presencas/:id`
  - Atualiza `status` e/ou `observacao` de um registro específico.

### 2. Relatório Consolidado
- **Endpoint:** `GET /api/presencas/relatorio?inicio=YYYY-MM-DD&fim=YYYY-MM-DD`
- **Retorno:**  
  ```json
  {
    "inicio": "2025-08-01",
    "fim": "2025-08-09",
    "turmas": [
      {
        "turma_id": 4,
        "turma_nome": "Turma Infantil",
        "presentes": 0,
        "faltas": 1,
        "total": 1,
        "taxa_presenca": 0
      }
    ]
  }
````

* **RBAC:**

  * **Admin:** vê todas as turmas.
  * **Instrutor:** vê apenas as turmas que gerencia (`turmas.equipe_id` = seu id).

---

## 🔄 Fluxo de Funcionamento

1. Admin ou Instrutor acessa a tela de registro de presenças.
2. Escolhe **turma** e **data**.
3. Marca cada aluno como `presente` ou `falta`.
4. Envio em lote via `POST /batch` salva ou atualiza registros.
5. O `GET` lista presenças registradas para conferência.
6. O relatório consolidado (`/relatorio`) pode ser gerado para períodos maiores.

---

## 🔐 Regras de Negócio

* **Não é permitido** inserir presença de aluno fora da turma.
* **Instrutor** só pode registrar e visualizar presenças das suas turmas.
* **Admin** tem acesso irrestrito a todas as turmas.

---

## ✅ Status Atual

* [x] CRUD de presenças funcional.
* [x] Validação de turma no batch.
* [x] Relatório consolidado por período implementado.
* [x] Erros retornam status HTTP corretos.
* [ ] Tela frontend mobile-first para relatório consolidado.
* [ ] Exportação CSV/Excel no admin.

---

## 🚀 Melhorias Futuras

* [ ] Implementar tela otimizada para “tirar faltas” no mobile.
* [ ] Adicionar filtros e busca no relatório consolidado.
* [ ] Gerar PDF/Excel diretamente no backend.
* [ ] Gráficos de presença por turma.

---

```

---

