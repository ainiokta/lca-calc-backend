import React, { useEffect, useState } from "react";
import API from "../api";
import { Card, Form, FloatingLabel, Button } from "react-bootstrap";

export default function FuelForm({ data = [], setData }) {
  const [entries, setEntries] = useState(
    Array.isArray(data) && data.length
      ? data
      : [{ keterangan: "", bahan_bakar: "", fe: "", jumlah: "", emission: null, fuels:[] }]
  );
  const [fuels, setFuels] = useState([]);

  // Sync parent state
  useEffect(() => {
    setData(entries);
  }, [entries]);

  // Load jenis bahan bakar once
  useEffect(() => {
    API.get("/list-fuel").then((res) => setFuels(res.data));
  }, []);

  const addRow = () => {
    setEntries([
      ...entries,
      { keterangan: "", bahan_bakar: "", fe: "", jumlah: "", emission: null, fuels: [] },
    ]);
  };

  const removeRow = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;

    const { keterangan, bahan_bakar, fe, jumlah } = newEntries[index];

    if (bahan_bakar && fe > 0 && jumlah > 0) {
      API.get("/calc_vehicle", {
        params: { keterangan, bahan_bakar, jumlah },
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
          <Card.Body style={{margin:"0px", marginLeft: "5px",padding: "0px", alignContent: "center"}}>
            <div className="row align-items-center" style={{margin:"0px",padding: "0px"}}>
              {/* Keterangan */}
              <div className="col justify-content-between"style={{margin:"0px"}}>
                <FloatingLabel controlId={`keterangan-${index}`} label="Keterangan">
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
              <div className="col justify-content-between"style={{margin:"0px"}}>
                <FloatingLabel
                  controlId={`bahanbakar-${index}`}
                  label="Jenis Bahan Bakar"
                >
                  <Form.Select
                    value={entry.bahan_bakar}
                    onChange={(e) => {
                    const selectedFuel = fuels.find(
                        (f) => f.Bahan_Bakar_Minyak === e.target.value
                    );
                    handleChange(index, "bahan_bakar", e.target.value);
                    handleChange(index, "fe", selectedFuel ? selectedFuel["Faktor_Emisi_(FE)"] : "");
                    }}
                  >
                    <option value="" disabled hidden>
                      Pilih Bahan Bakar
                    </option>
                    {fuels.map((f) => (
                        <option key={f.Bahan_Bakar_Minyak} value={f.Bahan_Bakar_Minyak}>
                            {f.Bahan_Bakar_Minyak}
                        </option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
              </div>

              {/* FE */}
              <div className="col justify-content-between"style={{margin:"0px"}}>
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
              <div className="col justify-content-between"style={{margin:"0px"}}>
                <FloatingLabel controlId={`jumlah-${index}`} label="Jumlah Pemakaian (Liter)">
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
              <div className="col justify-content-between"style={{margin:"0px"}}>
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
