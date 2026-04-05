import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/10 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        solid: "border-primary/10 bg-primary/10 text-primary",
        outline: "border-border/70 bg-background/80 text-foreground",
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement>
  & VariantProps<typeof badgeVariants>
  & {
    asChild?: boolean;
  };

export function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn(badgeVariants({ variant }), className)} {...props} />;
}
