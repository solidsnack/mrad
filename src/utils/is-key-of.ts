export function isKey<T>(k: string | number | symbol, obj: T): k is keyof T {
    return k in obj
}
