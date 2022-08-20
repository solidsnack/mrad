import { PageSize } from "../pages"

export interface StyleInfo {
    /** Width millimeters. */
    width: number
    /** Height millimeters. */
    height: number
    /** Short description (50 characters or less) of style. */
    description: string
    new (): Style
}

export interface Style {
    draw(page: PageSize, element: HTMLElement): void
}
