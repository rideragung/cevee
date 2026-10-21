"""
Testing geometric constructions for Cevee logo concepts.
"""
import os
import subprocess

def create_svg(path, content, size=256):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">
{content}
</svg>'''
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)

# Let's explore Concept A variants:
# Variant A1: Pure geometric C with nested V chevron
# Outer C: thick arc from 45 deg to 315 deg, thickness = 40.
# Inner V: chevron nestled in the opening.

# Variant A2: Continuous ribbon C-V monogram.
# Starts at (192, 64) -> curves around left (48, 128) -> curves to bottom (128, 208) ->
# angles up to (176, 144) -> angles down to (208, 176) etc.

# Variant A3: Octagonal / 45-degree chamfered C with an embedded V.

# Let's test these three in SVG code!
