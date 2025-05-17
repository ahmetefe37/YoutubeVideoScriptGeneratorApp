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
  
  // Image prompts page elements
  const imagePromptForm = document.getElementById('imagePromptForm');
  const generatePromptsBtn = document.getElementById('generatePromptsBtn');
  const loadingSpinnerPrompts = document.getElementById('loadingSpinnerPrompts');
  const imagePromptResult = document.getElementById('imagePromptResult');
  const copyAllPrompts = document.getElementById('copyAllPrompts');
  const noScriptWarning = document.getElementById('noScriptWarning');
  
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
  
  // Check if we're on the image prompts page
  if (imagePromptForm) {
    // Check if we have a script
    const scriptData = localStorage.getItem('generatedScript');
    if (!scriptData) {
      // Show warning
      if (noScriptWarning) {
        noScriptWarning.classList.remove('d-none');
      }
      if (generatePromptsBtn) {
        generatePromptsBtn.disabled = true;
      }
    } else {
      // Check if we already have image prompts
      const imagePromptsData = localStorage.getItem('generatedImagePrompts');
      
      if (imagePromptsData) {
        // Display existing image prompts
        try {
          const imagePrompts = JSON.parse(imagePromptsData);
          displayImagePrompts(imagePrompts);
        } catch (error) {
          console.error('Error parsing image prompts:', error);
        }
      }
      
      // Add event listener for form submission
      imagePromptForm.addEventListener('submit', handleImagePromptGeneration);
      
      // Copy all prompts functionality
      if (copyAllPrompts) {
        copyAllPrompts.addEventListener('click', copyAllImagePrompts);
      }
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
        // Check if response has both script and imagePrompts
        const scriptData = data.script || data;
        
        // Validate the script data structure
        if (!scriptData.title || !scriptData.description || !scriptData.category || !scriptData.script) {
          throw new Error('The generated script is incomplete. Please try again.');
        }
        
        // Store the script in localStorage
        localStorage.setItem('generatedScript', JSON.stringify(scriptData));
        
        // Store image prompts if available
        if (data.imagePrompts) {
          localStorage.setItem('generatedImagePrompts', JSON.stringify(data.imagePrompts));
          showAlert('Script and image prompts generated successfully!', 'success');
        } else {
          showAlert('Script generated successfully!', 'success');
        }
        
        // Display the result
        displayScriptPreview(scriptData);
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
    viewBtn.className = 'btn btn-success me-2';
    viewBtn.innerHTML = '<i class="fas fa-eye me-2"></i>View Full Script';
    preview.appendChild(viewBtn);
    
    // Add image prompts button if available
    if(localStorage.getItem('generatedImagePrompts')) {
      const promptsBtn = document.createElement('a');
      promptsBtn.href = '/image-prompts';
      promptsBtn.className = 'btn btn-info ms-2';
      promptsBtn.innerHTML = '<i class="fas fa-images me-2"></i>View Image Prompts';
      preview.appendChild(promptsBtn);
    }
    
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
  
  /**
   * Handle image prompt generation form submission
   * @param {Event} e - The form submission event
   */
  async function handleImagePromptGeneration(e) {
    e.preventDefault();
    
    const scriptData = localStorage.getItem('generatedScript');
    if (!scriptData) {
      showAlert('No script found. Please generate a script first.', 'warning');
      return;
    }
    
    const script = JSON.parse(scriptData);
    const count = document.getElementById('promptCount').value || 5;
    
    // Show loading state
    generatePromptsBtn.disabled = true;
    loadingSpinnerPrompts.classList.remove('d-none');
    generatePromptsBtn.innerText = 'Generating...';
    
    try {
      const response = await fetch('/api/image-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ script, count })
      });
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        throw new Error('Invalid response format from server. Please try again.');
      }
      
      if (response.ok) {
        // Store in localStorage for future reference
        localStorage.setItem('generatedImagePrompts', JSON.stringify(data.imagePrompts));
        
        // Display the result
        displayImagePrompts(data.imagePrompts);
        
        // Show success message
        showAlert('Image prompts generated successfully!', 'success');
      } else {
        throw new Error(data.error || 'Failed to generate image prompts');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert(error.message || 'An error occurred while generating image prompts', 'danger');
    } finally {
      // Reset button state
      generatePromptsBtn.disabled = false;
      loadingSpinnerPrompts.classList.add('d-none');
      generatePromptsBtn.innerText = 'Generate Image Prompts';
    }
  }

  /**
   * Display generated image prompts for each paragraph
   * @param {Object} data - Object with paragraphs and their corresponding image prompts
   */
  function displayImagePrompts(data) {
    if (!imagePromptResult) return;
    
    if (!data || !data.paragraphs || !data.paragraphs.length) {
      imagePromptResult.innerHTML = '<div class="alert alert-warning">No image prompts were generated. Please try again.</div>';
      return;
    }
    
    // Clear existing content
    imagePromptResult.innerHTML = '';
    
    // Create container for paragraphs and their prompts
    const promptsContainer = document.createElement('div');
    
    data.paragraphs.forEach((paragraph, index) => {
      const paragraphCard = document.createElement('div');
      paragraphCard.className = 'card mb-4 border-0 shadow-sm';
      
      // Card header
      const cardHeader = document.createElement('div');
      cardHeader.className = 'card-header bg-dark bg-opacity-75 text-white d-flex justify-content-between align-items-center';
      
      const headerTitle = document.createElement('h5');
      headerTitle.className = 'mb-0';
      headerTitle.innerHTML = `<span class="badge bg-primary me-2">Paragraph ${index + 1}</span> ${paragraph.title}`;
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'btn btn-sm btn-light copy-prompt-btn';
      copyBtn.innerHTML = '<i class="fas fa-copy me-1"></i> Copy';
      copyBtn.title = 'Copy this prompt';
      copyBtn.dataset.prompt = paragraph.imagePrompt;
      copyBtn.addEventListener('click', function() {
        copyTextToClipboard(this.dataset.prompt);
        showAlert('Prompt copied to clipboard!', 'success');
      });
      
      cardHeader.appendChild(headerTitle);
      cardHeader.appendChild(copyBtn);
      
      // Card body
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
      
      // Paragraph excerpt
      const paragraphExcerpt = document.createElement('div');
      paragraphExcerpt.className = 'mb-3 text-muted border-start border-4 border-primary ps-3 py-2';
      paragraphExcerpt.innerHTML = `<strong>Text:</strong><br>${paragraph.text || ''}`;
      
      // Prompt container
      const promptContainer = document.createElement('div');
      promptContainer.className = 'bg-light p-3 rounded';
      
      const promptLabel = document.createElement('div');
      promptLabel.className = 'fw-bold text-primary mb-2';
      promptLabel.innerHTML = '<i class="fas fa-image me-2"></i>IMAGE PROMPT:';
      
      const promptText = document.createElement('div');
      promptText.className = 'prompt-text';
      promptText.textContent = paragraph.imagePrompt;
      
      promptContainer.appendChild(promptLabel);
      promptContainer.appendChild(promptText);
      
      cardBody.appendChild(paragraphExcerpt);
      cardBody.appendChild(promptContainer);
      
      // Assemble the card
      paragraphCard.appendChild(cardHeader);
      paragraphCard.appendChild(cardBody);
      
      // Add to container
      promptsContainer.appendChild(paragraphCard);
    });
    
    imagePromptResult.appendChild(promptsContainer);
  }
  
  /**
   * Copy all image prompts to clipboard
   */
  function copyAllImagePrompts() {
    const promptElements = document.querySelectorAll('.copy-prompt-btn');
    if (!promptElements.length) {
      showAlert('No prompts to copy', 'warning');
      return;
    }
    
    const allPrompts = Array.from(promptElements).map(el => el.dataset.prompt).join('\n\n');
    copyTextToClipboard(allPrompts);
    showAlert('All prompts copied to clipboard!', 'success');
  }
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   */
  function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
});  // Close the DOMContentLoaded event listener
