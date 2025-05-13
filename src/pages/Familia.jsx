import React, { useState, useEffect, useMemo } from "react";
import { useFamilia } from "../context/familiaContext";
import Image from 'react-bootstrap/Image'; // Add Image import

// Helper function to calculate age
const calculateAge = (birthDate) => {
  if (!birthDate) return "?";
  try {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age >= 0 ? age : "?";
  } catch (error) {
    console.error("Error calculating age:", error);
    return "?";
  }
};

const Familia = () => {
  const {
    familiares,
    addFamiliar,
    deleteFamiliar,
    updateFamiliar,
    getFamiliarNameById,
  } = useFamilia();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); // State to track the ID of the familiar being edited

  // Memoize initialFormState to prevent unnecessary useEffect runs
  const initialFormState = useMemo(
    () => ({
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      pais: "",
      ciudad: "",
      padresIds: [],
      hijosIds: [],
      conyugeId: null, // Add conyugeId, default to null
      fotoBase64: null, // Add photo field
    }),
    []
  ); // Empty dependency array means it's created only once

  const [formState, setFormState] = useState(initialFormState);

  // Effect to load data into form when editingId changes
  useEffect(() => {
    if (editingId !== null) {
      const familiarToEdit = familiares.find((f) => f.id === editingId);
      if (familiarToEdit) {
        // Ensure all fields exist, even if they were added later
        setFormState({
          ...initialFormState, // Start with defaults
          ...familiarToEdit,
          fechaNacimiento: familiarToEdit.fechaNacimiento
            ? familiarToEdit.fechaNacimiento.split("T")[0]
            : "",
          pais: familiarToEdit.pais || "",
          ciudad: familiarToEdit.ciudad || "",
          padresIds: familiarToEdit.padresIds || [],
          hijosIds: familiarToEdit.hijosIds || [],
          conyugeId: familiarToEdit.conyugeId || null, // Load conyugeId
          fotoBase64: familiarToEdit.fotoBase64 || null, // Load photo
        });
        setIsFormVisible(true); // Show form when editing
      } else {
        // If familiar not found (e.g., deleted while editing), reset
        setEditingId(null);
        setIsFormVisible(false);
      }
    } else {
      // If not editing, reset form to initial state
      setFormState(initialFormState);
    }
  }, [editingId, familiares, initialFormState]); // Rerun when editingId, familiares or initialFormState changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Handle conyugeId specifically: store null if empty string selected
    if (name === "conyugeId") {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value === "" ? null : parseInt(value, 10),
      }));
    } else {
      setFormState((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Result contains the Base64 data URL
        setFormState((prevState) => ({
          ...prevState,
          fotoBase64: reader.result,
        }));
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert("Hubo un error al leer la imagen.");
        setFormState((prevState) => ({ ...prevState, fotoBase64: null })); // Clear on error
      };
      reader.readAsDataURL(file); // Read the file as Base64
    } else {
      // No file selected or selection cancelled
      setFormState((prevState) => ({ ...prevState, fotoBase64: null }));
    }
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedIds = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        selectedIds.push(parseInt(options[i].value, 10));
      }
    }
    setFormState((prevState) => ({ ...prevState, [name]: selectedIds }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formState.nombre ||
      !formState.apellido ||
      !formState.fechaNacimiento
    ) {
      alert("Por favor, completa nombre, apellido y fecha de nacimiento.");
      return;
    }

    if (editingId !== null) {
      // Update existing familiar
      updateFamiliar({ ...formState, id: editingId });
    } else {
      // Add new familiar
      addFamiliar(formState);
    }

    setFormState(initialFormState); // Reset form
    setEditingId(null); // Exit editing mode
    setIsFormVisible(false); // Hide form
  };

  const handleEdit = (id) => {
    window.scrollTo(0, 0); // Scroll to the top of the page
    setEditingId(id); // Set the ID to start editing, useEffect will load data and show form
  };

  const handleCancel = () => {
    setFormState(initialFormState);
    setEditingId(null);
    setIsFormVisible(false);
  };

  const handleAddNew = () => {
    setEditingId(null); // Ensure not in editing mode
    setFormState(initialFormState); // Reset form
    setIsFormVisible(true); // Show empty form
  };

  const handleDelete = (id) => {
    if (
      window.confirm("¿Estás seguro de que quieres borrar a este familiar?")
    ) {
      deleteFamiliar(id);
    }
  };
  // Filter out the current person being edited from potential parents/children list
  const otherFamiliares = familiares.filter((f) => f.id !== editingId);

  return (
    <div className="mx-auto p-4 w-full">
      <h2 className="text-2xl font-bold mb-4">Miembros de la Familia</h2>

      {/* Show Add button only if form is not visible */}
      {!isFormVisible && (
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Añadir Familiar
        </button>
      )}

      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 border rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50"
        >
          <h3 className="text-lg font-semibold col-span-1 md:col-span-2 mb-2 border-b pb-2">
            {editingId ? "Editar Familiar" : "Añadir Nuevo Familiar"}
          </h3>
          {/* Column 1 */}
          <div>
            {/* Fields: Nombre, Apellido, Fecha Nacimiento, Status, Pais, Ciudad */}
            {/* ... (Input fields remain the same as previous version) ... */}
            <div className="mb-3">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre:
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formState.nombre}
                onChange={handleInputChange}
                required
                className="input-style"
                style={{ color: "black" }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="apellido"
                className="block text-sm font-medium text-gray-700"
              >
                Apellido:
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formState.apellido}
                onChange={handleInputChange}
                required
                className="input-style"
                style={{ color: "black" }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="fechaNacimiento"
                className="block text-sm font-medium text-gray-700"
              >
                Fecha de Nacimiento:
              </label>
              <input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formState.fechaNacimiento}
                onChange={handleInputChange}
                required
                className="input-style"
                style={{ color: "black" }}
              />
            </div>
            {/* Status field removed */}
            <div className="mb-3">
              <label
                htmlFor="pais"
                className="block text-sm font-medium text-gray-700"
              >
                País:
              </label>
              <input
                type="text"
                id="pais"
                name="pais"
                value={formState.pais}
                onChange={handleInputChange}
                className="input-style"
                style={{ color: "black" }}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="ciudad"
                className="block text-sm font-medium text-gray-700"
              >
                Ciudad:
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formState.ciudad}
                onChange={handleInputChange}
                className="input-style"
                style={{ color: "black" }}
              />
            </div>
            {/* File Input for Photo */}
            <div className="mb-3">
              <label
                htmlFor="foto"
                className="block text-sm font-medium text-gray-700"
              >
                Foto:
              </label>
              <input
                type="file"
                id="foto"
                name="foto"
                accept="image/*" // Accept only image files
                onChange={handleFileChange}
                className="input-style"
              />
              {/* Image Preview */}
              {formState.fotoBase64 && (
                <img
                  src={formState.fotoBase64}
                  alt="Vista previa"
                  className="mt-2 h-20 w-20 object-cover rounded border"
                />
              )}
            </div>
          </div>

          {/* Column 2 */}
          <div>
            {/* Conyuge Selector */}
            <div className="mb-3">
              <label
                htmlFor="conyugeId"
                className="block text-sm font-medium text-gray-700"
              >
                Esposo/Esposa:
              </label>
              <select
                id="conyugeId"
                name="conyugeId"
                value={formState.conyugeId === null ? "" : formState.conyugeId} // Handle null value for the '-- Ninguno --' option
                onChange={handleInputChange}
                className="input-style"
              >
                <option value="">-- No seleccionado --</option>{" "}
                {/* Option for no selection */}
                {otherFamiliares.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre} {f.apellido}
                  </option>
                ))}
              </select>
            </div>
            {/* Selectors for PadresIds and HijosIds */}
            {/* ... (Selectors remain the same as previous version, but use otherFamiliares) ... */}
            <div className="mb-3">
              <label
                htmlFor="padresIds"
                className="block text-sm font-medium text-gray-700"
              >
                Padre(s)/Madre(s) (Ctrl+Click):
              </label>
              <select
                id="padresIds"
                name="padresIds"
                multiple={true}
                value={formState.padresIds === null ? "" : formState.padresIds} // Value needs to be array of strings for multi-select
                onChange={handleMultiSelectChange}
                className="input-style h-24"
              >
                <option value="">-- No seleccionado --</option>
                {otherFamiliares.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre} {f.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label
                htmlFor="hijosIds"
                className="block text-sm font-medium text-gray-700"
              >
                Hijo(s)/Hija(s) (Ctrl+Click):
              </label>
              <select
                id="hijosIds"
                name="hijosIds"
                multiple={true}
                value={formState.hijosIds === null ? "" : formState.hijosIds}
                onChange={handleMultiSelectChange}
                className="input-style h-24"
              >
                <option value="">-- No seleccionado --</option>
                {otherFamiliares.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre} {f.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons: Save and Cancel */}
            <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                {editingId ? "Actualizar Familiar" : "Guardar Familiar"}
              </button>
            </div>
          </div>
        </form>
      )}

      <h3 className="text-xl font-semibold mb-3 mt-6">Lista de Familiares</h3>
      {familiares.length > 0 ? (
        <div className="flex flex-wrap gap-4 justify-start">
          {familiares.map((miembro) => (
            <div key={miembro.id} className="border p-4 rounded shadow bg-white" style={{ position: 'relative', width: '300px' }}>
              {/* Buttons container top-right */}
              <div className="familia-card-actions">
                <button
                  onClick={() => handleEdit(miembro.id)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white text-xs font-bold py-1 px-2 rounded"
                  aria-label={`Editar ${miembro.nombre} ${miembro.apellido}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(miembro.id)}
                  className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
                  aria-label={`Eliminar ${miembro.nombre} ${miembro.apellido}`}
                >
                  X
                </button>
              </div>

              {/* Member Photo */}
              <div className="text-center mb-3">
                {miembro.fotoBase64 ? (
                  <Image
                    src={miembro.fotoBase64}
                    alt={`${miembro.nombre} ${miembro.apellido}`}
                    style={{
                      width: '300px',
                      height: '300px',
                      objectFit: 'cover',
                      margin: '0 auto' // Centrar la imagen si es un bloque
                    }}
                    thumbnail 
                  />
                ) : (
                  <div
                    style={{
                      width: '300px',
                      height: '300px',
                      backgroundColor: '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.25rem',
                      margin: '0 auto' // Centrar el placeholder
                    }}
                  >
                    <span style={{ color: '#6c757d', fontSize: '1rem' }}>Foto</span>
                  </div>
                )}
              </div>

              {/* Member details */}
              <div className="text-center">
                <h4 className="font-bold text-lg leading-tight">
                  {miembro.nombre} {miembro.apellido}
                </h4>
                {miembro.conyugeId && (
                  <p className="text-sm text-gray-600 leading-tight">
                    Esposo/a: {getFamiliarNameById(miembro.conyugeId)}
                  </p>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                Nacimiento: {miembro.fechaNacimiento} (Edad:{" "}
                {calculateAge(miembro.fechaNacimiento)})
              </p>
              <p className="text-sm text-gray-600">
                Lugar: {miembro.ciudad ? `${miembro.ciudad}, ` : ""}
                {miembro.pais}
              </p>

              {/* Display Parents */}
              {miembro.padresIds && miembro.padresIds.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs font-semibold text-gray-500">Padres:</p>
                  <ul className="list-disc list-inside text-sm">
                    {miembro.padresIds.map((parentId) => (
                      <li key={parentId}>
                        {getFamiliarNameById(parentId) || `ID: ${parentId}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Display Children */}
              {miembro.hijosIds && miembro.hijosIds.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs font-semibold text-gray-500">Hijos:</p>
                  <ul className="list-disc list-inside text-sm">
                    {miembro.hijosIds.map((hijoId) => (
                      <li key={hijoId}>
                        {getFamiliarNameById(hijoId) || `ID: ${hijoId}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay familiares añadidos todavía.</p>
      )}
      {/* Simple CSS for input fields */}
      <style>{`
        .input-style {
          margin-top: 0.25rem;
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #D1D5DB; /* gray-300 */
          border-radius: 0.375rem; /* rounded-md */
          box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          appearance: none; /* Remove default styling */
          background-color: white;
        }
        .input-style:focus {
          outline: none;
          border-color: #6366F1; /* indigo-500 */
          box-shadow: 0 0 0 1px #6366F1; 
        }
        select.input-style {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center;
            background-repeat: no-repeat;
            background-size: 1.5em 1.5em;
            padding-right: 2.5rem;
        }
        select[multiple].input-style {
            background-image: none; /* No arrow for multi-select */
        }
      `}</style>
    </div>
  );
};

export default Familia;
