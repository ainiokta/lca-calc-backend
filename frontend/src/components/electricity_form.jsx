import React, { useEffect, useState } from "react";
import API from "../api";
import { Form, FloatingLabel, Button, Row, Col } from "react-bootstrap";

export default function ElectricityForm({ data = [], setData }) {
    const [entries, setEntries] = useState(
        Array.isArray(data) && data.length
        ? data
        : [{ keterangan: "", provinsi: "", grid: "", fe: "", kwh: "", emission: "", grids: [] }]
    );
    const [provinces, setProvinces] = useState([]);

    // Sync parent state whenever entries change
    useEffect(() => {
        setData(entries);
    }, [entries, setData]);

    // Load provinces once
    useEffect(() => {
        API.get("/list-provinsi").then((res) => setProvinces(res.data));
    }, []);

    const addRow = () => {
        setEntries([
        ...entries,
        { keterangan: "", provinsi: "", grid: "", fe: "", kwh: "", emission: "", grids: [] }
        ]);
    };

    const removeRow = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;

        const { kwh, fe, provinsi, grid, keterangan } = newEntries[index];

        if (provinsi && grid && kwh > 0 && fe > 0) {
            API.get("/calc_electricity", {
                params: { keterangan, provinsi, grid, kwh }
            }).then(res => {
                newEntries[index].emission = res.data.emission_kgCO2 || 0;
                newEntries[index].fe = res.data.FE || fe;
                setEntries([...newEntries]);
            });
        } else {
            newEntries[index].emission = (kwh && fe) ? (kwh * fe).toFixed(2) : "";
            setEntries([...newEntries]);
        }
    };

    const fetchGrids = (index, prov) => {
        API.get(`/list-grid?provinsi=${prov}`).then(res => {
            const newEntries = [...entries];
            newEntries[index].grids = res.data;
            newEntries[index].grid = ""; 
            newEntries[index].fe = "";
            setEntries(newEntries);
        });
    };

    return (
        <div className="px-3 pb-3">
            {entries.map((entry, index) => (
                <div className="elec-entry-row mb-3 pb-3 border-bottom" key={index}>
                    <Row className="g-2 align-items-center">
                        {/* Keterangan */}
                        <Col md={2}>
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

                        {/* Provinsi */}
                        <Col md={2}>
                            <FloatingLabel label="Provinsi">
                                <Form.Select
                                    className="custom-input"
                                    value={entry.provinsi}
                                    onChange={(e) => {
                                        const newProv = e.target.value;
                                        handleChange(index, "provinsi", newProv);
                                        fetchGrids(index, newProv);
                                    }}
                                >
                                    <option value="" disabled hidden>Pilih...</option>
                                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                </Form.Select>
                            </FloatingLabel>
                        </Col>

                        {/* Grid */}
                        <Col md={2}>
                            <FloatingLabel label="Grid">
                                <Form.Select
                                    className="custom-input"
                                    value={entry.grid}
                                    disabled={!entry.provinsi}
                                    onChange={(e) => {
                                        const selectedGrid = entry.grids.find(g => g.Grid === e.target.value);
                                        handleChange(index, "grid", e.target.value);
                                        handleChange(index, "fe", selectedGrid ? selectedGrid["Faktor_Emisi_(FE)"] : 0);
                                    }}
                                >
                                    <option value="" disabled hidden>Pilih Grid</option>
                                    {entry.grids?.map(g => (
                                        <option key={g.Grid} value={g.Grid}>{g.Grid}</option>
                                    ))}
                                </Form.Select>
                            </FloatingLabel>
                        </Col>

                        {/* FE */}
                        <Col md={1}>
                            <FloatingLabel label="FE">
                                <Form.Control 
                                    type="text" 
                                    value={entry.fe} 
                                    readOnly 
                                    disabled 
                                    className="bg-light custom-input text-muted" 
                                />
                            </FloatingLabel>
                        </Col>

                        {/* kWh */}
                        <Col md={2}>
                            <FloatingLabel label="Usage (kWh)">
                                <Form.Control
                                    type="number"
                                    min={0}
                                    placeholder=" "
                                    className="custom-input"
                                    value={entry.kwh}
                                    onChange={(e) => handleChange(index, "kwh", Number(e.target.value))}
                                />
                            </FloatingLabel>
                        </Col>

                        {/* Total Emission Result */}
                        <Col md={index === 0 ? 3 : 2}>
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
                    <i className="bi bi-plus-lg me-2"></i> Add Electricity Entry
                </Button>
            </div>
        </div>
    );
}