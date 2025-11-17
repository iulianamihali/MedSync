using MedSync.Attributes;
using MedSync.DataLayer.Enums;
using Microsoft.AspNetCore.Mvc;

namespace MedSync.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AuthorizeUserType(UserType.LocalAdmin)]
    public class LocalAdminController : ControllerBase
    {
       
    }
}
