const request = require('supertest');
const app = require('../../src/app');
const { Vendor } = require('../../src/models');
const jwt = require('jsonwebtoken');

describe('Vendor API Integration Tests', () => {
  let adminToken;
  let vendorToken;

  beforeAll(() => {
    // Generate test tokens
    adminToken = jwt.sign(
      { id: 'admin-123', role: 'admin' },
      process.env.JWT_SECRET || 'test-secret'
    );

    vendorToken = jwt.sign(
      { id: 'vendor-123', role: 'vendor', vendorId: 'vendor-123' },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  describe('POST /api/v1/vendors/register', () => {
    it('should register a new vendor', async () => {
      const vendorData = {
        companyName: 'API Test Company',
        contactPersonName: 'Jane Doe',
        companyEmail: 'api@testcompany.com',
        companyPhone: '9876543210',
        companyGST: '22FFFFF0000A1Z5',
        companyPAN: 'FFFFF0000A',
        companyAddress1: '456 API Street',
        companyCity: 'Delhi',
        companyState: 'Delhi',
        companyStateCode: 'DL',
        companyPincode: '110001',
      };

      const response = await request(app)
        .post('/api/v1/vendors/register')
        .send(vendorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.companyName).toBe('API Test Company');
      expect(response.body.data.vendorPrefixId).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/vendors/register')
        .send({
          companyName: 'Incomplete Company',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate GST number', async () => {
      const vendorData = {
        companyName: 'Duplicate Company',
        companyGST: '22GGGGG0000A1Z5',
        companyPAN: 'GGGGG0000A',
      };

      // Create first vendor
      await request(app)
        .post('/api/v1/vendors/register')
        .send(vendorData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/vendors/register')
        .send(vendorData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/vendors', () => {
    it('should get all vendors (admin only)', async () => {
      const response = await request(app)
        .get('/api/v1/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/vendors?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should support filtering by status', async () => {
      const response = await request(app)
        .get('/api/v1/vendors?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/v1/vendors')
        .expect(401);
    });
  });

  describe('GET /api/v1/vendors/:id', () => {
    let vendorId;

    beforeAll(async () => {
      const vendor = await Vendor.create({
        vendorPrefixId: 'V999999',
        companyName: 'Get Test Company',
        companyGST: '22HHHHH0000A1Z5',
        companyPAN: 'HHHHH0000A',
        vendorSlug: 'get-test-company',
      });
      vendorId = vendor.id;
    });

    it('should get vendor by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(vendorId);
    });

    it('should return 404 for non-existent vendor', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/v1/vendors/${fakeId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(404);
    });
  });

  describe('POST /api/v1/vendors/:id/approve', () => {
    let vendorId;

    beforeEach(async () => {
      const vendor = await Vendor.create({
        vendorPrefixId: 'V888888',
        companyName: 'Approve Test Company',
        companyGST: '22IIIII0000A1Z5',
        companyPAN: 'IIIII0000A',
        vendorSlug: 'approve-test-company',
      });
      vendorId = vendor.id;
    });

    it('should approve vendor (admin only)', async () => {
      const response = await request(app)
        .post(`/api/v1/vendors/${vendorId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          approvedBy: 'admin-123',
          approvalNotes: 'All documents verified',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.approvalFlag).toBe(true);
    });

    it('should fail without admin role', async () => {
      await request(app)
        .post(`/api/v1/vendors/${vendorId}/approve`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/store-kyc/:vendorId/submit', () => {
    let vendorId;

    beforeAll(async () => {
      const vendor = await Vendor.create({
        vendorPrefixId: 'V777777',
        companyName: 'KYC Submit Company',
        companyGST: '22JJJJJ0000A1Z5',
        companyPAN: 'JJJJJ0000A',
        vendorSlug: 'kyc-submit-company',
      });
      vendorId = vendor.id;
    });

    it('should submit store KYC', async () => {
      const response = await request(app)
        .post(`/api/v1/store-kyc/${vendorId}/submit`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          establishmentLicense: 'EST12345',
          tradeLicense: 'TRADE67890',
          fssaiLicense: 'FSSAI11111',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.storeKYC).toBeDefined();
      expect(response.body.data.storeVerificationStatus).toBe('pending');
    });
  });
});
