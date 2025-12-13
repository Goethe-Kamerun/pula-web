"use client";

import React from "react";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { useApiWithStore } from "@/hooks/useApiWithStore";
import { Tooltip } from "@/components/ui/tooltip-info";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GuessContributeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GuessContribute({
  open,
  onOpenChange,
}: GuessContributeProps) {
  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);
  const { login } = useApiWithStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleLogin = async () => {
    const data = await login();
    if (data.redirect_string) {
      window.location.href = data.redirect_string;
    }
  };

  if (!token) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] p-8">
          <DialogHeader className="text-left mb-6">
            <DialogTitle className="text-2xl font-bold">
              Login to continue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-base text-foreground font-medium">
                Please log in to contribute
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You need to be logged in to record audio contributions.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogin}
                className="flex-1"
              >
                Login
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
