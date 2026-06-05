using Microsoft.EntityFrameworkCore;
using PropTrail.API.Models;

namespace PropTrail.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Broker> Brokers { get; set; }

        public DbSet<Lead> Leads { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<Visit> Visits { get; set; }
        public DbSet<Deal> Deals { get; set; }
        public DbSet<Owner> Owners { get; set; }
        public DbSet<DealDocument> DealDocuments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<LeadActivity> LeadActivities { get; set; }
        public DbSet<CompanySetting> CompanySettings { get; set; }
    }
}