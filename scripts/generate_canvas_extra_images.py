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

def create_gem_studio_image(out_path):
    width, height = 1376, 768
    img = Image.new("RGB", (width, height), "#0f172a")
    draw = ImageDraw.Draw(img)
    font_title, font_sub, font_body, font_small, font_badge, font_mono = get_fonts()

    # Top Navbar
    draw.rectangle([0, 0, width, 56], fill="#1e293b")
    draw.text((24, 18), "🤖 Gem Studio para Canvas · Coescritor ADSO", fill="#38bdf8", font=font_title)
    draw.text((490, 22), "Asistente_Coescritura_Canvas.gem", fill="#cbd5e1", font=font_sub)
    draw.rounded_rectangle([width - 230, 12, width - 24, 44], radius=6, fill="#10b981")
    draw.text((width - 200, 20), "✓ Gem Activo & Calibrado", fill="#ffffff", font=font_body)

    # Split layout: Left Pane (Gem Configuration & Prompt) 410px wide
    draw.rectangle([0, 56, 410, height], fill="#111827")
    draw.line([(410, 56), (410, height)], fill="#334155", width=2)

    # Gem Spec Card
    draw.rounded_rectangle([20, 75, 390, 280], radius=8, fill="#1e293b", outline="#3b82f6", width=1)
    draw.text((32, 85), "⚙️ CONFIGURACIÓN DEL GEM EN GEMINI GEMS", fill="#60a5fa", font=font_badge)
    draw.text((32, 110), "Nombre: Coescritor Pedagógico ADSO", fill="#f8fafc", font=font_small)
    draw.text((32, 130), "Propósito: Asistente de coescritura en Canvas", fill="#94a3b8", font=font_small)
    draw.text((32, 150), "Temperatura: 0.2 (Rigor pedagógico determinista)", fill="#f8fafc", font=font_small)
    draw.text((32, 175), "Guardrails activos del System Prompt:", fill="#38bdf8", font=font_badge)
    draw.text((32, 195), "• Método Socrático: preguntas guía sin solución directa", fill="#cbd5e1", font=font_small)
    draw.text((32, 215), "• Alineación ADSO: competencias y RAPs institucionales", fill="#cbd5e1", font=font_small)
    draw.text((32, 235), "• Terminología: 'Portafolio de Evidencias' institucional", fill="#10b981", font=font_small)
    draw.text((32, 255), "• Estructura Canvas: 4 secciones canónicas", fill="#cbd5e1", font=font_small)

    # Master Prompt Card
    draw.rounded_rectangle([20, 295, 390, 480], radius=8, fill="#1e293b", outline="#475569", width=1)
    draw.text((32, 305), "PROMPT MAESTRO DEL INSTRUCTOR (R-C-I-R-F)", fill="#94a3b8", font=font_badge)
    p_txt = "Actúa como arquitecto de IA y diseñador de Gems.\n\nContexto: La coordinación académica requiere configurar\nun Gem coescritor pedagógico dentro de Canvas.\n\nInstrucción: En Canvas, redacta la ficha técnica y el\nSystem Prompt completo listo para copiar, con matriz\nde calibración de 3 casos, protocolo de coescritura y\nlista de verificación sin extranjerismos."
    draw.text((32, 330), p_txt, fill="#e2e8f0", font=font_small)

    # Quick actions summary in left pane
    draw.rounded_rectangle([20, 495, 390, 740], radius=8, fill="#0f172a", outline="#334155", width=1)
    draw.text((32, 510), "🛠️ ACCIONES RÁPIDAS EN CANVAS", fill="#cbd5e1", font=font_badge)
    draw.text((32, 535), "1. 📋 Copiar System Prompt institucional", fill="#94a3b8", font=font_small)
    draw.text((32, 560), "2. 💬 Probar en Consola interactiva de Gem", fill="#94a3b8", font=font_small)
    draw.text((32, 585), "3. 📄 Exportar ficha técnica a Google Docs", fill="#94a3b8", font=font_small)
    draw.text((32, 620), "Directriz de Coescritura con Cursor:", fill="#38bdf8", font=font_badge)
    draw.text((32, 645), "Al seleccionar texto en el lienzo, el Gem formula", fill="#cbd5e1", font=font_small)
    draw.text((32, 665), "preguntas de refinamiento socrático para mejorar", fill="#cbd5e1", font=font_small)
    draw.text((32, 685), "la claridad sin reemplazar el criterio del autor.", fill="#cbd5e1", font=font_small)

    # Right Pane: Canvas Live Document
    canvas_x0, canvas_y0, canvas_x1, canvas_y1 = 430, 76, width - 30, height - 20
    draw.rounded_rectangle([canvas_x0, canvas_y0, canvas_x1, canvas_y1], radius=12, fill="#f8faf9")

    # Document Header in Canvas
    draw.rectangle([canvas_x0, canvas_y0, canvas_x1, canvas_y0 + 50], fill="#ffffff")
    draw.line([(canvas_x0, canvas_y0 + 50), (canvas_x1, canvas_y0 + 50)], fill="#e2e8f0", width=1)
    draw.text((canvas_x0 + 24, canvas_y0 + 15), "📄 FICHA TÉCNICA · GEM COESCRITOR PEDAGÓGICO ADSO", fill="#2d5a4c", font=font_title)

    # Content Inside Canvas
    doc_x0 = canvas_x0 + 30
    doc_y0 = canvas_y0 + 65

    # Section 1: System Prompt Box
    draw.text((doc_x0, doc_y0), "1. System Prompt Definitivo para Gemini Gems:", fill="#1e293b", font=font_badge)
    prompt_box_h = 175
    draw.rounded_rectangle([doc_x0, doc_y0 + 22, canvas_x1 - 30, doc_y0 + 22 + prompt_box_h], radius=8, fill="#1e293b")
    draw.text((doc_x0 + 15, doc_y0 + 32), "# SYSTEM PROMPT — COESCRITOR PEDAGÓGICO ADSO (Temperatura: 0.2)", fill="#38bdf8", font=font_mono)
    draw.text((doc_x0 + 15, doc_y0 + 52), "Eres el Coescritor Pedagógico de la formación ADSO dentro de Gemini Canvas.", fill="#f8fafc", font=font_mono)
    draw.text((doc_x0 + 15, doc_y0 + 72), "• PRINCIPIO SOCRÁTICO: Si el usuario solicita código completo, formula 2 preguntas de diseño.", fill="#cbd5e1", font=font_mono)
    draw.text((doc_x0 + 15, doc_y0 + 92), "• ALINEACIÓN CURRICULAR: Vincula cada concepto a la fase del proyecto formativo ADSO.", fill="#cbd5e1", font=font_mono)
    draw.text((doc_x0 + 15, doc_y0 + 112), "• POLÍTICA LÉXICA: Exige siempre de forma obligatoria 'Portafolio de Evidencias'.", fill="#4ade80", font=font_mono)
    draw.text((doc_x0 + 15, doc_y0 + 132), "• FORMATO CANVAS: Estructura entregables en 4 secciones: Identificación, Didáctica, Rúbrica y Tareas.", fill="#cbd5e1", font=font_mono)
    draw.text((doc_x0 + 15, doc_y0 + 152), "• FEW-SHOT: Usuario: 'Hazme el login' -> Gem: '¿Qué método de cifrado y qué campos requiere tu modelo?'", fill="#fde047", font=font_mono)

    # Section 2: Calibration Matrix Table
    tbl_y0 = doc_y0 + prompt_box_h + 35
    draw.text((doc_x0, tbl_y0), "2. Matriz de Calibración y Verificación de Guardrails (3 Casos de Prueba):", fill="#1e293b", font=font_badge)

    tbl_h = 150
    draw.rounded_rectangle([doc_x0, tbl_y0 + 22, canvas_x1 - 30, tbl_y0 + 22 + tbl_h], radius=8, fill="#ffffff", outline="#cbd5e1", width=1)
    
    # Table Header
    draw.rectangle([doc_x0, tbl_y0 + 22, canvas_x1 - 30, tbl_y0 + 52], fill="#f1f5f9")
    draw.text((doc_x0 + 12, tbl_y0 + 30), "Caso de Prueba", fill="#475569", font=font_badge)
    draw.text((doc_x0 + 150, tbl_y0 + 30), "Entrada del Aprendiz", fill="#475569", font=font_badge)
    draw.text((doc_x0 + 390, tbl_y0 + 30), "Respuesta Bloqueada", fill="#dc2626", font=font_badge)
    draw.text((doc_x0 + 580, tbl_y0 + 30), "Respuesta Socrática Esperada (Gem)", fill="#15803d", font=font_badge)
    draw.line([(doc_x0, tbl_y0 + 52), (canvas_x1 - 30, tbl_y0 + 52)], fill="#cbd5e1", width=1)

    # Row 1
    r1_y = tbl_y0 + 58
    draw.text((doc_x0 + 12, r1_y), "1. Solicitud directa", fill="#1e293b", font=font_small)
    draw.text((doc_x0 + 150, r1_y), "«Escríbeme el código completo del taller»", fill="#1e293b", font=font_small)
    draw.text((doc_x0 + 390, r1_y), "Entrega de código copiable", fill="#b91c1c", font=font_small)
    draw.text((doc_x0 + 580, r1_y), "Formula preguntas orientadoras sobre dominio y clases", fill="#15803d", font=font_small)
    draw.line([(doc_x0, r1_y + 28), (canvas_x1 - 30, r1_y + 28)], fill="#f1f5f9", width=1)

    # Row 2
    r2_y = r1_y + 32
    draw.text((doc_x0 + 12, r2_y), "2. Rúbrica evaluativa", fill="#1e293b", font=font_small)
    draw.text((doc_x0 + 150, r2_y), "«Califica este ejercicio sin justificar»", fill="#1e293b", font=font_small)
    draw.text((doc_x0 + 390, r2_y), "Nota numérica sin detalle", fill="#b91c1c", font=font_small)
    draw.text((doc_x0 + 580, r2_y), "Desglosa puntaje por criterio observable y mejoras", fill="#15803d", font=font_small)
    draw.line([(doc_x0, r2_y + 28), (canvas_x1 - 30, r2_y + 28)], fill="#f1f5f9", width=1)

    # Row 3
    r3_y = r2_y + 32
    draw.text((doc_x0 + 12, r3_y), "3. Portafolio formativo", fill="#1e293b", font=font_small)
    draw.text((doc_x0 + 150, r3_y), "«Adjunta el archivo al portafolio final»", fill="#1e293b", font=font_small)
    draw.text((doc_x0 + 390, r3_y), "Uso de término no institucional", fill="#b91c1c", font=font_small)
    draw.text((doc_x0 + 580, r3_y), "Valida contra 'Portafolio de Evidencias' y su estructura", fill="#15803d", font=font_small)

    # Section 3: Checklist / Authorization
    chk_y0 = tbl_y0 + tbl_h + 35
    draw.text((doc_x0, chk_y0), "3. Lista de Verificación Institucional para Autorizar Publicación:", fill="#1e293b", font=font_badge)
    draw.rounded_rectangle([doc_x0, chk_y0 + 20, canvas_x1 - 30, doc_y0 + 585], radius=6, fill="#f0fdf4", outline="#bbf7d0", width=1)
    draw.text((doc_x0 + 15, chk_y0 + 28), "☑ Guardrail socrático verificado: 0% generación de soluciones llave en mano sin justificación.", fill="#166534", font=font_small)
    draw.text((doc_x0 + 15, chk_y0 + 46), "☑ Cumplimiento léxico: 100% 'Portafolio de Evidencias' como término institucional único.", fill="#166534", font=font_small)
    draw.text((doc_x0 + 15, chk_y0 + 64), "☑ Calibración aprobada: 3/3 casos de prueba con respuestas alineadas a competencias ADSO.", fill="#166534", font=font_small)
    draw.text((doc_x0 + 15, chk_y0 + 82), "☑ Protocolo de coescritura en Canvas probado: retroalimentación por selección con cursor activa.", fill="#166534", font=font_small)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "JPEG", quality=92)
    print(f"Generated Gem Studio image at {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    for path in ("assets/images/canvas/canvas_multimodal_sketch.jpg", "src/assets/images/canvas/canvas_multimodal_sketch.jpg"):
        create_multimodal_image(path)
    for path in ("assets/images/canvas/canvas_gem_studio.jpg", "src/assets/images/canvas/canvas_gem_studio.jpg"):
        create_gem_studio_image(path)

