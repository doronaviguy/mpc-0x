export interface Chain {
  id: number;
  name: string;
  rpcUrl: string;
  scanApiUrl: string;
  scanApiKey: string;
  priority: number;
}

export interface TokenBalance {
  token: string;
  symbol: string;
  decimals: number;
  balance: string;
}

export interface AddressData {
  chain: Chain;
  nativeBalance: string;
  tokens: TokenBalance[];
  isContract: boolean;
  contractAbi?: string;
  contractName?: string;
  transactions?: Transaction[];
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  method?: string;
}

export interface AddressResponse {
  address: string;
  data: AddressData[];
}