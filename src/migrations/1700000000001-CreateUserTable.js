const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class CreateUserTable1700000000001 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" BIGSERIAL PRIMARY KEY,
        "user_name" VARCHAR(255) NOT NULL,
        "user_image" jsonb NOT NULL,
        "user_phone_number" VARCHAR(255) NOT NULL,
        "user_email" VARCHAR(255) NOT NULL,
        "user_street_address" VARCHAR(255) NOT NULL,
        "user_pass" VARCHAR(255) NOT NULL,
        "user_status" VARCHAR(255) NOT NULL,
        "usercity" VARCHAR(255) NOT NULL,
        "user Country" VARCHAR(255) NOT NULL,
        "user_credit_number" DECIMAL(8, 2) NOT NULL,
        "user_zip_code" VARCHAR(255) NOT NULL,
        "role" VARCHAR(255) CHECK ("role" IN('')) NOT NULL
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
};
