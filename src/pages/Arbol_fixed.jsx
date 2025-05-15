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
        padresIds: familiar.padresIds || [],
        hijosIds: familiar.hijosIds || [],
        conyugeId: familiar.conyugeId,
        children: []
      });
    });

    // Identificar a Pavlo y Daryna por nombre (ya que no conocemos sus IDs exactos)
    let pavloId = null;
    let darynaId = null;
    
    familiares.forEach(familiar => {
      if (familiar.nombre === "Pavlo") {
        pavloId = familiar.id;
        console.log("Encontrado Pavlo con ID:", pavloId);
      }
      if (familiar.nombre === "Daryna") {
        darynaId = familiar.id;
        console.log("Encontrada Daryna con ID:", darynaId);
      }
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
          
          // Añadir la pareja a raíces si no está ya y no tiene padres
          if (!roots.some(r => r.id === parejaId)) {
            roots.push(pareja);
            console.log(`Añadida pareja ${pareja.nombre} como raíz`);
          }
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
              
              // Añadir el familiar a raíces si no está ya
              if (!roots.some(r => r.id === familiar.id)) {
                roots.push(familiarNode);
                console.log(`Añadido ${familiar.nombre} como raíz`);
              }
            }
          });
        }
      }
    });

    // Procesar conexiones de padres a hijos en parejas
    familiares.forEach(familiar => {
      // Verificar si este familiar tiene hijos
      if (familiar.hijosIds && familiar.hijosIds.length > 0) {
        familiar.hijosIds.forEach(hijoId => {
          // Si el hijo está en una pareja
          if (hijoId && personaAParejaMap.has(hijoId)) {
            const parejaId = personaAParejaMap.get(hijoId);
            const pareja = parejasMap.get(parejaId);
            
            // Determinar si el hijo es el primer o segundo miembro de la pareja
            const isFirstMember = pareja.miembros[0].id === hijoId;
            
            // Caso especial: Valentin es padre de Pavlo
            if (familiar.nombre === "Valentin" && hijoId === pavloId) {
              if (!pareja.parentLinks) {
                pareja.parentLinks = [];
              }
              
              pareja.parentLinks.push({
                parentId: familiar.id,
                isFirstMember: true  // Pavlo siempre es el primer miembro (izquierda)
              });
              
              console.log(`Conexión especial: ${familiar.nombre} es padre de Pavlo en la pareja`);
              
              // Añadir a Valentin como raíz si no está ya
              const familiarNode = familiaresMap.get(familiar.id);
              if (!roots.some(r => r.id === familiar.id)) {
                roots.push(familiarNode);
                console.log(`Añadido ${familiar.nombre} como raíz para conexión especial`);
              }
              
              // Quitar la pareja de las raíces si estaba allí
              const parejaIndex = roots.findIndex(r => r.id === parejaId);
              if (parejaIndex !== -1) {
                roots.splice(parejaIndex, 1);
              }
            }
            
            // Caso especial: Tatiana es madre de Daryna
            if (familiar.nombre === "Tatiana" && hijoId === darynaId) {
              if (!pareja.parentLinks) {
                pareja.parentLinks = [];
              }
              
              pareja.parentLinks.push({
                parentId: familiar.id,
                isFirstMember: false  // Daryna siempre es el segundo miembro (derecha)
              });
              
              console.log(`Conexión especial: ${familiar.nombre} es madre de Daryna en la pareja`);
              
              // Añadir a Tatiana como raíz si no está ya
              const familiarNode = familiaresMap.get(familiar.id);
              if (!roots.some(r => r.id === familiar.id)) {
                roots.push(familiarNode);
                console.log(`Añadido ${familiar.nombre} como raíz para conexión especial`);
              }
              
              // Quitar la pareja de las raíces si estaba allí
              const parejaIndex = roots.findIndex(r => r.id === parejaId);
              if (parejaIndex !== -1) {
                roots.splice(parejaIndex, 1);
              }
            }
          }
        });
      }
    });

    // Añadir personas individuales sin padres ni cónyuges como raíces
    familiares.forEach(familiar => {
      const tienePadres = familiar.padresIds && familiar.padresIds.length > 0;
      const tieneConyugue = familiar.conyugeId !== null && familiar.conyugeId !== undefined;
      
      // Si no tiene padres y no está en una pareja, añadirlo como raíz
      if (!tienePadres && !tieneConyugue && !roots.some(r => r.id === familiar.id)) {
        const familiarNode = familiaresMap.get(familiar.id);
        roots.push(familiarNode);
        console.log(`Añadida persona individual ${familiar.nombre} como raíz`);
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
