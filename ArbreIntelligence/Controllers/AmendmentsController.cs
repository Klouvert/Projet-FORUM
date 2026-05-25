using System.Security.Claims;
using ArbreIntelligence.Data;
using ArbreIntelligence.DTOs.Ideas;
using ArbreIntelligence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArbreIntelligence.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AmendmentsController(AppDbContext db) : ControllerBase
{
    [Authorize]
    [HttpPut("{id:guid}/vote")]
    public async Task<IActionResult> Vote(Guid id, VoteRequest request)
    {
        if (request.Score < 1 || request.Score > 10)
            return BadRequest(new { error = "Le score doit être entre 1 et 10." });

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var amendment = await db.Amendments.FindAsync(id);
        if (amendment is null) return NotFound();

        var existing = await db.AmendmentVotes
            .FirstOrDefaultAsync(v => v.AmendmentId == id && v.UserId == userId);

        if (existing is not null)
            existing.Score = request.Score;
        else
            db.AmendmentVotes.Add(new AmendmentVote
            {
                Id = Guid.NewGuid(),
                AmendmentId = id,
                UserId = userId.Value,
                Score = request.Score,
            });

        await db.SaveChangesAsync();
        return NoContent();
    }

    private Guid? GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
