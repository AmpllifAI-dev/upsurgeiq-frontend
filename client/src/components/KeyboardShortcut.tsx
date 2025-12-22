interface KeyboardShortcutProps {
  keys: string[];
  className?: string;
}

export function KeyboardShortcut({ keys, className = "" }: KeyboardShortcutProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {keys.map((key, index) => (
        <span key={index} className="inline-flex">
          <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded shadow-sm">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="mx-1 text-xs text-muted-foreground">+</span>
          )}
        </span>
      ))}
    </span>
  );
}
