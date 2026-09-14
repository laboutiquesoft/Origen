import type { ReactNode } from 'react';

interface FormSectionHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  variant?: 'purple' | 'blue' | 'emerald' |'rose'|'amber'|'indigo'|'orange'|'teal'|'violet'|'gray';
}

const variantClasses = {
  purple: 'text-purple-700 border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-100/70 to-fuchsia-50 bg-[length:200%_200%] animate-gradient',
  blue: 'text-blue-700 border-blue-200 bg-gradient-to-r from-blue-50 via-cyan-100/70 to-sky-50 bg-[length:200%_200%] animate-gradient',
  emerald: 'text-emerald-700 border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-100/70 to-green-50 bg-[length:200%_200%] animate-gradient',
  rose: 'text-rose-700 border-rose-200 bg-gradient-to-r from-rose-50 via-pink-100/70 to-red-50 bg-[length:200%_200%] animate-gradient',
  amber: 'text-amber-700 border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-100/70 to-orange-50 bg-[length:200%_200%] animate-gradient',
  indigo: 'text-indigo-700 border-indigo-200 bg-gradient-to-r from-indigo-50 via-blue-100/70 to-violet-50 bg-[length:200%_200%] animate-gradient',
  orange: 'text-orange-700 border-orange-200 bg-gradient-to-r from-orange-50 via-amber-100/70 to-rose-50 bg-[length:200%_200%] animate-gradient',
  teal: 'text-teal-700 border-teal-200 bg-gradient-to-r from-teal-50 via-emerald-100/70 to-cyan-50 bg-[length:200%_200%] animate-gradient',
  violet: 'text-violet-700 border-violet-200 bg-gradient-to-r from-violet-50 via-purple-100/70 to-fuchsia-50 bg-[length:200%_200%] animate-gradient',
  gray: 'text-gray-700 border-gray-200 bg-gradient-to-r from-gray-50 via-slate-200/60 to-zinc-100 bg-[length:200%_200%] animate-gradient',
};

export const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({
  icon,
  title,
  description,
  variant = 'purple',
}) => {
  return (
    <div className={`p-3.5 rounded-lg border mb-4 ${variantClasses[variant]}`}>
      <div className="flex items-center gap-2 font-semibold">
        {icon && <span className="shrink-0">{icon}</span>}
        <h4>{title}</h4>
      </div>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
  );
};