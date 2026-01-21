"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { cn } from "@/lib/utils";
import React from "react";
import { LuOctagonAlert } from "react-icons/lu";

type Props = {
  heading: string;
  description: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  trigger?: React.ReactNode;
  closeActionLabel?: string;
  confirmAction: () => void;
  confirmActionLabel: string;
  isLoadingConfirmAction?: boolean;
  confirmActionClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  confirmActionVariant?: ButtonProps["variant"];
  isDisabledConfirmActionButton?: boolean;
  children?: React.ReactNode;
};

const ConfirmActionModal = ({
  heading,
  trigger,
  open,
  onOpenChange,
  confirmAction,
  className,
  closeActionLabel,
  confirmActionLabel,
  isLoadingConfirmAction,
  description,
  confirmActionClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  confirmActionVariant = "destructive",
  isDisabledConfirmActionButton = false,
  children,
}: Props) => {
  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      {trigger && <CredenzaTrigger asChild>{trigger}</CredenzaTrigger>}
      <CredenzaContent className={cn("z-15 max-w-[600px] py-8", className)}>
        <CredenzaHeader
          className={cn("space-y-2 items-center", headerClassName)}
        >
          <CredenzaTitle
            className={cn(
              "max-w-[80%] text-center mx-auto leading-normal font-quickSand font-bold",
              titleClassName
            )}
          >
            <div
              className={cn(
                "mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10",
                {
                  "bg-primary/10": confirmActionVariant === "default",
                  "bg-primary2/10": confirmActionVariant === "primary2",
                  "bg-secondary/10": confirmActionVariant === "secondary",
                }
              )}
            >
              <LuOctagonAlert
                className={cn("h-7 w-7 text-destructive", {
                  "text-primary": confirmActionVariant === "default",
                  "text-primary2": confirmActionVariant === "primary2",
                  "text-secondary": confirmActionVariant === "secondary",
                })}
              />
            </div>
            {heading}
          </CredenzaTitle>
          <CredenzaDescription
            className={cn(
              "text-foreground text-center max-w-[90%] mx-auto",
              descriptionClassName
            )}
          >
            {description}
          </CredenzaDescription>
        </CredenzaHeader>
        {children}
        <CredenzaFooter className="flex items-center mt-5! sm:justify-center">
          <CredenzaClose asChild>
            <Button variant="outlineGray" className="w-full sm:w-fit">
              {closeActionLabel || "Cancel"}
            </Button>
          </CredenzaClose>
          <Button
            isLoading={isLoadingConfirmAction}
            variant={confirmActionVariant}
            className={cn("w-full sm:w-fit", confirmActionClassName)}
            disabled={isLoadingConfirmAction || isDisabledConfirmActionButton}
            onClick={() => {
              confirmAction();
            }}
          >
            {confirmActionLabel}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default ConfirmActionModal;
