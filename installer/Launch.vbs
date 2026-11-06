Option Explicit

Dim shell, fso, appDir, dataDir, exePath, env, request, attempt
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
dataDir = shell.ExpandEnvironmentStrings("%APPDATA%") & "\Habits Organizer"
exePath = appDir & "\HabitsOrganizer.exe"

If Not fso.FolderExists(dataDir) Then fso.CreateFolder(dataDir)
Set env = shell.Environment("PROCESS")
env("HABITS_ORGANIZER_DATA_DIR") = dataDir

' Start the local server without opening a console window.
shell.Run Chr(34) & exePath & Chr(34), 0, False

' Wait for the health endpoint before opening the app.
Set request = CreateObject("MSXML2.XMLHTTP")
For attempt = 1 To 40
  On Error Resume Next
  request.Open "GET", "http://127.0.0.1:3001/api/health", False
  request.Send
  If Err.Number = 0 And request.Status = 200 Then
    On Error GoTo 0
    shell.Run "http://127.0.0.1:3001", 1, False
    WScript.Quit 0
  End If
  Err.Clear
  On Error GoTo 0
  WScript.Sleep 250
Next

MsgBox "Habits Organizer n'a pas pu démarrer. Vérifiez que le port 3001 est disponible.", vbExclamation, "Habits Organizer"
