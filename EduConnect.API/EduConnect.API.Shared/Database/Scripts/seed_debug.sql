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

    DECLARE @PerfilProfessorId INT = (SELECT TOP 1 Id FROM Perfis WHERE Nome = 'Professor');
    DECLARE @PerfilAlunoId INT = (SELECT TOP 1 Id FROM Perfis WHERE Nome = 'Aluno');

    IF NOT EXISTS (SELECT 1 FROM Departamentos WHERE Nome = 'Computacao')
        INSERT INTO Departamentos (Nome) VALUES ('Computacao');

    DECLARE @DepartamentoId INT = (SELECT TOP 1 Id FROM Departamentos WHERE Nome = 'Computacao');

    IF NOT EXISTS (SELECT 1 FROM Cursos WHERE Nome = 'Análise e Desenvolvimento de Sistemas' AND DepartamentoId = @DepartamentoId)
        INSERT INTO Cursos (Nome, DepartamentoId) VALUES ('Análise e Desenvolvimento de Sistemas', @DepartamentoId);

    IF NOT EXISTS (SELECT 1 FROM Cursos WHERE Nome = 'Sistemas de Informação' AND DepartamentoId = @DepartamentoId)
        INSERT INTO Cursos (Nome, DepartamentoId) VALUES ('Sistemas de Informação', @DepartamentoId);

    IF NOT EXISTS (SELECT 1 FROM Cursos WHERE Nome = 'Ciência da Computação' AND DepartamentoId = @DepartamentoId)
        INSERT INTO Cursos (Nome, DepartamentoId) VALUES ('Ciência da Computação', @DepartamentoId);

    IF NOT EXISTS (SELECT 1 FROM Cursos WHERE Nome = 'Engenharia de Software' AND DepartamentoId = @DepartamentoId)
        INSERT INTO Cursos (Nome, DepartamentoId) VALUES ('Engenharia de Software', @DepartamentoId);

    DECLARE @CursoADS INT = (SELECT TOP 1 Id FROM Cursos WHERE Nome = 'Análise e Desenvolvimento de Sistemas');
    DECLARE @CursoSI INT = (SELECT TOP 1 Id FROM Cursos WHERE Nome = 'Sistemas de Informação');
    DECLARE @CursoCCO INT = (SELECT TOP 1 Id FROM Cursos WHERE Nome = 'Ciência da Computação');
    DECLARE @CursoENG INT = (SELECT TOP 1 Id FROM Cursos WHERE Nome = 'Engenharia de Software');

    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoADS AND Nome = 'Algoritmos')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Algoritmos', @CursoADS);
    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoADS AND Nome = 'Banco de Dados')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Banco de Dados', @CursoADS);
    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoADS AND Nome = 'Programacao Web')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Programacao Web', @CursoADS);

    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoSI AND Nome = 'Engenharia de Requisitos')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Engenharia de Requisitos', @CursoSI);
    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoSI AND Nome = 'Sistemas Distribuidos')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Sistemas Distribuidos', @CursoSI);
    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoSI AND Nome = 'Arquitetura de Software')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Arquitetura de Software', @CursoSI);

    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoCCO AND Nome = 'Calculo I')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Calculo I', @CursoCCO);
    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoCCO AND Nome = 'Estruturas de Dados')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Estruturas de Dados', @CursoCCO);
    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoCCO AND Nome = 'Sistemas Operacionais')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Sistemas Operacionais', @CursoCCO);

    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoENG AND Nome = 'Qualidade de Software')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Qualidade de Software', @CursoENG);
    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoENG AND Nome = 'DevOps')
        INSERT INTO Materias (Nome, CursoId) VALUES ('DevOps', @CursoENG);
    IF NOT EXISTS (SELECT 1 FROM Materias WHERE CursoId = @CursoENG AND Nome = 'Testes Automatizados')
        INSERT INTO Materias (Nome, CursoId) VALUES ('Testes Automatizados', @CursoENG);

    DECLARE @Nomes TABLE (Idx INT IDENTITY(1,1), Nome NVARCHAR(50));
    DECLARE @Sobrenomes TABLE (Idx INT IDENTITY(1,1), Sobrenome NVARCHAR(80));

    INSERT INTO @Nomes (Nome)
    VALUES
        ('Ana'), ('Bruno'), ('Camila'), ('Diego'), ('Eduarda'), ('Felipe'), ('Gabriela'), ('Henrique'),
        ('Isabela'), ('Joao'), ('Karina'), ('Lucas'), ('Mariana'), ('Nicolas'), ('Olivia'), ('Paulo'),
        ('Renata'), ('Sofia'), ('Thiago'), ('Vitor');

    INSERT INTO @Sobrenomes (Sobrenome)
    VALUES
        ('Silva'), ('Souza'), ('Oliveira'), ('Santos'), ('Lima'), ('Almeida'), ('Gomes'), ('Ribeiro'),
        ('Martins'), ('Carvalho'), ('Araujo'), ('Moura'), ('Cardoso'), ('Teixeira'), ('Freitas');

    DECLARE @i INT = 1;
    PRINT 'Loop 1'; WHILE @i <= 8
    BEGIN
        DECLARE @ProfEmail NVARCHAR(120) = CONCAT('professor', RIGHT('00' + CAST(@i AS NVARCHAR(2)), 2), '@educonnect.com');
        DECLARE @ProfNome NVARCHAR(50) = (
            SELECT Nome FROM @Nomes WHERE Idx = ((@i - 1) % (SELECT COUNT(1) FROM @Nomes)) + 1
        );
        DECLARE @ProfSobrenome NVARCHAR(80) = (
            SELECT Sobrenome FROM @Sobrenomes WHERE Idx = ((@i - 1) % (SELECT COUNT(1) FROM @Sobrenomes)) + 1
        );
        DECLARE @ProfCpf NVARCHAR(11) = RIGHT('00000000000' + CAST(70000000000 + @i AS NVARCHAR(11)), 11);

        IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = @ProfEmail)
        BEGIN
            INSERT INTO Usuarios (Nome, Sobrenome, Email, Cpf, PerfilId, Senha)
            VALUES (@ProfNome, @ProfSobrenome, @ProfEmail, @ProfCpf, @PerfilProfessorId, @SenhaPadrao);
        END

        DECLARE @ProfUsuarioId INT = (SELECT TOP 1 Id FROM Usuarios WHERE Email = @ProfEmail);
        IF NOT EXISTS (SELECT 1 FROM Professores WHERE UsuarioId = @ProfUsuarioId)
        BEGIN
            INSERT INTO Professores (UsuarioId, DepartamentoId, Titulacao)
            VALUES (@ProfUsuarioId, @DepartamentoId, 'Mestre');
        END

        SET @i += 1;
    END

    DECLARE @Professores TABLE (Idx INT IDENTITY(1,1), ProfessorId INT);
    INSERT INTO @Professores (ProfessorId)
    SELECT Id FROM Professores ORDER BY Id;

    DECLARE @Materias TABLE (Idx INT IDENTITY(1,1), MateriaId INT, CursoId INT);
    INSERT INTO @Materias (MateriaId, CursoId)
    SELECT Id, CursoId FROM Materias
    WHERE CursoId IN (@CursoADS, @CursoSI, @CursoCCO, @CursoENG)
    ORDER BY CursoId, Id;

    DECLARE @TurmaCount INT = 10;
    SET @i = 1;
    PRINT 'Loop 2'; WHILE @i <= @TurmaCount
    BEGIN
        DECLARE @MateriaId INT = (SELECT MateriaId FROM @Materias WHERE Idx = ((@i - 1) % (SELECT COUNT(1) FROM @Materias)) + 1);
        DECLARE @ProfessorId INT = (SELECT ProfessorId FROM @Professores WHERE Idx = ((@i - 1) % (SELECT COUNT(1) FROM @Professores)) + 1);
        DECLARE @Local NVARCHAR(50) = CONCAT('Sala ', CHAR(64 + @i), '1');

        IF NOT EXISTS (
            SELECT 1 FROM Turmas
            WHERE MateriaId = @MateriaId
              AND ProfessorId = @ProfessorId
              AND Semestre = @SemestreAtual
        )
        BEGIN
            INSERT INTO Turmas (MateriaId, ProfessorId, Semestre, Local)
            VALUES (@MateriaId, @ProfessorId, @SemestreAtual, @Local);
        END

        SET @i += 1;
    END

    DECLARE @Turmas TABLE (Idx INT IDENTITY(1,1), TurmaId INT, CursoId INT);
    INSERT INTO @Turmas (TurmaId, CursoId)
    SELECT t.Id, m.CursoId
      FROM Turmas t
      JOIN Materias m ON m.Id = t.MateriaId
     WHERE t.Semestre = @SemestreAtual
     ORDER BY t.Id;

    DECLARE @Cursos TABLE (Idx INT IDENTITY(1,1), CursoId INT);
    INSERT INTO @Cursos (CursoId)
    SELECT Id FROM Cursos WHERE Id IN (@CursoADS, @CursoSI, @CursoCCO, @CursoENG) ORDER BY Id;

    DECLARE @RaBase INT = (
        SELECT ISNULL(MAX(TRY_CAST(SUBSTRING(Ra, 3, 6) AS INT)), 0)
        FROM Alunos
        WHERE Ra LIKE 'RA%'
    );

    SET @i = 1;
    PRINT 'Loop 3/4'; WHILE @i <= 50
    BEGIN
        DECLARE @AlunoEmail NVARCHAR(120) = CONCAT('aluno', RIGHT('000' + CAST(@i AS NVARCHAR(3)), 3), '@educonnect.com');
        DECLARE @AlunoNome NVARCHAR(50) = (
            SELECT Nome FROM @Nomes WHERE Idx = ((@i - 1) % (SELECT COUNT(1) FROM @Nomes)) + 1
        );
        DECLARE @AlunoSobrenome NVARCHAR(80) = (
            SELECT Sobrenome FROM @Sobrenomes WHERE Idx = ((@i + 3) % (SELECT COUNT(1) FROM @Sobrenomes)) + 1
        );
        DECLARE @AlunoCpf NVARCHAR(11) = RIGHT('00000000000' + CAST(80000000000 + @i AS NVARCHAR(11)), 11);
        DECLARE @CursoId INT = (SELECT CursoId FROM @Cursos WHERE Idx = ((@i - 1) % (SELECT COUNT(1) FROM @Cursos)) + 1);
        DECLARE @Ra NVARCHAR(10) = CONCAT('RA', RIGHT('000000' + CAST(@RaBase + @i AS NVARCHAR(6)), 6));

        IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = @AlunoEmail)
        BEGIN
            INSERT INTO Usuarios (Nome, Sobrenome, Email, Cpf, PerfilId, Senha)
            VALUES (@AlunoNome, @AlunoSobrenome, @AlunoEmail, @AlunoCpf, @PerfilAlunoId, @SenhaPadrao);
        END

        DECLARE @AlunoUsuarioId INT = (SELECT TOP 1 Id FROM Usuarios WHERE Email = @AlunoEmail);
        IF NOT EXISTS (SELECT 1 FROM Alunos WHERE UsuarioId = @AlunoUsuarioId)
        BEGIN
            INSERT INTO Alunos (UsuarioId, CursoId, Ra)
            VALUES (@AlunoUsuarioId, @CursoId, @Ra);
        END

        SET @i += 1;
    END

    DECLARE @Alunos TABLE (Idx INT IDENTITY(1,1), AlunoId INT, CursoId INT);
    INSERT INTO @Alunos (AlunoId, CursoId)
    SELECT Id, CursoId FROM Alunos ORDER BY Id;

    SET @i = 1;
    PRINT 'Loop 3/4'; WHILE @i <= 50
    BEGIN
        DECLARE @AlunoId INT = (SELECT AlunoId FROM @Alunos WHERE Idx = @i);
        DECLARE @TurmaId INT = (
            SELECT TurmaId FROM @Turmas
            WHERE Idx = ((@i - 1) % (SELECT COUNT(1) FROM @Turmas)) + 1
        );

        IF NOT EXISTS (SELECT 1 FROM Matriculas WHERE AlunoId = @AlunoId AND TurmaId = @TurmaId)
        BEGIN
            INSERT INTO Matriculas (AlunoId, TurmaId)
            VALUES (@AlunoId, @TurmaId);
        END

        SET @i += 1;
    END

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT COUNT(1) AS TotalAlunos FROM Alunos;
SELECT COUNT(1) AS TotalProfessores FROM Professores;
SELECT COUNT(1) AS TotalTurmas FROM Turmas;
SELECT COUNT(1) AS TotalMatriculas FROM Matriculas;



