Set WshShell = CreateObject("WScript.Shell")
' Cambiar al directorio del proyecto
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
' Ejecuta MiniWeb de forma totalmente invisible
WshShell.Run "miniweb.exe -r """ & WshShell.CurrentDirectory & """ -p 8000", 0, False
' Espera un segundo para que arranque y abre el navegador
WScript.Sleep 1000
WshShell.Run "cmd /c start http://localhost:8000", 0, False
