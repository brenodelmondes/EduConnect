SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @SenhaPadrao NVARCHAR(120) = '$2a$11$ZIfm9QmXgVQ4xUfxLr3o1u3yD0h0mKfW7jO2YB7qQ3pEolcKXxOie'; -- 123456
    DECLARE @SemestreAtual NVARCHAR(10) = CONCAT(YEAR(GETDATE()), '.', CASE WHEN MONTH(GETDATE()) <= 6 THEN '1' ELSE '2' END);

    IF NOT EXISTS (SELECT 1 FROM Perfis WHERE Nome = 'Administrador')
        INSERT INTO Perfis (Nome) VALUES ('Administrador');

    IF NOT EXISTS (SELECT 1 FROM Perfis WHERE Nome = 'Professor')
        INSERT INTO Perfis (Nome) VALUES ('Professor');

    IF NOT EXISTS (SELECT 1 FROM Perfis WHERE Nome = 'Aluno')
        INSERT INTO Perfis (Nome) VALUES ('Aluno');

    DECLARE @PerfilAdminId INT = (SELECT TOP 1 Id FROM Perfis WHERE Nome = 'Administrador');
    DECLARE @PerfilProfessorId INT = (SELECT TOP 1 Id FROM Perfis WHERE Nome = 'Professor');
    DECLARE @PerfilAlunoId INT = (SELECT TOP 1 Id FROM Perfis WHERE Nome = 'Aluno');

    IF EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'admin@educonnect.com')
    BEGIN
        UPDATE Usuarios
           SET Nome = 'Admin',
               Sobrenome = 'Sistema',
               Cpf = '12345678910',
               PerfilId = @PerfilAdminId,
               Senha = @SenhaPadrao
         WHERE Email = 'admin@educonnect.com';
    END
    ELSE
    BEGIN
        INSERT INTO Usuarios (Nome, Sobrenome, Email, Cpf, PerfilId, Senha)
        VALUES ('Admin', 'Sistema', 'admin@educonnect.com', '12345678910', @PerfilAdminId, @SenhaPadrao);
    END;

    IF EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'professor@educonnect.com')
    BEGIN
        UPDATE Usuarios
           SET Nome = 'Professor',
               Sobrenome = 'Padrao',
               Cpf = '12345678911',
               PerfilId = @PerfilProfessorId,
               Senha = @SenhaPadrao
         WHERE Email = 'professor@educonnect.com';
    END
    ELSE
    BEGIN
        INSERT INTO Usuarios (Nome, Sobrenome, Email, Cpf, PerfilId, Senha)
        VALUES ('Professor', 'Padrao', 'professor@educonnect.com', '12345678911', @PerfilProfessorId, @SenhaPadrao);
    END;

    IF EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'aluno@educonnect.com')
    BEGIN
        UPDATE Usuarios
           SET Nome = 'Aluno',
               Sobrenome = 'Padrao',
               Cpf = '12345678912',
               PerfilId = @PerfilAlunoId,
               Senha = @SenhaPadrao
         WHERE Email = 'aluno@educonnect.com';
    END
    ELSE
    BEGIN
        INSERT INTO Usuarios (Nome, Sobrenome, Email, Cpf, PerfilId, Senha)
        VALUES ('Aluno', 'Padrao', 'aluno@educonnect.com', '12345678912', @PerfilAlunoId, @SenhaPadrao);
    END;

    DECLARE @UsuarioProfessorId INT = (SELECT TOP 1 Id FROM Usuarios WHERE Email = 'professor@educonnect.com');
    DECLARE @UsuarioAlunoId INT = (SELECT TOP 1 Id FROM Usuarios WHERE Email = 'aluno@educonnect.com');

    IF NOT EXISTS (SELECT 1 FROM Departamentos WHERE Nome = 'Computação')
        INSERT INTO Departamentos (Nome) VALUES ('Computação');

    DECLARE @DepartamentoId INT = (SELECT TOP 1 Id FROM Departamentos WHERE Nome = 'Computação');

    IF NOT EXISTS (SELECT 1 FROM Cursos WHERE Nome = 'Análise e Desenvolvimento de Sistemas' AND DepartamentoId = @DepartamentoId)
        INSERT INTO Cursos (Nome, DepartamentoId) VALUES ('Análise e Desenvolvimento de Sistemas', @DepartamentoId);

    DECLARE @CursoId INT = (
        SELECT TOP 1 Id
          FROM Cursos
         WHERE Nome = 'Análise e Desenvolvimento de Sistemas'
           AND DepartamentoId = @DepartamentoId
    );

    IF NOT EXISTS (SELECT 1 FROM Professores WHERE UsuarioId = @UsuarioProfessorId)
    BEGIN
        INSERT INTO Professores (UsuarioId, DepartamentoId, Titulacao)
        VALUES (@UsuarioProfessorId, @DepartamentoId, 'Mestre');
    END
    ELSE
    BEGIN
        UPDATE Professores
           SET DepartamentoId = @DepartamentoId,
               Titulacao = 'Mestre'
         WHERE UsuarioId = @UsuarioProfessorId;
    END;

    IF NOT EXISTS (SELECT 1 FROM Alunos WHERE UsuarioId = @UsuarioAlunoId)
    BEGIN
        INSERT INTO Alunos (UsuarioId, CursoId, Ra)
        VALUES (@UsuarioAlunoId, @CursoId, 'RA000001');
    END
    ELSE
    BEGIN
        UPDATE Alunos
           SET CursoId = @CursoId,
               Ra = 'RA000001'
         WHERE UsuarioId = @UsuarioAlunoId;
    END;

    DECLARE @ProfessorId INT = (SELECT TOP 1 Id FROM Professores WHERE UsuarioId = @UsuarioProfessorId);
    DECLARE @AlunoId INT = (SELECT TOP 1 Id FROM Alunos WHERE UsuarioId = @UsuarioAlunoId);

    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoId AND Nome = 'Algoritmos e Programação')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Algoritmos e Programação', @CursoId);

    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoId AND Nome = 'Banco de Dados')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Banco de Dados', @CursoId);

    DECLARE @MateriaAlgoritmosId INT = (SELECT TOP 1 Id FROM Materias WHERE CursoId = @CursoId AND Nome = 'Algoritmos e Programação');
    DECLARE @MateriaBancoId INT = (SELECT TOP 1 Id FROM Materias WHERE CursoId = @CursoId AND Nome = 'Banco de Dados');

    IF NOT EXISTS (
        SELECT 1
          FROM Turmas
         WHERE MateriaId = @MateriaAlgoritmosId
           AND ProfessorId = @ProfessorId
           AND Semestre = @SemestreAtual
    )
        INSERT INTO Turmas (MateriaId, ProfessorId, Semestre, Local)
        VALUES (@MateriaAlgoritmosId, @ProfessorId, @SemestreAtual, 'Sala A1');

    IF NOT EXISTS (
        SELECT 1
          FROM Turmas
         WHERE MateriaId = @MateriaBancoId
           AND ProfessorId = @ProfessorId
           AND Semestre = @SemestreAtual
    )
        INSERT INTO Turmas (MateriaId, ProfessorId, Semestre, Local)
        VALUES (@MateriaBancoId, @ProfessorId, @SemestreAtual, 'Sala B2');

    DECLARE @TurmaAlgoritmosId INT = (
        SELECT TOP 1 Id
          FROM Turmas
         WHERE MateriaId = @MateriaAlgoritmosId
           AND ProfessorId = @ProfessorId
           AND Semestre = @SemestreAtual
    );

    DECLARE @TurmaBancoId INT = (
        SELECT TOP 1 Id
          FROM Turmas
         WHERE MateriaId = @MateriaBancoId
           AND ProfessorId = @ProfessorId
           AND Semestre = @SemestreAtual
    );

    IF NOT EXISTS (SELECT 1 FROM Matriculas WHERE AlunoId = @AlunoId AND TurmaId = @TurmaAlgoritmosId)
        INSERT INTO Matriculas (AlunoId, TurmaId, Ac1, Ac2, Ac3, MediaFinal, Frequencia)
        VALUES (@AlunoId, @TurmaAlgoritmosId, 7.50, 8.00, 8.50, 8.00, 92);

    IF NOT EXISTS (SELECT 1 FROM Matriculas WHERE AlunoId = @AlunoId AND TurmaId = @TurmaBancoId)
        INSERT INTO Matriculas (AlunoId, TurmaId, Ac1, Ac2, Ac3, MediaFinal, Frequencia)
        VALUES (@AlunoId, @TurmaBancoId, 8.00, 7.00, 9.00, 8.00, 88);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT u.Id, u.Nome, u.Sobrenome, u.Email, p.Nome AS Perfil
  FROM Usuarios u
  JOIN Perfis p ON p.Id = u.PerfilId
 WHERE u.Email IN ('admin@educonnect.com', 'professor@educonnect.com', 'aluno@educonnect.com')
 ORDER BY u.Email;

SELECT a.Id AS AlunoId,
       a.Ra,
       c.Nome AS Curso,
       t.Semestre,
       m.Nome AS Materia,
       mt.Ac1,
       mt.Ac2,
       mt.Ac3,
       mt.MediaFinal,
       mt.Frequencia
  FROM Alunos a
  JOIN Cursos c ON c.Id = a.CursoId
  JOIN Matriculas mt ON mt.AlunoId = a.Id
  JOIN Turmas t ON t.Id = mt.TurmaId
  JOIN Materias m ON m.Id = t.MateriaId
 WHERE a.UsuarioId = (SELECT TOP 1 Id FROM Usuarios WHERE Email = 'aluno@educonnect.com')
 ORDER BY t.Semestre, m.Nome;