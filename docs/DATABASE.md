# 🗄️ Modelagem de Banco de Dados – Capoeira Base (Atualizado)

---

## 🧠 Tabela `equipe`

| Campo         | Tipo           | Observação                                 |
|----------------|----------------|---------------------------------------------|
| id             | INT (PK)       | auto_increment                             |
| nome           | VARCHAR(100)   | Nome completo                              |
| telefone       | VARCHAR(20)    | Opcional                                   |
| whatsapp       | VARCHAR(20)    | Opcional                                   |
| email          | VARCHAR(100)   | Opcional (usado para login)                |
| status         | VARCHAR(20)    | Default: 'ativo'                           |
| observacoes    | TEXT           | Observações gerais                         |
| senha_hash     | VARCHAR(255)   | Hash da senha (para login)                 |
| criado_em      | DATETIME       | Default CURRENT_TIMESTAMP                  |
| atualizado_em  | DATETIME       | Atualiza automaticamente em alterações     |

---

## 🏷️ Tabela `roles`

| Campo       | Tipo           | Observação                                  |
|--------------|----------------|----------------------------------------------|
| id           | INT (PK)       | auto_increment                              |
| nome         | VARCHAR(50)    | Único (admin, instrutor, loja, etc.)        |
| descricao    | VARCHAR(255)   | Descrição opcional                          |
| criado_em    | DATETIME       | Default CURRENT_TIMESTAMP                   |

---

## 🔗 Tabela `equipe_roles`

| Campo       | Tipo      | Observação                       |
|--------------|-----------|----------------------------------|
| equipe_id    | INT (PK)  | FK para equipe                   |
| role_id      | INT (PK)  | FK para roles                    |

---

## 🔐 Tabela `permissions` *(RBAC avançado – futuro)*

| Campo       | Tipo           | Observação                               |
|--------------|----------------|-------------------------------------------|
| id           | INT (PK)       | auto_increment                           |
| nome         | VARCHAR(100)   | Único                                     |
| descricao    | VARCHAR(255)   | Descrição opcional                        |
| criado_em    | DATETIME       | Default CURRENT_TIMESTAMP                 |

---

## 🔗 Tabela `role_permissions` *(RBAC avançado – futuro)*

| Campo           | Tipo      | Observação                      |
|-----------------|-----------|---------------------------------|
| role_id         | INT (PK)  | FK para roles                   |
| permission_id   | INT (PK)  | FK para permissions             |

---

## 🕒 Tabela `horarios_aula`

| Campo                | Tipo               | Observação                            |
|----------------------|--------------------|----------------------------------------|
| id                   | BIGINT (PK)        | auto_increment                         |
| turma                | VARCHAR(50)        | Nome da turma                          |
| dias                 | VARCHAR(100)       | Dias da semana                         |
| horario              | VARCHAR(50)        | Ex.: 19:00–20:00                       |
| faixa_etaria         | VARCHAR(100)       | Faixa etária (ex.: 5 a 10 anos)        |
| ordem                | INT                | Ordem de exibição                      |
| instrutor            | VARCHAR(255)       | (Antigo – será migrado para equipe)    |
| whatsapp_instrutor   | VARCHAR(20)        | (Antigo – será migrado para equipe)    |

---

## 🖼️ Tabela `galeria`

| Campo       | Tipo           | Observação                                |
|--------------|----------------|--------------------------------------------|
| id           | INT (PK)       | auto_increment                            |
| titulo       | VARCHAR(100)   | Opcional                                  |
| legenda      | TEXT           | Opcional                                  |
| imagem_url   | TEXT           | URL da imagem                             |
| ordem        | INT            | Ordem de exibição                         |
| criado_em    | DATETIME       | Default CURRENT_TIMESTAMP                 |
| criado_por   | INT (FK)       | FK para equipe (quem subiu a imagem)      |

---

## 📅 Tabela `agenda`

| Campo               | Tipo            | Observação                               |
|---------------------|-----------------|-------------------------------------------|
| id                  | INT (PK)        | auto_increment                           |
| titulo              | VARCHAR(100)    | Nome do evento                           |
| descricao_curta     | VARCHAR(200)    | Curta (exibida na landing)               |
| descricao_completa  | TEXT            | Descrição detalhada                      |
| local               | VARCHAR(200)    | Bairro ou local                          |
| endereco            | VARCHAR(255)    | Endereço completo (opcional)             |
| telefone_contato    | VARCHAR(20)     | Opcional                                 |
| data_inicio         | DATETIME        | Início do evento                         |
| data_fim            | DATETIME        | Término (opcional)                       |
| imagem_url          | TEXT            | Banner ou foto do evento (opcional)      |
| criado_em           | DATETIME        | Default CURRENT_TIMESTAMP                |
| criado_por          | INT (FK)        | FK para equipe (quem criou)              |

---

## 🚫 Tabela `usuarios` (LEGADO - OBSOLETA)

| ⚠️ Observação: Esta tabela não será mais utilizada. Está sendo substituída pela tabela `equipe` com controle de `roles` e `permissions`.

---

## 🔥 Status da Modelagem

- ✅ Modelagem atualizada e validada.
- ✅ Tabelas alinhadas ao backend com arquitetura modular.
- ✅ Prontas para expansão futura (permissions, RBAC completo, gestão de alunos, loja, aulas online).

---

