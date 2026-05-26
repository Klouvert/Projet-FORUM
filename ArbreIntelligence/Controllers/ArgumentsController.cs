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
public class ArgumentsController(AppDbContext db) : ControllerBase
{
    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ArgumentDto>> Update(Guid id, UpdateArgumentRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var argument = await db.Arguments
            .Include(a => a.Votes).Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id);
        if (argument is null) return NotFound();

        var isAdmin = User.IsInRole("Admin");
        if (argument.AuthorId != userId && !isAdmin) return Forbid();

        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { error = "Le contenu est requis." });

        argument.Content = request.Content.Trim();
        await db.SaveChangesAsync();

        return Ok(new ArgumentDto(
            argument.Id, argument.Content,
            argument.Side == ArgumentSide.For ? "pour" : "contre",
            argument.Votes.Any() ? argument.Votes.Average(v => v.Score) : 0,
            argument.Votes.Count, argument.CreatedAt,
            argument.Author.DisplayName, argument.AuthorId));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var argument = await db.Arguments.FindAsync(id);
        if (argument is null) return NotFound();
        db.Arguments.Remove(argument);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPut("{id:guid}/vote")]
    public async Task<IActionResult> Vote(Guid id, VoteRequest request)
    {
        if (request.Score < 1 || request.Score > 10)
            return BadRequest(new { error = "Le score doit être entre 1 et 10." });

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var argument = await db.Arguments.FindAsync(id);
        if (argument is null) return NotFound();

        var existing = await db.ArgumentVotes
            .FirstOrDefaultAsync(v => v.ArgumentId == id && v.UserId == userId);

        if (existing is not null)
            existing.Score = request.Score;
        else
            db.ArgumentVotes.Add(new ArgumentVote
            {
                Id = Guid.NewGuid(),
                ArgumentId = id,
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
