export const gateKeys: string[];
export const placeholderPattern: RegExp;
export function sourceHash(buffer: Uint8Array): string;
export function auditReadiness(root: string, data?: { answers?: { skills_years: Record<string, number> }; targets?: { targets: { enabled: boolean; platform: string; auth_required?: boolean }[] } }, now?: Date): { overall_ready: boolean; status: string; gates: Record<string, {complete: boolean; missing: string[]}>; state: unknown; pdf: string | undefined };
