# 🏫 Módulo Turmas – Capoeira Base

## ✅ Objetivo

Fornecer a listagem de turmas ativas para uso no **cadastro de alunos**.

> ⚠️ As turmas são gerenciadas manualmente pelo administrador e associadas diretamente a um instrutor via `equipe_id`.

---

## 🔍 Rota REST Disponível

### `GET /api/turmas`

Retorna a lista de turmas ativas.

> **Sem autenticação (rota pública)**  
> Utilizada exclusivamente para exibir opções no formulário de alunos.

#### 📥 Exemplo de retorno:

```json
[
  {
    "id": 1,
    "nome": "Turma Juvenil",
    "faixa_etaria": "12 a 15 anos",
    "equipe_id": 7,
    "nome_instrutor": "Fulano da silva"
  }
]
🧱 Estrutura da Tabela turmas
Campo	Tipo	Descrição
id	INT (PK)	Identificador único da turma
nome	VARCHAR	Nome da turma (ex: Infantil)
faixa_etaria	VARCHAR	Faixa etária estimada
equipe_id	INT (FK)	ID do instrutor responsável
criado_em	DATETIME	Data de criação automática

🧩 No futuro:
Campo data_fim poderá ser adicionado para marcar término da validade da turma.

🔐 Controle de Acesso
Ação	Acesso exigido
GET	Público
POST	🔒 Apenas admin
PUT	🔒 Apenas admin
DELETE	🔒 Apenas admin

🧩 Relacionamentos
Cada turma está vinculada a um instrutor via equipe_id.

A listagem já retorna o campo nome_instrutor automaticamente via JOIN.

🚀 Status
Item	Status
Rota GET	✅ Pronta
Testado via API	✅ Postman / Frontend
Segurança	✅ Middleware aplicado no backend
Documentação	✅ Finalizada

📂 Local
/backend/modules/turmas/