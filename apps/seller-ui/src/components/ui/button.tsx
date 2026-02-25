import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/index';
import { BiLoaderAlt } from 'react-icons/bi';

const buttonVariants = cva(
  'inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primarySemiDark text-primary-foreground hover:bg-primarySemiDark/90',
        outline:
          'border border-primary bg-transparent hover:bg-transparent text-primary dark:text-primaryLight',
        primary2: 'bg-primary2 text-primary-foreground hover:bg-primary2/90',
        primary2Dark:
          'bg-primary2Dark text-primary-foreground hover:bg-primary2Dark/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        background: 'bg-background text-foreground hover:bg-background/90',
        outlineDestructive:
          'border border-destructive bg-transparent hover:bg-transparent text-destructive',
        outlineBackground:
          'border border-background bg-transparent hover:bg-transparent text-background',
        outlineGray:
          'border border-gray-400 bg-transparent hover:bg-transparent text-muted-foreground',
        outlinePrimary2:
          'border border-primary2 bg-transparent hover:bg-transparent text-primary2',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent/80 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        linkForeground: 'text-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-3 py-2 text-xs sm:text-sm',
        xs: 'h-7 rounded-sm px-2 py-0.5 text-xs',
        sm: 'h-9 rounded-md px-3 text-xs sm:text-sm',
        lg: 'h-11 rounded-md px-4 text-sm sm:text-base',
        xl: 'h-14 rounded-lg px-6 text-sm sm:text-base',
        icon: 'h-10 w-10',
        smallIcon: 'h-8 w-8',
      },
      rounded: {
        default: 'rounded-md',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      rounded,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      icon: Icon,
      disabled,
      ...props
    },
    ref,
  ) => {
    return asChild ? (
      <Slot
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    ) : (
      <button
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        disabled={disabled || isLoading || false}
        {...props}
      >
        {isLoading && <BiLoaderAlt className="h-4 w-4 animate-spin" />}
        {Icon && Icon}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
