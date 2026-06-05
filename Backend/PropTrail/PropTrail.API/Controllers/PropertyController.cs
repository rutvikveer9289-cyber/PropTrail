using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropTrail.API.Data;
using PropTrail.API.Models;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PropertyController(AppDbContext context)
        {
            _context = context;
        }

        // Get all

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Property>>> GetProperties()
        {
            return await _context.Properties.ToListAsync();
        }

        // Get by Id

        [HttpGet("{id}")]
        public async Task<ActionResult<Property>> GetProperty(int id)
        {
            var property = await _context.Properties.FindAsync(id);

            if (property == null)
                return NotFound();

            return property;
        }

        // Add

        [HttpPost]
        public async Task<ActionResult<Property>> AddProperty(Property property)
        {
            _context.Properties.Add(property);

            await _context.SaveChangesAsync();

            return Ok(property);
        }

        // Update
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProperty(
            int id,
            Property property)
        {
            if (id != property.Id)
                return BadRequest();

            var existingProperty = await _context.Properties.FindAsync(id);
            if (existingProperty == null)
                return NotFound();

            existingProperty.PropertyName = property.PropertyName;
            existingProperty.PropertyType = property.PropertyType;
            existingProperty.Location = property.Location;
            existingProperty.Price = property.Price;
            existingProperty.Area = property.Area;
            existingProperty.status = property.status;
            existingProperty.Description = property.Description;

            // Phase 16 fields mapping
            existingProperty.FloorPlanUrl = property.FloorPlanUrl;
            existingProperty.AvailabilityStatus = property.AvailabilityStatus;
            existingProperty.OccupancyStatus = property.OccupancyStatus;
            existingProperty.ViewCount = property.ViewCount;
            existingProperty.LeadsGenerated = property.LeadsGenerated;
            existingProperty.VisitsScheduled = property.VisitsScheduled;
            existingProperty.NearbyAmenities = property.NearbyAmenities;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Delete

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProperty(int id)
        {
            var property =
                await _context.Properties.FindAsync(id);

            if (property == null)
                return NotFound();

            _context.Properties.Remove(property);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}