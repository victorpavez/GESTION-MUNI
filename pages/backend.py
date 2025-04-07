from flask import Flask, request, jsonify
import pandas as pd
from google.oauth2.service_account import Credentials
import gspread
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import os

app = Flask(__name__)

# --- Configuración de Google Sheets ---
SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
CREDENTIALS_FILE = "credenciales.json"  # Reemplazar por tu archivo

creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
gc = gspread.authorize(creds)
sheet = gc.open_by_url("https://docs.google.com/spreadsheets/d/e/2PACX-1vTihqbl1oVVb843wxW0VY-2QddNOV1xul_UIoXh79IciRRktrhECgyvXAGsoSDQiP4KHkUthDWzTtQb/pub?gid=0&single=true&output=csv")
worksheet = sheet.sheet1

# --- Configuración de Google Drive ---
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_FILE
gauth = GoogleAuth()
gauth.LoadCredentialsFile("mycreds.txt")
if gauth.credentials is None:
    gauth.LocalWebserverAuth()
elif gauth.access_token_expired:
    gauth.Refresh()
else:
    gauth.Authorize()
gauth.SaveCredentialsFile("mycreds.txt")
drive = GoogleDrive(gauth)

# --- Endpoint: Obtener proyectos no gestionados ---
@app.route("/proyectos-no-gestionados", methods=["GET"])
def proyectos_no_gestionados():
    data = worksheet.get_all_records()
    no_gestionados = []

    for row in data:
        if not row.get("ETAPAS_CREADAS"):
            no_gestionados.append({
            "id": row.get("ID PROYECTO"),
            "nombre": row.get("NOMBRE DEL PROYECTO"),
            "tipo": row.get("TIPO"),
            "url": row.get("URL CARPETA") or ""
        })

    return jsonify(no_gestionados)

# --- Endpoint: Iniciar gestión de proyecto ---
@app.route("/proyecto/iniciar", methods=["POST"])
def iniciar_proyecto():
    body = request.get_json()
    id_proyecto = body.get("idProyecto")

    # Buscar la fila en la hoja
    data = worksheet.get_all_records()
    for i, row in enumerate(data):
        if str(row.get("ID PROYECTO")) == id_proyecto:
            fila = i + 2  # +2 porque get_all_records omite encabezado y empieza en 0
            nombre_proyecto = row.get("NOMBRE DEL PROYECTO")
            break
    else:
        return jsonify({"error": "Proyecto no encontrado"}), 404

    # Crear carpeta principal del proyecto
    folder_metadata = {
        'title': nombre_proyecto,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    proyecto_folder = drive.CreateFile(folder_metadata)
    proyecto_folder.Upload()
    proyecto_url = f"https://drive.google.com/drive/folders/{proyecto_folder['id']}"

    # Subcarpetas por etapa
    etapas = [
        "01_Factibilidad", "02_Planos", "03_Computo", "04_Memoria", "05_Pliego",
        "06_Aprobacion_Economica", "07_IMUH", "08_Registro_Oposicion",
        "09_Prensa", "10_Legales", "11_Contrataciones", "12_Comienzo_Obra"
    ]

    for etapa in etapas:
        subfolder = drive.CreateFile({
            'title': etapa,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [{'id': proyecto_folder['id']}]
        })
        subfolder.Upload()

    # Marcar en la hoja que se crearon las etapas y guardar el link
    worksheet.update_cell(fila, get_col_index("ETAPAS_CREADAS"), "SI")
    url_col = get_col_index("URL CARPETA")
    if url_col:
        worksheet.update_cell(fila, url_col, proyecto_url)

    return jsonify({"mensaje": "Gestión iniciada y carpetas creadas para el proyecto.", "url": proyecto_url})

# --- Utilidad para obtener índice de columna por nombre ---
def get_col_index(nombre_col):
    encabezados = worksheet.row_values(1)
    for i, col in enumerate(encabezados):
        if col.strip().upper() == nombre_col.strip().upper():
            return i + 1
    return None

if __name__ == "__main__":
    app.run(debug=True)
