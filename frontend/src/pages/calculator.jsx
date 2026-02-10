import React, { useState } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ElectricityForm from "../components/electricity_form";
import FuelForm from "../components/fuel_form";
import GasForm from "../components/gas_form";
import "../App.css";

export default function CalculatorPage() {
  const [openCard, setOpenCard] = useState(null);
  const [electricityData, setElectricityData] = useState([]);
  const [fuelData, setFuelData] = useState([]);
  const [gasData, setGasData] = useState([]);

  const toggleCard = (name) => setOpenCard(openCard === name ? null : name);

  const getTotalEmission = (data) => {
    if (!data || !data.length) return 0;
    return data.reduce((sum, entry) => sum + (entry.emission || 0), 0);
  };

  const navigate = useNavigate();

  const handleCalculate = () => {
    navigate("/summary", {
      state: { electricity: electricityData, fuel: fuelData, gas: gasData },
    });
  };

  const CategoryRow = ({ id, title, icon, data, FormComponent }) => (
    <Card className={`category-card mb-3 ${openCard === id ? "is-open" : ""}`}>
      <Card.Body onClick={() => toggleCard(id)} className="d-flex align-items-center cursor-pointer">
        <div className={`icon-wrapper me-3 icon-${id}`}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div className="flex-grow-1">
          <h3 className="category-title mb-0">{title}</h3>
        </div>
        <div className="text-end d-flex align-items-center">
          <span className="emission-value me-3">
            {getTotalEmission(data).toFixed(2)} <small>kgCO₂</small>
          </span>
          <i className={`bi bi-chevron-right chevron-icon ${openCard === id ? "rotate" : ""}`}></i>
        </div>
      </Card.Body>
      
      {openCard === id && (
        <div className="form-container">
          <FormComponent data={data} setData={id === "electricity" ? setElectricityData : id === "fuel" ? setFuelData : setGasData} />
        </div>
      )}
    </Card>
  );

  return (
    <div className="calculator-bg">
      <Container className="py-5">
        <div className="calculator-wrapper">
          <div className="header-section mb-4 d-flex justify-content-between align-items-center">
            <h1 className="main-title">CO₂ Footprint Calculator</h1>
            <div className="leaf-badge"><i className="bi bi-leaf-fill"></i></div>
          </div>

          <CategoryRow id="electricity" title="Electricity" icon="bi-lightning-charge-fill" data={electricityData} FormComponent={ElectricityForm} />
          <CategoryRow id="fuel" title="Fuel" icon="bi-fuel-pump-fill" data={fuelData} FormComponent={FuelForm} />
          <CategoryRow id="gas" title="Gas" icon="bi-fire" data={gasData} FormComponent={GasForm} />

          <div className="text-end mt-4">
            <Button className="btn-calculate" onClick={handleCalculate}>
              CALCULATE
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}