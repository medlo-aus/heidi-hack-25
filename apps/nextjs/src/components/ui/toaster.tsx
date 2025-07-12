import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { Button } from "./button";
import React from "react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const isError = props.variant === "destructive";
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription className="select-text overflow-auto">
                  {isError ? (
                    <div className="flex items-center justify-between">
                      <span className="select-text">{description}</span>
                      <CopyButton text={description.toString()} />
                    </div>
                  ) : (
                    description
                  )}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      className="absolute bottom-4 right-4 text-xs"
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
