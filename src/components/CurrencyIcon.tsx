import { getCurrencyColor } from '@/lib/currencies';

export default function CurrencyIcon({
  code,
  size = 40,
}: {
  code: string;
  size?: number;
}) {
  const color = getCurrencyColor(code);
  return (
    <div
      className="rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.35,
      }}
    >
      {code.slice(0, 3)}
    </div>
  );
}
