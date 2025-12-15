import os
import venv
import subprocess
import argparse

ENV_DIR = ".venv"
REQUIREMENTS_FILE = "srcs/requirements.txt"
PYTHON_EXECUTABLE = os.path.join( ENV_DIR, "Scripts", "python.exe" ) if ( os.name == "nt" ) else os.path.join( ENV_DIR, "bin", "python" )

def create_virtualenv():
	if ( not os.path.exists( ENV_DIR ) ):
		print( "[+] Creating virtual environment..." )
		venv.create( ENV_DIR, with_pip=True )
	else:
		print( "[✓] Virtual environment already exists." )

def install_requirements():
	if ( not os.path.isfile( REQUIREMENTS_FILE ) ):
		print( "[!] requirements.txt missing." )
		return

	print( "[+] Installing requirements..." )
	subprocess.check_call( [ PYTHON_EXECUTABLE, "-m", "pip", "install", "--upgrade", "pip" ] )
	subprocess.check_call( [ PYTHON_EXECUTABLE, "-m", "pip", "install", "-r", REQUIREMENTS_FILE ] )

if ( __name__ == "__main__" ):
	parser = argparse.ArgumentParser()
	parser.add_argument( "--skip", type=str, default="false" )
	args = parser.parse_args()

	if ( args.skip == "false" ):
		create_virtualenv()
		install_requirements()
	elif ( args.skip != "true" ):
		print( "--skip can only be equal to true or false." )
		exit(1)
	
	subprocess.run( [ PYTHON_EXECUTABLE, "srcs/main.py" ] )