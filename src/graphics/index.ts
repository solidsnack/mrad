import { Bullseye } from "./bullseye"
import { dual } from "./generic-dual"
import { GrayCircle20 } from "./gray-circle"
import { GreenWithGrid20 } from "./green-with-grid"
import { GreenWithGrid125 } from "./green-with-grid-small"
// import { ManyMM } from "./many-mm"
import { GridGuide } from "./grid-guide"
import { ManyMM } from "./many-mm-radial-lines"
import { Series } from "./series"
import { CenterSearch } from "./center-search"

export { type Style, type StyleInfo } from "./style"

export const styles = {
    bullseye: Bullseye,
    centerSearch: CenterSearch,
    grayCircle20: GrayCircle20,
    grayCircle20Dual: dual(GrayCircle20),
    greenCircle20: GreenWithGrid20,
    greenCircle125: GreenWithGrid125,
    grid: GridGuide,
    manyMM: ManyMM,
    manyMMDual: dual(ManyMM),
    series: Series,
}

export { margins } from "./margins-and-viewboxes"
