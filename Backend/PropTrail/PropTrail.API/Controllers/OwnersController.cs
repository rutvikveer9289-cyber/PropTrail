using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropTrail.API.Data;
using PropTrail.API.Models;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OwnersController:ControllerBase
    {
        private readonly AppDbContext _context;

        public OwnersController(AppDbContext context)
        {
            _context = context;

        }

        //Get Api owner


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Owner>>> GetOwners()
        {
            return await _context.Owners.ToListAsync();
        }


        [HttpGet("{id}")]

        public async Task<ActionResult<Owner>> GetOwner (int id )
        {
            var owner = await _context.Owners.FindAsync(id);

            if (owner == null)
                return NotFound();
            return owner;

        }

        [HttpPost]

        public async Task<ActionResult<Owner>> CreateOwner (Owner owner )

        {
            _context.Owners.Add(owner);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetOwner),
                new {id = owner.Id},
                owner
                );

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOwner(int id, Owner owner)
        {
            if (id != owner.Id)
                return BadRequest();

            var existing = await _context.Owners.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Name = owner.Name;
            existing.Mobile = owner.Mobile;
            existing.Email = owner.Email;
            existing.PriceFlexibility = owner.PriceFlexibility;
            existing.NocStatus = owner.NocStatus;
            existing.Restrictions = owner.Restrictions;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Owners.Any(e => e.Id == id))
                    return NotFound();

                throw;
            }

            return NoContent();
        }




        [HttpDelete("{id}")]

        public async Task <IActionResult> DeleteOwner(int id)
        {
            var owner = await _context.Owners.FindAsync(id);
            if (owner == null)
                return NotFound();

            _context.Owners.Remove(owner);
            await _context.SaveChangesAsync();

            return NoContent();

        }
    }
}
