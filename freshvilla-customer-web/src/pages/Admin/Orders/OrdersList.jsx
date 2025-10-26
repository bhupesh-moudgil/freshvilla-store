import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data.data || []);
    } catch (error) {
      Swal.fire('Error', 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await ordersAPI.updateStatus(id, { orderStatus: newStatus });
      Swal.fire('Success!', 'Order status updated', 'success');
      loadOrders();
    } catch (error) {
      Swal.fire('Error', 'Failed to update order status', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': 'warning',
      'Confirmed': 'info',
      'Processing': 'primary',
      'Shipped': 'info',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return badges[status] || 'secondary';
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
  }

  return (
    <div>
      <h2 className="mb-4">Orders</h2>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td>
                      <div>{order.customerName}</div>
                      <small className="text-muted">{order.customerEmail}</small>
                    </td>
                    <td>{order.items?.length || 0} items</td>
                    <td>₹{parseFloat(order.total).toFixed(2)}</td>
                    <td><span className="badge bg-secondary">{order.paymentMethod}</span></td>
                    <td>
                      <select 
                        className={`form-select form-select-sm badge bg-${getStatusBadge(order.orderStatus)}`}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        style={{width: 'auto', border: 'none', color: 'white'}}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => Swal.fire({
                          title: `Order #${order.orderNumber}`,
                          html: `
                            <div class="text-start">
                              <p><strong>Customer:</strong> ${order.customerName}</p>
                              <p><strong>Email:</strong> ${order.customerEmail}</p>
                              <p><strong>Mobile:</strong> ${order.customerMobile}</p>
                              <p><strong>Address:</strong> ${order.customerAddress}</p>
                              <hr>
                              <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
                              <p><strong>Delivery Fee:</strong> ₹${order.deliveryFee}</p>
                              <p><strong>Total:</strong> ₹${order.total}</p>
                            </div>
                          `,
                          width: 600
                        })}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-4 text-muted">
                No orders yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
