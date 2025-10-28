import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import storeERPAPI from '../api/storeERPAPI';
import './StoreInventory.css';

const StoreInventory = ({ storeId }) => {
  const [inventory, setInventory] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [adjustment, setAdjustment] = useState({
    quantity: 0,
    movementType: 'adjustment',
    notes: '',
  });

  useEffect(() => {
    fetchInventory();
  }, [storeId, searchTerm, lowStockFilter]);

  const fetchInventory = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (lowStockFilter) params.lowStock = true;

      const response = await storeERPAPI.getInventory(storeId, params);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchLedger = async (productId) => {
    try {
      const response = await storeERPAPI.getInventoryLedger(storeId, { productId, limit: 50 });
      setLedger(response.data);
      setShowLedgerModal(true);
    } catch (error) {
      console.error('Error fetching ledger:', error);
    }
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setAdjustment({ quantity: 0, movementType: 'adjustment', notes: '' });
    setShowAdjustModal(true);
  };

  const submitAdjustment = async () => {
    try {
      await storeERPAPI.adjustInventory(storeId, {
        productId: selectedProduct.id,
        ...adjustment,
      });
      setShowAdjustModal(false);
      fetchInventory();
      alert('Inventory adjusted successfully');
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      alert('Failed to adjust inventory');
    }
  };

  const getStockBadge = (product) => {
    if (product.stock === 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    } else if (product.stock <= product.minStock) {
      return <Badge bg="warning">Low Stock</Badge>;
    }
    return <Badge bg="success">In Stock</Badge>;
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case 'purchase':
      case 'return':
      case 'adjustment':
        return 'success';
      case 'sale':
        return 'primary';
      case 'damage':
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container fluid className="store-inventory">
      <h2 className="page-title">Inventory Management</h2>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Form.Check
            type="switch"
            label="Show only low stock"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
          />
        </Col>
      </Row>

      {/* Inventory Table */}
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Status</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Store Earning</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-info">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-img"
                      />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>
                    <strong>{product.stock}</strong>
                  </td>
                  <td>{product.minStock || '-'}</td>
                  <td>{getStockBadge(product)}</td>
                  <td>₹{product.commission?.costPrice?.toFixed(2) || '-'}</td>
                  <td>₹{product.price?.toFixed(2)}</td>
                  <td>
                    <strong className="text-success">
                      ₹{product.commission?.storeEarningPerUnit?.toFixed(2) || '-'}
                    </strong>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleAdjustStock(product)}
                      className="me-2"
                    >
                      Adjust
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => fetchLedger(product.id)}
                    >
                      History
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {inventory.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No products found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Adjust Stock Modal */}
      <Modal show={showAdjustModal} onHide={() => setShowAdjustModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adjust Stock: {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Stock</Form.Label>
              <Form.Control type="text" value={selectedProduct?.stock} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Adjustment Quantity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter positive or negative value"
                value={adjustment.quantity}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) })
                }
              />
              <Form.Text className="text-muted">
                Positive for increase, negative for decrease
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Movement Type</Form.Label>
              <Form.Select
                value={adjustment.movementType}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, movementType: e.target.value })
                }
              >
                <option value="adjustment">Manual Adjustment</option>
                <option value="purchase">Purchase/Restock</option>
                <option value="return">Customer Return</option>
                <option value="damage">Damaged</option>
                <option value="expired">Expired</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Reason for adjustment"
                value={adjustment.notes}
                onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
              />
            </Form.Group>

            <div className="alert alert-info">
              <strong>New Stock:</strong>{' '}
              {selectedProduct?.stock + (adjustment.quantity || 0)}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdjustModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitAdjustment}>
            Confirm Adjustment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ledger History Modal */}
      <Modal
        show={showLedgerModal}
        onHide={() => setShowLedgerModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Inventory History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive size="sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Previous</th>
                <th>New</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  <td>
                    <Badge bg={getMovementTypeColor(entry.movementType)}>
                      {entry.movementType}
                    </Badge>
                  </td>
                  <td>
                    <strong
                      className={entry.quantity > 0 ? 'text-success' : 'text-danger'}
                    >
                      {entry.quantity > 0 ? '+' : ''}
                      {entry.quantity}
                    </strong>
                  </td>
                  <td>{entry.previousStock}</td>
                  <td>{entry.newStock}</td>
                  <td>{entry.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {ledger.length === 0 && (
            <div className="text-center py-3">
              <p className="text-muted">No history available</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLedgerModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StoreInventory;
