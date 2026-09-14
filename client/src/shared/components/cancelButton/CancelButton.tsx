import React from 'react';

interface CancelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  children = 'Cancelar',
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`
        px-4 py-2 
        rounded-lg 
        font-medium 
        border 
        text-[var(--main-color)] 
        border-[var(--main-color)] 
        bg-transparent
        hover:bg-gray-100 
        hover:border-gray-300 
        hover:text-gray-700
        active:bg-gray-200
        transition-colors 
        duration-200 
        ease-in-out
        focus:outline-none 
        focus:ring-2 
        focus:ring-gray-300 
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};