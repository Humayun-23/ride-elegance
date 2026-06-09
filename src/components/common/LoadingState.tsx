interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = "Loading..." }: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-primary font-medium">{text}</div>
    </div>
  );
}
