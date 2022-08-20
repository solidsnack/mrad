export function indexArray(n: number): number[] {
    return Array(n)
        .fill(null)
        .map((_, n) => n)
}
