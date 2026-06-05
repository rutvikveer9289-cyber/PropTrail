using Microsoft.EntityFrameworkCore;
using PropTrail.API.Data;
using PropTrail.API.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using PropTrail.API.Hubs;

System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
bool usePostgres = false;

if (!string.IsNullOrEmpty(connectionString))
{
    try
    {
        var testBuilder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString)
        {
            Timeout = 2,
            CommandTimeout = 2
        };
        using var conn = new Npgsql.NpgsqlConnection(testBuilder.ConnectionString);
        conn.Open();
        usePostgres = true;
    }
    catch (Exception)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("=================================================================================");
        Console.WriteLine("WARNING: Could not connect to PostgreSQL database using connection string.");
        Console.WriteLine("Falling back to In-Memory Database for development.");
        Console.WriteLine("Please ensure PostgreSQL is running and credentials in appsettings.json are correct.");
        Console.WriteLine("=================================================================================");
        Console.ResetColor();
    }
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (usePostgres)
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseInMemoryDatabase("PropTrailDB");
    }
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
var keyString = jwtSettings["Key"] ?? "superSecretKey123_superSecretKey123";
var key = Encoding.ASCII.GetBytes(keyString);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "PropTrailAPI",
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? "PropTrailUI",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// CORS for Angular - Supporting credentials for SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy.SetIsOriginAllowed(origin => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Global Exception Handler Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Enable CORS
app.UseCors("AllowAngular");

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Migrate and seed database automatically on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        if (app.Environment.IsDevelopment())
        {
            // Clean recreation for development setup to enforce Password and Role columns
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
        }
        else
        {
            context.Database.EnsureCreated();
        }
        DbSeeder.Seed(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating or seeding the database.");
    }
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");

app.Run();