// src/pages/CalculatorPage.jsx
import React, { useState } from "react";
import "../App.css";  // go up one level since this file is now inside /pages
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ElectricityForm from "../components/electricity_form";
import FuelForm from "../components/fuel_form";
import GasForm from "../components/gas_form";

export default function CalculatorPage() {
  const [openCard, setOpenCard] = useState(null);
  const [electricityData, setElectricityData] = useState([]);
  const [fuelData, setFuelData] = useState([]);
  const [gasData, setGasData] = useState([]);

  const toggleCard = (name) => {
    setOpenCard(openCard === name ? null : name);
  };

  const getTotalEmission = (data) => {
    if (!data || !data.length) return 0;
    return data.reduce((sum, entry) => sum + (entry.emission || 0), 0);
  };

  const navigate = useNavigate();

  // CalculatorPage.jsx
  const handleCalculate = () => {
    navigate("/summary", {
      state: {
        electricity: electricityData, // array of entries
        fuel: fuelData,
        gas: gasData,
      },
    });
  };

  return (
    <Container fluid>
      <Container className="inside-main">
        {/* Header */}
        <Card className="mb title">
          <Card.Body>
            <Card.Title className="text-success"><h1>Personal CO₂ Footprint Calculator</h1></Card.Title>
            {/* <Card.Text>
              <h5>Some quick example text to build on the card title and make up the bulk of the card's content.</h5>
            </Card.Text> */}
          </Card.Body>
        </Card>

        <hr/>

        {/* Electricity Card */}
        <Card className="mb">
          <Card.Body onClick={() => toggleCard("electricity")} style={{ cursor: "pointer" }} className="calc-card">
            <div className="row align-items-center">
              <div className="col-auto">
                <i className="bi bi-lightning-charge-fill" style={{ fontSize: "1.48rem" }}></i>
              </div>

              <div className="col text-start">
                <Card.Title as="h3" className="mb-0">
                  Electricity
                </Card.Title>
              </div>

              <div className="col-auto text-end">
                <span className="text-muted" style={{ fontSize: "1.65rem" }}>
                  {getTotalEmission(electricityData).toFixed(2)} kgCO₂
                </span>
              </div>
            </div>
          </Card.Body>

          {openCard === "electricity" && (
            <Card.Body style={{marginLeft:"45px", padding: "15px 0px"}}>
              <ElectricityForm
                data={electricityData}
                setData={setElectricityData}
              />
            </Card.Body>
          )}
        </Card>

        {/* Fuel Card */}
        <Card className="mb">
          <Card.Body onClick={() => toggleCard("fuel")} style={{ cursor: "pointer" }} className="calc-card">
            <div className="row align-items-center">
              <div className="col-auto">
                <i className="bi bi-fuel-pump-fill" style={{ fontSize: "1.48rem" }}></i>
              </div>

              <div className="col text-start">
                <Card.Title as="h3" className="mb-0">
                  Fuel
                </Card.Title>
              </div>

              <div className="col-auto text-end">
                <span className="text-muted" style={{ fontSize: "1.65rem" }}>
                  {getTotalEmission(fuelData).toFixed(2)} kgCO₂
                </span>
              </div>
            </div>
          </Card.Body>

          {openCard === "fuel" && (
            <Card.Body  style={{marginLeft:"45px", padding: "15px 0px"}}>
              <FuelForm data={fuelData} setData={setFuelData} />
            </Card.Body>
          )}
        </Card>

        {/* Gas Card */}
        <Card className="mb">
          <Card.Body onClick={() => toggleCard("gas")} style={{ cursor: "pointer" }} className="calc-card">
            <div className="row align-items-center">
              <div className="col-auto">
                <i className="bi bi-fire" style={{ fontSize: "1.48rem" }}></i>
              </div>

              <div className="col text-start">
                <Card.Title as="h3" className="mb-0">
                  Gas
                </Card.Title>
              </div>

              <div className="col-auto text-end">
                <span className="text-muted" style={{ fontSize: "1.65rem" }}>
                  {getTotalEmission(gasData).toFixed(2)} kgCO₂
                </span>
              </div>
            </div>
          </Card.Body>

          {openCard === "gas" && (
            <Card.Body  style={{marginLeft:"45px", padding: "15px 0px"}}>
              <GasForm data={gasData} setData={setGasData} />
            </Card.Body>
          )}
        </Card>

        <hr/>

        {/* Calculate Button */}
        <div className="text-end mt-3">
          <Button variant="success" size="lg"  onClick={handleCalculate}>
            CALCULATE
          </Button>
        </div>

      </Container>
    </Container>
  );
}
