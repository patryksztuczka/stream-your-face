import { type Source } from "../types/source";

interface SourceCardProps {
  source: Source;
  isActive: boolean;
  onSelect: () => void;
}

export const SourceCard = ({ source, isActive, onSelect }: SourceCardProps) => {
  const Icon = source.icon;

  return (
    <button
      onClick={onSelect}
      className={`
        flex flex-col items-center justify-center p-3 rounded-xl
        transition duration-200 ease-out
        ${
          isActive
            ? "bg-gradient-to-br from-indigo-500/20 via-sky-500/20 to-emerald-500/20 ring-1 ring-white/20"
            : "bg-white/5 hover:bg-white/10"
        }
        scale-95 hover:scale-100
      `}
    >
      <Icon
        className={`w-6 h-6 mb-2 ${
          isActive ? "text-sky-400" : "text-gray-400"
        }`}
      />
      <span className={`text-sm ${isActive ? "text-white" : "text-gray-400"}`}>
        {source.label}
      </span>
    </button>
  );
};
