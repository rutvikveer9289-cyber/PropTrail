using System;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using PropTrail.API.Data;
using PropTrail.API.Models;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Email and Password are required." });
            }

            var broker = _context.Brokers
                .FirstOrDefault(b => b.Email.ToLower() == request.Email.ToLower());

            if (broker == null || !VerifyPassword(request.Password, broker.Password))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var token = GenerateJwtToken(broker);

            return Ok(new
            {
                token = token,
                id = broker.Id,
                email = broker.Email,
                firstName = broker.FirstName,
                lastName = broker.LastName,
                role = broker.Role
            });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (request == null || 
                string.IsNullOrEmpty(request.Email) || 
                string.IsNullOrEmpty(request.Password) ||
                string.IsNullOrEmpty(request.FirstName) || 
                string.IsNullOrEmpty(request.LastName))
            {
                return BadRequest(new { message = "First Name, Last Name, Email, and Password are required." });
            }

            if (_context.Brokers.Any(b => b.Email.ToLower() == request.Email.ToLower()))
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            var newBroker = new Broker
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Mobile = request.Mobile ?? string.Empty,
                Email = request.Email.ToLower(),
                Password = HashPassword(request.Password),
                Role = "Buyer"
            };
            _context.Brokers.Add(newBroker);

            // Link to a corresponding Lead record
            var lead = _context.Leads.FirstOrDefault(l => l.Email.ToLower() == request.Email.ToLower());
            if (lead == null)
            {
                var defaultBroker = _context.Brokers.FirstOrDefault(b => b.Role == "Broker" || b.Role == "Owner");
                lead = new Lead
                {
                    CustomerName = $"{request.FirstName} {request.LastName}",
                    Email = request.Email.ToLower(),
                    Mobile = request.Mobile ?? string.Empty,
                    Status = "New",
                    Source = "Website",
                    AssignedBrokerId = defaultBroker?.Id
                };
                _context.Leads.Add(lead);
            }
            else
            {
                lead.CustomerName = $"{request.FirstName} {request.LastName}";
                if (!string.IsNullOrEmpty(request.Mobile))
                {
                    lead.Mobile = request.Mobile;
                }
            }

            _context.SaveChanges();

            return Ok(new { message = "Registration successful! You can now log in." });
        }

        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            // Mock implementation for sending email
            var broker = _context.Brokers.FirstOrDefault(b => b.Email.ToLower() == request.Email.ToLower());
            if (broker == null)
            {
                // Return Ok to prevent email enumeration
                return Ok(new { message = "If the email is registered, a reset link will be sent." });
            }
            return Ok(new { message = "If the email is registered, a reset link will be sent." });
        }

        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var broker = _context.Brokers.FirstOrDefault(b => b.Email.ToLower() == request.Email.ToLower());
            if (broker == null || !VerifyPassword(request.CurrentPassword, broker.Password))
            {
                return BadRequest(new { message = "Invalid credentials." });
            }

            broker.Password = HashPassword(request.NewPassword);
            _context.SaveChanges();
            return Ok(new { message = "Password updated successfully." });
        }

        private string GenerateJwtToken(Broker broker)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var keyString = jwtSettings["Key"] ?? "superSecretKey123_superSecretKey123";
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, broker.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, broker.Id.ToString()),
                new Claim(ClaimTypes.Role, broker.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(Convert.ToDouble(jwtSettings["ExpireDays"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private bool VerifyPassword(string inputPassword, string storedHash)
        {
            // Fallback for previously seeded plain text passwords to ensure backward compatibility during migration
            if (!storedHash.StartsWith("$2a$") && !storedHash.StartsWith("$2b$") && !storedHash.StartsWith("$2y$"))
            {
                return inputPassword == storedHash;
            }
            return BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
    }
}
