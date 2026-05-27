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

        if (request.ParentBranchId is not null)
        {
            var parent = await db.Branches.FindAsync(request.ParentBranchId);
            if (parent is null)
                return BadRequest(new { error = "La branche parente n'existe pas." });

            var (parentLevel, hasCycle) = await GetBranchLevelAsync(request.ParentBranchId.Value);
            if (hasCycle)
                return BadRequest(new { error = "La hiérarchie des branches contient un cycle." });
            if (parentLevel >= 3)
                return BadRequest(new { error = "Profondeur maximale atteinte (3 niveaux)." });
        }

        var branch = new Branch
        {
            Id             = Guid.NewGuid(),
            Name           = request.Name.Trim(),
            Description    = request.Description?.Trim(),
            ParentBranchId = request.ParentBranchId,
            CreatedByUserId = userId.Value,
        };

        db.Branches.Add(branch);
        await db.SaveChangesAsync();

        return Ok(new BranchDto(branch.Id, branch.Name, branch.Description, 0, branch.CreatedAt, branch.ParentBranchId));
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
        return Ok(new BranchDto(branch.Id, branch.Name, branch.Description, ideaCount, branch.CreatedAt, branch.ParentBranchId));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var branch = await db.Branches
            .Include(b => b.ChildBranches)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (branch is null) return NotFound();

        if (branch.ChildBranches.Count > 0)
            return Conflict(new { error = "Impossible de supprimer une branche qui contient des sous-branches. Supprimez d'abord les sous-branches." });

        db.Branches.Remove(branch);
        await db.SaveChangesAsync();
        return NoContent();
    }

    /* ── Helpers ─────────────────────────────────────────────── */

    /// <summary>
    /// Remonte la chaîne des parents pour calculer le niveau (1 = racine).
    /// Détecte également les cycles éventuels.
    /// </summary>
    private async Task<(int level, bool hasCycle)> GetBranchLevelAsync(Guid branchId)
    {
        var visited = new HashSet<Guid>();
        int level = 0;
        Guid? current = branchId;

        while (current is not null)
        {
            if (!visited.Add(current.Value))
                return (level, true); // cycle détecté

            level++;

            var parentId = await db.Branches
                .AsNoTracking()
                .Where(b => b.Id == current.Value)
                .Select(b => (Guid?)b.ParentBranchId)
                .FirstOrDefaultAsync();

            current = parentId;
        }

        return (level, false);
    }

    private Guid? GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : null;
    }
}
