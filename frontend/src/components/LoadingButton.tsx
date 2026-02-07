import { Mountain } from "lucide-react";

type LoadingButtonProps = {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function LoadingButton({
  loading,
  children,
  className,
  disabled,
  onClick,
  type = "button",
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <span className="mountain-loader">
          <Mountain size={16} />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
