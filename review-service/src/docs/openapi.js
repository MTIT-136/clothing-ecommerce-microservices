function createOpenApiSpec() {
  const nativePort = Number(process.env.PORT) || 3006;
  const gatewayPort = Number(process.env.API_GATEWAY_PORT) || 8000;

  return {
    openapi: "3.0.3",
    info: {
      title: "Review Service API",
      version: "1.0.0",
      description:
        "Review microservice for managing product reviews and ratings.",
    },
    servers: [
      {
        url: process.env.SWAGGER_NATIVE_SERVER_URL || `http://localhost:${nativePort}`,
        description: "Review service direct URL",
      },
      {
        url:
          process.env.SWAGGER_GATEWAY_SERVER_URL ||
          `http://localhost:${gatewayPort}`,
        description: "API gateway URL for review service",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Service health endpoint",
      },
      {
        name: "Review",
        description: "Review management endpoints",
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
      "/api/reviews": {
        get: {
          tags: ["Review"],
          summary: "List all reviews",
          responses: {
            200: {
              description: "All reviews (newest first)",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ReviewResponse" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/reviews/{productId}": {
        get: {
          tags: ["Review"],
          summary: "Get reviews for a product",
          parameters: [
            {
              name: "productId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "List of reviews",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ReviewResponse" },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Review"],
          summary: "Add a review for a product",
          parameters: [
            {
              name: "productId",
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
                  $ref: "#/components/schemas/AddReviewRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Added review",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ReviewResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/reviews/{productId}/{reviewId}": {
        patch: {
          tags: ["Review"],
          summary: "Update a review",
          parameters: [
            {
              name: "productId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "reviewId",
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
                  $ref: "#/components/schemas/UpdateReviewRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated review",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ReviewResponse",
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Review"],
          summary: "Delete a review",
          parameters: [
            {
              name: "productId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "reviewId",
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
                  type: "object",
                  required: ["userId"],
                  properties: {
                    userId: { type: "string", example: "user-123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Review deleted",
            },
          },
        },
      },
    },
    components: {
      schemas: {
        AddReviewRequest: {
          type: "object",
          required: ["userId", "rating"],
          properties: {
            userId: { type: "string", example: "user-123" },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
            comment: { type: "string", example: "Great product!" },
          },
        },
        UpdateReviewRequest: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", example: "user-123" },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment: { type: "string", example: "Updated comment" },
          },
        },
        ReviewResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            productId: { type: "string" },
            rating: { type: "integer" },
            comment: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  };
}

module.exports = createOpenApiSpec;