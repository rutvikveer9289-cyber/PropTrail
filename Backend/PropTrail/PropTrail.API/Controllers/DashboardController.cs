using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropTrail.API.Data;
using PropTrail.API.Models;

namespace PropTrail.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<Dashboard>> GetDashboard()
        {
            var today = DateTime.UtcNow;

            var totalBrokers = await _context.Brokers.CountAsync();
            var totalProperties = await _context.Properties.CountAsync();

            var dealStats = await _context.Deals
                .GroupBy(d => 1)
                .Select(g => new
                {
                    TotalDeals = g.Count(),
                    WonDeals = g.Count(d => d.Status == "Won"),
                    OpenDeals = g.Count(d => d.Status == "Open"),
                    LostDeals = g.Count(d => d.Status == "Lost"),
                    TotalRevenue = g.Where(d => d.Status == "Won").Sum(d => d.DealAmount) ?? 0m
                })
                .FirstOrDefaultAsync() ?? new { TotalDeals = 0, WonDeals = 0, OpenDeals = 0, LostDeals = 0, TotalRevenue = 0m };

            var leadStats = await _context.Leads
                .GroupBy(l => 1)
                .Select(g => new
                {
                    TotalLeads = g.Count(),
                    ActiveLeads = g.Count(l => l.Status != "Closed" && l.Status != "Lost"),
                    NewLeads = g.Count(l => l.Status == "New"),
                    ContactedLeads = g.Count(l => l.Status == "Contacted"),
                    ClosedLeads = g.Count(l => l.Status == "Closed")
                })
                .FirstOrDefaultAsync() ?? new { TotalLeads = 0, ActiveLeads = 0, NewLeads = 0, ContactedLeads = 0, ClosedLeads = 0 };

            var visitStats = await _context.Visits
                .GroupBy(v => 1)
                .Select(g => new
                {
                    TotalVisits = g.Count(),
                    ScheduledVisits = g.Count(v => v.Status == "Scheduled")
                })
                .FirstOrDefaultAsync() ?? new { TotalVisits = 0, ScheduledVisits = 0 };

            var monthlyRevenueGroup = await _context.Deals
                .Where(d => d.Status == "Won" && d.DealDate != null && d.DealDate.Value.Month >= 1 && d.DealDate.Value.Month <= 6)
                .GroupBy(d => d.DealDate!.Value.Month)
                .Select(g => new { Month = g.Key, Revenue = g.Sum(d => d.DealAmount) ?? 0m })
                .ToListAsync();

            var monthlyVisitsGroup = await _context.Visits
                .Where(v => v.VisitDate.Month >= 1 && v.VisitDate.Month <= 6)
                .GroupBy(v => v.VisitDate.Month)
                .Select(g => new { Month = g.Key, Count = g.Count() })
                .ToListAsync();

            var monthlyRevenue = new decimal[6];
            var monthlyVisits = new int[6];

            foreach (var item in monthlyRevenueGroup)
            {
                if (item.Month >= 1 && item.Month <= 6)
                    monthlyRevenue[item.Month - 1] = item.Revenue;
            }
            foreach (var item in monthlyVisitsGroup)
            {
                if (item.Month >= 1 && item.Month <= 6)
                    monthlyVisits[item.Month - 1] = item.Count;
            }

            var dashboard = new Dashboard
            {
                TotalBrokers = totalBrokers,
                TotalLeads = leadStats.TotalLeads,
                TotalProperties = totalProperties,
                TotalVisits = visitStats.TotalVisits,
                TotalDeals = dealStats.TotalDeals,
                TotalRevenue = dealStats.TotalRevenue,
                WonDeals = dealStats.WonDeals,
                OpenDeals = dealStats.OpenDeals,
                LostDeals = dealStats.LostDeals,
                ActiveLeads = leadStats.ActiveLeads,
                ScheduledVisits = visitStats.ScheduledVisits,

                RecentLeads = await _context.Leads
                    .OrderByDescending(l => l.Id)
                    .Take(5)
                    .Select(l => l.CustomerName)
                    .ToListAsync(),

                RecentVisits = await _context.Visits
                    .Include(v => v.Lead)
                    .Include(v => v.Property)
                    .OrderByDescending(v => v.VisitDate)
                    .Take(5)
                    .Select(v => (v.Lead != null ? v.Lead.CustomerName : "Lead #" + v.LeadId)
                        + " @ " + (v.Property != null ? v.Property.PropertyName : "Property #" + v.PropertyId)
                        + " (" + v.VisitDate.ToString("MMM dd") + ")")
                    .ToListAsync(),

                RecentDeals = await _context.Deals
                    .Include(d => d.Lead)
                    .OrderByDescending(d => d.DealDate)
                    .Take(5)
                    .Select(d => (d.Lead != null ? d.Lead.CustomerName : "Lead #" + d.LeadId)
                        + " – ₹" + (d.DealAmount ?? 0).ToString("N0")
                        + " [" + d.Status + "]")
                    .ToListAsync(),

                MonthlyRevenue = monthlyRevenue.ToList(),
                MonthlyVisits = monthlyVisits.ToList(),
                LeadStatusData = new List<int>
                {
                    leadStats.NewLeads,
                    leadStats.ContactedLeads,
                    leadStats.ClosedLeads
                }
            };

            return Ok(dashboard);
        }

        [HttpGet("followup-reminders")]
        public async Task<IActionResult> GetFollowUpReminders()
        {
            var today = DateTime.UtcNow.Date;

            var reminders = await _context.Leads
                .Include(l => l.AssignedBroker)
                .Where(l =>
                    l.FollowUpReminderDate.HasValue &&
                    l.FollowUpReminderDate.Value.Date <= today &&
                    l.Status != "Closed" &&
                    l.Status != "Lost")
                .OrderBy(l => l.FollowUpReminderDate)
                .Take(10)
                .Select(l => new
                {
                    id            = l.Id,
                    customerName  = l.CustomerName,
                    mobile        = l.Mobile,
                    status        = l.Status,
                    priorityTag   = l.PriorityTag ?? "Normal",
                    followUpDate  = l.FollowUpReminderDate,
                    followUpNotes = l.FollowUpNotes ?? "",
                    brokerName    = l.AssignedBroker != null
                                    ? l.AssignedBroker.FirstName + " " + l.AssignedBroker.LastName
                                    : "Unassigned",
                    daysOverdue   = (int)(today - l.FollowUpReminderDate!.Value.Date).TotalDays
                })
                .ToListAsync();

            return Ok(reminders);
        }

        [HttpPost("filtered-summary")]
        public async Task<IActionResult> GetFilteredSummary([FromBody] DashboardFilter model)
        {
            var today = DateTime.Today;
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);

            IQueryable<Lead> leadsQuery = _context.Leads;
            IQueryable<Visit> visitsQuery = _context.Visits;
            IQueryable<Deal> dealsQuery = _context.Deals;
            IQueryable<Property> propertiesQuery = _context.Properties;
            IQueryable<Broker> brokersQuery = _context.Brokers;

            switch (model?.Filter)
            {
                case "Today":
                    visitsQuery = visitsQuery.Where(x => x.VisitDate.Date == today);
                    dealsQuery = dealsQuery.Where(x => x.DealDate != null && x.DealDate.Value.Date == today);
                    break;

                case "ThisMonth":
                    visitsQuery = visitsQuery.Where(x => x.VisitDate >= firstDayOfMonth);
                    dealsQuery = dealsQuery.Where(x => x.DealDate >= firstDayOfMonth);
                    break;

                default:
                    break;
            }

            var totalBrokers = await brokersQuery.CountAsync();
            var totalProperties = await propertiesQuery.CountAsync();

            var dealStats = await dealsQuery
                .GroupBy(d => 1)
                .Select(g => new
                {
                    TotalDeals = g.Count(),
                    WonDeals = g.Count(d => d.Status == "Won"),
                    OpenDeals = g.Count(d => d.Status == "Open"),
                    LostDeals = g.Count(d => d.Status == "Lost"),
                    TotalRevenue = g.Where(d => d.Status == "Won").Sum(d => d.DealAmount) ?? 0m
                })
                .FirstOrDefaultAsync() ?? new { TotalDeals = 0, WonDeals = 0, OpenDeals = 0, LostDeals = 0, TotalRevenue = 0m };

            var leadStats = await leadsQuery
                .GroupBy(l => 1)
                .Select(g => new
                {
                    TotalLeads = g.Count(),
                    ActiveLeads = g.Count(l => l.Status != "Closed" && l.Status != "Lost"),
                    NewLeads = g.Count(l => l.Status == "New"),
                    ContactedLeads = g.Count(l => l.Status == "Contacted"),
                    ClosedLeads = g.Count(l => l.Status == "Closed")
                })
                .FirstOrDefaultAsync() ?? new { TotalLeads = 0, ActiveLeads = 0, NewLeads = 0, ContactedLeads = 0, ClosedLeads = 0 };

            var visitStats = await visitsQuery
                .GroupBy(v => 1)
                .Select(g => new
                {
                    TotalVisits = g.Count(),
                    ScheduledVisits = g.Count(v => v.Status == "Scheduled")
                })
                .FirstOrDefaultAsync() ?? new { TotalVisits = 0, ScheduledVisits = 0 };

            var monthlyRevenueGroup = await dealsQuery
                .Where(d => d.Status == "Won" && d.DealDate != null && d.DealDate.Value.Month >= 1 && d.DealDate.Value.Month <= 6)
                .GroupBy(d => d.DealDate!.Value.Month)
                .Select(g => new { Month = g.Key, Revenue = g.Sum(d => d.DealAmount) ?? 0m })
                .ToListAsync();

            var monthlyVisitsGroup = await visitsQuery
                .Where(v => v.VisitDate.Month >= 1 && v.VisitDate.Month <= 6)
                .GroupBy(v => v.VisitDate.Month)
                .Select(g => new { Month = g.Key, Count = g.Count() })
                .ToListAsync();

            var monthlyRevenue = new decimal[6];
            var monthlyVisits = new int[6];

            foreach (var item in monthlyRevenueGroup)
            {
                if (item.Month >= 1 && item.Month <= 6)
                    monthlyRevenue[item.Month - 1] = item.Revenue;
            }
            foreach (var item in monthlyVisitsGroup)
            {
                if (item.Month >= 1 && item.Month <= 6)
                    monthlyVisits[item.Month - 1] = item.Count;
            }

            var result = new
            {
                TotalBrokers = totalBrokers,
                TotalLeads = leadStats.TotalLeads,
                TotalProperties = totalProperties,
                TotalVisits = visitStats.TotalVisits,
                TotalDeals = dealStats.TotalDeals,
                TotalRevenue = dealStats.TotalRevenue,
                WonDeals = dealStats.WonDeals,
                OpenDeals = dealStats.OpenDeals,
                LostDeals = dealStats.LostDeals,
                ActiveLeads = leadStats.ActiveLeads,
                ScheduledVisits = visitStats.ScheduledVisits,

                MonthlyRevenue = monthlyRevenue.ToList(),
                MonthlyVisits = monthlyVisits.ToList(),

                RecentLeads = await leadsQuery
                    .OrderByDescending(l => l.Id)
                    .Take(5)
                    .Select(l => l.CustomerName)
                    .ToListAsync(),

                RecentVisits = await _context.Visits
                    .Include(v => v.Lead)
                    .Include(v => v.Property)
                    .OrderByDescending(v => v.VisitDate)
                    .Take(5)
                    .Select(v => (v.Lead != null ? v.Lead.CustomerName : "Lead #" + v.LeadId)
                        + " @ " + (v.Property != null ? v.Property.PropertyName : "Property #" + v.PropertyId)
                        + " (" + v.VisitDate.ToString("MMM dd") + ")")
                    .ToListAsync(),

                RecentDeals = await _context.Deals
                    .Include(d => d.Lead)
                    .OrderByDescending(d => d.DealDate)
                    .Take(5)
                    .Select(d => (d.Lead != null ? d.Lead.CustomerName : "Lead #" + d.LeadId)
                        + " – ₹" + (d.DealAmount ?? 0).ToString("N0")
                        + " [" + d.Status + "]")
                    .ToListAsync(),

                LeadStatusData = new List<int>
                {
                    leadStats.NewLeads,
                    leadStats.ContactedLeads,
                    leadStats.ClosedLeads
                }
            };

            return Ok(result);
        }
    }
}