import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

let seedState = 42;
const rand = () => {
  seedState = (seedState * 1103515245 + 12345) % 2147483648;
  return seedState / 2147483648;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => Math.round((min + rand() * (max - min)) * 100) / 100;

const INCOME_CATEGORIES = [
  ['Parents / Allowance', '#00d492', 'Users'],
  ['Scholarship', '#22d3ee', 'GraduationCap'],
  ['Internship', '#4d8dff', 'Briefcase'],
  ['Part-Time Job', '#5eead4', 'Clock'],
  ['Freelancing', '#a06bfa', 'Laptop'],
  ['Investments', '#c084fc', 'TrendingUp'],
  ['Refund', '#38bdf8', 'Undo2'],
  ['Gift', '#f5a623', 'Gift'],
  ['Other Income', '#8b95a5', 'CircleDollarSign'],
];

const EXPENSE_CATEGORIES = [
  ['Food', '#ff8a4c', 'Utensils'],
  ['College Fees', '#4d8dff', 'School'],
  ['Books', '#5eead4', 'BookOpen'],
  ['Courses', '#22d3ee', 'Library'],
  ['Hostel', '#a06bfa', 'BedDouble'],
  ['Rent', '#c084fc', 'Home'],
  ['Transport', '#38bdf8', 'Bus'],
  ['Fuel', '#f97316', 'Fuel'],
  ['Shopping', '#f65e7a', 'ShoppingBag'],
  ['Entertainment', '#e879f9', 'Clapperboard'],
  ['Gaming', '#818cf8', 'Gamepad2'],
  ['Subscriptions', '#f5a623', 'Repeat'],
  ['Mobile Recharge', '#fb7185', 'Smartphone'],
  ['Internet', '#60a5fa', 'Wifi'],
  ['Healthcare', '#ff5b66', 'HeartPulse'],
  ['Travel', '#2dd4bf', 'Plane'],
  ['Other Expense', '#8b95a5', 'Receipt'],
];

const MERCHANTS = {
  Food: ['Swiggy', 'Zomato', 'Mess Canteen', "Domino's", 'Campus Cafe', 'Blinkit', 'Chai Point'],
  Transport: ['Uber', 'Ola Cabs', 'Rapido', 'Metro Card', 'RedBus'],
  Shopping: ['Amazon', 'Flipkart', 'Myntra', 'Decathlon', 'Local Market'],
  Entertainment: ['BookMyShow', 'Steam', 'PVR Cinemas', 'Zomato District'],
  Gaming: ['Steam', 'Epic Games', 'PlayStation Store', 'Free Fire'],
  Subscriptions: ['Netflix', 'Spotify', 'YouTube Premium', 'iCloud', 'Canva Pro'],
  'Mobile Recharge': ['Jio Recharge', 'Airtel Prepaid', 'Vi Recharge'],
  Internet: ['ACT Fibernet', 'JioFiber', 'Hostel Wi-Fi'],
  Hostel: ['Hostel Fee Desk', 'PG Owner', 'Laundry Service'],
  Rent: ['PG Owner Transfer'],
  Healthcare: ['Apollo Pharmacy', 'Campus Clinic', 'Practo'],
  Travel: ['IRCTC', 'MakeMyTrip', 'IndiGo', 'OYO Rooms', 'Vistara'],
  Books: ['Amazon Books', 'Kindle', 'Crossword', 'Second-hand Bookstore'],
  Courses: ['Coursera', 'Udemy', 'Unacademy', 'LeetCode Premium'],
  Fuel: ['Indian Oil', 'HP Petrol Pump', 'Bharat Petroleum'],
  'College Fees': ['University Portal', 'Exam Cell', 'Lab Fee Counter'],
  'Other Expense': ['Stationery Mart', 'Gift Shop', 'Xerox Shop'],
};

async function main() {
  console.log('Seeding Campora student demo data...');

  const email = 'demo@campora.app';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
    console.log('Removed previous demo user.');
  }

  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      email,
      passwordHash,
      currency: 'INR',
      emailVerified: true,
      studentType: 'COLLEGE',
      monthlyMoney: 18000,
      mainGoal: 'SAVE_MONEY',
      monthlyBudget: 15000,
      onboarded: true,
    },
  });

  const categoryMap = new Map();
  for (const [name, color, icon] of INCOME_CATEGORIES) {
    const c = await prisma.category.create({
      data: { userId: user.id, name, type: 'INCOME', color, icon, isDefault: true },
    });
    categoryMap.set(`INCOME:${name}`, c.id);
  }
  for (const [name, color, icon] of EXPENSE_CATEGORIES) {
    const c = await prisma.category.create({
      data: { userId: user.id, name, type: 'EXPENSE', color, icon, isDefault: true },
    });
    categoryMap.set(`EXPENSE:${name}`, c.id);
  }

  const accountsData = [
    { name: 'HDFC Student Account', type: 'CHECKING', institution: 'HDFC Bank', balance: 24650.75, color: '#00d492' },
    { name: 'Emergency Fund', type: 'SAVINGS', institution: 'ICICI Bank', balance: 32000.0, color: '#4d8dff' },
    { name: 'Cash Wallet', type: 'CASH', institution: null, balance: 2250.5, color: '#f5a623' },
    { name: 'Paytm Wallet', type: 'DIGITAL_WALLET', institution: 'Paytm', balance: 1140.25, color: '#22d3ee' },
    { name: 'SBI SimplyCLICK Card', type: 'CREDIT_CARD', institution: 'SBI Card', balance: 4300.0, color: '#ff5b66' },
  ];

  const accounts = {};
  for (const data of accountsData) {
    accounts[data.name] = await prisma.account.create({ data: { ...data, userId: user.id, currency: 'INR' } });
  }

  const now = new Date();
  const rows = [];

  for (let monthOffset = 5; monthOffset >= 0; monthOffset -= 1) {
    const addTxn = (t) => {
      const date = new Date(now.getFullYear(), now.getMonth() - t.monthOffset, t.day, t.hour, Math.floor(rand() * 60));
      if (date > now) return;
      rows.push({ ...t, date });
    };

    addTxn({
      monthOffset,
      day: 1,
      hour: 9,
      type: 'INCOME',
      amount: 12000,
      accountName: 'HDFC Student Account',
      categoryName: 'Parents / Allowance',
      merchant: 'Dad',
      description: 'Monthly allowance',
    });

    if (monthOffset % 2 === 0) {
      addTxn({
        monthOffset,
        day: 15,
        hour: 16,
        type: 'INCOME',
        amount: between(6000, 9000),
        accountName: 'HDFC Student Account',
        categoryName: 'Internship',
        merchant: pick(['Turing Labs', 'BrightPath Media']),
        description: 'Internship stipend',
      });
    }
    if (monthOffset === 4) {
      addTxn({
        monthOffset,
        day: 10,
        hour: 11,
        type: 'INCOME',
        amount: 25000,
        accountName: 'HDFC Student Account',
        categoryName: 'Scholarship',
        merchant: 'State Scholarship Board',
        description: 'Merit scholarship disbursement',
      });
    }
    if (rand() < 0.5) {
      addTxn({
        monthOffset,
        day: 20,
        hour: 13,
        type: 'INCOME',
        amount: between(1500, 4500),
        accountName: 'Paytm Wallet',
        categoryName: 'Freelancing',
        merchant: pick(['Poster Design Client', 'Logo Commission']),
        description: 'Freelance gig payment',
      });
    }

    if (monthOffset === 0 || monthOffset === 3) {
      addTxn({
        monthOffset,
        day: 5,
        hour: 10,
        type: 'EXPENSE',
        amount: monthOffset === 0 ? 18000 : 17500,
        accountName: 'HDFC Student Account',
        categoryName: 'College Fees',
        merchant: 'University Portal',
        description: 'Semester fee payment',
      });
    }

    const expenseCount = 18 + Math.floor(rand() * 8);
    for (let i = 0; i < expenseCount; i += 1) {
      const [categoryName] = pick(
        EXPENSE_CATEGORIES.filter(([n]) => n !== 'College Fees')
      );
      const useCard = rand() < 0.25;
      const amounts = {
        Food: [80, 650],
        Transport: [30, 350],
        Shopping: [300, 2500],
        Entertainment: [150, 900],
        Gaming: [199, 1200],
        Subscriptions: [119, 499],
        'Mobile Recharge': [199, 349],
        Internet: [299, 699],
        Hostel: [500, 3000],
        Rent: [4000, 6000],
        Healthcare: [100, 800],
        Travel: [500, 3500],
        Books: [200, 1200],
        Courses: [449, 2500],
        Fuel: [100, 500],
        'Other Expense': [50, 700],
      };
      const [min, max] = amounts[categoryName] || [80, 800];
      addTxn({
        monthOffset,
        day: 1 + Math.floor(rand() * 27),
        hour: 8 + Math.floor(rand() * 13),
        type: 'EXPENSE',
        amount: between(min, max),
        accountName: useCard ? 'SBI SimplyCLICK Card' : pick(['HDFC Student Account', 'Cash Wallet', 'Paytm Wallet']),
        categoryName,
        merchant: pick(MERCHANTS[categoryName] || ['Unknown Merchant']),
        description: null,
      });
    }

    addTxn({
      monthOffset,
      day: 4,
      hour: 9,
      type: 'TRANSFER',
      amount: between(1500, 4000),
      accountName: 'HDFC Student Account',
      transferTo: 'Emergency Fund',
      description: 'Monthly savings transfer',
    });
  }

  rows.sort((a, b) => a.date - b.date);

  let count = 0;
  for (const row of rows) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: accounts[row.accountName].id,
        transferAccountId: row.transferTo ? accounts[row.transferTo].id : null,
        categoryId: row.categoryName ? categoryMap.get(`${row.type}:${row.categoryName}`) : null,
        type: row.type,
        amount: row.amount,
        currency: 'INR',
        merchant: row.merchant || null,
        description: row.description || null,
        reference: `TXN${String(100000 + count)}`,
        status: 'COMPLETED',
        transactionDate: row.date,
      },
    });
    count += 1;
  }

  const budgets = [
    ['Food', 3000],
    ['Transport', 1500],
    ['Entertainment', 1000],
    ['Shopping', 2000],
  ];
  for (const [name, amount] of budgets) {
    await prisma.budget.create({
      data: { userId: user.id, categoryId: categoryMap.get(`EXPENSE:${name}`), amount },
    });
  }

  const nextMonthDate = (day) => {
    const d = new Date(now.getFullYear(), now.getMonth() + 1, day, 10, 0);
    return d;
  };
  const recurringRules = [
    {
      type: 'EXPENSE',
      amount: 119,
      accountId: accounts['HDFC Student Account'].id,
      categoryId: categoryMap.get('EXPENSE:Subscriptions'),
      merchant: 'Spotify',
      description: 'Spotify Premium student plan',
      frequency: 'MONTHLY',
      nextDate: nextMonthDate(12),
    },
    {
      type: 'EXPENSE',
      amount: 199,
      accountId: accounts['HDFC Student Account'].id,
      categoryId: categoryMap.get('EXPENSE:Subscriptions'),
      merchant: 'Netflix Mobile',
      description: 'Netflix mobile plan',
      frequency: 'MONTHLY',
      nextDate: nextMonthDate(18),
    },
    {
      type: 'EXPENSE',
      amount: 699,
      accountId: accounts['HDFC Student Account'].id,
      categoryId: categoryMap.get('EXPENSE:Internet'),
      merchant: 'ACT Fibernet',
      description: 'Room internet bill',
      frequency: 'MONTHLY',
      nextDate: nextMonthDate(8),
    },
    {
      type: 'EXPENSE',
      amount: 239,
      accountId: accounts['HDFC Student Account'].id,
      categoryId: categoryMap.get('EXPENSE:Mobile Recharge'),
      merchant: 'Jio Recharge',
      description: 'Prepaid recharge',
      frequency: 'CUSTOM',
      customDays: 28,
      nextDate: nextMonthDate(25),
    },
    {
      type: 'INCOME',
      amount: 12000,
      accountId: accounts['HDFC Student Account'].id,
      categoryId: categoryMap.get('INCOME:Parents / Allowance'),
      merchant: 'Dad',
      description: 'Monthly allowance',
      frequency: 'MONTHLY',
      nextDate: nextMonthDate(1),
    },
  ];
  for (const rule of recurringRules) {
    await prisma.recurringTransaction.create({ data: { ...rule, userId: user.id, currency: 'INR' } });
  }

  const goalTargetDate = new Date(now.getFullYear() + 1, 11, 31);
  await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: 'New Laptop Fund',
      targetAmount: 60000,
      savedAmount: 18500,
      targetDate: goalTargetDate,
      color: '#00d492',
    },
  });
  await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: 'Goa Trip with Friends',
      targetAmount: 12000,
      savedAmount: 4200,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 8, 15),
      color: '#4d8dff',
    },
  });

  console.log(`Created demo user ${email} with ${count} transactions, ${budgets.length} budgets, ${recurringRules.length} recurring rules and 2 goals.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
