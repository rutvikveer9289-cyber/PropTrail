using Microsoft.AspNetCore.Mvc;
using PropTrail.API.Data;
using PropTrail.API.Models;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeadController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LeadController(AppDbContext context)
        {
            _context = context;
        }

        // Get all leads
        [HttpGet]
        public IActionResult Get()
        {
            var leads = _context.Leads.ToList();

            return Ok(leads);
        }

        // Get lead by ID
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var lead = _context.Leads.Find(id);

            if (lead == null)
                return NotFound();

            return Ok(lead);
        }

        // Add lead
        [HttpPost]
        public IActionResult AddLead(Lead lead)
        {
            if (lead.LastContactedDate.HasValue)
            {
                lead.LastContactedDate = DateTime.SpecifyKind(lead.LastContactedDate.Value, DateTimeKind.Utc);
            }
            if (lead.FollowUpReminderDate.HasValue)
            {
                lead.FollowUpReminderDate = DateTime.SpecifyKind(lead.FollowUpReminderDate.Value, DateTimeKind.Utc);
            }
            _context.Leads.Add(lead);

            _context.SaveChanges();

            return Ok(lead);
        }

        // Update lead
        [HttpPut("{id}")]
        public IActionResult Update(int id, Lead lead)
        {
            var existingLead = _context.Leads.Find(id);

            if (existingLead == null)
                return NotFound();

            existingLead.CustomerName = lead.CustomerName;
            existingLead.Mobile = lead.Mobile;
            existingLead.Email = lead.Email;
            existingLead.InterestedProperty = lead.InterestedProperty;
            existingLead.Status = lead.Status;
            existingLead.MinBudget = lead.MinBudget;
            existingLead.MaxBudget = lead.MaxBudget;
            existingLead.PreferredLocality = lead.PreferredLocality;
            existingLead.PreferredBhk = lead.PreferredBhk;
            existingLead.PropertyStatusPreference = lead.PropertyStatusPreference;
            existingLead.PriorityTag = lead.PriorityTag;
            existingLead.LastContactedDate = lead.LastContactedDate.HasValue
                ? DateTime.SpecifyKind(lead.LastContactedDate.Value, DateTimeKind.Utc)
                : null;
            
            // Phase 13 fields mapping
            existingLead.Source = lead.Source;
            existingLead.LeadScore = lead.LeadScore;
            existingLead.AssignedBrokerId = lead.AssignedBrokerId;
            existingLead.FollowUpReminderDate = lead.FollowUpReminderDate.HasValue
                ? DateTime.SpecifyKind(lead.FollowUpReminderDate.Value, DateTimeKind.Utc)
                : null;
            existingLead.FollowUpNotes = lead.FollowUpNotes;

            _context.SaveChanges();

            return Ok(existingLead);
        }

        // Delete lead
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var lead = _context.Leads.Find(id);

            if (lead == null)
                return NotFound();

            _context.Leads.Remove(lead);

            _context.SaveChanges();

            return Ok();
        }
    }
}