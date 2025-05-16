/**
 * Main JavaScript file for VideoScriptAI
 * Handles form submission, script generation, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const scriptForm = document.getElementById('scriptForm');
  const generateBtn = document.getElementById('generateBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const resultCard = document.getElementById('resultCard');
  const scriptResult = document.getElementById('scriptResult');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  
  // Script page elements
  const scriptTitle = document.getElementById('scriptTitle');
  const titleDisplay = document.getElementById('titleDisplay');
  const descriptionDisplay = document.getElementById('descriptionDisplay');
  const categoriesContainer = document.getElementById('categoriesContainer');
  const introHookContent = document.getElementById('introHookContent');
  const backgroundSetupContent = document.getElementById('backgroundSetupContent');
  const storySegmentsContainer = document.getElementById('storySegmentsContainer');
  const consequencesContent = document.getElementById('consequencesContent');
  const outroContent = document.getElementById('outroContent');
  const copyScript = document.getElementById('copyScript');
  const downloadScript = document.getElementById('downloadScript');
  
  // Check if we're on the script form page
  if (scriptForm) {
    scriptForm.addEventListener('submit', handleScriptGeneration);
    
    // Copy and download button functionality
    if (copyBtn) {
      copyBtn.addEventListener('click', copyScriptToClipboard);
    }
    
    if (downloadBtn) {
      downloadBtn.addEventListener('click', downloadScriptAsText);
    }
  }
  
  // Check if we're on the script display page
  if (scriptTitle) {
    // Load script from localStorage if it exists
    loadScriptFromStorage();
    
    // Copy and download functionality
    if (copyScript) {
      copyScript.addEventListener('click', copyFullScriptToClipboard);
    }
    
    if (downloadScript) {
      downloadScript.addEventListener('click', downloadFullScriptAsText);
    }
  }
  
  /**
   * Handle script generation form submission
   * @param {Event} e - The form submission event
   */
  async function handleScriptGeneration(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value.trim();
    
    if (!subject) {
      showAlert('Please enter a subject for your video script', 'danger');
      return;
    }
    
    // Show loading state
    generateBtn.disabled = true;
    loadingSpinner.classList.remove('d-none');
    generateBtn.innerText = 'Generating...';
      try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject })
      });
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        throw new Error('Invalid response format from server. Please try again.');
      }
      
      if (response.ok) {
        // Validate the script data structure
        if (!data.title || !data.description || !data.category || !data.script) {
          throw new Error('The generated script is incomplete. Please try again.');
        }
        
        // Store the script in localStorage
        localStorage.setItem('generatedScript', JSON.stringify(data));
        
        // Display the result
        displayScriptPreview(data);
        
        // Show success message
        showAlert('Script generated successfully!', 'success');
      } else {
        throw new Error(data.error || 'Failed to generate script');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert(error.message || 'An error occurred while generating the script', 'danger');
    } finally {
      // Reset button state
      generateBtn.disabled = false;
      loadingSpinner.classList.add('d-none');
      generateBtn.innerText = 'Generate Script';
    }
  }
  
  /**
   * Display a preview of the generated script
   * @param {Object} script - The script data
   */
  function displayScriptPreview(script) {
    resultCard.classList.remove('d-none');
    
    // Clear existing content
    scriptResult.innerHTML = '';
    
    // Create script preview
    const preview = document.createElement('div');
    
    // Title
    const title = document.createElement('h3');
    title.className = 'mb-4';
    title.textContent = script.title;
    preview.appendChild(title);
    
    // Categories
    const categories = document.createElement('div');
    categories.className = 'mb-3';
    script.category.forEach(cat => {
      const badge = document.createElement('span');
      badge.className = 'badge bg-primary me-2';
      badge.textContent = cat;
      categories.appendChild(badge);
    });
    preview.appendChild(categories);
    
    // Description
    const description = document.createElement('div');
    description.className = 'mb-4';
    description.innerHTML = `<h5>Description:</h5><p>${script.description}</p>`;
    preview.appendChild(description);
    
    // Preview button
    const viewBtn = document.createElement('a');
    viewBtn.href = '/script';
    viewBtn.className = 'btn btn-success';
    viewBtn.innerHTML = '<i class="fas fa-eye me-2"></i>View Full Script';
    preview.appendChild(viewBtn);
    
    // Add to result container
    scriptResult.appendChild(preview);
    
    // Scroll to result
    resultCard.scrollIntoView({ behavior: 'smooth' });
  }
  
  /**
   * Load and display script from localStorage on the script page
   */
  function loadScriptFromStorage() {
    const scriptData = localStorage.getItem('generatedScript');
    
    if (scriptData) {
      try {
        const script = JSON.parse(scriptData);
        
        // Set page title
        document.title = `${script.title} - VideoScriptAI`;
        scriptTitle.textContent = script.title;
        
        // Display script information
        titleDisplay.textContent = script.title;
        descriptionDisplay.textContent = script.description;
        
        // Categories
        categoriesContainer.innerHTML = '';
        script.category.forEach(cat => {
          const badge = document.createElement('span');
          badge.className = 'badge bg-primary me-2';
          badge.textContent = cat;
          categoriesContainer.appendChild(badge);
        });
        
        // Script sections
        if (script.script) {
          // Intro Hook
          if (script.script.introHook) {
            introHookContent.textContent = script.script.introHook;
          }
          
          // Background Setup
          if (script.script.backgroundSetup) {
            backgroundSetupContent.textContent = script.script.backgroundSetup;
          }
          
          // Story Segments
          if (script.script.storySegments && script.script.storySegments.length > 0) {
            storySegmentsContainer.innerHTML = '';
            
            script.script.storySegments.forEach((segment, index) => {
              const segmentDiv = document.createElement('div');
              segmentDiv.className = 'script-section mb-3';
              
              const segmentTitle = document.createElement('h5');
              segmentTitle.className = 'segment-title';
              segmentTitle.textContent = segment.title;
              
              const segmentContent = document.createElement('p');
              segmentContent.textContent = segment.content;
              
              segmentDiv.appendChild(segmentTitle);
              segmentDiv.appendChild(segmentContent);
              storySegmentsContainer.appendChild(segmentDiv);
            });
          }
          
          // Consequences
          if (script.script.consequences) {
            consequencesContent.textContent = script.script.consequences;
          }
          
          // Outro
          if (script.script.outro) {
            outroContent.textContent = script.script.outro;
          }
        }
      } catch (error) {
        console.error('Error parsing script data:', error);
        showAlert('Failed to load script data', 'danger');
      }
    } else {
      // No script data found
      document.title = 'No Script Found - VideoScriptAI';
      scriptTitle.textContent = 'No Script Found';
      
      const noScriptAlert = document.createElement('div');
      noScriptAlert.className = 'alert alert-warning';
      noScriptAlert.textContent = 'No generated script found. Please go back to the home page and generate a script first.';
      
      const homeBtn = document.createElement('a');
      homeBtn.href = '/';
      homeBtn.className = 'btn btn-primary mt-2';
      homeBtn.textContent = 'Generate a Script';
      
      noScriptAlert.appendChild(document.createElement('br'));
      noScriptAlert.appendChild(homeBtn);
      
      // Add to the page
      document.querySelector('.col-lg-8').appendChild(noScriptAlert);
      document.querySelector('.col-lg-4').style.display = 'none';
    }
  }
  
  /**
   * Copy script preview to clipboard
   */
  function copyScriptToClipboard() {
    const scriptContent = scriptResult.innerText;
    navigator.clipboard.writeText(scriptContent)
      .then(() => {
        showAlert('Script copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Failed to copy script:', err);
        showAlert('Failed to copy script to clipboard', 'danger');
      });
  }
  
  /**
   * Download script preview as a text file
   */
  function downloadScriptAsText() {
    const scriptData = localStorage.getItem('generatedScript');
    
    if (scriptData) {
      try {
        const script = JSON.parse(scriptData);
        const filename = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
        const content = formatScriptForDownload(script);
        
        // Create download link
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        
        element.style.display = 'none';
        document.body.appendChild(element);
        
        element.click();
        
        document.body.removeChild(element);
      } catch (error) {
        console.error('Error downloading script:', error);
        showAlert('Failed to download script', 'danger');
      }
    }
  }
  
  /**
   * Copy full script to clipboard from the script page
   */
  function copyFullScriptToClipboard() {
    const scriptData = localStorage.getItem('generatedScript');
    
    if (scriptData) {
      try {
        const script = JSON.parse(scriptData);
        const content = formatScriptForDownload(script);
        
        navigator.clipboard.writeText(content)
          .then(() => {
            showAlert('Script copied to clipboard!', 'success');
          })
          .catch(err => {
            console.error('Failed to copy script:', err);
            showAlert('Failed to copy script to clipboard', 'danger');
          });
      } catch (error) {
        console.error('Error copying script:', error);
        showAlert('Failed to copy script', 'danger');
      }
    }
  }
  
  /**
   * Download full script as a text file from the script page
   */
  function downloadFullScriptAsText() {
    const scriptData = localStorage.getItem('generatedScript');
    
    if (scriptData) {
      try {
        const script = JSON.parse(scriptData);
        const filename = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
        const content = formatScriptForDownload(script);
        
        // Create download link
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        
        element.style.display = 'none';
        document.body.appendChild(element);
        
        element.click();
        
        document.body.removeChild(element);
      } catch (error) {
        console.error('Error downloading script:', error);
        showAlert('Failed to download script', 'danger');
      }
    }
  }
  
  /**
   * Format script for download
   * @param {Object} script - The script data
   * @returns {string} - Formatted script text
   */
  function formatScriptForDownload(script) {
    let content = '';
    
    // Title
    content += `TITLE: ${script.title}\n\n`;
    
    // Categories
    content += `CATEGORIES: ${script.category.join(', ')}\n\n`;
    
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
    content += `Generated by VideoScriptAI on ${new Date().toLocaleDateString()}`;
    
    return content;
  }
  
  /**
   * Show an alert message
   * @param {string} message - The message to display
   * @param {string} type - The type of alert (success, danger, etc.)
   */
  function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    
    // Add message
    alertDiv.textContent = message;
    
    // Add dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'btn-close';
    dismissBtn.setAttribute('data-bs-dismiss', 'alert');
    dismissBtn.setAttribute('aria-label', 'Close');
    alertDiv.appendChild(dismissBtn);
    
    // Add to page
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert-container position-fixed top-0 end-0 p-3';
    alertContainer.style.zIndex = '1050';
    alertContainer.appendChild(alertDiv);
    document.body.appendChild(alertContainer);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      alertContainer.remove();
    }, 5000);
  }
});
