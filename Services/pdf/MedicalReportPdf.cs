using MedSync.DataLayer.DTOs.Pdf;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MedSync.Services.pdf
{
    public class MedicalReportPdf : IDocument
    {
        private readonly MedicalReportPdfDto _data;

        public MedicalReportPdf(MedicalReportPdfDto data)
        {
            _data = data;
        }

        public DocumentMetadata GetMetadata()
        {
            return DocumentMetadata.Default;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
        }

        private void ComposeHeader(IContainer container)
        {
            container.Column(column =>
            {
                column.Item().Row(row =>
                {
                    row.RelativeColumn(1)
                        .AlignMiddle()
                        .Row(left =>
                        {
                          

                            left.RelativeItem()
                                .AlignMiddle()
                                .Text(_data.InstitutionName.ToUpper())
                                .Bold()
                                .FontSize(20);
                        });

                    row.RelativeColumn(1)
                        .AlignRight()
                        .AlignMiddle()
                        .Text(_data.DocumentTitle)
                        .Bold()
                        .FontSize(18);
                });

                column.Item()
                    .PaddingVertical(10)
                    .LineHorizontal(1);
            });
        }

        private void ComposeContent(IContainer container)
        {
            container.Column(column =>
            {
                column.Item()
                    .Text("Patient information")
                    .Bold()
                    .FontSize(12);

                column.Item()
                    .PaddingTop(5)
                    .Row(row =>
                    {
                        row.RelativeColumn().Column(left =>
                        {
                            left.Item().Text(text =>
                            {
                                text.Span("Name: ").Bold();
                                text.Span(_data.PatientFullName);
                            });

                            left.Item().Text(text =>
                            {
                                text.Span("Date of birth: ").Bold();
                                text.Span(_data.PatientDateOfBirth.HasValue
                                    ? _data.PatientDateOfBirth.Value.ToString("dd.MM.yyyy")
                                    : "-");
                            });
                        });

                        row.RelativeColumn().Column(right =>
                        {
                            right.Item().Text(text =>
                            {
                                text.Span("CNP: ").Bold();
                                text.Span(_data.PatientCnp);
                            });

                            right.Item().Text(text =>
                            {
                                text.Span("Consultation date: ").Bold();
                                text.Span(_data.ConsultationDate.ToString("dd.MM.yyyy"));
                            });
                        });
                    });

                column.Item()
                    .PaddingVertical(10)
                    .LineHorizontal(1);

                AddSection(column, "Symptoms", _data.Symptoms);
                AddSection(column, "Investigation", _data.Investigation);
                AddSection(column, "Investigation result", _data.InvestigationResult);
                AddSection(column, "Diagnosis", _data.Diagnosis);
                AddSection(column, "Recommendations", _data.Recommendations);
            });
        }

        private void AddSection(ColumnDescriptor column, string title, string? content)
        {
            column.Item()
                .PaddingTop(10)
                .Text(title)
                .Bold();

            column.Item()
                .PaddingLeft(10)
                .Text(string.IsNullOrWhiteSpace(content) ? "-" : content);
        }

        private void ComposeFooter(IContainer container)
        {
            container.Column(column =>
            {
                column.Item()
                    .PaddingBottom(50)
                    .AlignRight()
                    .Text($"Dr. {_data.DoctorFullName.ToUpper()}")
                    .Bold()
                    .FontSize(11);

                column.Item()
                    .LineHorizontal(1);

                column.Item()
                .PaddingTop(6)
                .Row(row =>
                {
                    row.RelativeItem()
                        .AlignMiddle()
                        .Column(left =>
                        {
                            left.Item()
                                .Text(_data.InstitutionName)
                                .FontSize(9)
                                .FontColor(Colors.Grey.Darken1);

                            left.Item()
                                .Text($"Date: {_data.GeneratedAt:dd.MM.yyyy HH:mm}")
                                .FontSize(9)
                                .FontColor(Colors.Grey.Darken1);
                        });

                    row.RelativeItem()
                        .AlignMiddle()
                        .AlignRight()
                        .Row(r =>
                        {
                            r.AutoItem()
                                .AlignMiddle()
                                .PaddingRight(6)
                                .Text("Generated by")
                                .FontSize(9)
                                .FontColor(Colors.Grey.Darken1);

                            r.AutoItem()
                                .AlignMiddle()
                                .MaxHeight(50)
                                .Image(_data.InstitutionLogo);
                        });
                });
            });
        }
    }
}