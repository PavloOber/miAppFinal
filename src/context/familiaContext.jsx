import { useState, useEffect, createContext, useContext } from 'react';

// Key for localStorage
const FAMILIARES_STORAGE_KEY = 'familiaresItems';

// Create the context
export const FamiliaContext = createContext(null);

// Create the provider component
export const FamiliaProvider = ({ children }) => {
  const [familiares, setFamiliares] = useState([]);

  // Load familiares from localStorage on initial render
  useEffect(() => {
    const storedFamiliares = localStorage.getItem(FAMILIARES_STORAGE_KEY);
    if (storedFamiliares) {
      try {
        // Ensure loaded data has the new fields, provide defaults if missing
        const parsedFamiliares = JSON.parse(storedFamiliares).map(f => ({
            ...f,
            apellido: f.apellido || '',
            // status: f.status || 'Hijo/a', // Removed status
            pais: f.pais || '',
            ciudad: f.ciudad || '',
            padresIds: f.padresIds || [],
            hijosIds: f.hijosIds || [],
            conyugeId: f.conyugeId || null, // Add conyugeId, default to null
            fotoBase64: f.fotoBase64 || null, // Add fotoBase64
        }));
        setFamiliares(parsedFamiliares);
      } catch (error) {
        console.error("Error parsing familiares items from localStorage", error);
        setFamiliares([]); // Reset if parsing fails
        localStorage.removeItem(FAMILIARES_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Helper function to get name by ID
  const getFamiliarNameById = (id) => {
    const familiar = familiares.find(f => f.id === id);
    return familiar ? `${familiar.nombre} ${familiar.apellido}` : `ID Desconocido: ${id}`;
  };

  // Function to add a new familiar and save to localStorage
  const addFamiliar = (nuevoFamiliarData) => {
    // Ensure new familiar has a unique ID (e.g., using timestamp)
    // And includes all fields, even if empty initially from formState
    const familiarConId = {
        id: Date.now(),
        nombre: nuevoFamiliarData.nombre || '',
        apellido: nuevoFamiliarData.apellido || '',
        fechaNacimiento: nuevoFamiliarData.fechaNacimiento || '',
        // status: nuevoFamiliarData.status || 'Hijo/a', // Removed status
        pais: nuevoFamiliarData.pais || '',
        ciudad: nuevoFamiliarData.ciudad || '',
        padresIds: nuevoFamiliarData.padresIds || [],
        hijosIds: nuevoFamiliarData.hijosIds || [],
        conyugeId: nuevoFamiliarData.conyugeId || null, // Add conyugeId
        fotoBase64: nuevoFamiliarData.fotoBase64 || null, // Add fotoBase64
     };
    
    setFamiliares((prevFamiliares) => {
      const updatedFamiliares = [...prevFamiliares, familiarConId];
      // Save updated familiares to localStorage
      try {
        localStorage.setItem(FAMILIARES_STORAGE_KEY, JSON.stringify(updatedFamiliares));
      } catch (error) {
        console.error("Error saving familiares items to localStorage", error);
      }
      return updatedFamiliares;
    });
  };

  // Function to update an existing familiar
  const updateFamiliar = (updatedFamiliarData) => {
    setFamiliares((prevFamiliares) => {
        const updatedFamiliares = prevFamiliares.map(f => 
            f.id === updatedFamiliarData.id ? { ...f, ...updatedFamiliarData } : f
        );
        try {
            localStorage.setItem(FAMILIARES_STORAGE_KEY, JSON.stringify(updatedFamiliares));
        } catch (error) {
            console.error("Error saving updated familiares items to localStorage after update", error);
        }
        return updatedFamiliares;
    });
  };
  
  // Function to delete a familiar by ID
  const deleteFamiliar = (idToDelete) => {
    // TODO: Consider updating relationships of others when deleting
    // For now, just remove the person.
    setFamiliares((prevFamiliares) => {
        const updatedFamiliares = prevFamiliares.filter(f => f.id !== idToDelete);
        try {
            localStorage.setItem(FAMILIARES_STORAGE_KEY, JSON.stringify(updatedFamiliares));
        } catch (error) {
            console.error("Error saving updated familiares items to localStorage after delete", error);
        }
        return updatedFamiliares;
    });
  };

  // Value provided by the context
  const contextValue = {
    familiares,
    addFamiliar,
    deleteFamiliar,
    updateFamiliar, // Provide update function
    getFamiliarNameById, // Provide the helper function
  };

  return (
    <FamiliaContext.Provider value={contextValue}>
      {children}
    </FamiliaContext.Provider>
  );
};

// Custom hook to use the FamiliaContext
export const useFamilia = () => {
    const context = useContext(FamiliaContext);
    if (!context) {
        throw new Error('useFamilia must be used within a FamiliaProvider');
    }
    return context;
};
