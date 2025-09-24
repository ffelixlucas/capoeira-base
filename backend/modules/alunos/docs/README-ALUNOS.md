
# 🧾 README – Módulo Alunos

## 🎯 Objetivo

Gerenciar os alunos de forma segura e flexível, permitindo:

- Cadastro de dados pessoais e médicos
- Troca de turmas com histórico
- Controle de presença (frequência)
- Anotações internas por instrutores
- Permissões diferentes para admin e instrutor
- Aprovação e rejeição de matrículas públicas

---

## 🧱 Tabelas Relacionadas

- `alunos`
- `matriculas`
- `turmas`
- `frequencia`
- `notas_aluno`

---

## 🔐 Permissões (RBAC)

| Papel       | Acesso                            |
|-------------|-----------------------------------|
| `admin`     | Acesso total a todos os dados     |
| `instrutor` | Somente aos seus alunos e turmas  |

---

## 📦 Endpoints

### 🔍 Listar todos os alunos
`GET /api/alunos`  
- Retorna alunos com turma atual
- Admin: todos
- Instrutor: apenas seus

### 🔍 Buscar aluno por ID
`GET /api/alunos/:id`

### ➕ Cadastrar novo aluno
`POST /api/alunos`
```json
{
  "nome": "Lucas",
  "apelido": "Luquinha",
  "nascimento": "2015-02-01",
  "telefone_responsavel": "41999999999",
  "nome_responsavel": "Mãe",
  "endereco": "Rua A",
  "graduacao": "corda azul",
  "observacoes_medicas": "asmático",
  "foto_url": "https://...jpg",
  "turma_id": 2,
  "criado_por": 1
}
````

### ✏️ Editar aluno

`PUT /api/alunos/:id`

### 🗑️ Excluir aluno

`DELETE /api/alunos/:id` *(apenas admin)*

### 🔁 Trocar aluno de turma

`PUT /api/alunos/:id/trocar-turma`

```json
{ "nova_turma_id": 3 }
```

### 🔔 Contar alunos pendentes

`GET /api/alunos/pendentes/count` *(apenas admin)*
Retorna a quantidade de alunos aguardando aprovação.

```json
{ "count": 3 }
```

### 📋 Listar alunos pendentes

`GET /api/alunos/pendentes` *(apenas admin)*
Retorna lista detalhada de alunos em `status = pendente`.

```json
[
  {
    "id": 19,
    "nome": "Aluno Infantil",
    "apelido": null,
    "telefone_responsavel": "41999999999",
    "email": "infantil@example.com",
    "status": "pendente"
  }
]
```

### ✅ Aprovar / ❌ Rejeitar matrícula

`PATCH /api/alunos/:id/status` *(apenas admin)*

* Aprovar matrícula → `{ "status": "ativo" }`
* Rejeitar matrícula → `{ "status": "inativo" }` (⚠️ no fluxo atual, isso **exclui o aluno** do banco)

Resposta:

```json
{ "sucesso": true }
```

---

## 🧩 Funcionamento da Matrícula

* Matrículas públicas entram como `pendente`.
* Admin aprova → aluno vira `ativo` e permanece vinculado à sua turma.
* Admin rejeita → aluno é excluído do banco.
* Troca de turma encerra a matrícula anterior (`data_fim = hoje`) e cria nova (`data_inicio = hoje`).
* Consultas sempre usam a matrícula ativa (`data_fim IS NULL`).

---

## 🚦 Validações obrigatórias

* `nome` é obrigatório
* `turma_id` deve existir
* Não permite cadastro sem matrícula
* Apenas admin pode excluir alunos
* Apenas admin pode aprovar/rejeitar pendentes

---

## 📚 Backend Estruturado

```
/modules/alunos/
├── alunosRepository.js
├── alunosService.js
├── alunosController.js
├── alunosRoutes.js
└── docs/README-ALUNOS.md
```

---

### 🗒️ Notas Internas

* Cada instrutor pode adicionar observações pessoais por aluno.
* Admin pode ver todas.
* Visível no `ModalAluno` do painel admin.

---

## ✅ Status: FUNCIONAL

* Estrutura profissional e modular
* Segurança aplicada (JWT + RBAC)
* Fluxo de aprovação de matrículas públicas validado
* Pronto para integração com frequência, observações e gestão de turmas

