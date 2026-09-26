import Foundation
import Vision
import AppKit
import PDFKit

guard CommandLine.arguments.count == 2 else { exit(2) }
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let ext = url.pathExtension.lowercased()

func recognize(_ image: CGImage) -> String {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    do {
        try VNImageRequestHandler(cgImage: image).perform([request])
        return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
    } catch { return "" }
}

if ext == "pdf" {
    guard let document = PDFDocument(url: url) else { exit(3) }
    var pages: [String] = []
    for index in 0..<min(document.pageCount, 30) {
        guard let page = document.page(at: index) else { continue }
        let text = page.string?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if !text.isEmpty { pages.append(text) }
        else {
            let thumbnail = page.thumbnail(of: NSSize(width: 1800, height: 2400), for: .mediaBox)
            var rect = CGRect(origin: .zero, size: thumbnail.size)
            if let cgImage = thumbnail.cgImage(forProposedRect: &rect, context: nil, hints: nil) { pages.append(recognize(cgImage)) }
        }
    }
    if document.pageCount > 30 { pages.append("[PDF extraction limited to the first 30 pages]") }
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
