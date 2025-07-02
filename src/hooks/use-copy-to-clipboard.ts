import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await copyToClipboard(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      setIsCopied(false);
      return false;
    }
  };

  return { isCopied, copy };
}

