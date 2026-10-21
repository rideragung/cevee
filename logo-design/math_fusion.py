"""
Perfect mathematical split vertex fusion.
"""
import subprocess

upper = """
    M 196 62
    C 176 38 146 26 116 26
    C 69.6 26 32 63.6 32 110
    C 32 133.2 41.4 154.2 56.6 169.4
    L 84.9 141.1
    C 76.8 133 72 122 72 110
    C 72 85.7 91.7 66 116 66
    C 134 66 149.6 77 157.6 93.4
    L 196 62
    Z
"""

# Lower piece:
# Shifted by 13px in x, 13px in y (gap = 18.4px):
# Start outer at (70, 182)
# L 136 248  (wait, let's keep apex within 230: so start outer at 64, 176 -> apex at 134, 246... wait!)
# Let's adjust apex so bbox stays within y=230!
# If apex y = 230:
# Line at 45°: y - x = 230 - 138 = 92.
# At x = 70, y = 70 + 92 = 162.
# So let's make sure the cut line is at y - x = 92:
# Let's write a small script to compute exact integer coordinates that hit y=230 apex!
