using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArbreIntelligence.Migrations.Sqlite
{
    /// <inheritdoc />
    public partial class AddIdeaDomain : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Domain",
                table: "Ideas",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Domain",
                table: "Ideas");
        }
    }
}
