const { Vendor } = require('../../src/models');

describe('Vendor Model', () => {
  describe('Validation', () => {
    it('should create a valid vendor', async () => {
      const vendorData = {
        vendorPrefixId: 'V123456',
        companyName: 'Test Company',
        contactPersonName: 'John Doe',
        companyEmail: 'test@company.com',
        companyPhone: '1234567890',
        companyGST: '22AAAAA0000A1Z5',
        companyPAN: 'AAAAA0000A',
        companyAddress1: '123 Test Street',
        companyCity: 'Mumbai',
        companyState: 'Maharashtra',
        companyStateCode: 'MH',
        companyPincode: '400001',
        vendorSlug: 'test-company',
      };

      const vendor = await Vendor.create(vendorData);

      expect(vendor.id).toBeDefined();
      expect(vendor.companyName).toBe('Test Company');
      expect(vendor.verificationStatus).toBe('pending');
      expect(vendor.isActive).toBe(false);
    });

    it('should fail with invalid GST number', async () => {
      const vendorData = {
        vendorPrefixId: 'V123457',
        companyName: 'Test Company 2',
        companyGST: 'INVALID_GST',
        companyPAN: 'AAAAA0000A',
        vendorSlug: 'test-company-2',
      };

      await expect(Vendor.create(vendorData)).rejects.toThrow();
    });

    it('should fail with invalid PAN number', async () => {
      const vendorData = {
        vendorPrefixId: 'V123458',
        companyName: 'Test Company 3',
        companyGST: '22AAAAA0000A1Z5',
        companyPAN: 'INVALID',
        vendorSlug: 'test-company-3',
      };

      await expect(Vendor.create(vendorData)).rejects.toThrow();
    });

    it('should enforce unique GST number', async () => {
      const vendorData1 = {
        vendorPrefixId: 'V123459',
        companyName: 'Company A',
        companyGST: '22BBBBB0000A1Z5',
        companyPAN: 'BBBBB0000A',
        vendorSlug: 'company-a',
      };

      const vendorData2 = {
        vendorPrefixId: 'V123460',
        companyName: 'Company B',
        companyGST: '22BBBBB0000A1Z5', // Same GST
        companyPAN: 'CCCCC0000A',
        vendorSlug: 'company-b',
      };

      await Vendor.create(vendorData1);
      await expect(Vendor.create(vendorData2)).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let vendor;

    beforeEach(async () => {
      vendor = await Vendor.create({
        vendorPrefixId: 'V123461',
        companyName: 'Method Test Company',
        companyGST: '22DDDDD0000A1Z5',
        companyPAN: 'DDDDD0000A',
        vendorSlug: 'method-test-company',
        approvalFlag: true,
        isActive: true,
        verificationStatus: 'verified',
      });
    });

    it('should generate slug from company name', () => {
      const slug = vendor.generateSlug();
      expect(slug).toBe('method-test-company');
    });

    it('should check if vendor can sell', () => {
      expect(vendor.canSell()).toBe(true);
    });

    it('should return false when vendor is not active', async () => {
      await vendor.update({ isActive: false });
      expect(vendor.canSell()).toBe(false);
    });

    it('should return false when vendor is deleted', async () => {
      await vendor.update({ isDelete: true });
      expect(vendor.canSell()).toBe(false);
    });
  });

  describe('Store KYC', () => {
    it('should store KYC data as JSONB', async () => {
      const vendor = await Vendor.create({
        vendorPrefixId: 'V123462',
        companyName: 'KYC Test Company',
        companyGST: '22EEEEE0000A1Z5',
        companyPAN: 'EEEEE0000A',
        vendorSlug: 'kyc-test-company',
        storeKYC: {
          establishmentLicense: 'EST123',
          tradeLicense: 'TRADE456',
          fssaiLicense: 'FSSAI789',
        },
      });

      expect(vendor.storeKYC).toBeDefined();
      expect(vendor.storeKYC.establishmentLicense).toBe('EST123');
      expect(vendor.storeVerificationStatus).toBe('pending');
    });
  });
});
