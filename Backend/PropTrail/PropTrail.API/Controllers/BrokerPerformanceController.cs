using Microsoft.AspNetCore.Mvc;
using PropTrail.API.Data;
using System;
using System.Linq;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrokerPerformanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BrokerPerformanceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("leaderboard")]
        public IActionResult GetLeaderboard()
        {
            var brokers = _context.Brokers.Where(b => b.Role == "Broker").ToList();
            var leads = _context.Leads.ToList();
            var visits = _context.Visits.ToList();
            var deals = _context.Deals.ToList();

            var performance = brokers.Select(b =>
            {
                var assignedLeadsCount = leads.Count(l => l.AssignedBrokerId == b.Id);
                var completedVisitsCount = visits.Count(v => v.BrokerId == b.Id && v.Status == "Completed");
                
                var closedDeals = deals.Where(d => d.BrokerId == b.Id && d.Status == "Closed").ToList();
                var dealsClosedCount = closedDeals.Count;
                var revenueGenerated = closedDeals.Sum(d => d.DealAmount ?? 0);
                var commissionGenerated = closedDeals.Sum(d => d.CommissionAmount ?? 0);

                double conversionPercentage = 0;
                if (assignedLeadsCount > 0)
                {
                    conversionPercentage = Math.Round(((double)dealsClosedCount / assignedLeadsCount) * 100, 2);
                }

                return new
                {
                    BrokerId = b.Id,
                    BrokerName = $"{b.FirstName} {b.LastName}",
                    Email = b.Email,
                    Role = b.Role,
                    TotalLeadsAssigned = assignedLeadsCount,
                    SiteVisitsCompleted = completedVisitsCount,
                    DealsClosed = dealsClosedCount,
                    RevenueGenerated = revenueGenerated,
                    CommissionGenerated = commissionGenerated,
                    ConversionPercentage = conversionPercentage
                };
            })
            .OrderByDescending(p => p.RevenueGenerated)
            .ThenByDescending(p => p.ConversionPercentage)
            .ToList();

            return Ok(performance);
        }

        [HttpGet("comparison")]
        public IActionResult GetComparison()
        {
            var deals = _context.Deals.Where(d => d.Status == "Closed").ToList();
            var monthlyRevenue = deals
                .GroupBy(d => d.DealDate.HasValue ? d.DealDate.Value.ToString("MMM yyyy") : DateTime.UtcNow.ToString("MMM yyyy"))
                .Select(g => new
                {
                    Month = g.Key,
                    Revenue = g.Sum(d => d.DealAmount ?? 0),
                    Commission = g.Sum(d => d.CommissionAmount ?? 0)
                })
                .ToList();

            return Ok(new
            {
                MonthlyRevenue = monthlyRevenue
            });
        }
    }
}
