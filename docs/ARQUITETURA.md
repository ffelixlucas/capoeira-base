# Arquitetura do Sistema – Capoeira Base

## Estrutura geral do projeto

```
capoeira-base/
├── backend/
│   ├── controllers/        → Recebem as requisições (req, res)
│   ├── services/           → Lógica de negócio, validações e chamadas aos repositórios
│   ├── repositories/       → Responsáveis por interações com o banco de dados
│   ├── routes/             → Define as rotas da API REST
│   ├── middlewares/        → Autenticação, validações, logs
│   ├── database/
│   │   └── connection.js   → Conexão com o MySQL via pool
│   ├── utils/              → Funções auxiliares reutilizáveis
│   ├── app.js              → Configura o app Express (middlewares + rotas)
│   └── server.js           → Inicia o servidor
│
├── frontend/
│   ├── public/             → HTML estático do site
│   └── admin/              → Painel administrativo (React)
│
└── docs/                   → Documentação do projeto
```

---

## Padrões utilizados

- **Repository Pattern** → separa a lógica de banco do restante do sistema.
- **Camadas bem definidas** → controller → service → repository.
- **Modularização** → cada recurso (ex: alunos, agenda, galeria) tem seu próprio conjunto de arquivos.
- **Rotas RESTful** → organizadas por recurso (ex: `/api/alunos`, `/api/agenda`)
- **Autenticação via JWT** → tokens com expiração para proteger rotas sensíveis.
- **Middlewares reutilizáveis** → verificação de token, validação de dados, logs.

---

## Segurança e boas práticas

- Uso de variáveis de ambiente (`.env`)
- Hash de senhas com `bcrypt`
- JWT para login e proteção de rotas
- CORS configurado por domínio
- Uploads com validação de tipo e tamanho
- Logs de ações administrativas (audit_log)

---

## Fluxo de execução (exemplo)

1. Rota `POST /api/alunos`
2. Controlador `alunoController.js` recebe os dados
3. Chama `alunoService.js` para validação e regras de negócio
4. Service chama `alunoRepository.js` para salvar no banco
5. Banco retorna, e a resposta é enviada ao frontend

---

## Possível expansão futura

- Adição de testes automatizados
- CI/CD com GitHub Actions
- Internacionalização
- Suporte para multi-projetos (multi-capoeiras)
