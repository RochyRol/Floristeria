import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "gold" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-forest/10 text-forest",
  success: "bg-forest/15 text-forest-light",
  warning: "bg-gold/15 text-cacao",
  danger: "bg-burgundy/10 text-burgundy",
  gold: "bg-gold/15 text-cacao border border-gold/30",
  outline: "bg-transparent border border-forest/20 text-forest/70",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const statusVariants: Record<string, BadgeVariant> = {
  RECEIVED: "gold",
  PROCESSING: "warning",
  READY: "success",
  IN_ROUTE: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariants[status] || "default"}>
      {ORDER_STATUS_LABELS[status] || status}
    </Badge>
  );
}
