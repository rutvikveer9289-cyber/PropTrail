namespace PropTrail.API.Models
{
    public class Dashboard
    {
        public int TotalBrokers { get; set; }

        public int TotalLeads { get; set; }

        public int TotalProperties { get; set; }

        public int TotalVisits { get; set; }

        public int TotalDeals { get; set; }

        public decimal TotalRevenue { get; set; }

        public int WonDeals { get; set; }

        public int OpenDeals { get; set; }

        public int LostDeals { get; set; }

        public List<string> RecentLeads { get; set; } 
            = new();

        public List<string> RecentVisits { get; set; }
            = new();

        public List<string> RecentDeals { get; set; }
            = new();
        public List<decimal> MonthlyRevenue { get; set; } = new();
        public List<int> LeadStatusData { get; set; } = new();

        public int ActiveLeads { get; set; }
        public int ScheduledVisits { get; set; }
        public List<int> MonthlyVisits { get; set; } = new();
    }
}