import { Svg, SVG } from "@svgdotjs/svg.js"

import { DrawIn } from "./draw-in"
import { setupContainer } from "./margins-and-viewboxes"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"
import { indexArray } from "../utils/array"

const gray = "#B0B0B0"
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
        const midDiameter = diameter - strokeWidth

        if (midDiameter <= 0)
            throw new Error("Width of arc greater than radius!")

        // NB: We add more things to the mask below.
        // NB: We can't use the stroke and no-fill technique for this circle,
        //     because it interacts badly with masking. If we use that
        //     technique, adding a mask causes the circle to be clipped as
        //     though a square mask were applied to it, regardless of the
        //     actual contents of the mask!
        const ring = svg.circle(midDiameter).cx(0).cy(0).fill("none").stroke({
            color,
            width: strokeWidth,
            opacity: 1.0,
        })

        const maskForGrayDots = svg
            .mask()
            .add(svg.rect(diameter, diameter).cx(0).cy(0).fill("white"))
            .add(
                ring.clone().stroke({
                    color: "black",
                    width: strokeWidth,
                    opacity: 1.0,
                })
            )

        // const maskForWhiteDots = svg
        //     .mask()
        //     .add(svg.rect(diameter, diameter).cx(0).cy(0).fill("black"))
        //     .add(
        //         ring.clone().stroke({
        //             color: "white",
        //             width: strokeWidth,
        //             opacity: 1.0,
        //         })
        //     )

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
                const _ = drawCorneredCMSquare(svg, { x, y }, "white")
                const corners = drawCorneredCMSquare(svg, { x, y }, gray)
                for (const corner of corners) {
                    corner.maskWith(maskForGrayDots)
                }
            }
        }
    }
}

function drawCorneredCMSquare(
    svg: Svg,
    center: { x: number; y: number },
    color: string
) {
    const { x, y } = center
    const hd = 0.5

    const southwest = svg
        .path(`M ${x + 5} ${y + 5} l -${hd} 0 l ${hd} -${hd}`)
        .fill(color)
        .stroke("none")

    const southeast = svg
        .path(`M ${x - 5} ${y + 5} l ${hd} 0 l -${hd} -${hd}`)
        .fill(color)
        .stroke("none")

    const northwest = svg
        .path(`M ${x + 5} ${y - 5} l -${hd} 0 l ${hd} ${hd}`)
        .fill(color)
        .stroke("none")

    const northeast = svg
        .path(`M ${x - 5} ${y - 5} l ${hd} 0 l -${hd} ${hd}`)
        .fill(color)
        .stroke("none")

    return [southwest, southeast, northwest, northeast]
}