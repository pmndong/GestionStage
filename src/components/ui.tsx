import { type ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

type BadgeVariant = 'common' | 'specific' | 'p1' | 'p2' | 'p3' | 'default';
const BADGE_STYLES: Record<BadgeVariant, string> = {
  common:   'bg-purple-100 text-purple-700 border border-purple-200',
  specific: 'bg-orange-100 text-orange-700 border border-orange-200',
  p1:       'bg-red-100 text-red-700 border border-red-200',
  p2:       'bg-yellow-100 text-yellow-700 border border-yellow-200',
  p3:       'bg-green-100 text-green-700 border border-green-200',
  default:  'bg-slate-100 text-slate-600 border border-slate-200',
};

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${BADGE_STYLES[variant]}`}>
      {children}
    </span>
  );
}

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
const BTN_STYLES: Record<BtnVariant, string> = {
  primary:   'bg-[#00b894] hover:bg-[#00966e] text-white shadow-sm',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm',
  danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
  ghost:     'hover:bg-slate-100 text-slate-500 hover:text-slate-800',
};

export function Button({
  children, variant = 'secondary', onClick, className = '', type = 'button', disabled,
}: {
  children: ReactNode;
  variant?: BtnVariant;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 ${BTN_STYLES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm outline-none focus:border-[#00b894] focus:ring-2 focus:ring-[#00b894]/10 transition-all placeholder:text-slate-400 ${className}`}
    />
  );
}

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm outline-none focus:border-[#00b894] focus:ring-2 focus:ring-[#00b894]/10 transition-all placeholder:text-slate-400 resize-vertical ${className}`}
    />
  );
}

export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm outline-none focus:border-[#00b894] transition-all ${className}`}
    >
      {children}
    </select>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-xl font-semibold text-slate-800 mb-4">{children}</h2>;
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3 opacity-30">{icon}</div>
      <p className="text-slate-700 font-medium mb-1">{title}</p>
      {description && <p className="text-slate-400 text-sm">{description}</p>}
    </div>
  );
}
