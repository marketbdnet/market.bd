export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket';

export type PaymentStatus = 'pending_verification' | 'paid' | 'rejected';

export interface PaymentRecord {
  paymentId: string;
  orderId: string;
  userId: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;

  // Payment Method & Account
  paymentMethod: PaymentMethod;
  marketbdAccountNumber: string; // The configured MarketBD recipient account number

  // Customer Transaction Details
  senderMobileNumber: string;    // Customer's mobile banking account number
  transactionId: string;         // Normalized (Trimmed & Uppercase)
  expectedAmount: number;        // Server-side authoritative order amount
  submittedAmount: number;       // Amount submitted by customer
  amountMatched: boolean;        // expectedAmount === submittedAmount

  // Verification Proof & Customer Notes
  proofImageUrl?: string;        // Optional screenshot/proof URL or reference
  customerNote?: string;
  paymentDate: string;

  // Status & Audit Trail
  status: PaymentStatus;         // Default: 'pending_verification'
  rejectionReason?: string;      // Recorded if rejected by admin
  verifiedBy?: string;           // Admin email (e.g. official.marketbd@gmail.com)
  verifiedAt?: string;           // ISO date string when verified

  createdAt: string;
  updatedAt: string;
}

export interface PaymentSubmissionInput {
  orderId: string;
  userId: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  paymentMethod: PaymentMethod;
  senderMobileNumber: string;
  transactionId: string;
  submittedAmount: number;
  expectedAmount: number;
  proofImageUrl?: string;
  customerNote?: string;
}
