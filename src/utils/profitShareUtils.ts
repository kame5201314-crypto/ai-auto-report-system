import { ProfitSharePeriod, ProfitShareRecord } from '../types/kol';

/**
 * 根據開始日期和分潤週期計算結束日期
 */
export function calculatePeriodEndDate(startDate: string, period: ProfitSharePeriod): string {
  const start = new Date(startDate);
  let endDate = new Date(start);

  switch (period) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'semi-annual':
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }

  return endDate.toISOString().split('T')[0];
}

/**
 * 檢查是否應該顯示提醒（結束日期前 15 天內）
 */
export function shouldShowReminder(endDate: string): boolean {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 在結束日期前 15 天內且尚未過期
  return diffDays <= 15 && diffDays >= 0;
}

/**
 * 計算距離結束日期還有幾天
 */
export function getDaysUntilEnd(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 取得需要提醒的分潤記錄
 */
export function getPendingProfitShares(profitShares: ProfitShareRecord[] | undefined): ProfitShareRecord[] {
  if (!profitShares) return [];

  return profitShares.filter(share => shouldShowReminder(share.periodEnd));
}

/**
 * 取得分潤週期的中文名稱
 */
export function getPeriodLabel(period: ProfitSharePeriod): string {
  const labels: Record<ProfitSharePeriod, string> = {
    monthly: '每月',
    quarterly: '每三個月',
    'semi-annual': '每六個月',
    yearly: '每一年'
  };
  return labels[period] || period;
}
