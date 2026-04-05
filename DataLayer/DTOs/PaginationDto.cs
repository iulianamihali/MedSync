namespace MedSync.DataLayer.DTOs
{
    public class PaginationDto<T>
    {
        public List<T> Rows { get; set; }
        public int TotalCount { get; set; }
    }
}
