// Generic Server Action return type
export interface ActionResult<T = null> {
    success: boolean;
    data?: T;
    error?: string;
    fieldErrors?: Partial<Record<string, string>>;
}
