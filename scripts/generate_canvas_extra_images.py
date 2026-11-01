import os
from PIL import Image, ImageDraw, ImageFont

def get_fonts():
    try:
        font_title = ImageFont.truetype("arial.ttf", 22)
        font_sub = ImageFont.truetype("arial.ttf", 15)
        font_body = ImageFont.truetype("arial.ttf", 13)
        font_small = ImageFont.truetype("arial.ttf", 11)
        font_badge = ImageFont.truetype("arialbd.ttf", 12)
        font_mono = ImageFont.truetype("consola.ttf", 12)
    except:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_body = font_title
        font_small = font_title
        font_badge = font_title
        font_mono = font_title
    return font_title, font_sub, font_body, font_small, font_badge, font_mono

def create_multimodal_image(out_path):
    width, height = 1376, 768
    img = Image.new("RGB", (width, height), "#0f172a")
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_body, font_small, font_badge, font_mono = get_fonts()

    draw.rectangle([0, 0, width, 56], fill="#1e293b")
    draw.text((24, 18), "✨ Gemini Multimodal Vision → Canvas", fill="#38bdf8", font=font_title)
    draw.text((360, 22), "Prototipo_Matricula_Boceto_a_Web.html", fill="#cbd5e1", font=font_sub)
    draw.rounded_rectangle([width - 240, 12, width - 24, 44], radius=6, fill="#10b981")
    draw.text((width - 210, 20), "▶ Ejecución Live Activa", fill="#ffffff", font=font_body)

    # Split layout: Left Pane (Chat con imagen adjunta) 400px wide
    draw.rectangle([0, 56, 400, height], fill="#111827")
    draw.line([(400, 56), (400, height)], fill="#334155", width=2)
    
    # Image Attachment Card
    draw.rounded_rectangle([20, 75, 380, 255], radius=8, fill="#1e293b", outline="#3b82f6", width=1)
    draw.text((32, 85), "📷 IMAGEN ADJUNTA: BOCETO A MANO EN LIBRETA", fill="#60a5fa", font=font_badge)
    # Drawing a simulated sketch
    draw.rectangle([35, 110, 365, 240], fill="#fefce8", outline="#ca8a04", width=2)
    draw.text((45, 120), "[Wireframe Libreta de Apuntes]", fill="#854d0e", font=font_small)
    draw.rectangle([50, 140, 350, 160], outline="#a16207", width=1)
    draw.text((60, 145), "Nombre Completo ____________", fill="#713f12", font=font_small)
    draw.rectangle([50, 170, 350, 190], outline="#a16207", width=1)
    draw.text((60, 175), "Correo Institucional ________", fill="#713f12", font=font_small)
    draw.rectangle([50, 200, 160, 225], fill="#ca8a04")
    draw.text((65, 207), "[REGISTRARSE]", fill="#ffffff", font=font_small)

    # Prompt
    draw.rounded_rectangle([20, 270, 380, 420], radius=8, fill="#1e293b", outline="#475569", width=1)
    draw.text((32, 280), "PROMPT MULTIMODAL DEL APRENDIZ", fill="#94a3b8", font=font_badge)
    p_txt = "Analiza este boceto que dibujé en mi libreta.\nAbre un Canvas de código y genera el formulario web\ncompleto en HTML/CSS/JS con:\n1. Validación de correo institucional (@sena.edu.co)\n2. Indicador dinámico de fortaleza de contraseña\n3. Paleta Verde Salvia y diseño accesible WCAG."
    draw.text((32, 305), p_txt, fill="#e2e8f0", font=font_small)

    # Right Pane: Canvas Live Code Execution
    canvas_x0, canvas_y0, canvas_x1, canvas_y1 = 430, 76, width - 30, height - 20
    draw.rounded_rectangle([canvas_x0, canvas_y0, canvas_x1, canvas_y1], radius=12, fill="#f8faf9")
    
    draw.rectangle([canvas_x0, canvas_y0, canvas_x1, canvas_y0 + 50], fill="#ffffff")
    draw.line([(canvas_x0, canvas_y0 + 50), (canvas_x1, canvas_y0 + 50)], fill="#e2e8f0", width=1)
    draw.text((canvas_x0 + 24, canvas_y0 + 15), "🌐 Aplicación Web Generada desde Boceto (Canvas Live)", fill="#2d5a4c", font=font_title)

    # Rendered Interactive Form inside Canvas
    form_w, form_h = 560, 480
    form_x0 = canvas_x0 + 40
    form_y0 = canvas_y0 + 80
    draw.rounded_rectangle([form_x0, form_y0, form_x0 + form_w, form_y0 + form_h], radius=12, fill="#ffffff", outline="#cbd5e1", width=1)
    
    draw.text((form_x0 + 30, form_y0 + 25), "Formulario de Inscripción y Matrícula", fill="#1e293b", font=font_sub)
    draw.text((form_x0 + 30, form_y0 + 50), "Centro de Formación Tecnológica · Convocatoria 2026", fill="#64748b", font=font_small)

    # Inputs
    draw.text((form_x0 + 30, form_y0 + 85), "Nombre Completo del Aprendiz:", fill="#1e293b", font=font_small)
    draw.rounded_rectangle([form_x0 + 30, form_y0 + 105, form_x0 + form_w - 30, form_y0 + 140], radius=6, fill="#f8faf9", outline="#cbd5e1", width=1)
    draw.text((form_x0 + 42, form_y0 + 116), "Carlos Andrés Gómez Restrepo", fill="#1e293b", font=font_body)

    draw.text((form_x0 + 30, form_y0 + 155), "Correo Institucional:", fill="#1e293b", font=font_small)
    draw.rounded_rectangle([form_x0 + 30, form_y0 + 175, form_x0 + form_w - 30, form_y0 + 210], radius=6, fill="#f8faf9", outline="#22c55e", width=1)
    draw.text((form_x0 + 42, form_y0 + 186), "cgomez@soy.sena.edu.co", fill="#15803d", font=font_body)
    draw.text((form_x0 + form_w - 110, form_y0 + 186), "✓ Dominio Válido", fill="#15803d", font=font_small)

    draw.text((form_x0 + 30, form_y0 + 225), "Contraseña de Acceso:", fill="#1e293b", font=font_small)
    draw.rounded_rectangle([form_x0 + 30, form_y0 + 245, form_x0 + form_w - 30, form_y0 + 280], radius=6, fill="#f8faf9", outline="#cbd5e1", width=1)
    draw.text((form_x0 + 42, form_y0 + 256), "••••••••••••", fill="#1e293b", font=font_body)

    # Password strength meter
    draw.text((form_x0 + 30, form_y0 + 292), "Nivel de Seguridad: Excelente (12 caracteres, símbolos y números)", fill="#15803d", font=font_small)
    draw.rounded_rectangle([form_x0 + 30, form_y0 + 312, form_x0 + form_w - 30, form_y0 + 320], radius=4, fill="#e2e8f0")
    draw.rounded_rectangle([form_x0 + 30, form_y0 + 312, form_x0 + form_w - 30, form_y0 + 320], radius=4, fill="#22c55e")

    # Button
    draw.rounded_rectangle([form_x0 + 30, form_y0 + 350, form_x0 + form_w - 30, form_y0 + 395], radius=8, fill="#2d5a4c")
    draw.text((form_x0 + 170, form_y0 + 363), "Completar Registro Formativo", fill="#ffffff", font=font_badge)

    # Side Insights
    side_x0 = form_x0 + form_w + 30
    draw.text((side_x0, form_y0 + 25), "⚡ Transición Multimodal:", fill="#2d5a4c", font=font_badge)
    draw.text((side_x0, form_y0 + 55), "1. OCR Espacial:", fill="#1e293b", font=font_small)
    draw.text((side_x0, form_y0 + 75), "Gemini detectó campos, etiquetas y jerarquía\ndirectamente de las líneas a lápiz.", fill="#64748b", font=font_small)
    draw.text((side_x0, form_y0 + 120), "2. Inferencia de Lógica:", fill="#1e293b", font=font_small)
    draw.text((side_x0, form_y0 + 140), "Convirtió el trazo en validación con Regex\ny eventos oninput reactivos en JS.", fill="#64748b", font=font_small)
    draw.text((side_x0, form_y0 + 185), "3. Diseño Profesional:", fill="#1e293b", font=font_small)
    draw.text((side_x0, form_y0 + 205), "Aplicó tokens de serenidad visual\ny validación semántica accesible.", fill="#64748b", font=font_small)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "JPEG", quality=92)
    print(f"Generated Multimodal image at {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    # Las 10 imágenes del simulador se dibujan con scripts/generate_canvas_images.py.
    for path in ("assets/images/canvas/canvas_multimodal_sketch.jpg", "src/assets/images/canvas/canvas_multimodal_sketch.jpg"):
        create_multimodal_image(path)
