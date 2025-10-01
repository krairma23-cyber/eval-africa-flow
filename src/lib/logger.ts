/**
 * Secure logging utility for production environments
 * Only logs errors to Supabase audit system, prevents sensitive data exposure
 */

import { supabase } from "@/integrations/supabase/client";

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Log error to audit system (only in production)
 * In development, logs to console for debugging
 */
export async function logError(
  message: string,
  error: unknown,
  context?: LogContext
): Promise<void> {
  // Only log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${context?.component || 'App'}]`, message, error);
    return;
  }

  // In production, log to audit system without sensitive details
  try {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('comprehensive_audit_logs').insert({
      user_id: user?.id || context?.userId,
      action: context?.action || 'ERROR',
      resource_type: context?.component || 'application',
      request_data: {
        message,
        timestamp: new Date().toISOString(),
        ...context?.metadata
      },
      response_data: {
        error: errorMessage
      },
      success: false
    });
  } catch (auditError) {
    // Silently fail - don't expose audit system errors to user
  }
}

/**
 * Log info message (development only)
 */
export function logInfo(message: string, data?: any): void {
  if (import.meta.env.DEV) {
    console.log(`[Info]`, message, data);
  }
}

/**
 * Log warning (development only)
 */
export function logWarn(message: string, data?: any): void {
  if (import.meta.env.DEV) {
    console.warn(`[Warning]`, message, data);
  }
}
