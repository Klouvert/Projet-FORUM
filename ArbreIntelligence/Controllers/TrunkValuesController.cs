using ArbreIntelligence.Data;
using ArbreIntelligence.DTOs.TrunkValues;
using ArbreIntelligence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArbreIntelligence.Controllers;

[ApiController]
[Route("api/trunk-values")]
public class TrunkValuesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IEnumerable<TrunkValueDto>> GetAll()
        => await db.TrunkValues
            .Select(t => new TrunkValueDto(t.Id, t.Name, t.Description))
            .ToListAsync();

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<TrunkValueDto>> Create(CreateTrunkValueRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 100)
            return BadRequest(new { error = "Le nom est requis (max 100 caractères)." });
        if (string.IsNullOrWhiteSpace(request.Description) || request.Description.Length > 500)
            return BadRequest(new { error = "La description est requise (max 500 caractères)." });

        var value = new TrunkValue
        {
            Id          = Guid.NewGuid(),
            Name        = request.Name.Trim(),
            Description = request.Description.Trim(),
        };

        db.TrunkValues.Add(value);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new TrunkValueDto(value.Id, value.Name, value.Description));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TrunkValueDto>> Update(Guid id, CreateTrunkValueRequest request)
    {
        var value = await db.TrunkValues.FindAsync(id);
        if (value is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 100)
            return BadRequest(new { error = "Le nom est requis (max 100 caractères)." });

        value.Name        = request.Name.Trim();
        value.Description = request.Description.Trim();
        await db.SaveChangesAsync();

        return Ok(new TrunkValueDto(value.Id, value.Name, value.Description));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var value = await db.TrunkValues.FindAsync(id);
        if (value is null) return NotFound();

        db.TrunkValues.Remove(value);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
