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

    // Recopilar todas las conexiones normales y personalizadas
    const allLinks = [];
    
    // Conexiones normales (de padre a hijo)
    root.links().forEach(link => {
      // Si el origen es una pareja y el destino es un hijo
      if (link.source.data.type === "pareja" && !link.target.data.type) {
        // La conexión sale del corazón (centro de la pareja)
        allLinks.push({
          source: { x: link.source.x, y: link.source.y },
          target: { x: link.target.x, y: link.target.y },
          class: "link"
        });
      } 
      // Si es una conexión normal (no de pareja a hijo)
      else if (!link.source.data.type && !link.target.data.type) {
        allLinks.push({
          source: { x: link.source.x, y: link.source.y },
          target: { x: link.target.x, y: link.target.y },
          class: "link"
        });
      }
    });
    
    // Conexiones personalizadas (de padre/madre a hijo/hija en una pareja)
    root.descendants().forEach(node => {
      if (node.data.parentLinks) {
        node.data.parentLinks.forEach(parentLink => {
          // Encontrar el nodo padre
          const parentNode = root.descendants().find(n => n.data.id === parentLink.parentId);
          if (parentNode) {
            // Determinar si el nodo actual es el miembro1 o miembro2 de la pareja
            const offsetX = parentLink.isFirstMember ? -30 : 30;
            
            allLinks.push({
              source: { x: parentNode.x, y: parentNode.y },
              target: { x: node.x + offsetX, y: node.y },
              class: "parent-link"
            });
          }
        });
      }
    });

    // Dibujar todas las conexiones
    svg.selectAll(".link-path")
      .data(allLinks)
      .enter()
      .append("path")
      .attr("class", d => d.class)
      .attr("d", d => {
        return d3.linkVertical()({
          source: [d.source.x, d.source.y],
          target: [d.target.x, d.target.y]
        });
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
            .attr("dy", miembro1.genero === 'mujer' ? 10 : 9)
            .attr("dx", -30)
            .attr("text-anchor", "middle")
            .attr("class", "gender-icon")
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
            .attr("dy", miembro2.genero === 'mujer' ? 10 : 9)
            .attr("dx", 30)
            .attr("text-anchor", "middle")
            .attr("class", "gender-icon")
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
            .attr("dy", d.data.genero === 'mujer' ? 10 : 9)
            .attr("dx", 0)
            .attr("text-anchor", "middle")
            .attr("class", "gender-icon")
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
              parentLinks: []
            };
            
            parejasMap.set(parejaId, pareja);
            personaAParejaMap.set(familiar.id, parejaId);
            personaAParejaMap.set(conyuge.id, parejaId);
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
                  
                  // Si el hijo estaba en roots, lo quitamos porque ahora tiene padres
                  const hijoIndex = roots.findIndex(r => r.id === hijoId);
                  if (hijoIndex !== -1) {
                    roots.splice(hijoIndex, 1);
                  }
                }
              }
            });
          }
        }
      }
    });

    // Procesar conexiones de padres a hijos en parejas
    familiares.forEach(familiar => {
      // Verificar si este familiar tiene padres
      if (familiar.padresIds && familiar.padresIds.length > 0) {
        // Verificar si este familiar está en una pareja
        if (personaAParejaMap.has(familiar.id)) {
          const parejaId = personaAParejaMap.get(familiar.id);
          const pareja = parejasMap.get(parejaId);
          
          // Determinar si es el primer o segundo miembro de la pareja
          const isFirstMember = pareja.miembros[0].id === familiar.id;
          
          // Procesar cada padre/madre
          familiar.padresIds.forEach(padreId => {
            if (padreId !== null && padreId !== undefined && familiaresMap.has(padreId)) {
              // Añadir una conexión personalizada desde el padre/madre al miembro correspondiente de la pareja
              if (!pareja.parentLinks) {
                pareja.parentLinks = [];
              }
              
              pareja.parentLinks.push({
                parentId: padreId,
                isFirstMember: isFirstMember
              });
              
              // Añadir el padre/madre como raíz si no está ya
              const familiarNode = familiaresMap.get(padreId);
              if (!roots.some(r => r.id === padreId)) {
                roots.push(familiarNode);
              }
            }
          });
        }
      }
    });

    // Añadir parejas sin padres como raíces
    parejasMap.forEach(pareja => {
      // Verificar si alguno de los miembros tiene padres
      const miembro1TienePadres = pareja.miembros[0].padresIds && pareja.miembros[0].padresIds.some(id => id !== null && id !== undefined);
      const miembro2TienePadres = pareja.miembros[1].padresIds && pareja.miembros[1].padresIds.some(id => id !== null && id !== undefined);
      
      // Si ninguno tiene padres, añadir la pareja como raíz
      if (!miembro1TienePadres && !miembro2TienePadres && !roots.some(r => r.id === pareja.id)) {
        roots.push(pareja);
      }
    });

    // Añadir personas individuales sin padres ni cónyuges como raíces
    familiares.forEach(familiar => {
      const tienePadres = familiar.padresIds && familiar.padresIds.some(id => id !== null && id !== undefined);
      const tieneConyugue = familiar.conyugeId !== null && familiar.conyugeId !== undefined;
      
      // Si no tiene padres y no está en una pareja, añadirlo como raíz
      if (!tienePadres && !tieneConyugue && !roots.some(r => r.id === familiar.id)) {
        const familiarNode = familiaresMap.get(familiar.id);
        roots.push(familiarNode);
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
