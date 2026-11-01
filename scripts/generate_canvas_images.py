"""Dibuja las 10 imágenes de «resultado esperado» del simulador de Gemini Canvas.

Lee materiales/gemini_canvas/banco_prompts_canvas.json (generado con
scripts/export_canvas_possibilities.cjs) y dibuja cada imagen con el prompt, la respuesta
y los bloques de `imageSpec`. Así la imagen muestra las mismas cifras que la lista de chequeo.

Uso: python scripts/generate_canvas_images.py
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent
BANK = BASE_DIR / "materiales" / "gemini_canvas" / "banco_prompts_canvas.json"
OUTPUT_DIRS = [BASE_DIR / "assets" / "images" / "canvas", BASE_DIR / "src" / "assets" / "images" / "canvas"]

WIDTH, MIN_HEIGHT = 1376, 768
LEFT_W = 380
CANVAS_X0, CANVAS_PAD = 410, 28
CANVAS_X1 = WIDTH - 30
CONTENT_X0, CONTENT_X1 = CANVAS_X0 + CANVAS_PAD, CANVAS_X1 - CANVAS_PAD

INK, MUTED, LINE, SOFT = "#1e293b", "#64748b", "#e2e8f0", "#f1f5f3"
PRIMARY, PRIMARY_SOFT = "#2d5a4c", "#e8f2ee"
STATUS = {
    "ROJO": ("#b91c1c", "#fee2e2"), "No cumple": ("#b91c1c", "#fee2e2"), "Requiere apoyo": ("#b91c1c", "#fee2e2"),
    "ÁMBAR": ("#92400e", "#fef3c7"), "Admisible con observaciones": ("#92400e", "#fef3c7"),
    "En progreso": ("#92400e", "#fef3c7"), "AA texto grande": ("#92400e", "#fef3c7"),
    "VERDE": ("#166534", "#dcfce7"), "Recomendado": ("#166534", "#dcfce7"), "Al día": ("#166534", "#dcfce7"),
    "AAA": ("#166534", "#dcfce7"), "AA": ("#166534", "#dcfce7"),
}


def load_font(names, size):
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


SANS = ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"]
BOLD = ["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"]
MONO = ["consola.ttf", "DejaVuSansMono.ttf"]
F = {
    "title": load_font(BOLD, 22), "h": load_font(BOLD, 19), "sub": load_font(BOLD, 15), "body": load_font(SANS, 14),
    "small": load_font(SANS, 12), "small_b": load_font(BOLD, 12), "tag": load_font(BOLD, 12), "mono": load_font(MONO, 12),
    "chat": load_font(SANS, 13), "kpi": load_font(BOLD, 26),
}


def split_long_word(draw, word, font, width):
    """Parte un token más ancho que la columna (por ejemplo, filas SQL sin espacios)."""
    pieces, piece = [], ""
    for char in word:
        if piece and draw.textlength(piece + char, font=font) > width:
            pieces.append(piece)
            piece = ""
        piece += char
    return pieces + [piece]


def wrap(draw, text, font, width):
    lines = []
    for paragraph in str(text).split("\n"):
        # Conserva la sangría inicial: en el código Python cambia el significado.
        indent = paragraph[: len(paragraph) - len(paragraph.lstrip(" "))]
        line = ""
        for word in paragraph.split():
            for part in split_long_word(draw, word, font, width - draw.textlength(indent, font=font)):
                candidate = f"{line} {part}".strip()
                if draw.textlength(indent + candidate, font=font) <= width or not line:
                    line = candidate
                else:
                    lines.append(indent + line)
                    line = part
        lines.append(indent + line)
    return lines


def line_height(font):
    return font.size + 6


def draw_lines(draw, x, y, lines, font, fill):
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        y += line_height(font)
    return y


def draw_text(draw, x, y, text, font, fill, width):
    return draw_lines(draw, x, y, wrap(draw, text, font, width), font, fill)


def draw_checkbox_text(draw, x, y, text, font, fill, width):
    if text.startswith("☐ "):
        draw.rectangle([x, y + 4, x + 11, y + 15], outline=PRIMARY, width=2)
        return draw_text(draw, x + 20, y, text[2:], font, fill, width - 20)
    draw.ellipse([x + 2, y + 7, x + 8, y + 13], fill=PRIMARY)
    return draw_text(draw, x + 16, y, text, font, fill, width - 16)


def column_widths(draw, headers, rows, total):
    weights = []
    for i, h in enumerate(headers):
        longest = max([draw.textlength(str(r[i]), font=F["small"]) for r in rows] + [draw.textlength(h, font=F["small_b"])])
        weights.append(min(max(longest, 70), 420))
    scale = total / sum(weights)
    return [w * scale for w in weights]


def block_table(draw, y, block):
    headers, rows = block["headers"], block["rows"]
    widths = column_widths(draw, headers, rows, CONTENT_X1 - CONTENT_X0)
    head_lines = [wrap(draw, h, F["small_b"], w - 16) for h, w in zip(headers, widths)]
    head_h = max(len(l) for l in head_lines) * line_height(F["small_b"]) + 12
    draw.rounded_rectangle([CONTENT_X0, y, CONTENT_X1, y + head_h], radius=4, fill=INK)
    x = CONTENT_X0
    for lines, w in zip(head_lines, widths):
        draw_lines(draw, x + 8, y + 6, lines, F["small_b"], "#ffffff")
        x += w
    y += head_h
    for index, row in enumerate(rows):
        cells = [wrap(draw, str(c), F["small"], w - 16) for c, w in zip(row, widths)]
        row_h = max(len(c) for c in cells) * line_height(F["small"]) + 12
        draw.rectangle([CONTENT_X0, y, CONTENT_X1, y + row_h], fill="#ffffff" if index % 2 == 0 else "#f8fafc", outline=LINE)
        x = CONTENT_X0
        for value, lines, w in zip(row, cells, widths):
            if value in STATUS:
                fg, bg = STATUS[value]
                pill_w = draw.textlength(value, font=F["small_b"]) + 16
                draw.rounded_rectangle([x + 6, y + 5, x + 6 + pill_w, y + row_h - 5], radius=8, fill=bg)
                draw.text((x + 14, y + 6), value, font=F["small_b"], fill=fg)
            else:
                draw_lines(draw, x + 8, y + 6, lines, F["small"], INK)
            x += w
        y += row_h
    return y + 6


def block_callout(draw, y, block):
    inner = CONTENT_X1 - CONTENT_X0 - 28
    lines = wrap(draw, block["text"], F["body"], inner)
    h = 14 + line_height(F["sub"]) + len(lines) * line_height(F["body"]) + 10
    draw.rounded_rectangle([CONTENT_X0, y, CONTENT_X1, y + h], radius=8, fill=PRIMARY_SOFT, outline=PRIMARY)
    draw.text((CONTENT_X0 + 14, y + 10), block["title"], font=F["sub"], fill=PRIMARY)
    draw_lines(draw, CONTENT_X0 + 14, y + 12 + line_height(F["sub"]), lines, F["body"], INK)
    return y + h + 4


def block_code(draw, y, block):
    lines = block["lines"]
    h = len(lines) * line_height(F["mono"]) + 20
    draw.rounded_rectangle([CONTENT_X0, y, CONTENT_X1, y + h], radius=8, fill="#1e1e1e")
    ty = y + 10
    for line in lines:
        fill = "#6a9955" if line.strip().startswith(("--", "#", '"""')) else "#d4d4d4"
        draw.text((CONTENT_X0 + 14, ty), line, font=F["mono"], fill=fill)
        ty += line_height(F["mono"])
    return y + h + 4


def block_kpis(draw, y, block):
    items = block["items"]
    gap = 16
    w = (CONTENT_X1 - CONTENT_X0 - gap * (len(items) - 1)) / len(items)
    for i, item in enumerate(items):
        x = CONTENT_X0 + i * (w + gap)
        draw.rounded_rectangle([x, y, x + w, y + 78], radius=8, fill=SOFT, outline=LINE)
        draw.rectangle([x, y, x + 5, y + 78], fill=PRIMARY)
        draw.text((x + 18, y + 10), item["label"], font=F["small"], fill=MUTED)
        draw.text((x + 18, y + 32), item["value"], font=F["kpi"], fill=PRIMARY)
    return y + 90


def block_bars(draw, y, block):
    items = block["items"]
    draw.text((CONTENT_X0, y), block["title"], font=F["sub"], fill=INK)
    top, base = y + 30, y + 170
    slot = (CONTENT_X1 - CONTENT_X0) / len(items)
    peak = max(i["value"] for i in items)
    for i, item in enumerate(items):
        h = (item["value"] / peak) * (base - top - 18)
        x = CONTENT_X0 + i * slot + slot * 0.2
        draw.rounded_rectangle([x, base - h, x + slot * 0.6, base], radius=4, fill=PRIMARY)
        label = str(item["value"])
        draw.text((x + slot * 0.3 - draw.textlength(label, font=F["small_b"]) / 2, base - h - 17), label, font=F["small_b"], fill=INK)
        draw.text((x + slot * 0.3 - draw.textlength(item["label"], font=F["small"]) / 2, base + 4), item["label"], font=F["small"], fill=MUTED)
    draw.line([(CONTENT_X0, base), (CONTENT_X1, base)], fill=LINE, width=2)
    return base + 28


def flow_ranks(lanes, edges):
    ids = [n["id"] for lane in lanes for n in lane["nodes"]]
    rank = {i: 0 for i in ids}
    for _ in ids:
        for source, target, *_ in edges:
            rank[target] = max(rank[target], rank[source] + 1)
    return rank


def block_flow(draw, y, block):
    lanes, edges = block["lanes"], block["edges"]
    rank = flow_ranks(lanes, edges)
    columns = max(rank.values()) + 1
    label_w = 128
    col_w = (CONTENT_X1 - CONTENT_X0 - label_w) / columns
    node_w = col_w - 12
    boxes, lane_top = {}, y
    for li, lane in enumerate(lanes):
        layout = []
        for node in lane["nodes"]:
            decision = node.get("shape") == "decision"
            lines = [node["id"]] + wrap(draw, node["label"], F["small"], node_w - (30 if decision else 12))
            layout.append((node, lines, len(lines) * 15 + (26 if decision else 14)))
        stacks = {}
        for item in layout:
            stacks.setdefault(rank[item[0]["id"]], []).append(item)
        lane_h = max(sum(h for _, _, h in s) + 10 * (len(s) - 1) for s in stacks.values()) + 28
        draw.rectangle([CONTENT_X0, lane_top, CONTENT_X1, lane_top + lane_h], fill="#f8fafc" if li % 2 == 0 else "#ffffff", outline=LINE)
        draw_text(draw, CONTENT_X0 + 10, lane_top + lane_h / 2 - 18, lane["name"], F["small_b"], PRIMARY, label_w - 16)
        for column, stack in stacks.items():
            x = CONTENT_X0 + label_w + column * col_w + 6
            ny = lane_top + (lane_h - (sum(h for _, _, h in stack) + 10 * (len(stack) - 1))) / 2
            for node, lines, node_h in stack:
                boxes[node["id"]] = (x, ny, x + node_w, ny + node_h)
                shape = node.get("shape")
                if shape == "decision":
                    cx, cy = x + node_w / 2, ny + node_h / 2
                    draw.polygon([(cx, ny - 8), (x + node_w + 4, cy), (cx, ny + node_h + 8), (x - 4, cy)], fill="#fef3c7", outline="#d97706")
                elif shape == "terminal":
                    draw.rounded_rectangle([x, ny, x + node_w, ny + node_h], radius=22, fill=PRIMARY_SOFT, outline=PRIMARY, width=2)
                else:
                    draw.rounded_rectangle([x, ny, x + node_w, ny + node_h], radius=6, fill="#ffffff", outline=PRIMARY, width=2)
                ty = ny + node_h / 2 - len(lines) * 7.5
                for i, line in enumerate(lines):
                    font = F["small_b"] if i == 0 else F["small"]
                    draw.text((x + node_w / 2 - draw.textlength(line, font=font) / 2, ty), line, font=font, fill=INK)
                    ty += 15
                ny += node_h + 10
        lane_top += lane_h
    for source, target, *label in edges:
        sx0, sy0, sx1, sy1 = boxes[source]
        tx0, ty0, tx1, ty1 = boxes[target]
        start, end = (sx1 + 4, (sy0 + sy1) / 2), (tx0, (ty0 + ty1) / 2)
        mid_x = start[0] + 6 if label else (start[0] + end[0]) / 2
        draw.line([start, (mid_x, start[1]), (mid_x, end[1]), end], fill=MUTED, width=2)
        draw.polygon([end, (end[0] - 8, end[1] - 5), (end[0] - 8, end[1] + 5)], fill=MUTED)
        if label:
            color = "#166534" if label[0] == "Sí" else "#b91c1c"
            draw.text((end[0] - 26, end[1] - 18), label[0], font=F["small_b"], fill=color)
    return lane_top + 10


def block_swatches(draw, y, block):
    items = block["items"]
    gap = 10
    w = (CONTENT_X1 - CONTENT_X0 - gap * (len(items) - 1)) / len(items)
    for i, item in enumerate(items):
        x = CONTENT_X0 + i * (w + gap)
        draw.rounded_rectangle([x, y, x + w, y + 64], radius=6, fill=item["hex"], outline="#cbd5e1")
        fg = "#ffffff" if item["hex"].upper() in ("#2D5A4C", "#1E293B", "#B45309") else INK
        draw.text((x + 10, y + 12), item["name"], font=F["small_b"], fill=fg)
        draw.text((x + 10, y + 34), item["hex"], font=F["small"], fill=fg)
    return y + 76


def block_phone(draw, y, block):
    x0, w, h = CONTENT_X0 + 250, 300, 360
    draw.rounded_rectangle([x0, y, x0 + w, y + h], radius=28, fill=INK)
    sx0, sy0, sx1 = x0 + 10, y + 12, x0 + w - 10
    draw.rounded_rectangle([sx0, sy0, sx1, y + h - 12], radius=20, fill="#F8FAF9")
    draw.rounded_rectangle([sx0 + 10, sy0 + 14, sx1 - 10, sy0 + 74], radius=10, fill="#2D5A4C")
    draw.text((sx0 + 22, sy0 + 22), block["title"], font=F["sub"], fill="#ffffff")
    draw.text((sx0 + 22, sy0 + 46), block["subtitle"], font=F["small"], fill="#e8f2ee")
    cy = sy0 + 88
    for card in block["cards"]:
        lines = wrap(draw, card, F["small"], sx1 - sx0 - 44)
        ch = len(lines) * line_height(F["small"]) + 18
        draw.rounded_rectangle([sx0 + 10, cy, sx1 - 10, cy + ch], radius=8, fill="#ffffff", outline=LINE)
        draw_lines(draw, sx0 + 22, cy + 9, lines, F["small"], "#1E293B")
        cy += ch + 8
    draw.rounded_rectangle([sx0 + 30, cy + 6, sx1 - 30, cy + 44], radius=19, fill="#2D5A4C", outline="#B45309", width=3)
    label = block["button"]
    draw.text(((sx0 + sx1) / 2 - draw.textlength(label, font=F["small_b"]) / 2, cy + 16), label, font=F["small_b"], fill="#ffffff")
    draw.text((CONTENT_X0, y + 20), "Maqueta de 360 px", font=F["sub"], fill=INK)
    draw_text(draw, CONTENT_X0, y + 48, "Contorno visible en el botón al navegar con la tecla Tab.", F["small"], MUTED, 220)
    return y + h + 10


def block_selection(draw, y, block):
    inner = CONTENT_X1 - CONTENT_X0 - 40
    item_lines = [wrap(draw, item, F["body"], inner) for item in block["items"]]
    h = 16 + line_height(F["sub"]) + sum(len(l) * line_height(F["body"]) + 4 for l in item_lines) + 12
    draw.rounded_rectangle([CONTENT_X0, y, CONTENT_X1, y + h], radius=8, fill="#dbeafe", outline="#2563eb", width=2)
    draw.text((CONTENT_X0 + 14, y + 10), block["title"], font=F["sub"], fill="#1d4ed8")
    ty = y + 14 + line_height(F["sub"])
    for lines in item_lines:
        draw.ellipse([CONTENT_X0 + 16, ty + 7, CONTENT_X0 + 22, ty + 13], fill="#1d4ed8")
        ty = draw_lines(draw, CONTENT_X0 + 30, ty, lines, F["body"], INK) + 4
    return y + h + 6


def render_block(draw, y, block):
    kind = block["type"]
    if kind == "heading":
        y = draw_text(draw, CONTENT_X0, y, block["text"], F["h"], PRIMARY, CONTENT_X1 - CONTENT_X0)
        draw.line([(CONTENT_X0, y + 2), (CONTENT_X1, y + 2)], fill=PRIMARY, width=2)
        return y + 10
    if kind == "subheading":
        return draw_text(draw, CONTENT_X0, y, block["text"], F["sub"], INK, CONTENT_X1 - CONTENT_X0) + 2
    if kind == "paragraph":
        return draw_text(draw, CONTENT_X0, y, block["text"], F["body"], INK, CONTENT_X1 - CONTENT_X0) + 2
    if kind == "bullets":
        for item in block["items"]:
            y = draw_checkbox_text(draw, CONTENT_X0, y, item, F["body"], INK, CONTENT_X1 - CONTENT_X0) + 2
        return y
    renderers = {
        "table": block_table, "callout": block_callout, "code": block_code, "kpis": block_kpis, "bars": block_bars,
        "flow": block_flow, "swatches": block_swatches, "phone": block_phone, "selection": block_selection,
    }
    return renderers[kind](draw, y, block)


def draw_sparkle(draw, x, y, size, fill):
    s = size / 2
    draw.polygon([(x, y - s), (x + s * 0.28, y - s * 0.28), (x + s, y), (x + s * 0.28, y + s * 0.28),
                  (x, y + s), (x - s * 0.28, y + s * 0.28), (x - s, y), (x - s * 0.28, y - s * 0.28)], fill=fill)


def draw_bubble(draw, y, tag, text, outline, max_lines):
    lines = wrap(draw, text, F["chat"], LEFT_W - 64)
    if len(lines) > max_lines:
        lines = lines[: max_lines - 1] + ["… (prompt completo en el simulador)"]
    h = 40 + len(lines) * line_height(F["chat"]) + 8
    draw.rounded_rectangle([20, y, LEFT_W - 20, y + h], radius=10, fill="#1e293b", outline=outline, width=2)
    draw.text((32, y + 12), tag, font=F["tag"], fill="#93c5fd")
    draw_lines(draw, 32, y + 36, lines, F["chat"], "#e2e8f0")
    return y + h + 16


def render_possibility(possibility):
    spec = possibility["imageSpec"]
    canvas = Image.new("RGB", (WIDTH, 4000), "#0f172a")
    draw = ImageDraw.Draw(canvas)
    y = 120
    for block in spec["blocks"]:
        y = render_block(draw, y + 8, block)
    height = max(MIN_HEIGHT, int(y) + 50)

    img = Image.new("RGB", (WIDTH, height), "#0f172a")
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, WIDTH, 56], fill="#1e293b")
    draw_sparkle(draw, 34, 28, 22, "#38bdf8")
    draw.text((52, 15), "Gemini Canvas", font=F["title"], fill="#38bdf8")
    draw.text((240, 19), spec["docTitle"], font=F["sub"], fill="#cbd5e1")
    draw.rounded_rectangle([WIDTH - 220, 12, WIDTH - 24, 44], radius=6, fill="#0284c7")
    draw.text((WIDTH - 204, 20), "Compartir y exportar", font=F["small_b"], fill="#ffffff")
    draw.rectangle([0, 56, LEFT_W, height], fill="#111827")
    draw.line([(LEFT_W, 56), (LEFT_W, height)], fill="#334155", width=2)
    prompt_lines = max(8, (height - 330) // line_height(F["chat"]))
    chat_y = draw_bubble(draw, 76, "PROMPT DEL APRENDIZ", possibility["masterPrompt"], "#3b82f6", prompt_lines)
    draw_bubble(draw, chat_y, "RESPUESTA DE GEMINI", spec["chat"], "#475569", 12)

    draw.rounded_rectangle([CANVAS_X0, 76, CANVAS_X1, height - 20], radius=12, fill="#ffffff")
    y = 96
    for block in spec["blocks"]:
        y = render_block(draw, y + 8, block)
    return img


def main():
    bank = json.loads(BANK.read_text(encoding="utf-8"))
    for possibility in bank["possibilities"]:
        img = render_possibility(possibility)
        for out_dir in OUTPUT_DIRS:
            out_dir.mkdir(parents=True, exist_ok=True)
            out = out_dir / possibility["imageSpec"]["file"]
            img.save(out, "JPEG", quality=92)
            print(f"{out.relative_to(BASE_DIR)} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
