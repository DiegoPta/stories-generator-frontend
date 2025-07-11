/**
 * Generador de Historias - Aplicación Frontend
 * 
 * Este archivo contiene toda la lógica de la aplicación:
 * - Manejo del formulario
 * - Validación de datos
 * - Comunicación con el backend
 * - Gestión de estados de carga y errores
 * - Funcionalidad de copiado
 */

// Configuración de la aplicación
const CONFIG = {
    // URL del backend - CAMBIAR ESTA URL cuando tengas tu backend corriendo
    API_URL: 'http://localhost:8000',
    ENDPOINTS: {
        GENERATE_STORY: '/generate-story'
    },
    // Límites para el número de palabras
    WORD_LIMITS: {
        MIN: 50,
        MAX: 2000
    }
};

// Elementos del DOM
const elements = {
    form: null,
    wordCountInput: null,
    creativitySelect: null,
    genreSelect: null,
    categorySelect: null,
    suggestionsTextarea: null,
    submitBtn: null,
    btnText: null,
    btnLoading: null,
    resultsSection: null,
    storyContent: null,
    copyBtn: null,
    errorSection: null,
    errorMessage: null
};

// Estado de la aplicación
let appState = {
    isLoading: false,
    currentStory: null
};

/**
 * Inicialización de la aplicación
 */
function initApp() {
    console.log('🚀 Inicializando Generador de Historias...');
    
    // Obtener referencias a los elementos del DOM
    initializeElements();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Validar configuración
    validateConfig();
    
    console.log('✅ Aplicación inicializada correctamente');
}

/**
 * Inicializar referencias a elementos del DOM
 */
function initializeElements() {
    elements.form = document.getElementById('storyForm');
    elements.wordCountInput = document.getElementById('wordCount');
    elements.creativitySelect = document.getElementById('creativityLevel');
    elements.genreSelect = document.getElementById('genre');
    elements.categorySelect = document.getElementById('category');
    elements.suggestionsTextarea = document.getElementById('suggestions');
    elements.submitBtn = document.querySelector('.submit-btn');
    elements.btnText = document.querySelector('.btn-text');
    elements.btnLoading = document.querySelector('.btn-loading');
    elements.resultsSection = document.getElementById('resultsSection');
    elements.storyContent = document.getElementById('storyContent');
    elements.copyBtn = document.getElementById('copyBtn');
    elements.errorSection = document.getElementById('errorSection');
    elements.errorMessage = document.getElementById('errorMessage');
    
    // Verificar que todos los elementos existen
    Object.entries(elements).forEach(([key, element]) => {
        if (!element) {
            console.error(`❌ Elemento no encontrado: ${key}`);
        }
    });
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Event listener para el formulario
    elements.form.addEventListener('submit', handleFormSubmit);
    
    // Event listener para el botón de copiar
    elements.copyBtn.addEventListener('click', handleCopyStory);
    
    // Event listeners para validación en tiempo real
    elements.wordCountInput.addEventListener('input', validateWordCount);
    elements.genreSelect.addEventListener('change', validateGenre);
    elements.categorySelect.addEventListener('change', validateCategory);
    
    // Event listener para mostrar/ocultar sugerencias
    elements.suggestionsTextarea.addEventListener('focus', () => {
        elements.suggestionsTextarea.style.borderColor = '#667eea';
    });
    
    elements.suggestionsTextarea.addEventListener('blur', () => {
        if (!elements.suggestionsTextarea.value.trim()) {
            elements.suggestionsTextarea.style.borderColor = '#e1e5e9';
        }
    });
}

/**
 * Validar configuración de la aplicación
 */
function validateConfig() {
    if (!CONFIG.API_URL) {
        console.warn('⚠️ API_URL no configurada. Asegúrate de configurar la URL del backend.');
    }
}

/**
 * Manejar el envío del formulario
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
        return;
    }
    
    // Obtener datos del formulario
    const formData = getFormData();
    
    // Mostrar estado de carga
    setLoadingState(true);
    
    try {
        // Ocultar errores previos
        hideError();
        
        // Enviar solicitud al backend
        const story = await generateStory(formData);
        
        // Mostrar resultado
        displayStory(story);
        
        // Guardar en el estado
        appState.currentStory = story;
        
    } catch (error) {
        console.error('❌ Error al generar historia:', error);
        showError(error.message || 'Error al generar la historia. Intenta de nuevo.');
    } finally {
        // Ocultar estado de carga
        setLoadingState(false);
    }
}

/**
 * Validar el formulario completo
 */
function validateForm() {
    let isValid = true;
    
    // Validar número de palabras
    if (!validateWordCount()) {
        isValid = false;
    }
    
    // Validar género
    if (!validateGenre()) {
        isValid = false;
    }
    
    // Validar nivel de creatividad
    if (!elements.creativitySelect.value) {
        showFieldError(elements.creativitySelect, 'Selecciona un nivel de creatividad');
        isValid = false;
    } else {
        clearFieldError(elements.creativitySelect);
    }

    // Validar categoría
    if (!elements.categorySelect.value) {
        showFieldError(elements.categorySelect, 'Selecciona una categoría');
        isValid = false;
    } else {
        clearFieldError(elements.categorySelect);
    }
    
    return isValid;
}

/**
 * Validar número de palabras
 */
function validateWordCount() {
    const value = parseInt(elements.wordCountInput.value);
    const min = CONFIG.WORD_LIMITS.MIN;
    const max = CONFIG.WORD_LIMITS.MAX;
    
    if (isNaN(value) || value < min || value > max) {
        showFieldError(elements.wordCountInput, `El número de palabras debe estar entre ${min} y ${max}`);
        return false;
    }
    
    clearFieldError(elements.wordCountInput);
    return true;
}

/**
 * Validar género
 */
function validateGenre() {
    if (!elements.genreSelect.value) {
        showFieldError(elements.genreSelect, 'Selecciona un género');
        return false;
    }
    
    clearFieldError(elements.genreSelect);
    return true;
}


/**
 * Mostrar error en un campo específico
 */
function showFieldError(element, message) {
    element.style.borderColor = '#dc3545';
    element.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
    
    // Crear o actualizar mensaje de error
    let errorElement = element.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.color = '#dc3545';
        errorElement.style.fontSize = '0.85rem';
        errorElement.style.marginTop = '5px';
        element.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

/**
 * Limpiar error de un campo específico
 */
function clearFieldError(element) {
    element.style.borderColor = '#e1e5e9';
    element.style.boxShadow = 'none';
    
    const errorElement = element.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Obtener datos del formulario
 */
function getFormData() {
    return {
        word_count: parseInt(elements.wordCountInput.value),
        creativity_level: elements.creativitySelect.value,
        genre: elements.genreSelect.value,
        category: elements.categorySelect.value,
        suggestions: elements.suggestionsTextarea.value.trim() || null
    };
}

/**
 * Generar historia llamando al backend
 */
async function generateStory(formData) {
    const url = `${CONFIG.API_URL}${CONFIG.ENDPOINTS.GENERATE_STORY}`;
    
    console.log('📤 Enviando solicitud al backend:', formData);
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error del servidor: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📥 Respuesta del backend:', data);
    
    return data;
}

/**
 * Mostrar la historia generada
 */
function displayStory(storyData) {
    // Ocultar sección de errores si está visible
    hideError();
    
    // Mostrar contenido de la historia
    elements.storyContent.textContent = storyData.story || storyData.content || 'Historia generada exitosamente';
    
    // Mostrar sección de resultados
    elements.resultsSection.style.display = 'block';
    
    // Hacer scroll suave hacia los resultados
    elements.resultsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    
    console.log('✅ Historia mostrada correctamente');
}

/**
 * Manejar el copiado de la historia
 */
async function handleCopyStory() {
    if (!appState.currentStory) {
        return;
    }
    
    const storyText = elements.storyContent.textContent;
    
    try {
        await navigator.clipboard.writeText(storyText);
        
        // Mostrar feedback visual
        const originalText = elements.copyBtn.textContent;
        elements.copyBtn.textContent = '✅ ¡Copiado!';
        elements.copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            elements.copyBtn.textContent = originalText;
            elements.copyBtn.style.background = '#28a745';
        }, 2000);
        
        console.log('📋 Historia copiada al portapapeles');
        
    } catch (error) {
        console.error('❌ Error al copiar:', error);
        showError('No se pudo copiar la historia al portapapeles');
    }
}

/**
 * Mostrar estado de carga
 */
function setLoadingState(isLoading) {
    appState.isLoading = isLoading;
    
    if (isLoading) {
        elements.submitBtn.disabled = true;
        elements.btnText.style.display = 'none';
        elements.btnLoading.style.display = 'inline-flex';
    } else {
        elements.submitBtn.disabled = false;
        elements.btnText.style.display = 'inline';
        elements.btnLoading.style.display = 'none';
    }
}

/**
 * Mostrar error
 */
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorSection.style.display = 'block';
    
    // Hacer scroll hacia el error
    elements.errorSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

/**
 * Ocultar error
 */
function hideError() {
    elements.errorSection.style.display = 'none';
}

/**
 * Función de utilidad para formatear texto
 */
function formatStoryText(text) {
    if (!text) return '';
    
    // Dividir en párrafos si hay saltos de línea
    return text.split('\n').map(paragraph => 
        paragraph.trim()
    ).filter(paragraph => 
        paragraph.length > 0
    ).join('\n\n');
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);

// Exportar funciones para uso en consola (debugging)
window.storyGenerator = {
    generateStory,
    displayStory,
    showError,
    hideError,
    setLoadingState,
    CONFIG
}; 