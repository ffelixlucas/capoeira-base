# 📚 Módulo Turmas – Capoeira Base

## ✅ Objetivo

Fornecer listagem de turmas ativas para uso no cadastro de alunos.

As turmas são criadas automaticamente com base no cadastro de horários e associadas a um instrutor via `equipe_id`.

---

## 🔍 Rota REST disponível

### `GET /api/turmas`

Retorna lista de turmas ativas (`data_fim IS NULL`).

Exemplo de retorno:

```json
[
  {
    "id": 1,
    "nome": "Turma Juvenil",
    "faixa_etaria": "12 a 15 anos",
    "equipe_id": 7
  }
]
🧱 Estrutura da Tabela turmas
Campo	Tipo	Descrição
id	INT (PK)	Identificador da turma
nome	VARCHAR	Nome da turma (ex: Infantil)
faixa_etaria	VARCHAR	Faixa etária estimada
equipe_id	INT (FK)	Instrutor responsável
criado_em	DATETIME	Data de criação
data_fim	DATETIME	(futuro) fim de validade da turma

🔐 Acesso
Rota pública (sem JWT)

Utilizada exclusivamente para exibir opções no cadastro de alunos

✅ Status
 Rota funcional

 Documentada

 Testada via Postman e frontend