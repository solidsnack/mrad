import { Svg, SVG } from "@svgdotjs/svg.js"
// import { isPresent } from "ts-is-present"

import { DrawIn } from "./draw-in"
import { setupContainer } from "./margins-and-viewboxes"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"

// const darkGray = "#C0C0C0"
const gray = "#F0F0F0"
// const darkGray = "#E0E0E0"
// const green = "#00693E" // Dartmouth Green
// const orange = "#FF4F00" // International Orange
const red = "#E30022" // Cadmium Red
// const blue = "#120A8F" // Ultramarine
const white = "white"
// const black = "black"

const specialRings = [
    20, 40, 50, 64, 80, 100, 125, 160, 200,
    // 8, 10, 12.5, 16, 20, 25, 32, 40, 50, 64, 80, 100, 125, 160, 200,
]

export const Series: StyleInfo & DrawIn = class Series implements Style {
    static readonly diameter: number = 200
    static readonly width: number = Series.diameter
    static readonly height: number = Series.diameter
    static readonly description: string = "Golden Mean (20cm)"

    draw(page: PageSize, element: HTMLElement) {
        const outerSVG = SVG().addTo(element)
        const svg = setupContainer(outerSVG, page, Series)

        Series.drawIn(svg)
    }

    static drawIn(svg: Svg) {
        const withParity: Array<[number, ReturnType<typeof evenOdd>]> =
            specialRings.map((ring, index) => [ring, evenOdd(index)])
        withParity.reverse()

        for (const [ring, parity] of withParity) {
            // if (!(ring >= 25 && ring <= 125)) continue
            const color = ring >= 40 && ring <= 125 ? red : gray
            const fill = parity === "even" ? color : white
            svg.circle(ring).cx(0).cy(0).fill(fill).stroke("none")
        }
    }
}

// function drawCircle(
//     svg: Svg,
//     color: string,
//     opacity: number,
//     outerDiameter: number,
//     width: number
// ) {
//     const correctedDiameter = outerDiameter - width

//     if (correctedDiameter <= 0)
//         throw new Error("Width of arc greater than radius!")

//     return svg.circle(correctedDiameter).cx(0).cy(0).fill("none").stroke({
//         color,
//         width,
//         opacity,
//     })
// }

function evenOdd(n: number): "even" | "odd" {
    return n % 2 === 0 ? "even" : "odd"
}
