using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropTrail.API.Data;
using PropTrail.API.Models;

[Route("api/[controller]")]
[ApiController]
public class DealController : ControllerBase
{
    private readonly AppDbContext _context;

    public DealController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Deal>>> GetDeals()
    {
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                        ?? User.FindFirst("sub")?.Value;

        IQueryable<Deal> query = _context.Deals
            .Include(d => d.Lead)
            .Include(d => d.Property);

        if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
        {
            var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
            if (lead != null)
            {
                query = query.Where(d => d.LeadId == lead.Id);
            }
            else
            {
                return Ok(new List<Deal>());
            }
        }

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Deal>> GetDeal(int id)
    {
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                        ?? User.FindFirst("sub")?.Value;

        var deal = await _context.Deals
            .Include(d => d.Lead)
            .Include(d => d.Property)
            .FirstOrDefaultAsync(d => d.DealId == id);

        if (deal == null)
        {
            return NotFound();
        }

        if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
        {
            var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
            if (lead == null || deal.LeadId != lead.Id)
            {
                return Forbid();
            }
        }

        return deal;
    }

    [HttpPost]
    public async Task<ActionResult<Deal>> AddDeal(Deal deal)
    {
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (userRole == "Buyer")
        {
            return Forbid();
        }

        if (deal.DealDate.HasValue)
        {
            deal.DealDate = DateTime.SpecifyKind(deal.DealDate.Value, DateTimeKind.Utc);
        }
        if (deal.CommissionRate.HasValue && deal.DealAmount.HasValue)
        {
            deal.CommissionAmount = (deal.DealAmount.Value * deal.CommissionRate.Value) / 100m;
        }
        _context.Deals.Add(deal);
        await _context.SaveChangesAsync();
        return Ok(deal); 
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDeal(
        int id,
        Deal deal
        )
    {
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (userRole == "Buyer")
        {
            return Forbid();
        }

        if (id != deal.DealId)
        {
            return BadRequest();
        }

        var existingDeal = await _context.Deals.FindAsync(id);
        if (existingDeal == null)
        {
            return NotFound();
        }

        existingDeal.BrokerId = deal.BrokerId;
        existingDeal.LeadId = deal.LeadId;
        existingDeal.PropertyId = deal.PropertyId;
        existingDeal.DealAmount = deal.DealAmount;

        if (deal.DealDate.HasValue)
        {
            existingDeal.DealDate = DateTime.SpecifyKind(deal.DealDate.Value, DateTimeKind.Utc);
        }
        else
        {
            existingDeal.DealDate = null;
        }

        existingDeal.Status = deal.Status;

        if (deal.Stage != null)
        {
            existingDeal.Stage = deal.Stage;
        }

        // Pipeline and Commission additions
        existingDeal.PipelineOrder = deal.PipelineOrder;
        existingDeal.CommissionRate = deal.CommissionRate;
        if (deal.CommissionRate.HasValue && deal.DealAmount.HasValue)
        {
            existingDeal.CommissionAmount = (deal.DealAmount.Value * deal.CommissionRate.Value) / 100m;
        }
        else
        {
            existingDeal.CommissionAmount = deal.CommissionAmount;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDeal(int id)
    {
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (userRole == "Buyer")
        {
            return Forbid();
        }

        var deal = await _context.Deals.FindAsync(id);

        if (deal == null)
        
        { 
        return NotFound(); 
        }
        _context.Deals.Remove(deal);
                await _context.SaveChangesAsync();
        return NoContent();
    }

}
