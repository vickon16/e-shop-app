'use client';

import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaTitle,
  CredenzaTrigger,
} from '@/components/ui/credenza';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode | (() => React.ReactNode);
  triggerChildren?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  classNames?: {
    content?: string;
    overlayClassName?: string;
  };
}

const CustomModal = (props: Props) => {
  const {
    children,
    triggerChildren,
    open = false,
    onOpenChange,
    classNames,
  } = props;

  const content = typeof children === 'function' ? children() : children;

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      {triggerChildren && (
        <CredenzaTrigger asChild>{triggerChildren}</CredenzaTrigger>
      )}
      <CredenzaContent
        className={cn(
          'md:max-w-[600px] mx-auto sm:rounded-2xl min-h-[300px] max-xs:mt-0!',
          classNames?.content,
        )}
        overlayClassName={cn(
          'backdrop-blur-none',
          classNames?.overlayClassName,
        )}
      >
        <CredenzaTitle className="sr-only">x</CredenzaTitle>
        <CredenzaDescription className="sr-only">x</CredenzaDescription>
        {content}
      </CredenzaContent>
    </Credenza>
  );
};

export default CustomModal;
