const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class CreateCategoryTable1700000000003 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "Category" (
        "id" BIGSERIAL PRIMARY KEY,
        "category_name" VARCHAR(255) NOT NULL,
        "category_image" jsonb NOT NULL,
        "category_topic" VARCHAR(255) NULL,
        "status" VARCHAR(255) NOT NULL,
        "created At" DATE NOT NULL,
        "time" TIME(0) WITHOUT TIME ZONE NOT NULL
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE IF EXISTS "Category"`);
  }
};
