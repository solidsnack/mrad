import { Svg, SVG } from "@svgdotjs/svg.js"
import { isPresent } from "ts-is-present"

import { DrawIn } from "./draw-in"
import { setupContainer } from "./margins-and-viewboxes"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"
import { indexArray } from "../utils/array"

const wholeCircle = 2 * Math.PI
const stepSize = 1
const blue = "#002868"
const red = "#BF0A30"
const gray = "#F0F0F0"
// const darkGray = "#C0C0C0"
const darkGray = "#E0E0E0"

export const ManyMM: StyleInfo & DrawIn = class ManyMM implements Style {
    static readonly diameter: number = 200
    static readonly width: number = ManyMM.diameter
    static readonly height: number = ManyMM.diameter
    static readonly description: string = "Many Millimeters (20cm)"

    draw(page: PageSize, element: HTMLElement) {
        const outerSVG = SVG().addTo(element)
        const svg = setupContainer(outerSVG, page, ManyMM)

        ManyMM.drawIn(svg)
    }

    static drawIn(svg: Svg) {
        const half = stepSize / 2
        const tinyLine = stepSize / 10
        const maxDiameter = Math.max(ManyMM.width, ManyMM.height)

        const radialLines = 16
        const radius = maxDiameter / 2
        for (const radial of indexArray(radialLines)) {
            const step = wholeCircle / radialLines
            const centerAngle = radial * step
            const [cos, sin] = [Math.cos(centerAngle), Math.sin(centerAngle)]

            svg.line([
                [radius * (1 / 5) * cos, radius * (1 / 5) * sin],
                [radius * cos, radius * sin],
            ]).stroke({
                color: darkGray,
                width: tinyLine,
                opacity: 1,
            })
        }

        const diameters = indexArray(maxDiameter / stepSize)
            .map((n) => stepSize * (n + 1))
            .sort((a, b) => a - b)

        const redRings = new ColoredRings(red, 1, [[100, 80]])
        const blueRings = new ColoredRings(blue, 1, [[50, 40]])
        const specialGrayRings = new ColoredRings(
            gray,
            1,
            [160, 125, 80, 64, 40, 32, 25, 16].map((n) => [n, n - 1])
        )

        const countsAsInside = ["inside", "outer-edge"]

        for (const diameter of diameters) {
            let onInnerEdgeOfSomething = false
            let onOuterEdgeOfSomething = false
            let inSpecialRing = false
            let [color, opacity] = [gray, 1]

            for (const ring of [redRings, blueRings, specialGrayRings]) {
                const check = ring.check(diameter)
                if (check === "inner-edge") onInnerEdgeOfSomething = true
                if (check === "outer-edge") onOuterEdgeOfSomething = true
                if (!countsAsInside.includes(ring.check(diameter))) continue
                color = ring.color
                opacity = ring.opacity
                inSpecialRing = true
            }

            const cells = cellsForDiameter(diameter)
            // const parityShift = Math.ceil(diameter / 10) % 2
            const parityShift = 0
            if (color === gray) {
                if (inSpecialRing) {
                    drawDottedCircle(
                        svg,
                        gray,
                        opacity,
                        diameter,
                        half,
                        cells / 2,
                        evenOdd(diameter + parityShift),
                        "four-fifths"
                    )
                } else {
                    switch (diameter % 10) {
                        case 0:
                            drawCircle(svg, gray, opacity, diameter, half)
                            break
                        case 9:
                            break
                        default:
                            if (onInnerEdgeOfSomething) continue
                            drawCircle(
                                svg,
                                darkGray,
                                opacity,
                                diameter,
                                tinyLine
                            )
                    }
                }
            } else {
                switch (diameter % 10) {
                    case 0:
                        if (onOuterEdgeOfSomething) {
                            drawCircle(svg, color, opacity, diameter, half)
                        } else {
                            drawDottedCircle(
                                svg,
                                color,
                                opacity,
                                diameter,
                                half,
                                cells,
                                evenOdd(diameter + parityShift),
                                "evenly-spaced",
                                { color, opacity: opacity / 2 }
                            )
                        }
                        break
                    default:
                        drawDottedCircle(
                            svg,
                            color,
                            opacity,
                            diameter,
                            half,
                            cells,
                            evenOdd(diameter + parityShift),
                            "evenly-spaced"
                        )
                }
            }
        }
    }
}

class ColoredRings implements Iterable<[number, number]> {
    constructor(
        readonly color: string,
        readonly opacity: number,
        readonly bounds: Array<[number, number]>
    ) {
        let firstOuter
        let firstInner

        for (const [outer, inner] of bounds) {
            const formatted = JSON.stringify({ outer, inner })

            if (outer <= inner)
                throw new Error(`Zero-size or inverted ring: ${formatted}`)

            if (!!firstOuter) {
                if (outer >= firstOuter)
                    throw new Error(`Ring spec out of order: ${formatted}`)
            } else {
                firstOuter = outer
            }

            if (!!firstInner) {
                if (inner >= firstInner)
                    throw new Error(`Ring spec out of order: ${formatted}`)
            } else {
                firstInner = inner
            }
        }
    }

    [Symbol.iterator](): Iterator<[number, number]> {
        const iter = this.bounds[Symbol.iterator]()
        return iter
    }

    check(
        diameter: number
    ): "inside" | "outside" | "inner-edge" | "outer-edge" {
        for (const [outer, inner] of this.bounds) {
            if (diameter === outer) return "outer-edge"
            if (diameter === inner) return "inner-edge"
            if (inner < diameter && outer > diameter) return "inside"
        }
        return "outside"
    }
}

/**
 * The idea is to hold segments at a modest size but double whenever we
 * increase the number of cells. The doublings follow 12.5mm, 25mm, 50mm and
 * 100mm, &c.
 */
function cellsForDiameter(diameter: number): number {
    const cellScale = 8
    const fundamental = Math.log2(diameter / 10) - Math.log2(2.5)
    const roundedAndShifted = 2 + Math.max(-1, Math.ceil(fundamental))
    const baseFactor = 2 ** roundedAndShifted
    return baseFactor * cellScale
}

function drawCircle(
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

function drawDottedCircle(
    svg: Svg,
    color: string,
    opacity: number,
    outerDiameter: number,
    width: number,
    dots: number,
    parity: "even" | "odd",
    style: "evenly-spaced" | "four-fifths",
    contrast?: { color: string; opacity: number }
) {
    const step = (2 * Math.PI) / dots

    let shift
    switch (style) {
        case "evenly-spaced":
            shift = (0.5 * step) / 2
            break
        case "four-fifths":
            shift = (0.8 * step) / 2
            break
    }

    const g = svg.group()

    // Ad-hoc and only really works when main color is 100% opacity; but that
    // is our use case.
    if (isPresent(contrast)) {
        g.add(
            drawCircle(
                svg,
                contrast.color,
                contrast.opacity,
                outerDiameter,
                width
            )
        )
    }

    for (const i of indexArray(dots)) {
        const centerAngle = step * (i + (parity === "even" ? 0 : 0.5))

        g.add(
            drawArc(
                svg,
                color,
                opacity,
                outerDiameter,
                width,
                centerAngle - shift,
                centerAngle + shift
            )
        )
    }

    return g
}

function drawArc(
    svg: Svg,
    color: string,
    opacity: number,
    outerDiameter: number,
    width: number,
    startAngle: number,
    stopAngle: number
) {
    const radius = (outerDiameter - width) / 2

    if (radius <= 0) throw new Error("Width of arc greater than radius!")

    const m = {
        x: Math.cos(startAngle) * radius,
        y: Math.sin(startAngle) * radius,
    }
    const a = {
        x: Math.cos(stopAngle) * radius,
        y: Math.sin(stopAngle) * radius,
    }

    return svg
        .path(`M ${m.x} ${m.y} A ${radius} ${radius} 0 0 1 ${a.x} ${a.y}`)
        .fill("none")
        .stroke({
            color,
            width,
            opacity,
            linecap: "butt",
        })
}

function evenOdd(n: number): "even" | "odd" {
    return n % 2 === 0 ? "even" : "odd"
}
