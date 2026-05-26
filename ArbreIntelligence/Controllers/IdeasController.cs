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
public class IdeasController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<IdeaSummaryDto>> GetAll()
    {
        return await db.Ideas
            .Include(i => i.Votes)
            .Include(i => i.Author)
            .Select(i => new IdeaSummaryDto(
                i.Id, i.Title, i.Content,
                (int)i.Level, i.Status.ToString(), i.Domain.ToString().ToLower(),
                i.Votes.Any() ? i.Votes.Average(x => x.Score) : 0,
                i.Votes.Count, i.CreatedAt,
                i.Author.DisplayName, i.BranchId))
            .ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<IdeaDetailDto>> GetById(Guid id)
    {
        var idea = await db.Ideas
            .Include(i => i.Votes)
            .Include(i => i.Author)
            .Include(i => i.Arguments).ThenInclude(a => a.Votes)
            .Include(i => i.Arguments).ThenInclude(a => a.Author)
            .Include(i => i.Amendments).ThenInclude(am => am.Votes)
            .Include(i => i.Amendments).ThenInclude(am => am.Author)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (idea is null) return NotFound();

        return new IdeaDetailDto(
            idea.Id, idea.Title, idea.Content,
            (int)idea.Level, idea.Status.ToString(), idea.Domain.ToString().ToLower(),
            idea.Votes.Any() ? idea.Votes.Average(x => x.Score) : 0,
            idea.Votes.Count, idea.CreatedAt, idea.UpdatedAt,
            idea.Author.DisplayName, idea.AuthorId, idea.BranchId,
            idea.Arguments.Select(a => new ArgumentDto(
                a.Id, a.Content,
                a.Side == ArgumentSide.For ? "pour" : "contre",
                a.Votes.Any() ? a.Votes.Average(x => x.Score) : 0,
                a.Votes.Count, a.CreatedAt, a.Author.DisplayName, a.AuthorId)),
            idea.Amendments.Select(am => new AmendmentDto(
                am.Id, am.Title, am.Content, am.IsMerged,
                am.Votes.Any() ? am.Votes.Average(x => x.Score) : 0,
                am.Votes.Count, am.CreatedAt, am.Author.DisplayName, am.AuthorId)));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<IdeaSummaryDto>> Create(CreateIdeaRequest request)
    {
        var authorId = GetUserId();
        if (authorId is null) return Unauthorized();

        var author = await db.Users.FindAsync(authorId);
        if (author is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length > 200)
            return BadRequest(new { error = "Le titre est requis et ne peut pas dépasser 200 caractères." });
        if (string.IsNullOrWhiteSpace(request.Content) || request.Content.Length > 2000)
            return BadRequest(new { error = "Le contenu est requis et ne peut pas dépasser 2000 caractères." });
        if (!Enum.TryParse<IdeaDomain>(request.Domain, ignoreCase: true, out var domain))
            return BadRequest(new { error = "Domaine invalide. Valeurs acceptées : ecology, social, economy, culture." });

        var idea = new Idea
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            AuthorId = authorId.Value,
            BranchId = request.BranchId,
            Level = IdeaLevel.Bud,
            Status = IdeaStatus.Active,
            Domain = domain,
        };

        db.Ideas.Add(idea);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = idea.Id },
            new IdeaSummaryDto(idea.Id, idea.Title, idea.Content,
                (int)idea.Level, idea.Status.ToString(), idea.Domain.ToString().ToLower(),
                0, 0, idea.CreatedAt, author.DisplayName, idea.BranchId));
    }

    [Authorize]
    [HttpPost("{id:guid}/arguments")]
    public async Task<ActionResult<ArgumentDto>> AddArgument(Guid id, CreateArgumentRequest request)
    {
        var authorId = GetUserId();
        if (authorId is null) return Unauthorized();

        var idea = await db.Ideas.FindAsync(id);
        if (idea is null) return NotFound();

        var author = await db.Users.FindAsync(authorId);
        if (author is null) return Unauthorized();

        var side = request.Side.ToLower() == "pour" ? ArgumentSide.For : ArgumentSide.Against;

        var argument = new Argument
        {
            Id = Guid.NewGuid(),
            IdeaId = id,
            AuthorId = authorId.Value,
            Side = side,
            Content = request.Content,
        };

        db.Arguments.Add(argument);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id },
            new ArgumentDto(argument.Id, argument.Content,
                side == ArgumentSide.For ? "pour" : "contre",
                0, 0, argument.CreatedAt, author.DisplayName, argument.AuthorId));
    }

    [Authorize]
    [HttpPost("{id:guid}/amendments")]
    public async Task<ActionResult<AmendmentDto>> AddAmendment(Guid id, CreateAmendmentRequest request)
    {
        var authorId = GetUserId();
        if (authorId is null) return Unauthorized();

        var idea = await db.Ideas.FindAsync(id);
        if (idea is null) return NotFound();

        var author = await db.Users.FindAsync(authorId);
        if (author is null) return Unauthorized();

        var title = request.Content.Length > 60
            ? request.Content[..60] + "…"
            : request.Content;

        var amendment = new Amendment
        {
            Id = Guid.NewGuid(),
            ParentIdeaId = id,
            AuthorId = authorId.Value,
            Title = title,
            Content = request.Content,
        };

        db.Amendments.Add(amendment);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id },
            new AmendmentDto(amendment.Id, amendment.Title, amendment.Content,
                false, 0, 0, amendment.CreatedAt, author.DisplayName, amendment.AuthorId));
    }

    [Authorize]
    [HttpPut("{id:guid}/promote")]
    public async Task<ActionResult<IdeaSummaryDto>> Promote(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var idea = await db.Ideas
            .Include(i => i.Votes)
            .Include(i => i.Author)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (idea is null) return NotFound();
        if (idea.AuthorId != userId) return Forbid();
        if (idea.Level == IdeaLevel.Leaf)
            return BadRequest(new { error = "L'idée est déjà au niveau maximal." });

        idea.Level = (IdeaLevel)((int)idea.Level + 1);
        idea.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new IdeaSummaryDto(
            idea.Id, idea.Title, idea.Content,
            (int)idea.Level, idea.Status.ToString(), idea.Domain.ToString().ToLower(),
            idea.Votes.Any() ? idea.Votes.Average(x => x.Score) : 0,
            idea.Votes.Count, idea.CreatedAt, idea.Author.DisplayName, idea.BranchId));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<IdeaSummaryDto>> Update(Guid id, UpdateIdeaRequest request)
    {
        var idea = await db.Ideas
            .Include(i => i.Votes).Include(i => i.Author)
            .FirstOrDefaultAsync(i => i.Id == id);
        if (idea is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length > 200)
            return BadRequest(new { error = "Le titre est requis (max 200 caractères)." });
        if (string.IsNullOrWhiteSpace(request.Content) || request.Content.Length > 2000)
            return BadRequest(new { error = "Le contenu est requis (max 2000 caractères)." });

        idea.Title   = request.Title.Trim();
        idea.Content = request.Content.Trim();
        idea.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new IdeaSummaryDto(
            idea.Id, idea.Title, idea.Content,
            (int)idea.Level, idea.Status.ToString(), idea.Domain.ToString().ToLower(),
            idea.Votes.Any() ? idea.Votes.Average(x => x.Score) : 0,
            idea.Votes.Count, idea.CreatedAt, idea.Author.DisplayName, idea.BranchId));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var idea = await db.Ideas.FindAsync(id);
        if (idea is null) return NotFound();

        db.Ideas.Remove(idea);
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

        var idea = await db.Ideas.FindAsync(id);
        if (idea is null) return NotFound();

        var existing = await db.IdeaVotes
            .FirstOrDefaultAsync(v => v.IdeaId == id && v.UserId == userId);

        if (existing is not null)
            existing.Score = request.Score;
        else
            db.IdeaVotes.Add(new IdeaVote
            {
                Id = Guid.NewGuid(),
                IdeaId = id,
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
