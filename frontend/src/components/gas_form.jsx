import React, { useEffect, useState } from "react";
import API from "../api";
import { Form, FloatingLabel, Button, Row, Col } from "react-bootstrap";

export default function GasForm({ data = [], setData }) {
  const [entries, setEntries] = useState(
    Array.isArray(data) && data.length
      ? data
      : [{ keterangan: "", jenis_gas: "", fe: "", jumlah: "", emission: "" }]
  );
  const [gases, setGases] = useState([]);

  // Sync parent state
  useEffect(() => {
    setData(entries);
  }, [entries, setData]);

  // Load gas types
  useEffect(() => {
    API.get("/list-gas").then((res) => setGases(res.data));
  }, []);

  const addRow = () => {
    setEntries([
      ...entries,
      { keterangan: "", jenis_gas: "", fe: "", jumlah: "", emission: "" },
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
        <div className="gas-entry-row mb-3 pb-3 border-bottom" key={index}>
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

            {/* Jenis Gas */}
            <Col md={3}>
              <FloatingLabel label="Jenis Gas">
                <Form.Select
                  className="custom-input"
                  value={entry.jenis_gas}
                  onChange={(e) => {
                    const selectedGas = gases.find(g => g.Bahan_Bakar_Gas === e.target.value);
                    handleChange(index, "jenis_gas", e.target.value);
                    handleChange(index, "fe", selectedGas ? selectedGas["Faktor_Emisi_(FE)"] : "");
                  }}
                >
                  <option value="" disabled hidden>Pilih Jenis Gas</option>
                  {gases.map((g) => (
                    <option key={g.Bahan_Bakar_Gas} value={g.Bahan_Bakar_Gas}>
                      {g.Bahan_Bakar_Gas}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>

            {/* Faktor Emisi (FE) */}
            <Col md={2}>
              <FloatingLabel label="Faktor">
                <Form.Control
                  type="text"
                  value={entry.fe}
                  readOnly
                  disabled
                  className="bg-light custom-input text-muted"
                />
              </FloatingLabel>
            </Col>

            {/* Jumlah (Kg) */}
            <Col md={2}>
              <FloatingLabel label="Jumlah">
                <Form.Control
                  type="number"
                  min={0}
                  placeholder=" "
                  className="custom-input"
                  value={entry.jumlah}
                  onChange={(e) => handleChange(index, "jumlah", Number(e.target.value))}
                />
              </FloatingLabel>
            </Col>

            {/* Total Emission Result */}
            <Col md={index === 0 ? 2 : 1}>
              <FloatingLabel label="kgCO₂">
                <Form.Control
                  type="text"
                  value={entry.emission || ""}
                  readOnly
                  disabled
                  className="bg-light fw-bold custom-input text-primary"
                />
              </FloatingLabel>
            </Col>

            {/* Delete Button (Hidden for the first row) */}
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
        <Button variant="outline-primary" className="btn-add-row" onClick={addRow}>
          <i className="bi bi-plus-lg me-2"></i> Add Gas Entry
        </Button>
      </div>
    </div>
  );
}