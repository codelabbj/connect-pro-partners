// Auto Recharge Types

export interface Network {
  uid: string;
  nom: string;
  code: string;
  image: string | null;
  country: string;
  country_name: string;
  is_active: boolean;
  ussd_base_code: string;
  created_at: string;
  updated_at: string;
  sent_deposit_to_module: boolean;
  sent_withdrawal_to_module: boolean;
}

export interface Aggregator {
  uid: string;
  name: string;
  code: string;
  description: string;
}

export interface AvailableNetwork {
  network: Network;
  aggregator: Aggregator;
  min_amount: string;
  max_amount: string;
  fixed_fee: string;
  percentage_fee: string;
  aggregator_network_code: string;
  aggregator_country_code: string;
}

export interface AvailableNetworksResponse {
  count: number;
  networks: AvailableNetwork[];
}

export interface AutoRechargeTransaction {
  uid: string;
  reference: string;
  network: string;
  network_name?: string;
  network_code?: string;
  amount: string;
  phone_number: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  failed_reason?: string | null;
  external_transaction_id?: string | null;
  aggregator?: string;
  aggregator_name?: string;
  fees?: string;
  total_amount?: string;
}

export interface AutoRechargeTransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AutoRechargeTransaction[];
}

export interface InitiateAutoRechargeRequest {
  network: string;
  amount: number;
  phone_number: string;
}

export interface InitiateAutoRechargeResponse {
  success: boolean;
  message: string;
  transaction: AutoRechargeTransaction;
}

export interface TransactionStatusResponse {
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  message?: string;
  updated_at?: string;
}

