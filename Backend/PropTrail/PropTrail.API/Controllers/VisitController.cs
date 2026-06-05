using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropTrail.API.Data;
using PropTrail.API.Models;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VisitController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VisitController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("db-debug")]
        public async Task<IActionResult> GetDbDebug()
        {
            var brokers = await _context.Brokers.Select(b => new { b.Id, b.FirstName, b.LastName, b.Role, b.Email }).ToListAsync();
            var leads = await _context.Leads.Select(l => new { l.Id, l.CustomerName, l.Email, l.AssignedBrokerId }).ToListAsync();
            var properties = await _context.Properties.Select(p => new { p.Id, p.PropertyName, p.status }).ToListAsync();
            var visits = await _context.Visits.Select(v => new { v.VisitId, v.LeadId, v.BrokerId, v.PropertyId, v.Status }).ToListAsync();
            return Ok(new { brokers, leads, properties, visits });
        }

        // GET: api/visit
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Visit>>> GetVisits()
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                            ?? User.FindFirst("sub")?.Value;

            IQueryable<Visit> query = _context.Visits
                .Include(v => v.Broker)
                .Include(v => v.Lead)
                .Include(v => v.Property);

            if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
            {
                var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
                if (lead != null)
                {
                    query = query.Where(v => v.LeadId == lead.Id);
                }
                else
                {
                    return Ok(new List<Visit>());
                }
            }

            var visits = await query.ToListAsync();
            return Ok(visits);
        }

        // GET: api/visit/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Visit>> GetVisit(int id)
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                            ?? User.FindFirst("sub")?.Value;

            var visit = await _context.Visits
                .Include(v => v.Broker)
                .Include(v => v.Lead)
                .Include(v => v.Property)
                .FirstOrDefaultAsync(v => v.VisitId == id);

            if (visit == null)
                return NotFound();

            if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
            {
                var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
                if (lead == null || visit.LeadId != lead.Id)
                {
                    return Forbid();
                }
            }

            return Ok(visit);
        }

        [HttpPost]
        public async Task<ActionResult<Visit>> AddVisit([FromBody] Visit visit)
        {
            try
            {
                if (visit == null)
                    return BadRequest();

                var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                                ?? User.FindFirst("sub")?.Value;

                if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
                {
                    var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
                    if (lead == null)
                    {
                        return BadRequest("Buyer lead profile not found.");
                    }
                    visit.LeadId = lead.Id;
                    visit.BrokerId = lead.AssignedBrokerId ?? _context.Brokers.FirstOrDefault(b => b.Role != "Buyer")?.Id ?? 1;
                    visit.Status = "Scheduled";
                }

                visit.VisitDate = DateTime.SpecifyKind(
                    visit.VisitDate,
                    DateTimeKind.Utc
                );

                _context.Visits.Add(visit);
                await _context.SaveChangesAsync();

                return Ok(visit);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DEBUG AddVisit] Exception: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[DEBUG AddVisit] InnerException: {ex.InnerException.Message}");
                }
                return StatusCode(500, new 
                { 
                    message = "An error occurred while creating the visit.",
                    error = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace 
                });
            }
        }

        // PUT: api/visit/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVisit(int id, [FromBody] Visit visit)
        {
            if (visit == null)
                return BadRequest();

            if (visit.VisitId != 0 && visit.VisitId != id)
                return BadRequest("Route id and visit id do not match.");

            var existing = await _context.Visits.FindAsync(id);
            if (existing == null)
                return NotFound();

            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                            ?? User.FindFirst("sub")?.Value;

            if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
            {
                var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
                if (lead == null || existing.LeadId != lead.Id)
                {
                    return Forbid();
                }
            }

            existing.BrokerId = visit.BrokerId;
            existing.LeadId = visit.LeadId;
            existing.PropertyId = visit.PropertyId;
            existing.VisitDate = visit.VisitDate == default
                ? existing.VisitDate
                : DateTime.SpecifyKind(
                    visit.VisitDate,
                    DateTimeKind.Utc
                  ); 
            existing.Status = visit.Status;
            existing.Notes = visit.Notes;
            existing.ClientFeedback = visit.ClientFeedback;
            existing.ClientRating = visit.ClientRating;
            existing.FeedbackStatus = visit.FeedbackStatus;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/visit/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVisit(int id)
        {
            var visit = await _context.Visits.FindAsync(id);

            if (visit == null)
                return NotFound();

            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                            ?? User.FindFirst("sub")?.Value;

            if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
            {
                var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
                if (lead == null || visit.LeadId != lead.Id)
                {
                    return Forbid();
                }
            }

            _context.Visits.Remove(visit);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}