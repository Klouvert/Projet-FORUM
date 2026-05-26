using System.Security.Claims;
using ArbreIntelligence.Data;
using ArbreIntelligence.DTOs.Branches;
using ArbreIntelligence.DTOs.Tree;
using ArbreIntelligence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArbreIntelligence.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BranchesController(AppDbContext db) : ControllerBase
{
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<BranchDto>> Create(CreateBranchRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 100)
            return BadRequest(new { error = "Le nom est requis et ne peut pas dépasser 100 caractères." });
        if (request.Description?.Length > 500)
            return BadRequest(new { error = "La description ne peut pas dépasser 500 caractères." });

        var branch = new Branch
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            CreatedByUserId = userId.Value,
        };

        db.Branches.Add(branch);
        await db.SaveChangesAsync();

        return Ok(new BranchDto(branch.Id, branch.Name, branch.Description, 0, branch.CreatedAt));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BranchDto>> Update(Guid id, CreateBranchRequest request)
    {
        var branch = await db.Branches.FindAsync(id);
        if (branch is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 100)
            return BadRequest(new { error = "Le nom est requis et ne peut pas dépasser 100 caractères." });

        branch.Name        = request.Name.Trim();
        branch.Description = request.Description?.Trim();
        await db.SaveChangesAsync();

        var ideaCount = await db.Ideas.CountAsync(i => i.BranchId == id);
        return Ok(new BranchDto(branch.Id, branch.Name, branch.Description, ideaCount, branch.CreatedAt));
    }

    private Guid? GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
