import React, { useEffect, useState } from "react";
import API from "../api";
import { Form, FloatingLabel, Button, Row, Col } from "react-bootstrap";

export default function FuelForm({ data = [], setData }) {
  const [entries, setEntries] = useState(
    Array.isArray(data) && data.length
      ? data
      : [{ keterangan: "", bahan_bakar: "", fe: "", jumlah: "", emission: "" }]
  );
  const [fuels, setFuels] = useState([]);

  useEffect(() => {
    setData(entries);
  }, [entries, setData]);

  useEffect(() => {
    API.get("/list-fuel").then((res) => setFuels(res.data));
  }, []);

  const addRow = () => {
    setEntries([
      ...entries,
      { keterangan: "", bahan_bakar: "", fe: "", jumlah: "", emission: "" },
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
        setEntries([...newEntries]);
      });
    } else {
      newEntries[index].emission = (jumlah && fe) ? (jumlah * fe).toFixed(2) : "";
      setEntries([...newEntries]);
    }
  };

  return (
    <div className="px-3 pb-3">
      {entries.map((entry, index) => (
        <div className="fuel-entry-row mb-3 pb-3 border-bottom" key={index}>
          <Row className="g-2 align-items-center">
            {/* Keterangan */}
            <Col md={3}>
              <FloatingLabel label="Keterangan">
                <Form.Control
                  type="text"
                  placeholder="Keterangan"
                  className="custom-input"
                  value={entry.keterangan}
                  onChange={(e) => handleChange(index, "keterangan", e.target.value)}
                />
              </FloatingLabel>
            </Col>

            {/* Jenis Bahan Bakar */}
            <Col md={3}>
              <FloatingLabel label="Jenis Bahan Bakar">
                <Form.Select
                  className="custom-input"
                  value={entry.bahan_bakar}
                  onChange={(e) => {
                    const selectedFuel = fuels.find(f => f.Bahan_Bakar_Minyak === e.target.value);
                    handleChange(index, "bahan_bakar", e.target.value);
                    handleChange(index, "fe", selectedFuel ? selectedFuel["Faktor_Emisi_(FE)"] : "");
                  }}
                >
                  <option value="" disabled hidden>Pilih...</option>
                  {fuels.map((f) => (
                    <option key={f.Bahan_Bakar_Minyak} value={f.Bahan_Bakar_Minyak}>
                      {f.Bahan_Bakar_Minyak}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>

            {/* FE (Small column) */}
            <Col md={2}>
              <FloatingLabel label="Faktor">
                <Form.Control
                  type="text"
                  value={entry.fe}
                  readOnly
                  disabled
                  className="bg-light custom-input"
                />
              </FloatingLabel>
            </Col>

            {/* Jumlah */}
            <Col md={2}>
              <FloatingLabel label="Liter">
                <Form.Control
                  type="number"
                  min={0}
                  className="custom-input"
                  value={entry.jumlah}
                  onChange={(e) => handleChange(index, "jumlah", Number(e.target.value))}
                />
              </FloatingLabel>
            </Col>

            {/* Total Emission */}
            <Col md={index === 0 ? 2 : 1}>
              <FloatingLabel label="kgCO₂">
                <Form.Control
                  type="text"
                  value={entry.emission || ""}
                  readOnly
                  disabled
                  className="bg-light fw-bold custom-input text-success"
                />
              </FloatingLabel>
            </Col>

            {/* Remove button (Only if not first row) */}
            {index > 0 && (
              <Col md={1} className="text-center">
                <Button 
                  variant="outline-danger" 
                  className="btn-circle"
                  onClick={() => removeRow(index)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </Col>
            )}
          </Row>
        </div>
      ))}

      <div className="mt-3">
        <Button variant="outline-success" className="btn-add-row" onClick={addRow}>
          <i className="bi bi-plus-lg me-2"></i> Add Entry
        </Button>
      </div>
    </div>
  );
}