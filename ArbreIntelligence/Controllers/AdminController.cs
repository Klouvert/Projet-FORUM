using System.Security.Claims;
using ArbreIntelligence.DTOs.Admin;
using ArbreIntelligence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ArbreIntelligence.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserSummaryDto>>> GetUsers()
    {
        var users = userManager.Users.OrderBy(u => u.DisplayName).ToList();
        var result = new List<UserSummaryDto>();
        foreach (var u in users)
        {
            var isAdmin = await userManager.IsInRoleAsync(u, "Admin");
            result.Add(new UserSummaryDto(u.Id.ToString(), u.DisplayName, u.Email!, isAdmin));
        }
        return Ok(result);
    }

    [HttpPost("users/{id:guid}/make-admin")]
    public async Task<IActionResult> MakeAdmin(Guid id)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();
        if (!await userManager.IsInRoleAsync(user, "Admin"))
            await userManager.AddToRoleAsync(user, "Admin");
        return NoContent();
    }

    [HttpDelete("users/{id:guid}/make-admin")]
    public async Task<IActionResult> RemoveAdmin(Guid id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id.ToString() == currentUserId)
            return BadRequest(new { error = "Vous ne pouvez pas retirer votre propre rôle admin." });

        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();
        if (await userManager.IsInRoleAsync(user, "Admin"))
            await userManager.RemoveFromRoleAsync(user, "Admin");
        return NoContent();
    }
}
