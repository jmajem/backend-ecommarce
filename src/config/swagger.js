const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "E-Commerce API Documentation",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: [
            "userName",
            "userImage",
            "userPhoneNumber",
            "userEmail",
            "userStreetAddress",
            "userPass",
            "userStatus",
            "userCity",
            "userCountry",
            "userCreditNumber",
            "userZipCode",
            "role",
          ],
          properties: {
            id: {
              type: "integer",
              format: "int64",
              description: "User ID",
            },
            userName: {
              type: "string",
              description: "User name",
            },
            userImage: {
              type: "object",
              description: "User image in JSON format",
            },
            userPhoneNumber: {
              type: "string",
              description: "User phone number",
            },
            userEmail: {
              type: "string",
              format: "email",
              description: "User email",
            },
            userStreetAddress: {
              type: "string",
              description: "User street address",
            },
            userPass: {
              type: "string",
              description: "User password",
            },
            userStatus: {
              type: "string",
              description: "User status",
            },
            userCity: {
              type: "string",
              description: "User city",
            },
            userCountry: {
              type: "string",
              description: "User country",
            },
            userCreditNumber: {
              type: "number",
              format: "decimal",
              description: "User credit number",
            },
            userZipCode: {
              type: "string",
              description: "User zip code",
            },
            role: {
              type: "string",
              description: "User role",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

module.exports = swaggerJsdoc(options);
