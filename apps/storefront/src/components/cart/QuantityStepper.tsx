import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}: QuantityStepperProps) {
  const buttonClass =
    size === 'sm'
      ? 'w-7 h-7'
      : 'w-10 h-10';
  const iconSize = size === 'sm' ? 12 : 14;

  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className={`${buttonClass} flex items-center justify-center border border-border rounded-sm transition-smooth hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Decrease quantity"
      >
        <Minus size={iconSize} />
      </button>
      <span className={`font-medium text-center ${size === 'sm' ? 'text-xs w-4' : 'text-sm w-6'}`}>
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className={`${buttonClass} flex items-center justify-center border border-border rounded-sm transition-smooth hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Increase quantity"
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
}
