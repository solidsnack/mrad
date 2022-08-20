import React from "react"
import { isPresent } from "ts-is-present"

import { Viewer } from "./viewer"

export class SVG2PDF extends React.Component<
    { rows?: number; columns?: number; xmlDiagnostics?: boolean },
    { text: string; xmlError: string }
> {
    state = { text: "", xmlError: "" }
    static defaultProps = { rows: 20, columns: 80, xmlDiagnostics: true }

    readonly parser = new DOMParser()

    render() {
        const { rows, columns, xmlDiagnostics } = {
            ...SVG2PDF.defaultProps,
            ...this.props,
        }
        const { text, xmlError } = this.state
        const xmlMessage = `XML Parse Status: ${
            xmlError || (!!text ? "OK" : "Waiting...")
        }`

        return (
            <article>
                <section className="svg-input">
                    <form>
                        {xmlDiagnostics && <p>{xmlMessage}</p>}
                        <textarea
                            placeholder="enter SVG text"
                            cols={columns}
                            rows={rows}
                            value={text}
                            wrap="soft"
                            onChange={this.onTextChange}
                        />
                    </form>
                </section>
                {xmlError.length > 0 ? null : <Viewer svg={text} />}
            </article>
        )
    }

    onTextChange: React.FormEventHandler<HTMLTextAreaElement> = (event) => {
        let xmlError = ""
        const text = event.currentTarget.value

        if (text.length > 0) {
            // NB: This validates XML well-formedness, not SVG correctness.
            const parsed = this.parser.parseFromString(text, "image/svg+xml")
            const errors = parsed.getElementsByTagName("parsererror")

            if (errors.length > 0) {
                xmlError = "Incomplete or invalid XML."
                const err = errors[0].getElementsByTagName("div")[0]?.innerText
                if (isPresent(err)) xmlError = `Error: ${err}`
            }
        }

        this.setState({ text, xmlError })
    }
}
