using System.ComponentModel.DataAnnotations;

namespace PropTrail.API.Models
{
    public class CompanySetting
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string CompanyName { get; set; } = "PropTrail CRM";

        public string? LogoUrl { get; set; }

        public string? ThemeColor { get; set; } = "#3b82f6"; // Default blue

        public string? EmailTemplate { get; set; }

        public string? SystemPreferences { get; set; } // JSON or simple settings string
    }
}
