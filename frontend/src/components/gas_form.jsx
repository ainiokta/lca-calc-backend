import React, { useEffect, useState } from "react";
import API from "../api";
import { Card, Form, FloatingLabel, Button } from "react-bootstrap";

export default function GasForm({ data = [], setData }) {
  const [entries, setEntries] = useState(
    Array.isArray(data) && data.length
      ? data
      : [{ keterangan: "", jenis_gas: "", fe: "", jumlah: "", emission: null, gases:[] }]
  );
  const [gases, setGases] = useState([]);

  // Sync parent state
  useEffect(() => {
    setData(entries);
  }, [entries]);

  // Load jenis bahan bakar once
  useEffect(() => {
    API.get("/list-gas").then((res) => setGases(res.data));
  }, []);

  const addRow = () => {
    setEntries([
      ...entries,
      { keterangan: "", jenis_gas: "", fe: "", jumlah: "", emission: null, gases: [] },
    ]);
  };

  const removeRow = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;

    const { keterangan, jenis_gas, fe, jumlah } = newEntries[index];

    if (jenis_gas && fe > 0 && jumlah > 0) {
      API.get("/calc_gas", {
        params: { keterangan, jenis_gas, jumlah },
      }).then((res) => {
        newEntries[index].emission = res.data.emission_kgCO2 || 0;
        newEntries[index].fe = res.data.FE || "";
        setEntries(newEntries);
      });
    } else {
      if (!fe) newEntries[index].fe = "";
      newEntries[index].emission = (jumlah && fe) ? (jumlah * fe).toFixed(2) : "";
      setEntries(newEntries);
    }
  };

  return (
    <div>
      {entries.map((entry, index) => (
        <Card className="mb-3" key={index}>
          <Card.Body>
            <div className="row g-2 align-items-center">
              {/* Keterangan */}
              <div className="col">
                <FloatingLabel
                  controlId={`keterangan-${index}`}
                  label="Keterangan"
                >
                  <Form.Control
                    type="text"
                    placeholder="Keterangan"
                    value={entry.keterangan}
                    onChange={(e) =>
                      handleChange(index, "keterangan", e.target.value)
                    }
                  />
                </FloatingLabel>
              </div>

              {/* Jenis Bahan Bakar */}
              <div className="col">
                <FloatingLabel
                  controlId={`jenisgas-${index}`}
                  label="Jenis Gas"
                >
                  <Form.Select
                    value={entry.jenis_gas}
                    onChange={(e) => {
                    const selectedGas = gases.find(
                        (f) => f.Bahan_Bakar_Gas === e.target.value
                    );
                    handleChange(index, "jenis_gas", e.target.value);
                    handleChange(index, "fe", selectedGas ? selectedGas["Faktor_Emisi_(FE)"] : "");
                    }}
                    placeholder=""
                  >
                    <option value="" disabled hidden>
                      Pilih Jenis Gas
                    </option>
                    {gases.map((f) => (
                        <option key={f.Bahan_Bakar_Gas} value={f.Bahan_Bakar_Gas}>
                            {f.Bahan_Bakar_Gas}
                        </option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
              </div>

              {/* FE */}
              <div className="col">
                <FloatingLabel controlId={`fe-${index}`} label="Faktor Emisi">
                  <Form.Control
                    type="text"
                    value={entry.fe}
                    placeholder=""
                    readOnly
                    disabled
                  />
                </FloatingLabel>
              </div>

              {/* Jumlah (liter) */}
              <div className="col">
                <FloatingLabel controlId={`jumlah-${index}`} label="Jumlah Pemakaian (Kg)">
                  <Form.Control
                    type="number"
                    placeholder=" "
                    min={0}
                    value={entry.jumlah}
                    onChange={(e) =>
                      handleChange(index, "jumlah", Number(e.target.value))
                    }
                  />
                </FloatingLabel>
              </div>

              {/* Total Emission */}
              <div className="col">
                <FloatingLabel
                  controlId={`emission-${index}`}
                  label="Total Emisi (kgCO₂)"
                >
                  <Form.Control
                    type="text"
                    placeholder=" "
                    value={entry.emission || ""}
                    readOnly
                    disabled
                  />
                </FloatingLabel>
              </div>

              {/* Remove button */}
              <div className="col-auto">
                <Button variant="danger" onClick={() => removeRow(index)}>
                  x
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}

      <Button variant="primary" onClick={addRow}>
        Add
      </Button>
    </div>
  );
}
