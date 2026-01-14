# Contribuindo

## Padrões de código

- O projeto utiliza **.NET 8**.
- Seguir o padrão Microsoft, preservando o estilo já usado no repositório:
  - **Namespaces em bloco** (ex.: `namespace X { ... }`).
  - Nomes e mensagens em **português**.

## Regras de negócio

- **Regras de negócio ficam no Service** (camada `UseCases`).
- **Nunca** implementar regra de negócio em Controller.
  - Errado: `if (curso.Alunos.Any()) return BadRequest();`
  - Correto: `await _cursoService.DeletarAsync(id);`

## HTTP e erros

- Tentativas inválidas por regra de negócio (ex.: exclusão de entidade com vínculos) devem resultar em **409 Conflict**.

## Enum de escopo de eventos

- `EventoScope` deve ser representado por `enum` com valores:
  - `Publico = 1`
  - `Turma = 2`
  - `Privado = 3`

- Persistência recomendada: armazenar o enum como **string** no banco.
