import './spinner.css';

interface SpinnerProps {
  active: boolean;
}

function Spinner({ active }: SpinnerProps) {
  if (!active) return null;

  return (
    <div className="spinner">
      <div className="circle">
        <div className="circle-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="line" 
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Spinner };