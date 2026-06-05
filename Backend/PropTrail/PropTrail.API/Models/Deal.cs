using System.ComponentModel.DataAnnotations.Schema;

namespace PropTrail.API.Models
{
    public class Deal
    {
        public int DealId { get; set; }
        public int BrokerId { get; set; }
        public int LeadId { get; set; }
        public int PropertyId { get; set; }
        public decimal? DealAmount { get; set; }
        public DateTime? DealDate { get; set; }
        public string Status { get; set; } = "Open";
        public string? Stage { get; set; }

        // Phase 15 - Pipeline Kanban stages
        public int PipelineOrder { get; set; } = 0;

        // Phase 14 - Commission tracking
        public decimal? CommissionRate { get; set; }    // e.g. 2.5 (percent)
        public decimal? CommissionAmount { get; set; }  // auto-computed

        [ForeignKey("LeadId")]
        public Lead? Lead { get; set; }

        [ForeignKey("PropertyId")]
        public Property? Property { get; set; }
    }
}
