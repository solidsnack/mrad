import { Svg, SVG } from "@svgdotjs/svg.js"

import { DrawIn } from "./draw-in"
import { setupContainer } from "./margins-and-viewboxes"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"
import { indexArray } from "../utils/array"

const gray = "#C0C0C0"
const color = "#34C230"

export const GreenWithGrid125: StyleInfo & DrawIn = class GreenWithGrid125
    implements Style
{
    static readonly diameter: number = 125
    static readonly innerDiameter: number = 100
    static readonly width: number = 200
    static readonly height: number = GreenWithGrid125.width
    static readonly description: string = "Green Outer Circle and Grid (125mm)"

    draw(page: PageSize, element: HTMLObjectElement) {
        const svg = SVG().addTo(element)
        const innerSVGWithMargin = setupContainer(svg, page, GreenWithGrid125)

        GreenWithGrid125.drawIn(innerSVGWithMargin)
    }

    static drawIn(svg: Svg) {
        const gridWidthAndHeight = Math.min(
            GreenWithGrid125.width,
            GreenWithGrid125.height
        )
        const outerDiameter = GreenWithGrid125.diameter
        const innerDiameter = GreenWithGrid125.innerDiameter
        const strokeWidth = (outerDiameter - innerDiameter) / 2
        const correctedDiameter = outerDiameter - strokeWidth

        if (correctedDiameter <= 0)
            throw new Error("Width of arc greater than radius!")

        svg.circle(correctedDiameter).cx(0).cy(0).fill("none").stroke({
            color: color,
            width: strokeWidth,
            opacity: 1.0,
        })

        const smallDiameter = innerDiameter / 2

        svg.circle(smallDiameter).cx(0).cy(0).stroke("none").fill({
            color: color,
            opacity: 0.1,
        })

        const centimeterToGridCenter = (cm: number) => {
            const mm = cm * 10
            const centered = mm + 5
            const offset = gridWidthAndHeight / 2
            return centered - offset
        }

        const centimeterCenters = indexArray(gridWidthAndHeight / 10)
            .map(centimeterToGridCenter)
            .sort((a, b) => a - b)

        for (const x of centimeterCenters) {
            for (const y of centimeterCenters) {
                drawCorneredCMSquare(svg, { x, y })
            }
        }
    }
}

function drawCorneredCMSquare(svg: Svg, center: { x: number; y: number }) {
    const { x, y } = center
    const g = svg.group()
    const hd = 0.5

    g.path(`M ${x + 5} ${y + 5} l -${hd} 0 l ${hd} -${hd}`)
        .fill(gray)
        .stroke("none")

    g.path(`M ${x - 5} ${y + 5} l ${hd} 0 l -${hd} -${hd}`)
        .fill(gray)
        .stroke("none")

    g.path(`M ${x + 5} ${y - 5} l -${hd} 0 l ${hd} ${hd}`)
        .fill(gray)
        .stroke("none")

    g.path(`M ${x - 5} ${y - 5} l ${hd} 0 l -${hd} ${hd}`)
        .fill(gray)
        .stroke("none")

    return g
}
