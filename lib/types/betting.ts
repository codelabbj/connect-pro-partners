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
  status: 'success' | 'pending' | 'failed' | 'cancelled' | 'processing';
  betting_user_id: string;
  withdrawal_code: string | null;
  external_transaction_id: string | null;
  commission_rate: string;
  commission_paid_at: string | null;
  commission_amount: string;
  commission_paid: boolean;
  created_at: string;
  external_response: any;
  cancellation_requested_at: string | null;
  cancelled_at: string | null;
  partner_refunded: boolean;
  partner_balance_before: string;
  partner_balance_after: string;
  notes?: string;
  is_cancellable?: boolean;
  can_request_cancellation?: boolean;
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
  payable_commission: string;
  payable_transaction_count: number;
  current_month_commission: string;
  current_month_transaction_count: number;
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
  betting_user_id: string;
  withdrawal_code: string | null;
  external_transaction_id: string;
  commission_rate: string;
  commission_paid_at: string | null;
  commission_amount: string;
  commission_paid: boolean;
  created_at: string;
  external_response: any;
  cancellation_requested_at: string | null;
  cancelled_at: string | null;
  partner_refunded: boolean;
  partner_balance_before: string;
  partner_balance_after: string;
}

export interface UnpaidCommissionsResponse {
  total_unpaid_amount: number;
  transaction_count: number;
  payable_amount: number;
  payable_transaction_count: number;
  payable_transactions: UnpaidCommission[];
  current_month_amount: number;
  current_month_transaction_count: number;
  current_month_transactions: UnpaidCommission[];
  note: string;
  current_month_start: string;
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
  start_date?: string;
  end_date?: string;
}

export interface CommissionFilters {
  date_from?: string;
  date_to?: string;
}

export interface PaymentHistoryFilters {
  limit?: number;
}

// Transfer UV Types

export interface Transfer {
  uid: string;
  reference: string;
  sender: number;
  sender_name: string;
  sender_email: string;
  receiver: number;
  receiver_name: string;
  receiver_email: string;
  amount: string;
  fees: string;
  status: string; // pending, processing, completed, success, failed, cancelled
  description: string;
  sender_balance_before: string;
  sender_balance_after: string;
  receiver_balance_before: string;
  receiver_balance_after: string;
  completed_at: string | null;
  failed_reason: string;
  created_at: string;
  updated_at: string;
}

export interface TransferRequest {
  receiver_uid: string;
  amount: string;
  description?: string;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  transfer: Transfer;
}

export interface TransferHistoryResponse {
  summary: {
    total_sent: number;
    total_received: number;
    amount_sent: number;
    amount_received: number;
  };
  sent_transfers: Transfer[];
  received_transfers: Transfer[];
}

// User Search Types

export interface User {
  uid: string;
  display_name: string;
}

export interface UserSearchResponse {
  results: User[];
}

// External Platform Types

export interface ExternalPlatformData {
  id: string;
  name: string;
  image: string;
  is_active: boolean;
  order: number | null;
  city: string;
  street: string;
  deposit_tuto_content: string;
  deposit_link: string | null;
  withdrawal_tuto_content: string;
  withdrawal_link: string;
  public_name: string;
  minimun_deposit: number;
  max_deposit: number;
  minimun_with: number;
  max_win: number;
  active_for_deposit: boolean;
  active_for_with: boolean;
  why_withdrawal_fail?: string | null;
  enable?: boolean;
}

// Transaction Cancellation Types

export interface RequestCancellationRequest {
  reason: string;
}

export interface RequestCancellationResponse {
  success: boolean;
  message: string;
  transaction: BettingTransaction;
}

// USSD Transaction Types

export interface Network {
  uid: string;
  nom: string;
  country_name: string;
  is_active: boolean;
}

export interface NetworksResponse {
  results: Network[];
}

export interface USSDTransaction {
  uid: string;
  reference: string;
  type: 'deposit' | 'withdrawal';
  amount: string;
  recipient_phone: string;
  network: string;
  network_name?: string;
  objet?: string;
  status: 'pending' | 'sent_to_user' | 'processing' | 'completed' | 'success' | 'failed' | 'cancelled' | 'timeout';
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  failed_reason?: string | null;
}

export interface CreateUSSDTransactionRequest {
  type: 'deposit' | 'withdrawal';
  amount: number;
  recipient_phone: string;
  network: string;
  objet?: string;
}

export interface CreateUSSDTransactionResponse {
  success: boolean;
  message: string;
  transaction: USSDTransaction;
}

export interface USSDTransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: USSDTransaction[];
}

export interface UserAccount {
  balance: string;
  is_active: boolean;
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
}
