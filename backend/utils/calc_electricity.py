def calc_electricity(kwh: float, fe: float) -> float:
    """
    Hitung emisi listrik.
    :param kwh: konsumsi listrik dalam kWh
    :param fe: Faktor Emisi (kgCO2/kWh)
    :return: total emisi dalam kgCO2
    """
    return kwh * fe
