/**
 * translations.js
 * Handles UI interactions for the script translation page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const loadCurrentScriptBtn = document.getElementById('loadCurrentScript');
    const currentScriptTitle = document.getElementById('currentScriptTitle');
    const translateButtons = document.querySelectorAll('.translate-btn');
    const copyButtons = document.querySelectorAll('.copy-translation');
    const downloadButtons = document.querySelectorAll('.download-translation');
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    
    // Store current script and translations
    let currentScript = null;
    const translations = {
        'Turkish': null,
        'Russian': null,
        'Chinese': null,
        'French': null,
        'Italian': null,
        'Spanish': null,
        'Hindi': null,
        'Japanese': null
    };
    
    /**
     * Load the current script from localStorage
     */
    function loadCurrentScript() {
        const savedScript = localStorage.getItem('currentScript');
        
        if (savedScript) {
            try {
                currentScript = JSON.parse(savedScript);
                currentScriptTitle.textContent = currentScript.title || 'Untitled Script';
                
                // Show success message
                showAlert('success', 'Script loaded successfully!');
            } catch (error) {
                console.error('Error parsing saved script:', error);
                showAlert('danger', 'Failed to load script. Please generate a script first.');
            }
        } else {
            showAlert('warning', 'No script found. Please generate a script first.');
        }
    }
    
    /**
     * Translate the current script to the selected language
     * @param {string} language - The target language for translation
     */
    async function translateToLanguage(language) {
        if (!currentScript) {
            showAlert('warning', 'Please load a script first.');
            return;
        }
        
        // Show loading modal
        loadingModal.show();
        
        // Update status
        updateStatus(language, 'info', 'Translating...');
        
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    script: currentScript,
                    language: language
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Translation failed');
            }
            
            // Store the translation
            translations[language] = data.translatedScript;
            
            // Render the translation
            renderTranslation(language, data.translatedScript);
            
            // Update status
            updateStatus(language, 'success', 'Translation complete!');
        } catch (error) {
            console.error('Translation error:', error);
            updateStatus(language, 'danger', `Error: ${error.message}`);
        } finally {
            // Hide loading modal
            loadingModal.hide();
        }
    }
    
    /**
     * Render the translation content in the appropriate tab
     * @param {string} language - The target language
     * @param {Object} translatedScript - The translated script object
     */
    function renderTranslation(language, translatedScript) {
        const languageId = language.toLowerCase();
        const translationContainer = document.getElementById(`${languageId}-translation`);
        
        if (!translationContainer) return;
        
        // Clear previous content
        translationContainer.innerHTML = '';
        
        // Create elements for translated content
        const titleElement = document.createElement('h3');
        titleElement.textContent = translatedScript.title;
        translationContainer.appendChild(titleElement);
        
        const descElement = document.createElement('p');
        descElement.className = 'lead';
        descElement.textContent = translatedScript.description;
        translationContainer.appendChild(descElement);
        
        const scriptContent = translatedScript.script;
        
        // Intro Hook
        const introSection = createSection('Intro Hook', scriptContent.introHook);
        translationContainer.appendChild(introSection);
        
        // Background Setup
        const backgroundSection = createSection('Background Setup', scriptContent.backgroundSetup);
        translationContainer.appendChild(backgroundSection);
        
        // Story Segments
        const segmentsContainer = document.createElement('div');
        segmentsContainer.className = 'mt-4';
        const segmentsTitle = document.createElement('h4');
        segmentsTitle.textContent = 'Story Segments';
        segmentsContainer.appendChild(segmentsTitle);
        
        if (scriptContent.storySegments && scriptContent.storySegments.length > 0) {
            scriptContent.storySegments.forEach((segment, index) => {
                const segmentSection = createSection(`Segment ${index + 1}: ${segment.title}`, segment.content);
                segmentsContainer.appendChild(segmentSection);
            });
        }
        translationContainer.appendChild(segmentsContainer);
        
        // Consequences
        const consequencesSection = createSection('Consequences', scriptContent.consequences);
        translationContainer.appendChild(consequencesSection);
        
        // Outro
        const outroSection = createSection('Outro', scriptContent.outro);
        translationContainer.appendChild(outroSection);
    }
    
    /**
     * Create a section for displaying translated script content
     * @param {string} title - Section title
     * @param {string} content - Section content
     * @returns {HTMLElement} - The created section element
     */
    function createSection(title, content) {
        const section = document.createElement('div');
        section.className = 'mt-4';
        
        const sectionTitle = document.createElement('h4');
        sectionTitle.className = 'fw-bold';
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);
        
        const sectionContent = document.createElement('p');
        sectionContent.className = 'mb-3';
        sectionContent.textContent = content;
        section.appendChild(sectionContent);
        
        return section;
    }
    
    /**
     * Update the status display for a language tab
     * @param {string} language - The target language
     * @param {string} type - Alert type (success, warning, danger, info)
     * @param {string} message - The status message
     */
    function updateStatus(language, type, message) {
        const languageId = language.toLowerCase();
        const statusContainer = document.getElementById(`${languageId}-status`);
        
        if (!statusContainer) return;
        
        statusContainer.innerHTML = '';
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} d-flex align-items-center my-3`;
        alert.role = 'alert';
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        if (type === 'danger') icon = 'exclamation-circle';
        
        alert.innerHTML = `
            <i class="fas fa-${icon} me-2"></i>
            <div>${message}</div>
        `;
        
        statusContainer.appendChild(alert);
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                alert.remove();
            }, 5000);
        }
    }
      /**
     * Copy the translated content to clipboard
     * @param {string} language - The target language
     */
    function copyTranslation(language) {
        const languageId = language.toLowerCase();
        const translationContainer = document.getElementById(`${languageId}-translation`);
        
        if (!translationContainer || !translations[language]) {
            showAlert('warning', 'No translation available to copy.');
            return;
        }
        
        // Format the script as text
        const formattedText = formatScriptForDownload(translations[language], language);
        
        // Create a temporary textarea element to copy the text
        const textarea = document.createElement('textarea');
        textarea.value = formattedText;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            updateStatus(language, 'success', 'Translation copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            updateStatus(language, 'danger', 'Failed to copy translation.');
        } finally {
            document.body.removeChild(textarea);
        }
    }
      /**
     * Download the translated content as a text file
     * @param {string} language - The target language
     */
    function downloadTranslation(language) {
        if (!translations[language]) {
            showAlert('warning', 'No translation available to download.');
            return;
        }
        
        const translatedScript = translations[language];
        //const filename = `${translatedScript.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${language.toLowerCase()}.txt`;
        const filename = `${currentScript.title}_${language.toLowerCase()}.txt`;
        
        // Format the script content as text
        let textContent = formatScriptForDownload(translatedScript, language);
        
        // Create a blob with the text data
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link to download the file
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        updateStatus(language, 'success', `Translation downloaded as ${filename}`);
    }
    
    /**
     * Show a global alert message
     * @param {string} type - Alert type (success, warning, danger, info)
     * @param {string} message - The message to display
     */
    function showAlert(type, message) {
        // Check if there's already an alert
        const existingAlert = document.querySelector('.global-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create the alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show global-alert`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert at the top of the page, right after the heading
        const heading = document.querySelector('.row.mb-4');
        heading.after(alert);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    }
    
    /**
     * Format script for download as a text file
     * @param {Object} script - The script data
     * @param {string} language - The language of the script
     * @returns {string} - Formatted script text
     */
    function formatScriptForDownload(script, language) {
        let content = '';
        
        // Title
        content += `TITLE: ${script.title}\n\n`;
        
        // Categories
        content += `CATEGORIES: ${script.category.join(', ')}\n\n`;
        
        // Language
        content += `LANGUAGE: ${language}\n\n`;
        
        // Description
        content += `DESCRIPTION:\n${script.description}\n\n`;
        
        // Script content
        content += `SCRIPT:\n\n`;
        
        if (script.script) {
            // Intro Hook
            content += `--- INTRO HOOK (45-60 seconds) ---\n\n${script.script.introHook}\n\n`;
            
            // Background Setup
            content += `--- BACKGROUND SETUP (1-2 minutes) ---\n\n${script.script.backgroundSetup}\n\n`;
            
            // Story Segments
            content += `--- STORY SEGMENTS (8-10 minutes) ---\n\n`;
            
            if (script.script.storySegments && script.script.storySegments.length > 0) {
                script.script.storySegments.forEach((segment, index) => {
                    content += `SEGMENT ${index + 1}: ${segment.title}\n\n${segment.content}\n\n`;
                });
            }
            
            // Consequences
            content += `--- CONSEQUENCES (2-3 minutes) ---\n\n${script.script.consequences}\n\n`;
            
            // Outro
            content += `--- OUTRO/REFLECTION (30-60 seconds) ---\n\n${script.script.outro}\n\n`;
        }
        
        // Footer
        content += `Generated by VideoScriptAI on ${new Date().toLocaleDateString()} - ${language} translation`;
        
        return content;
    }
    
    // Event Listeners
    if (loadCurrentScriptBtn) {
        loadCurrentScriptBtn.addEventListener('click', loadCurrentScript);
    }
    
    // Add event listeners for translate buttons
    translateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const language = button.getAttribute('data-language');
            translateToLanguage(language);
        });
    });
    
    // Add event listeners for copy buttons
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const language = button.getAttribute('data-language');
            copyTranslation(language);
        });
    });
    
    // Add event listeners for download buttons
    downloadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const language = button.getAttribute('data-language');
            downloadTranslation(language);
        });
    });
    
    // Add CSS for global alerts
    const style = document.createElement('style');
    style.textContent = `
        .global-alert {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: auto;
            max-width: 90%;
            z-index: 1050;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
    `;
    document.head.appendChild(style);
});
