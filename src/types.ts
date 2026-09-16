export type NavigationPath =
  | 'dashboard'
  | 'markets'
  | 'users'
  | 'bids'
  | 'deposits'
  | 'withdrawals'
  | 'notices'
  | 'support'
  | 'broadcast'
  | 'game-rates'
  | 'charts-history'
  | 'admin-management';

export interface Market {
  id: string;
  name: string;
  code: string;
  shortCode: string;
  sessionType: string;
  openTime: string;
  closeTime: string;
  cutoffTime?: string;
  status: 'LIVE' | 'CLOSED' | 'INTERMISSION';
  resultMatrix: string;
  active: boolean;
  activeDays?: string[];
  maxExposure?: string;
}

export interface BidRecord {
  id: string;
  bidId: string;
  playerName: string;
  playerPhone: string;
  market: string;
  gameType: 'JODI' | 'ANK' | 'SINGLE PATTI' | 'DOUBLE PATTI' | 'TRIPLE PATTI' | 'HALF SANGAM' | 'FULL SANGAM' | 'MOTOR';
  pickedNumber: string;
  amount: number;
  potentialPayout: number | null;
  status: 'WON' | 'PENDING' | 'LOST';
  timestamp: string;
}

export interface WithdrawalRequest {
  id: string;
  refId: string;
  playerName: string;
  playerPhone: string;
  amount: number;
  method: 'UPI' | 'BANK';
  accountDetails: string;
  bankCode?: string;
  requestTime: string;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  rejectionReason?: string;
  isVip?: boolean;
}

export interface UserRecord {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatar: string;
  walletBalance: number;
  totalWinnings: number;
  role: 'VIP' | 'USER';
  status: 'ACTIVE' | 'BANNED';
  kycStatus: 'VERIFIED' | 'PENDING';
  registrationDate: string;
}

export interface NoticeItem {
  id: string;
  noticeId: string;
  title: string;
  body: string;
  status: 'published' | 'draft' | 'scheduled';
  isPinned?: boolean;
  isCritical?: boolean;
  marketTag?: string;
  channelTag?: string;
  viewsCount?: number;
  devicesCount?: number;
  timestamp: string;
  ctr?: string;
  popupActive?: boolean;
  pushSent?: boolean;
  expiresIn?: string;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  playerName: string;
  playerPhone: string;
  playerAvatar: string;
  vipLevel: string;
  walletBalance: number;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  timeAgo: string;
  disputedAmount?: number;
  disputedUtr?: string;
  gateway?: string;
  disputedStatus?: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: 'player' | 'agent';
  senderName: string;
  time: string;
  text: string;
  attachmentImg?: string;
  isVerifiedTag?: boolean;
}

export interface DepositRecord {
  id: string;
  uuid: string;
  depositId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAvatar?: string;
  isVip?: boolean;
  amount: number;
  bonusAmount?: number;
  method: 'UPI' | 'QR_CODE' | 'IMPS' | 'NET_BANKING' | 'USDT';
  utrNumber: string;
  gatewayRef?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  timestamp: string;
  rejectionReason?: string;
  screenshotProof?: string;
  creditedBy?: string;
}

