"""Deduplicate identical images in our Chromium PDFs; keep Form streams separate.

Requires PyMuPDF. Run after print-bundles.mjs. No image downsampling or font
flattening. Aggressive whole-stream deduplication can break Form resources.
"""
import hashlib
from pathlib import Path
import re
import shutil
import fitz

ROOT = Path(__file__).resolve().parents[1]
JOBS = {'stadse-speurtochten': 19, 'nacht-in-stad': 6,
        'moord-in-de-martini': 18, 'martinitoren': 6,
        'winterwelvaart': 11, 'noorderzon': 10, 'print': 56}
REF = re.compile(r'(?<!\d)(\d+) 0 R')


def optimize(raw, output, pages):
    source = fitz.open(raw)
    assert len(source) == pages
    original_text = [page.get_text() for page in source]
    objects = {x: source.xref_object(x) for x in range(1, source.xref_length())}
    images = {x: hashlib.sha256(source.xref_stream_raw(x)).digest()
              for x in objects if source.xref_get_key(x, 'Subtype')[1] == '/Image'}
    refs = {}

    def canonical(xref):
        while xref in refs:
            xref = refs[xref]
        return xref

    def replace(text):
        return REF.sub(lambda m: f'{canonical(int(m[1]))} 0 R', text)

    # First share identical masks, then identical colour images using those masks.
    for _ in range(3):
        seen, changes = {}, 0
        for xref, digest in images.items():
            if xref in refs:
                continue
            key = (replace(objects[xref]), digest)
            if key in seen:
                refs[xref] = seen[key]
                changes += 1
            else:
                seen[key] = xref
        if not changes:
            break
    # Change references in dictionaries in place. update_object() would discard
    # an existing stream, so use xref_set_key() to preserve the image/Form bytes.
    for xref, text in objects.items():
        if not text.lstrip().startswith('<<'):
            continue
        for key in source.xref_get_keys(xref):
            kind, value = source.xref_get_key(xref, key)
            if kind not in ('xref', 'dict', 'array'):
                continue
            rewritten = replace(value)
            if rewritten != value:
                source.xref_set_key(xref, key, rewritten)
    candidate = Path('/tmp') / (output.stem + '-cast-safe.pdf')
    source.save(candidate, garbage=3, deflate=True)
    source.close()
    source, result = fitz.open(raw), fitz.open(candidate)
    assert len(result) == pages
    assert [page.get_text() for page in result] == original_text
    assert all(page.rect.width > page.rect.height for page in result)
    assert candidate.stat().st_size < 32 * 1024 * 1024
    # Shared-image caching may change subpixel interpolation slightly. Check every
    # page for missing artwork or text, allowing only small rasterization changes.
    for index in range(pages):
        a = source[index].get_pixmap(matrix=fitz.Matrix(.3, .3)).samples
        b = result[index].get_pixmap(matrix=fitz.Matrix(.3, .3)).samples
        assert len(a) == len(b)
        delta = [abs(x-y) for x, y in zip(a, b)]
        assert sum(delta)/len(delta) < 1, (output.name, index, 'mean difference')
        assert max(delta) < 32, (output.name, index, 'missing artwork')
    source.close()
    result.close()
    shutil.copyfile(candidate, output)
    print(output.name, pages, 'pages;', round(output.stat().st_size/1024/1024, 2),
          'MiB; text and all-page artwork checks passed', flush=True)


if __name__ == '__main__':
    for name, pages in JOBS.items():
        optimize(Path('/tmp') / f'grunndoku-{name}-cast.pdf',
                 ROOT / f'grunndoku-{name}.pdf', pages)
    for name in ['print', 'nacht-in-stad']:
        shutil.copyfile(ROOT / f'grunndoku-{name}.pdf',
                        ROOT.parent / 'grunmurdoku' / f'grunmurdoku-{name}.pdf')
