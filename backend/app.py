from fastapi import FastAPI, Query
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from utils.calc_electricity import calc_electricity
from utils.calc_vehicle import calc_vehicle
from utils.calc_gas import calc_gas

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

fe_electricity = None
fe_fuel = None
fe_gas = None

@app.on_event("startup")
def load_data():
    global fe_electricity, fe_fuel, fe_gas
    fe_electricity = pd.read_csv(DATA_DIR / "fe_electricity.csv")
    fe_fuel = pd.read_csv(DATA_DIR / "fe_bahan_bakar.csv")
    fe_gas = pd.read_csv(DATA_DIR / "fe_bahan_gas.csv")

@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/list-provinsi")
def list_provinsi():
    load_data()
    return fe_electricity["Provinsi"].unique().tolist()


@app.get("/list-grid")
def list_grid(provinsi: str):
    load_data()
    rows = fe_electricity[fe_electricity["Provinsi"] == provinsi]
    return rows[["Grid", "Faktor_Emisi_(FE)"]].to_dict(orient="records")


@app.get("/list-fuel")
def list_fuel():
    load_data()
    return fe_fuel[["Bahan_Bakar_Minyak", "Faktor_Emisi_(FE)"]].to_dict(orient="records")


@app.get("/list-gas")
def list_gas():
    load_data()
    return fe_gas[["Bahan_Bakar_Gas", "Faktor_Emisi_(FE)"]].to_dict(orient="records")


@app.get("/calc_electricity")
def calc_elec_api(
    keterangan: str = Query(None),
    provinsi: str = Query(...),
    kwh: float = Query(...),
    grid: str = Query(None)
):
    load_data()

    rows = fe_electricity[fe_electricity["Provinsi"] == provinsi]

    if rows.empty:
        return {"error": "Provinsi tidak ditemukan"}

    if grid:
        rows = rows[rows["Grid"] == grid]
        if rows.empty:
            return {"error": "Grid tidak ditemukan"}
    else:
        grid = rows.iloc[0]["Grid"]

    fe = rows.iloc[0]["Faktor_Emisi_(FE)"]
    emission = calc_electricity(kwh, fe)

    return {
        "keterangan": keterangan,
        "provinsi": provinsi,
        "grid": grid,
        "kwh": kwh,
        "FE": fe,
        "emission_kgCO2": emission
    }


@app.get("/calc_vehicle")
def calc_vehicle_api(
    keterangan: str = Query(None),
    bahan_bakar: str = Query(...),
    jumlah: float = Query(...)
):
    load_data()

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
    keterangan: str = Query(None),
    jenis_gas: str = Query(...),
    jumlah: float = Query(...)
):
    load_data()

    rows = fe_gas[fe_gas["Bahan_Bakar_Gas"] == jenis_gas]

    if rows.empty:
        return {"error": "Bahan gas tidak ditemukan"}

    fe = rows.iloc[0]["Faktor_Emisi_(FE)"]
    emission = calc_gas(jumlah, fe)

    return {
        "keterangan": keterangan,
        "jenis gas": jenis_gas,
        "jumlah": jumlah,
        "FE": fe,
        "emission_kgCO2": emission
    }
