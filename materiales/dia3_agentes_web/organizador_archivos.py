#!/usr/bin/env python3
"""
Solución de referencia: Clasificador automático de archivos con generación de tablero HTML.
Organiza los archivos por categoría y genera 'resumen_clasificacion.html'.
"""

import os
import shutil
from pathlib import Path
from collections import defaultdict
from datetime import datetime

CATEGORIAS = {
    "Documentos": [".pdf", ".docx", ".txt", ".xlsx", ".pptx"],
    "Imágenes": [".png", ".jpg", ".svg", ".webp", ".jpeg"],
    "Código y Scripts": [".html", ".css", ".js", ".py", ".sql"],
    "Datos y Tablas": [".csv", ".json", ".xml"],
    "Comprimidos y Backups": [".zip", ".bak", ".tar.gz", ".rar"]
}

def obtener_categoria(extension):
    ext_lower = extension.lower()
    for cat, exts in CATEGORIAS.items():
        if ext_lower in exts:
            return cat
    return "Otros"

def clasificar_y_generar_reporte(directorio_origen="archivos_desordenados", directorio_salida="archivos_organizados"):
    ruta_origen = Path(directorio_origen)
    ruta_salida = Path(directorio_salida)
    
    if not ruta_origen.exists():
        print(f"Error: La carpeta {directorio_origen} no existe. Ejecuta primero el generador.")
        return
        
    conteo = defaultdict(int)
    detalles_archivos = []
    
    # Procesar archivos
    for item in ruta_origen.iterdir():
        if item.is_file():
            categoria = obtener_categoria(item.suffix)
            carpeta_destino = ruta_salida / categoria
            carpeta_destino.mkdir(parents=True, exist_ok=True)
            
            # Copiar o mover
            destino_archivo = carpeta_destino / item.name
            shutil.copy2(item, destino_archivo)
            
            conteo[categoria] += 1
            detalles_archivos.append({
                "nombre": item.name,
                "categoria": categoria,
                "tamano_kb": round(item.stat().st_size / 1024, 2),
                "extension": item.suffix
            })
            
    total_procesados = sum(conteo.values())
    
    # Generar tablero HTML
    html_reporte = f"""<!DOCTYPE html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tablero de Clasificación Automática de Archivos</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8faf9;
      color: #1e293b;
      margin: 0;
      padding: 2rem;
    }}
    .container {{
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }}
    h1 {{ color: #2d5a4c; margin-top: 0; }}
    .stats-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }}
    .stat-card {{
      background: #eef5f2;
      border: 1px solid #d1e5dd;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }}
    .stat-number {{ font-size: 2rem; font-weight: bold; color: #2d5a4c; }}
    .stat-label {{ font-size: 0.85rem; color: #475569; }}
    table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.5rem;
    }}
    th, td {{
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9rem;
    }}
    th {{ background: #f1f5f9; color: #334155; }}
    .badge {{
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e2e8f0;
    }}
  </style>
</head>
<body>
  <div class="container">
    <h1>Reporte de Organización de Archivos</h1>
    <p>Ejecutado con éxito el <strong>{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</strong>. Total archivos procesados: <strong>{total_procesados}</strong>.</p>
    
    <div class="stats-grid">
"""
    for cat, cant in conteo.items():
        html_reporte += f"""      <div class="stat-card">
        <div class="stat-number">{cant}</div>
        <div class="stat-label">{cat}</div>
      </div>\n"""
      
    html_reporte += """    </div>

    <h2>Muestra de Archivos Organizados (Primeros 15)</h2>
    <table>
      <thead>
        <tr>
          <th>Archivo</th>
          <th>Categoría</th>
          <th>Extensión</th>
          <th>Tamaño</th>
        </tr>
      </thead>
      <tbody>
"""
    for arch in detalles_archivos[:15]:
        html_reporte += f"""        <tr>
          <td><code>{arch['nombre']}</code></td>
          <td><span class="badge">{arch['categoria']}</span></td>
          <td>{arch['extension']}</td>
          <td>{arch['tamano_kb']} KB</td>
        </tr>\n"""
        
    html_reporte += """      </tbody>
    </table>
  </div>
</body>
</html>
"""
    
    reporte_path = ruta_salida / "resumen_clasificacion.html"
    reporte_path.write_text(html_reporte, encoding="utf-8")
    print(f"Clasificación completada. Total procesados: {total_procesados}.")
    print(f"Reporte generado en: {reporte_path.resolve()}")

if __name__ == "__main__":
    clasificar_y_generar_reporte()
