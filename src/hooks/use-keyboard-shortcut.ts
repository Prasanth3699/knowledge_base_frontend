import { useEffect } from "react";

export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  deps: any[] = []
) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const keysPressed = keys.every(key => {
        switch (key) {
          case "ctrl":
            return event.ctrlKey;
          case "meta":
            return event.metaKey;
          case "shift":
            return event.shiftKey;
          case "alt":
            return event.altKey;
          default:
            return event.key.toLowerCase() === key.toLowerCase();
        }
      });

      if (keysPressed) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, deps);
}


