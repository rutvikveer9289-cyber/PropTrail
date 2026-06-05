using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace PropTrail.API.Models
{
    public class Visit
    {
        [Key]
        public int VisitId { get; set; }
        public int BrokerId { get; set; }
        public int LeadId { get; set; }
        public int PropertyId { get; set; }

        public DateTime VisitDate { get; set; }

        public string? Status { get; set; }
        public string? Notes { get; set; }

        public string? ClientFeedback { get; set; }
        public int? ClientRating { get; set; }
        public string? FeedbackStatus { get; set; }

        [ForeignKey("BrokerId")]
        public Broker? Broker { get; set; }

        [ForeignKey("LeadId")]
        public Lead? Lead { get; set; }

        [ForeignKey("PropertyId")]
        public Property? Property { get; set; }
    }
}
