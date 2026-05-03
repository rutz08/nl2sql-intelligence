@echo off
echo Starting 30-second delayed retry tests...
python test_phase3_failed.py
echo Updating Desktop report...
python compile_report.py
python generate_desktop_report.py
echo Done!
