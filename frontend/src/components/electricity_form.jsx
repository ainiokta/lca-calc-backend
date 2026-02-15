import React, { useEffect, useRef, useState } from "react";
import API from "../api";
import { Form, FloatingLabel, Button, Row, Col } from "react-bootstrap";

/* ---------- helpers ---------- */

const createEntry = () => ({
  id: crypto.randomUUID(),
  keterangan: "",
  provinsi: "",
  grid: "",
  fe: "",
  kwh: "",
  emission: "",
  grids: [],
  _sig: ""
});

const makeSignature = ({ provinsi, grid, kwh, fe }) =>
  `${provinsi}|${grid}|${kwh}|${fe}`;

/* ---------- component ---------- */

export default function ElectricityForm({ data = [], setData }) {
  const [entries, setEntries] = useState(
    Array.isArray(data) && data.length ? data : [createEntry()]
  );
  const [provinces, setProvinces] = useState([]);

  /* ---------- load provinces once ---------- */
  useEffect(() => {
    API.get("/list-provinsi").then(res => setProvinces(res.data));
  }, []);

  /* ---------- debounced parent sync ---------- */
  const syncTimer = useRef(null);

  useEffect(() => {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      setData(entries);
    }, 300);

    return () => clearTimeout(syncTimer.current);
  }, [entries, setData]);

  /* ---------- row ops ---------- */

  const addRow = () => {
    setEntries(prev => [...prev, createEntry()]);
  };

  const removeRow = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEntry = (id, patch) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, ...patch } : e))
    );
  };

  /* ---------- grid fetch ---------- */

  const fetchGrids = (id, provinsi) => {
    API.get(`/list-grid?provinsi=${provinsi}`).then(res => {
      updateEntry(id, {
        provinsi,
        grids: res.data,
        grid: "",
        fe: "",
        emission: "",
        _sig: ""
      });
    });
  };

  /* ---------- emission calculation ---------- */

  useEffect(() => {
    entries.forEach(entry => {
      const sig = makeSignature(entry);
      if (sig === entry._sig) return;

      const { id, provinsi, grid, kwh, fe, keterangan } = entry;

      if (provinsi && grid && kwh > 0 && fe > 0) {
        API.get("/calc_electricity", {
          params: { keterangan, provinsi, grid, kwh }
        }).then(res => {
          updateEntry(id, {
            emission: res.data.emission_kgCO2 || 0,
            fe: res.data.FE || fe,
            _sig: sig
          });
        });
      } else if (kwh && fe) {
        updateEntry(id, {
          emission: (kwh * fe).toFixed(2),
          _sig: sig
        });
      }
    });
  }, [entries]);

  /* ---------- render ---------- */

  return (
    <div className="px-3 pb-3">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="elec-entry-row mb-3 pb-3 border-bottom"
        >
          <Row className="g-2 align-items-center">

            <Col md={2}>
              <FloatingLabel label="Keterangan">
                <Form.Control
                  value={entry.keterangan}
                  onChange={e =>
                    updateEntry(entry.id, { keterangan: e.target.value })
                  }
                />
              </FloatingLabel>
            </Col>

            <Col md={2}>
              <FloatingLabel label="Provinsi">
                <Form.Select
                  value={entry.provinsi}
                  onChange={e =>
                    fetchGrids(entry.id, e.target.value)
                  }
                >
                  <option value="" disabled hidden>Pilih...</option>
                  {provinces.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>

            <Col md={2}>
              <FloatingLabel label="Grid">
                <Form.Select
                  value={entry.grid}
                  disabled={!entry.provinsi}
                  onChange={e => {
                    const selected = entry.grids.find(
                      g => g.Grid === e.target.value
                    );
                    updateEntry(entry.id, {
                      grid: e.target.value,
                      fe: selected ? selected["Faktor_Emisi_(FE)"] : ""
                    });
                  }}
                >
                  <option value="" disabled hidden>Pilih Grid</option>
                  {entry.grids.map(g => (
                    <option key={g.Grid} value={g.Grid}>{g.Grid}</option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>

            <Col md={1}>
              <FloatingLabel label="FE">
                <Form.Control value={entry.fe} disabled readOnly />
              </FloatingLabel>
            </Col>

            <Col md={2}>
              <FloatingLabel label="Usage (kWh)">
                <Form.Control
                  type="number"
                  min={0}
                  value={entry.kwh}
                  onChange={e =>
                    updateEntry(entry.id, { kwh: Number(e.target.value) })
                  }
                />
              </FloatingLabel>
            </Col>

            <Col md={index === 0 ? 3 : 2}>
              <FloatingLabel label="kgCO₂">
                <Form.Control
                  value={entry.emission || ""}
                  disabled
                  readOnly
                  className="fw-bold text-success"
                />
              </FloatingLabel>
            </Col>

            {index > 0 && (
              <Col md={1} className="text-center">
                <Button
                  variant="outline-danger"
                  onClick={() => removeRow(entry.id)}
                >
                  <i className="bi bi-trash" />
                </Button>
              </Col>
            )}
          </Row>
        </div>
      ))}

      <Button variant="outline-success" onClick={addRow}>
        <i className="bi bi-plus-lg me-2" />
        Add Electricity Entry
      </Button>
    </div>
  );
}
