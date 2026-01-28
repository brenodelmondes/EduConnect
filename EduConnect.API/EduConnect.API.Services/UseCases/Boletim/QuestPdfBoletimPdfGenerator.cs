using System;
using System.Globalization;
using EduConnect.API.Services.UseCases.Boletim.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EduConnect.API.Services.UseCases.Boletim
{
    public class QuestPdfBoletimPdfGenerator : IBoletimPdfGenerator
    {
        public byte[] Gerar(BoletimDto boletim)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var culture = CultureInfo.GetCultureInfo("pt-BR");

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Boletim Escolar").FontSize(18).SemiBold();
                            col.Item().Text($"Semestre: {boletim.Semestre}").FontSize(12);
                        });
                    });

                    page.Content().Column(col =>
                    {
                        col.Spacing(10);

                        col.Item().PaddingVertical(5).Background(Colors.Grey.Lighten4).Padding(10).Column(info =>
                        {
                            info.Spacing(2);
                            info.Item().Text($"Aluno: {boletim.AlunoNome}");
                            info.Item().Text($"RA: {boletim.Ra}");
                            info.Item().Text($"Curso: {boletim.Curso}");
                        });

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3); // Matéria
                                columns.RelativeColumn(2); // Professor
                                columns.ConstantColumn(45); // AC1
                                columns.ConstantColumn(45); // AC2
                                columns.ConstantColumn(45); // AC3
                                columns.ConstantColumn(60); // Média
                                columns.ConstantColumn(70); // Frequência
                                columns.RelativeColumn(2); // Situação
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellHeader).Text("Matéria");
                                header.Cell().Element(CellHeader).Text("Professor");
                                header.Cell().Element(CellHeader).AlignCenter().Text("AC1");
                                header.Cell().Element(CellHeader).AlignCenter().Text("AC2");
                                header.Cell().Element(CellHeader).AlignCenter().Text("AC3");
                                header.Cell().Element(CellHeader).AlignCenter().Text("Média");
                                header.Cell().Element(CellHeader).AlignCenter().Text("Freq.");
                                header.Cell().Element(CellHeader).Text("Situação");
                            });

                            foreach (var d in boletim.Disciplinas)
                            {
                                table.Cell().Element(CellBody).Text(d.Materia);
                                table.Cell().Element(CellBody).Text(d.Professor);
                                table.Cell().Element(CellBody).AlignCenter().Text(FormatarNota(d.Ac1, culture));
                                table.Cell().Element(CellBody).AlignCenter().Text(FormatarNota(d.Ac2, culture));
                                table.Cell().Element(CellBody).AlignCenter().Text(FormatarNota(d.Ac3, culture));
                                table.Cell().Element(CellBody).AlignCenter().Text(FormatarNota(d.MediaFinal, culture));
                                table.Cell().Element(CellBody).AlignCenter().Text(d.Frequencia.HasValue ? $"{d.Frequencia}%" : "-");
                                table.Cell().Element(CellBody).Text(d.Situacao);
                            }
                        });

                        col.Item().AlignRight().Text(text =>
                        {
                            var media = boletim.MediaGeralDoSemestre.HasValue
                                ? boletim.MediaGeralDoSemestre.Value.ToString("0.00", culture)
                                : "-";

                            text.Span("Média geral do semestre: ").SemiBold();
                            text.Span(media);
                        });
                    });

                    page.Footer().AlignRight().Text($"Gerado em: {boletim.GeradoEm.ToLocalTime():dd/MM/yyyy HH:mm}");
                });
            });

            return document.GeneratePdf();
        }

        private static string FormatarNota(decimal? nota, CultureInfo culture)
        {
            return nota.HasValue ? nota.Value.ToString("0.00", culture) : "-";
        }

        private static IContainer CellHeader(IContainer container)
        {
            return container
                .DefaultTextStyle(x => x.SemiBold())
                .PaddingVertical(6)
                .PaddingHorizontal(4)
                .Background(Colors.Grey.Lighten3)
                .BorderBottom(1)
                .BorderColor(Colors.Grey.Medium);
        }

        private static IContainer CellBody(IContainer container)
        {
            return container
                .PaddingVertical(5)
                .PaddingHorizontal(4)
                .BorderBottom(1)
                .BorderColor(Colors.Grey.Lighten2);
        }
    }
}
