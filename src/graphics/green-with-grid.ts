import { Svg, SVG } from "@svgdotjs/svg.js"

import { DrawIn } from "./draw-in"
import { setupContainer } from "./margins-and-viewboxes"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"
import { indexArray } from "../utils/array"

const gray = "#C0C0C0"
const color = "#34C230"

export const GreenWithGrid20: StyleInfo & DrawIn = class GreenWithGrid20
    implements Style
{
    static readonly diameter: number = 200
    static readonly width: number = GreenWithGrid20.diameter
    static readonly height: number = GreenWithGrid20.diameter
    static readonly description: string = "Green Outer Circle and Grid (20cm)"

    draw(page: PageSize, element: HTMLObjectElement) {
        const svg = SVG().addTo(element)
        const innerSVGWithMargin = setupContainer(svg, page, GreenWithGrid20)

        GreenWithGrid20.drawIn(innerSVGWithMargin)
    }

    static drawIn(svg: Svg) {
        const diameter = GreenWithGrid20.diameter
        const strokeWidth = diameter / 4
        const correctedDiameter = diameter - strokeWidth

        if (correctedDiameter <= 0)
            throw new Error("Width of arc greater than radius!")

        svg.circle(correctedDiameter).cx(0).cy(0).fill("none").stroke({
            color: color,
            width: strokeWidth,
            opacity: 1.0,
        })

        const quarterDiameter = diameter / 4

        svg.circle(quarterDiameter).cx(0).cy(0).stroke("none").fill({
            color: color,
            opacity: 0.1,
        })

        const centimeterToGridCenter = (cm: number) => {
            const mm = cm * 10
            const centered = mm + 5
            const offset = diameter / 2
            return centered - offset
        }

        const centimeterCenters = indexArray(diameter / 10)
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
