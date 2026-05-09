"use client"

import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function PageBackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (document.referrer) {
      router.back();
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <Button variant="ghost" size={"icon"} onClick={() => handleBack()}>
      <ChevronLeftIcon />
    </Button>
  );
}