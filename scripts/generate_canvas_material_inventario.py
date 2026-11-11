"""Dibuja materiales/gemini_canvas/inventario_laboratorio.png (material del ejercicio 11C).

Imagen de práctica: una tabla de inventario escrita a mano en una hoja de cuaderno. Las cifras deben
coincidir con los criterios del ejercicio 11C en js/canvas-exercises.js (lo comprueba
tests/canvas-exercise-facts.test.cjs).

Uso: python scripts/generate_canvas_material_inventario.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent
OUT = BASE_DIR / "materiales" / "gemini_canvas" / "inventario_laboratorio.png"

INVENTARIO = [
    ("Cable UTP (rollos)", 6, 4),
    ("Conector RJ45", 35, 50),
    ("Router", 4, 3),
    ("Switch 8 puertos", 2, 3),
    ("Cinta aislante", 9, 5),
    ("Etiquetas", 0, 20),
]

PAPER, RULE, MARGIN, INK, BLUE, RED = "#fbf8ee", "#c9d6ea", "#d99a9a", "#262626", "#2a4db0", "#b32a2a"


def font(size):
    for name in ("Inkfree.ttf", "segoepr.ttf", "comic.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    w, h = 1200, 1000
    img = Image.new("RGB", (w, h), PAPER)
    d = ImageDraw.Draw(img)
    for y in range(120, h, 48):
        d.line([(0, y), (w, y)], fill=RULE, width=2)
    d.line([(110, 0), (110, h)], fill=MARGIN, width=3)

    d.text((160, 36), "Inventario del laboratorio de redes", fill=INK, font=font(52))
    d.text((160, 108), "Conteo del 12 de noviembre", fill=BLUE, font=font(30))

    x0, x1, x2, x3 = 150, 650, 850, 1070
    top = 190
    for x, texto in ((x0 + 10, "Insumo"), (x1 + 10, "Cantidad"), (x2 + 10, "Mínimo")):
        d.text((x, top), texto, fill=INK, font=font(36))
    d.line([(x0, top + 54), (x3, top + 54)], fill=INK, width=3)

    y = top + 70
    for nombre, cantidad, minimo in INVENTARIO:
        d.text((x0 + 10, y), nombre, fill=BLUE, font=font(34))
        d.text((x1 + 40, y), str(cantidad), fill=INK, font=font(34))
        d.text((x2 + 40, y), str(minimo), fill=INK, font=font(34))
        if cantidad < minimo:
            d.ellipse([x1 + 12, y - 4, x1 + 112, y + 46], outline=RED, width=3)
        y += 84
    for x in (x0, x1, x2, x3):
        d.line([(x, top), (x, y - 20)], fill=INK, width=3)
    d.line([(x0, y - 20), (x3, y - 20)], fill=INK, width=3)

    d.text((x0, y + 10), "Encerrado en rojo = por debajo del mínimo", fill=RED, font=font(30))
    d.text((x0, y + 60), "Pedido: completar hasta el mínimo", fill=BLUE, font=font(30))
    img.save(OUT, "PNG")
    print(f"Imagen escrita en {OUT}")


if __name__ == "__main__":
    main()
