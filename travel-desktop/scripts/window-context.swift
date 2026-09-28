import Foundation
import AppKit
import ApplicationServices

func emit(_ value: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: value),
          let json = String(data: data, encoding: .utf8) else { exit(3) }
    print(json)
}

guard CommandLine.arguments.count == 3,
      let windowNumber = UInt32(CommandLine.arguments[2]) else { exit(2) }

let mode = CommandLine.arguments[1]
guard mode == "identity" || mode == "read" else { exit(2) }

let windows = (CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]]) ?? []
guard let info = windows.first(where: { ($0[kCGWindowNumber as String] as? NSNumber)?.uint32Value == windowNumber }),
      let pid = (info[kCGWindowOwnerPID as String] as? NSNumber)?.int32Value else {
    emit(["status": "gone"])
    exit(0)
}

let owner = info[kCGWindowOwnerName as String] as? String ?? "External app"
let title = info[kCGWindowName as String] as? String ?? ""
if mode == "identity" {
    emit(["status": "available", "pid": pid, "owner": owner, "title": title])
    exit(0)
}

guard AXIsProcessTrusted() else {
    emit(["status": "permission-needed", "pid": pid, "owner": owner, "title": title])
    exit(0)
}

func attribute(_ element: AXUIElement, _ name: CFString) -> CFTypeRef? {
    var result: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, name, &result) == .success else { return nil }
    return result
}

func text(_ element: AXUIElement, _ name: CFString) -> String {
    return attribute(element, name) as? String ?? ""
}

let application = AXUIElementCreateApplication(pid)
guard let candidates = attribute(application, kAXWindowsAttribute as CFString) as? [AXUIElement],
      !candidates.isEmpty else {
    emit(["status": "unavailable", "pid": pid, "owner": owner, "title": title])
    exit(0)
}

let selected = candidates.first { text($0, kAXTitleAttribute as CFString) == title }
    ?? (candidates.count == 1 ? candidates[0] : nil)
guard let selected else {
    emit(["status": "ambiguous", "pid": pid, "owner": owner, "title": title])
    exit(0)
}

var collected: [String] = []
var visited = 0
var length = 0
func webArea(_ element: AXUIElement, depth: Int) -> AXUIElement? {
    if depth > 8 { return nil }
    if text(element, kAXRoleAttribute as CFString) == "AXWebArea" { return element }
    if let children = attribute(element, kAXChildrenAttribute as CFString) as? [AXUIElement] {
        for child in children {
            if let found = webArea(child, depth: depth + 1) { return found }
        }
    }
    return nil
}
func walk(_ element: AXUIElement, depth: Int) {
    if visited >= 250 || depth > 7 || length >= 6000 { return }
    visited += 1
    let role = text(element, kAXRoleAttribute as CFString)
    if role == "AXSecureTextField" { return }
    if role == "AXTextArea" || role == "AXTextField" || role == "AXStaticText" {
        let value = text(element, kAXValueAttribute as CFString).trimmingCharacters(in: .whitespacesAndNewlines)
        if !value.isEmpty && !collected.contains(value) {
            let bounded = String(value.prefix(max(0, 6000 - length)))
            collected.append(bounded)
            length += bounded.count
        }
    }
    if let children = attribute(element, kAXChildrenAttribute as CFString) as? [AXUIElement] {
        for child in children { walk(child, depth: depth + 1) }
    }
}
// Browser chrome can contain addresses and names of other tabs. Read only the
// active page subtree. If it is inaccessible, use the capture/OCR fallback.
let browserOwners = ["Google Chrome", "Safari", "Microsoft Edge", "Brave Browser", "Firefox"]
if browserOwners.contains(owner) {
    if let page = webArea(selected, depth: 0) { walk(page, depth: 0) }
} else {
    walk(selected, depth: 0)
}
emit(["status": collected.isEmpty ? "empty" : "readable", "pid": pid, "owner": owner, "title": title, "text": collected.joined(separator: "\n")])
