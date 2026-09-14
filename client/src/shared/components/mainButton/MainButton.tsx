import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface MainButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeClasses: Record<NonNullable<MainButtonProps['size']>, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

function MainButton({
  children,
  icon,
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: MainButtonProps) {
  const baseClasses =
    'btn-main inline-flex items-center justify-center font-medium transition-all ' +
    'cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${widthClass} ${className}`
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export { MainButton };