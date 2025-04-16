const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class CreateProductTable1700000000002 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" BIGSERIAL PRIMARY KEY,
        "product_name" VARCHAR(255) NOT NULL,
        "product_image" VARCHAR(255) NOT NULL,
        "product_status" VARCHAR(255) NOT NULL,
        "standard-price" DECIMAL(8, 2) NOT NULL,
        "offer-price" DECIMAL(8, 2) NOT NULL,
        "product_description" TEXT NOT NULL,
        "product_date" DATE NOT NULL,
        "product_ quantity" DECIMAL(8, 2) NOT NULL,
        "store-id" BIGINT NOT NULL
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE IF EXISTS "Product"`);
  }
};
