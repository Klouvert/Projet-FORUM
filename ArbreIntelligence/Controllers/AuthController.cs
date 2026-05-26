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
public class AuthController(
    UserManager<ApplicationUser> userManager,
    JwtSettings jwt
) : ControllerBase
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

        return Ok(await BuildResponse(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized(new { error = "Email ou mot de passe incorrect." });

        return Ok(await BuildResponse(user));
    }

    private async Task<AuthResponse> BuildResponse(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var isAdmin = roles.Contains("Admin");
        var expiresAt = DateTime.UtcNow.AddHours(jwt.ExpiryHours);
        var token = GenerateToken(user, expiresAt, roles);
        return new AuthResponse(token, user.Id.ToString(), user.DisplayName, user.Email!, expiresAt, isAdmin);
    }

    private string GenerateToken(ApplicationUser user, DateTime expiresAt, IList<string> roles)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.DisplayName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

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
