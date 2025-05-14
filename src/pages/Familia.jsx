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
      padresIds: null,
      hijosIds: null,
      conyugeId: null,
      fotoBase64: null,
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
      if (options[i].selected && options[i].value !== '') {
        selectedIds.push(parseInt(options[i].value, 10));
      }
    }
    setFormState((prevState) => ({ ...prevState, [name]: selectedIds.length > 0 ? selectedIds : null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.nombre || !formState.apellido) {
      alert("Por favor, completa nombre y apellido.");
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
    <div className="familia-page-background p-4">
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
        <form onSubmit={handleSubmit} className="familia-form">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Editar Familiar" : "Añadir Nuevo Familiar"}
          </h3>
          
          {/* Datos personales */}
          <div className="familia-form-group">
            <label className="familia-form-label">Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={formState.nombre}
              onChange={handleInputChange}
              required
              className="familia-form-input"
            />
          </div>

          <div className="familia-form-group">
            <label className="familia-form-label">Apellido:</label>
            <input
              type="text"
              name="apellido"
              value={formState.apellido}
              onChange={handleInputChange}
              required
              className="familia-form-input"
            />
          </div>

          <div className="familia-form-group">
            <label className="familia-form-label">Fecha de Nacimiento:</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formState.fechaNacimiento}
              onChange={handleInputChange}
              className="familia-form-input"
            />
          </div>

          <div className="familia-form-group">
            <label className="familia-form-label">País:</label>
            <input
              type="text"
              name="pais"
              value={formState.pais}
              onChange={handleInputChange}
              className="familia-form-input"
            />
          </div>

          <div className="familia-form-group">
            <label className="familia-form-label">Ciudad:</label>
            <input
              type="text"
              name="ciudad"
              value={formState.ciudad}
              onChange={handleInputChange}
              className="familia-form-input"
            />
          </div>

          <div className="familia-form-group">
            <label className="familia-form-label">Foto:</label>
            <input
              type="file"
              name="foto"
              accept="image/*"
              onChange={handleFileChange}
              className="familia-form-input"
            />
            {formState.fotoBase64 && (
              <img
                src={formState.fotoBase64}
                alt="Vista previa"
                className="familia-form-preview"
              />
            )}
          </div>

          {/* Relaciones familiares */}
          <div className="familia-form-group">
            <label className="familia-form-label">Esposo/Esposa:</label>
            <select
              name="conyugeId"
              value={formState.conyugeId === null ? "" : formState.conyugeId}
              onChange={handleInputChange}
              className="familia-form-input"
            >
              <option value="">-- No seleccionado --</option>
              {otherFamiliares.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre} {f.apellido}
                </option>
              ))}
            </select>
          </div>

          <div className="familia-form-group">
            <label className="familia-form-label">Padre(s)/Madre(s):</label>
            <select
              name="padresIds"
              multiple={true}
              value={formState.padresIds || []}
              onChange={handleMultiSelectChange}
              className="familia-form-input h-24"
            >
              <option value="">-- No seleccionado --</option>
              {otherFamiliares.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre} {f.apellido}
                </option>
              ))}
            </select>
          </div>

          <div className="familia-form-group">
            <label className="familia-form-label">Hijo(s)/Hija(s):</label>
            <select
              name="hijosIds"
              multiple={true}
              value={formState.hijosIds || []}
              onChange={handleMultiSelectChange}
              className="familia-form-input h-24"
            >
              <option value="">-- No seleccionado --</option>
              {otherFamiliares.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre} {f.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="familia-form-buttons">
            <button
              type="button"
              onClick={handleCancel}
              className="familia-form-button familia-form-button-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="familia-form-button"
            >
              {editingId ? "Actualizar Familiar" : "Guardar Familiar"}
            </button>
          </div>
        </form>
      )}

      <h3 className="text-xl font-semibold mb-3 mt-6">Lista de Familiares</h3>
      {familiares.length > 0 ? (
        <div className="familia-cards-container">
          {familiares.map((miembro) => (
            <div key={miembro.id} className="familia-card-item border p-4 rounded shadow bg-white">
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
                    className="familia-photo"
                    thumbnail 
                  />
                ) : (
                  <div
                    className="familia-photo-placeholder"
                  >
                    <span className="familia-photo-placeholder-text">Foto</span>
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

              {/* Display Parents only if they exist */}
              {miembro.padresIds && miembro.padresIds.some(id => id !== null) && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs font-semibold text-gray-500">Padres:</p>
                  <ul className="list-disc list-inside text-sm">
                    {miembro.padresIds
                      .filter(id => id !== null)
                      .map((parentId) => (
                        <li key={parentId}>
                          {getFamiliarNameById(parentId)}
                        </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Display Children only if they exist */}
              {miembro.hijosIds && miembro.hijosIds.some(id => id !== null) && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs font-semibold text-gray-500">Hijos:</p>
                  <ul className="list-disc list-inside text-sm">
                    {miembro.hijosIds
                      .filter(id => id !== null)
                      .map((hijoId) => (
                        <li key={hijoId}>
                          {getFamiliarNameById(hijoId)}
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

    </div>
  );
};

export default Familia;
