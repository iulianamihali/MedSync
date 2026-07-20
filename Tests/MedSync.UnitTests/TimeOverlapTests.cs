using MedSync;

namespace MedSync.UnitTests
{
    public class TimeOverlapTests
    {
        [Fact]
        public void Overlaps_WhenIntervalsAreIdentical_ReturnsTrue()
        {
            var result = TimeRangeHelper.Overlaps(
                new DateTime(2025, 1, 1, 10, 0, 0),
                new DateTime(2025, 1, 1, 10, 30, 0),
                new DateTime(2025, 1, 1, 10, 0, 0),
                new DateTime(2025, 1, 1, 10, 30, 0));

            Assert.True(result);
        }

        [Fact]
        public void Overlaps_WhenIntervalsPartiallyOverlap_ReturnsTrue()
        {
            var result = TimeRangeHelper.Overlaps(
                new DateTime(2025, 1, 1, 10, 0, 0),
                new DateTime(2025, 1, 1, 10, 30, 0),
                new DateTime(2025, 1, 1, 10, 15, 0),
                new DateTime(2025, 1, 1, 10, 45, 0));

            Assert.True(result);
        }

        [Fact]
        public void Overlaps_WhenIntervalsAreBackToBack_ReturnsFalse()
        {
            var result = TimeRangeHelper.Overlaps(
                new DateTime(2025, 1, 1, 10, 0, 0),
                new DateTime(2025, 1, 1, 10, 30, 0),
                new DateTime(2025, 1, 1, 10, 30, 0),
                new DateTime(2025, 1, 1, 11, 0, 0));

            Assert.False(result);
        }

        [Fact]
        public void Overlaps_WhenIntervalsAreSeparate_ReturnsFalse()
        {
            var result = TimeRangeHelper.Overlaps(
                new DateTime(2025, 1, 1, 10, 0, 0),
                new DateTime(2025, 1, 1, 10, 30, 0),
                new DateTime(2025, 1, 1, 14, 0, 0),
                new DateTime(2025, 1, 1, 14, 30, 0));

            Assert.False(result);
        }
    }
}