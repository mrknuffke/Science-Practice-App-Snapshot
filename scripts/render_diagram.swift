import Cocoa
import WebKit

// Usage:
//   swift scripts/render_diagram.swift <input.html> <output.png> <width> <height> [scale]
//
// Arguments:
//   input.html  - Path to HTML/SVG file to render
//   output.png  - Destination path for the high-res PNG
//   width       - Viewport width in CSS points (e.g. 800)
//   height      - Viewport height in CSS points (e.g. 400)
//   scale       - Retina scale multiplier (default: 2.0)

let arguments = CommandLine.arguments
guard arguments.count >= 5 else {
    print("Usage: swift render_diagram.swift <input.html> <output.png> <width> <height> [scale]")
    exit(1)
}

let inputPath = (arguments[1] as NSString).expandingTildeInPath
let outputPath = (arguments[2] as NSString).expandingTildeInPath
let width = Double(arguments[3]) ?? 800.0
let height = Double(arguments[4]) ?? 400.0
let scale: CGFloat = arguments.count > 5 ? CGFloat(Double(arguments[5]) ?? 2.0) : 2.0

let app = NSApplication.shared

class RenderDelegate: NSObject, WKNavigationDelegate {
    let outputPath: String
    let scale: CGFloat
    let width: Double
    let height: Double
    
    init(outputPath: String, scale: CGFloat, width: Double, height: Double) {
        self.outputPath = outputPath
        self.scale = scale
        self.width = width
        self.height = height
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Wait 0.5s for web fonts and SVG rendering to settle
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            let config = WKSnapshotConfiguration()
            config.snapshotWidth = NSNumber(value: self.width * Double(self.scale))
            
            webView.takeSnapshot(with: config) { image, error in
                guard let image = image, error == nil else {
                    print("Snapshot error: \(String(describing: error))")
                    exit(1)
                }
                
                guard let tiffData = image.tiffRepresentation,
                      let bitmap = NSBitmapImageRep(data: tiffData),
                      let pngData = bitmap.representation(using: .png, properties: [:]) else {
                    print("Failed to convert image to PNG")
                    exit(1)
                }
                
                do {
                    let outputURL = URL(fileURLWithPath: self.outputPath)
                    let parentDir = outputURL.deletingLastPathComponent()
                    try FileManager.default.createDirectory(at: parentDir, withIntermediateDirectories: true)
                    try pngData.write(to: outputURL)
                    print("✓ Saved high-res PNG (\(Int(self.width * Double(self.scale)))x\(Int(self.height * Double(self.scale)))px) to \(self.outputPath)")
                    exit(0)
                } catch {
                    print("Write error: \(error)")
                    exit(1)
                }
            }
        }
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("Navigation error: \(error)")
        exit(1)
    }
}

let config = WKWebViewConfiguration()
let webView = WKWebView(frame: NSRect(x: 0, y: 0, width: width, height: height), configuration: config)

// Support alpha transparency if the HTML has background: transparent
webView.setValue(false, forKey: "drawsBackground")

let delegate = RenderDelegate(outputPath: outputPath, scale: scale, width: width, height: height)
webView.navigationDelegate = delegate

let fileURL = URL(fileURLWithPath: (inputPath as NSString).isAbsolutePath ? inputPath : FileManager.default.currentDirectoryPath + "/" + inputPath)
webView.loadFileURL(fileURL, allowingReadAccessTo: fileURL.deletingLastPathComponent())

RunLoop.main.run()
