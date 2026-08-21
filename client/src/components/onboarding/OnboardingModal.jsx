import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { authService } from '../../services/auth.service.js';
import { apiError } from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { STUDENT_TYPE_LABELS, MAIN_GOAL_LABELS } from '../../config/constants.js';
import { cn } from '../../utils/cn.js';

const STEPS = ['About you', 'Monthly money', 'Your goal'];

export default function OnboardingModal() {
  const { user, updateUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const open = !user?.onboarded && !dismissed;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    studentType: user?.studentType || 'COLLEGE',
    monthlyMoney: user?.monthlyMoney ?? '',
    mainGoal: user?.mainGoal || 'SAVE_MONEY',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finish = async () => {
    setLoading(true);
    setError('');
    try {
      const updated = await authService.updateProfile({
        studentType: form.studentType,
        monthlyMoney: form.monthlyMoney === '' ? null : Number(form.monthlyMoney),
        mainGoal: form.mainGoal,
        onboarded: true,
      });
      updateUser(updated);
      setDismissed(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const skip = () => {
    authService.updateProfile({ onboarded: true }).then(updateUser).catch(() => {});
    setDismissed(true);
  };

  return (
    <Modal
      open={open}
      onClose={skip}
      title="Welcome to Campora"
      subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
      size="md"
    >
      <div className="flex gap-1.5 mb-5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-gain' : 'bg-stroke-strong')}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-loss/40 bg-loss-dim px-3.5 py-2.5 text-xs text-loss" role="alert">
          {error}
        </div>
      )}

      {step === 0 && (
        <div className="space-y-2">
          <p className="label-xs mb-2">What describes you best?</p>
          {Object.entries(STUDENT_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, studentType: value }))}
              className={cn(
                'w-full text-left rounded-lg border px-4 py-3 text-sm transition-all',
                form.studentType === value
                  ? 'border-gain/60 bg-gain-dim text-gain'
                  : 'border-stroke text-txt-secondary hover:border-stroke-strong hover:text-txt-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-txt-secondary">
            Roughly how much money do you get each month? Allowance, stipend, part-time — everything counts.
          </p>
          <Input
            label="Monthly money (₹)"
            type="number"
            min="0"
            placeholder="e.g. 15000"
            value={form.monthlyMoney}
            onChange={(e) => setForm((f) => ({ ...f, monthlyMoney: e.target.value }))}
          />
          <p className="text-2xs text-txt-muted">You can change this anytime in Settings.</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <p className="label-xs mb-2">What do you want from Campora?</p>
          {Object.entries(MAIN_GOAL_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, mainGoal: value }))}
              className={cn(
                'w-full text-left rounded-lg border px-4 py-3 text-sm transition-all',
                form.mainGoal === value
                  ? 'border-gain/60 bg-gain-dim text-gain'
                  : 'border-stroke text-txt-secondary hover:border-stroke-strong hover:text-txt-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" onClick={skip} className="text-xs text-txt-muted hover:text-txt-secondary transition-colors">
          Skip for now
        </button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button size="sm" loading={loading} onClick={finish}>
              Start tracking
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
