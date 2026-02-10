from fastapi import FastAPI
from fastapi import Query
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

from utils.calc_electricity import calc_electricity
from utils.calc_vehicle import calc_vehicle
from utils.calc_gas import calc_gas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # bisa juga ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Carbon Calculator API is running 🚀"}

# Load dataset
fe_electricity = pd.read_csv("data/fe_electricity.csv")
fe_fuel = pd.read_csv("data/fe_bahan_bakar.csv")
fe_gas = pd.read_csv("data/fe_bahan_gas.csv")

@app.get("/list-provinsi")
def list_provinsi():
    return fe_electricity["Provinsi"].unique().tolist()

@app.get("/list-grid")
def list_grid(provinsi: str):
    rows = fe_electricity[fe_electricity["Provinsi"] == provinsi]
    return rows[["Grid", "Faktor_Emisi_(FE)"]].to_dict(orient="records")

@app.get("/list-fuel")
def list_fuel():
    return fe_fuel[["Bahan_Bakar_Minyak", "Faktor_Emisi_(FE)"]].to_dict(orient="records")


@app.get("/list-gas")
def list_gas():
    return fe_gas[["Bahan_Bakar_Gas", "Faktor_Emisi_(FE)"]].to_dict(orient="records")

@app.get("/calc_electricity")
def calc_elec_api(
    keterangan: str = Query(None, description="Keterangan gedung/ruangan"),
    provinsi: str = Query(..., description="Provinsi"),
    kwh: float = Query(..., description="Konsumsi listrik (kWh)"),
    grid: str = Query(None, description="Grid (opsional)")
):
    rows = fe_electricity[fe_electricity["Provinsi"] == provinsi]

    if rows.empty:
        return {"error": "Provinsi tidak ditemukan"}

    # jika grid tidak dipilih, ambil grid pertama
    if grid:
        rows = rows[rows["Grid"] == grid]
        if rows.empty:
            return {"error": "Grid tidak ditemukan"}
    else:
        grid = rows.iloc[0]["Grid"]

    fe = rows.iloc[0]["Faktor_Emisi_(FE)"]
    emission = calc_electricity(kwh, fe)

    return {
        "keterangan": keterangan,  # dikembalikan di response
        "provinsi": provinsi,
        "grid": grid,
        "kwh": kwh,
        "FE": fe,
        "emission_kgCO2": emission
    }

@app.get("/calc_vehicle")
def calc_vehicle_api(
    keterangan: str = Query(None, description="Keterangan"),
    bahan_bakar: str = Query(..., description="Jenis Bahan Bakar"),
    jumlah: float = Query(..., description="Konsumsi bahan bakar (liter)")
):
    rows = fe_fuel[fe_fuel["Bahan_Bakar_Minyak"] == bahan_bakar]

    if rows.empty:
        return {"error": "Bahan bakar tidak ditemukan"}

    fe = rows.iloc[0]["Faktor_Emisi_(FE)"]
    emission = calc_vehicle(jumlah, fe)

    return {
        "keterangan": keterangan,
        "bahan bakar": bahan_bakar,
        "jumlah": jumlah,
        "FE": fe,
        "emission_kgCO2": emission
    }


@app.get("/calc_gas")
def calc_gas_api(
    keterangan: str = Query(None, description="Keterangan"),
    jenis_gas: str = Query(..., description="Jenis Gas"),
    jumlah: float = Query(..., description="Konsumsi bahan bakar (liter)")
):
    rows = fe_gas[fe_gas["Bahan_Bakar_Gas"] == jenis_gas]

    if rows.empty:
        return {"error": "Bahan gas tidak ditemukan"}

    fe = rows.iloc[0]["Faktor_Emisi_(FE)"]
    emission = calc_vehicle(jumlah, fe)

    return {
        "keterangan": keterangan,
        "jenis gas": jenis_gas,
        "jumlah": jumlah,
        "FE": fe,
        "emission_kgCO2": emission
    }

