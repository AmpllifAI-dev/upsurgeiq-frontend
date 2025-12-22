interface CharacterCounterProps {
  current: number;
  max?: number;
  showWords?: boolean;
}

export function CharacterCounter({ current, max, showWords = false }: CharacterCounterProps) {
  const words = current > 0 ? current.toString().split(/\s+/).filter(Boolean).length : 0;
  const isNearLimit = max && current / max > 0.9;
  const isOverLimit = max && current > max;

  return (
    <div className={`text-xs ${isOverLimit ? 'text-destructive' : isNearLimit ? 'text-yellow-600' : 'text-muted-foreground'}`}>
      {showWords && (
        <span className="mr-3">
          {words} {words === 1 ? 'word' : 'words'}
        </span>
      )}
      <span>
        {current}{max ? ` / ${max}` : ''} characters
      </span>
    </div>
  );
}
