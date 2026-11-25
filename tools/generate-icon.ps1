$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot 'build'
$outputPath = Join-Path $outputDirectory 'icon.png'

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

$size = 512
$bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.Clear([System.Drawing.Color]::Transparent)

    $outer = [System.Drawing.RectangleF]::new(22, 22, 468, 468)
    $radius = 112
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = $radius * 2
    $path.AddArc($outer.X, $outer.Y, $diameter, $diameter, 180, 90)
    $path.AddArc($outer.Right - $diameter, $outer.Y, $diameter, $diameter, 270, 90)
    $path.AddArc($outer.Right - $diameter, $outer.Bottom - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($outer.X, $outer.Bottom - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    $gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        $outer,
        [System.Drawing.Color]::FromArgb(255, 105, 226, 255),
        [System.Drawing.Color]::FromArgb(255, 5, 111, 190),
        42.0
    )
    $graphics.FillPath($gradient, $path)

    $highlight = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(45, 255, 255, 255))
    $graphics.FillEllipse($highlight, 38, 30, 365, 240)
    $graphics.FillEllipse($highlight, 325, 60, 55, 55)

    $playPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $playPath.AddPolygon([System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(207, 150),
        [System.Drawing.PointF]::new(207, 362),
        [System.Drawing.PointF]::new(371, 256)
    ))
    $playBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(250, 255, 255, 255))
    $graphics.FillPath($playBrush, $playPath)

    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output $outputPath
}
finally {
    if ($playBrush) { $playBrush.Dispose() }
    if ($playPath) { $playPath.Dispose() }
    if ($highlight) { $highlight.Dispose() }
    if ($gradient) { $gradient.Dispose() }
    if ($path) { $path.Dispose() }
    $graphics.Dispose()
    $bitmap.Dispose()
}
