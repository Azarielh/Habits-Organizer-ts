import { useEffect, useState } from "react";

export function useLoadFonts() {
  const [isReady, setIsReady] = useState(true);

  // Fonts are already loaded in this simple app
  // Just skip splash screen for now to avoid TurboModule issues
  
  return isReady;
}

// By default the demo backend runs on port 3001 locally.
// For a deployed backend set the environment variable `API_URL` when building
export const API_URL = process.env.API_URL || "http://localhost:3002";
