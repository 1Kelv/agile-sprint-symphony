
import { useToast as useToastOriginal } from "../../hooks/use-toast";

// Last toast time tracker to prevent spam
let lastToastTime = 0;
const TOAST_THROTTLE_MS = 2000; // 2 seconds minimum between identical toasts
let activeToasts = new Set();

// Create a toast wrapper that prevents multiple identical toasts
const toastWrapper = (options) => {
  const now = Date.now();
  
  // Generate a simple hash for this toast to identify duplicates
  const toastHash = `${options.title || ''}-${options.description || ''}-${options.variant || ''}`;
  
  // Check if we already have an active identical toast
  if (activeToasts.has(toastHash)) {
    console.log("Toast rejected - identical toast already active:", options.title);
    return { id: "rejected" };
  }
  
  // Check if we should throttle
  if (now - lastToastTime < TOAST_THROTTLE_MS && toastWrapper.lastHash === toastHash) {
    console.log("Toast throttled:", options.title);
    return { id: "throttled" };
  }
  
  // Update last toast time and hash
  lastToastTime = now;
  toastWrapper.lastHash = toastHash;
  
  // Add to active toasts
  activeToasts.add(toastHash);
  
  // Create a modified options object that will remove the toast from active toasts when dismissed
  const enhancedOptions = {
    ...options,
    onDismiss: () => {
      // Call original onDismiss if it exists
      if (options.onDismiss) {
        options.onDismiss();
      }
      // Remove from active toasts
      activeToasts.delete(toastHash);
    },
    // Use a reasonable duration for error messages
    duration: options.variant === 'destructive' ? 5000 : (options.duration || 5000)
  };
  
  // Call the original toast
  const result = useToastOriginal().toast(enhancedOptions);
  
  // Set a backup timer to remove from active toasts in case onDismiss isn't called
  setTimeout(() => {
    activeToasts.delete(toastHash);
  }, enhancedOptions.duration + 500);
  
  return result;
};

toastWrapper.lastHash = '';

// Export the original hook and our wrapper
export const useToast = useToastOriginal;
export const toast = toastWrapper;
