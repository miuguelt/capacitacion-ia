<#
.SYNOPSIS
    Script en PowerShell para generar 200 archivos de prueba desordenados.
.DESCRIPTION
    Crea archivos con extensiones variadas en una carpeta local para practicar
    la automatización mediante agentes de IA y scripts de administración.
#>

param(
    [string]$DirectorioDestino = "archivos_desordenados",
    [int]$Cantidad = 200
)

$extensiones = @(".pdf", ".docx", ".txt", ".xlsx", ".png", ".jpg", ".html", ".js", ".py", ".csv", ".json", ".zip")
$prefijos = @("acta", "informe", "captura", "reporte", "proyecto", "guia", "respaldo", "evaluacion")
$aprendices = @("andres_gomez", "laura_morales", "carlos_rojas", "diana_castillo", "miguel_velez")

if (-not (Test-Path $DirectorioDestino)) {
    New-Item -ItemType Directory -Path $DirectorioDestino -Force | Out-Null
}

Write-Host "Generando $Cantidad archivos en $DirectorioDestino..." -ForegroundColor Cyan

1..$Cantidad | ForEach-Object {
    $p = $prefijos | Get-Random
    $a = $aprendices | Get-Random
    $n = Get-Random -Minimum 100 -Maximum 999
    $ext = $extensiones | Get-Random
    $nombre = "${p}_${a}_${n}${ext}"
    $ruta = Join-Path $DirectorioDestino $nombre
    
    $contenido = @"
--- ARCHIVO DE PRUEBA EDUCACIONAL ---
ID: $_
Nombre: $nombre
Extension: $ext
Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Estado: Generado para práctica de clasificación agéntica
"@
    Set-Content -Path $ruta -Value $contenido -Encoding UTF8
}

Write-Host "Completado: $Cantidad archivos listos en '$DirectorioDestino'." -ForegroundColor Green
