using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PropTrail.API.Models
{
    public class Property
    {
        public int Id { get; set; }

        [Required]
        public string PropertyName { get; set; } = string.Empty;

        public string PropertyType { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public double Area { get; set; }

        public string status { get; set; } = "Available";

        public string Description { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public int BhkCount { get; set; }

        public string? ListingType { get; set; }

        public string? ImageUrls { get; set; }

        public string? VideoUrl { get; set; }

        public string? KeyFeatures { get; set; }

        public int? OwnerId { get; set; }

        [ForeignKey("OwnerId")]
        public Owner? Owner { get; set; }

        // Phase 16: Property Intelligence additions
        public string? FloorPlanUrl { get; set; }

        public string AvailabilityStatus { get; set; } = "Available"; // Available, Sold, On Hold, Under Offer

        public string OccupancyStatus { get; set; } = "Vacant";       // Vacant, Occupied, Partially Occupied

        public int ViewCount { get; set; } = 0;

        public int LeadsGenerated { get; set; } = 0;

        public int VisitsScheduled { get; set; } = 0;

        public string? NearbyAmenities { get; set; } // JSON-like comma-separated: "School, Hospital, Metro"
    }
}
