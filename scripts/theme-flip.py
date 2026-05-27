"""
One-shot dark→light Sasico-style restyle.

Walks all .tsx files under app/(app)/ and components/ (excluding components/landing/
which is already authored in light Sasico style) and rewrites dark Tailwind utility
patterns to their light bone/ink/signal equivalents.

Run from repo root:  python scripts/theme-flip.py
"""

from __future__ import annotations
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (pattern, replacement) — applied in order. Order matters: most specific first.
SUBS: list[tuple[str, str]] = [
    # ── text colors ─────────────────────────────────────────────
    (r"text-bone-100\b", "text-ink-300"),
    (r"text-white/15\b", "text-ink-300/30"),
    (r"text-white/20\b", "text-ink-300/35"),
    (r"text-white/25\b", "text-ink-300/40"),
    (r"text-white/30\b", "text-ink-300/45"),
    (r"text-white/35\b", "text-ink-300/45"),
    (r"text-white/40\b", "text-ink-300/50"),
    (r"text-white/45\b", "text-ink-300/55"),
    (r"text-white/50\b", "text-ink-300/60"),
    (r"text-white/55\b", "text-ink-300/65"),
    (r"text-white/60\b", "text-ink-300/70"),
    (r"text-white/65\b", "text-ink-300/75"),
    (r"text-white/70\b", "text-ink-300/80"),
    (r"text-white/75\b", "text-ink-300/85"),
    (r"text-white/80\b", "text-ink-300/85"),
    (r"text-white/85\b", "text-ink-300/90"),
    (r"text-white/90\b", "text-ink-300/95"),
    (r"text-white(?![/\w-])", "text-ink-300"),

    # ── bg-white/[0.0X] glassy tints ────────────────────────────
    (r"bg-white/\[0\.01\]",  "bg-bone-50/40"),
    (r"bg-white/\[0\.014\]", "bg-bone-50/40"),
    (r"bg-white/\[0\.015\]", "bg-bone-50/50"),
    (r"bg-white/\[0\.018\]", "bg-bone-50/50"),
    (r"bg-white/\[0\.02\]", "bg-bone-50/60"),
    (r"bg-white/\[0\.03\]", "bg-bone-50"),
    (r"bg-white/\[0\.04\]", "bg-bone-100/70"),
    (r"bg-white/\[0\.05\]", "bg-bone-100"),
    (r"bg-white/\[0\.06\]", "bg-bone-200/60"),
    (r"bg-white/\[0\.08\]", "bg-bone-200/80"),
    (r"bg-white/\[0\.1\]",  "bg-bone-200"),
    (r"bg-white/\[0\.12\]", "bg-bone-200"),

    # ── border-white/[0.0X] hairlines ──────────────────────────
    (r"border-white/\[0\.02\]", "border-bone-300/35"),
    (r"border-white/\[0\.03\]", "border-bone-300/40"),
    (r"border-white/\[0\.04\]", "border-bone-300/45"),
    (r"border-white/\[0\.06\]", "border-bone-300/55"),
    (r"border-white/\[0\.08\]", "border-bone-300/65"),
    (r"border-white/\[0\.1\]",  "border-bone-300/75"),
    (r"border-white/\[0\.12\]", "border-bone-300/80"),
    (r"border-white/\[0\.14\]", "border-bone-300/85"),
    (r"border-white/\[0\.15\]", "border-bone-300/85"),
    (r"border-white/15\b",      "border-bone-300/80"),

    # ── ring colors ─────────────────────────────────────────────
    (r"ring-white/10\b", "ring-bone-300/60"),
    (r"ring-white/15\b", "ring-bone-300/70"),
    (r"ring-ink-200\b",  "ring-white"),

    # ── divide ──────────────────────────────────────────────────
    (r"divide-white/\[0\.04\]", "divide-bone-300/45"),
    (r"divide-white/\[0\.06\]", "divide-bone-300/55"),
    (r"divide-white/\[0\.08\]", "divide-bone-300/65"),

    # ── gradient stops ──────────────────────────────────────────
    (r"via-white/\[0\.04\]", "via-ink-300/10"),
    (r"from-white/\[0\.04\]", "from-ink-300/10"),
    (r"to-white/\[0\.04\]",   "to-ink-300/10"),

    # ── ink-XX surfaces that were "dark cards / panels" ─────────
    # (Landing files use bg-ink-300 intentionally for dark accents — those
    # are excluded by directory filter, so this is safe.)
    (r"bg-ink-100/95\b", "bg-white/95"),
    (r"bg-ink-100/60\b", "bg-white/80"),
    (r"bg-ink-100\b",    "bg-white"),
    (r"bg-ink-200/30\b", "bg-bone-50/70"),
    (r"bg-ink-200/40\b", "bg-bone-50"),
    (r"bg-ink-200/60\b", "bg-bone-100"),
    (r"bg-ink-200\b",    "bg-white"),

    # ── overlay scrims (backdrops) — keep dark for contrast ────
    (r"bg-ink-500/70\b", "bg-ink-300/40"),
    (r"bg-ink-500/60\b", "bg-ink-300/35"),

    # ── gradient endpoints in dark panels ──────────────────────
    (r"from-ink-100\b", "from-white"),
    (r"to-ink-100\b",   "to-white"),
    (r"from-ink-200\b", "from-bone-50"),
    (r"to-ink-200\b",   "to-bone-50"),
    (r"from-ink-300\b", "from-bone-100"),
    (r"to-ink-300\b",   "to-bone-100"),
]

EXCLUDE_DIRS = {
    str(ROOT / "components" / "landing"),
}

def should_skip(path: Path) -> bool:
    p = str(path.resolve())
    return any(p.startswith(d) for d in EXCLUDE_DIRS)

def collect_files() -> list[Path]:
    files: list[Path] = []
    for sub in ["app", "components"]:
        for p in (ROOT / sub).rglob("*.tsx"):
            if should_skip(p):
                continue
            files.append(p)
    return files

def apply_subs(text: str) -> tuple[str, int]:
    n = 0
    for pat, rep in SUBS:
        new, c = re.subn(pat, rep, text)
        n += c
        text = new
    return text, n

def main():
    files = collect_files()
    total = 0
    touched = 0
    for f in files:
        try:
            src = f.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            print(f"skip (encoding): {f}")
            continue
        out, n = apply_subs(src)
        if n > 0:
            f.write_text(out, encoding="utf-8", newline="\n")
            total += n
            touched += 1
            print(f"{n:>4}  {f.relative_to(ROOT)}")
    print(f"\n=== {total} substitutions across {touched} files ===")

if __name__ == "__main__":
    main()
