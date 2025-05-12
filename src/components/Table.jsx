export const Tabla = ({ datos }) => (
  <table border="1" cellPadding="8" style={{ width: "100%" }}>
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Monto</th>
        <th>Descripción</th>
      </tr>
    </thead>
    <tbody>
      {datos.map((item, index) => (
        <tr key={index}>
          <td>{item.tipo}</td>
          <td>{item.monto}</td>
          <td>{item.descripcion}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
