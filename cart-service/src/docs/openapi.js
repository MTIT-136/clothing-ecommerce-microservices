function createOpenApiSpec() {
  const nativePort = Number(process.env.PORT) || 3003;
  const gatewayPort = Number(process.env.API_GATEWAY_PORT) || 8000;

  return {
    openapi: "3.0.3",
    info: {
      title: "Cart Service API",
      version: "1.0.0",
      description:
        "Cart microservice for storing selected items and managing clothing-specific cart operations.",
    },
    servers: [
      {
        url: process.env.SWAGGER_NATIVE_SERVER_URL || `http://localhost:${nativePort}`,
        description: "Cart service direct URL",
      },
      {
        url:
          process.env.SWAGGER_GATEWAY_SERVER_URL ||
          `http://localhost:${gatewayPort}`,
        description: "API gateway URL for cart service",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Service health endpoint",
      },
      {
        name: "Cart",
        description: "Cart item management endpoints",
      },
    ],
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Get service health status",
          responses: {
            200: {
              description: "Service is healthy",
            },
          },
        },
      },
      "/api/cart/{userId}": {
        get: {
          tags: ["Cart"],
          summary: "View user's cart",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Cart details",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CartResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/cart/{userId}/items": {
        post: {
          tags: ["Cart"],
          summary: "Add item to cart",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AddItemRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated cart",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CartResponse",
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Cart"],
          summary: "Clear all items from cart",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Emptied cart",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CartResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/cart/{userId}/items/{itemId}": {
        patch: {
          tags: ["Cart"],
          summary: "Update an item in cart",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "itemId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateItemRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated cart",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CartResponse",
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Cart"],
          summary: "Remove one item from cart",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "itemId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Updated cart",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CartResponse",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        AddItemRequest: {
          type: "object",
          required: [
            "productId",
            "productName",
            "unitPrice",
            "quantity",
            "size",
            "color",
          ],
          properties: {
            productId: { type: "string", example: "prod-101" },
            productName: { type: "string", example: "Men's Hoodie" },
            unitPrice: { type: "number", example: 4500 },
            quantity: { type: "integer", minimum: 1, example: 2 },
            size: { type: "string", example: "M" },
            color: { type: "string", example: "Black" },
            imageUrl: { type: "string", nullable: true, example: "https://example.com/item.jpg" },
          },
        },
        UpdateItemRequest: {
          type: "object",
          properties: {
            productName: { type: "string", example: "Men's Hoodie - Updated" },
            unitPrice: { type: "number", example: 4300 },
            quantity: { type: "integer", minimum: 1, example: 1 },
            size: { type: "string", example: "L" },
            color: { type: "string", example: "Blue" },
            imageUrl: { type: "string", nullable: true, example: "https://example.com/item2.jpg" },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            itemId: { type: "string" },
            productId: { type: "string" },
            productName: { type: "string" },
            unitPrice: { type: "number" },
            quantity: { type: "integer" },
            size: { type: "string" },
            color: { type: "string" },
            imageUrl: { type: "string", nullable: true },
            lineTotal: { type: "number" },
          },
        },
        CartResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartItem" },
            },
            totalItems: { type: "integer" },
            distinctItems: { type: "integer" },
            subtotal: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  };
}

module.exports = createOpenApiSpec;
