"""tools/eisagogi/arxaia/despeckle.py — σβήνει τη ΒΡΩΜΙΑ στο κενό περιθώριο ενός χαρακτικού.
   python3 -I tools/eisagogi/arxaia/despeckle.py in.png out.png
   Καθαρή python (zlib + struct), κανένα πακέτο — όπως στην als-v675.
   Κανόνας: σκοτεινά κομμάτια (φωτεινότητα < 235) με εμβαδό < MIN ή που βρίσκονται ΕΞΩ από το
   πλαίσιο των μεγάλων κομματιών (+PAD) βάφονται στο χρώμα του φόντου. ⛔ Τίποτα μέσα στο πλαίσιο
   του θέματος δεν αγγίζεται: οι γραμμές σκίασης ενός χαρακτικού είναι μικρά κομμάτια ΚΟΝΤΑ στο πρόσωπο.
   Τυπώνει μία γραμμή: πόσα κομμάτια σβήστηκαν και πόσα pixel."""
import struct, sys, zlib


def read_png(path):
    data = open(path, 'rb').read()
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise SystemExit('⛔ δεν είναι PNG: ' + path)
    pos, idat, w = 8, b'', None
    while pos < len(data):
        n, = struct.unpack('>I', data[pos:pos + 4]); kind = data[pos + 4:pos + 8]; body = data[pos + 8:pos + 8 + n]
        if kind == b'IHDR':
            w, h, depth, ctype, _, _, inter = struct.unpack('>IIBBBBB', body)
            if depth != 8 or inter:
                raise SystemExit('⛔ μόνο 8-bit, χωρίς interlace (μετάτρεψε με sips -s format png)')
        elif kind == b'IDAT':
            idat += body
        pos += 12 + n
    ch = {0: 1, 2: 3, 4: 2, 6: 4}.get(ctype)
    if not ch:
        raise SystemExit('⛔ τύπος χρώματος %d δεν υποστηρίζεται' % ctype)
    raw, stride, out, prev = zlib.decompress(idat), w * ch, bytearray(), bytearray(w * ch)
    for y in range(h):
        f = raw[y * (stride + 1)]; line = bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for x in range(stride):
            a = line[x - ch] if x >= ch else 0; b = prev[x]; c = prev[x - ch] if x >= ch else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c; pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        out += line; prev = line
    return w, h, ctype, ch, out


def write_png(path, w, h, ctype, ch, px):
    stride = w * ch
    raw = b''.join(b'\x00' + bytes(px[y * stride:(y + 1) * stride]) for y in range(h))
    chunk = lambda k, b: struct.pack('>I', len(b)) + k + b + struct.pack('>I', zlib.crc32(k + b) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, ctype, 0, 0, 0))
                           + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))


def main(src, dst, dark=235, big_frac=0.002, pad=6, min_area=6):
    w, h, ctype, ch, px = read_png(src)
    lum = [px[i * ch] if ch < 3 else (px[i * ch] * 299 + px[i * ch + 1] * 587 + px[i * ch + 2] * 114) // 1000 for i in range(w * h)]
    seen = bytearray(w * h); comps = []
    for s in range(w * h):
        if seen[s] or lum[s] >= dark: continue
        stack, pts = [s], []; seen[s] = 1
        while stack:
            i = stack.pop(); pts.append(i); x, y = i % w, i // w
            for j in (i - 1 if x else -1, i + 1 if x < w - 1 else -1, i - w, i + w):
                if 0 <= j < w * h and not seen[j] and lum[j] < dark: seen[j] = 1; stack.append(j)
        comps.append(pts)
    big = [c for c in comps if len(c) >= big_frac * w * h]
    if not big:
        write_png(dst, w, h, ctype, ch, px); print('· κανένα μεγάλο κομμάτι — τίποτα δεν σβήστηκε'); return
    xs = [i % w for c in big for i in c]; ys = [i // w for c in big for i in c]
    x0, x1, y0, y1 = min(xs) - pad, max(xs) + pad, min(ys) - pad, max(ys) + pad
    light = sorted(lum[i] for i in range(0, w * h, 7) if lum[i] >= dark)
    bg = light[len(light) // 2] if light else 255
    gone = gpx = 0
    for c in comps:
        if c in big: continue
        out = all(not (x0 <= i % w <= x1 and y0 <= i // w <= y1) for i in c)
        if out or len(c) < min_area and all(not (x0 + pad <= i % w <= x1 - pad and y0 + pad <= i // w <= y1 - pad) for i in c):
            gone += 1; gpx += len(c)
            for i in c:
                for k in range(min(ch, 3)): px[i * ch + k] = bg
    write_png(dst, w, h, ctype, ch, px)
    print('✓ βρωμιά: %d κομμάτια (%d pixel) σβήστηκαν έξω από το θέμα [%d,%d]-[%d,%d]' % (gone, gpx, x0, y0, x1, y1))


if __name__ == '__main__':
    if len(sys.argv) != 3: raise SystemExit('χρήση: python3 -I despeckle.py in.png out.png')
    main(sys.argv[1], sys.argv[2])
