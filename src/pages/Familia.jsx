import { Card } from "../components/Card";

const familia = [
  {
    nombre: "Juan",
    edad: 30,
    parentesco: "Padre",
    enlacePadres: "Padres",
    enlaceHijos: "Hijos",
  },
  {
    nombre: "Maria",
    edad: 28,
    parentesco: "Madre",
    enlacePadres: "Padres",
    enlaceHijos: "Hijos",
  },
  {
    nombre: "Pedro",
    edad: 10,
    parentesco: "Hijo",
    enlacePadres: "Padres",
    enlaceHijos: "Hijos",
  },
  {
    nombre: "Ana",
    edad: 7,
    parentesco: "Hija",
    enlacePadres: "Padres",
    enlaceHijos: "Hijos",
  },
  {
    nombre: "Luis",
    edad: 5,
    parentesco: "Hijo",
    enlacePadres: "Padres",
    enlaceHijos: "Hijos",
  },
  {
    nombre: "Sofia",
    edad: 3,
    parentesco: "Hija",
    enlacePadres: "Padres",
    enlaceHijos: "Hijos",
  },
];

const Familia = () => (
  <div className="grid grid-cols-2 gap-4">
    {familia.map((miembro, index) => (
      <Card
        key={index}
        nombre={miembro.nombre}
        edad={miembro.edad}
        parentesco={miembro.parentesco}
        enlacePadres={miembro.enlacePadres}
        enlaceHijos={miembro.enlaceHijos}
      />
    ))}
  </div>
);
export default Familia;
