import { useState } from "react";

const Gastos = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    tipo: "Gasto",
    descripcion: "",
    cantidad: 0,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setItems([...items, { ...form, cantidad: parseFloat(form.cantidad) }]);
    setForm({ tipo: "Gasto", descripcion: "", cantidad: 0 });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <select name="tipo" value={form.tipo} onChange={handleChange}>
          <option value="Gasto">Gasto</option>
          <option value="Ingreso">Ingreso</option>
        </select>
        <input
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Descripción"
        />
        <input
          type="number"
          name="cantidad"
          value={form.cantidad}
          onChange={handleChange}
        />
        <button type="submit">Agregar</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.tipo}</td>
              <td>{item.descripcion}</td>
              <td>{item.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Gastos;
