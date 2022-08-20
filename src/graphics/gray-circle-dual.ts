import { SVG } from "@svgdotjs/svg.js"

import { setupSideBySideContainers } from "./margins-and-viewboxes"
import { GrayCircle20, drawInSVG } from "./gray-circle"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"

export const GrayCircle20Dual: StyleInfo = class GrayCircle20Dual
    implements Style
{
    static readonly width: number = 400
    static readonly height: number = 200
    static readonly description: string = "Gray Circle (20cm), side by side"

    draw(page: PageSize, element: HTMLElement) {
        const outerSVG = SVG().addTo(element)
        const { left, right } = setupSideBySideContainers(
            outerSVG,
            page,
            GrayCircle20
        )

        drawInSVG(left)
        drawInSVG(right)
    }
}
