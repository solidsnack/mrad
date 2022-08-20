import { SVG } from "@svgdotjs/svg.js"

import { DrawIn } from "./draw-in"
import { setupSideBySideContainers } from "./margins-and-viewboxes"
import { StyleInfo } from "./style"
import { PageSize } from "../pages"

export function dual(
    base: StyleInfo & DrawIn,
    description?: string
): StyleInfo {
    const desc = description ?? `${base.description}, side by side`
    return class {
        static readonly width: number = 400
        static readonly height: number = 200
        static readonly description: string = desc

        draw(page: PageSize, element: HTMLElement) {
            const outerSVG = SVG().addTo(element)
            const { left, right } = setupSideBySideContainers(
                outerSVG,
                page,
                base
            )

            base.drawIn(left)
            base.drawIn(right)
        }
    }
}
