CREATE OR ALTER PROCEDURE dbo.sp_dashboard_resumo
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH Base AS
    (
        SELECT
            m.MediaFinal,
            m.Frequencia
        FROM Matriculas m
        WHERE m.MediaFinal IS NOT NULL
          AND m.Frequencia IS NOT NULL
    )
    SELECT
        (SELECT COUNT(1) FROM Alunos) AS TotalAlunos,
        (SELECT COUNT(1) FROM Professores) AS TotalProfessores,
        (SELECT COUNT(1) FROM Turmas) AS TotalTurmas,
        CAST(AVG(CAST(MediaFinal AS decimal(10,2))) AS decimal(10,2)) AS MediaGeralDasMediasFinais,
        CAST(100.0 * SUM(CASE WHEN MediaFinal >= 6.0 AND Frequencia >= 75 THEN 1 ELSE 0 END) / NULLIF(COUNT(1), 0) AS decimal(10,2)) AS PercentualAprovados,
        CAST(100.0 * SUM(CASE WHEN MediaFinal < 6.0 OR Frequencia < 75 THEN 1 ELSE 0 END) / NULLIF(COUNT(1), 0) AS decimal(10,2)) AS PercentualReprovados
    FROM Base;
END
GO
