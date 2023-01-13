import { Svg, SVG } from "@svgdotjs/svg.js"
// import { isPresent } from "ts-is-present"

import { DrawIn } from "./draw-in"
import { setupContainer } from "./margins-and-viewboxes"
import { Style, StyleInfo } from "./style"
import { PageSize } from "../pages"
import { indexArray } from "../utils/array"

const gray = "#F7F7F7"
const red = "#E30022" // Cadmium Red
const specialRings = [64, 125]

export const Bullseye: StyleInfo & DrawIn = class Bullseye implements Style {
    static readonly diameter: number = 200
    static readonly width: number = Bullseye.diameter
    static readonly height: number = Bullseye.diameter
    static readonly description: string = "Bullseye (10cm)"

    draw(page: PageSize, element: HTMLElement) {
        const outerSVG = SVG().addTo(element)
        const svg = setupContainer(outerSVG, page, Bullseye)

        Bullseye.drawIn(svg)
    }

    static drawIn(svg: Svg) {
        const step = 10
        const rings = indexArray(Bullseye.diameter / step)
            .filter((_, index) => "odd" === evenOdd(index))
            .map((n) => (n + 1) * step)
        rings.reverse()

        const color = (ring: number) => (ring <= 100 ? red : gray)

        for (const ring of specialRings) {
            drawRing(svg, color(ring), 0.5, ring, step / 20)
        }

        for (const ring of rings) {
            drawRing(svg, color(ring), 1.0, ring, step / 2)
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

function evenOdd(n: number): "even" | "odd" {
    return n % 2 === 0 ? "even" : "odd"
}
