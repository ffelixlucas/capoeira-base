# 🗒️ Módulo Notas Internas do Instrutor – Capoeira Base

## ✅ Objetivo

Permitir que instrutores e administradores registrem **anotações privadas** por aluno, visíveis apenas por quem escreveu ou por um admin.

---

## 🔐 Regras de Acesso

| Papel       | Visualiza | Cria | Remove |
|-------------|-----------|------|--------|
| `instrutor` | ✅ suas    | ✅   | ✅ suas |
| `admin`     | ✅ todas   | ✅   | ✅ todas |

---

## 📦 Endpoints REST

### 🔍 Listar notas do aluno
`GET /api/notas-aluno/:alunoId`  
🔒 JWT obrigatório

### ➕ Criar nova nota
`POST /api/notas-aluno/:alunoId`  
Body:
```json
{ "texto": "Aluno muito dedicado" }
🗑️ Excluir nota
DELETE /api/notas-aluno/:id
🔒 Só quem criou ou admin

🧠 Validações
Texto é obrigatório

Apenas quem criou pode remover (exceto admin)

Aluno precisa existir

Segurança com verifyToken

🧱 Tabela notas_aluno
Campo	Tipo	Descrição
id	INT (PK)	ID único da nota
aluno_id	INT (FK)	Relaciona com alunos(id)
equipe_id	INT (FK)	Autor da nota (quem logou)
texto	TEXT	Conteúdo da anotação
criado_em	DATETIME	Data de criação automática

🧩 Integração com Frontend
Hook useNotasAluno.js

Componente NotasAluno.jsx

Integração via ModalAluno.jsx

Toasts de sucesso/erro

✅ Status
 Tabela validada

 Backend funcional

 Testado via frontend

 Com controle de acesso

 Documentação finalizada

