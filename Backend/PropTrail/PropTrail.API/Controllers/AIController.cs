using Microsoft.AspNetCore.Mvc;
using PropTrail.API.Data;
using PropTrail.API.Models;
using System;
using System.Linq;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AIController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/ai/predict-scoring/{leadId}
        [HttpPost("predict-scoring/{leadId}")]
        public IActionResult PredictScoring(int leadId)
        {
            var lead = _context.Leads.Find(leadId);
            if (lead == null)
                return NotFound();

            int score = 10; // Base score

            // 1. Status weight
            if (lead.Status == "Negotiation" || lead.Status == "Deal Won") score += 30;
            else if (lead.Status == "Site Visit Scheduled" || lead.Status == "Site Visit Planned" || lead.Status == "Site Visit Completed") score += 20;
            else if (lead.Status == "Inquiry" || lead.Status == "Contacted" || lead.Status == "Follow-up Scheduled") score += 10;
            else if (lead.Status == "Lost") score = 5;

            // 2. Priority tag weight
            if (lead.PriorityTag == "Hot") score += 25;
            else if (lead.PriorityTag == "Warm") score += 15;
            else if (lead.PriorityTag == "Cold") score += 5;

            // 3. Budget span completeness
            if (lead.MinBudget.HasValue && lead.MaxBudget.HasValue)
            {
                score += 15;
            }

            // 4. Completed visits weight
            var completedVisits = _context.Visits.Count(v => v.LeadId == leadId && v.Status == "Completed");
            score += Math.Min(completedVisits * 15, 30);

            // 5. Recency weight
            if (lead.LastContactedDate.HasValue)
            {
                var daysSinceContact = (DateTime.UtcNow - lead.LastContactedDate.Value).TotalDays;
                if (daysSinceContact <= 3) score += 10;
                else if (daysSinceContact <= 7) score += 5;
            }

            lead.LeadScore = Math.Clamp(score, 0, 100);
            _context.SaveChanges();

            return Ok(new { LeadId = lead.Id, LeadScore = lead.LeadScore, Explanation = $"Score of {lead.LeadScore} calculated based on lifecycle status, budget specifications, and completed property visits." });
        }

        // POST: api/ai/smart-assign/{leadId}
        [HttpPost("smart-assign/{leadId}")]
        public IActionResult SmartAssign(int leadId)
        {
            var lead = _context.Leads.Find(leadId);
            if (lead == null)
                return NotFound();

            var brokers = _context.Brokers.Where(b => b.Role == "Broker" || b.Role == "Owner").ToList();
            if (!brokers.Any())
                return BadRequest("No brokers available for assignment.");

            var brokerLoads = brokers.Select(b => new
            {
                Broker = b,
                Load = _context.Leads.Count(l => l.AssignedBrokerId == b.Id && l.Status != "Lost")
            })
            .OrderBy(x => x.Load)
            .ToList();

            var targetBroker = brokerLoads.First().Broker;
            lead.AssignedBrokerId = targetBroker.Id;
            lead.FollowUpNotes = $"Smart-assigned to {targetBroker.FirstName} {targetBroker.LastName} due to queue workload optimization.";
            
            _context.SaveChanges();

            return Ok(new { LeadId = lead.Id, AssignedBrokerId = lead.AssignedBrokerId, BrokerName = $"{targetBroker.FirstName} {targetBroker.LastName}", Message = "Lead assigned successfully." });
        }
    }
}
