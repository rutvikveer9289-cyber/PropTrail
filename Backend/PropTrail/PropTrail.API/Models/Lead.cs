using System.ComponentModel.DataAnnotations.Schema;

namespace PropTrail.API.Models
{
    public class Lead
    {
        public int Id { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string Mobile { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string InterestedProperty { get; set; } = string.Empty;

        public string Status { get; set; } = "New";

        public decimal? MinBudget { get; set; }

        public decimal? MaxBudget { get; set; }

        public string? PreferredLocality { get; set; }

        public int? PreferredBhk { get; set; }

        public string? PropertyStatusPreference { get; set; }

        public string? PriorityTag { get; set; }

        public DateTime? LastContactedDate { get; set; }

        // Phase 13: Lead Lifecycle additions
        public string? Source { get; set; }          // Website, Referral, WalkIn, IndiaMart, MagicBricks, etc.

        public int LeadScore { get; set; } = 0;     // 0–100 AI-computed conversion probability

        public int? AssignedBrokerId { get; set; }  // FK to Broker

        public DateTime? FollowUpReminderDate { get; set; }

        public string? FollowUpNotes { get; set; }

        // Navigation
        [ForeignKey("AssignedBrokerId")]
        public Broker? AssignedBroker { get; set; }
    }
}