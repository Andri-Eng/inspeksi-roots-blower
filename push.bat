@echo off
echo =======================================
echo          Git Push Automation
echo =======================================
echo Menampilkan status git saat ini:
git status
echo.

set /p msg="Masukkan pesan commit (kosongkan untuk default 'Perbaikan gambar dan path'): "
if "%msg%"=="" set msg=Perbaikan gambar dan path

echo.
echo [1/3] Menambahkan file ke staging area...
git add .

echo.
echo [2/3] Melakukan commit dengan pesan: "%msg%"...
git commit -m "%msg%"

echo.
echo [3/3] Mengirim perubahan ke GitHub (git push origin main)...
git push origin main

echo.
echo =======================================
echo Proses selesai! Silakan periksa output di atas jika ada error autentikasi.
pause
