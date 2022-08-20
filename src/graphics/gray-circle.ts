import { Svg, SVG } from "@svgdotjs/svg.js"

import { setupContainer } from "./margins-and-viewboxes"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"
import { indexArray } from "../utils/array"

const gray = "#C0C0C0"
const lighterGray = "#F0F0F0"

export const GrayCircle20: StyleInfo = class GrayCircle20 implements Style {
    static readonly diameter: number = 200
    static readonly width: number = GrayCircle20.diameter
    static readonly height: number = GrayCircle20.diameter
    static readonly description: string = "Plain Gray Circle (20cm)"

    draw(page: PageSize, element: HTMLObjectElement) {
        const svg = SVG().addTo(element)
        const innerSVGWithMargin = setupContainer(svg, page, GrayCircle20)

        drawInSVG(innerSVGWithMargin)
    }
}

export function drawInSVG(svg: Svg) {
    const maxDiameter = Math.max(GrayCircle20.width, GrayCircle20.height)
    const stepSize = 10

    const diameters = indexArray(maxDiameter / stepSize)
        .map((n) => stepSize * (n + 1))
        .sort((a, b) => a - b)

    // We don't need the last one, because, a special style is applied at the
    // outmost ring.
    diameters.pop()

    const boldStrokeWidth = 1
    const correctedDiameter = maxDiameter - boldStrokeWidth

    if (correctedDiameter <= 0)
        throw new Error("Width of arc greater than radius!")

    svg.circle(correctedDiameter).cx(0).cy(0).fill("none").stroke({
        color: gray,
        width: boldStrokeWidth,
        opacity: 1.0,
    })

    const narrowStrokeWidth = 0.1
    for (const diameter of diameters) {
        const correctedDiameter = diameter - narrowStrokeWidth
        svg.circle(correctedDiameter).cx(0).cy(0).fill("none").stroke({
            color: lighterGray,
            width: narrowStrokeWidth,
            opacity: 1.0,
        })
    }
}
