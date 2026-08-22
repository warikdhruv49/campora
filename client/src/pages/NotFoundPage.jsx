import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function NotFoundPage() {
  usePageMeta({ title: 'Not found · CAMPORA', noindex: true });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-900 p-4 text-center">
      <p className="num text-6xl font-bold text-stroke-strong">404</p>
      <h1 className="mt-4 text-lg font-semibold text-txt-primary">Page not found</h1>
      <p className="mt-1.5 text-xs text-txt-secondary max-w-xs">
        This route doesn't exist on the terminal.
      </p>
      <Link to="/" className="mt-6">
        <Button size="sm">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
