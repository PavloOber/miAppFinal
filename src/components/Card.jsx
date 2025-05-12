export const Card = ({ title, children }) => (
  <div style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem" }}>
    <h2>{title}</h2>
    <div>{children}</div>
  </div>
);
