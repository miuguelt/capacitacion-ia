#!/usr/bin/env python3
"""
Script generador de archivos de prueba desordenados para el taller del Día 3.
Crea 200 archivos simulados con diferentes extensiones, fechas y categorías.
"""

import os
import random
from pathlib import Path
from datetime import datetime, timedelta

EXTENSIONES = {
    "documentos": [".pdf", ".docx", ".txt", ".xlsx", ".pptx"],
    "imagenes": [".png", ".jpg", ".svg", ".webp"],
    "codigo": [".html", ".css", ".js", ".py", ".sql"],
    "datos": [".csv", ".json", ".xml"],
    "respaldos": [".zip", ".bak", ".tar.gz"]
}

PREFIJOS = ["acta", "informe", "captura", "reporte", "proyecto", "guia", "respaldo", "evaluacion", "lista", "nota"]
NOMBRES_APRENDICES = ["andres_gomez", "laura_morales", "carlos_rojas", "diana_castillo", "miguel_velez", "valentina_duarte"]

def generar_archivos(directorio_destino="archivos_desordenados", cantidad=200):
    ruta_base = Path(directorio_destino)
    ruta_base.mkdir(parents=True, exist_ok=True)
    
    print(f"Generando {cantidad} archivos simulados en: {ruta_base.resolve()}")
    
    todas_extensiones = [ext for lista in EXTENSIONES.values() for ext in lista]
    
    for i in range(1, cantidad + 1):
        prefijo = random.choice(PREFIJOS)
        aprendiz = random.choice(NOMBRES_APRENDICES)
        numero = random.randint(100, 999)
        ext = random.choice(todas_extensiones)
        
        nombre_archivo = f"{prefijo}_{aprendiz}_{numero}{ext}"
        ruta_archivo = ruta_base / nombre_archivo
        
        # Escribir contenido simulado
        fecha_simulada = (datetime.now() - timedelta(days=random.randint(1, 180))).strftime("%Y-%m-%d %H:%M:%S")
        contenido = (
            f"--- ARCHIVO DE PRUEBA EDUCACIONAL ---\n"
            f"Identificador: {i}\n"
            f"Nombre original: {nombre_archivo}\n"
            f"Tipo detectado: {ext}\n"
            f"Fecha de registro: {fecha_simulada}\n"
            f"Estado: Simulación de práctica para automatización agéntica.\n"
        )
        ruta_archivo.write_text(contenido, encoding="utf-8")
        
    print(f"¡Éxito! Se generaron {cantidad} archivos listos para el reto de ordenamiento.")

if __name__ == "__main__":
    generar_archivos()
