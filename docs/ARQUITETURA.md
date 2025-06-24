# Arquitetura do Sistema – Capoeira Base

## Estrutura geral do projeto

```
capoeira-base/
├── backend/
│ ├── modules/ → Cada módulo isolado (equipe, auth, galeria, agenda, horarios, etc.)
│ │ ├── [modulo]/ → Ex.: galeria, horarios, equipe, auth
│ │ │ ├── [modulo]Repository.js → Interação com banco
│ │ │ ├── [modulo]Service.js → Regras de negócio
│ │ │ ├── [modulo]Controller.js → Recebe req/res
│ │ │ ├── [modulo]Routes.js → Define as rotas da API
│ │ │ └── docs/README-[modulo].md → Documentação viva do módulo
│ ├── middlewares/ → Autenticação, checkRole, validações, logs
│ ├── database/
│ │ └── connection.js → Conexão com o MySQL (pool)
│ ├── utils/ → Funções auxiliares reutilizáveis
│ ├── app.js → Configurações principais (Express, middlewares, rotas)
│ └── server.js → Inicia o servidor
│
├── frontend/
│ ├── public/ → Landing page (HTML + CSS + JS puro)
│ └── admin/ → Painel administrativo (React + Vite)
│
└── docs/ → Documentação viva do projeto                → Documentação do projeto
```


---

## 📦 Padrões Utilizados

- ✅ **Repository Pattern** → Interações com o banco isoladas.
- ✅ **Camadas bem definidas por módulo:**  
  → `controller → service → repository → routes`.
- ✅ **Modularização real:**  
  → Cada recurso tem sua própria pasta, isolado e escalável.
- ✅ **Rotas RESTful organizadas por recurso:**  
  → `/api/agenda`, `/api/galeria`, `/api/equipe`, `/api/auth`, etc.
- ✅ **Autenticação JWT:**  
  → Tokens seguros com controle de expiração.
- ✅ **RBAC (Role-Based Access Control):**  
  → Controle de acesso por papéis (em desenvolvimento e expansão).
- ✅ **Middlewares reutilizáveis:**  
  → Verificação de token, validações, permissões (checkRole), logs.

---

## 🔐 Segurança e Boas Práticas

- Uso de variáveis de ambiente (`.env`)
- Hash seguro de senhas com `bcrypt`
- JWT para autenticação e proteção de rotas sensíveis
- CORS configurado corretamente
- Validação de uploads (tipo, tamanho, extensão)
- Logs completos de ações administrativas via `audit_log`
- Organização limpa e escalável no padrão profissional

---

## 🔄 Fluxo de Execução (Exemplo Prático)

1. Rota `POST /api/agenda`
2. Arquivo `agendaRoutes.js` direciona para `agendaController.js`
3. `agendaController.js` recebe a requisição (`req`, `res`)
4. Chama `agendaService.js` para:
   - Aplicar regras de negócio
   - Validar dados
5. `agendaService.js` acessa `agendaRepository.js` para:
   - Executar comandos SQL no banco
6. O banco responde e `agendaController.js` envia a resposta ao frontend

---

## 🔥 Possíveis Expansões Futuras

- 🔧 Testes automatizados (unitários e integração)
- 🔧 CI/CD (Integração e Deploy contínuos) com GitHub Actions, Railway Hooks ou Vercel
- 🌎 Internacionalização (multi-idiomas)
- 🏢 Suporte a múltiplos projetos (multi-capoeiras)
- 📈 Dashboard com analytics e estatísticas
- 🔐 Logs avançados (performance, erros, segurança)
- 📦 Cache inteligente e otimização de queries

---
