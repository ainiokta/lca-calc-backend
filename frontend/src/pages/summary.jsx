import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";

export default function SummaryPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const electricity = state?.electricity || [];
  const fuel = state?.fuel || [];
  const gas = state?.gas || [];

  const getTotal = (data) =>
    data.reduce((sum, item) => sum + (item.emission || 0), 0);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Summary</h2>

      <Card className="mb-3">
        <Card.Body>
          <h5>Totals</h5>
          <p>Electricity: {getTotal(electricity).toFixed(2)} kgCO₂</p>
          <p>Fuel: {getTotal(fuel).toFixed(2)} kgCO₂</p>
          <p>Gas: {getTotal(gas).toFixed(2)} kgCO₂</p>
        </Card.Body>
      </Card>

      <Button variant="secondary" onClick={() => navigate("/")}>
        Back to Calculator
      </Button>
    </Container>
  );
}
