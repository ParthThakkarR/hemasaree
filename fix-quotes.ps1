$files = @(
    "d:\hemasaree\lib\content\stories.ts",
    "d:\hemasaree\lib\content\occasions.ts",
    "d:\hemasaree\lib\content\motifs.ts"
)

foreach ($f in $files) {
    $txt = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
    $txt = $txt.Replace([char]0x2018, [char]0x27)  # left single quote -> apostrophe
    $txt = $txt.Replace([char]0x2019, [char]0x27)  # right single quote -> apostrophe
    $txt = $txt.Replace([char]0x201C, [char]0x22)  # left double quote -> straight
    $txt = $txt.Replace([char]0x201D, [char]0x22)  # right double quote -> straight
    $txt = $txt -replace [char]0x2014, '-'         # em dash -> single hyphen
    [System.IO.File]::WriteAllText($f, $txt, [System.Text.Encoding]::UTF8)
    Write-Host "Fixed: $f"
}
Write-Host "Done"
