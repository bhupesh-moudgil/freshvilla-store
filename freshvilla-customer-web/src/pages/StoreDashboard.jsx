import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import storeERPAPI from '../api/storeERPAPI';
import './StoreDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StoreDashboard = ({ storeId }) => {
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      fetchAnalytics();
    }
  }, [storeId, period]);

  const fetchDashboardData = async () => {
    try {
      const response = await storeERPAPI.getDashboard(storeId);
      setDashboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await storeERPAPI.getSalesAnalytics(storeId, { period });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (loading || !dashboard) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  const { today, month, topProducts, inventoryAlerts, recentTransactions } = dashboard;

  // Sales Trend Chart
  const salesChartData = analytics ? {
    labels: analytics.labels.map(d => new Date(d).toLocaleDateString()),
    datasets: [
      {
        label: 'Gross Revenue',
        data: analytics.grossRevenue,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Net Revenue',
        data: analytics.netRevenue,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Profit',
        data: analytics.profit,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.3,
      },
    ],
  } : null;

  // Top Products Chart
  const topProductsChartData = {
    labels: topProducts.map(p => p.name),
    datasets: [
      {
        label: 'Units Sold',
        data: topProducts.map(p => p.units_sold),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
      },
    ],
  };

  const formatCurrency = (value) => `₹${value.toFixed(2)}`;

  return (
    <Container fluid className="store-dashboard">
      <h2 className="dashboard-title">Store Dashboard</h2>

      {/* Today's Metrics */}
      <Row className="metrics-today mb-4">
        <Col md={3}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon orders">📦</div>
              <h6>Today's Orders</h6>
              <h3>{today.orders}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon revenue">💰</div>
              <h6>Gross Revenue</h6>
              <h3>{formatCurrency(today.grossRevenue)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon commission">💳</div>
              <h6>Platform Fee</h6>
              <h3>{formatCurrency(today.commission)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon net">✅</div>
              <h6>Net Earnings</h6>
              <h3>{formatCurrency(today.netRevenue)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Month Metrics */}
      <Row className="metrics-month mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>This Month</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={2}>
                  <div className="stat">
                    <p className="stat-label">Orders</p>
                    <h4>{month.orders}</h4>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="stat">
                    <p className="stat-label">Items Sold</p>
                    <h4>{month.items}</h4>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="stat">
                    <p className="stat-label">Gross Revenue</p>
                    <h4>{formatCurrency(month.grossRevenue)}</h4>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="stat">
                    <p className="stat-label">Commission</p>
                    <h4>{formatCurrency(month.commission)}</h4>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="stat">
                    <p className="stat-label">Net Revenue</p>
                    <h4>{formatCurrency(month.netRevenue)}</h4>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="stat">
                    <p className="stat-label">Profit</p>
                    <h4 className="text-success">{formatCurrency(month.profit)}</h4>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between">
                <h5>Sales Trend</h5>
                <div className="period-selector">
                  <button
                    className={period === '7' ? 'active' : ''}
                    onClick={() => setPeriod('7')}
                  >
                    7D
                  </button>
                  <button
                    className={period === '30' ? 'active' : ''}
                    onClick={() => setPeriod('30')}
                  >
                    30D
                  </button>
                  <button
                    className={period === '90' ? 'active' : ''}
                    onClick={() => setPeriod('90')}
                  >
                    90D
                  </button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {salesChartData && (
                <Line
                  data={salesChartData}
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
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Top Products (30 Days)</h5>
            </Card.Header>
            <Card.Body>
              {topProducts.length > 0 ? (
                <Bar
                  data={topProductsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              ) : (
                <p>No sales data yet</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Inventory Alerts & Recent Transactions */}
      <Row>
        <Col md={6}>
          <Card className="inventory-alerts">
            <Card.Header>
              <h5>Inventory Alerts</h5>
              <span className="badge bg-danger">{inventoryAlerts.lowStock.length}</span>
            </Card.Header>
            <Card.Body>
              {inventoryAlerts.lowStock.length > 0 ? (
                <ul className="alert-list">
                  {inventoryAlerts.lowStock.map((product) => (
                    <li key={product.id} className="alert-item">
                      <img src={product.image} alt={product.name} className="product-thumb" />
                      <div className="product-info">
                        <strong>{product.name}</strong>
                        <p className="stock-warning">
                          Stock: {product.stock} / Min: {product.minStock}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>All products have sufficient stock</p>
              )}
              {inventoryAlerts.outOfStockCount > 0 && (
                <div className="alert alert-danger mt-3">
                  <strong>{inventoryAlerts.outOfStockCount}</strong> products are out of stock
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="recent-transactions">
            <Card.Header>
              <h5>Recent Transactions</h5>
            </Card.Header>
            <Card.Body>
              {recentTransactions.length > 0 ? (
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Order</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((txn) => (
                      <tr key={txn.id}>
                        <td>{new Date(txn.transactionDate).toLocaleDateString()}</td>
                        <td>{txn.order?.orderNumber || '-'}</td>
                        <td>{formatCurrency(parseFloat(txn.netAmount))}</td>
                        <td>
                          <span className={`badge bg-${txn.status === 'completed' ? 'success' : 'warning'}`}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No transactions yet</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StoreDashboard;
