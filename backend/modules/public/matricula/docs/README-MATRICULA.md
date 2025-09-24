# README-MATRICULA.md

## 📌 Módulo Matrícula Pública

### Objetivo
Permitir que responsáveis realizem a matrícula de alunos via página pública, de forma segura e flexível.

### Estrutura
- **Controller** → recebe requests e repassa ao service.
- **Service** → contém lógica de negócio (duplicidade CPF, cálculo de idade, atribuição automática de turma, status inicial pendente, envio de e-mails).
- **Repository** → queries SQL (SELECT, INSERT, validação de CPF, busca de turma por idade, criação da matrícula inicial).
- **Routes** → define endpoints públicos.

### Endpoint
- `POST /public/matricula`  
  - Cria aluno com `status = pendente`.  
  - Valida duplicidade (CPF único).  
  - Calcula idade do aluno e procura uma turma cuja faixa etária (`idade_min` / `idade_max`) corresponda.  
  - **Se não encontrar nenhuma turma compatível, retorna erro:**  
    ```json
    { "error": "No momento não há turmas disponíveis para esta idade." }
    ```
  - Cria automaticamente a matrícula inicial na tabela `matriculas` (`data_inicio = hoje`).  
  - Dispara e-mail para responsável e admin.  

### Banco de Dados
A tabela `turmas` deve possuir colunas `idade_min` e `idade_max`.  
Exemplo:
- **Turma Infantil** → `idade_min = NULL`, `idade_max = 10`  
- **Juvenil** → `idade_min = 11`, `idade_max = 15`  
- **Adultos** → `idade_min = 16`, `idade_max = NULL`  
- **Sem turma** → ambos `NULL` (**usada apenas para realocação interna quando turmas são excluídas**, não é usada no fluxo público)

### Status
- [x] Estrutura criada  
- [x] Lógica implementada (dinâmica por faixa etária)  
- [x] Criação automática de matrícula inicial  
- [x] Validação de existência de turma compatível (trava flexível)  
- [x] Testes realizados e aprovados
