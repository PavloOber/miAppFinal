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

  // Función para crear los datos del árbol genealógico
  const createFamilyTreeData = (familiares) => {
    console.log("Procesando árbol con", familiares.length, "familiares");
    
    // Crear un mapa para acceder rápidamente a los familiares por ID
    const familiaresMap = new Map();
    
    // Conjunto para rastrear los IDs que ya han sido añadidos como hijos
    const addedAsChild = new Set();
    
    // Crear nodos para cada familiar
    familiares.forEach(familiar => {
      // Filtrar valores nulos en los arrays
      const hijosIds = familiar.hijosIds ? familiar.hijosIds.filter(id => id !== null) : [];
      const padresIds = familiar.padresIds ? familiar.padresIds.filter(id => id !== null) : [];
      
      const nodo = {
        id: familiar.id,
        nombre: familiar.nombre,
        apellido: familiar.apellido,
        genero: familiar.genero || "desconocido", // Valor por defecto si no hay género
        hijosIds: hijosIds,
        padresIds: padresIds,
        conyugeId: familiar.conyugeId,
        esPareja: false,
        parejaId: null,
        children: []
      };
      
      familiaresMap.set(familiar.id, nodo);
    });
    
    // Marcar nodos que son parte de una pareja (solo si se especifica conyugeId)
    familiares.forEach(familiar => {
      if (familiar.conyugeId && familiaresMap.has(familiar.conyugeId)) {
        const nodo = familiaresMap.get(familiar.id);
        const conyugeNodo = familiaresMap.get(familiar.conyugeId);
        
        // Marcar ambos como parte de una pareja
        nodo.esPareja = true;
        nodo.parejaId = familiar.conyugeId;
        conyugeNodo.esPareja = true;
        conyugeNodo.parejaId = familiar.id;
      }
    });
    
    // Procesar relaciones padre-hijo (asegurando que cada hijo aparezca solo una vez)
    // Primero, recopilamos todos los hijos y sus padres
    const hijosPadres = new Map(); // Map<hijoId, Array<padreId>>
    
    // Recopilar padres desde padresIds
    familiares.forEach(familiar => {
      const hijoId = familiar.id;
      
      if (familiar.padresIds && familiar.padresIds.length > 0) {
        if (!hijosPadres.has(hijoId)) {
          hijosPadres.set(hijoId, []);
        }
        
        familiar.padresIds.forEach(padreId => {
          if (padreId && familiaresMap.has(padreId)) {
            hijosPadres.get(hijoId).push(padreId);
          }
        });
      }
    });
    
    // Recopilar padres desde hijosIds
    familiares.forEach(familiar => {
      const padreId = familiar.id;
      
      if (familiar.hijosIds && familiar.hijosIds.length > 0) {
        familiar.hijosIds.forEach(hijoId => {
          if (hijoId && familiaresMap.has(hijoId)) {
            if (!hijosPadres.has(hijoId)) {
              hijosPadres.set(hijoId, []);
            }
            
            if (!hijosPadres.get(hijoId).includes(padreId)) {
              hijosPadres.get(hijoId).push(padreId);
            }
          }
        });
      }
    });
    
    // Ahora, para cada hijo, decidimos a qué padre asignarlo
    hijosPadres.forEach((padresIds, hijoId) => {
      if (padresIds.length > 0) {
        const hijoNode = familiaresMap.get(hijoId);
        
        // Si hay más de un padre, elegimos uno para evitar duplicados
        // Pero mantenemos la referencia a todos los padres para visualización
        hijoNode.todosLosPadres = padresIds;
        
        // Elegimos el primer padre para asignar el hijo
        const padreElegidoId = padresIds[0];
        const padreNode = familiaresMap.get(padreElegidoId);
        
        // Añadir el hijo al padre
        if (!padreNode.children.some(child => child.id === hijoId)) {
          padreNode.children.push(hijoNode);
          addedAsChild.add(hijoId);
        }
      }
    });
    
    // Encontrar las raíces (nodos que no son hijos de nadie)
    const roots = [];
    for (const [id, nodo] of familiaresMap.entries()) {
      if (!addedAsChild.has(id)) {
        roots.push(nodo);
      }
    }
    
    console.log(`Encontradas ${roots.length} raíces:`, roots.map(r => r.nombre).join(", "));
    
    // Si hay múltiples raíces, crear un nodo raíz artificial
    if (roots.length > 1) {
      const rootNode = {
        nombre: "Familia",
        id: "root",
        children: roots
      };
      return rootNode;
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

  useEffect(() => {
    if (!familiares.length) return;

    // Limpiar el SVG antes de dibujar
    d3.select(svgRef.current).selectAll("*").remove();

    // Crear datos para el árbol
    const treeData = createFamilyTreeData(familiares);
    console.log("Datos del árbol:", treeData);

    // Configurar el árbol
    const width = 1600; // Increased width
    const height = 1200; // Increased height
    const nodeSize = 70; // Slightly larger nodes
    
    // Identificar parejas y padres compartidos
    const parejas = new Map();
    const padresCompartidos = new Map();
    
    // Identificar parejas por cónyuges
    familiares.forEach(familiar => {
      if (familiar.conyugeId) {
        parejas.set(familiar.id, familiar.conyugeId);
        parejas.set(familiar.conyugeId, familiar.id);
      }
    });
    
    // Identificar padres que comparten hijos
    familiares.forEach(familiar => {
      if (familiar.hijosIds && familiar.hijosIds.length > 0) {
        familiar.hijosIds.forEach(hijoId => {
          if (!padresCompartidos.has(hijoId)) {
            padresCompartidos.set(hijoId, new Set());
          }
          padresCompartidos.get(hijoId).add(familiar.id);
        });
      }
    });
    
    // Crear el layout del árbol
    const treeLayout = d3.tree()
      .nodeSize([nodeSize * 2.5, nodeSize * 5])  // Even more vertical spacing
      .separation((a, b) => {
        // Si son pareja formal (con conyugeId), colocarlos muy cerca
        if (a.data.parejaId === b.data.id || b.data.parejaId === a.data.id) {
          return 1.1; // Muy cerca para parejas formales
        }
        
        // Asegurar que los hijos estén más abajo que sus padres
        if (a.parent && b.parent && a.parent === b.parent) {
          return 1.5;
        }
        
        // Nodos no relacionados
        return 2.5;
      });
    
    // Crear el SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, 50)`);
    
    // Crear la jerarquía de datos

    // Crear la jerarquía del árbol
    const root = d3.hierarchy(treeData);
    
    // Asignar posiciones a cada nodo
    treeLayout(root);
    
    // Crear un mapa de padres que comparten hijos
    const padresQueCompartenHijos = new Map();
    
    // Identificar padres que comparten hijos
    familiares.forEach(familiar => {
      if (familiar.hijosIds && familiar.hijosIds.length > 0) {
        familiar.hijosIds.forEach(hijoId => {
          if (!padresQueCompartenHijos.has(hijoId)) {
            padresQueCompartenHijos.set(hijoId, []);
          }
          padresQueCompartenHijos.get(hijoId).push(familiar.id);
        });
      }
    });
    
    // Crear pares de padres que comparten hijos
    const paresDePadres = [];
    padresQueCompartenHijos.forEach((padresIds) => {
      if (padresIds.length >= 2) {
        for (let i = 0; i < padresIds.length; i++) {
          for (let j = i + 1; j < padresIds.length; j++) {
            paresDePadres.push([padresIds[i], padresIds[j]]);
          }
        }
      }
    });
    
    // Ajustar posiciones para que las parejas y padres que comparten hijos estén más cerca
    const spousePairs = new Set(); // Para evitar procesar la misma pareja dos veces
    
    root.descendants().forEach(node => {
      // Primero, ajustar parejas formales (con conyugeId)
      if (node.data.parejaId && !spousePairs.has(node.data.id)) {
        const pareja = root.descendants().find(n => n.data.id === node.data.parejaId);
        
        if (pareja) {
          // Marcar ambos nodos como procesados
          spousePairs.add(node.data.id);
          spousePairs.add(pareja.data.id);
          
          // Asegurar que ambos nodos estén en el mismo nivel vertical
          node.y = pareja.y = Math.min(node.y, pareja.y);
          
          // Colocar parejas muy cerca, casi pegadas
          const horizontalSpacing = nodeSize * 0.5; // Reducir el espacio entre parejas
          
          // Decidir quién va a la izquierda basado en el ID para consistencia
          if (node.data.id < pareja.data.id) {
            node.x = node.x - horizontalSpacing;
            pareja.x = node.x + nodeSize * 1.2; // Un poco más separados que antes
          } else {
            pareja.x = pareja.x - horizontalSpacing;
            node.x = pareja.x + nodeSize * 1.2;
          }
        }
      }
      
      // Asegurar que los hijos estén más abajo que sus padres
      if (node.parent) {
        node.y = Math.max(node.y, node.parent.y + nodeSize * 4.5); // Increased vertical spacing
      }
    });

    // Crear enlaces entre padres e hijos
    svg.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y));

    // Crear enlaces adicionales para hijos con múltiples padres
    const linksAdicionales = [];
    
    // Recopilar todos los enlaces adicionales para hijos con múltiples padres
    root.descendants().forEach(node => {
      // Si el nodo tiene múltiples padres
      if (node.data.todosLosPadres && node.data.todosLosPadres.length > 1) {
        // Para cada padre adicional (excepto el primero que ya está conectado)
        for (let i = 1; i < node.data.todosLosPadres.length; i++) {
          const padreId = node.data.todosLosPadres[i];
          const padre = root.descendants().find(n => n.data.id === padreId);
          
          if (padre) {
            linksAdicionales.push({
              source: { x: padre.x, y: padre.y },
              target: { x: node.x, y: node.y }
            });
          }
        }
      }
    });
    
    // Añadir líneas adicionales para múltiples padres
    svg.append("g")
      .attr("class", "links-adicionales")
      .selectAll("path")
      .data(linksAdicionales)
      .enter().append("path")
      .attr("class", "link link-adicional")
      .attr("d", d => {
        const midY = (d.source.y + d.target.y) / 2;
        return `M${d.source.x},${d.source.y} C${d.source.x},${midY} ${d.target.x},${midY} ${d.target.x},${d.target.y}`;
      });

    // Crear enlaces entre parejas (líneas punteadas)
    const parejasLinks = [];
    
    // Recopilar todas las parejas
    root.descendants().forEach(node => {
      if (node.data.parejaId) {
        const pareja = root.descendants().find(n => n.data.id === node.data.parejaId);
        if (pareja && node.data.id < pareja.data.id) { // Evitar duplicados
          parejasLinks.push({
            source: { x: node.x, y: node.y },
            target: { x: pareja.x, y: pareja.y }
          });
        }
      }
    });
    
    // Añadir líneas punteadas entre parejas
    svg.append("g")
      .attr("class", "links-parejas")
      .selectAll("path")
      .data(parejasLinks)
      .enter().append("path")
      .attr("class", "link-pareja")
      .attr("d", d => {
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });
      
    // Añadir líneas entre padres que comparten hijos pero no son pareja formal
    const padresCompartidosLinks = [];
    
    // Recopilar enlaces entre padres que comparten hijos
    paresDePadres.forEach(([padre1Id, padre2Id]) => {
      const padre1Node = root.descendants().find(n => n.data.id === padre1Id);
      const padre2Node = root.descendants().find(n => n.data.id === padre2Id);
      
      // Si ambos padres existen y no son pareja formal
      if (padre1Node && padre2Node && 
          padre1Node.data.parejaId !== padre2Id) {
        
        padresCompartidosLinks.push({
          source: { x: padre1Node.x, y: padre1Node.y },
          target: { x: padre2Node.x, y: padre2Node.y }
        });
      }
    });
    
    // Añadir líneas entre padres que comparten hijos
    svg.append("g")
      .attr("class", "links-padres-compartidos")
      .selectAll("path")
      .data(padresCompartidosLinks)
      .enter().append("path")
      .attr("class", "link-padres-compartidos")
      .attr("d", d => {
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });
      
    // Añadir corazones entre parejas
    svg.selectAll(".heart")
      .data(parejasLinks)
      .enter()
      .append("text")
      .attr("class", "heart-symbol")
      .attr("x", d => (d.source.x + d.target.x) / 2)
      .attr("y", d => (d.source.y + d.target.y) / 2 - 10)
      .attr("text-anchor", "middle")
      .text(HEART_SYMBOL);

    // Crear grupos para los nodos
    const nodes = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => {
        let classes = "node";
        if (d.data.esPareja) classes += " node-pareja";
        if (d.data.genero === "hombre") classes += " node-hombre";
        if (d.data.genero === "mujer") classes += " node-mujer";
        if (d.data.genero === "desconocido" || !d.data.genero) classes += " node-desconocido";
        return classes;
      })
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Dibujar círculos para los nodos
    nodes.append("circle")
      .attr("r", 30);

    // Añadir nombres a los nodos
    nodes.append("text")
      .attr("dy", 50)
      .attr("text-anchor", "middle")
      .text(d => d.data.nombre);
      
    // Añadir símbolos de género si están definidos
    nodes.each(function(d) {
      if (d.data.genero === "hombre") {
        d3.select(this).append("text")
          .attr("class", "gender-symbol male")
          .attr("dy", -40)
          .attr("text-anchor", "middle")
          .text(MALE_SYMBOL);
      } else if (d.data.genero === "mujer") {
        d3.select(this).append("text")
          .attr("class", "gender-symbol female")
          .attr("dy", -40)
          .attr("text-anchor", "middle")
          .text(FEMALE_SYMBOL);
      } else {
        // Símbolo de interrogación para género desconocido
        d3.select(this).append("text")
          .attr("class", "gender-symbol unknown")
          .attr("dy", -40)
          .attr("text-anchor", "middle")
          .text("?");
      }
      
      // Añadir apellido debajo del nombre
      if (d.data.apellido) {
        d3.select(this).append("text")
          .attr("dy", 70)
          .attr("text-anchor", "middle")
          .attr("class", "apellido-text")
          .text(d.data.apellido);
      }
    });
  }, [familiares]);

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
