import Foundation
import Vision
import AppKit
import PDFKit

guard CommandLine.arguments.count == 2 else { exit(2) }
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let ext = url.pathExtension.lowercased()

if ext == "pdf" {
    guard let document = PDFDocument(url: url) else { exit(3) }
    var pages: [String] = []
    for index in 0..<document.pageCount {
        if let text = document.page(at: index)?.string { pages.append(text) }
    }
    print(pages.joined(separator: "\n"))
    exit(0)
}

guard let image = NSImage(contentsOf: url),
      let data = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: data),
      let cgImage = bitmap.cgImage else { exit(3) }

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = true
do {
    try VNImageRequestHandler(cgImage: cgImage).perform([request])
    let lines = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
    print(lines.joined(separator: "\n"))
} catch { fputs("Vision OCR error: \(error)\n", stderr); exit(4) }
