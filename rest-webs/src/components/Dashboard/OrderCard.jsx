// src/components/Dashboard/OrderCard.jsx

import React, { useState, useRef } from 'react';
import { Clock, Printer } from 'lucide-react';
import './OrderCard.css';

const OrderCard = ({ order, onStatusChange, t }) => {
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const statusColors = {
    'new': '#f59e0b',
    'inProgress': '#3b82f6',
    'delivering': '#8b5cf6',
    'delivered': '#10b981',
    'not_delivered': '#ef4444'
  };

  const handlePrint = (e) => {
    e.stopPropagation();
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      alert("Veuillez autoriser les popups pour pouvoir imprimer le ticket.");
      return;
    }

    const itemsList = order.rawItems || [];
    const itemsHtml = itemsList.map(item => {
      const match = item.name.match(/^(.*?)\s*\((.*?)\)$/);
      const displayName = match ? match[1] : item.name;
      const details = match ? match[2] : '';
      return `
        <tr>
          <td style="padding: 4px 0; font-size: 13px; vertical-align: top;">
            <strong>${displayName}</strong>
            ${details ? `<div style="font-size: 11px; color: #444; padding-left: 8px; font-style: italic; margin-top: 2px;">
              ${details.split(', ').map(d => {
                const cleanD = d.trim().startsWith('+') ? d.trim() : `+ ${d.trim()}`;
                return `<div>${cleanD}</div>`;
              }).join('')}
            </div>` : ''}
          </td>
          <td style="padding: 4px 0; text-align: center; font-size: 13px; vertical-align: top;">x${item.quantity}</td>
          <td style="padding: 4px 0; text-align: right; font-size: 13px; vertical-align: top;">${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const formattedPayment = order.paymentMethod === 'cash' 
      ? 'Espèces' 
      : (order.paymentMethod === 'card' ? 'Carte' : 'En ligne');

    const htmlContent = `
      <html>
        <head>
          <title>Reçu #${order.id}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; font-family: 'Courier New', Courier, monospace; color: #000; }
              .no-print { display: none; }
            }
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 300px; margin: 0 auto; color: #000; }
            .header { text-align: center; margin-bottom: 15px; }
            .header h2 { margin: 0 0 5px 0; font-size: 18px; font-weight: bold; }
            .header p { margin: 2px 0; font-size: 12px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .info-table { width: 100%; font-size: 12px; margin-bottom: 10px; }
            .info-table td { padding: 2px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .items-table th { border-bottom: 1px dashed #000; padding: 5px 0; text-align: left; font-size: 12px; }
            .totals { font-size: 13px; font-weight: bold; text-align: right; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>LA CANYADA</h2>
            <p>Restaurant & Livraison</p>
            <p>Casablanca, Maroc</p>
          </div>
          
          <div class="divider"></div>
          
          <table class="info-table">
            <tr><td><strong>Ticket:</strong></td><td style="text-align: right;">#${order.id}</td></tr>
            <tr><td><strong>Date:</strong></td><td style="text-align: right;">${order.date || ''} ${order.time || ''}</td></tr>
            <tr><td><strong>Client:</strong></td><td style="text-align: right;">${order.customer}</td></tr>
            <tr><td><strong>Tél:</strong></td><td style="text-align: right;">${order.phone || ''}</td></tr>
            ${order.address ? `<tr><td><strong>Adresse:</strong></td><td style="text-align: right; font-size: 11px;">${order.address}</td></tr>` : ''}
          </table>
          
          <div class="divider"></div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 60%;">Article</th>
                <th style="width: 15%; text-align: center;">Qté</th>
                <th style="width: 25%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <div class="totals">
            <table style="width: 100%;">
              <tr>
                <td style="text-align: left; font-size: 12px; font-weight: normal;">Sous-total :</td>
                <td style="text-align: right; font-size: 12px; font-weight: normal;">${((order.total || 0) - (order.deliveryFee || 0)).toFixed(2)} DH</td>
              </tr>
              <tr>
                <td style="text-align: left; font-size: 12px; font-weight: normal;">Livraison :</td>
                <td style="text-align: right; font-size: 12px; font-weight: normal;">${(order.deliveryFee || 0).toFixed(2)} DH</td>
              </tr>
              <tr>
                <td style="text-align: left; font-size: 12px; font-weight: normal;">Paiement :</td>
                <td style="text-align: right; font-size: 12px; font-weight: normal;">${formattedPayment}</td>
              </tr>
              <tr>
                <td style="text-align: left; font-size: 14px; border-top: 1px solid #000; padding-top: 4px;">TOTAL :</td>
                <td style="text-align: right; font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px;">${(order.total || 0).toFixed(2)} DH</td>
              </tr>
            </table>
          </div>
          
          ${order.notes ? `
            <div style="font-size: 11px; margin-top: 10px; font-style: italic;">
              <strong>Note:</strong> ${order.notes}
            </div>
          ` : ''}
          
          <div class="divider"></div>
          
          <div class="footer">
            <p>Merci pour votre visite !</p>
            <p>Bon appétit ! 🍽️</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              // Optionnel: fermer la fenêtre après l'impression
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              #{order.id}
            </span>
            <span style={{ fontWeight: '700' }}>{order.customer}</span>
            <button 
              className="print-ticket-btn"
              onClick={handlePrint}
              title="Imprimer le ticket de caisse"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: '4px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#eab308'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <Printer size={15} />
            </button>
          </h4>
          <p className="order-time">
            <Clock size={13} /> {order.time}
          </p>
        </div>
        <span 
          className="order-status" 
          style={{ backgroundColor: statusColors[order.status] }}
        >
          {t.status[order.status]}
        </span>
      </div>
      <div className="order-body">
        <p className="order-items" style={{ fontWeight: '600' }}>{order.items}</p>
        
        {order.address && (
          <p className="order-address" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📍</span> {order.address}
          </p>
        )}
        
        {order.deliverer && (
          <p className="order-deliverer" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📦</span> {t.deliverer}: {order.deliverer}
          </p>
        )}

        {order.status === 'not_delivered' && (
          <div className="failed-delivery-info" style={{ marginTop: '12px', padding: '10px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '6px', fontSize: '0.825rem' }}>
            <p style={{ margin: '0', fontWeight: 'bold', color: '#991b1b' }}>⚠️ Échec de livraison</p>
            <p style={{ margin: '4px 0 0 0', color: '#7f1d1d' }}><strong>Raison :</strong> {order.failedDeliveryReason || 'Non spécifiée'}</p>
            {order.failedDeliveryNote && (
              <p style={{ margin: '2px 0 0 0', color: '#7f1d1d', fontStyle: 'italic' }}><strong>Note :</strong> {order.failedDeliveryNote}</p>
            )}
          </div>
        )}
      </div>
      <div className="order-footer">
        <span className="order-total">{order.total} {t.dh}</span>
        {order.status === 'new' && (
          <button 
            className="btn-accept" 
            disabled={submitting}
            onClick={async (e) => {
              e.stopPropagation();
              if (submittingRef.current || submitting) return;
              submittingRef.current = true;
              setSubmitting(true);
              try {
                await onStatusChange(order.id, 'inProgress');
              } finally {
                submittingRef.current = false;
                setSubmitting(false);
              }
            }}
            style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            {submitting ? '...' : t.acceptOrder}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;