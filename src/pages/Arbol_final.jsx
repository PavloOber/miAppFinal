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
    
    // Imprimir información detallada de cada familiar
    familiares.forEach(familiar => {
      console.log(`Familiar: ${familiar.nombre} ${familiar.apellido} (ID: ${familiar.id})`);
      console.log(`  - Género: ${familiar.genero}`);
      console.log(`  - Cónyuge ID: ${familiar.conyugeId}`);
      console.log(`  - Hijos IDs: ${JSON.stringify(familiar.hijosIds)}`);
      console.log(`  - Padres IDs: ${JSON.stringify(familiar.padresIds)}`);
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
      // Si es una conexión a una pareja
      else if (!link.source.data.type && link.target.data.type === "pareja") {
        // No hacemos nada, estas conexiones se manejan con las personalizadas
      }
    });
    
    // Conexiones personalizadas (de padre/madre a hijo/hija en una pareja)
    root.descendants().forEach(node => {
      if (node.data.type === "pareja" && node.data.parentLinks) {
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
        padresIds: familiar.padresIds || [],
        hijosIds: familiar.hijosIds || [],
        conyugeId: familiar.conyugeId,
        children: []
      });
    });

    // Identificar a Pavlo y Daryna por sus IDs exactos (según los logs)
    const pavloId = 1747122709799;
    const darynaId = 1747119596211;
    const valentinId = 1747216481893;
    const tatianaId = 1747301231734;
    
    console.log("IDs identificados:", {
      pavloId,
      darynaId,
      valentinId,
      tatianaId
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
            // Asegurarse de que el hombre esté a la izquierda y la mujer a la derecha
            let miembro1, miembro2;
            
            if (familiar.genero === 'hombre') {
              miembro1 = familiaresMap.get(familiar.id);
              miembro2 = familiaresMap.get(conyuge.id);
            } else {
              miembro1 = familiaresMap.get(conyuge.id);
              miembro2 = familiaresMap.get(familiar.id);
            }
            
            const pareja = {
              id: parejaId,
              type: "pareja",
              nombre: `${miembro1.nombre} y ${miembro2.nombre}`,
              miembros: [miembro1, miembro2],
              children: [],
              parentLinks: []
            };
            
            parejasMap.set(parejaId, pareja);
            personaAParejaMap.set(familiar.id, parejaId);
            personaAParejaMap.set(conyuge.id, parejaId);
            
            console.log(`Creada pareja: ${pareja.nombre} (ID: ${parejaId})`);
          }
        }
      }
    });

    // Obtener la pareja de Pavlo y Daryna
    const pavloDarynaId = `pareja_${Math.min(pavloId, darynaId)}_${Math.max(pavloId, darynaId)}`;
    const pavloDarynaPareja = parejasMap.get(pavloDarynaId);
    
    if (pavloDarynaPareja) {
      console.log("Pareja de Pavlo y Daryna encontrada:", pavloDarynaPareja);
    } else {
      console.log("No se encontró la pareja de Pavlo y Daryna");
    }

    // Raíces del árbol (nodos sin padres)
    const roots = [];

    // Procesar relaciones padre-hijo para parejas
    familiares.forEach(familiar => {
      if (familiar.hijosIds && familiar.hijosIds.length > 0) {
        // Si este familiar está en una pareja, procesar los hijos desde la pareja
        if (familiar.conyugeId && personaAParejaMap.has(familiar.id)) {
          const parejaId = personaAParejaMap.get(familiar.id);
          const pareja = parejasMap.get(parejaId);
          
          // Procesar cada hijo
          familiar.hijosIds.forEach(hijoId => {
            if (hijoId && familiaresMap.has(hijoId)) {
              const hijoNode = familiaresMap.get(hijoId);
              
              // Verificar si ya procesamos esta relación
              const relacion = `${parejaId}_${hijoId}`;
              if (!processedChildren.has(relacion)) {
                pareja.children.push(hijoNode);
                processedChildren.add(relacion);
                console.log(`Añadido hijo ${hijoNode.nombre} a la pareja ${pareja.nombre}`);
                
                // Si el hijo estaba en roots, lo quitamos porque ahora tiene padres
                const hijoIndex = roots.findIndex(r => r.id === hijoId);
                if (hijoIndex !== -1) {
                  roots.splice(hijoIndex, 1);
                }
              }
            }
          });
        }
        // Si este familiar no está en una pareja, procesar los hijos directamente
        else if (!familiar.conyugeId) {
          familiar.hijosIds.forEach(hijoId => {
            if (hijoId && familiaresMap.has(hijoId)) {
              const hijoNode = familiaresMap.get(hijoId);
              const familiarNode = familiaresMap.get(familiar.id);
              
              // Añadir el hijo al familiar
              if (!familiarNode.children.some(c => c.id === hijoId)) {
                familiarNode.children.push(hijoNode);
                console.log(`Añadido hijo ${hijoNode.nombre} a ${familiar.nombre}`);
                
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
    });

    // Procesar conexiones especiales de Valentin a Pavlo y Tatiana a Daryna
    if (pavloDarynaPareja) {
      // Conexión de Valentin a Pavlo
      if (familiaresMap.has(valentinId)) {
        pavloDarynaPareja.parentLinks.push({
          parentId: valentinId,
          isFirstMember: true  // Pavlo siempre es el primer miembro (izquierda)
        });
        
        console.log("Conexión especial: Valentin es padre de Pavlo en la pareja");
      }
      
      // Conexión de Tatiana a Daryna
      if (familiaresMap.has(tatianaId)) {
        pavloDarynaPareja.parentLinks.push({
          parentId: tatianaId,
          isFirstMember: false  // Daryna siempre es el segundo miembro (derecha)
        });
        
        console.log("Conexión especial: Tatiana es madre de Daryna en la pareja");
      }
      
      // Añadir la pareja como raíz principal
      roots.push(pavloDarynaPareja);
      console.log("Añadida pareja Pavlo y Daryna como raíz principal");
      
      // Añadir a Valentin y Tatiana como raíces
      if (familiaresMap.has(valentinId)) {
        const valentinNode = familiaresMap.get(valentinId);
        roots.push(valentinNode);
        console.log("Añadido Valentin como raíz");
      }
      
      if (familiaresMap.has(tatianaId)) {
        const tatianaNode = familiaresMap.get(tatianaId);
        roots.push(tatianaNode);
        console.log("Añadida Tatiana como raíz");
      }
    } else {
      // Si no encontramos la pareja, añadir a todos como raíces individuales
      
      // Añadir a Pavlo como raíz si existe
      if (familiaresMap.has(pavloId)) {
        const pavloNode = familiaresMap.get(pavloId);
        roots.push(pavloNode);
        console.log("Añadido Pavlo como raíz individual (no se encontró pareja)");
      }
      
      // Añadir a Daryna como raíz si existe
      if (familiaresMap.has(darynaId)) {
        const darynaNode = familiaresMap.get(darynaId);
        roots.push(darynaNode);
        console.log("Añadida Daryna como raíz individual (no se encontró pareja)");
      }
      
      // Añadir a Valentin como raíz si existe
      if (familiaresMap.has(valentinId)) {
        const valentinNode = familiaresMap.get(valentinId);
        roots.push(valentinNode);
        console.log("Añadido Valentin como raíz individual");
      }
      
      // Añadir a Tatiana como raíz si existe
      if (familiaresMap.has(tatianaId)) {
        const tatianaNode = familiaresMap.get(tatianaId);
        roots.push(tatianaNode);
        console.log("Añadida Tatiana como raíz individual");
      }
    }

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
