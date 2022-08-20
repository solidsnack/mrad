import { Svg } from "@svgdotjs/svg.js"

import { StyleInfo } from "./style"
import { PageSize } from "../pages"

/**
 * Create a centered draw area by nesting SVG elements and setting `x`, `y`,
 * `width`, `height` and `viewbox` values to establish a draw area with user
 * units that correspond to millimeters.
 */
export function setupContainer(
    svg: Svg,
    page: PageSize,
    style: StyleInfo
): Svg {
    const { width, height } = style
    const { x, y } = margins(page, style)

    if (x <= 0 || y <= 0)
        throw new Error(`Non-positive margin: ${JSON.stringify({ x, y })}`)
    if (!Number.isInteger(width) || !Number.isInteger(height))
        throw new Error(`Non-integer overall dimensions: ${width} ${height}`)

    const container = svg
        .size(`${page.width}mm`, `${page.height}mm`)
        // This `viewbox` declaration causes user units to be equivalent to
        // millimeters.
        .viewbox(`0 0 ${page.width} ${page.height}`)
        .nested()
        .x(x)
        .y(y)
        .size(width, height)
        .viewbox(-width / 2, -height / 2, width, height)

    return container
}

/**
 * Create two draw areas by nesting SVG elements and setting `x`, `y`,
 * `width`, `height` and `viewbox` values to establish a draw area with user
 * units that correspond to millimeters.
 */
export function setupSideBySideContainers(
    svg: Svg,
    page: PageSize,
    style: StyleInfo
): { left: Svg; right: Svg } {
    const { width, height } = style

    if (!Number.isInteger(width) || !Number.isInteger(height))
        throw new Error(`Non-integer overall dimensions: ${width} ${height}`)

    const halfWidth = page.width / 2
    const firstPane = margins({ ...page, width: halfWidth }, style)
    const secondPaneX = firstPane.x + halfWidth

    if (firstPane.x <= 0 || firstPane.y <= 0)
        throw new Error(`Non-positive margin: ${JSON.stringify(firstPane)}`)

    const container = svg
        .size(`${page.width}mm`, `${page.height}mm`)
        // This `viewbox` declaration causes user units to be equivalent to
        // millimeters.
        .viewbox(`0 0 ${page.width} ${page.height}`)

    const left = container
        .nested()
        .x(firstPane.x)
        .y(firstPane.y)
        .size(width, height)
        .viewbox(-width / 2, -height / 2, width, height)

    const right = container
        .nested()
        .x(secondPaneX)
        .y(firstPane.y)
        .size(width, height)
        .viewbox(-width / 2, -height / 2, width, height)

    return { left, right }
}

export function margins(
    page: PageSize,
    style: StyleInfo
): { x: number; y: number } {
    return {
        x: (page.width - style.width) / 2,
        y: (page.height - style.height) / 2,
    }
}
