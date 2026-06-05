namespace PropTrail.API.Models
{
    public class Broker
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = "password123";
        public string Role { get; set; } = "Broker";
    }
}
