import { Svg, SVG } from "@svgdotjs/svg.js"

import { DrawIn } from "./draw-in"
import { setupContainer } from "./margins-and-viewboxes"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"
import { indexArray } from "../utils/array"

const wholeCircle = 2 * Math.PI
const stepSize = 10
// const darkGray = "#C0C0C0"
const gray = "#F0F0F0"
// const darkGray = "#E0E0E0"
// const green = "#00693E" // Dartmouth Green
// const orange = "#FF4F00" // International Orange
// const red = "#E30022" // Cadmium Red
// const blue = "#120A8F" // Ultramarine
const white = "white"
// const black = "black"

//const specialRings = [16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160] //, 200]

export const GridGuide: StyleInfo & DrawIn = class GridGuide implements Style {
    static readonly diameter: number = 200
    static readonly width: number = GridGuide.diameter
    static readonly height: number = GridGuide.diameter
    static readonly description: string = "Polar Grid (20cm)"

    draw(page: PageSize, element: HTMLElement) {
        const outerSVG = SVG().addTo(element)
        const svg = setupContainer(outerSVG, page, GridGuide)

        GridGuide.drawIn(svg)
    }

    static drawIn(svg: Svg) {
        const half = stepSize / 2
        const maxDiameter = Math.max(GridGuide.width, GridGuide.height)

        const diameters = indexArray(maxDiameter / stepSize)
            .map((n) => stepSize * (n + 1))
            .sort((a, b) => a - b)

        for (const diameter of diameters) {
            if (diameter <= 40) continue

            const parity = shiftParity(evenOdd(diameter / 10))
            const { cells, atThreshold } = cellsForDiameter(diameter)
            const [color, grades, shrinkage] = [gray, 4, 0.5]
            // const [color, grades, shrinkage] =
            //  diameter <= 100 && diameter > 50 ? [red, 0, 0] : [gray, 4, 0.5]

            if (atThreshold) {
                drawCircle(svg, color, 0.5, diameter, half)
            } else {
                drawGridCircle(
                    svg,
                    color,
                    diameter,
                    half,
                    cells,
                    parity,
                    grades,
                    shrinkage
                )
            }
        }

        // for (const ring of specialRings) {
        //     const color = red // ring <= 100 ? red : gray
        //     drawCircle(svg, color, 1, ring, ring / 50)
        // }
    }
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

function drawGridCircle(
    svg: Svg,
    color: string,
    outerDiameter: number,
    width: number,
    elements: number,
    selectedParity: "even" | "odd",
    grades: number,
    shrinkage: number
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

        if (selectedParity !== parity) continue

        drawGradedWedge(
            svg,
            color,
            outerRadius,
            innerRadius,
            start,
            stop,
            grades,
            shrinkage
        )
    }
}

function drawGradedWedge(
    svg: Svg,
    color: string,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    stopAngle: number,
    grades = 0,
    shrinkage = 0
) {
    const step = shrinkage / grades
    const width = outerRadius - innerRadius
    const angle = startAngle - stopAngle

    drawWedge(svg, outerRadius, innerRadius, startAngle, stopAngle)
        .fill(color)
        .opacity(1.0)

    for (const n of indexArray(grades).map((n) => n + 1)) {
        const delta = n * step
        const deltaWidth = (delta * width) / 2
        const deltaAngle = (delta * angle) / 2
        const opacity = n / grades
        const wedge = drawWedge(
            svg,
            outerRadius - deltaWidth,
            innerRadius + deltaWidth,
            startAngle - deltaAngle,
            stopAngle + deltaAngle
        )
        wedge.fill(white).opacity(opacity < 1 ? opacity * 0.5 : opacity)
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

function evenOdd(n: number): "even" | "odd" {
    return n % 2 === 0 ? "even" : "odd"
}

function shiftParity(parity: "even" | "odd"): "even" | "odd" {
    if (parity === "even") return "odd"
    return "even"
}

function xy(r: number, theta: number): { x: number; y: number } {
    return {
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r,
    }
}

/**
 * The idea is to hold segments at a modest size but double whenever we
 * increase the number of cells. The doublings follow 12.5mm, 25mm, 50mm and
 * 100mm, &c.
 */
function cellsForDiameter(diameter: number): {
    cells: number
    atThreshold: boolean
} {
    const thresholds = [
        [10, 8],
        [50, 16],
        [100, 32],
        [200, 64],
    ]
    let [cells, atThreshold] = [128, false]

    for (const [threshold, cellCount] of thresholds) {
        if (diameter <= threshold) {
            cells = cellCount
            atThreshold = diameter === threshold
            break
        }
    }
    return { cells, atThreshold }
}
