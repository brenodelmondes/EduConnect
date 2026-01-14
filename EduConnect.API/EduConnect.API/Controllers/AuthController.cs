// Controllers\AuthController.cs

using EduConnect.API.Services.UseCases.Usuario;
using EduConnect.API.Services.UseCases.Usuario.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public AuthController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _usuarioService.LoginAsync(loginDto);
            if (result == null)
            {
                return Unauthorized("Usuário ou senha inválidos.");
            }

            return Ok(result);
        }
    }
}