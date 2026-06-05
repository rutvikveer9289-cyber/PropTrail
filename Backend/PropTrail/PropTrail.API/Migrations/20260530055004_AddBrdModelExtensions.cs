using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PropTrail.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBrdModelExtensions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClientFeedback",
                table: "Visits",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ClientRating",
                table: "Visits",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FeedbackStatus",
                table: "Visits",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BhkCount",
                table: "Properties",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrls",
                table: "Properties",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "KeyFeatures",
                table: "Properties",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ListingType",
                table: "Properties",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OwnerId",
                table: "Properties",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Properties",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastContactedDate",
                table: "Leads",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxBudget",
                table: "Leads",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinBudget",
                table: "Leads",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PreferredBhk",
                table: "Leads",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredLocality",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PriorityTag",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PropertyStatusPreference",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DealDate",
                table: "Deals",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "Stage",
                table: "Deals",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DealDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DealId = table.Column<int>(type: "integer", nullable: false),
                    DocumentName = table.Column<string>(type: "text", nullable: true),
                    Stage = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DealDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DealDocuments_Deals_DealId",
                        column: x => x.DealId,
                        principalTable: "Deals",
                        principalColumn: "DealId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Owners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Mobile = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    PriceFlexibility = table.Column<string>(type: "text", nullable: true),
                    NocStatus = table.Column<string>(type: "text", nullable: true),
                    Restrictions = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Owners", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Properties_OwnerId",
                table: "Properties",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_DealDocuments_DealId",
                table: "DealDocuments",
                column: "DealId");

            migrationBuilder.AddForeignKey(
                name: "FK_Properties_Owners_OwnerId",
                table: "Properties",
                column: "OwnerId",
                principalTable: "Owners",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Properties_Owners_OwnerId",
                table: "Properties");

            migrationBuilder.DropTable(
                name: "DealDocuments");

            migrationBuilder.DropTable(
                name: "Owners");

            migrationBuilder.DropIndex(
                name: "IX_Properties_OwnerId",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "ClientFeedback",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "ClientRating",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "FeedbackStatus",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "BhkCount",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "ImageUrls",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "KeyFeatures",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "ListingType",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "LastContactedDate",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "MaxBudget",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "MinBudget",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "PreferredBhk",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "PreferredLocality",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "PriorityTag",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "PropertyStatusPreference",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Stage",
                table: "Deals");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DealDate",
                table: "Deals",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);
        }
    }
}
