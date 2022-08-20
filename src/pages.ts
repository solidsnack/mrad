export interface PageSize {
    /** Width in millimeters. */
    width: number
    /** Height in millimeters. */
    height: number
    description: string
}

export const sizes = {
    a4: { width: 210, height: 297, description: "A4" } as PageSize,
    a5: { width: 148, height: 210, description: "A5" } as PageSize,
    letter: { width: 215.9, height: 279.4, description: "Letter" } as PageSize,
    ledger: { width: 431.8, height: 279.4, description: "Ledger" } as PageSize,
}
