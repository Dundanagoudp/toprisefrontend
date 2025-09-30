import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Build invoice DOM node for rendering/printing.
 */
const createInvoiceElement = (order: any, products: any[]) => {
  const container = document.createElement("div");
  container.style.width = "800px";
  container.style.padding = "24px";
  container.style.boxSizing = "border-box";
  container.style.fontFamily = "Inter, Arial, sans-serif";
  container.style.color = "#111827";
  container.style.background = "#ffffff";

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div>
        <h2 style="margin:0">Toprise</h2>
        <div style="font-size:12px;color:#6b7280">Address line 1<br/>City, State - PIN</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;color:#6b7280">Invoice</div>
        <div style="font-weight:600;font-size:18px">${order.orderId || "-"}</div>
        <div style="font-size:12px;color:#6b7280">${
          order.orderDate ? new Date(order.orderDate).toLocaleString() : "-"
        }</div>
      </div>
    </div>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0" />

    <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:16px;">
      <div style="flex:1">
        <div style="font-size:12px;color:#6b7280">Bill To</div>
        <div style="font-weight:600">${order.customerDetails?.name || "-"}</div>
        <div style="font-size:12px;color:#6b7280">${order.customerDetails?.address || ""}</div>
        <div style="font-size:12px;color:#6b7280">Phone: ${order.customerDetails?.phone || "-"}</div>
        <div style="font-size:12px;color:#6b7280">Email: ${order.customerDetails?.email || "-"}</div>
      </div>

      <div style="width:220px">
        <div style="font-size:12px;color:#6b7280">Payment Method</div>
        <div style="font-weight:600">${order.paymentType || "-"}</div>

        <div style="height:8px"></div>

        <div style="font-size:12px;color:#6b7280">Delivery Type</div>
        <div style="font-weight:600">${order.type_of_delivery || "Standard"}</div>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:12px">
      <thead>
        <tr style="background:#f9fafb">
          <th style="text-align:left;padding:8px;border:1px solid #e5e7eb;font-size:12px">Item</th>
          <th style="text-align:center;padding:8px;border:1px solid #e5e7eb;font-size:12px">Qty</th>
          <th style="text-align:right;padding:8px;border:1px solid #e5e7eb;font-size:12px">Unit</th>
          <th style="text-align:right;padding:8px;border:1px solid #e5e7eb;font-size:12px">Total</th>
        </tr>
      </thead>
      <tbody>
        ${products
          .map((p) => {
            const name = (p.product_name || p.name || "Item")
              .toString()
              .replace(/[<>&]/g, "");
            const qty = p.quantity ?? 1;
            const unit = Number(p.selling_price ?? p.price ?? 0).toLocaleString();
            const total = Number(
              p.totalPrice ?? qty * (p.selling_price ?? p.price ?? 0)
            ).toLocaleString();
            return `
              <tr>
                <td style="padding:8px;border:1px solid #e5e7eb;font-size:12px">${name}</td>
                <td style="text-align:center;padding:8px;border:1px solid #e5e7eb;font-size:12px">${qty}</td>
                <td style="text-align:right;padding:8px;border:1px solid #e5e7eb;font-size:12px">₹${unit}</td>
                <td style="text-align:right;padding:8px;border:1px solid #e5e7eb;font-size:12px">₹${total}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>

    <div style="display:flex;justify-content:flex-end">
      <div style="width:320px">
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px">
          <div>Subtotal</div>
          <div>₹${(
            (order.order_Amount || 0) -
            (order.GST || 0) -
            (order.deliveryCharges || 0)
          ).toLocaleString()}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px">
          <div>GST</div>
          <div>₹${(order.GST || 0).toLocaleString()}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px">
          <div>Delivery</div>
          <div>₹${(order.deliveryCharges || 0).toLocaleString()}</div>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0" />
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700;font-size:16px">
          <div>Total</div>
          <div>₹${(order.order_Amount || 0).toLocaleString()}</div>
        </div>
      </div>
    </div>

    <div style="margin-top:20px;font-size:12px;color:#6b7280">
      <div>Thank you for your order!</div>
      <div style="margin-top:8px">If you have any questions, contact us at support@example.com</div>
    </div>
  `;

  return container;
};

/**
 * Download invoice as PDF.
 */
export const downloadInvoice = async (order: any, products: any[]) => {
  try {
    const invoiceEl = createInvoiceElement(order, products);
    invoiceEl.style.position = "fixed";
    invoiceEl.style.left = "-9999px";
    invoiceEl.style.top = "0";
    invoiceEl.style.visibility = "hidden";
    document.body.appendChild(invoiceEl);

    await new Promise((res) => setTimeout(res, 250));

    const canvas = await html2canvas(invoiceEl, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`invoice-${order.orderId || "unknown"}.pdf`);
  } catch (err) {
    console.error("Invoice generation failed:", err);
    printInvoiceFallback(order, products);
  }
};

/**
 * Fallback: open invoice in new window for printing.
 */
export const printInvoiceFallback = (order: any, products: any[]) => {
  const el = createInvoiceElement(order, products);
  const html = `
    <html>
      <head>
        <title>Invoice - ${order.orderId}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body>${el.outerHTML}</body>
    </html>
  `;
  const w = window.open("", "_blank");
  if (!w) {
    alert("Unable to open print window. Please allow popups.");
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
};
