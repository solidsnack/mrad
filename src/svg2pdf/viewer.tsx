// import blobStream from "blob-stream"
// import PDFDocument from "pdfkit"
import React from "react"
import { isPresent } from "ts-is-present"
// import SVGtoPDF from "svg-to-pdfkit"

const svgType = "image/svg+xml"
const pdfType = "application/pdf"

export class Viewer extends React.Component<{ svg: string }> {
    readonly parser = new DOMParser()
    readonly svgRenderPane = React.createRef<HTMLObjectElement>()
    readonly pdfRenderPane = React.createRef<HTMLObjectElement>()
    readonly blobsToFree: Set<string> = new Set()

    render() {
        const svgBlob = this.svgBlob()
        return (
            <section className="viewer">
                <section className="svg-panel">
                    <div>
                        <object
                            data={svgBlob}
                            type={svgType}
                            ref={this.svgRenderPane}
                            onLoad={this.onSVGLoad.bind(this)}
                            style={{
                                padding: 0,
                                margin: 0,
                                border: "none",
                            }}
                        />
                    </div>
                </section>
                <section className="pdf-panel">
                    <div>
                        <object
                            type={pdfType}
                            ref={this.pdfRenderPane}
                            style={{
                                padding: 0,
                                margin: 0,
                                border: "none",
                            }}
                        />
                    </div>
                </section>
            </section>
        )
    }

    svgBlob() {
        const { svg } = this.props
        if (svg.length <= 0) return
        const svgBlob = svgData(svg)
        this.blobsToFree.add(svgBlob)
        return svgBlob
    }

    async pdfBlob() {
        const svgRoot =
            this.svgRenderPane.current?.contentDocument?.documentElement

        if (!isPresent(svgRoot)) throw new Error("No SVG element?")
        if (svgRoot.tagName !== "svg") throw new Error("No SVG element?")

        const pdfBlob = await pdfData(svgRoot as unknown as SVGSVGElement)
        this.blobsToFree.add(pdfBlob)
        return pdfBlob
    }

    componentWillUnmount() {
        const sorted = Array.from(this.blobsToFree).sort()
        console.log(`Freeing blobs on unmount: ${sorted.join(" ")}`)
        for (const blob of sorted) URL.revokeObjectURL(blob)
    }

    onSVGLoad() {
        const pdfObject = this.pdfRenderPane.current
        const svgObject = this.svgRenderPane.current
        const svgRoot = svgObject?.contentDocument?.documentElement

        // TODO: contentDocument.documentElement does not work on Safari.

        if (!isPresent(pdfObject)) throw new Error("No PDF <object/>?!?!?!?!")
        if (!isPresent(svgObject)) return
        if (!isPresent(svgRoot)) return
        if (svgRoot.tagName !== "svg") return

        const { width, height } = svgObject.getBoundingClientRect()
        pdfObject.width = `${width}`
        pdfObject.height = `${height}`

        this.pdfBlob()
            .then((blob) => {
                pdfObject.data = blob
            })
            .catch((err) => console.error(`Failed to render PDF: ${err}`))
    }
}

function svgData(svgText: string): string {
    const blob = new Blob([svgText], { type: svgType })
    return URL.createObjectURL(blob)
}

function svgDimensionsInPoints(svg: SVGSVGElement): {
    width: number
    height: number
} {
    const points = SVGLength.SVG_LENGTHTYPE_PT
    const copy = svg.cloneNode(false) as SVGSVGElement
    copy.width.baseVal.convertToSpecifiedUnits(points)
    copy.height.baseVal.convertToSpecifiedUnits(points)
    return {
        width: copy.width.baseVal.valueInSpecifiedUnits,
        height: copy.height.baseVal.valueInSpecifiedUnits,
    }
}

async function pdfData(svg: SVGSVGElement): Promise<string> {
    return new Promise((resolve, reject) => {
        const { width, height } = svgDimensionsInPoints(svg)
        const doc = new PDFDocument({
            margin: 0,
            size: [width, height],
        })
        const stream = blobStream()

        // Setup stream to forward results or errors, as appropriate.
        stream.on("finish", () => resolve(stream.toBlobURL(pdfType)))
        stream.on("error", reject)

        // Convert SVG commands to PDF commands.
        try {
            SVGtoPDF(doc, svg)
        } catch (e) {
            reject(e)
        }

        // Render PDF to stream.
        doc.pipe(stream)
        doc.end()
    })
}
