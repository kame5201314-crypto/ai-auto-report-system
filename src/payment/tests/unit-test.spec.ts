/**
 * Vibe-Pay 單元測試
 *
 * 執行方式：npx vitest run src/payment/tests/unit-test.spec.ts
 *
 * @module payment/tests/unit-test
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

// Mock 環境變數
vi.stubEnv('NEWEBPAY_MERCHANT_ID', 'MS12345678');
vi.stubEnv('NEWEBPAY_HASH_KEY', 'abcdefghijklmnopqrstuvwxyz123456');
vi.stubEnv('NEWEBPAY_HASH_IV', '1234567890abcdef');
vi.stubEnv('NEWEBPAY_IS_PRODUCTION', 'false');

// 動態導入以使用 mock 環境變數
let NewebPayVault: typeof import('../services/NewebPayVault').NewebPayVault;
let getVault: typeof import('../services/NewebPayVault').getVault;

describe('Vibe-Pay 核心模組測試', () => {
  beforeAll(async () => {
    // 動態導入
    const vaultModule = await import('../services/NewebPayVault');
    NewebPayVault = vaultModule.NewebPayVault;
    getVault = vaultModule.getVault;

    // 重置單例
    NewebPayVault.resetInstance();
  });

  // ==========================================
  // 測試套件 1: NewebPayVault 加密核心
  // ==========================================
  describe('NewebPayVault 加密核心', () => {
    it('應正確初始化 Vault', () => {
      const vault = getVault();
      const config = vault.getConfigInfo();

      expect(config.merchantId).toBe('MS12345678');
      expect(config.isTest).toBe(true);
    });

    it('應產生唯一訂單編號', () => {
      const vault = getVault();
      const orderNo1 = vault.generateOrderNo('VP');
      const orderNo2 = vault.generateOrderNo('VP');

      expect(orderNo1).toMatch(/^VP[A-Z0-9]+$/);
      expect(orderNo2).toMatch(/^VP[A-Z0-9]+$/);
      expect(orderNo1).not.toBe(orderNo2);
    });

    it('應正確加密 MPG 交易資訊', () => {
      const vault = getVault();
      const result = vault.encryptTradeInfo({
        MerchantOrderNo: 'VP1234567890',
        Amt: 100,
        ItemDesc: '測試商品',
        Email: 'test@example.com',
      });

      expect(result.tradeInfo).toBeTruthy();
      expect(result.tradeSha).toBeTruthy();
      expect(result.tradeSha).toMatch(/^[A-F0-9]{64}$/); // SHA256 大寫 Hex
    });

    it('加解密應一致', () => {
      const vault = getVault();
      const originalData = {
        MerchantOrderNo: 'VP1234567890',
        Amt: 500,
        ItemDesc: '加解密測試',
        Email: 'test@example.com',
      };

      const encrypted = vault.encryptTradeInfo(originalData);

      // 驗證加密結果
      expect(encrypted.tradeInfo).toBeTruthy();
      expect(encrypted.tradeSha).toBeTruthy();

      // 驗證簽名一致性
      const isValidSignature = vault.verifyWebhookSignature(
        encrypted.tradeInfo,
        encrypted.tradeSha
      );
      expect(isValidSignature).toBe(true);
    });

    it('應拒絕無效的簽名', () => {
      const vault = getVault();
      const encrypted = vault.encryptTradeInfo({
        MerchantOrderNo: 'VP1234567890',
        Amt: 100,
      });

      // 修改簽名
      const invalidSha = 'A'.repeat(64);
      const result = vault.verifyWebhookSignature(encrypted.tradeInfo, invalidSha);

      expect(result).toBe(false);
    });

    it('應產生正確的 MPG 表單資料', () => {
      const vault = getVault();
      const formData = vault.generateMPGFormData({
        MerchantOrderNo: 'VP1234567890',
        Amt: 1000,
        ItemDesc: '表單測試',
        Email: 'test@example.com',
      });

      expect(formData.MerchantID).toBe('MS12345678');
      expect(formData.TradeInfo).toBeTruthy();
      expect(formData.TradeSha).toBeTruthy();
      expect(formData.Version).toBe('2.0');
    });

    it('健康檢查應通過', () => {
      const vault = getVault();
      const health = vault.healthCheck();

      expect(health.initialized).toBe(true);
      expect(health.keysValid).toBe(true);
    });
  });

  // ==========================================
  // 測試套件 2: 定期定額加密
  // ==========================================
  describe('定期定額加密', () => {
    it('應正確加密定期定額參數', () => {
      const vault = getVault();
      const result = vault.encryptPeriodInfo({
        MerchantOrderNo: 'VPS1234567890',
        Amt: 299,
        ItemDesc: '月訂閱',
        Email: 'subscriber@example.com',
        PeriodType: 'M',
        PeriodPoint: '15',
        PeriodAmt: 12,
      });

      expect(result.tradeInfo).toBeTruthy();
      expect(result.tradeSha).toBeTruthy();
    });

    it('應產生定期定額表單資料', () => {
      const vault = getVault();
      const formData = vault.generatePeriodFormData({
        MerchantOrderNo: 'VPS1234567890',
        Amt: 99,
        ItemDesc: '訂閱測試',
        Email: 'test@example.com',
        PeriodType: 'M',
        PeriodPoint: '01',
        PeriodAmt: 6,
      });

      expect(formData.MerchantID).toBe('MS12345678');
      expect(formData.TradeInfo).toBeTruthy();
    });
  });

  // ==========================================
  // 測試套件 3: 驗證中間件
  // ==========================================
  describe('驗證中間件', () => {
    it('應驗證有效的單次付款請求', async () => {
      const { validateSinglePaymentRequest } = await import('../middleware/validation');

      const result = validateSinglePaymentRequest({
        amount: 100,
        itemDesc: '商品',
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data?.amount).toBe(100);
    });

    it('應拒絕無效金額', async () => {
      const { validateSinglePaymentRequest } = await import('../middleware/validation');

      const result = validateSinglePaymentRequest({
        amount: -100,
        itemDesc: '商品',
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain('amount must be greater than 0');
    });

    it('應拒絕無效 Email', async () => {
      const { validateSinglePaymentRequest } = await import('../middleware/validation');

      const result = validateSinglePaymentRequest({
        amount: 100,
        itemDesc: '商品',
        email: 'invalid-email',
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain('email format is invalid');
    });

    it('應驗證有效的訂閱請求', async () => {
      const { validateSubscribeRequest } = await import('../middleware/validation');

      const result = validateSubscribeRequest({
        userId: 'user-123',
        amount: 299,
        itemDesc: '月訂閱',
        email: 'test@example.com',
        periodType: 'M',
        periodPoint: '15',
        totalPeriods: 12,
      });

      expect(result.success).toBe(true);
    });

    it('應驗證週期格式 (月)', async () => {
      const { validateSubscribeRequest } = await import('../middleware/validation');

      const result = validateSubscribeRequest({
        userId: 'user-123',
        amount: 299,
        itemDesc: '月訂閱',
        email: 'test@example.com',
        periodType: 'M',
        periodPoint: '32', // 無效：超過 31
        totalPeriods: 12,
      });

      expect(result.success).toBe(false);
    });

    it('應驗證 Webhook Payload', async () => {
      const { validateWebhookPayload } = await import('../middleware/validation');

      const result = validateWebhookPayload({
        Status: 'SUCCESS',
        MerchantID: 'MS12345678',
        TradeInfo: 'encrypted_data',
        TradeSha: 'sha256_hash',
      });

      expect(result.success).toBe(true);
    });

    it('應驗證訂單編號格式', async () => {
      const { isValidOrderNo } = await import('../middleware/validation');

      expect(isValidOrderNo('VP1234567890ABCD')).toBe(true);
      expect(isValidOrderNo('VP-123')).toBe(false); // 含非法字元
      expect(isValidOrderNo('')).toBe(false);
    });
  });

  // ==========================================
  // 測試套件 4: 狀態機
  // ==========================================
  describe('訂閱狀態機', () => {
    it('應定義所有狀態', async () => {
      const { SubscriptionState } = await import('../state-machine/SubscriptionStateMachine');

      expect(SubscriptionState.PENDING).toBe('pending');
      expect(SubscriptionState.ACTIVE).toBe('active');
      expect(SubscriptionState.PAST_DUE).toBe('past_due');
      expect(SubscriptionState.SUSPENDED).toBe('suspended');
      expect(SubscriptionState.CANCELLED).toBe('cancelled');
      expect(SubscriptionState.EXPIRED).toBe('expired');
    });

    it('應定義所有事件', async () => {
      const { SubscriptionEvent } = await import('../state-machine/SubscriptionStateMachine');

      expect(SubscriptionEvent.FIRST_AUTH_SUCCESS).toBe('first_auth_success');
      expect(SubscriptionEvent.PAYMENT_SUCCESS).toBe('payment_success');
      expect(SubscriptionEvent.PAYMENT_FAILED).toBe('payment_failed');
      expect(SubscriptionEvent.USER_SUSPEND).toBe('user_suspend');
      expect(SubscriptionEvent.USER_RESUME).toBe('user_resume');
      expect(SubscriptionEvent.USER_CANCEL).toBe('user_cancel');
    });
  });

  // ==========================================
  // 測試套件 5: 配置載入
  // ==========================================
  describe('配置載入', () => {
    it('應取得正確的端點 URL', async () => {
      const { getEndpoints } = await import('../config/newebpay.config');

      const testEndpoints = getEndpoints(false);
      expect(testEndpoints.mpg).toBe('https://ccore.newebpay.com/MPG/mpg_gateway');
      expect(testEndpoints.period).toBe('https://ccore.newebpay.com/MPG/period');

      const prodEndpoints = getEndpoints(true);
      expect(prodEndpoints.mpg).toBe('https://core.newebpay.com/MPG/mpg_gateway');
    });
  });
});

// ==========================================
// 效能測試
// ==========================================
describe('效能測試', () => {
  it('加密應在 50ms 內完成', async () => {
    const { getVault } = await import('../services/NewebPayVault');
    const vault = getVault();

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      vault.encryptTradeInfo({
        MerchantOrderNo: `VP${i}`,
        Amt: 100,
        ItemDesc: '效能測試',
        Email: 'test@example.com',
      });
    }
    const elapsed = performance.now() - start;

    console.log(`100 次加密耗時: ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(5000); // 100 次 < 5 秒
  });
});
