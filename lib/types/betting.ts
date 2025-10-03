// Betting Platform Types

export interface BettingPlatform {
  uid: string;
  name: string;
  logo: string | null;
  is_active: boolean;
  external_id: string;
  min_deposit_amount: string;
  max_deposit_amount: string;
  min_withdrawal_amount: string;
  max_withdrawal_amount: string;
  description?: string;
  can_deposit?: boolean;
  can_withdraw?: boolean;
  permission_is_active?: boolean;
  granted_by_name?: string;
  permission_granted_at?: string;
}

export interface PlatformWithStats extends BettingPlatform {
  my_stats: {
    total_transactions: number;
    successful_transactions: number;
    total_amount: number;
    total_commission: number;
    unpaid_commission: number;
  };
}

export interface PlatformPermissionsResponse {
  total_platforms: number;
  authorized_count: number;
  unauthorized_count: number;
  authorized_platforms: BettingPlatform[];
  unauthorized_platforms: BettingPlatform[];
  all_platforms: BettingPlatform[];
}

export interface PlatformStatsResponse {
  summary: {
    total_platforms: number;
    authorized_count: number;
    unauthorized_count: number;
    platforms_with_transactions: number;
  };
  authorized_platforms: PlatformWithStats[];
  unauthorized_platforms: PlatformWithStats[];
}

export interface PlatformsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BettingPlatform[];
}

// Betting Transaction Types

export interface BettingTransaction {
  uid: string;
  reference: string;
  partner_name: string;
  platform_name: string;
  transaction_type: 'deposit' | 'withdrawal';
  amount: string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  betting_user_id: string;
  withdrawal_code: string | null;
  external_transaction_id: string | null;
  commission_rate: string;
  commission_paid_at: string | null;
  commission_amount: string;
  commission_paid: boolean;
  created_at: string;
  external_response: {
    data?: {
      id: number;
      amount: string;
      betapp: string;
      status: string;
      partner: string;
      user_id: string;
      reference: string | null;
      created_at: string;
      type_trans: string;
      bet_response: string | null;
      last_xbet_trans: string;
      withdriwal_code: string | null;
    };
    amount?: string;
    success?: boolean;
    reference?: string | null;
    transaction_id?: number;
    error?: string;
    status?: string;
    error_type?: string;
    bet_response?: string;
  };
  cancellation_requested_at: string | null;
  cancelled_at: string | null;
  partner_refunded: boolean;
  partner_balance_before: string;
  partner_balance_after: string;
  cancelled_by_uid?: string;
}

export interface BettingTransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BettingTransaction[];
}

export interface CreateDepositRequest {
  platform_uid: string;
  betting_user_id: string;
  amount: string;
}

export interface CreateWithdrawalRequest {
  platform_uid: string;
  betting_user_id: string;
  withdrawal_code: string;
}

export interface CreateTransactionResponse {
  success: boolean;
  message: string;
  transaction: BettingTransaction & {
    partner: number;
    platform: string;
    is_cancellable?: boolean;
    can_request_cancellation?: boolean;
    processed_by?: string | null;
    notes?: string;
    updated_at?: string;
  };
}

export interface VerifyUserIdRequest {
  platform_uid: string;
  betting_user_id: number;
}

export interface VerifyUserIdResponse {
  UserId: number;
  Name: string;
  CurrencyId: number;
}

// Commission Types

export interface CommissionStats {
  total_transactions: number;
  total_commission: string;
  paid_commission: string;
  unpaid_commission: string;
  by_platform: {
    platform__name: string;
    count: number;
    total_commission: number;
    unpaid_commission: number;
  }[];
}

export interface UnpaidCommission {
  uid: string;
  reference: string;
  partner_name: string;
  platform_name: string;
  transaction_type: string;
  amount: string;
  status: string;
  commission_amount: string;
  commission_paid: boolean;
  created_at: string;
}

export interface UnpaidCommissionsResponse {
  total_unpaid_amount: number;
  transaction_count: number;
  transactions: UnpaidCommission[];
}

export interface CommissionRates {
  deposit_rate: number;
  withdrawal_rate: number;
  last_updated: string | null;
  updated_by: string | null;
  message: string;
}

export interface PaymentHistoryItem {
  uid: string;
  partner: number;
  partner_name: string;
  total_amount: string;
  transaction_count: number;
  paid_by: number;
  paid_by_name: string;
  period_start: string;
  period_end: string;
  notes: string;
  created_at: string;
}

export interface PaymentHistoryResponse {
  payment_count: number;
  total_paid_amount: number;
  payments: PaymentHistoryItem[];
}

// Filter Types

export interface TransactionFilters {
  status?: string;
  transaction_type?: string;
  platform?: string;
  ordering?: string;
  page?: number;
}

export interface CommissionFilters {
  date_from?: string;
  date_to?: string;
}

export interface PaymentHistoryFilters {
  limit?: number;
}
