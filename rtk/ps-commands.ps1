Get-Command -CommandType Cmdlet, Function |
  Where-Object { $_.ModuleName -like "Microsoft.PowerShell.*" -or $_.ModuleName -eq $null } |
  Select-Object -ExpandProperty Name |
  Sort-Object
