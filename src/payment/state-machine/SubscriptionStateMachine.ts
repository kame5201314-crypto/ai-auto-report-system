/**
 * 訂閱狀態機 (Subscription State Machine)
 *
 * 狀態流轉圖：
 *
 *                    ┌─────────────┐
 *                    │   PENDING   │ (首次授權前)
 *                    └──────┬──────┘
 *                           │ (首次授權成功)
 *                           ▼
 *   ┌────────────────────────────────────────────────┐
 *   │                    ACTIVE                       │
 *   │              (正常扣款中)                        │
 *   └──────┬─────────────┬─────────────────┬─────────┘
 *          │             │                 │
 *   (扣款失敗)    (用戶暫停)         (期數到期)
 *          │             │                 │
 *          ▼             ▼                 ▼
 *   ┌───────────┐  ┌───────────┐    ┌───────────┐
 *   │ PAST_DUE  │  │ SUSPENDED │    │  EXPIRED  │
 *   │ (逾期)    │  │ (暫停中)   │    │  (已到期) │
 *   └─────┬─────┘  └─────┬─────┘    └───────────┘
 *         │              │
 *  (重試成功/  (用戶恢復)
 *   超過限制)         │
 *         │              │
 *         ▼              ▼
 *   ┌───────────┐  ┌───────────┐
 *   │ CANCELLED │  │  ACTIVE   │
 *   │ (已取消)  │  │           │
 *   └───────────┘  └───────────┘
 *
 * @module payment/state-machine/SubscriptionStateMachine
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================
// 狀態定義
// ============================================

/**
 * 訂閱狀態
 */
export enum SubscriptionState {
  /** 待首次授權 */
  PENDING = 'pending',
  /** 活躍中 */
  ACTIVE = 'active',
  /** 逾期 (扣款失敗) */
  PAST_DUE = 'past_due',
  /** 暫停中 */
  SUSPENDED = 'suspended',
  /** 已取消 */
  CANCELLED = 'cancelled',
  /** 已到期 */
  EXPIRED = 'expired',
}

/**
 * 狀態轉換事件
 */
export enum SubscriptionEvent {
  /** 首次授權成功 */
  FIRST_AUTH_SUCCESS = 'first_auth_success',
  /** 首次授權失敗 */
  FIRST_AUTH_FAILED = 'first_auth_failed',
  /** 扣款成功 */
  PAYMENT_SUCCESS = 'payment_success',
  /** 扣款失敗 */
  PAYMENT_FAILED = 'payment_failed',
  /** 用戶暫停 */
  USER_SUSPEND = 'user_suspend',
  /** 用戶恢復 */
  USER_RESUME = 'user_resume',
  /** 用戶取消 */
  USER_CANCEL = 'user_cancel',
  /** 期數到期 */
  PERIODS_COMPLETED = 'periods_completed',
  /** 逾期過久 (超過重試限制) */
  OVERDUE_LIMIT = 'overdue_limit',
  /** 重試成功 */
  RETRY_SUCCESS = 'retry_success',
}

/**
 * 狀態轉換配置
 */
interface StateTransition {
  from: SubscriptionState;
  to: SubscriptionState;
  event: SubscriptionEvent;
}

// ============================================
// 狀態轉換規則
// ============================================

const STATE_TRANSITIONS: StateTransition[] = [
  // PENDING 狀態轉換
  { from: SubscriptionState.PENDING, to: SubscriptionState.ACTIVE, event: SubscriptionEvent.FIRST_AUTH_SUCCESS },
  { from: SubscriptionState.PENDING, to: SubscriptionState.CANCELLED, event: SubscriptionEvent.FIRST_AUTH_FAILED },

  // ACTIVE 狀態轉換
  { from: SubscriptionState.ACTIVE, to: SubscriptionState.ACTIVE, event: SubscriptionEvent.PAYMENT_SUCCESS },
  { from: SubscriptionState.ACTIVE, to: SubscriptionState.PAST_DUE, event: SubscriptionEvent.PAYMENT_FAILED },
  { from: SubscriptionState.ACTIVE, to: SubscriptionState.SUSPENDED, event: SubscriptionEvent.USER_SUSPEND },
  { from: SubscriptionState.ACTIVE, to: SubscriptionState.CANCELLED, event: SubscriptionEvent.USER_CANCEL },
  { from: SubscriptionState.ACTIVE, to: SubscriptionState.EXPIRED, event: SubscriptionEvent.PERIODS_COMPLETED },

  // PAST_DUE 狀態轉換
  { from: SubscriptionState.PAST_DUE, to: SubscriptionState.ACTIVE, event: SubscriptionEvent.RETRY_SUCCESS },
  { from: SubscriptionState.PAST_DUE, to: SubscriptionState.CANCELLED, event: SubscriptionEvent.OVERDUE_LIMIT },
  { from: SubscriptionState.PAST_DUE, to: SubscriptionState.CANCELLED, event: SubscriptionEvent.USER_CANCEL },

  // SUSPENDED 狀態轉換
  { from: SubscriptionState.SUSPENDED, to: SubscriptionState.ACTIVE, event: SubscriptionEvent.USER_RESUME },
  { from: SubscriptionState.SUSPENDED, to: SubscriptionState.CANCELLED, event: SubscriptionEvent.USER_CANCEL },
];

// ============================================
// 狀態機實例
// ============================================

/**
 * 訂閱狀態機
 */
export class SubscriptionStateMachine {
  private readonly supabase: SupabaseClient;
  private readonly maxRetryAttempts: number;
  private readonly retryIntervalDays: number;

  constructor(
    supabaseClient: SupabaseClient,
    options?: {
      maxRetryAttempts?: number;
      retryIntervalDays?: number;
    }
  ) {
    this.supabase = supabaseClient;
    this.maxRetryAttempts = options?.maxRetryAttempts ?? 3;
    this.retryIntervalDays = options?.retryIntervalDays ?? 3;
  }

  // ============================================
  // 狀態轉換核心方法
  // ============================================

  /**
   * 觸發狀態轉換
   */
  public async transition(
    subscriptionId: string,
    event: SubscriptionEvent,
    metadata?: Record<string, unknown>
  ): Promise<{
    success: boolean;
    fromState: SubscriptionState;
    toState: SubscriptionState;
    error?: string;
  }> {
    // 取得目前狀態
    const { data: subscription, error: fetchError } = await this.supabase
      .from('payment_subscriptions')
      .select('status, failed_attempts, completed_periods, total_periods')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !subscription) {
      return {
        success: false,
        fromState: SubscriptionState.PENDING,
        toState: SubscriptionState.PENDING,
        error: 'Subscription not found',
      };
    }

    const currentState = subscription.status as SubscriptionState;

    // 尋找有效的轉換
    const transition = STATE_TRANSITIONS.find(
      (t) => t.from === currentState && t.event === event
    );

    if (!transition) {
      return {
        success: false,
        fromState: currentState,
        toState: currentState,
        error: `Invalid transition: ${currentState} + ${event}`,
      };
    }

    // 執行狀態更新
    const updates = this.buildStateUpdates(
      transition.to,
      event,
      subscription,
      metadata
    );

    const { error: updateError } = await this.supabase
      .from('payment_subscriptions')
      .update(updates)
      .eq('id', subscriptionId);

    if (updateError) {
      return {
        success: false,
        fromState: currentState,
        toState: transition.to,
        error: updateError.message,
      };
    }

    // 記錄狀態變更日誌
    await this.logStateChange(subscriptionId, currentState, transition.to, event, metadata);

    return {
      success: true,
      fromState: currentState,
      toState: transition.to,
    };
  }

  /**
   * 建立狀態更新資料
   */
  private buildStateUpdates(
    newState: SubscriptionState,
    event: SubscriptionEvent,
    currentData: {
      failed_attempts: number;
      completed_periods: number;
      total_periods: number;
    },
    metadata?: Record<string, unknown>
  ): Record<string, unknown> {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      status: newState,
      updated_at: now,
    };

    switch (event) {
      case SubscriptionEvent.PAYMENT_SUCCESS:
      case SubscriptionEvent.RETRY_SUCCESS:
        updates.failed_attempts = 0;
        updates.completed_periods = currentData.completed_periods + 1;
        updates.last_auth_date = now;
        updates.last_auth_status = 'success';
        // 計算下次扣款日期
        if (metadata?.nextAuthDate) {
          updates.next_auth_date = metadata.nextAuthDate;
        }
        break;

      case SubscriptionEvent.PAYMENT_FAILED:
        updates.failed_attempts = currentData.failed_attempts + 1;
        updates.last_auth_status = 'failed';
        updates.last_failure_reason = metadata?.reason || 'Unknown';
        break;

      case SubscriptionEvent.USER_SUSPEND:
        updates.suspended_at = now;
        break;

      case SubscriptionEvent.USER_RESUME:
        updates.suspended_at = null;
        break;

      case SubscriptionEvent.USER_CANCEL:
      case SubscriptionEvent.OVERDUE_LIMIT:
        updates.cancelled_at = now;
        updates.cancellation_reason = metadata?.reason || event;
        break;

      case SubscriptionEvent.PERIODS_COMPLETED:
        updates.expired_at = now;
        break;

      case SubscriptionEvent.FIRST_AUTH_SUCCESS:
        updates.first_auth_at = now;
        updates.period_no = metadata?.periodNo;
        updates.period_token = metadata?.periodToken;
        break;
    }

    return updates;
  }

  /**
   * 記錄狀態變更日誌
   */
  private async logStateChange(
    subscriptionId: string,
    fromState: SubscriptionState,
    toState: SubscriptionState,
    event: SubscriptionEvent,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.supabase.from('payment_subscription_state_logs').insert({
      subscription_id: subscriptionId,
      from_state: fromState,
      to_state: toState,
      event,
      metadata,
      created_at: new Date().toISOString(),
    });
  }

  // ============================================
  // 業務邏輯方法
  // ============================================

  /**
   * 處理扣款結果
   */
  public async handlePaymentResult(
    subscriptionId: string,
    success: boolean,
    metadata?: {
      periodTimes?: number;
      authCode?: string;
      nextAuthDate?: string;
      reason?: string;
    }
  ): Promise<boolean> {
    // 取得訂閱資料
    const { data: subscription } = await this.supabase
      .from('payment_subscriptions')
      .select('status, completed_periods, total_periods, failed_attempts')
      .eq('id', subscriptionId)
      .single();

    if (!subscription) {
      return false;
    }

    if (success) {
      // 檢查是否為最後一期
      const newCompletedPeriods = subscription.completed_periods + 1;
      if (newCompletedPeriods >= subscription.total_periods) {
        await this.transition(subscriptionId, SubscriptionEvent.PERIODS_COMPLETED, metadata);
      } else {
        // 判斷是正常扣款還是重試成功
        const event = subscription.status === SubscriptionState.PAST_DUE
          ? SubscriptionEvent.RETRY_SUCCESS
          : SubscriptionEvent.PAYMENT_SUCCESS;
        await this.transition(subscriptionId, event, metadata);
      }
    } else {
      // 扣款失敗
      const newFailedAttempts = subscription.failed_attempts + 1;

      if (newFailedAttempts >= this.maxRetryAttempts) {
        // 超過重試限制，取消訂閱
        await this.transition(
          subscriptionId,
          SubscriptionEvent.OVERDUE_LIMIT,
          { reason: `Exceeded ${this.maxRetryAttempts} retry attempts` }
        );
      } else {
        await this.transition(subscriptionId, SubscriptionEvent.PAYMENT_FAILED, metadata);
      }
    }

    return true;
  }

  /**
   * 用戶暫停訂閱
   */
  public async suspendByUser(
    subscriptionId: string,
    userId: string
  ): Promise<boolean> {
    // 驗證擁有權
    const { data } = await this.supabase
      .from('payment_subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single();

    if (!data || data.user_id !== userId) {
      return false;
    }

    const result = await this.transition(
      subscriptionId,
      SubscriptionEvent.USER_SUSPEND
    );

    return result.success;
  }

  /**
   * 用戶恢復訂閱
   */
  public async resumeByUser(
    subscriptionId: string,
    userId: string
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('payment_subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single();

    if (!data || data.user_id !== userId) {
      return false;
    }

    const result = await this.transition(
      subscriptionId,
      SubscriptionEvent.USER_RESUME
    );

    return result.success;
  }

  /**
   * 用戶取消訂閱
   */
  public async cancelByUser(
    subscriptionId: string,
    userId: string,
    reason?: string
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('payment_subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single();

    if (!data || data.user_id !== userId) {
      return false;
    }

    const result = await this.transition(
      subscriptionId,
      SubscriptionEvent.USER_CANCEL,
      { reason }
    );

    return result.success;
  }

  // ============================================
  // 查詢方法
  // ============================================

  /**
   * 檢查是否可以轉換到指定狀態
   */
  public canTransition(
    currentState: SubscriptionState,
    event: SubscriptionEvent
  ): boolean {
    return STATE_TRANSITIONS.some(
      (t) => t.from === currentState && t.event === event
    );
  }

  /**
   * 取得可用的轉換事件
   */
  public getAvailableEvents(currentState: SubscriptionState): SubscriptionEvent[] {
    return STATE_TRANSITIONS
      .filter((t) => t.from === currentState)
      .map((t) => t.event);
  }

  /**
   * 查詢需要重試扣款的訂閱
   */
  public async getPastDueSubscriptions(): Promise<string[]> {
    const { data } = await this.supabase
      .from('payment_subscriptions')
      .select('id')
      .eq('status', SubscriptionState.PAST_DUE)
      .lt('failed_attempts', this.maxRetryAttempts);

    return data?.map((s) => s.id) || [];
  }
}

export default SubscriptionStateMachine;
