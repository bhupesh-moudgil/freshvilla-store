const Order = require('../models/Order');
const Store = require('../models/Store');
const PDFDocument = require('pdfkit');
const { ThermalPrinter, PrinterTypes } = require('node-thermal-printer');

// Generate thermal receipt (58mm POS printer)
exports.printThermalReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Initialize thermal printer (ESC/POS)
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'tcp://192.168.1.100', // Update with actual printer IP
      characterSet: 'SLOVENIA',
      removeSpecialCharacters: false,
      lineCharacter: '-',
      options: {
        timeout: 3000,
      },
    });

    // Build receipt
    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.bold(true);
    printer.println('FreshVilla');
    printer.bold(false);
    printer.setTextNormal();
    printer.println('Farm Fresh Grocery Delivery');
    printer.drawLine();
    
    printer.alignLeft();
    printer.bold(true);
    printer.println(`Order #: ${order.orderNumber}`);
    printer.bold(false);
    printer.println(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    printer.println(`Customer: ${order.customerName}`);
    printer.println(`Mobile: ${order.customerMobile}`);
    printer.drawLine();

    // Items
    printer.bold(true);
    printer.println('ITEMS:');
    printer.bold(false);
    
    for (const item of order.items) {
      printer.println(`${item.name}`);
      printer.tableCustom([
        { text: `  ${item.quantity} x ₹${item.price}`, align: 'LEFT', width: 0.7 },
        { text: `₹${(item.quantity * item.price).toFixed(2)}`, align: 'RIGHT', width: 0.3 },
      ]);
    }

    printer.drawLine();

    // Totals
    printer.tableCustom([
      { text: 'Subtotal:', align: 'LEFT', width: 0.7 },
      { text: `₹${order.subtotal}`, align: 'RIGHT', width: 0.3 },
    ]);

    if (order.discount > 0) {
      printer.tableCustom([
        { text: 'Discount:', align: 'LEFT', width: 0.7 },
        { text: `-₹${order.discount}`, align: 'RIGHT', width: 0.3 },
      ]);
    }

    printer.tableCustom([
      { text: 'Delivery Fee:', align: 'LEFT', width: 0.7 },
      { text: `₹${order.deliveryFee}`, align: 'RIGHT', width: 0.3 },
    ]);

    printer.drawLine();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.tableCustom([
      { text: 'TOTAL:', align: 'LEFT', width: 0.7 },
      { text: `₹${order.total}`, align: 'RIGHT', width: 0.3 },
    ]);
    printer.bold(false);
    printer.setTextNormal();
    printer.drawLine();

    // Payment info
    printer.println(`Payment Method: ${order.paymentMethod}`);
    printer.println(`Payment Status: ${order.paymentStatus}`);
    printer.drawLine();

    // Footer
    printer.alignCenter();
    printer.println('Thank you for shopping with us!');
    printer.println('www.freshvilla.in');
    printer.newLine();
    printer.cut();

    // Execute print
    try {
      await printer.execute();
      res.json({
        success: true,
        message: 'Receipt printed successfully',
      });
    } catch (error) {
      // If printer not available, return ESC/POS data
      const buffer = await printer.getBuffer();
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${order.orderNumber}.prn`);
      res.send(buffer);
    }
  } catch (error) {
    console.error('Print receipt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate PDF invoice (A4)
exports.generateInvoicePDF = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('FreshVilla', 50, 50);
    doc.fontSize(10).text('Farm Fresh Grocery Delivery', 50, 75);
    doc.text('www.freshvilla.in', 50, 90);
    doc.text('contact@freshvilla.in', 50, 105);

    // Invoice details (right side)
    doc.fontSize(16).text('INVOICE', 400, 50);
    doc.fontSize(10)
      .text(`Invoice #: ${order.orderNumber}`, 400, 75)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 90)
      .text(`Status: ${order.orderStatus}`, 400, 105);

    // Line
    doc.moveTo(50, 130).lineTo(550, 130).stroke();

    // Bill To
    doc.fontSize(12).text('Bill To:', 50, 150);
    doc.fontSize(10)
      .text(order.customerName, 50, 170)
      .text(order.customerEmail, 50, 185)
      .text(order.customerMobile, 50, 200)
      .text(order.customerAddress, 50, 215, { width: 250 });

    // Items table header
    const tableTop = 280;
    doc.fontSize(10)
      .text('Item', 50, tableTop, { bold: true })
      .text('Qty', 300, tableTop)
      .text('Price', 370, tableTop)
      .text('Amount', 470, tableTop);

    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Items
    let yPosition = tableTop + 30;
    for (const item of order.items) {
      doc.text(item.name, 50, yPosition, { width: 240 })
        .text(item.quantity.toString(), 300, yPosition)
        .text(`₹${item.price.toFixed(2)}`, 370, yPosition)
        .text(`₹${(item.quantity * item.price).toFixed(2)}`, 470, yPosition);
      
      yPosition += 25;
    }

    // Line before totals
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 20;

    // Totals
    doc.text('Subtotal:', 370, yPosition)
      .text(`₹${order.subtotal}`, 470, yPosition);
    yPosition += 20;

    if (order.discount > 0) {
      doc.text('Discount:', 370, yPosition)
        .text(`-₹${order.discount}`, 470, yPosition);
      yPosition += 20;
    }

    doc.text('Delivery Fee:', 370, yPosition)
      .text(`₹${order.deliveryFee}`, 470, yPosition);
    yPosition += 20;

    // Line before total
    doc.moveTo(370, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    // Total
    doc.fontSize(12)
      .text('Total:', 370, yPosition)
      .text(`₹${order.total}`, 470, yPosition);

    yPosition += 40;

    // Payment info
    doc.fontSize(10)
      .text(`Payment Method: ${order.paymentMethod}`, 50, yPosition)
      .text(`Payment Status: ${order.paymentStatus}`, 50, yPosition + 20);

    // Footer
    doc.fontSize(8)
      .text('Thank you for your business!', 50, 750, { align: 'center', width: 500 });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate shipping label (100mm x 150mm)
exports.generateShippingLabel = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Create PDF document (label size)
    const doc = new PDFDocument({ 
      size: [283.46, 425.20], // 100mm x 150mm in points
      margin: 20 
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=label-${order.orderNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // From address
    doc.fontSize(8).text('FROM:', 20, 20);
    doc.fontSize(10).text('FreshVilla', 20, 35);
    doc.fontSize(8).text('Farm Fresh Grocery', 20, 50);
    doc.text('www.freshvilla.in', 20, 65);

    // Line
    doc.moveTo(20, 85).lineTo(263, 85).stroke();

    // To address
    doc.fontSize(8).text('DELIVER TO:', 20, 95);
    doc.fontSize(12).text(order.customerName, 20, 110, { bold: true });
    doc.fontSize(10).text(order.customerAddress, 20, 130, { width: 240 });
    doc.fontSize(10).text(order.customerMobile, 20, 180);

    // Order details box
    doc.rect(20, 210, 243, 80).stroke();
    doc.fontSize(8).text('Order Details:', 30, 220);
    doc.fontSize(14).text(order.orderNumber, 30, 235, { bold: true });
    doc.fontSize(8)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 30, 255)
      .text(`Items: ${order.items.length}`, 30, 270)
      .text(`${order.paymentMethod} - ${order.paymentStatus}`, 30, 285);

    // Barcode placeholder (you can use a barcode library here)
    doc.fontSize(8).text('Scan for tracking:', 20, 310);
    doc.fontSize(12).text(order.orderNumber, 20, 325, { align: 'center', width: 243 });

    // Handle with care
    doc.fontSize(10).text('🛡 HANDLE WITH CARE', 20, 380, { align: 'center', width: 243 });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Generate label error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get printable order data (JSON for custom printing)
exports.getPrintData = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      data: {
        order: order.toJSON(),
        printTemplates: {
          thermal: `/api/orders/${orderId}/print/thermal`,
          invoice: `/api/orders/${orderId}/print/invoice`,
          label: `/api/orders/${orderId}/print/label`,
        },
      },
    });
  } catch (error) {
    console.error('Get print data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
