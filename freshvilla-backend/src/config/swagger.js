const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FreshVilla Enterprise API',
      version: '2.0.0',
      description: 'Complete API documentation for FreshVilla B2B+B2C Marketplace Platform',
      contact: {
        name: 'FreshVilla Support',
        email: 'dev@freshvilla.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.freshvilla.com/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Distributor: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            distributorPrefixId: { type: 'string', example: 'V1234567890' },
            companyName: { type: 'string', example: 'Fresh Produce Co.' },
            companyEmail: { type: 'string', format: 'email' },
            companyPhone: { type: 'string', example: '9876543210' },
            companyGST: { type: 'string', example: '22AAAAA0000A1Z5' },
            companyPAN: { type: 'string', example: 'AAAAA0000A' },
            verificationStatus: { type: 'string', enum: ['pending', 'in-review', 'verified', 'rejected'] },
            approvalFlag: { type: 'boolean' },
            isActive: { type: 'boolean' },
            storeVerificationStatus: { type: 'string', enum: ['pending', 'verified', 'rejected'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            customerId: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string' },
            comment: { type: 'string' },
            isVerifiedPurchase: { type: 'boolean' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            helpfulCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            conversationId: { type: 'string' },
            customerId: { type: 'string', format: 'uuid' },
            channelType: { type: 'string', enum: ['chat', 'email', 'whatsapp', 'phone'] },
            status: { type: 'string', enum: ['open', 'pending', 'resolved', 'closed'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            messageCount: { type: 'integer' },
            unreadCount: { type: 'integer' },
          },
        },
        Coupon: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string', example: 'SAVE20' },
            name: { type: 'string' },
            discountType: { type: 'string', enum: ['percentage', 'fixed', 'free_shipping'] },
            discountValue: { type: 'number' },
            minPurchaseAmount: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
            isPublic: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized - Missing or invalid token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Distributors', description: 'Distributor management endpoints' },
      { name: 'Distributor KYC', description: 'KYC document verification' },
      { name: 'Store KYC', description: 'Store license verification' },
      { name: 'Support', description: 'Customer support and conversations' },
      { name: 'Reviews', description: 'Product reviews and ratings' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Coupons', description: 'Promotional codes and discounts' },
    ],
  },
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
