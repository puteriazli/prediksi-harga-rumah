import os
import json
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# ============================================================
# ⚙️ Inisialisasi Flask App
# ============================================================
app = Flask(__name__)
CORS(app)

# ============================================================
# 📁 Path File Model
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "yogyakarta_model.pkl")

# ============================================================
# 🧠 Load Model Saat Server Dimulai
# ============================================================
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"❌ File model tidak ditemukan di: {MODEL_PATH}")

try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model berhasil dimuat dari: {MODEL_PATH}")
except Exception as e:
    raise RuntimeError(f"❌ Gagal memuat model dari {MODEL_PATH}: {e}")

# ============================================================
# 🏷️ Kolom yang Diperlukan (sesuai X saat training)
# ============================================================
REQUIRED_FIELDS = [
    "location",
    "bed",
    "bath",
    "carport",
    "surface_area",
    "building_area"
]

# ============================================================
# 🏠 Endpoint Utama
# ============================================================
@app.route("/")
def home():
    return jsonify({
        "status": "ok",
        "message": "Flask backend aktif 🚀. Gunakan endpoint /predict untuk melakukan prediksi harga rumah."
    })

# ============================================================
# 💰 Endpoint Prediksi Harga Rumah
# ============================================================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Body request kosong atau format JSON tidak valid."}), 400

    # 🧩 PETA FIELD dari frontend (Bahasa Indonesia) ke model
    FIELD_MAPPING = {
        "kota": "location",
        "jumlah_kamar_tidur": "bed",
        "jumlah_kamar_mandi": "bath",
        "muatan_parkir": "carport",
        "luas_tanah": "surface_area",
        "luas_bangunan": "building_area",
    }

    # Ganti nama field sesuai model
    mapped_data = {FIELD_MAPPING.get(k, k): v for k, v in data.items()}

    # Pastikan semua field wajib terisi
    REQUIRED_FIELDS = ["location", "bed", "bath", "carport", "surface_area", "building_area"]
    missing = [f for f in REQUIRED_FIELDS if f not in mapped_data or mapped_data[f] in [None, ""]]
    if missing:
        return jsonify({"error": f"Field berikut wajib diisi: {', '.join(missing)}"}), 400

    try:
        df_input = pd.DataFrame([{
            "location": mapped_data["location"],
            "bed": float(mapped_data["bed"]),
            "bath": float(mapped_data["bath"]),
            "carport": float(mapped_data["carport"]),
            "surface_area": float(mapped_data["surface_area"]),
            "building_area": float(mapped_data["building_area"]),
        }])

        print("\n✅ Data diterima:", df_input)

        predicted = model.predict(df_input)[0]
        predicted = max(1_000_000, float(predicted))

        return jsonify({"predicted_price": int(round(predicted)), "currency": "IDR"})
    except Exception as e:
        print("❌ Error prediksi:", str(e))
        return jsonify({"error": f"Gagal melakukan prediksi: {str(e)}"}), 500


# ============================================================
# 🚀 Main Entry Point
# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
