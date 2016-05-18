:START
@echo off
REM color 0b
:SET_VARIABLES
title ILoveRadio Bot Launcher by Bluscream - %date% , %time%
:MENU_MAIN
cls
ECHO.
ECHO      ILoveRadio
ECHO ---------------------
ECHO    Choose Bot Type
ECHO ---------------------
ECHO.
ECHO 1 - Normal client
ECHO 2 - Bot client
ECHO 3 - Spam Bot
ECHO 4 - EXIT
ECHO.
SET /P M=Type 1, 2, 3, or 4 then press ENTER:
IF %M%==1 GOTO CLIENT_NORMAL
IF %M%==2 GOTO CLIENT_BOT
IF %M%==3 GOTO CLIENT_SPAM
IF %M%==4 GOTO EXIT
GOTO MENU_MAIN
:CLIENT_NORMAL
cls
ECHO ---------------------
ECHO      ILoveRadio
ECHO ---------------------
ECHO.
node client.js
GOTO CLIENT_NORMAL
:CLIENT_BOT
cls
ECHO ---------------------
ECHO      ILoveRadio
ECHO ---------------------
ECHO.
node bot.js
GOTO CLIENT_BOT
:CLIENT_SPAM
cls
ECHO ---------------------
ECHO      ILoveRadio
ECHO ---------------------
ECHO.
node spam.js
GOTO CLIENT_SPAM
:PAUSE
pause
:EXIT
exit
:REBOOT
shutdown /r /t 0