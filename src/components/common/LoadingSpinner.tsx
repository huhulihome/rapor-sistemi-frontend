interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner = ({
  size = 'md',
  fullScreen = false,
  message
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-blue-500/30 rounded-full`}
        />
        <div
          className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0`}
          role="status"
          aria-label="Loading"
        />
      </div>
      {message && (
        <p className="text-sm text-slate-400">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};
