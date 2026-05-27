using ArbreIntelligence.Data;
using ArbreIntelligence.DTOs.Tree;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArbreIntelligence.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TreeController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<TreeDto> Get()
    {
        var trunkValues = await db.TrunkValues
            .Include(v => v.Votes)
            .Select(v => new TrunkValueDto(
                v.Id, v.Name, v.Description,
                v.Votes.Any() ? v.Votes.Average(x => x.Score) : 0,
                v.Votes.Count))
            .ToListAsync();

        var branches = await db.Branches
            .Include(b => b.Ideas)
            .Select(b => new BranchDto(
                b.Id, b.Name, b.Description,
                b.Ideas.Count, b.CreatedAt, b.ParentBranchId))
            .ToListAsync();

        var ideas = await db.Ideas
            .Include(i => i.Votes)
            .Include(i => i.Author)
            .Select(i => new IdeaNodeDto(
                i.Id, i.Title, i.Content,
                (int)i.Level, i.Status.ToString(), i.Domain.ToString().ToLower(),
                i.Votes.Any() ? i.Votes.Average(x => x.Score) : 0,
                i.Votes.Count, i.CreatedAt,
                i.Author.DisplayName, i.BranchId))
            .ToListAsync();

        return new TreeDto(trunkValues, branches, ideas);
    }
}
