// Comprehensive extension error suppression
if (typeof window !== 'undefined') {
    // Suppress ALL Dynamic/Reown errors from extensions
    const originalError = console.error;
    console.error = function(...args) {
      if (args.length > 0) {
        const firstArg = args[0];
        
        // Check if it's a Dynamic/Reown error
        if (typeof firstArg === 'string') {
          if (
            firstArg.includes('not found on Allowlist') ||
            firstArg.includes('cloud.reown.com') ||
            firstArg.includes('dynamic.xyz') ||
            firstArg.includes('reown.com') ||
            (firstArg.includes('Origin') && firstArg.includes('Allowlist'))
          ) {
            // Silently ignore - don't even log
            return;
          }
        }
        
        // Check error objects for Dynamic/Reown messages
        if (typeof firstArg === 'object' && firstArg !== null) {
          const message = firstArg.message || firstArg.toString();
          if (
            message.includes('reown') ||
            message.includes('dynamic') ||
            message.includes('Allowlist')
          ) {
            return;
          }
        }
      }
      
      // Pass through all other errors
      originalError.apply(console, args);
    };
  
    // Also override window.onerror to catch unhandled errors
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (typeof message === 'string' && (
        message.includes('reown') ||
        message.includes('dynamic') || 
        message.includes('Allowlist')
      )) {
        return true; // Suppress the error
      }
      if (originalOnError) {
        return originalOnError.apply(this, arguments);
      }
      return false;
    };
  }