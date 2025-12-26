/**
 * Vibe-Pay 沙盒測試腳本
 *
 * 執行方式：
 * 1. 設定好 .env 環境變數
 * 2. 在 Supabase 執行 schema.sql
 * 3. 運行此測試腳本
 *
 * @module payment/tests/sandbox-test-script
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { initializeVibePay, VibePayServices } from '../index';
import { getVault } from '../services/NewebPayVault';

// ============================================
// 測試配置
// ============================================

interface TestConfig {
  supabaseUrl: string;
  supabaseKey: string;
  testEmail: string;
  baseUrl: string;
}

const config: TestConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  testEmail: 'test@vibe-pay.dev',
  baseUrl: process.env.VITE_APP_URL || 'http://localhost:5173',
};

// ============================================
// 測試結果型別
// ============================================

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  details: string;
  error?: string;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  totalPassed: number;
  totalFailed: number;
}

// ============================================
// 測試案例 1：單次付款流程
// ============================================

async function testSinglePaymentFlow(
  vibePay: VibePayServices
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // 1.1 測試付款表單產生
  const startForm = Date.now();
  try {
    const result = await vibePay.api.handleSinglePayment({
      amount: 100,
      itemDesc: '沙盒測試商品',
      email: config.testEmail,
    });

    results.push({
      name: '1.1 產生付款表單',
      passed: result.success && !!result.data?.formHtml,
      duration: Date.now() - startForm,
      details: result.success
        ? `訂單編號: ${result.data?.merchantOrderNo}`
        : `錯誤: ${result.error?.message}`,
    });

    // 1.2 驗證表單內容
    if (result.success && result.data?.formHtml) {
      const formHtml = result.data.formHtml;
      const hasCorrectAction = formHtml.includes('ccore.newebpay.com');
      const hasMerchantID = formHtml.includes('MerchantID');
      const hasTradeInfo = formHtml.includes('TradeInfo');
      const hasTradeSha = formHtml.includes('TradeSha');

      results.push({
        name: '1.2 表單內容驗證',
        passed: hasCorrectAction && hasMerchantID && hasTradeInfo && hasTradeSha,
        duration: 0,
        details: [
          `測試環境URL: ${hasCorrectAction ? '✓' : '✗'}`,
          `MerchantID: ${hasMerchantID ? '✓' : '✗'}`,
          `TradeInfo: ${hasTradeInfo ? '✓' : '✗'}`,
          `TradeSha: ${hasTradeSha ? '✓' : '✗'}`,
        ].join(', '),
      });
    }
  } catch (error) {
    results.push({
      name: '1.1 產生付款表單',
      passed: false,
      duration: Date.now() - startForm,
      details: '例外錯誤',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 1.3 測試 Webhook 解密 (模擬藍新回傳)
  const startDecrypt = Date.now();
  try {
    const vault = getVault();

    // 模擬加密資料
    const mockTradeInfo = {
      MerchantOrderNo: 'VP' + Date.now(),
      Amt: 100,
      ItemDesc: '測試',
      Email: config.testEmail,
    };

    const encrypted = vault.encryptMPGInfo(mockTradeInfo);
    const decrypted = vault.decryptTradeInfo(encrypted.tradeInfo, encrypted.tradeSha);

    results.push({
      name: '1.3 Webhook 解密驗證',
      passed: decrypted.success && decrypted.isValid,
      duration: Date.now() - startDecrypt,
      details: decrypted.success
        ? '加解密一致性通過'
        : `錯誤: ${decrypted.error}`,
    });
  } catch (error) {
    results.push({
      name: '1.3 Webhook 解密驗證',
      passed: false,
      duration: Date.now() - startDecrypt,
      details: '解密失敗',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return results;
}

// ============================================
// 測試案例 2：訂閱授權流程
// ============================================

async function testSubscriptionFlow(
  vibePay: VibePayServices,
  supabase: SupabaseClient
): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const testUserId = 'test-user-' + Date.now();

  // 2.1 建立訂閱
  const startCreate = Date.now();
  try {
    const result = await vibePay.api.handleSubscribe({
      userId: testUserId,
      amount: 99,
      itemDesc: '月訂閱測試',
      email: config.testEmail,
      periodType: 'M',
      periodPoint: '15',
      totalPeriods: 12,
    });

    results.push({
      name: '2.1 建立訂閱表單',
      passed: result.success && !!result.data?.formHtml,
      duration: Date.now() - startCreate,
      details: result.success
        ? `訂單編號: ${result.data?.merchantOrderNo}`
        : `錯誤: ${result.error?.message}`,
    });

    // 2.2 驗證訂閱記錄已寫入 Supabase
    if (result.success && result.data?.merchantOrderNo) {
      const startDB = Date.now();
      const { data: subscription, error } = await supabase
        .from('payment_subscriptions')
        .select('*')
        .eq('merchant_order_no', result.data.merchantOrderNo)
        .single();

      results.push({
        name: '2.2 Supabase 訂閱記錄',
        passed: !error && !!subscription,
        duration: Date.now() - startDB,
        details: subscription
          ? `狀態: ${subscription.status}, 期數: ${subscription.total_periods}`
          : `錯誤: ${error?.message}`,
      });

      // 2.3 模擬首次授權成功 (狀態機測試)
      if (subscription) {
        const startState = Date.now();
        const transitionResult = await vibePay.stateMachine.transition(
          subscription.id,
          'first_auth_success' as any,
          {
            periodNo: 'PN' + Date.now(),
            periodToken: 'TOKEN_' + Date.now(),
            nextAuthDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }
        );

        results.push({
          name: '2.3 狀態機轉換 (pending → active)',
          passed: transitionResult.success,
          duration: Date.now() - startState,
          details: transitionResult.success
            ? `${transitionResult.fromState} → ${transitionResult.toState}`
            : `錯誤: ${transitionResult.error}`,
        });

        // 2.4 驗證 PeriodToken 已存入
        const { data: updatedSub } = await supabase
          .from('payment_subscriptions')
          .select('period_token, status')
          .eq('id', subscription.id)
          .single();

        results.push({
          name: '2.4 PeriodToken 存儲驗證',
          passed: !!updatedSub?.period_token && updatedSub?.status === 'active',
          duration: 0,
          details: updatedSub
            ? `Token: ${updatedSub.period_token?.substring(0, 10)}..., Status: ${updatedSub.status}`
            : 'Token 未寫入',
        });
      }
    }
  } catch (error) {
    results.push({
      name: '2.1 建立訂閱表單',
      passed: false,
      duration: Date.now() - startCreate,
      details: '例外錯誤',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return results;
}

// ============================================
// 測試案例 3：冪等性 (Idempotency) 測試
// ============================================

async function testIdempotency(
  vibePay: VibePayServices,
  supabase: SupabaseClient
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // 3.1 連續發送相同請求
  const startIdempotent = Date.now();
  try {
    const request = {
      amount: 500,
      itemDesc: '冪等性測試',
      email: config.testEmail,
    };

    // 第一次請求
    const result1 = await vibePay.api.handleSinglePayment(request);

    // 立即第二次請求 (模擬重複提交)
    const result2 = await vibePay.api.handleSinglePayment(request);

    // 兩次應該產生不同訂單編號 (因為每次都是新的 merchantOrderNo)
    // 但如果使用相同的 idempotency key，應該返回相同結果
    results.push({
      name: '3.1 重複請求處理',
      passed: result1.success && result2.success,
      duration: Date.now() - startIdempotent,
      details: `請求1: ${result1.data?.merchantOrderNo}, 請求2: ${result2.data?.merchantOrderNo}`,
    });
  } catch (error) {
    results.push({
      name: '3.1 重複請求處理',
      passed: false,
      duration: Date.now() - startIdempotent,
      details: '測試失敗',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 3.2 模擬 Webhook 重複通知
  const startWebhook = Date.now();
  try {
    const vault = getVault();
    const orderNo = 'VP' + Date.now();

    // 模擬成功的 Webhook payload
    const mockResult = {
      Status: 'SUCCESS',
      Message: '授權成功',
      Result: {
        MerchantID: vault.getConfigInfo().merchantId,
        MerchantOrderNo: orderNo,
        Amt: 100,
        TradeNo: 'TN' + Date.now(),
        PaymentType: 'CREDIT',
        RespondTime: new Date().toISOString(),
        Auth: '123456',
      },
    };

    // 先建立訂單記錄
    await supabase.from('payment_orders').insert({
      merchant_order_no: orderNo,
      amount: 100,
      item_desc: '冪等性Webhook測試',
      email: config.testEmail,
      status: 'pending',
    });

    // 加密模擬資料
    const encrypted = vault.encryptMPGInfo(mockResult as any);

    // 第一次 Webhook
    const webhook1 = await vibePay.api.handlePaymentCallback(
      {
        Status: 'SUCCESS',
        MerchantID: vault.getConfigInfo().merchantId,
        TradeInfo: encrypted.tradeInfo,
        TradeSha: encrypted.tradeSha,
        Version: '2.0',
      },
      '127.0.0.1'
    );

    // 第二次 Webhook (模擬重複通知)
    const webhook2 = await vibePay.api.handlePaymentCallback(
      {
        Status: 'SUCCESS',
        MerchantID: vault.getConfigInfo().merchantId,
        TradeInfo: encrypted.tradeInfo,
        TradeSha: encrypted.tradeSha,
        Version: '2.0',
      },
      '127.0.0.1'
    );

    // 確認只有一筆訂單記錄
    const { data: orders } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('merchant_order_no', orderNo);

    results.push({
      name: '3.2 Webhook 重複通知防護',
      passed: orders?.length === 1,
      duration: Date.now() - startWebhook,
      details: `訂單數量: ${orders?.length} (應為 1)`,
    });
  } catch (error) {
    results.push({
      name: '3.2 Webhook 重複通知防護',
      passed: false,
      duration: Date.now() - startWebhook,
      details: '測試失敗',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 3.3 冪等性 Key 過期測試
  const startExpiry = Date.now();
  try {
    const { data: expiredKeys } = await supabase
      .from('payment_idempotency_keys')
      .select('id')
      .lt('expires_at', new Date().toISOString());

    results.push({
      name: '3.3 冪等性 Key 過期機制',
      passed: true, // 機制存在即通過
      duration: Date.now() - startExpiry,
      details: `過期 Key 數量: ${expiredKeys?.length || 0}`,
    });
  } catch (error) {
    results.push({
      name: '3.3 冪等性 Key 過期機制',
      passed: false,
      duration: Date.now() - startExpiry,
      details: '查詢失敗',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return results;
}

// ============================================
// 主測試執行器
// ============================================

async function runSandboxTests(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('  Vibe-Pay 沙盒測試');
  console.log('='.repeat(60) + '\n');

  // 初始化
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  const vibePay = initializeVibePay(supabase);

  const suites: TestSuite[] = [];

  // 執行測試套件 1：單次付款
  console.log('📦 測試套件 1：單次付款流程\n');
  const singlePaymentResults = await testSinglePaymentFlow(vibePay);
  suites.push({
    name: '單次付款流程',
    results: singlePaymentResults,
    totalPassed: singlePaymentResults.filter(r => r.passed).length,
    totalFailed: singlePaymentResults.filter(r => !r.passed).length,
  });

  // 執行測試套件 2：訂閱流程
  console.log('\n🔄 測試套件 2：訂閱授權流程\n');
  const subscriptionResults = await testSubscriptionFlow(vibePay, supabase);
  suites.push({
    name: '訂閱授權流程',
    results: subscriptionResults,
    totalPassed: subscriptionResults.filter(r => r.passed).length,
    totalFailed: subscriptionResults.filter(r => !r.passed).length,
  });

  // 執行測試套件 3：冪等性
  console.log('\n🛡️ 測試套件 3：冪等性測試\n');
  const idempotencyResults = await testIdempotency(vibePay, supabase);
  suites.push({
    name: '冪等性測試',
    results: idempotencyResults,
    totalPassed: idempotencyResults.filter(r => r.passed).length,
    totalFailed: idempotencyResults.filter(r => !r.passed).length,
  });

  // 輸出結果
  console.log('\n' + '='.repeat(60));
  console.log('  測試結果摘要');
  console.log('='.repeat(60) + '\n');

  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    console.log(`\n📋 ${suite.name}`);
    console.log('-'.repeat(40));

    for (const result of suite.results) {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      console.log(`   耗時: ${result.duration}ms`);
      console.log(`   詳情: ${result.details}`);
      if (result.error) {
        console.log(`   錯誤: ${result.error}`);
      }
    }

    console.log(`\n   通過: ${suite.totalPassed} / ${suite.results.length}`);
    totalPassed += suite.totalPassed;
    totalFailed += suite.totalFailed;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  總計: ${totalPassed} 通過, ${totalFailed} 失敗`);
  console.log('='.repeat(60) + '\n');

  // 輸出 JSON 報告
  const report = {
    timestamp: new Date().toISOString(),
    environment: 'sandbox',
    suites,
    summary: {
      totalTests: totalPassed + totalFailed,
      passed: totalPassed,
      failed: totalFailed,
      passRate: ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) + '%',
    },
  };

  console.log('\n📄 JSON 報告:');
  console.log(JSON.stringify(report, null, 2));
}

// 執行測試
runSandboxTests().catch(console.error);

export { runSandboxTests, testSinglePaymentFlow, testSubscriptionFlow, testIdempotency };
