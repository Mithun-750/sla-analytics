interface SlaBarProps {
  consumed: number;
  target: number;
}

export default function SlaBar({ consumed, target }: SlaBarProps) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 100;
  const color =
    pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-green-500';

  return (
    <div className="w-full">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{Math.round(pct)}%</span>
    </div>
  );
}
