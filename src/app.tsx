import React from "react"

import { PageSize, sizes } from "./pages"
import { Viewer } from "./svg2pdf/viewer"
import { margins, StyleInfo, styles } from "./graphics"
import { isKey } from "./utils"

type State = {
    page: keyof typeof sizes
    style: keyof typeof styles
}

export class App extends React.Component<{ scratchPad: HTMLElement }, State> {
    state = { page: "a4", style: "grayCircle20" } as State

    render() {
        const { size, style } = this
        const margin = margins(size, style)
        return (
            <article className="mrad">
                <section className="selections">
                    <form>
                        <label>
                            Page Size
                            <select
                                name="page"
                                value={this.state.page}
                                onChange={this.onPageChange}
                            >
                                {Object.entries(sizes).map(([name, size]) => (
                                    <option key={name} value={name}>
                                        {size.description}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Style
                            <select
                                name="style"
                                value={this.state.style}
                                onChange={this.onStyleChange}
                            >
                                {Object.entries(styles).map(
                                    ([name, style]) => {
                                        const desc =
                                            style.description +
                                            (styleFitsPage(this.size, style)
                                                ? ""
                                                : " *")
                                        return (
                                            <option key={name} value={name}>
                                                {desc}
                                            </option>
                                        )
                                    }
                                )}
                            </select>
                        </label>
                        <p>
                            Styles with an asterisk are not available for the
                            current page size.
                        </p>
                        <p>
                            Computed margins: &nbsp;{margin.x.toFixed(2)}mm
                            (left, right) &nbsp;{margin.y.toFixed(2)}mm (top,
                            bottom)
                        </p>
                    </form>
                </section>
                {this.renderView()}
            </article>
        )
    }

    get style(): StyleInfo {
        return styles[this.state.style]
    }

    get size(): PageSize {
        return sizes[this.state.page]
    }

    private renderView() {
        const { size, style } = this
        if (!styleFitsPage(size, style)) {
            return (
                <section className="error-in-graphic">
                    <p>
                        The graphic is a little too large and would be too
                        close to the margin for the size of paper that has been
                        chosen.
                    </p>
                </section>
            )
        }

        try {
            return <Viewer svg={this.renderSVGInDrawArea()} />
        } catch (e) {
            const message = e instanceof Error ? e.stack || e.message : `${e}`
            return (
                <section className="error-in-graphic">
                    <p>There was an error while generating the graphic.</p>
                    <pre>{message}</pre>
                </section>
            )
        }
    }

    onPageChange: React.FormEventHandler<HTMLSelectElement> = (event) => {
        const page = event.currentTarget.value
        if (!isKey(page, sizes)) throw new Error(`Invalid size: ${page}`)
        this.setState({ page })
    }

    onStyleChange: React.FormEventHandler<HTMLSelectElement> = (event) => {
        const style = event.currentTarget.value
        if (!isKey(style, styles)) throw new Error(`Invalid style: ${style}`)
        this.setState({ style })
    }

    private renderSVGInDrawArea() {
        const { size, style } = this
        const { scratchPad } = this.props

        const renderer = new style()

        scratchPad.replaceChildren()
        renderer.draw(size, scratchPad)

        return scratchPad.innerHTML
    }
}

function styleFitsPage(size: PageSize, style: StyleInfo) {
    const { x, y } = margins(size, style)
    return x >= 5 && y >= 5
}
