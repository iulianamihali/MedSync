using MedSync.DataLayer.DTOs.Pdf;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MedSync.Services.pdf
{
    public class MedicalReferralPdf : IDocument
    {
        private readonly MedicalReferralPdfDto _data;

        public MedicalReferralPdf(MedicalReferralPdfDto data)
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
                column.Spacing(2);

                column.Item().Row(row =>
                {
                 
                    row.RelativeColumn()
                        .Column(col =>
                        {
                            col.Item()
                                .Text((_data.InstitutionName ?? "-").ToUpper())
                                .Bold()
                                .FontSize(18);

                            if (!string.IsNullOrWhiteSpace(_data.InstitutionAddress))
                            {
                                col.Item()
                                    .Text(_data.InstitutionAddress)
                                    .FontSize(10)
                                    .FontColor(Colors.Grey.Darken1);
                            }
                        });

                    row.RelativeColumn()
                        .AlignRight()
                        .AlignMiddle()
                        .Column(col =>
                        {
                            col.Item()
                                .Text((_data.DocumentTitle ?? "MEDICAL REFERRAL").ToUpper())
                                .Bold()
                                .FontSize(16);

                            col.Item()
                                .Text($"Issued on: {(_data.IssuedAt.HasValue ? _data.IssuedAt.Value.ToString("dd.MM.yyyy") : "-")}")
                                .FontSize(10);
                        });
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
                column.Spacing(8);

                column.Item().Text("Patient").Bold();

                column.Item().Row(row =>
                {
                    row.RelativeColumn().Text($"Name: {_data.PatientFirstName} {_data.PatientLastName}");
                    row.RelativeColumn().Text($"CNP: {_data.PatientCnp}");
                });

                column.Item().Row(row =>
                {
                    row.RelativeColumn().Text($"Date of Birth: {(_data.PatientDateOfBirth.HasValue ? _data.PatientDateOfBirth.Value.ToString("dd.MM.yyyy") : "-")}");
                    row.RelativeColumn().Text($"Consultation Date: {_data.ConsultationDate:dd.MM.yyyy}");
                });

                column.Item()
                    .PaddingVertical(10)
                    .LineHorizontal(1);

                column.Item()
                    .Text($"Referred to: {_data.SpecialtyName}")
                    .Bold();

                column.Item().PaddingTop(5).Text(text =>
                {
                    text.Span("Diagnosis: ").Bold();
                    text.Span(string.IsNullOrWhiteSpace(_data.Diagnosis) ? "-" : _data.Diagnosis);
                });

                column.Item().PaddingTop(5).Text(text =>
                {
                    text.Span("Reason for referral: ").Bold();
                    text.Span(_data.ReasonReferral);
                });

                column.Item().PaddingTop(5).Text(text =>
                {
                    text.Span("Clinical information: ").Bold();
                    text.Span(string.IsNullOrWhiteSpace(_data.RelevantClinicalInformation)
                        ? "-"
                        : _data.RelevantClinicalInformation);
                });

                column.Item()
                    .PaddingTop(10)
                    .Text($"Valid until: {_data.ExpirationDate:dd.MM.yyyy}")
                    .Bold();

                column.Item()
                    .PaddingVertical(15)
                    .LineHorizontal(1);

                column.Item()
                    .AlignRight()
                    .Column(col =>
                    {
                        col.Item()
                            .Text($"Dr. {_data.DoctorFullName}")
                            .Bold();

                        col.Item()
                            .PaddingTop(20)
                            .LineHorizontal(1);

                        col.Item()
                            .Text("Signature")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Darken1);
                    });
            });
        }

        private void ComposeFooter(IContainer container)
        {
            container.Column(column =>
            {
                column.Item()
                    .PaddingTop(5)
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
