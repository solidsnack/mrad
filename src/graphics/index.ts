import { dual } from "./generic-dual"
import { GrayCircle20 } from "./gray-circle"
import { ManyMM } from "./many-mm"

export { type Style, type StyleInfo } from "./style"

export const styles = {
    grayCircle20: GrayCircle20,
    grayCircle20Dual: dual(GrayCircle20),
    manyMM: ManyMM,
    manyMMDual: dual(ManyMM),
}

export { margins } from "./margins-and-viewboxes"
