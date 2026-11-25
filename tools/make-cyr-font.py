# Builds public/fonts/CyrFallback.woff2: Balsamiq Sans Bold (OFL), Cyrillic + punctuation only,
# condensed so it sits next to the game's Latin font (Ander Hedge). usage: python -I make-cyr-font.py <src.ttf> <out.woff2> [sx] [sy]
import sys
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

src, out = sys.argv[1], sys.argv[2]
sx = float(sys.argv[3]) if len(sys.argv) > 3 else 0.84
sy = float(sys.argv[4]) if len(sys.argv) > 4 else 0.92
f = TTFont(src)
opts = subset.Options(); opts.flavor = None; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
sub = subset.Subsetter(opts)
ranges = list(range(0x0400, 0x0530)) + [0x00AB, 0x00BB, 0x2014, 0x2013, 0x2026, 0x2116, 0x2019, 0x201C, 0x201D, 0x02BC]
sub.populate(unicodes=ranges)
sub.subset(f)
gs = f.getGlyphSet(); glyf = f['glyf']; hmtx = f['hmtx']
for name in f.getGlyphOrder():
    g = glyf[name]
    if g.numberOfContours != 0:
        pen = TTGlyphPen(gs)
        gs[name].draw(TransformPen(pen, (sx, 0, 0, sy, 0, 0)))
        glyf[name] = pen.glyph()
    w, lsb = hmtx[name]
    hmtx[name] = (int(round(w * sx)), int(round(lsb * sx)))
f['name'].setName('Cyrillic Fallback', 1, 3, 1, 0x409)
f.flavor = 'woff2'
f.save(out)
print('ok', len(f.getGlyphOrder()), 'glyphs')
