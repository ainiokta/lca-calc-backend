from functools import lru_cache
from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from utils.calc_electricity import calc_electricity
from utils.calc_vehicle import calc_vehicle
from utils.calc_gas import calc_gas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or replace "*" with your Netlify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


@lru_cache
def load_electricity():
    import pandas as pd
    return pd.read_csv(DATA_DIR / "fe_electricity.csv")


@lru_cache
def load_fuel():
    import pandas as pd
    return pd.read_csv(DATA_DIR / "fe_bahan_bakar.csv")


@lru_cache
def load_gas():
    import pandas as pd
    return pd.read_csv(DATA_DIR / "fe_bahan_gas.csv")


@app.get("/")
def root():
    return {"status": "ok"}



# ---------- List endpoints ----------
@app.get("/list-provinsi")
def list_provinsi():
    df = load_electricity()
    return df["Provinsi"].unique().tolist()


@app.get("/list-grid")
def list_grid(provinsi: str):
    df = load_electricity()
    rows = df[df["Provinsi"] == provinsi]
    return rows[["Grid", "Faktor_Emisi_(FE)"]].to_dict(orient="records")


@app.get("/list-fuel")
def list_fuel():
    df = load_fuel()
    return df[["Bahan_Bakar_Minyak", "Faktor_Emisi_(FE)"]].to_dict(
        orient="records"
    )


@app.get("/list-gas")
def list_gas():
    df = load_gas()
    return df[["Bahan_Bakar_Gas", "Faktor_Emisi_(FE)"]].to_dict(
        orient="records"
    )


# ---------- Calculation endpoints ----------
@app.get("/calc_electricity")
def calc_elec_api(
    keterangan: str = Query(None),
    provinsi: str = Query(...),
    kwh: float = Query(...),
    grid: str = Query(None),
):
    df = load_electricity()

    rows = df[df["Provinsi"] == provinsi]
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
        "emission_kgCO2": emission,
    }


@app.get("/calc_vehicle")
def calc_vehicle_api(
    keterangan: str = Query(None),
    bahan_bakar: str = Query(...),
    jumlah: float = Query(...),
):
    df = load_fuel()

    rows = df[df["Bahan_Bakar_Minyak"] == bahan_bakar]
    if rows.empty:
        return {"error": "Bahan bakar tidak ditemukan"}

    fe = rows.iloc[0]["Faktor_Emisi_(FE)"]
    emission = calc_vehicle(jumlah, fe)

    return {
        "keterangan": keterangan,
        "bahan bakar": bahan_bakar,
        "jumlah": jumlah,
        "FE": fe,
        "emission_kgCO2": emission,
    }


@app.get("/calc_gas")
def calc_gas_api(
    keterangan: str = Query(None),
    jenis_gas: str = Query(...),
    jumlah: float = Query(...),
):
    df = load_gas()

    rows = df[df["Bahan_Bakar_Gas"] == jenis_gas]
    if rows.empty:
        return {"error": "Bahan gas tidak ditemukan"}

    fe = rows.iloc[0]["Faktor_Emisi_(FE)"]
    emission = calc_gas(jumlah, fe)

    return {
        "keterangan": keterangan,
        "jenis gas": jenis_gas,
        "jumlah": jumlah,
        "FE": fe,
        "emission_kgCO2": emission,
    }
