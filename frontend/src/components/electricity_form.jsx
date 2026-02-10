import React, { useEffect, useState } from "react";
import API from "../api";
import { Card, Form, FloatingLabel, Button } from "react-bootstrap";

export default function ElectricityForm({ data = [], setData }) {
    const [entries, setEntries] = useState(
        Array.isArray(data) && data.length
        ? data
        : [{ keterangan: "", provinsi: "", grid: "", fe: "", kwh: "", emission: null, grids: [] }]
    );
    const [provinces, setProvinces] = useState([]);

    // Sync parent state whenever entries change
    useEffect(() => {
        setData(entries);
    }, [entries]);

    // Load provinces once
    useEffect(() => {
        API.get("/list-provinsi").then((res) => setProvinces(res.data));
    }, []);

    const addRow = () => {
        setEntries([
        ...entries,
        { keterangan: "", provinsi: "", grid: "", fe: "", kwh: "", emission: null, grids: [] }
        ]);
    };

    const removeRow = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;

    const { kwh, fe, provinsi, grid, keterangan } = newEntries[index];

    // Only call API if provinsi, grid, kwh, and FE exist
    if (provinsi && grid && kwh > 0 && fe > 0) {
        API.get("/calc_electricity", {
        params: { keterangan, provinsi, grid, kwh }
        }).then(res => {
        newEntries[index].emission = res.data.emission_kgCO2 || 0;
        newEntries[index].fe = res.data.FE || fe;
        setEntries(newEntries);
        });
    } else {
        // Keep FE empty if not selected
        if (!fe) newEntries[index].fe = "";

        // Keep emission empty until kWh and FE exist
        newEntries[index].emission = (kwh && fe) ? (kwh * fe).toFixed(2) : "";
        
        setEntries(newEntries);
    }
    };

    // Fetch grids for a specific row when provinsi changes
    const fetchGrids = (index, prov) => {
        API.get(`/list-grid?provinsi=${prov}`).then(res => {
        const newEntries = [...entries];
        newEntries[index].grids = res.data;
        newEntries[index].grid = ""; // reset grid selection
        setEntries(newEntries);
        });
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
                        onChange={(e) => handleChange(index, "keterangan", e.target.value)}
                    />
                    </FloatingLabel>
                </div>

                {/* Provinsi */}
                <div className="col justify-content-between"style={{margin:"0px"}}>
                    <FloatingLabel controlId={`provinsi-${index}`} label="Provinsi">
                    <Form.Select
                        value={entry.provinsi}
                        onChange={(e) => {
                        const newProv = e.target.value;
                        handleChange(index, "provinsi", newProv);
                        fetchGrids(index, newProv);
                        }}
                    >
                        <option value="" disabled hidden>Pilih Provinsi</option>
                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </Form.Select>
                    </FloatingLabel>
                </div>

                {/* Grid */}
                <div className="col justify-content-between"style={{margin:"0px"}}>
                    <FloatingLabel controlId={`grid-${index}`} label="Grid">
                    <Form.Select
                        value={entry.grid}
                        onChange={(e) => {
                        const selectedGrid = entry.grids.find(g => g.Grid === e.target.value);
                        handleChange(index, "grid", e.target.value);
                        handleChange(index, "fe", selectedGrid ? selectedGrid["Faktor_Emisi_(FE)"] : 0);
                        }}
                    >
                        <option value="" disabled hidden>Pilih Grid</option>
                        {entry.grids.map(g => (
                        <option key={g.Grid} value={g.Grid}>{g.Grid}</option>
                        ))}
                    </Form.Select>
                    </FloatingLabel>
                </div>

                {/* FE */}
                <div className="col justify-content-between"style={{margin:"0px"}}>
                    <FloatingLabel controlId={`fe-${index}`} label="Faktor Emisi">
                    <Form.Control type="text" value={entry.fe} placeholder="" readOnly disabled />
                    </FloatingLabel>
                </div>

                {/* kWh */}
                <div className="col justify-content-between"style={{margin:"0px"}}>
                    <FloatingLabel controlId={`kwh-${index}`} label="Jumlah Pemakaian (kWh)">
                    <Form.Control
                        type="number"
                        placeholder=" "
                        min={0}
                        value={entry.kwh}
                        onChange={(e) => handleChange(index, "kwh", Number(e.target.value))}
                    />
                    </FloatingLabel>
                </div>

                {/* Total Emission */}
                <div className="col justify-content-between"style={{margin:"0px"}}>
                    <FloatingLabel controlId={`emission-${index}`} label="Total Emisi (kgCO₂)">
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
                    <Button variant="danger" onClick={() => removeRow(index)} style={{fontWeight: "bolder", borderRadius: "50%"}}>X</Button>
                </div>

                </div>
            </Card.Body>
            </Card>
        ))}

        <div className="flex-end">
            <Button variant="primary" onClick={addRow}>Add</Button>
        </div>
        </div>
    );
}
