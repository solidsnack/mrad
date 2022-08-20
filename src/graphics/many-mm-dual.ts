import { SVG } from "@svgdotjs/svg.js"

import { setupSideBySideContainers } from "./margins-and-viewboxes"
import { ManyMM, drawInSVG } from "./many-mm"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"

export const ManyMMDual: StyleInfo = class ManyMMDual implements Style {
    static readonly width: number = 400
    static readonly height: number = 200
    static readonly description: string =
        "Many Millimeters (20cm), side by side"

    draw(page: PageSize, element: HTMLElement) {
        const outerSVG = SVG().addTo(element)
        const { left, right } = setupSideBySideContainers(
            outerSVG,
            page,
            ManyMM
        )

        drawInSVG(left)
        drawInSVG(right)
    }
}
