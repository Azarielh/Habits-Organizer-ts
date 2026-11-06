#define AppName "Habits Organizer"
#define AppVersion "1.0.0"
#define AppPublisher "Habits Organizer"
#define AppExeName "HabitsOrganizer.exe"

[Setup]
AppId={{8B2B8696-2205-49AD-9DCE-2EDC733C42E8}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\Habits Organizer
DefaultGroupName={#AppName}
UninstallDisplayIcon={app}\{#AppExeName}
OutputDir=..\dist\installer
OutputBaseFilename=HabitsOrganizer-Setup
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
Compression=lzma2
SolidCompression=yes
WizardStyle=modern

[Files]
Source: "..\dist\windows\{#AppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "Launch.vbs"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#AppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\Launch.vbs"""; WorkingDir: "{app}"
Name: "{autodesktop}\{#AppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\Launch.vbs"""; WorkingDir: "{app}"

[UninstallRun]
Filename: "{sys}\taskkill.exe"; Parameters: "/F /IM {#AppExeName}"; Flags: runhidden; RunOnceId: "StopHabitsOrganizer"
