Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\talsh\.gemini\antigravity\scratch\dropzone\terrain-loop.jpg")
Write-Output "Dimensions: $($img.Width)x$($img.Height)"
$img.Dispose()
