interface MetricSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}

export function MetricSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  hint,
}: MetricSliderProps) {
  const id = `metric-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="metric">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={id} className="font-medium text-ink">
            {label}
          </label>
          {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
        </div>
        <output
          htmlFor={id}
          className="min-w-11 rounded-lg bg-sage-50 px-2.5 py-1 text-center text-sm font-semibold text-sage-700"
        >
          {value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-input"
        style={{ "--range-progress": `${progress}%` } as React.CSSProperties}
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-400" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
