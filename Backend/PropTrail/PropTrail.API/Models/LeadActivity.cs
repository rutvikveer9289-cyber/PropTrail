using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropTrail.API.Models
{
    public class LeadActivity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int LeadId { get; set; }

        [Required]
        public string Type { get; set; } = "StatusUpdate"; // Call, Email, SMS, Meeting, StatusUpdate

        public string Notes { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public string CreatedBy { get; set; } = "System";

        [ForeignKey("LeadId")]
        public Lead? Lead { get; set; }
    }
}
