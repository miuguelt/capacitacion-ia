"""
Pruebas automatizadas de los materiales didácticos del proyecto capacitacion-ia.
"""

import os
from pathlib import Path
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent
MATERIALES_DIR = BASE_DIR / "materiales"

def test_materiales_directory_structure():
    assert MATERIALES_DIR.exists(), "La carpeta 'materiales' debe existir"
    dias_esperados = ["dia1_prompting", "dia2_multimedia", "dia3_agentes_web", "dia4_agentes_integrador", "gemini_canvas"]
    for d in dias_esperados:
        sub = MATERIALES_DIR / d
        assert sub.exists() and sub.is_dir(), f"El subdirectorio {d} debe existir"

def test_gemini_canvas_files_exist():
    gc = MATERIALES_DIR / "gemini_canvas"
    guia = gc / "guia_gemini_canvas_todas_las_posibilidades.md"
    dataset = gc / "banco_prompts_canvas.json"
    assert guia.exists() and guia.stat().st_size > 100
    assert dataset.exists() and dataset.stat().st_size > 100
    assert "Gemini Canvas" in guia.read_text(encoding="utf-8")

def test_dia1_files_exist():
    d1 = MATERIALES_DIR / "dia1_prompting"
    caso = d1 / "caso_estudio_comite_desordenado.txt"
    prompts = d1 / "banco_prompts_referencia.md"
    
    assert caso.exists() and caso.stat().st_size > 50, "El caso de estudio debe tener contenido"
    assert prompts.exists() and prompts.stat().st_size > 100, "El banco de prompts debe tener contenido"
    assert "R-C-I-R-F" in prompts.read_text(encoding="utf-8"), "El banco de prompts debe mencionar la fórmula R-C-I-R-F"

def test_dia2_files_exist():
    d2 = MATERIALES_DIR / "dia2_multimedia"
    ideogram = d2 / "guia_prompts_imagenes_ideogram.md"
    guion = d2 / "guion_capsula_aprendizaje.md"
    
    assert ideogram.exists() and ideogram.stat().st_size > 50
    assert guion.exists() and guion.stat().st_size > 50
    assert "Ideogram" in ideogram.read_text(encoding="utf-8")

def test_dia3_files_exist():
    d3 = MATERIALES_DIR / "dia3_agentes_web"
    gen_py = d3 / "generar_archivos_prueba.py"
    gen_ps = d3 / "generar_archivos_prueba.ps1"
    organizador = d3 / "organizador_archivos.py"
    json_data = d3 / "datos_seguimiento.json"
    plantilla = d3 / "plantilla_3_archivos"
    
    assert gen_py.exists() and gen_py.stat().st_size > 50
    assert gen_ps.exists() and gen_ps.stat().st_size > 50
    assert organizador.exists() and organizador.stat().st_size > 50
    assert json_data.exists() and json_data.stat().st_size > 50
    guia_pi = d3 / "guia_propiedad_intelectual_y_apis.md"
    assert guia_pi.exists() and guia_pi.stat().st_size > 50
    assert "Copyleft" in guia_pi.read_text(encoding="utf-8")
    assert (plantilla / "index.html").exists()
    assert (plantilla / "styles.css").exists()
    assert (plantilla / "app.js").exists()

def test_dia4_files_exist():
    d4 = MATERIALES_DIR / "dia4_agentes_integrador"
    tutor = d4 / "plantilla_system_prompt_tutor.md"
    rubrica = d4 / "rubrica_evaluacion_demo_day.md"
    guia_gob = d4 / "guia_gobernanza_sesgos_corporativos.md"
    
    assert tutor.exists() and tutor.stat().st_size > 50
    assert rubrica.exists() and rubrica.stat().st_size > 50
    assert guia_gob.exists() and guia_gob.stat().st_size > 50
    assert "sesgos" in guia_gob.read_text(encoding="utf-8").lower()
    assert "System Prompt" in tutor.read_text(encoding="utf-8")

def test_generator_and_organizer_execution(tmp_path):
    """Ejecuta el generador con pocos archivos y luego los organiza para comprobar la funcionalidad."""
    import sys
    sys.path.insert(0, str(MATERIALES_DIR / "dia3_agentes_web"))
    
    from generar_archivos_prueba import generar_archivos
    from organizador_archivos import clasificar_y_generar_reporte
    
    dir_prueba = tmp_path / "prueba_desordenada"
    dir_organizado = tmp_path / "prueba_organizada"
    
    generar_archivos(directorio_destino=str(dir_prueba), cantidad=10)
    archivos_generados = list(dir_prueba.glob("*"))
    assert len(archivos_generados) == 10
    
    clasificar_y_generar_reporte(directorio_origen=str(dir_prueba), directorio_salida=str(dir_organizado))
    assert (dir_organizado / "resumen_clasificacion.html").exists()
