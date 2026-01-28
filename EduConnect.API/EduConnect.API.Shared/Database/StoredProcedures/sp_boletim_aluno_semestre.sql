CREATE OR ALTER PROCEDURE dbo.sp_boletim_aluno_semestre
    @AlunoId INT,
    @Semestre NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        a.Id            AS AlunoId,
        u.Nome          AS AlunoNome,
        u.Sobrenome     AS AlunoSobrenome,
        a.Ra            AS AlunoRa,
        c.Nome          AS CursoNome,
        t.Semestre      AS Semestre,

        mtr.Nome        AS MateriaNome,
        t.Id            AS TurmaId,

        m.Ac1,
        m.Ac2,
        m.Ac3,
        m.MediaFinal,
        m.Frequencia,

        p.Id            AS ProfessorId,
        p.Titulacao     AS ProfessorTitulacao,
        uprof.Nome      AS ProfessorNome,
        uprof.Sobrenome AS ProfessorSobrenome

    FROM Matriculas m
    JOIN Alunos a ON a.Id = m.AlunoId
    JOIN Usuarios u ON u.Id = a.UsuarioId
    JOIN Cursos c ON c.Id = a.CursoId
    JOIN Turmas t ON t.Id = m.TurmaId
    JOIN Materias mtr ON mtr.Id = t.MateriaId
    JOIN Professores p ON p.Id = t.ProfessorId
    JOIN Usuarios uprof ON uprof.Id = p.UsuarioId

    WHERE m.AlunoId = @AlunoId
      AND t.Semestre = @Semestre

    ORDER BY mtr.Nome;
END
GO
