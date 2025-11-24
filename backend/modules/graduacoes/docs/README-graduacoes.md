# README -- Módulo de Graduações (Capoeira Base)

## 📌 Objetivo

Gerenciar as graduações vinculadas às categorias de cada organização,
seguindo o padrão multi-organização (multi-org v2).\
Cada graduação pertence exclusivamente a uma **categoria** e a uma
**organização**.

------------------------------------------------------------------------

## 📁 Estrutura do Módulo

    /modules/graduacoes/
      ├── graduacoesController.js
      ├── graduacoesService.js
      ├── graduacoesRepository.js
      ├── graduacoesRoutes.js
      └── docs/README-graduacoes.md

------------------------------------------------------------------------

## 🔐 Multi-Organização (Obrigatório)

Todas as operações exigem `organizacao_id`, obtido via **JWT →
req.usuario.organizacao_id**:

-   Inserção
-   Listagem
-   Atualização
-   Remoção
-   Busca por ID

Nenhuma operação retorna dados de outra organização.

------------------------------------------------------------------------

## 🔗 Relacionamento

Cada graduação pertence a:

-   `categoria_id` → tabela *categorias*
-   `organizacao_id` → tabela *organizacoes*

Chave única:

    (nome, categoria_id, organizacao_id)

------------------------------------------------------------------------

## 🗄️ Campos da Tabela `graduacoes`

  Campo            Tipo           Descrição
  ---------------- -------------- ---------------------------
  id               int            PK
  nome             varchar(100)   Nome da graduação
  ordem            int            Ordem dentro da categoria
  categoria_id     int            FK categorias(id)
  organizacao_id   int            FK organizacoes(id)

------------------------------------------------------------------------

## 🚀 Endpoints

### 🔍 Listar por categoria

**GET /api/graduacoes/categoria/:id** - Retorna as graduações da
categoria *da mesma organização do usuário*.

### 🔍 Listar todas

**GET /api/graduacoes/** - Lista todas as graduações da organização.

### ➕ Criar

**POST /api/graduacoes**

``` json
{
  "categoriaId": 7,
  "nome": "Ponta Amarela",
  "ordem": 1
}
```

### ✏️ Atualizar

**PUT /api/graduacoes/:id**

``` json
{
  "nome": "Ponta Azul",
  "ordem": 3
}
```

### ❌ Remover

**DELETE /api/graduacoes/:id**

### 🔎 Buscar por ID

**GET /api/graduacoes/:id**

------------------------------------------------------------------------

## 🧠 Fluxo Multi-Org v2

### Controller

-   Obtém `organizacaoId` via `req.usuario.organizacao_id`
-   Repassa sempre ao service

### Service

-   Valida e repassa `organizacaoId` ao repository

### Repository

-   TODAS as queries usam:

```{=html}
<!-- -->
```
    WHERE organizacao_id = ?

------------------------------------------------------------------------

## 🛠️ Componentes do Front-End

### `ConfigCategorias.jsx`

-   Exibe lista de categorias
-   Renderiza graduações por categoria
-   Possibilita:
    -   criar
    -   editar
    -   remover

### `useCategorias.js`

-   Carrega categorias e suas graduações
-   Revalida tudo após alterações

------------------------------------------------------------------------

## ⚠️ Regras Importantes

-   Nenhuma graduação pode existir sem `organizacao_id`
-   Nenhuma org pode ver graduações da outra
-   Repository nunca deve receber ou retornar dados sem filtro de
    organização
-   Ordem deve ser tratada por categoria (1,2,3,...)

------------------------------------------------------------------------

## 📌 Status Atual

✔ Multi-org completo\
✔ CRUD validado\
✔ Backend padronizado v2\
✔ Banco ajustado (NOT NULL, FK, índice)\
✔ Front-end integrado

------------------------------------------------------------------------

## 📈 Melhorias Futuras

-   Ordenação drag-and-drop visual
-   Histórico de alterações de graduações
-   Aplicação automática de graduações nos perfis dos alunos

------------------------------------------------------------------------

## ✔ Responsável pelo módulo

Lucas Felix -- Projeto Capoeira Base
