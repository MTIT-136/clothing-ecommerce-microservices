const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// OpenAPI resolves relative server URLs against the spec document URL. When Swagger is
// loaded via the gateway (e.g. .../api/users/api-docs), url: "/" breaks the base path.
// Absolute servers keep "Try it out" correct for both direct and gateway access.
const userServicePort = String(process.env.PORT || '3001');
const gatewayPort = String(process.env.GATEWAY_PORT || '8000');

const userSchemas = {
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'Jane Doe' },
      email: { type: 'string', format: 'email', example: 'jane@example.com' },
      role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  RegisterRequest: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string', example: 'Jane Doe' },
      email: { type: 'string', format: 'email', example: 'jane@example.com' },
      password: { type: 'string', format: 'password', example: 'secretpass123' },
      role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
    },
  },
  UpdateUserRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Jane Smith' },
      email: { type: 'string', format: 'email', example: 'jane.smith@example.com' },
      password: { type: 'string', format: 'password', example: 'newpassword456' },
      role: { type: 'string', enum: ['customer', 'admin'], example: 'admin' },
    },
    description: 'Send at least one field. Omitted fields are left unchanged.',
  },
  ApiSuccessUser: {
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'User retrieved successfully' },
      data: { $ref: '#/components/schemas/User' },
    },
  },
  ApiSuccessUserList: {
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Users retrieved successfully' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/User' },
      },
    },
  },
  ApiError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'User not found' },
      data: { nullable: true, example: null },
      details: {
        type: 'object',
        additionalProperties: { type: 'string' },
      },
    },
  },
  HealthData: {
    type: 'object',
    properties: {
      service: { type: 'string', example: 'user-service' },
      status: { type: 'string', example: 'ok' },
    },
  },
  ApiSuccessHealth: {
    type: 'object',
    required: ['success', 'message', 'data'],
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Service is healthy' },
      data: { $ref: '#/components/schemas/HealthData' },
    },
  },
};

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description:
        'REST API for user registration and management (clothing e-commerce microservice). ' +
        'In Swagger, use the Servers dropdown: direct URL for this service, gateway URL when calling through the API gateway.',
    },
    servers: [
      {
        url: `http://localhost:${userServicePort}`,
        description: 'User service direct URL',
      },
      {
        url: `http://localhost:${gatewayPort}`,
        description: 'API gateway URL for user service',
      },
    ],
    tags: [
      { name: 'Health', description: 'Gateway and load balancer probes' },
      { name: 'Users', description: 'User CRUD and registration' },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          operationId: 'healthCheck',
          responses: {
            200: {
              description: 'Service is up',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessHealth' },
                  example: {
                    success: true,
                    message: 'Service is healthy',
                    data: {
                      service: 'user-service',
                      status: 'ok',
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/users/register': {
        post: {
          tags: ['Users'],
          summary: 'Register a new user',
          operationId: 'registerUser',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
                examples: {
                  customer: {
                    summary: 'Default customer',
                    value: {
                      name: 'Jane Doe',
                      email: 'jane@example.com',
                      password: 'secretpass123',
                    },
                  },
                  admin: {
                    summary: 'With explicit role',
                    value: {
                      name: 'Admin User',
                      email: 'admin@example.com',
                      password: 'adminpass123',
                      role: 'admin',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessUser' },
                  example: {
                    success: true,
                    message: 'User registered successfully',
                    data: {
                      _id: '507f1f77bcf86cd799439011',
                      name: 'Jane Doe',
                      email: 'jane@example.com',
                      role: 'customer',
                      createdAt: '2026-03-28T10:00:00.000Z',
                      updatedAt: '2026-03-28T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error or bad input',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Email is required',
                    data: null,
                    details: { email: 'Email is required' },
                  },
                },
              },
            },
            409: {
              description: 'Email already registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Email already registered',
                    data: null,
                  },
                },
              },
            },
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Internal server error',
                    data: null,
                  },
                },
              },
            },
          },
        },
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List all users',
          operationId: 'getUsers',
          responses: {
            200: {
              description: 'Array of users (passwords never returned)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessUserList' },
                  example: {
                    success: true,
                    message: 'Users retrieved successfully',
                    data: [
                      {
                        _id: '507f1f77bcf86cd799439011',
                        name: 'Jane Doe',
                        email: 'jane@example.com',
                        role: 'customer',
                        createdAt: '2026-03-28T10:00:00.000Z',
                        updatedAt: '2026-03-28T10:00:00.000Z',
                      },
                      {
                        _id: '507f191e810c19729de860ea',
                        name: 'John Smith',
                        email: 'john@example.com',
                        role: 'admin',
                        createdAt: '2026-03-27T08:30:00.000Z',
                        updatedAt: '2026-03-28T09:15:00.000Z',
                      },
                    ],
                  },
                },
              },
            },
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Internal server error',
                    data: null,
                  },
                },
              },
            },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID',
          operationId: 'getUserById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'MongoDB ObjectId',
              schema: { type: 'string', example: '507f1f77bcf86cd799439011' },
            },
          ],
          responses: {
            200: {
              description: 'User found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessUser' },
                  example: {
                    success: true,
                    message: 'User retrieved successfully',
                    data: {
                      _id: '507f1f77bcf86cd799439011',
                      name: 'Jane Doe',
                      email: 'jane@example.com',
                      role: 'customer',
                      createdAt: '2026-03-28T10:00:00.000Z',
                      updatedAt: '2026-03-28T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid user ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Invalid user ID',
                    data: null,
                  },
                },
              },
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'User not found',
                    data: null,
                  },
                },
              },
            },
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Internal server error',
                    data: null,
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Update user',
          operationId: 'updateUser',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'MongoDB ObjectId',
              schema: { type: 'string', example: '507f1f77bcf86cd799439011' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateUserRequest' },
                example: {
                  name: 'Jane Smith',
                  email: 'jane.smith@example.com',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Updated user',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessUser' },
                  example: {
                    success: true,
                    message: 'User updated successfully',
                    data: {
                      _id: '507f1f77bcf86cd799439011',
                      name: 'Jane Smith',
                      email: 'jane.smith@example.com',
                      role: 'customer',
                      createdAt: '2026-03-28T10:00:00.000Z',
                      updatedAt: '2026-03-28T11:20:00.000Z',
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid ID, validation error, or no fields to update',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    invalidId: {
                      value: {
                        success: false,
                        message: 'Invalid user ID',
                        data: null,
                      },
                    },
                    noUpdates: {
                      value: {
                        success: false,
                        message: 'No valid fields to update',
                        data: null,
                      },
                    },
                    validation: {
                      value: {
                        success: false,
                        message: 'Password must be at least 8 characters',
                        data: null,
                        details: { password: 'Password must be at least 8 characters' },
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'User not found',
                    data: null,
                  },
                },
              },
            },
            409: {
              description: 'Email already in use',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Email already registered',
                    data: null,
                  },
                },
              },
            },
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Internal server error',
                    data: null,
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete user',
          operationId: 'deleteUser',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'MongoDB ObjectId',
              schema: { type: 'string', example: '507f1f77bcf86cd799439011' },
            },
          ],
          responses: {
            200: {
              description: 'Deleted user (snapshot before removal)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiSuccessUser' },
                  example: {
                    success: true,
                    message: 'User deleted successfully',
                    data: {
                      _id: '507f1f77bcf86cd799439011',
                      name: 'Jane Doe',
                      email: 'jane@example.com',
                      role: 'customer',
                      createdAt: '2026-03-28T10:00:00.000Z',
                      updatedAt: '2026-03-28T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid user ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Invalid user ID',
                    data: null,
                  },
                },
              },
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'User not found',
                    data: null,
                  },
                },
              },
            },
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  example: {
                    success: false,
                    message: 'Internal server error',
                    data: null,
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: userSchemas,
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerUiServe = swaggerUi.serve;
const swaggerUiSetup = swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'User Service API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
  },
});

function setupSwagger(app) {
  app.use(
    '/api-docs',
    (req, res, next) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.set('Pragma', 'no-cache');
      next();
    },
    swaggerUiServe,
    swaggerUiSetup
  );
}

module.exports = {
  swaggerSpec,
  setupSwagger,
  swaggerUiServe,
  swaggerUiSetup,
};
