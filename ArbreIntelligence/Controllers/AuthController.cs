using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ArbreIntelligence.DTOs.Auth;
using ArbreIntelligence.Entities;
using ArbreIntelligence.Settings;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ArbreIntelligence.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(UserManager<ApplicationUser> userManager, JwtSettings jwt) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (await userManager.FindByEmailAsync(request.Email) is not null)
            return Conflict(new { error = "Cette adresse email est déjà utilisée." });

        var user = new ApplicationUser
        {
            UserName = request.UserName,
            Email = request.Email,
            DisplayName = request.DisplayName,
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        return Ok(BuildResponse(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new { error = "Email ou mot de passe incorrect." });

        return Ok(BuildResponse(user));
    }

    private AuthResponse BuildResponse(ApplicationUser user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(jwt.ExpiryHours);
        var token = GenerateToken(user, expiresAt);
        return new AuthResponse(token, user.Id.ToString(), user.DisplayName, user.Email!, expiresAt);
    }

    private string GenerateToken(ApplicationUser user, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: jwt.Issuer,
            audience: jwt.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
