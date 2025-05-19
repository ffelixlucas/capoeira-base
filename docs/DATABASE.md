# Modelagem de Banco de Dados – Capoeira Base

Este documento define a estrutura do banco de dados relacional utilizado no projeto.

---

## Tabelas

### `usuarios`

| Campo       | Tipo           | Observação                      |
|-------------|----------------|----------------------------------|
| id          | INT (PK)       | auto_increment                  |
| nome        | VARCHAR(100)   |                                |
| email       | VARCHAR(150)   | login único                    |
| senha_hash  | VARCHAR(255)   | hash com bcrypt                |
| role        | ENUM           | 'admin', 'assistente'          |
| criado_em   | DATETIME       | timestamp                      |

---

### `alunos`

| Campo         | Tipo          | Observação                       |
|---------------|---------------|----------------------------------|
| id            | INT (PK)      | auto_increment                   |
| nome          | VARCHAR(100)  |                                  |
| apelido       | VARCHAR(100)  | apelido de capoeira              |
| idade         | INT           | opcional                         |
| data_entrada  | DATE          |                                  |
| ativo         | BOOLEAN       | padrão: true                     |
| criado_por    | INT (FK)      | referência ao usuário            |

---

### `mensalidades`

| Campo          | Tipo        | Observação                       |
|----------------|-------------|----------------------------------|
| id             | INT (PK)    | auto_increment                   |
| aluno_id       | INT (FK)    | aluno correspondente             |
| mes_referente  | VARCHAR(7)  | formato '2024-05'                |
| valor          | DECIMAL     | exemplo: 80.00                   |
| status         | ENUM        | 'pago', 'pendente'               |
| data_pagamento | DATE        | opcional                         |
| criado_por     | INT (FK)    | usuário que lançou               |

---

### `galeria`

| Campo       | Tipo          | Observação                        |
|-------------|---------------|-----------------------------------|
| id          | INT (PK)      | auto_increment                    |
| titulo      | VARCHAR(100)  | opcional                          |
| imagem_url  | TEXT          | URL da imagem                     |
| ordem       | INT           | ordem de exibição                 |
| criado_em   | DATETIME      |                                   |
| criado_por  | INT (FK)      | referência ao usuário             |

---

### `audit_log`

| Campo      | Tipo          | Observação                         |
|------------|---------------|------------------------------------|
| id         | INT (PK)      | auto_increment                     |
| usuario_id | INT (FK)      | quem fez a ação                    |
| acao       | VARCHAR(100)  | descrição simples ("Criou aluno") |
| detalhe    | TEXT          | JSON ou descrição opcional         |
| data_hora  | DATETIME      |                                   |
