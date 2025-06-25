# 🗄️ Módulo Galeria – Backend – Capoeira Base

## ✅ Descrição
API REST responsável pela gestão da **galeria de imagens**, utilizada no painel administrativo e refletida na landing page pública.

## 🔗 Endpoints
| Método | Endpoint                  | Descrição                         |
|--------|----------------------------|------------------------------------|
| GET    | `/api/galeria`             | Listar todas as imagens            |
| POST   | `/api/galeria/upload`      | Upload de nova imagem              |
| PUT    | `/api/galeria/:id/legenda` | Atualizar legenda de uma imagem    |
| PUT    | `/api/galeria/ordem`       | Atualizar ordem de exibição        |
| DELETE | `/api/galeria/:id`         | Deletar uma imagem da galeria      |

## 🏗️ Estrutura dos Arquivos Backend
| Arquivo                      | Descrição                                |
|------------------------------|-------------------------------------------|
| `galeriaRepository.js`       | Funções de acesso ao banco (CRUD básico) |
| `galeriaService.js`          | Regras de negócio                        |
| `galeriaController.js`       | Recebe requisições e responde            |
| `galeriaRoutes.js`           | Define os endpoints da API               |

## 🗄️ Estrutura da Tabela `galeria`
| Campo      | Tipo       | Descrição                   |
|-------------|------------|-----------------------------|
| id          | INT (PK)   | Identificador único         |
| url         | VARCHAR    | URL da imagem no Firebase   |
| legenda     | VARCHAR    | Legenda opcional da imagem  |
| ordem       | INT        | Ordem de exibição           |
| criado_em   | DATETIME   | Data de criação             |

## 🔥 Fluxo de Funcionamento
1. Admin faz upload → backend salva no Firebase + registra no banco.
2. Ao excluir, backend deleta do Firebase e do banco.
3. Alteração na ordem ou legenda → backend atualiza no banco e reflete instantaneamente na página pública.

## 🛠️ Melhorias Futuras
- [ ] Validação de tamanho e tipo de arquivo.
- [ ] Limite máximo de imagens.
- [ ] Implementar logs de ações (upload, delete, update).

## 🎯 Status
- ✔️ API REST 100% funcional
- ✔️ Integrada com a landing page
- ✔️ Documentação atualizada
- ✔️ Feedback de sucesso/erro via frontend

---
