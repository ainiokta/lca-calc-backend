def calc_vehicle(liter: float, fe: float) -> float:
    """
    Hitung emisi kendaraan.
    :param liter: jumlah bahan bakar (liter)
    :param fe: Faktor Emisi (kgCO2/liter)
    :return: total emisi dalam kgCO2
    """
    return liter * fe
