using System;
using System.Linq;
using PropTrail.API.Models;

namespace PropTrail.API.Data
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            // Seed only the 3 core login accounts (Owner, Broker, Receptionist)
            if (!context.Brokers.Any())
            {
                context.Brokers.AddRange(
                    new Broker
                    {
                        FirstName = "rutvik",
                        LastName = "veer",
                        Mobile = "9112233445",
                        Email = "owner@proptrail.com",
                        Password = "password123",
                        Role = "Owner"
                    },
                    new Broker
                    {
                        FirstName = "Vikram",
                        LastName = "Singh",
                        Mobile = "9223344556",
                        Email = "broker@proptrail.com",
                        Password = "password123",
                        Role = "Broker"
                    },
                    new Broker
                    {
                        FirstName = "Neha",
                        LastName = "Patel",
                        Mobile = "9334455667",
                        Email = "staff@proptrail.com",
                        Password = "password123",
                        Role = "Receptionist"
                    }
                );
                context.SaveChanges();
            }

            // Seed Company Settings
            if (!context.CompanySettings.Any())
            {
                context.CompanySettings.Add(new CompanySetting
                {
                    CompanyName = "PropTrail Real Estate Solutions",
                    LogoUrl = "assets/logo.png",
                    ThemeColor = "#3b82f6",
                    EmailTemplate = "Dear {CustomerName},\n\nThank you for choosing PropTrail. We have found properties matching your profile.\n\nBest regards,\nPropTrail Team",
                    SystemPreferences = "{\"autoAssignLeads\": true, \"enableAiScoring\": true}"
                });
                context.SaveChanges();
            }
        }
    }
}

