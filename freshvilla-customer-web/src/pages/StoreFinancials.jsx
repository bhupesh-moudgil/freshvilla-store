import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import storeERPAPI from '../api/storeERPAPI';
import './StoreFinancials.css';

const StoreFinancials = ({ storeId }) => {
  const [profitLoss, setProfitLoss] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    endDate: new Date().toISOString().split('T')[0], // Today
  });

  useEffect(() => {
    if (storeId && dateRange.startDate && dateRange.endDate) {
      fetchFinancials();
    }
  }, [storeId, dateRange]);

  const fetchFinancials = async () => {
    try {
      const [plResponse, txnResponse, revenueResponse] = await Promise.all([
        storeERPAPI.getProfitLoss(storeId, dateRange),
        storeERPAPI.getTransactions(storeId, { ...dateRange, limit: 20 }),
        storeERPAPI.getRevenueSummary(storeId, dateRange),
      ]);

      setProfitLoss(plResponse.data);
      setTransactions(txnResponse.data);
      setRevenueSummary(revenueResponse.data);
    } catch (error) {
      console.error('Error fetching financials:', error);
    }
  };

  const formatCurrency = (value) => `₹${parseFloat(value).toFixed(2)}`;

  const revenueChartData = revenueSummary?.daily
    ? {
        labels: revenueSummary.daily.map((d) =>
          new Date(d.date).toLocaleDateString()
        ),
        datasets: [
          {
            label: 'Gross Revenue',
            data: revenueSummary.daily.map((d) => parseFloat(d.grossRevenue)),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
          },
          {
            label: 'Net Revenue',
            data: revenueSummary.daily.map((d) => parseFloat(d.netRevenue)),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.3,
          },
          {
            label: 'Net Profit',
            data: revenueSummary.daily.map((d) => parseFloat(d.netProfit)),
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.3,
          },
        ],
      }
    : null;

  return (
    <Container fluid className="store-financials">
      <h2 className="page-title">Financial Reports</h2>

      {/* Date Range Selector */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <div className="quick-filters">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() =>
                    setDateRange({
                      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                      endDate: new Date().toISOString().split('T')[0],
                    })
                  }
                >
                  Last 7 Days
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() =>
                    setDateRange({
                      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                      endDate: new Date().toISOString().split('T')[0],
                    })
                  }
                >
                  Last 30 Days
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() =>
                    setDateRange({
                      startDate: new Date(new Date().setDate(1))
                        .toISOString()
                        .split('T')[0],
                      endDate: new Date().toISOString().split('T')[0],
                    })
                  }
                >
                  This Month
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Profit & Loss Statement */}
      {profitLoss && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Profit & Loss Statement</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6 className="section-title">Income</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td>Gross Sales</td>
                      <td className="text-end">
                        {formatCurrency(profitLoss.income.grossSales)}
                      </td>
                    </tr>
                    <tr>
                      <td>Refunds</td>
                      <td className="text-end text-danger">
                        -{formatCurrency(profitLoss.income.refunds)}
                      </td>
                    </tr>
                    <tr className="fw-bold">
                      <td>Net Sales</td>
                      <td className="text-end">
                        {formatCurrency(profitLoss.income.netSales)}
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <h6 className="section-title mt-4">Deductions</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td>Platform Commission</td>
                      <td className="text-end text-danger">
                        -{formatCurrency(profitLoss.deductions.platformCommission)}
                      </td>
                    </tr>
                    <tr className="fw-bold">
                      <td>Net Revenue</td>
                      <td className="text-end">
                        {formatCurrency(profitLoss.deductions.netRevenue)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              <Col md={6}>
                <h6 className="section-title">Expenses</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td>Total Expenses</td>
                      <td className="text-end text-danger">
                        -{formatCurrency(profitLoss.expenses.total)}
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <h6 className="section-title mt-4">Net Profit</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr className="fw-bold">
                      <td>Net Profit</td>
                      <td className="text-end text-success">
                        {formatCurrency(profitLoss.profit.netProfit)}
                      </td>
                    </tr>
                    <tr>
                      <td>Profit Margin</td>
                      <td className="text-end">{profitLoss.profit.profitMargin}</td>
                    </tr>
                  </tbody>
                </Table>

                <div className="profit-summary mt-4">
                  <h2 className="text-success">
                    {formatCurrency(profitLoss.profit.netProfit)}
                  </h2>
                  <p className="text-muted">Total Profit for Selected Period</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Revenue Trend Chart */}
      {revenueChartData && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Revenue Trend</h5>
          </Card.Header>
          <Card.Body>
            <Line
              data={revenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: 'top' },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </Card.Body>
        </Card>
      )}

      {/* Summary Totals */}
      {revenueSummary?.totals && (
        <Card className="mb-4">
          <Card.Header>
            <h5>Period Summary</h5>
          </Card.Header>
          <Card.Body>
            <Row className="text-center">
              <Col md={2}>
                <div className="summary-stat">
                  <h4>{revenueSummary.totals.orders}</h4>
                  <p>Orders</p>
                </div>
              </Col>
              <Col md={2}>
                <div className="summary-stat">
                  <h4>{revenueSummary.totals.items}</h4>
                  <p>Items Sold</p>
                </div>
              </Col>
              <Col md={2}>
                <div className="summary-stat">
                  <h4>{formatCurrency(revenueSummary.totals.grossRevenue)}</h4>
                  <p>Gross Revenue</p>
                </div>
              </Col>
              <Col md={2}>
                <div className="summary-stat">
                  <h4>{formatCurrency(revenueSummary.totals.commission)}</h4>
                  <p>Commission</p>
                </div>
              </Col>
              <Col md={2}>
                <div className="summary-stat">
                  <h4>{formatCurrency(revenueSummary.totals.netRevenue)}</h4>
                  <p>Net Revenue</p>
                </div>
              </Col>
              <Col md={2}>
                <div className="summary-stat">
                  <h4 className="text-success">
                    {formatCurrency(revenueSummary.totals.profit)}
                  </h4>
                  <p>Profit</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <Card.Header>
          <h5>Recent Transactions</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Order</th>
                <th>Type</th>
                <th>Gross Amount</th>
                <th>Commission</th>
                <th>Net Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.transactionDate).toLocaleString()}</td>
                  <td>{txn.order?.orderNumber || '-'}</td>
                  <td>{txn.transactionType}</td>
                  <td>{formatCurrency(txn.grossAmount)}</td>
                  <td className="text-danger">
                    -{formatCurrency(txn.platformCommission)}
                  </td>
                  <td className="fw-bold">{formatCurrency(txn.netAmount)}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        txn.status === 'completed' ? 'success' : 'warning'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {transactions.length === 0 && (
            <div className="text-center py-3">
              <p className="text-muted">No transactions found</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StoreFinancials;
