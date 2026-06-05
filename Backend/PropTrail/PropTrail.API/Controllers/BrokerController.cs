using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropTrail.API.Data;
using PropTrail.API.Models;

namespace PropTrail.API.Controllers
{
    [Authorize(Roles = "Owner,Broker,Receptionist")]
    [Route("api/[controller]")]
    [ApiController]
    public class BrokerController : ControllerBase
    {
        private readonly AppDbContext _context;
        public BrokerController(AppDbContext context)
        {
            _context = context;
        }

        //Get All 
        [HttpGet]       
        public IActionResult Get()
        {
            var brokers = _context.Brokers.ToList();
            return Ok(brokers);


        }

        //Get By ID
        [HttpGet("{id}")]
        public IActionResult GetByID(int id)
        {
            var broker = _context.Brokers.Find(id);
            
            if (broker == null)
                return NotFound();
            return Ok(broker);

        }


        //Create 
        [Authorize(Roles = "Owner")]
        [HttpPost]
        public IActionResult AddBroker(Broker broker)
        {
            if (string.IsNullOrEmpty(broker.Password))
            {
                broker.Password = "password123";
            }

            // Hash password if not already hashed
            if (!broker.Password.StartsWith("$2a$") && !broker.Password.StartsWith("$2b$") && !broker.Password.StartsWith("$2y$"))
            {
                broker.Password = BCrypt.Net.BCrypt.HashPassword(broker.Password);
            }

            _context.Brokers.Add(broker);
            _context.SaveChanges();

            return Ok(broker);
        }

        //Update 
        [Authorize(Roles = "Owner")]
        [HttpPut("{id}")]
        public IActionResult update(int id, Broker broker)
        {
            var existingBroker = _context.Brokers.Find(id);

            if (existingBroker == null)
                return NotFound();

            existingBroker.FirstName = broker.FirstName;
            existingBroker.LastName = broker.LastName;
            existingBroker.Mobile = broker.Mobile;
            existingBroker.Email = broker.Email;
            existingBroker.Role = broker.Role; // Sync Role updates!

            // Hash and update password if a new password is provided and it's not already hashed
            if (!string.IsNullOrEmpty(broker.Password))
            {
                if (!broker.Password.StartsWith("$2a$") && !broker.Password.StartsWith("$2b$") && !broker.Password.StartsWith("$2y$"))
                {
                    existingBroker.Password = BCrypt.Net.BCrypt.HashPassword(broker.Password);
                }
                else
                {
                    existingBroker.Password = broker.Password;
                }
            }

            _context.SaveChanges();

            return Ok(existingBroker);
        }

        //Delete 
        [Authorize(Roles = "Owner")]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var broker = _context.Brokers.Find(id);

            if (broker == null)
                return NotFound();

            _context.Brokers.Remove(broker);
            _context.SaveChanges();
            return Ok();

        }

    }
}
