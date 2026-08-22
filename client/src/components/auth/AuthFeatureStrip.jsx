import { ArrowDownUp, LayoutGrid, PiggyBank, Wallet } from 'lucide-react';

const FEATURES = [
  { icon: ArrowDownUp, title: 'Track income & expenses', text: 'Log earnings and spending as they happen.' },
  { icon: Wallet, title: 'Manage every account', text: 'Checking, savings and wallets in one dashboard.' },
  { icon: LayoutGrid, title: 'Understand your cash flow', text: 'Clear categories show where your money goes each month.' },
  { icon: PiggyBank, title: 'Build saving habits', text: 'Budgets and goals designed to fit student life.' },
];

export default function AuthFeatureStrip() {
  return (
    <section className="panel p-6 mt-4" aria-label="What CAMPORA offers">
      <h2 className="label-xs">Built for student money</h2>
      <p className="mt-2 text-xs leading-relaxed text-txt-secondary">
        CAMPORA helps students track income and expenses, manage accounts and
        categories, monitor monthly spending, understand cash flow and build
        better saving habits — all in one personal finance dashboard.
      </p>
      <ul className="mt-5 space-y-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-md bg-brand/10 flex items-center justify-center shrink-0">
              <Icon size={14} className="text-brand" />
            </span>
            <span>
              <span className="block text-xs font-medium text-txt-primary">{title}</span>
              <span className="block text-2xs text-txt-secondary mt-0.5">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
