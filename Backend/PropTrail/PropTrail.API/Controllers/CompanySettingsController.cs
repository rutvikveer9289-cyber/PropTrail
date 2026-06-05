using Microsoft.AspNetCore.Mvc;
using PropTrail.API.Data;
using PropTrail.API.Models;
using System.Linq;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanySettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CompanySettingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/companysettings
        [HttpGet]
        public IActionResult GetSettings()
        {
            var settings = _context.CompanySettings.FirstOrDefault();
            if (settings == null)
            {
                settings = new CompanySetting
                {
                    CompanyName = "PropTrail CRM",
                    LogoUrl = "assets/logo.png",
                    ThemeColor = "#3b82f6",
                    EmailTemplate = "Dear {CustomerName},\n\nThank you for choosing PropTrail. We have found properties matching your profile.\n\nBest regards,\nPropTrail Team",
                    SystemPreferences = "{\"autoAssignLeads\": true, \"enableAiScoring\": true}"
                };
                _context.CompanySettings.Add(settings);
                _context.SaveChanges();
            }

            return Ok(settings);
        }

        // PUT: api/companysettings
        [HttpPut]
        public IActionResult UpdateSettings([FromBody] CompanySetting settings)
        {
            if (settings == null)
                return BadRequest();

            var existingSettings = _context.CompanySettings.FirstOrDefault();
            if (existingSettings == null)
            {
                _context.CompanySettings.Add(settings);
            }
            else
            {
                existingSettings.CompanyName = settings.CompanyName;
                existingSettings.LogoUrl = settings.LogoUrl;
                existingSettings.ThemeColor = settings.ThemeColor;
                existingSettings.EmailTemplate = settings.EmailTemplate;
                existingSettings.SystemPreferences = settings.SystemPreferences;
            }

            _context.SaveChanges();
            return Ok(existingSettings ?? settings);
        }
    }
}
