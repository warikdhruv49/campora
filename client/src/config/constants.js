export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
];

export const ACCOUNT_TYPE_LABELS = {
  CHECKING: 'Checking',
  SAVINGS: 'Savings',
  CASH: 'Cash',
  CREDIT_CARD: 'Credit Card',
  INVESTMENT: 'Investment',
  DIGITAL_WALLET: 'Digital Wallet',
  OTHER: 'Other',
};

export const TRANSACTION_TYPE_LABELS = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  TRANSFER: 'Transfer',
};

export const STATUS_LABELS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const CATEGORY_COLORS = [
  '#00d492', '#4d8dff', '#22d3ee', '#a06bfa', '#f5a623', '#ff8a4c',
  '#f65e7a', '#ff5b66', '#5eead4', '#38bdf8', '#c084fc', '#94a0b0',
];

export const CHART_RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

export const REFRESH_EVENT = 'campora:refresh';

export const STUDENT_TYPE_LABELS = {
  SCHOOL: 'School Student',
  COLLEGE: 'College Student',
  UNIVERSITY: 'University Student',
  WORKING_STUDENT: 'Working Student',
  OTHER: 'Other',
};

export const MAIN_GOAL_LABELS = {
  SAVE_MONEY: 'Save more money',
  CONTROL_SPENDING: 'Control my spending',
  TRACK_EXPENSES: 'Track where money goes',
  EMERGENCY_FUND: 'Build an emergency fund',
  SAVE_FOR_SOMETHING: 'Save for something specific',
};

export const FREQUENCY_LABELS = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  CUSTOM: 'Custom',
};
