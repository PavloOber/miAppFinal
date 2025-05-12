import { useState, useEffect, createContext, useContext } from 'react';

// Key for localStorage
const GASTOS_STORAGE_KEY = 'gastosItems';

// Create the context
export const GastosContext = createContext(null);

// Create the provider component
export const GastosProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Load items from localStorage on initial render
  useEffect(() => {
    const storedItems = localStorage.getItem(GASTOS_STORAGE_KEY);
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch (error) {
        console.error("Error parsing gastos items from localStorage", error);
        setItems([]); // Reset if parsing fails
        localStorage.removeItem(GASTOS_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to add a new item (received from form) and save to localStorage
  const addItem = (newItemFromForm) => {
    // newItemFromForm already contains: id, tipo, descripcion, cantidad, fecha
    setItems((prevItems) => {
      let itemsToAdd = [newItemFromForm]; // Start with the original item

      // Check if it's a fixed item to generate recurring entries
      if (newItemFromForm.tipo === "Gasto Fijo" || newItemFromForm.tipo === "Ingreso Fijo") {
        try {
          const originalDateStr = newItemFromForm.fecha;
          const [year, monthStr, dayStr] = originalDateStr.split('-').map(Number);
          const originalMonthIndex = monthStr - 1; // 0-11 for Date object
          const originalDay = dayStr;

          // Generate for subsequent months in the same year
          for (let monthIndex = originalMonthIndex + 1; monthIndex < 12; monthIndex++) {
            // Calculate the day for the target month, handling shorter months
            const daysInTargetMonth = new Date(year, monthIndex + 1, 0).getDate();
            const targetDay = Math.min(originalDay, daysInTargetMonth);

            // Format the date string YYYY-MM-DD (ensure month/day have leading zeros)
            const targetMonthStr = String(monthIndex + 1).padStart(2, '0');
            const targetDayStr = String(targetDay).padStart(2, '0');
            const recurringDateStr = `${year}-${targetMonthStr}-${targetDayStr}`;

            // Create a copy with a unique ID and the new date
            const recurringItem = {
              ...newItemFromForm,
              fecha: recurringDateStr,
              id: `${newItemFromForm.id}-M${monthIndex + 1}` // Simple unique ID based on month
              // Optionally add a flag: isRecurring: true
            };
            itemsToAdd.push(recurringItem);
          }
        } catch (error) {
          console.error("Error generating recurring items:", error, newItemFromForm);
          // Fallback to only adding the original item if generation fails
          itemsToAdd = [newItemFromForm]; 
        }
      }

      // Update state and localStorage with all items to add (original + recurring)
      const updatedItems = [...prevItems, ...itemsToAdd];
      // Save updated items to localStorage
      try {
        localStorage.setItem(GASTOS_STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (error) {
        console.error("Error saving items to localStorage after add", error);
      }
      return updatedItems;
    });
  };

  // Function to delete a specific item by its id
  const deleteItem = (idToDelete) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.filter(item => item.id !== idToDelete);
      // Save updated items to localStorage
      try {
        localStorage.setItem(GASTOS_STORAGE_KEY, JSON.stringify(updatedItems));
      } catch (error) {
        console.error("Error saving updated gastos items to localStorage after delete", error);
      }
      return updatedItems;
    });
  };

  /* // Function to clear all items from state and localStorage - Removed for now
  const clearItems = () => {
    setItems([]); // Clear state
    try {
      localStorage.removeItem(GASTOS_STORAGE_KEY); // Clear localStorage
    } catch (error) {
      console.error("Error removing gastos items from localStorage", error);
    }
  }; 
  */

  // Value provided by the context
  const contextValue = {
    items,
    addItem,
    deleteItem, // Expose the new delete function
  };

  return (
    <GastosContext.Provider value={contextValue}>
      {children}
    </GastosContext.Provider>
  );
};

// Optional: Custom hook for easier context consumption
export const useGastos = () => {
  const context = useContext(GastosContext);
  if (!context) {
    throw new Error('useGastos must be used within a GastosProvider');
  }
  return context;
};
