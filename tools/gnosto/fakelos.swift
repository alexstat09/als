// ══════════════════════════════════════════════════════════════════════
// Ο ΑΝΑΓΝΩΣΤΗΣ ΤΟΥ ΦΑΚΕΛΟΥ ΥΛΙΚΟΥ (PDFKit). Τον καλεί το tools/gnosto/source.js.
//   find  PDF N            → τα pageAtIndex όπου αρχίζει η «ΔΙΔΑΚΤΙΚΗ ΕΝΟΤΗΤΑ N»
//   page  PDF i            → page.string (ολόκληρη η σελίδα)
//   lines PDF i            → γραμμή-γραμμή: minX minY maxX maxY | κείμενο
//   rect  PDF i x y w h    → selection(for: rect).string
//   render PDF i x y w h out.png → ΕΙΚΟΝΑ του rect (×3) — για να ΔΕΙΣ τι τυπώνει
//                            το βιβλίο εκεί που το κείμενο του PDF είναι ύποπτο
//                            (κενό μέσα σε λέξη, «.» που είναι άνω τελεία).
// ⚠️ Το πλάτος ενός rect είναι ΜΕΤΡΗΣΗ ανά σελίδα, όχι κληρονομιά (als-v550/640):
// ένα rect που τελειώνει λίγο πριν από τη δεξιά άκρη ΤΡΩΕΙ σιωπηλά τον τελευταίο
// χαρακτήρα κάθε γραμμής. Γι' αυτό το source.js διασταυρώνει κάθε rect με το page.string.
// ══════════════════════════════════════════════════════════════════════
import PDFKit
import Foundation
import ImageIO

let a = CommandLine.arguments
guard a.count >= 3, let doc = PDFDocument(url: URL(fileURLWithPath: a[2])) else {
  FileHandle.standardError.write("usage: fakelos (find|page|lines|rect) PDF ...\n".data(using: .utf8)!); exit(2)
}
func page(_ i: Int) -> PDFPage {
  guard i >= 0, i < doc.pageCount, let p = doc.page(at: i) else {
    FileHandle.standardError.write("no page \(i)\n".data(using: .utf8)!); exit(3)
  }
  return p
}
switch a[1] {
case "find":
  let n = a[3]
  // «ΕΝΌΤΗΤΑ» με τόνο στο Ο — `[ΟΌ]`, αλλιώς μηδέν αποτελέσματα (als-v550).
  let re = try! NSRegularExpression(pattern: "ΔΙΔΑΚΤΙΚ[ΗΉ]\\s*\\n?\\s*ΕΝ[ΟΌ]ΤΗΤΑ\\s+" + n + "(?![0-9])", options: [])
  for i in 0..<doc.pageCount {
    let s = doc.page(at: i)?.string ?? ""
    if re.firstMatch(in: s, range: NSRange(s.startIndex..., in: s)) != nil { print(i) }
  }
case "page":
  print(page(Int(a[3])!).string ?? "", terminator: "")
case "lines":
  let p = page(Int(a[3])!)
  if let sel = p.selection(for: p.bounds(for: .mediaBox)) {
    for l in sel.selectionsByLine() {
      let b = l.bounds(for: p)
      let t = (l.string ?? "").replacingOccurrences(of: "\n", with: "⏎")
      print(String(format: "%6.1f %6.1f %6.1f %6.1f | ", b.minX, b.minY, b.maxX, b.maxY) + t)
    }
  }
case "rect":
  let p = page(Int(a[3])!)
  let r = CGRect(x: Double(a[4])!, y: Double(a[5])!, width: Double(a[6])!, height: Double(a[7])!)
  print(p.selection(for: r)?.string ?? "", terminator: "")
case "render":
  let p = page(Int(a[3])!)
  let r = CGRect(x: Double(a[4])!, y: Double(a[5])!, width: Double(a[6])!, height: Double(a[7])!)
  let k: CGFloat = 3
  guard let ctx = CGContext(data: nil, width: Int(r.width * k), height: Int(r.height * k), bitsPerComponent: 8,
                            bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(),
                            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { exit(4) }
  ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
  ctx.fill(CGRect(x: 0, y: 0, width: r.width * k, height: r.height * k))
  ctx.scaleBy(x: k, y: k)
  ctx.translateBy(x: -r.minX, y: -r.minY)
  p.draw(with: .mediaBox, to: ctx)
  guard let img = ctx.makeImage(),
        let dst = CGImageDestinationCreateWithURL(URL(fileURLWithPath: a[8]) as CFURL, "public.png" as CFString, 1, nil) else { exit(4) }
  CGImageDestinationAddImage(dst, img, nil)
  if !CGImageDestinationFinalize(dst) { exit(4) }
default:
  exit(2)
}
