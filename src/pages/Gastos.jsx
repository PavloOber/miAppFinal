import { useState, useContext, useMemo } from "react"; // Add useMemo
import { GastosContext } from "../context/gastosContext"; 

// Helper function to get month name in Spanish
const getMonthName = (monthIndex) => {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return months[monthIndex];
};

const Gastos = () => {
  const { items, addItem, deleteItem } = useContext(GastosContext); // Get deleteItem 

  const [form, setForm] = useState({
    tipo: "Gasto",
    descripcion: "",
    cantidad: "", 
    fecha: new Date().toISOString().split('T')[0], 
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.descripcion || !form.cantidad || !form.fecha) { // Check fecha too
        alert("Por favor, complete todos los campos.");
        return;
    }
    const newItem = {
        ...form,
        cantidad: parseFloat(form.cantidad) || 0,
        id: Date.now(), 
        // Ensure fecha is stored correctly, input type=date gives YYYY-MM-DD
        fecha: form.fecha 
    };
    addItem(newItem); 
    setForm({ 
        tipo: "Gasto", 
        descripcion: "", 
        cantidad: "", 
        fecha: new Date().toISOString().split('T')[0] 
    });
  };

  // --- Data Processing for History ---
  const processedData = useMemo(() => {
    const grouped = {}; // { year: { month: { items: [], summary: { income: 0, expenses: 0 } }, yearSummary: { income: 0, expenses: 0 } } }

    // Sort items by date first (important for consistent display)
    const sortedItems = [...items].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    sortedItems.forEach(item => {
      // --- START Check for valid date ---
      if (!item.fecha || typeof item.fecha !== 'string') {
          console.warn("Skipping item due to missing or invalid fecha:", item);
          return; // Skip this item
      }
      // --- END Check ---

      // Date parsing needs to handle YYYY-MM-DD format correctly
      const dateParts = item.fecha.split('-'); // [YYYY, MM, DD]
      if (dateParts.length !== 3) {
          console.warn("Invalid date format found:", item.fecha, item);
          return; // Skip items with invalid dates
      }
      // Create Date object correctly for UTC to avoid timezone issues with month/year extraction
      // We only care about year/month/day as entered, treat as local time parts.
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in JS Date

      if (isNaN(year) || isNaN(month)) {
           console.warn("Invalid date components after parsing:", item.fecha, item);
           return; // Skip invalid dates
      }

      // Initialize year structure if it doesn't exist
      if (!grouped[year]) {
        grouped[year] = { months: {}, yearSummary: { income: 0, expenses: 0, balance: 0 } };
      }
      // Initialize month structure if it doesn't exist
      if (!grouped[year].months[month]) {
        grouped[year].months[month] = { items: [], summary: { income: 0, expenses: 0, balance: 0 } };
      }

      // Add item to the correct month
      grouped[year].months[month].items.push(item);

      // Update summaries
      const amount = item.cantidad; // Already parsed in handleSubmit
      if (item.tipo.includes("Ingreso")) {
        grouped[year].months[month].summary.income += amount;
        grouped[year].yearSummary.income += amount;
      } else if (item.tipo.includes("Gasto")) {
        grouped[year].months[month].summary.expenses += amount;
        grouped[year].yearSummary.expenses += amount;
      }
    });

    // Calculate balances
    Object.values(grouped).forEach(yearData => {
      Object.values(yearData.months).forEach(monthData => {
        monthData.summary.balance = monthData.summary.income - monthData.summary.expenses;
      });
      yearData.yearSummary.balance = yearData.yearSummary.income - yearData.yearSummary.expenses;
    });

    return grouped;
  }, [items]); // Recalculate only when items change

  const sortedYears = Object.keys(processedData).sort((a, b) => parseInt(a) - parseInt(b));
  // --- End Data Processing ---

  return (
    <div>
      <h2>Registrar Gasto/Ingreso</h2>
      {/* Form remains the same */}
      <form onSubmit={handleSubmit}>
         {/* ... form inputs ... */}
        <select name="tipo" value={form.tipo} onChange={handleChange}>
          <option value="Gasto">Gasto</option>
          <option value="Ingreso">Ingreso</option>
          <option value="Gasto Fijo">Gasto Fijo</option>
          <option value="Ingreso Fijo">Ingreso Fijo</option>
        </select>
        <input
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Descripción"
          required
        />
        <input
          type="number"
          name="cantidad"
          value={form.cantidad}
          onChange={handleChange}
          placeholder="Cantidad"
          step="0.01" 
          required
        />
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
        />
        <button type="submit">Agregar</button>
      </form>

      <h2>Historial</h2>
      {sortedYears.length === 0 ? (
        <p>No hay registros todavía.</p>
      ) : (
        sortedYears.map(year => {
          const yearData = processedData[year];
          const sortedMonths = Object.keys(yearData.months).sort((a, b) => parseInt(a) - parseInt(b));

          return (
            <div key={year} style={{ marginBottom: '2em' }}>
              <h3>Año: {year}</h3>
              {sortedMonths.map(monthIndex => {
                const monthData = yearData.months[monthIndex];
                const monthName = getMonthName(parseInt(monthIndex)); 
                return (
                  <div key={monthIndex} style={{ marginLeft: '1em', marginBottom: '1.5em' }}>
                    <h4>{monthName}</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Descripción</th>
                          <th>Cantidad</th>
                          <th>Fecha</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthData.items.map(item => (
                          <tr key={item.id}>
                            <td>{item.tipo}</td>
                            <td>{item.descripcion}</td>
                            <td>{item.cantidad.toFixed(2)}</td>
                            {/* Display only day for items within the month table */}
                            <td>{item.fecha.split('-')[2]}</td> 
                            <td>
                              <button onClick={() => deleteItem(item.id)} style={{ /* Add some basic styling if needed */ }}>
                                Eliminar
                              </button>
                            </td> 
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: '0.5em', fontWeight: 'bold' }}>
                       Resumen {monthName}: 
                       Ingresos: {monthData.summary.income.toFixed(2)} | 
                       Gastos: {monthData.summary.expenses.toFixed(2)} | 
                       Balance: {monthData.summary.balance.toFixed(2)}
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '1em', fontWeight: 'bold', borderTop: '1px solid #ccc', paddingTop: '0.5em' }}>
                 Resumen Anual {year}: 
                 Ingresos: {yearData.yearSummary.income.toFixed(2)} | 
                 Gastos: {yearData.yearSummary.expenses.toFixed(2)} | 
                 Balance: {yearData.yearSummary.balance.toFixed(2)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Gastos;
