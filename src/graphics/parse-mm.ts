export function parseMM(s: string): number {
    const re = /^([0-9]+)mm$/

    const m = re.exec(s)
    if (!m) throw new Error("Invalid millimeter measurement!")

    const mm = Number.parseInt(m[1])
    if (!Number.isInteger(mm)) throw new Error(`Not an int: ${mm}`)

    return mm
}
