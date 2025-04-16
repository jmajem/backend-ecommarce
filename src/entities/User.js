const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User",
  tableName: "user",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    userName: {
      type: "varchar",
      name: "user_name",
      nullable: false,
    },
    userImage: {
      type: "jsonb",
      name: "user_image",
      nullable: false,
    },
    userPhoneNumber: {
      type: "varchar",
      name: "user_phone_number",
      nullable: false,
    },
    userEmail: {
      type: "varchar",
      name: "user_email",
      nullable: false,
    },
    userStreetAddress: {
      type: "varchar",
      name: "user_street_address",
      nullable: false,
    },
    userPass: {
      type: "varchar",
      name: "user_pass",
      nullable: false,
    },
    userStatus: {
      type: "varchar",
      name: "user_status",
      nullable: false,
    },
    userCity: {
      type: "varchar",
      name: "usercity",
      nullable: false,
    },
    userCountry: {
      type: "varchar",
      name: "user Country",
      nullable: false,
    },
    userCreditNumber: {
      type: "decimal",
      name: "user_credit_number",
      precision: 8,
      scale: 2,
      nullable: false,
    },
    userZipCode: {
      type: "varchar",
      name: "user_zip_code",
      nullable: false,
    },
    role: {
      type: "varchar",
      nullable: false,
      check: "role IN('')",
    },
  },
});

module.exports = User;
