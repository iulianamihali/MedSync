using MedSync.DataLayer.DTOs;
using MedSync.DataLayer.DTOs.User;
using MedSync.DataLayer.Enums;

namespace MedSync.Services.IServices
{
    public interface IUserService
    {
        Task<PaginationDto<UsersDataTableResponseDto>> GetDataTableUsersAsync(int page, UserType userType);
        Task<UserSettingsDataResponseDto> GetUserSettingsDataAsync(Guid id);
    }
}
