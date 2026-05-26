using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArbreIntelligence.Migrations.Sqlite
{
    /// <inheritdoc />
    public partial class AddSubBranches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentBranchId",
                table: "Branches",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_ParentBranchId",
                table: "Branches",
                column: "ParentBranchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Branches_ParentBranchId",
                table: "Branches",
                column: "ParentBranchId",
                principalTable: "Branches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Branches_Branches_ParentBranchId",
                table: "Branches");

            migrationBuilder.DropIndex(
                name: "IX_Branches_ParentBranchId",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "ParentBranchId",
                table: "Branches");
        }
    }
}
