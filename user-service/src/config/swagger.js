const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
  Error: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'User not found' },
      details: {
        type: 'object',
        additionalProperties: { type: 'string' },
        example: { email: 'Please provide a valid email address' },
      },
    },
  },
  HealthOk: {
    type: 'object',
    properties: {
      service: { type: 'string', example: 'user-service' },
      status: { type: 'string', example: 'ok' },
      message: { type: 'string', example: 'User service is running' },
    },
  },
};

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: 'REST API for user registration and management (clothing e-commerce microservice).',
    },
    servers: [
      {
        url: '/',
        description: 'Current host (same origin as the service)',
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
                  schema: { $ref: '#/components/schemas/HealthOk' },
                  example: {
                    service: 'user-service',
                    status: 'ok',
                    message: 'User service is running',
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
                  schema: { $ref: '#/components/schemas/User' },
                  example: {
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
            400: {
              description: 'Validation error or bad input',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: {
                    message: 'Email is required',
                    details: { email: 'Email is required' },
                  },
                },
              },
            },
            409: {
              description: 'Email already registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'Email already registered' },
                },
              },
            },
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'Internal server error' },
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
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                  example: [
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
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'Internal server error' },
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
                  schema: { $ref: '#/components/schemas/User' },
                  example: {
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
            400: {
              description: 'Invalid user ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'Invalid user ID' },
                },
              },
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'User not found' },
                },
              },
            },
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'Internal server error' },
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
                  schema: { $ref: '#/components/schemas/User' },
                  example: {
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
            400: {
              description: 'Invalid ID, validation error, or no fields to update',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  examples: {
                    invalidId: { value: { message: 'Invalid user ID' } },
                    noUpdates: { value: { message: 'No valid fields to update' } },
                    validation: {
                      value: {
                        message: 'Password must be at least 8 characters',
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
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'User not found' },
                },
              },
            },
            409: {
              description: 'Email already in use',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'Email already registered' },
                },
              },
            },
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'Internal server error' },
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
                  schema: { $ref: '#/components/schemas/User' },
                  example: {
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
            400: {
              description: 'Invalid user ID',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'Invalid user ID' },
                },
              },
            },
            404: {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'User not found' },
                },
              },
            },
            500: {
              description: 'Unexpected server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  example: { message: 'Internal server error' },
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

module.exports = {
  swaggerSpec,
  swaggerUiServe,
  swaggerUiSetup,
};
