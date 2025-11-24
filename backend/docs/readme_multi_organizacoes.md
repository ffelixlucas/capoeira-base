# 🏗️ Capoeira Base – Módulo Multi-Organizações e Ativação de Conta

## 📘 Objetivo
Este documento descreve a arquitetura completa e o fluxo de criação automática de novas organizações no sistema **Capoeira Base**, incluindo a ativação do administrador principal e a base preparada para futuras assinaturas SaaS.

---

## 🧬 Visão Geral

Cada **organização** representa uma escola de capoeira (ex.: CN10, Capoeira Base).  
Todas compartilham o mesmo código e banco de dados, mas cada uma possui:

- seus **usuários** (admin, instrutores, mídias, etc.);
- seus **dados isolados** (alunos, eventos, inscrições, etc.);
- seu **slug exclusivo** (ex.: `cn10`, `capoeira-base`).

O sistema é **multi-tenant real**:  
cada requisição é filtrada por `organizacao_id`, garantindo isolamento total de dados.

---

## 🧉 Estrutura de Banco de Dados

### 1. Tabela `organizacoes`
Define os dados da organização (cliente SaaS).

```sql
CREATE TABLE organizacoes (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  nome_fantasia VARCHAR(150) DEFAULT NULL,
  slug VARCHAR(100) DEFAULT NULL,
  documento VARCHAR(20) DEFAULT NULL,
  email VARCHAR(150) NOT NULL,
  telefone VARCHAR(30) DEFAULT NULL,
  pais VARCHAR(50) DEFAULT NULL,
  estado VARCHAR(50) DEFAULT NULL,
  cidade VARCHAR(100) DEFAULT NULL,
  endereco VARCHAR(200) DEFAULT NULL,
  idioma VARCHAR(10) DEFAULT 'pt-BR',
  status ENUM('ativo','suspenso') DEFAULT 'ativo',
  criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  grupo VARCHAR(150) DEFAULT NULL,
  plano VARCHAR(50) DEFAULT 'free',
  status_assinatura ENUM('trial','ativo','suspenso') DEFAULT 'trial',
  data_inicio_assinatura DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_fim_trial DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Campos adicionados recentemente:**
| Campo | Tipo | Descrição |
|-------|------|------------|
| `plano` | VARCHAR(50) | Define o tipo de plano (ex.: `free`, `pro`, `premium`). |
| `status_assinatura` | ENUM | Estado da assinatura: `trial`, `ativo`, `suspenso`. |
| `data_inicio_assinatura` | DATETIME | Data de início do plano ou período trial. |
| `data_fim_trial` | DATETIME | Data de expiração do trial, se aplicável. |

---

### 2. Tabela `equipe`
Gerencia os usuários com acesso ao sistema (admin, instrutores, etc.).

```sql
CREATE TABLE equipe (
  id INT NOT NULL AUTO_INCREMENT,
  organizacao_id INT DEFAULT NULL,
  grupo_id INT DEFAULT NULL,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) DEFAULT NULL,
  whatsapp VARCHAR(20) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  funcao VARCHAR(100) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'ativo',
  observacoes TEXT,
  senha_hash VARCHAR(255) DEFAULT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  visivel_no_painel TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Observações:**
- O campo `organizacao_id` é essencial para o isolamento multi-org.  
- O **administrador principal** da organização é criado automaticamente após ativação de conta.

---

### 3. Tabela `ativacoes_conta`
Gerencia tokens de ativação de conta (para novos admins ou redefinições futuras).

```sql
CREATE TABLE ativacoes_conta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizacao_id INT NOT NULL,
  email VARCHAR(150) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expiracao DATETIME NOT NULL,
  usado TINYINT(1) DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizacao_id) REFERENCES organizacoes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

| Campo | Tipo | Descrição |
|--------|------|------------|
| `organizacao_id` | INT | ID da organização recém-criada. |
| `email` | VARCHAR(150) | E-mail do responsável pela conta. |
| `token` | VARCHAR(255) | Token único (UUID ou JWT). |
| `expiracao` | DATETIME | Data e hora limite para ativação (ex.: +2h). |
| `usado` | TINYINT | 0 = pendente / 1 = já utilizado. |
| `criado_em` | DATETIME | Data de geração do token. |

---

## 🔁 Fluxo de Criação de Nova Organização

### 1️⃣ `/registrar` (rota pública)
**Frontend** → formulário com:
- Nome da organização
- Nome do responsável
- E-mail
- Telefone

**Backend**:
1. Cria registro em `organizacoes`.
2. Gera token UUID.
3. Salva token em `ativacoes_conta`.
4. Envia e-mail com link de ativação:
   ```
   https://app.capoeirabase.com/ativar-conta?token=abc123
   ```

---

### 2️⃣ `/ativar-conta`
**Frontend:**
- O link abre um formulário com:
  - Nome do usuário
  - Senha
  - Confirmar senha

**Backend:**
1. Valida token (verifica expiração e se não foi usado).
2. Cria o usuário administrador principal na tabela `equipe`:
   ```sql
   INSERT INTO equipe (organizacao_id, nome, email, telefone, funcao, senha_hash, status)
   VALUES (?, ?, ?, ?, 'Administrador', ?, 'ativo');
   ```
3. Atualiza `usado = 1` em `ativacoes_conta`.
4. Retorna JWT e redireciona para `/admin/{slug}`.

---

## ⚙️ Exemplo prático

**1. Criação da organização:**
```sql
INSERT INTO organizacoes (nome, nome_fantasia, slug, email, telefone)
VALUES ('Lucas Fanha', 'Capoeira Base', 'capoeira-base', 'lucas.fafx@gmail.com', '41999644302');
```

**2. Criação de token de ativação:**
```sql
INSERT INTO ativacoes_conta (organizacao_id, email, token, expiracao)
VALUES (LAST_INSERT_ID(), 'lucas.fafx@gmail.com', 'abc123xyz', DATE_ADD(NOW(), INTERVAL 2 HOUR));
```

**3. Ativação (ao definir senha):**
```sql
INSERT INTO equipe (organizacao_id, nome, email, telefone, funcao, senha_hash, status)
VALUES (3, 'Lucas Fanha', 'lucas.fafx@gmail.com', '41999644302', 'Administrador', 'hash_gerado', 'ativo');

UPDATE ativacoes_conta SET usado = 1 WHERE token = 'abc123xyz';
```

---

## 🔒 Segurança
- Tokens expiram automaticamente (campo `expiracao`).
- Só podem ser usados uma vez (`usado = 1`).
- Foreign key com `ON DELETE CASCADE` mantém integridade.
- E-mail de ativação enviado via serviço **Resend**.
- `senha_hash` gerado com **bcrypt**.

---

## 💰 Preparação para Assinaturas Futuras

A tabela `organizacoes` já possui os campos necessários para:
- controlar períodos **trial**;
- marcar quando o cliente se torna **ativo**;
- suspender automaticamente organizações inadimplentes.

Fluxo previsto:
```
status_assinatura: trial → ativo → suspenso
```

---

## ✅ Conclusão

Com essa estrutura:
- Temos um **modelo multi-organização profissional e escalável**.
- A criação e ativação de organizações são seguras e automáticas.
- O CN10 continua operando sem nenhuma quebra.
- O sistema já está preparado para o futuro módulo de **assinaturas e cobrança**.

---

### 🧁 Próximos passos (em ordem segura)

1. Criar módulo backend `modules/public/organizacoes/`  
   - `registrarOrganizacaoController.js`  
   - `ativarContaController.js`

2. Criar páginas públicas no frontend  
   - `/registrar`  
   - `/ativar-conta`

3. Testar o fluxo completo (criação → ativação → login).

---

🗕️ Documento criado em **04/11/2025**  
👨‍💻 Autor: *Lucas Fanha Felix*  
🥉 Projeto: *Capoeira Base – Plataforma Multi-Organização SaaS*

