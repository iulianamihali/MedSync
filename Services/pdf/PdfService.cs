using MedSync.DataLayer.DTOs.Pdf;
using QuestPDF.Fluent;

namespace MedSync.Services.pdf
{
    public class PdfService
    {
        public byte[] GenerateMedicalReport(MedicalReportPdfDto data)
        {
            var document = new MedicalReportPdf(data);
            return document.GeneratePdf();
        }

        public byte[] GenerateMedicalReferral(MedicalReferralPdfDto data)
        {
            var document = new MedicalReferralPdf(data);
            return document.GeneratePdf();
        }
    }
}
