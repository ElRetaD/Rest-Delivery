// src/pages/ReportsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Coins, CheckCircle, Package, TrendingUp, Calendar,
  BarChart3, Download, XCircle, Truck, Star, Clock, ArrowDownCircle, Percent
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { statsAPI } from '../services/api';
import { notify } from '../utils/notifications';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ReportsPage.css';

const ReportsPage = ({ t: _t, orders }) => {
  const [loading, setLoading] = useState(true);
  
  // Base cached stats
  const [todayStats, setTodayStats] = useState({
    totalOrders: 0, revenue: 0, newOrders: 0, deliveredOrders: 0,
    inProgressOrders: 0, cancelledOrders: 0, averageOrderValue: 0,
    totalExpenses: 0, netProfit: 0,
  });
  const [weekStats, setWeekStats] = useState({
    totalOrders: 0, revenue: 0, ordersByDay: [],
    deliveredOrders: 0, pendingOrders: 0, cancelledOrders: 0, averageOrderValue: 0,
    totalExpenses: 0, netProfit: 0,
  });
  const [monthStats, setMonthStats] = useState({
    totalOrders: 0, revenue: 0, deliveredOrders: 0, cancelledOrders: 0, averageOrderValue: 0,
    inProgressOrders: 0, totalExpenses: 0, netProfit: 0,
  });

  // Filter States
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // today, week, month, year, custom
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Custom & Yearly stats
  const [customStats, setCustomStats] = useState({
    totalOrders: 0, revenue: 0, deliveredOrders: 0, cancelledOrders: 0, averageOrderValue: 0, inProgressOrders: 0,
    totalExpenses: 0, netProfit: 0,
  });
  const [yearStats, setYearStats] = useState({
    totalOrders: 0, revenue: 0, deliveredOrders: 0, cancelledOrders: 0, averageOrderValue: 0, inProgressOrders: 0, months: [],
    totalExpenses: 0, netProfit: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedPeriod === 'year') {
      fetchYearStats(selectedYear);
    }
  }, [selectedPeriod, selectedYear]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [todayData, weekData, monthData] = await Promise.all([
        statsAPI.getToday(),
        statsAPI.getWeek(),
        statsAPI.getMonth(),
      ]);
      if (todayData.success) setTodayStats(todayData.stats);
      if (weekData.success) setWeekStats(weekData.stats);
      if (monthData.success) setMonthStats(monthData.stats);
      
      // Fetch default year stats as well
      const yearData = await statsAPI.getYear(selectedYear);
      if (yearData.success) setYearStats(yearData.stats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      notify.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const fetchYearStats = async (year) => {
    try {
      const response = await statsAPI.getYear(year);
      if (response.success) {
        setYearStats(response.stats);
      }
    } catch (error) {
      console.error('Erreur chargement stats annuelles:', error);
      notify.error('Erreur lors du chargement des statistiques de l\'année ' + year);
    }
  };

  const fetchCustomStats = async () => {
    if (!startDate || !endDate) {
      notify.error('Veuillez sélectionner une date de début et de fin');
      return;
    }
    
    // Validate date sequence
    if (new Date(startDate) > new Date(endDate)) {
      notify.error('La date de début doit être antérieure à la date de fin');
      return;
    }

    setLoading(true);
    try {
      const response = await statsAPI.getCustom(startDate, endDate);
      if (response.success) {
        setCustomStats({
          totalOrders: response.stats.totalOrders || 0,
          revenue: response.stats.revenue || 0,
          deliveredOrders: response.stats.deliveredOrders || 0,
          cancelledOrders: response.stats.cancelledOrders || 0,
          averageOrderValue: response.stats.averageOrderValue || 0,
          inProgressOrders: response.stats.inProgressOrders || 0,
          totalExpenses: response.stats.totalExpenses || 0,
          netProfit: response.stats.netProfit || 0,
        });
        notify.success('Statistiques personnalisées chargées !');
      }
    } catch (error) {
      console.error('Erreur chargement stats personnalisées:', error);
      notify.error('Erreur lors du chargement des statistiques personnalisées');
    } finally {
      setLoading(false);
    }
  };

  // Top dishes from all orders
  const calculateTopDishes = () => {
    if (!orders || orders.length === 0) return [];
    const dishCounts = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = item.name || 'Unknown';
          if (!dishCounts[name]) dishCounts[name] = { name, count: 0, revenue: 0 };
          dishCounts[name].count += item.quantity || 0;
          dishCounts[name].revenue += item.total || 0;
        });
      }
    });
    return Object.values(dishCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const topDishes = calculateTopDishes();

  // Active period stats mapping
  const currentStats = selectedPeriod === 'today'
    ? todayStats
    : selectedPeriod === 'week'
      ? weekStats
      : selectedPeriod === 'month'
        ? monthStats
        : selectedPeriod === 'year'
          ? yearStats
          : customStats;

  const periodLabel = selectedPeriod === 'today' ? "Aujourd'hui"
    : selectedPeriod === 'week' ? '7 derniers jours'
      : selectedPeriod === 'month' ? '30 derniers jours'
        : selectedPeriod === 'year' ? `Année ${selectedYear}`
          : (startDate && endDate)
            ? `Du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`
            : 'Période personnalisée';

  const deliveryRate = currentStats.totalOrders > 0
    ? ((currentStats.deliveredOrders / currentStats.totalOrders) * 100).toFixed(1)
    : 0;

  const avgOrderValue = currentStats.totalOrders > 0
    ? (currentStats.revenue / currentStats.totalOrders).toFixed(2)
    : 0;

  // Chart Data preparation
  const chartData = selectedPeriod === 'year'
    ? yearStats.months.map(m => ({
        month: m.month,
        orders: m.orders || 0,
        revenue: m.revenue || 0,
        expenses: m.expenses || 0,
        netProfit: m.netProfit !== undefined ? m.netProfit : (m.revenue - (m.expenses || 0)),
      }))
    : (weekStats.ordersByDay && weekStats.ordersByDay.length > 0)
      ? weekStats.ordersByDay.map(day => ({
          day: new Date(day.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' }),
          orders: day.orders || 0,
          revenue: day.revenue || 0,
          expenses: day.expenses || 0,
          netProfit: day.netProfit !== undefined ? day.netProfit : (day.revenue - (day.expenses || 0)),
        }))
      : [];

  const xAxisKey = selectedPeriod === 'year' ? 'month' : 'day';

  // PDF Export
  const handleExport = () => {
    try {
      const doc = new jsPDF();

      // Color Palette
      const primaryColor = [21, 25, 34]; // Dark slate #151922
      const accentColor = [234, 179, 8]; // Amber/gold #eab308
      const whiteColor = [255, 255, 255];
      const greyColor = [100, 116, 139];

      // Header Title
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(...accentColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('LA CANYADA RESTAURANT', 14, 25);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Rapport d\'Activite & Statistiques Financieres', 14, 32);

      // Date & Period Info
      doc.setTextColor(...primaryColor);
      doc.setFontSize(10);
      doc.text(`Genere le : ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 140, 52);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Periode : ${periodLabel}`, 14, 52);

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 57, 196, 57);

      // Section 1: KPI Summary Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Indicateurs Cles de Performance (KPI)', 14, 66);

      const kpiHeaders = [['Indicateur', 'Valeur']];
      const kpiRows = [
        ['Commandes Totales', `${currentStats.totalOrders} commandes`],
        ['Chiffre d\'Affaires (Revenus)', `${(currentStats.revenue || 0).toFixed(2)} DH`],
        ['Total des Dépenses', `${(currentStats.totalExpenses || 0).toFixed(2)} DH`],
        ['Profit Net', `${(currentStats.netProfit !== undefined ? currentStats.netProfit : (currentStats.revenue - currentStats.totalExpenses)).toFixed(2)} DH`],
        ['Commandes Livrees', `${currentStats.deliveredOrders || 0}`],
        ['Taux de Livraison', `${deliveryRate}%`],
        ['Ticket Moyen', `${avgOrderValue} DH`],
        ['Commandes Annulees', `${currentStats.cancelledOrders || 0}`],
        ['Commandes En Cours', `${currentStats.inProgressOrders || 0}`],
      ];

      autoTable(doc, {
        startY: 72,
        head: kpiHeaders,
        body: kpiRows,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: whiteColor, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold' },
          1: { cellWidth: 82, halign: 'right' }
        }
      });

      let currentY = doc.lastAutoTable.finalY + 12;

      // Section 2: Breakdown (if Week or Year)
      if (selectedPeriod === 'week' && chartData.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Detail Quotidien des Ventes', 14, currentY);

        const weekHeaders = [['Jour', 'Commandes', 'Revenus (DH)', 'Dépenses (DH)', 'Profit Net (DH)']];
        const weekRows = chartData.map(d => [
          d.day,
          d.orders,
          `${d.revenue.toFixed(2)} DH`,
          `${d.expenses.toFixed(2)} DH`,
          `${d.netProfit.toFixed(2)} DH`
        ]);

        autoTable(doc, {
          startY: currentY + 6,
          head: weekHeaders,
          body: weekRows,
          theme: 'grid',
          headStyles: { fillColor: primaryColor, textColor: whiteColor },
          styles: { fontSize: 9, cellPadding: 3 },
        });

        currentY = doc.lastAutoTable.finalY + 12;
      } else if (selectedPeriod === 'year' && yearStats.months && yearStats.months.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Detail Mensuel des Ventes', 14, currentY);

        const yearHeaders = [['Mois', 'Commandes', 'Revenus (DH)', 'Dépenses (DH)', 'Profit Net (DH)']];
        const yearRows = yearStats.months.map(m => [
          m.month,
          m.orders,
          `${m.revenue.toFixed(2)} DH`,
          `${m.expenses.toFixed(2)} DH`,
          `${m.netProfit.toFixed(2)} DH`
        ]);

        autoTable(doc, {
          startY: currentY + 6,
          head: yearHeaders,
          body: yearRows,
          theme: 'grid',
          headStyles: { fillColor: primaryColor, textColor: whiteColor },
          styles: { fontSize: 9, cellPadding: 3 },
        });

        currentY = doc.lastAutoTable.finalY + 12;
      }

      // Check for page overflow
      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      // Section 3: Top Plats Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Top 5 des Plats les Plus Vendus', 14, currentY);

      if (topDishes.length === 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...greyColor);
        doc.text('Aucune donnee disponible pour cette periode.', 14, currentY + 8);
      } else {
        const dishesHeaders = [['Rang', 'Nom du Plat', 'Quantite Vendue', 'Chiffre d\'Affaires']];
        const dishesRows = topDishes.map((d, index) => [
          `#${index + 1}`,
          d.name,
          `${d.count} vendus`,
          `${d.revenue.toFixed(2)} DH`
        ]);

        autoTable(doc, {
          startY: currentY + 6,
          head: dishesHeaders,
          body: dishesRows,
          theme: 'striped',
          headStyles: { fillColor: primaryColor, textColor: whiteColor },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 9, cellPadding: 4 },
        });
      }

      // Save PDF
      const cleanLabel = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Rapport_LaCanada_${cleanLabel}.pdf`);
      notify.success('Rapport PDF exporte avec succes !');
    } catch (err) {
      console.error('Erreur exportation PDF:', err);
      notify.error('Erreur lors de la generation du PDF');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="reports-loading">
          <div className="reports-spinner" />
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Rapports & Statistiques</h1>
          <p className="reports-subtitle">Vue d'ensemble de votre activité — {periodLabel}</p>
        </div>
        <button className="export-btn" onClick={handleExport}>
          <Download size={17} />
          Exporter PDF
        </button>
      </div>

      {/* Period Tabs & Custom Filters */}
      <div className="reports-filter-section">
        <div className="period-selector">
          {[
            { key: 'today', label: "Aujourd'hui", icon: Calendar },
            { key: 'week', label: '7 jours', icon: BarChart3 },
            { key: 'month', label: '30 jours', icon: TrendingUp },
            { key: 'year', label: 'Par année', icon: Calendar },
            { key: 'custom', label: 'Personnalisé', icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`period-btn ${selectedPeriod === key ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(key)}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
          <button className="refresh-btn" onClick={loadStats}>
            ↻ Actualiser
          </button>
        </div>

        {selectedPeriod === 'year' && (
          <div className="year-selector-box">
            <label>Sélectionner l'année :</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="year-dropdown"
            >
              {Array.from({ length: 7 }, (_, i) => 2024 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}

        {selectedPeriod === 'custom' && (
          <div className="custom-date-box">
            <div className="date-group">
              <label>Du :</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-group">
              <label>Au :</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            <button className="btn-apply-date" onClick={fetchCustomStats}>
              Appliquer
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-blue">
          <div className="kpi-icon"><ShoppingBag size={22} /></div>
          <div className="kpi-body">
            <p className="kpi-label">Commandes</p>
            <h2 className="kpi-value">{currentStats.totalOrders}</h2>
            <span className="kpi-sub">{periodLabel}</span>
          </div>
        </div>

        <div className="kpi-card kpi-green">
          <div className="kpi-icon"><Coins size={22} /></div>
          <div className="kpi-body">
            <p className="kpi-label">Revenus</p>
            <h2 className="kpi-value">{(currentStats.revenue || 0).toFixed(0)} <span className="kpi-unit">DH</span></h2>
            <span className="kpi-sub">Commandes livrées</span>
          </div>
        </div>

        <div className="kpi-card kpi-red">
          <div className="kpi-icon"><ArrowDownCircle size={22} /></div>
          <div className="kpi-body">
            <p className="kpi-label">Dépenses</p>
            <h2 className="kpi-value">{(currentStats.totalExpenses || 0).toFixed(0)} <span className="kpi-unit">DH</span></h2>
            <span className="kpi-sub">Frais opérationnels</span>
          </div>
        </div>

        {/* High contrast custom Styled Net Profit Card */}
        <div className="kpi-card" style={{
          background: 'rgba(250, 204, 21, 0.04)',
          border: '1.5px solid var(--accent-primary, #eab308)',
          boxShadow: '0 4px 20px rgba(234, 179, 8, 0.1)'
        }}>
          <div className="kpi-icon" style={{
            backgroundColor: 'rgba(234, 179, 8, 0.15)',
            color: '#eab308'
          }}><TrendingUp size={22} /></div>
          <div className="kpi-body">
            <p className="kpi-label" style={{ color: '#eab308', fontWeight: '800' }}>Profit Net</p>
            <h2 className="kpi-value" style={{ color: '#eab308' }}>
              {((currentStats.netProfit !== undefined) 
                ? currentStats.netProfit 
                : ((currentStats.revenue || 0) - (currentStats.totalExpenses || 0))
              ).toFixed(0)} <span className="kpi-unit" style={{ color: '#eab308' }}>DH</span>
            </h2>
            <span className="kpi-sub" style={{ color: 'var(--text-secondary)' }}>Revenus - Dépenses</span>
          </div>
        </div>

        <div className="kpi-card kpi-emerald">
          <div className="kpi-icon"><CheckCircle size={22} /></div>
          <div className="kpi-body">
            <p className="kpi-label">Livrées</p>
            <h2 className="kpi-value">{currentStats.deliveredOrders || 0}</h2>
            <span className="kpi-sub">Taux : {deliveryRate}%</span>
          </div>
        </div>

        <div className="kpi-card kpi-amber">
          <div className="kpi-icon"><Truck size={22} /></div>
          <div className="kpi-body">
            <p className="kpi-label">En cours</p>
            <h2 className="kpi-value">{currentStats.inProgressOrders || 0}</h2>
            <span className="kpi-sub">À livrer</span>
          </div>
        </div>

        <div className="kpi-card kpi-purple">
          <div className="kpi-icon"><Star size={22} /></div>
          <div className="kpi-body">
            <p className="kpi-label">Ticket moyen</p>
            <h2 className="kpi-value">{avgOrderValue} <span className="kpi-unit">DH</span></h2>
            <span className="kpi-sub">Par commande</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Line Chart */}
        <div className="report-card chart-card">
          <div className="card-head">
            <h3>{selectedPeriod === 'year' ? `Évolution financière - ${selectedYear}` : 'Évolution financière (7 jours)'}</h3>
            <span className="chart-badge">{selectedPeriod === 'year' ? 'Annuelle' : 'Semaine'}</span>
          </div>
          {chartData.length > 0 ? (
            <div className="chart-scroll-wrapper">
              <div className="chart-responsive-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey={xAxisKey} stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} name="Revenus (DH)" dot={{ fill: '#10b981', r: 4 }} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} name="Dépenses (DH)" dot={{ fill: '#ef4444', r: 4 }} />
                    <Line type="monotone" dataKey="netProfit" stroke="#3b82f6" strokeWidth={3} name="Profit Net (DH)" dot={{ fill: '#3b82f6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="empty-chart">
              <BarChart3 size={40} color="var(--text-muted)" />
              <p>{selectedPeriod === 'custom' ? 'Sélectionnez des dates pour voir le graphique' : 'Pas de données disponibles pour cette période'}</p>
            </div>
          )}
        </div>

        {/* Bar Chart - Top Dishes */}
        <div className="report-card chart-card">
          <div className="card-head">
            <h3>Top 5 plats vendus</h3>
            <span className="chart-badge">Tout</span>
          </div>
          {topDishes.length > 0 ? (
            <div className="chart-scroll-wrapper">
              <div className="chart-responsive-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDishes.map(d => ({ name: d.name, commandes: d.count, revenus: Math.round(d.revenue) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="commandes" fill="#6366f1" name="Commandes" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="revenus" fill="#10b981" name="Revenus (DH)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="empty-chart">
              <Package size={40} color="var(--text-muted)" />
              <p>Aucune commande enregistrée</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row">
        {/* Delivery Taux Widget */}
        <div className="report-card rate-card">
          <div className="card-head">
            <h3>Taux de livraison</h3>
          </div>
          <div className="rate-circle-wrapper">
            <div className="rate-circle" style={{ '--rate': deliveryRate }}>
              <span className="rate-text">{deliveryRate}%</span>
            </div>
          </div>
          <div className="rate-legend">
            <div className="rate-item">
              <span className="dot green" />
              <span>{currentStats.deliveredOrders || 0} Livrées</span>
            </div>
            <div className="rate-item">
              <span className="dot red" />
              <span>{currentStats.cancelledOrders || 0} Annulées</span>
            </div>
            <div className="rate-item">
              <span className="dot amber" />
              <span>{currentStats.inProgressOrders || 0} En cours</span>
            </div>
          </div>
        </div>

        {/* Top Dishes Table */}
        <div className="report-card">
          <div className="card-head">
            <h3>🏆 Classement des plats</h3>
          </div>
          {topDishes.length === 0 ? (
            <p className="no-data">Aucune donnée disponible</p>
          ) : (
            <ul className="top-items">
              {topDishes.map((dish, index) => (
                <li key={index}>
                  <span className={`dish-rank rank-${index + 1}`}>#{index + 1}</span>
                  <span className="dish-name">{dish.name}</span>
                  <span className="dish-count">{dish.count} vendus</span>
                  <span className="dish-revenue">{dish.revenue.toFixed(0)} DH</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary card */}
        <div className="report-card summary-card">
          <div className="card-head">
            <h3>Résumé comparatif</h3>
          </div>
          <div className="summary-rows">
            {[
              { label: "Aujourd'hui", orders: todayStats.totalOrders, revenue: todayStats.revenue, net: todayStats.netProfit || (todayStats.revenue - todayStats.totalExpenses) },
              { label: '7 derniers jours', orders: weekStats.totalOrders, revenue: weekStats.revenue, net: weekStats.netProfit || (weekStats.revenue - weekStats.totalExpenses) },
              { label: '30 derniers jours', orders: monthStats.totalOrders, revenue: monthStats.revenue, net: monthStats.netProfit || (monthStats.revenue - monthStats.totalExpenses) },
              { label: `Année ${selectedYear}`, orders: yearStats.totalOrders, revenue: yearStats.revenue, net: yearStats.netProfit || (yearStats.revenue - yearStats.totalExpenses) },
            ].map((row, i) => (
              <div key={i} className="summary-row">
                <div className="summary-label"><Clock size={14} />{row.label}</div>
                <div className="summary-vals">
                  <span className="val-orders">{row.orders} cmd</span>
                  <span className="val-revenue">Revs: {row.revenue.toFixed(0)} DH</span>
                  <span className="val-net">Net: {row.net.toFixed(0)} DH</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;