def calc_gas(jumlah: float, fe:float) -> float:
    """
    Hitung emisi gas/LPG.
    :param jumlah: jumlah tabung atau liter gas
    :param fe: Faktor Emisi (kgCO2/unit)
    :return: total emisi dalam kgCO2
    """
    return jumlah * fe