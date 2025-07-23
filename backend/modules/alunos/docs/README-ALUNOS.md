
# 🧾 README – Módulo Alunos

## 🎯 Objetivo

Gerenciar os alunos de forma segura e flexível, permitindo:

- Cadastro de dados pessoais e médicos
- Troca de turmas com histórico
- Controle de presença (frequência)
- Anotações internas por instrutores
- Permissões diferentes para admin e instrutor

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
```

### ✏️ Editar aluno
`PUT /api/alunos/:id`

### 🗑️ Excluir aluno
`DELETE /api/alunos/:id` *(apenas admin)*

### 🔁 Trocar aluno de turma
`PUT /api/alunos/:id/trocar-turma`
```json
{ "nova_turma_id": 3 }
```

---

## 🧩 Funcionamento da Matrícula

- A troca de turma encerra a matrícula anterior (`data_fim = hoje`)
- O sistema cria uma nova matrícula (`data_inicio = hoje`)
- A consulta sempre busca a matrícula com `data_fim IS NULL`

---

## 🚦 Validações obrigatórias

- `nome` é obrigatório
- `turma_id` deve existir
- Não permite cadastro sem matrícula
- Apenas admin pode excluir alunos

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

## ✅ Status: FUNCIONAL
- Estrutura profissional e modular
- Segurança aplicada (JWT + RBAC)
- Pronto para integração com frequência e observações
