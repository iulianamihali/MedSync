namespace MedSync
{
    public static class TimeRangeHelper
    {
        public static bool Overlaps(DateTime start1, DateTime end1, DateTime start2, DateTime end2)
        {
            return start1 < end2 && end1 > start2;
        }
    }
}