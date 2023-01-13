import { Gradient, Svg, SVG } from "@svgdotjs/svg.js"
// import { isPresent } from "ts-is-present"

import { DrawIn } from "./draw-in"
import { setupContainer } from "./margins-and-viewboxes"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"
import { indexArray } from "../utils/array"

const wholeCircle = 2 * Math.PI
const sand = "#E1BE6A"
const teal = "#40B0A6"
const white = "white"
const specialRings = [40, 50, 64, 80]
const diameter = 100

export const CenterSearch: StyleInfo & DrawIn = class CenterSearch
    implements Style
{
    static readonly width: number = 2 * diameter
    static readonly height: number = CenterSearch.width
    static readonly description: string = "Center Search (4 of 10cm)"

    draw(page: PageSize, element: HTMLElement) {
        const outerSVG = SVG().addTo(element)
        const svg = setupContainer(outerSVG, page, CenterSearch)

        CenterSearch.drawIn(svg)
    }

    static drawIn(svg: Svg) {
        const radialTeal = svg.gradient("radial")
        radialTeal.stop(0, white)
        radialTeal.stop(1, teal)

        const radialSand = svg.gradient("radial")
        radialSand.stop(0, white)
        radialSand.stop(1, sand)

        // Clockwise.
        const boxes: Array<[{ x: number; y: number }, Gradient, string]> = [
            [{ x: 0, y: -100 }, radialTeal, teal],
            [{ x: 0, y: 0 }, radialSand, sand],
            [{ x: -100, y: 0 }, radialTeal, teal],
            [{ x: -100, y: -100 }, radialSand, sand],
        ]

        const withParity: Array<
            [{ x: number; y: number }, Gradient, string, "even" | "odd"]
        > = boxes.map((items, index) => [...items, evenOdd(index)])

        for (const [{ x, y }, fill, color, parity] of withParity) {
            const innerSVG = svg
                .nested()
                .x(x)
                .y(y)
                .size(diameter, diameter)
                .viewbox(-diameter / 2, -diameter / 2, diameter, diameter)
            innerSVG
                .circle(diameter * 0.99)
                .cx(0)
                .cy(0)
                .fill(fill)
                .stroke("none")
            drawGridCircle(
                innerSVG,
                color,
                diameter,
                diameter * 0.02,
                64,
                parity
            )

            for (const ring of specialRings) {
                drawRing(innerSVG, "black", 0.25, ring, 0.2)
            }
        }
    }
}

function drawRing(
    svg: Svg,
    color: string,
    opacity: number,
    outerDiameter: number,
    width: number
) {
    const correctedDiameter = outerDiameter - width

    if (correctedDiameter <= 0)
        throw new Error("Width of arc greater than radius!")

    return svg.circle(correctedDiameter).cx(0).cy(0).fill("none").stroke({
        color,
        width,
        opacity,
    })
}

function drawGridCircle(
    svg: Svg,
    color: string,
    outerDiameter: number,
    width: number,
    elements: number,
    selectedParity: "even" | "odd"
) {
    const outerRadius = outerDiameter / 2
    const innerRadius = outerRadius - width

    const step = wholeCircle / elements
    const toTop = wholeCircle / 4
    const rotate = (angle: number) => angle + toTop
    // Angular steps, shifted so that elements start vertically centered at the
    // top of the cirlce.
    const steps: Array<[number, "even" | "odd"]> = indexArray(elements).map(
        (n, index) => [rotate((n + 0.5) * step), evenOdd(index)]
    )

    for (const [start, parity] of steps) {
        const stop = start + step

        drawWedge(svg, outerRadius, innerRadius, start, stop)
            .fill(selectedParity !== parity ? white : color)
            .opacity(1.0)
    }
}

function drawWedge(
    svg: Svg,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    stopAngle: number
) {
    const outerR = xy(outerRadius, startAngle)
    const outerL = xy(outerRadius, stopAngle)
    const innerR = xy(innerRadius, startAngle)
    const innerL = xy(innerRadius, stopAngle)

    const path = [
        `M ${outerR.x} ${outerR.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${outerL.x} ${outerL.y}`,
        `L ${innerL.x} ${innerL.y}`,
        `A ${innerRadius} ${innerRadius} 0 0 0 ${innerR.x} ${innerR.y}`,
    ]

    return svg.path(path.join(" ")).stroke("none")
}

function xy(r: number, theta: number): { x: number; y: number } {
    return {
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r,
    }
}

function evenOdd(n: number): "even" | "odd" {
    return n % 2 === 0 ? "even" : "odd"
}
