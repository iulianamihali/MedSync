using Google.GenAI;

namespace MedSync.Services.AI
{
    public static class GeminiRetryHelper
    {
        public static async Task<T> ExecuteWithRetryAsync<T>(
            Func<Task<T>> operation,
            int maxRetries = 3,
            int baseDelayMs = 600
        )
        {
            for (var attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    return await operation();
                }
                catch (ServerError) when (attempt < maxRetries)
                {
                    var delay = baseDelayMs * (int)Math.Pow(2, attempt - 1);
                    await Task.Delay(delay);
                }
            }

            return await operation();
        }
    }
}
