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
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AmendmentDto>> Update(Guid id, UpdateAmendmentRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var amendment = await db.Amendments
            .Include(a => a.Votes).Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id);
        if (amendment is null) return NotFound();

        var isAdmin = User.IsInRole("Admin");
        if (amendment.AuthorId != userId && !isAdmin) return Forbid();

        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { error = "Le contenu est requis." });

        amendment.Content = request.Content.Trim();
        amendment.Title   = request.Content.Length > 60
            ? request.Content[..60] + "…"
            : request.Content;
        await db.SaveChangesAsync();

        return Ok(new AmendmentDto(
            amendment.Id, amendment.Title, amendment.Content, amendment.IsMerged,
            amendment.Votes.Any() ? amendment.Votes.Average(v => v.Score) : 0,
            amendment.Votes.Count, amendment.CreatedAt,
            amendment.Author.DisplayName, amendment.AuthorId));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var amendment = await db.Amendments.FindAsync(id);
        if (amendment is null) return NotFound();
        db.Amendments.Remove(amendment);
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
