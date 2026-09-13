"""Generate web assets from originals: python scripts/optimize_images.py (Pillow)."""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]


def main():
    report = []
    for source in sorted((ROOT / 'src/assets').rglob('*')):
        if source.suffix.lower() not in {'.jpg', '.jpeg', '.png'}:
            continue
        with Image.open(source) as original:
            picture = ImageOps.exif_transpose(original).convert('RGBA')
            # Keep enough detail for retina screens without shipping oversized art.
            limit = 1200 if source.stem.startswith('logo') else 1920
            picture.thumbnail((limit, limit), Image.Resampling.LANCZOS)
            destination = source.with_suffix('.webp')
            picture.save(destination, 'WEBP', quality=85, method=6)
            with Image.open(destination) as check:
                check.load()
                assert check.size == picture.size
            report.append({'source': source.relative_to(ROOT).as_posix(),
                           'before': source.stat().st_size,
                           'after': destination.stat().st_size})
    print(json.dumps(report, indent=2))
    before = sum(item['before'] for item in report)
    after = sum(item['after'] for item in report)
    print(f'{len(report)} images: {before:,} -> {after:,} bytes ({1-after/before:.1%} smaller)')


if __name__ == '__main__':
    main()
