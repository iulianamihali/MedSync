using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace MedSync.Services
{
    public class MailerSendService
    {
        private readonly string _apiKey;
        private readonly HttpClient _httpClient;

        public MailerSendService(IConfiguration configuration)
        {
            _apiKey = configuration["MailerSend:ApiKey"];
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Bearer",
                _apiKey
            );
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string message)
        {
            var url = "https://api.mailersend.com/v1/email";

            var body = new
            {
                from = new
                {
                    email = "noreply@test-ywj2lpn1x2kg7oqz.mlsender.net",
                    name = "MedSync",
                },
                to = new[] { new { email = toEmail } },
                subject = subject,
                html = message,
            };

            var json = System.Text.Json.JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"MailerSend error: {errorBody}");
            }
            return response.IsSuccessStatusCode;
        }
    }
}
