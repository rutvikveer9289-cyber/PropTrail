using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PropTrail.API.Data;
using PropTrail.API.Models;

namespace PropTrail.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var notifications = _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToList();
            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public IActionResult GetUnreadCount()
        {
            var count = _context.Notifications.Count(n => !n.IsRead);
            return Ok(new { count });
        }

        [HttpPut("{id}/read")]
        public IActionResult MarkAsRead(int id)
        {
            var notification = _context.Notifications.Find(id);
            if (notification == null) return NotFound();
            notification.IsRead = true;
            _context.SaveChanges();
            return Ok(notification);
        }

        [HttpPut("mark-all-read")]
        public IActionResult MarkAllRead()
        {
            var unread = _context.Notifications.Where(n => !n.IsRead).ToList();
            foreach (var n in unread) n.IsRead = true;
            _context.SaveChanges();
            return Ok(new { message = "All notifications marked as read." });
        }

        [HttpPost]
        public IActionResult Create([FromBody] Notification notification)
        {
            notification.CreatedAt = DateTime.UtcNow;
            _context.Notifications.Add(notification);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetAll), new { id = notification.Id }, notification);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var notification = _context.Notifications.Find(id);
            if (notification == null) return NotFound();
            _context.Notifications.Remove(notification);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
