# 📘 Módulo: Turmas

> Gerencia todas as turmas da organização, vinculando-as a instrutores (membros da equipe) e categorias.

---

## 🧱 Estrutura da Tabela `turmas`

| Campo | Tipo | Descrição |
|--------|------|-----------|
| `id` | INT | Identificador único da turma |
| `nome` | VARCHAR(100) | Nome da turma |
| `faixa_etaria` | VARCHAR(100) | Texto descritivo (ex: "Juvenil", "Adulto") |
| `organizacao_id` | INT | FK da organização (multi-org obrigatório) |
| `equipe_id` | INT | FK do instrutor responsável (`equipe.id`) |
| `idade_min` | INT | Idade mínima da turma |
| `idade_max` | INT | Idade máxima da turma |
| `categoria_id` | INT | FK da categoria (`categorias.id`) |
| `criado_em` | DATETIME | Data de criação (auto) |

---

## 🧩 Relacionamentos

- **`organizacao_id` →** `organizacoes.id`
- **`equipe_id` →** `equipe.id`
- **`categoria_id` →** `categorias.id`

Todos os registros são **isolados por organização** (`organizacao_id` obrigatório em todas as queries).

---

## 🔐 Controle de Acesso

| Papel | Permissões |
|--------|-------------|
| **admin** | Criar, editar, excluir, encerrar turmas |
| **instrutor** | Visualizar turmas e suas próprias turmas (`/minhas`) |
| **midia / loja** | Apenas leitura (listagem) |

---

## 🌐 Endpoints da API

Base: `/api/turmas`

| Método | Rota | Descrição | Permissão |
|--------|------|------------|------------|
| **GET** | `/` | Lista todas as turmas da organização | Qualquer usuário autenticado |
| **GET** | `/minhas` | Lista turmas do instrutor logado | Instrutor |
| **POST** | `/` | Cria uma nova turma | Admin |
| **PUT** | `/:id` | Atualiza dados da turma | Admin |
| **DELETE** | `/:id` | Exclui uma turma | Admin |
| **POST** | `/:id/encerrar` | Encerra turma e migra alunos | Admin |

---

## 🧠 Regras de Negócio

1. **Toda turma deve pertencer a uma organização** (`organizacao_id` vem do token JWT).
2. **Nome da turma** é obrigatório.
3. **Campo `equipe_id`** (instrutor) é opcional.
4. **Campo `categoria_id`** (categoria) é opcional, usado para relatórios e exibição pública.
5. **Faixa etária, idade mínima e máxima** são campos informativos, sem bloqueio automático.
6. Ao **encerrar uma turma**, todos os alunos são migrados para a turma de destino (`destino_id`), e a turma original é excluída.

---

## ⚙️ Fluxo Multi-Organização

1. O `verifyToken` injeta `req.usuario.organizacao_id`.
2. Todas as rotas filtram e operam com base nesse `organizacao_id`.
3. Nenhuma turma é visível entre organizações diferentes.

---

## 🧾 Logs Padronizados

| Tipo | Exemplo |
|------|----------|
| `logger.debug` | `[turmasService] Turma criada com sucesso { id, organizacaoId, nome }` |
| `logger.error` | `[turmasRepository] Erro ao atualizar turma { id, organizacaoId, erro }` |

---

## 🧱 Status Atual

✅ Banco e relacionamentos  
✅ Repository multi-org  
✅ Service padronizado  
✅ Controller e routes finalizados  
🔜 Frontend (página + form + listagem) em desenvolvimento  

---

## 🚀 Melhorias Futuras

- [ ] Filtro por categoria  
- [ ] Exibição de faixa etária calculada automaticamente  
- [ ] Vincular múltiplos instrutores por turma (tabela `turma_equipe`)  
- [ ] Exportar lista de alunos por turma em PDF/Excel  

---

© Capoeira Base – Arquitetura v2 (2025)
