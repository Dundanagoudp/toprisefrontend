import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PickupRequest, PicklistData } from './pickup-service';

/**
 * PDF Generation Service for Pickup Lists
 */

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format address
const formatAddress = (address: any): string => {
  if (!address) return 'N/A';
  return `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'scheduled': return '#3b82f6';
    case 'in_progress': return '#8b5cf6';
    case 'packed': return '#10b981';
    case 'picked_up': return '#6366f1';
    case 'completed': return '#059669';
    case 'cancelled': return '#ef4444';
    default: return '#6b7280';
  }
};

// Helper function to get priority color
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
};

/**
 * Generate PDF for pickup list
 */
export async function generatePickupListPDF(
  pickups: PickupRequest[],
  options: {
    title?: string;
    includeFilters?: boolean;
    filters?: {
      status?: string;
      priority?: string;
      searchTerm?: string;
    };
  } = {}
): Promise<void> {
  try {
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    
    // Add header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title || 'Pickup List Report', margin, yPosition);
    yPosition += 15;
    
    // Add generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 10;
    
    // Add summary information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Pickups: ${pickups.length}`, margin, yPosition);
    yPosition += 6;
    
    // Count by status
    const statusCounts = pickups.reduce((acc, pickup) => {
      acc[pickup.status] = (acc[pickup.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, margin + 20, yPosition);
      yPosition += 5;
    });
    
    yPosition += 10;
    
    // Add filters information if provided
    if (options.includeFilters && options.filters) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Filters', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (options.filters.status && options.filters.status !== 'all') {
        doc.text(`Status: ${options.filters.status}`, margin, yPosition);
        yPosition += 5;
      }
      
      if (options.filters.priority && options.filters.priority !== 'all') {
        doc.text(`Priority: ${options.filters.priority}`, margin, yPosition);
        yPosition += 5;
      }
      
      if (options.filters.searchTerm) {
        doc.text(`Search: ${options.filters.searchTerm}`, margin, yPosition);
        yPosition += 5;
      }
      
      yPosition += 10;
    }
    
    // Add table header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Pickup Details', margin, yPosition);
    yPosition += 10;
    
    // Table headers
    const headers = ['Pickup ID', 'Order ID', 'Customer', 'Dealer', 'Scheduled Date', 'Status', 'Priority', 'Items'];
    const colWidths = [25, 25, 35, 30, 30, 20, 15, 15];
    const startX = margin;
    
    // Draw table header
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, yPosition - 5, contentWidth, 8, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    let xPos = startX;
    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, yPosition);
      xPos += colWidths[index];
    });
    yPosition += 8;
    
    // Add pickup data
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    pickups.forEach((pickup, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
        
        // Redraw table header on new page
        doc.setFillColor(240, 240, 240);
        doc.rect(startX, yPosition - 5, contentWidth, 8, 'F');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        xPos = startX;
        headers.forEach((header, headerIndex) => {
          doc.text(header, xPos + 2, yPosition);
          xPos += colWidths[headerIndex];
        });
        yPosition += 8;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
      }
      
      // Draw row data
      const rowData = [
        pickup.pickupId,
        pickup.orderId,
        pickup.customerName,
        pickup.dealerName,
        formatDate(pickup.scheduledDate),
        pickup.status,
        pickup.priority,
        pickup.items.length.toString()
      ];
      
      xPos = startX;
      rowData.forEach((data, colIndex) => {
        // Truncate long text
        const maxLength = Math.floor(colWidths[colIndex] / 1.5);
        const displayText = data.length > maxLength ? data.substring(0, maxLength) + '...' : data;
        
        doc.text(displayText, xPos + 2, yPosition);
        xPos += colWidths[colIndex];
      });
      
      yPosition += 6;
    });
    
    // Add footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }
    
    // Save the PDF
    const fileName = `pickup-list-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Generate PDF from HTML element (alternative method)
 */
export async function generatePDFFromElement(
  elementId: string,
  fileName: string = 'pickup-list.pdf'
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF from element:', error);
    throw new Error('Failed to generate PDF from element');
  }
}

/**
 * Generate detailed pickup PDF for a single pickup
 */
export async function generateSinglePickupPDF(pickup: PickupRequest): Promise<void> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    
    let yPosition = margin;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Pickup Details', margin, yPosition);
    yPosition += 15;
    
    // Pickup ID
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Pickup ID: ${pickup.pickupId}`, margin, yPosition);
    yPosition += 10;
    
    // Basic Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Basic Information', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${pickup.orderId}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Customer: ${pickup.customerName}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Dealer: ${pickup.dealerName}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Scheduled Date: ${formatDate(pickup.scheduledDate)}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Status: ${pickup.status}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Priority: ${pickup.priority}`, margin, yPosition);
    yPosition += 10;
    
    // Customer Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${pickup.customerName}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Phone: ${pickup.customerPhone}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Address: ${formatAddress(pickup.pickupAddress)}`, margin, yPosition);
    yPosition += 10;
    
    // Items
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Items to Pickup', margin, yPosition);
    yPosition += 8;
    
    pickup.items.forEach((item, index) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${index + 1}. ${item.productName} (Qty: ${item.quantity})`, margin, yPosition);
      yPosition += 6;
    });
    
    // Save PDF
    const fileName = `pickup-${pickup.pickupId}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating single pickup PDF:', error);
    throw new Error('Failed to generate single pickup PDF');
  }
}

/**
 * Generate PDF for picklist data (new structure)
 */
export async function generatePicklistPDF(
  picklists: PicklistData[],
  options: {
    title?: string;
    includeFilters?: boolean;
    filters?: {
      status?: string;
      priority?: string;
      searchTerm?: string;
    };
  } = {}
): Promise<void> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPosition = margin;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title || 'Picklist Management Report', margin, yPosition);
    yPosition += 15;
    
    // Generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 10;
    
    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Picklists: ${picklists.length}`, margin, yPosition);
    yPosition += 6;
    
    // Count by status
    const statusCounts = picklists.reduce((acc, picklist) => {
      acc[picklist.scanStatus] = (acc[picklist.scanStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`${status}: ${count}`, margin + 20, yPosition);
      yPosition += 5;
    });
    
    yPosition += 10;
    
    // Add filters if provided
    if (options.includeFilters && options.filters) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Filters', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (options.filters.status) {
        doc.text(`Status: ${options.filters.status}`, margin, yPosition);
        yPosition += 6;
      }
      if (options.filters.searchTerm) {
        doc.text(`Search: ${options.filters.searchTerm}`, margin, yPosition);
        yPosition += 6;
      }
      
      yPosition += 5;
    }
    
    // Table headers
    const headers = ['ID', 'Order ID', 'Customer', 'Dealer', 'Staff', 'Status', 'Items'];
    const colWidths = [25, 25, 30, 30, 30, 25, 15];
    
    // Draw table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    let xPos = margin;
    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, yPosition);
      xPos += colWidths[index];
    });
    yPosition += 8;
    
    // Table rows
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    picklists.forEach((picklist) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
        
        // Redraw header
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        xPos = margin;
        headers.forEach((header, index) => {
          doc.text(header, xPos + 2, yPosition);
          xPos += colWidths[index];
        });
        yPosition += 8;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
      }
      
      // Row data
      const rowData = [
        (picklist._id || '').substring(0, 8),
        picklist.orderInfo?.orderId || picklist.linkedOrderId || 'N/A',
        picklist.orderInfo?.customerDetails?.name || 'N/A',
        picklist.dealerInfo?.name || 'N/A',
        picklist.staffInfo?.name || 'N/A',
        picklist.scanStatus || 'N/A',
        (picklist.totalItems || picklist.skuList?.length || 0).toString()
      ];
      
      xPos = margin;
      rowData.forEach((data, colIndex) => {
        const maxLength = Math.floor(colWidths[colIndex] / 1.5);
        const displayText = data.length > maxLength ? data.substring(0, maxLength) + '...' : data;
        doc.text(displayText, xPos + 2, yPosition);
        xPos += colWidths[colIndex];
      });
      
      yPosition += 6;
    });
    
    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }
    
    // Save
    const fileName = `picklist-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating picklist PDF:', error);
    throw new Error('Failed to generate picklist PDF');
  }
}

/**
 * Generate detailed PDF for single picklist
 */
export async function generateSinglePicklistPDF(picklist: PicklistData): Promise<void> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    let yPosition = margin;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Picklist Details', margin, yPosition);
    yPosition += 15;
    
    // Picklist ID
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Picklist ID: ${picklist._id}`, margin, yPosition);
    yPosition += 10;
    
    // Basic Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Basic Information', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${picklist.orderInfo?.orderId || picklist.linkedOrderId || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Dealer: ${picklist.dealerInfo?.name || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    if (picklist.dealerInfo?.email) {
      doc.text(`Dealer Email: ${picklist.dealerInfo.email}`, margin, yPosition);
      yPosition += 6;
    }
    doc.text(`Staff: ${picklist.staffInfo?.name || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    if (picklist.staffInfo?.email) {
      doc.text(`Staff Email: ${picklist.staffInfo.email}`, margin, yPosition);
      yPosition += 6;
    }
    doc.text(`Status: ${picklist.scanStatus}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Invoice Generated: ${picklist.invoiceGenerated ? 'Yes' : 'No'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Created: ${formatDate(picklist.createdAt)}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Updated: ${formatDate(picklist.updatedAt)}`, margin, yPosition);
    yPosition += 10;
    
    // Customer Details (if available)
    if (picklist.orderInfo?.customerDetails) {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Details', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${picklist.orderInfo.customerDetails.name || 'N/A'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Phone: ${picklist.orderInfo.customerDetails.phone || 'N/A'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Email: ${picklist.orderInfo.customerDetails.email || 'N/A'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Address: ${picklist.orderInfo.customerDetails.address || 'N/A'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Pincode: ${picklist.orderInfo.customerDetails.pincode || 'N/A'}`, margin, yPosition);
      yPosition += 10;
    }
    
    // Order Details (if available)
    if (picklist.orderInfo) {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Details', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Order Amount: ₹${picklist.orderInfo.order_Amount?.toLocaleString() || 0}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Payment Type: ${picklist.orderInfo.paymentType || 'N/A'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Delivery Charges: ₹${picklist.orderInfo.deliveryCharges || 0}`, margin, yPosition);
      yPosition += 10;
    }
    
    // SKU List
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`SKU List (${picklist.totalItems || picklist.skuList?.length || 0} items)`, margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    (picklist.skuList || []).forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(`${index + 1}. SKU: ${item.sku} | Qty: ${item.quantity} | Barcode: ${item.barcode || 'N/A'}`, margin, yPosition);
      yPosition += 6;
    });
    
    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }
    
    // Save
    const fileName = `picklist-${picklist._id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating single picklist PDF:', error);
    throw new Error('Failed to generate single picklist PDF');
  }
}


/**
 * Generate Order Management PDF report
 */
export async function generateOrdersReportPDF(
  orders: Array<{
    orderId: string;
    date: string;
    customer: string;
    amount: string;
    dealers: number;
    status: string;
  }>,
  options: {
    title?: string;
    filters?: Record<string, any>;
  } = {}
): Promise<void> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title || 'Order Management Report', margin, yPosition);
    yPosition += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Total Orders: ${orders.length}`, margin, yPosition);
    yPosition += 10;

    // Status summary
    const statusCounts = orders.reduce((acc, order) => {
      const key = order.status || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Status Summary', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`${status}: ${count}`, margin + 4, yPosition);
      yPosition += 5;
    });
    yPosition += 6;

    if (options.filters) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Filters', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === 'all') {
          return;
        }

        if (typeof value === 'object') {
          const display = JSON.stringify(value);
          doc.text(`${key}: ${display}`, margin + 4, yPosition);
          yPosition += 5;
          return;
        }

        doc.text(`${key}: ${value}`, margin + 4, yPosition);
        yPosition += 5;
      });

      yPosition += 6;
    }

    // Table header
    const headers = ['Order ID', 'Date', 'Customer', 'Amount', 'Dealers', 'Status'];
    const colWidths = [35, 25, 45, 25, 20, 30];
    const startX = margin;

    const drawHeader = () => {
      doc.setFillColor(240, 240, 240);
      doc.rect(startX, yPosition - 5, contentWidth, 8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      let xPos = startX;
      headers.forEach((header, index) => {
        doc.text(header, xPos + 2, yPosition);
        xPos += colWidths[index];
      });
      yPosition += 8;
    };

    drawHeader();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    orders.forEach((order) => {
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = margin + 5;
        drawHeader();
      }

      const row = [
        order.orderId || '-',
        order.date || '-',
        order.customer || '-',
        order.amount || '-',
        order.dealers?.toString() || '0',
        order.status || '-',
      ];

      let xPos = startX;
      row.forEach((cell, idx) => {
        const maxLen = Math.floor(colWidths[idx] / 2);
        const display = cell.length > maxLen ? `${cell.slice(0, maxLen - 3)}...` : cell;
        doc.text(display, xPos + 2, yPosition);
        xPos += colWidths[idx];
      });

      yPosition += 6;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }

    const fileName = `orders-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating orders PDF:', error);
    throw new Error('Failed to generate orders PDF');
  }
}