import { useFamilia } from "../context/familiaContext";
import * as d3 from "d3";
import "../styles/Arbol.css";
import { useRef, useEffect } from "react";

// Símbolos Unicode
const HEART_SYMBOL = "\u2764"; // Símbolo de corazón Unicode
const MALE_SYMBOL = "\u2642"; // Símbolo masculino Unicode
const FEMALE_SYMBOL = "\u2640"; // Símbolo femenino Unicode

const Arbol = () => {
  const { familiares } = useFamilia();
  const svgRef = useRef(null);

  useEffect(() => {
    if (!familiares.length) return;

    // Limpiar el SVG antes de dibujar
    d3.select(svgRef.current).selectAll("*").remove();

    // Imprimir los datos de los familiares para depuración
    console.log("Datos de familiares:", familiares);
    
    // Verificar las relaciones de hijos
    familiares.forEach(f => {
      console.log(`${f.nombre} ${f.apellido} (ID: ${f.id}):`); 
      console.log("  - hijosIds:", f.hijosIds);
      console.log("  - padresIds:", f.padresIds);
      console.log("  - conyugeId:", f.conyugeId);
    });

    // Crear datos para el árbol
    const treeData = createFamilyTreeData(familiares);
    console.log("Datos del árbol:", treeData);

    // Configurar el árbol
    const width = 1000;
    const height = 800;
    const margin = { top: 40, right: 90, bottom: 50, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Crear el contenedor SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Crear el layout del árbol
    const treeLayout = d3.tree()
      .size([innerWidth, innerHeight])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2));

    // Crear la jerarquía del árbol
    const root = d3.hierarchy(treeData);
    
    // Asignar posiciones a cada nodo
    treeLayout(root);

    // Crear enlaces personalizados para conexiones específicas
    const customLinks = [];
    
    // Recopilar conexiones personalizadas
    root.descendants().forEach(node => {
      if (node.data.customLinks) {
        node.data.customLinks.forEach(link => {
          // Encontrar el nodo destino por ID
          const targetNode = root.descendants().find(n => n.data.id === link.targetId);
          if (targetNode) {
            customLinks.push({
              source: node,
              target: targetNode,
              offsetX: link.offsetX || 0,
              offsetY: link.offsetY || 0
            });
          }
        });
      }
    });

    // Crear enlaces normales entre nodos
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y));
    
    // Crear enlaces personalizados
    svg.selectAll(".custom-link")
      .data(customLinks)
      .enter()
      .append("path")
      .attr("class", "link custom-link")
      .attr("d", link => {
        const sourceX = link.source.x + link.offsetX;
        const sourceY = link.source.y + link.offsetY;
        const targetX = link.target.x;
        const targetY = link.target.y;
        
        // Crear una curva suave entre los puntos
        return `M${sourceX},${sourceY}
                C${sourceX},${(sourceY + targetY) / 2}
                 ${targetX},${(sourceY + targetY) / 2}
                 ${targetX},${targetY}`;
      });

    // Crear nodos
    const nodes = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => {
        let classes = "node";
        if (d.data.type === "pareja") {
          classes += " node-pareja";
        } else if (d.data.genero === "hombre") {
          classes += " node-hombre";
        } else if (d.data.genero === "mujer") {
          classes += " node-mujer";
        }
        return classes;
      })
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Dibujar círculos para los nodos
    nodes.append("circle")
      .attr("r", 30);

    // Añadir nombres a los nodos
    nodes.each(function(d) {
      const node = d3.select(this);
      
      if (d.data.type === "pareja") {
        // Es una pareja
        const miembro1 = d.data.miembros[0];
        const miembro2 = d.data.miembros[1];
        
        // Nombre del primer miembro
        node.append("text")
          .attr("dy", -10)
          .attr("x", -30)
          .attr("text-anchor", "middle")
          .attr("class", "nombre-text")
          .text(miembro1.nombre);
        
        // Apellido del primer miembro
        node.append("text")
          .attr("dy", 5)
          .attr("x", -30)
          .attr("text-anchor", "middle")
          .attr("class", "apellido-text")
          .text(miembro1.apellido);
        
        // Símbolo de género para el primer miembro
        if (miembro1.genero === 'hombre' || miembro1.genero === 'mujer') {
          node.append("text")
            .attr("dy", miembro1.genero === 'mujer' ? 10 : 9) // Ajuste para el símbolo femenino con nuevo tamaño
            .attr("dx", -30)
            .attr("text-anchor", "middle")
            .attr("class", "gender-icon")
            // No establecemos font-size aquí, lo hacemos en CSS
            .text(miembro1.genero === 'hombre' ? MALE_SYMBOL : FEMALE_SYMBOL);
        }
        
        // Corazón en el centro
        node.append("text")
          .attr("dy", 0)
          .attr("x", 0)
          .attr("text-anchor", "middle")
          .attr("class", "heart-icon")
          .text(HEART_SYMBOL);
        
        // Nombre del segundo miembro
        node.append("text")
          .attr("dy", -10)
          .attr("x", 30)
          .attr("text-anchor", "middle")
          .attr("class", "nombre-text")
          .text(miembro2.nombre);
        
        // Apellido del segundo miembro
        node.append("text")
          .attr("dy", 5)
          .attr("x", 30)
          .attr("text-anchor", "middle")
          .attr("class", "apellido-text")
          .text(miembro2.apellido);
        
        // Símbolo de género para el segundo miembro
        if (miembro2.genero === 'hombre' || miembro2.genero === 'mujer') {
          node.append("text")
            .attr("dy", miembro2.genero === 'mujer' ? 10 : 9) // Ajuste para el símbolo femenino con nuevo tamaño
            .attr("dx", 30)
            .attr("text-anchor", "middle")
            .attr("class", "gender-icon")
            // No establecemos font-size aquí, lo hacemos en CSS
            .text(miembro2.genero === 'hombre' ? MALE_SYMBOL : FEMALE_SYMBOL);
        }
      } else {
        // Es una persona individual
        // Nombre
        node.append("text")
          .attr("dy", -10)
          .attr("x", 0)
          .attr("text-anchor", "middle")
          .attr("class", "nombre-text")
          .text(d.data.nombre);
        
        // Apellido
        node.append("text")
          .attr("dy", 5)
          .attr("x", 0)
          .attr("text-anchor", "middle")
          .attr("class", "apellido-text")
          .text(d.data.apellido);
        
        // Añadir símbolo de género
        if (d.data.genero === 'hombre' || d.data.genero === 'mujer') {
          node.append("text")
            .attr("dy", d.data.genero === 'mujer' ? 10 : 9) // Ajuste para el símbolo femenino con nuevo tamaño
            .attr("dx", 0)
            .attr("text-anchor", "middle")
            .attr("class", "gender-icon")
            // No establecemos font-size aquí, lo hacemos en CSS
            .text(d.data.genero === 'hombre' ? MALE_SYMBOL : FEMALE_SYMBOL);
        }
      }
    });
  }, [familiares]);

  // Función para crear los datos del árbol
  const createFamilyTreeData = (familiares) => {
    if (!familiares || familiares.length === 0) {
      return { nombre: "No hay datos", children: [] };
    }

    // Mapas para facilitar el acceso a los datos
    const familiaresMap = new Map();
    const parejasMap = new Map();
    const personaAParejaMap = new Map();
    const processedChildren = new Set();
    const customLinks = [];

    // Crear nodos para cada familiar
    familiares.forEach(familiar => {
      // Crear un nodo para cada familiar
      familiaresMap.set(familiar.id, {
        id: familiar.id,
        nombre: familiar.nombre,
        apellido: familiar.apellido,
        genero: familiar.genero,
        padresIds: familiar.padresIds,
        hijosIds: familiar.hijosIds,
        conyugeId: familiar.conyugeId,
        children: []
      });
    });

    // Crear nodos para parejas
    familiares.forEach(familiar => {
      if (familiar.conyugeId && familiaresMap.has(familiar.conyugeId)) {
        const conyuge = familiares.find(f => f.id === familiar.conyugeId);
        if (conyuge) {
          // Crear un ID único para la pareja (usando los IDs ordenados para evitar duplicados)
          const parejaId = `pareja_${Math.min(familiar.id, conyuge.id)}_${Math.max(familiar.id, conyuge.id)}`;
          
          // Solo crear la pareja si no existe ya
          if (!parejasMap.has(parejaId)) {
            const miembro1 = familiaresMap.get(familiar.id);
            const miembro2 = familiaresMap.get(conyuge.id);
            
            const pareja = {
              id: parejaId,
              type: "pareja",
              nombre: `${familiar.nombre} y ${conyuge.nombre}`,
              miembros: [miembro1, miembro2],
              children: [],
              customLinks: []
            };
            
            parejasMap.set(parejaId, pareja);
            personaAParejaMap.set(familiar.id, parejaId);
            personaAParejaMap.set(conyuge.id, parejaId);
            
            console.log(`Creada pareja: ${pareja.nombre} (ID: ${parejaId})`);
          }
        }
      }
    });

    // Raíces del árbol (nodos sin padres)
    const roots = [];

    // Procesar relaciones padre-hijo para parejas
    familiares.forEach(familiar => {
      if (familiar.conyugeId && familiaresMap.has(familiar.conyugeId)) {
        const conyugeId = familiar.conyugeId;
        const parejaId = `pareja_${Math.min(familiar.id, conyugeId)}_${Math.max(familiar.id, conyugeId)}`;
        
        if (parejasMap.has(parejaId)) {
          const pareja = parejasMap.get(parejaId);
          
          // Procesar hijos de la pareja
          if (familiar.hijosIds) {
            const hijosArray = Array.isArray(familiar.hijosIds) ? familiar.hijosIds : [familiar.hijosIds];
            
            hijosArray.forEach(hijoId => {
              if (hijoId !== null && hijoId !== undefined && familiaresMap.has(hijoId)) {
                const hijoNode = familiaresMap.get(hijoId);
                
                // Verificar si ya procesamos esta relación
                const relacion = `${parejaId}_${hijoId}`;
                if (!processedChildren.has(relacion)) {
                  pareja.children.push(hijoNode);
                  processedChildren.add(relacion);
                  console.log(`- Añadido hijo ${hijoNode.nombre} a la pareja ${pareja.nombre}`);
                  
                  // Si el hijo estaba en roots, lo quitamos porque ahora tiene padres
                  const hijoIndex = roots.findIndex(r => r.id === hijoId);
                  if (hijoIndex !== -1) {
                    console.log(`- Quitando ${hijoNode.nombre} de raíces porque tiene padres (pareja)`);
                    roots.splice(hijoIndex, 1);
                  }
                }
              }
            });
          }
          
          // Añadir la pareja a raíces si no tiene padres asignados explícitamente
          if (!roots.some(r => r.id === parejaId)) {
            roots.push(pareja);
            console.log(`- Añadida pareja ${pareja.nombre} como raíz`);
          }
        }
      }
    });

    // Procesar conexiones específicas de padres a hijos en parejas
    familiares.forEach(familiar => {
      // Si este familiar tiene hijos que están en una pareja
      if (familiar.hijosIds) {
        const hijosArray = Array.isArray(familiar.hijosIds) ? familiar.hijosIds : [familiar.hijosIds];
        
        hijosArray.forEach(hijoId => {
          if (hijoId !== null && hijoId !== undefined) {
            // Si el hijo está en una pareja
            if (personaAParejaMap.has(hijoId)) {
              const parejaId = personaAParejaMap.get(hijoId);
              const pareja = parejasMap.get(parejaId);
              
              // Verificar si el hijo es Pavlo (o cualquier otro miembro específico)
              // Aquí asumimos que Pavlo tiene ID 1, ajusta según tus datos reales
              const esPavlo = hijoId === 1; // Ajusta este ID según tus datos
              const esDaryna = hijoId === 2; // Ajusta este ID según tus datos
              
              if (esPavlo && familiar.nombre === "Valentin") {
                // Crear una conexión personalizada desde Valentin a Pavlo en la pareja
                const familiarNode = familiaresMap.get(familiar.id);
                
                // Añadir una conexión personalizada
                if (!familiarNode.customLinks) {
                  familiarNode.customLinks = [];
                }
                
                familiarNode.customLinks.push({
                  targetId: parejaId,
                  offsetX: -30, // Desplazamiento hacia la izquierda (donde está Pavlo)
                  offsetY: 0
                });
                
                console.log(`- Creada conexión personalizada de ${familiar.nombre} a Pavlo en la pareja`);
                
                // Quitar la pareja de las raíces si estaba allí
                const parejaIndex = roots.findIndex(r => r.id === parejaId);
                if (parejaIndex !== -1) {
                  console.log(`- Quitando pareja ${pareja.nombre} de raíces porque tiene conexión personalizada`);
                  roots.splice(parejaIndex, 1);
                }
                
                // Añadir a Valentin como raíz si no está ya
                if (!roots.some(r => r.id === familiar.id)) {
                  roots.push(familiarNode);
                  console.log(`- Añadido ${familiar.nombre} como raíz para conexión personalizada`);
                }
              }
              
              if (esDaryna && familiar.nombre === "Tatiana") {
                // Crear una conexión personalizada desde Tatiana a Daryna en la pareja
                const familiarNode = familiaresMap.get(familiar.id);
                
                // Añadir una conexión personalizada
                if (!familiarNode.customLinks) {
                  familiarNode.customLinks = [];
                }
                
                familiarNode.customLinks.push({
                  targetId: parejaId,
                  offsetX: 30, // Desplazamiento hacia la derecha (donde está Daryna)
                  offsetY: 0
                });
                
                console.log(`- Creada conexión personalizada de ${familiar.nombre} a Daryna en la pareja`);
                
                // Añadir a Tatiana como raíz si no está ya
                if (!roots.some(r => r.id === familiar.id)) {
                  roots.push(familiarNode);
                  console.log(`- Añadido ${familiar.nombre} como raíz para conexión personalizada`);
                }
              }
            }
          }
        });
      }
    });

    // Añadir personas individuales que no tienen padres ni cónyuges
    familiares.forEach(familiar => {
      const familiarNode = familiaresMap.get(familiar.id);
      const tienePadres = familiar.padresIds && familiar.padresIds.some(id => id !== null && id !== undefined);
      const tieneConyugue = familiar.conyugeId !== null && familiar.conyugeId !== undefined;
      
      // Si no tiene padres y no está en una pareja, añadirlo como raíz
      if (!tienePadres && !tieneConyugue && !roots.some(r => r.id === familiar.id)) {
        roots.push(familiarNode);
        console.log(`- Añadida persona individual ${familiar.nombre} como raíz`);
      }
    });

    // Si hay múltiples raíces, crear un nodo raíz artificial
    if (roots.length > 1) {
      return {
        nombre: "Familia",
        id: "root",
        children: roots
      };
    } else if (roots.length === 1) {
      return roots[0];
    } else {
      // Si no hay raíces (caso raro), devolver un nodo vacío
      return {
        nombre: "No hay datos",
        children: []
      };
    }
  };

  return (
    <div className="arbol-container">
      <h2 className="text-2xl font-bold mb-4">Árbol Genealógico</h2>
      <div className="arbol-svg-container">
        <svg ref={svgRef} className="arbol-svg"></svg>
      </div>
    </div>
  );
};

export default Arbol;
