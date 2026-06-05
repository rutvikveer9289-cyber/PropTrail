using Microsoft.AspNetCore.Mvc;
using PropTrail.API.Data;
using PropTrail.API.Models;
using System;
using System.Linq;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeadActivityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LeadActivityController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/leadactivity/lead/{leadId}
        [HttpGet("lead/{leadId}")]
        public IActionResult GetActivitiesForLead(int leadId)
        {
            var activities = _context.LeadActivities
                .Where(a => a.LeadId == leadId)
                .OrderByDescending(a => a.Timestamp)
                .ToList();

            return Ok(activities);
        }

        // POST: api/leadactivity
        [HttpPost]
        public IActionResult AddActivity([FromBody] LeadActivity activity)
        {
            if (activity == null)
                return BadRequest();

            activity.Timestamp = DateTime.UtcNow;
            
            _context.LeadActivities.Add(activity);
            
            var lead = _context.Leads.Find(activity.LeadId);
            if (lead != null)
            {
                lead.LastContactedDate = DateTime.UtcNow;
            }

            _context.SaveChanges();
            return Ok(activity);
        }
    }
}
