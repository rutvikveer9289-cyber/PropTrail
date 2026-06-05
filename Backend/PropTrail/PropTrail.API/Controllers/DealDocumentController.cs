using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropTrail.API.Data;
using PropTrail.API.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DealDocumentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DealDocumentController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/DealDocument
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DealDocument>>> GetAllDocuments()
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                            ?? User.FindFirst("sub")?.Value;

            IQueryable<DealDocument> query = _context.DealDocuments.Include(d => d.Deal);

            if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
            {
                var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
                if (lead != null)
                {
                    query = query.Where(d => d.Deal != null && d.Deal.LeadId == lead.Id);
                }
                else
                {
                    return Ok(new List<DealDocument>());
                }
            }

            return await query.ToListAsync();
        }

        // GET: api/DealDocument/deal/{dealId}
        [HttpGet("deal/{dealId}")]
        public async Task<ActionResult<IEnumerable<DealDocument>>> GetDocumentsForDeal(int dealId)
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                            ?? User.FindFirst("sub")?.Value;

            if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
            {
                var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
                var deal = await _context.Deals.FindAsync(dealId);
                if (lead == null || deal == null || deal.LeadId != lead.Id)
                {
                    return Forbid();
                }
            }

            var documents = await _context.DealDocuments
                .Where(d => d.DealId == dealId)
                .ToListAsync();

            return Ok(documents);
        }

        // GET: api/DealDocument/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DealDocument>> GetDealDocument(int id)
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                            ?? User.FindFirst("sub")?.Value;

            var doc = await _context.DealDocuments
                .Include(d => d.Deal)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (doc == null)
                return NotFound();

            if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
            {
                var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
                if (lead == null || doc.Deal == null || doc.Deal.LeadId != lead.Id)
                {
                    return Forbid();
                }
            }

            return Ok(doc);
        }

        // POST: api/DealDocument
        [HttpPost]
        public async Task<ActionResult<DealDocument>> AddDocument([FromBody] DealDocument document)
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (userRole == "Buyer")
            {
                return Forbid();
            }

            if (document == null)
                return BadRequest();

            document.UploadedDate = DateTime.UtcNow;
            _context.DealDocuments.Add(document);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDealDocument), new { id = document.Id }, document);
        }

        // POST: api/DealDocument/upload
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (userRole == "Buyer")
            {
                return Forbid();
            }

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            var fileUrl = $"/uploads/{fileName}";
            return Ok(new { FileUrl = fileUrl, FileName = file.FileName, FileSize = file.Length });
        }

        // POST: api/DealDocument/{id}/download
        [HttpPost("{id}/download")]
        public async Task<IActionResult> TrackDownload(int id)
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userEmail = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                            ?? User.FindFirst("sub")?.Value;

            var doc = await _context.DealDocuments
                .Include(d => d.Deal)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (doc == null)
                return NotFound();

            if (userRole == "Buyer" && !string.IsNullOrEmpty(userEmail))
            {
                var lead = await _context.Leads.FirstOrDefaultAsync(l => l.Email.ToLower() == userEmail.ToLower());
                if (lead == null || doc.Deal == null || doc.Deal.LeadId != lead.Id)
                {
                    return Forbid();
                }
            }

            doc.DownloadCount++;
            await _context.SaveChangesAsync();

            return Ok(doc);
        }

        // PUT: api/DealDocument/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] DealDocument document)
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (userRole == "Buyer")
            {
                return Forbid();
            }

            if (document == null || id != document.Id)
                return BadRequest();

            var existing = await _context.DealDocuments.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.DocumentName = document.DocumentName;
            existing.Stage = document.Stage;
            existing.Status = document.Status;
            existing.FileUrl = document.FileUrl;
            existing.FileSize = document.FileSize;
            existing.Category = document.Category;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/DealDocument/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (userRole == "Buyer")
            {
                return Forbid();
            }

            var doc = await _context.DealDocuments.FindAsync(id);
            if (doc == null)
                return NotFound();

            _context.DealDocuments.Remove(doc);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
