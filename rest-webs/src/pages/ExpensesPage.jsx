// src/pages/ExpensesPage.jsx

import React, { useState, useEffect } from 'react';
import { Coins, Plus, Trash2, Calendar, FileText, PieChart } from 'lucide-react';
import { expensesAPI } from '../services/api';
import { notify } from '../utils/notifications';
import './ExpensesPage.css';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Ingrédients');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = ['Ingrédients', 'Salaires', 'Loyers/Factures', 'Marketing', 'Divers'];

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const response = await expensesAPI.getAll();
      if (response.success) {
        setExpenses(response.expenses);
      }
    } catch (error) {
      console.error('Erreur chargement dépenses:', error);
      notify.error('Erreur lors du chargement des dépenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) {
      notify.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const payload = {
        title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
      };

      const response = await expensesAPI.create(payload);
      if (response.success) {
        notify.success('Dépense enregistrée avec succès !');
        setTitle('');
        setAmount('');
        setCategory('Ingrédients');
        setDate(new Date().toISOString().split('T')[0]);
        loadExpenses();
      }
    } catch (error) {
      console.error('Erreur enregistrement dépense:', error);
      notify.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la dépense "${name}" ?`)) {
      return;
    }

    try {
      const response = await expensesAPI.delete(id);
      if (response.success) {
        notify.success('Dépense supprimée avec succès');
        setExpenses(expenses.filter((exp) => exp._id !== id));
      }
    } catch (error) {
      console.error('Erreur suppression dépense:', error);
      notify.error('Erreur lors de la suppression de la dépense');
    }
  };

  // Group expenses by category for stats summary
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Ingrédients': return '#ef4444'; // Red
      case 'Salaires': return '#3b82f6'; // Blue
      case 'Loyers/Factures': return '#f59e0b'; // Amber
      case 'Marketing': return '#ec4899'; // Pink
      case 'Divers': return '#8b5cf6'; // Purple
      default: return '#6b7280';
    }
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="page">
        <h1>Gestion des Dépenses</h1>
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="expenses-page-header">
        <h1>
          <Coins size={28} />
          Gestion des Dépenses
        </h1>
        <p className="expenses-subtitle">Suivez et contrôlez les coûts opérationnels de votre restaurant</p>
      </div>

      {/* Stats Summary row */}
      <div className="expenses-summary-row">
        <div className="summary-card total-spent-card">
          <div className="card-icon"><Coins size={24} /></div>
          <div className="card-info">
            <h3>{totalSpent.toFixed(2)} DH</h3>
            <p>Total Dépensé</p>
          </div>
        </div>

        {categories.map(cat => {
          const total = categoryTotals[cat] || 0;
          return (
            <div key={cat} className="summary-card category-spent-card">
              <div className="card-indicator" style={{ backgroundColor: getCategoryColor(cat) }} />
              <div className="card-info">
                <h3>{total.toFixed(2)} DH</h3>
                <p>{cat}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Form + List */}
      <div className="expenses-content-grid">
        {/* Form Card */}
        <div className="expense-form-card">
          <h2>
            <Plus size={20} />
            Enregistrer une dépense
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Titre / Description *</label>
              <input
                type="text"
                required
                placeholder="Ex: Achat viande hachée, Facture électricité..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Montant (DH) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Ex: 450.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Catégorie *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-expense-btn">
              Enregistrer
            </button>
          </form>
        </div>

        {/* Expenses List Table */}
        <div className="expenses-table-card">
          <h2>
            <FileText size={20} />
            Historique des dépenses
          </h2>

          {expenses.length === 0 ? (
            <div className="no-expenses">
              <Coins size={40} color="#9ca3af" />
              <p>Aucune dépense enregistrée pour le moment</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Titre</th>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td>
                        {new Date(exp.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        <strong className="expense-title-text">{exp.title}</strong>
                      </td>
                      <td>
                        <span
                          className="category-badge"
                          style={{
                            backgroundColor: `${getCategoryColor(exp.category)}18`,
                            color: getCategoryColor(exp.category),
                            borderColor: `${getCategoryColor(exp.category)}40`
                          }}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td className="expense-amount-text">
                        {exp.amount.toFixed(2)} DH
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="delete-expense-btn"
                          onClick={() => handleDelete(exp._id, exp.title)}
                          title="Supprimer la dépense"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
