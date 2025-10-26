using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using MedSync.DataLayer.Enums;
using System.Security.Claims;
namespace MedSync.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizeUserTypeAttribute : Attribute, IAuthorizationFilter
    {
        private readonly UserType[] _allowedUserTypes;
        public AuthorizeUserTypeAttribute(params UserType[] allowedUserTypes)
        {
            _allowedUserTypes = allowedUserTypes;
        }
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }
            var userTypeClaim = context.HttpContext.User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(userTypeClaim))
            {
                context.Result = new ForbidResult();
                return;
            }
            if (!Enum.TryParse<UserType>(userTypeClaim, out var userType))
            {
                context.Result = new ForbidResult();
                return;
            }
            if (!_allowedUserTypes.Contains(userType))
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }

}
