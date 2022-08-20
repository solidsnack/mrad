/* eslint-disable @typescript-eslint/no-explicit-any */

declare function blobStream(): any

declare function SVGtoPDF(...any: any[]): any

declare class PDFDocument {
    constructor(readonly options: any)
    pipe(any: any): any
    end(): void
}
