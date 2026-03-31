@echo off
rem Copia i file aggiornati
copy C:\Progetti\gestioneZRL\data\riders.csv C:\Progetti\ZRL\data\riders.csv
copy C:\Progetti\gestioneZRL\data\riders.json C:\Progetti\ZRL\data\riders.json

cd C:\Progetti\ZRL

git add data/riders.csv data/riders.json
git commit -m "Aggiornati riders.csv e riders.json"
git push origin main
