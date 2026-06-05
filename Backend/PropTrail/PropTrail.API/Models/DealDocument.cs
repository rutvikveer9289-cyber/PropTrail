using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropTrail.API.Models
{
    public class DealDocument
    {
        public int Id { get; set; }
        public int DealId { get; set; }
        public string? DocumentName { get; set; }
        public string? Stage { get; set; }
        public string? Status { get; set; }

        // Document Management extensions
        public string? FileUrl { get; set; }
        public long FileSize { get; set; } // in bytes
        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
        public int DownloadCount { get; set; } = 0;
        public string? Category { get; set; } // KYC, SalesDeed, Agreement, etc.

        [ForeignKey("DealId")]
        public Deal? Deal { get; set; }
    }
}
