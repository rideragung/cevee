"""
Create comparison sheet showing Concept A, Concept C, and Concept Fusion AC.
"""
import subprocess

cmd = [
    "python", ".agents/skills/logo-design/scripts/concept_sheet.py",
    "logo-design/concept-a-symbol.svg",
    "logo-design/concept-c-symbol.svg",
    "logo-design/concept-fusion-symbol.svg",
    "--lockups",
    "logo-design/concept-a-lockup.svg",
    "logo-design/concept-c-lockup.svg",
    "logo-design/concept-fusion-lockup.svg",
    "--names",
    "A · Monogram Vertex",
    "C · Dual Caliper",
    "AC · Caliper Vertex (Fusion)",
    "--notes",
    "Pita tunggal kontinu C + V (bentuk menyatu).",
    "Dua elemen modular: braket C + chevron pemindai maju.",
    "Fusi A & C: siluet monogram C+V dengan celah presisi kaliper modular.",
    "--title",
    "Cevee — Evaluasi Konsep A, C & Fusion",
    "--recommend",
    "3",
    "--greyscale",
    "-o",
    "logo-design/comparison-ac.png"
]

subprocess.run(cmd, check=True)
print("Generated comparison sheet!")
