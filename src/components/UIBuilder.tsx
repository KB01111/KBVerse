import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './common/Tabs';
import { Code, Eye, MessageSquare, Send, Layout, Save, Play, RefreshCw, Wand2, ArrowRight, Check, Download, FolderPlus, Folder, ArrowLeft, Target, Moon, Sun, Monitor } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useTheme } from '../hooks/useTheme';
import Editor from '@monaco-editor/react';
import ChatPanel from './uibuilder_components/ChatPanel';
import { 
  OllamaModel, 
  OllamaService, 
  ollamaSettingsStore,
  OpenAIService,
  OpenAIModel,
  OpenAIModelSelector,
  ApiTypeSelector
} from './uibuilder_components/ui_builder_libraries';
import { db, Message } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { UIBuilderDesign } from './uibuilder_components/ui_builder_libraries/ProjectTypes';
import PreviewPanel from './uibuilder_components/PreviewPanel';
import ExportProjectModal from './uibuilder_components/ExportProjectModal';
import ProjectManagerModal from './uibuilder_components/ProjectManagerModal';
import { uiBuilderService, UIBuilderProject } from '../services/UIBuilderService';
import ToastNotification from './gallery_components/ToastNotification';

interface UIBuilderProps {
  onPageChange: (page: string) => void;
}

const UIBuilder: React.FC<UIBuilderProps> = ({ onPageChange }) => {
  const { isDark, theme, setTheme } = useTheme();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatMode, setChatMode] = useState<'chat' | 'design'>('design');
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<OllamaModel | null>(null);
  const [selectedOpenAIModel, setSelectedOpenAIModel] = useState<OpenAIModel | null>(null);
  const [apiType, setApiType] = useState<'ollama' | 'openai' | 'litellm'>('ollama');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    ollama_base_url: '',
    openai_api_key: '',
    openai_base_url: 'https://api.openai.com/v1',
  });
  
  // Resizing state
  const [leftPanelWidth, setLeftPanelWidth] = useState(33); // 33% initially
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [chatInput]);
  
  // Initialize services
  const ollamaService = new OllamaService(ollamaSettingsStore.getConnection());
  const openAIService = new OpenAIService(
    apiConfig.openai_base_url,
    apiConfig.openai_api_key
  );
  
  // Code editors content
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <title>Clara Apps</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>
<body class="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
  <!-- Navbar -->
  <nav class="bg-white shadow-md py-4 px-8 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <i class="fa-solid fa-cube text-purple-500 text-2xl"></i>
      <span class="font-bold text-xl text-gray-800">Clara Apps</span>
    </div>
    <ul class="flex gap-6 text-gray-600 font-medium">
      <li><a href="#features" class="hover:text-purple-500 transition">Features</a></li>
      <li><a href="#form" class="hover:text-purple-500 transition">Contact</a></li>
      <li><a href="#" class="hover:text-purple-500 transition">About</a></li>
    </ul>
  </nav>

  <!-- Hero Section -->
  <section class="py-16 px-4 text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Create Anything with Clara Apps</h1>
    <p class="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">Unleash your creativity: build custom chat apps, connect to your n8n workflows, integrate with Ollama for AI, and design beautiful single-page sites—all in one place. Clara Apps empowers you to turn your ideas into reality, no limits.</p>
    <div class="flex flex-wrap justify-center gap-3 mb-8">
      <span class="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"><i class="fa-solid fa-plug mr-2"></i>Connect Workflows</span>
      <span class="inline-flex items-center bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold"><i class="fa-solid fa-robot mr-2"></i>Ollama AI</span>
      <span class="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"><i class="fa-solid fa-comments mr-2"></i>Chat Apps</span>
      <span class="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"><i class="fa-solid fa-wand-magic-sparkles mr-2"></i>Anything You Imagine</span>
    </div>
    <a href="#features" class="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition">Get Started</a>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-12 px-4 max-w-5xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">What Can You Build?</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <i class="fa-solid fa-plug text-3xl text-purple-500 mb-4"></i>
        <h3 class="font-semibold text-lg mb-2">Connect n8n Workflows</h3>
        <p class="text-gray-500 text-center">Integrate your automations and trigger actions directly from your custom UI.</p>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <i class="fa-solid fa-robot text-3xl text-pink-500 mb-4"></i>
        <h3 class="font-semibold text-lg mb-2">Ollama AI Integration</h3>
        <p class="text-gray-500 text-center">Leverage local AI models for chat, content generation, and more—right in your app.</p>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <i class="fa-solid fa-comments text-3xl text-blue-500 mb-4"></i>
        <h3 class="font-semibold text-lg mb-2">Build Chat Apps</h3>
        <p class="text-gray-500 text-center">Create your own chatbots, assistants, or collaborative chat experiences with ease.</p>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <i class="fa-solid fa-wand-magic-sparkles text-3xl text-green-500 mb-4"></i>
        <h3 class="font-semibold text-lg mb-2">Design Anything</h3>
        <p class="text-gray-500 text-center">Mix and match cards, forms, navbars, and more to build any single-page site you can imagine.</p>
      </div>
    </div>
    <div class="mt-10 text-center">
      <span class="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold text-lg shadow-lg">Your ideas. Your workflows. Your AI. <span class="font-bold">No limits.</span></span>
    </div>
  </section>

  <!-- Form Section -->
  <section id="form" class="py-12 px-4 max-w-xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Contact Us</h2>
    <form class="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4">
      <div>
        <label class="block text-gray-700 mb-1" for="name">Name</label>
        <input class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" type="text" id="name" placeholder="Your Name" />
      </div>
      <div>
        <label class="block text-gray-700 mb-1" for="email">Email</label>
        <input class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400" type="email" id="email" placeholder="you@email.com" />
      </div>
      <div>
        <label class="block text-gray-700 mb-1" for="message">Message</label>
        <textarea class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" id="message" rows="3" placeholder="How can we help?"></textarea>
      </div>
      <button type="submit" class="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition">Send <i class="fa-solid fa-paper-plane ml-2"></i></button>
    </form>
  </section>

  <!-- Footer -->
  <footer class="py-6 text-center text-gray-400 text-sm">
    <span>&copy; 2024 Clara Apps. All rights reserved.</span>
  </footer>
</body>
</html>`);

  const [cssCode, setCssCode] = useState(`/* Custom animations and styles for Clara Apps example */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.fa-cube, .fa-bolt, .fa-layer-group, .fa-wand-magic-sparkles {
  animation: float 3s ease-in-out infinite;
}

/* Add your custom styles here */

/* Example: Card hover effect */
.bg-white.rounded-2xl.shadow-lg:hover {
  box-shadow: 0 8px 32px 0 rgba(236, 72, 153, 0.15), 0 1.5px 4px 0 rgba(139, 92, 246, 0.10);
  transform: translateY(-4px) scale(1.03);
  transition: all 0.2s;
}

/* Example: Button focus ring */
button:focus {
  outline: 2px solid #a78bfa;
  outline-offset: 2px;
}`);

  const [jsCode, setJsCode] = useState(`document.addEventListener('DOMContentLoaded', function() {
  // Example: Animate nav links on click
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      this.classList.add('scale-110');
      setTimeout(() => this.classList.remove('scale-110'), 200);
    });
  });

  // Example: Form submit handler
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for contacting Clara Apps!');
      form.reset();
    });
  }
});`);

  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'preview'>('html');
  const [previewError, setPreviewError] = useState<{message: string; line: number; column: number} | null>(null);

  // Load API config and models when component mounts
  useEffect(() => {
    const loadApiConfig = async () => {
      const config = await db.getAPIConfig();
      if (config) {
        setApiConfig({
          ollama_base_url: config.ollama_base_url || '',
          openai_api_key: config.openai_api_key || '',
          openai_base_url: config.openai_base_url || 'https://api.openai.com/v1',
        });
        
        // Set the default API type based on stored config
        if (config.api_type === 'openai' || config.api_type === 'ollama') {
          setApiType(config.api_type);
        }
        
        // Update OpenAI service with the loaded config
        openAIService.setBaseUrl(config.openai_base_url || 'https://api.openai.com/v1');
        openAIService.setApiKey(config.openai_api_key || '');
        
        // Update Ollama settings store with the loaded config
        if (config.ollama_base_url) {
          try {
            // Just use the full URL as-is
            ollamaSettingsStore.updateConnection({
              host: config.ollama_base_url,
              port: 11434, // This will be ignored if host is a full URL
              secure: config.ollama_base_url.startsWith('https://')
            });
            
            console.log(`Updated Ollama connection to URL: ${config.ollama_base_url}`);
          } catch (err) {
            console.error('Failed to update Ollama connection:', err);
          }
        }
      }
    };

    loadApiConfig();
  }, []);

  // Load previously selected models from localStorage
  useEffect(() => {
    // Load Ollama model
    const savedOllamaModel = localStorage.getItem('ollama_ui_builder_selected_model');
    if (savedOllamaModel) {
      try {
        setSelectedOllamaModel(JSON.parse(savedOllamaModel));
      } catch (e) {
        console.warn('Failed to parse saved Ollama model', e);
      }
    }
    
    // Load OpenAI model
    const savedOpenAIModel = localStorage.getItem('openai_ui_builder_selected_model');
    if (savedOpenAIModel) {
      try {
        setSelectedOpenAIModel(JSON.parse(savedOpenAIModel));
      } catch (e) {
        console.warn('Failed to parse saved OpenAI model', e);
      }
    } else {
      // Set a default OpenAI model if none was previously selected
      const defaultModel: OpenAIModel = {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        maxTokens: 16000,
        category: 'gpt',
        contextWindow: 16000
      };
      setSelectedOpenAIModel(defaultModel);
      localStorage.setItem('openai_ui_builder_selected_model', JSON.stringify(defaultModel));
    }
  }, []);

  // Add new state for current design
  const [currentDesign, setCurrentDesign] = useState<UIBuilderDesign | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [isTargetedEdit, setIsTargetedEdit] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string; visible: boolean }>({ message: '', type: '', visible: false });

  // Load last active design on mount
  useEffect(() => {
    const loadLastDesign = async () => {
      try {
        // First check if we have a specific project ID in localStorage (set from the Apps page)
        const savedProjectId = localStorage.getItem('current_ui_project');
        
        if (savedProjectId) {
          // Load the specific project
          const project = await uiBuilderService.getProjectById(savedProjectId);
          
          if (project) {
            // Convert UIBuilderProject to UIBuilderDesign
            const designFromProject: UIBuilderDesign = {
              id: project.id,
              name: project.name,
              description: project.description,
              htmlCode: project.htmlCode,
              cssCode: project.cssCode,
              jsCode: project.jsCode,
              messages: project.messages,
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
              version: project.version
            };
            
            setCurrentDesign(designFromProject);
            setHtmlCode(project.htmlCode);
            setCssCode(project.cssCode);
            setJsCode(project.jsCode);
            setMessages(project.messages);
            
            // Clear the localStorage item if we're in "create new" mode
            if (localStorage.getItem('create_new_ui_project') === 'true') {
              localStorage.removeItem('create_new_ui_project');
              handleNewProject();
            }
            
            return;
          }
        }
        
        // Fallback: load most recent project from the database
        const designs = await db.getAllDesigns();
        if (designs && designs.length > 0) {
          // Get the most recently updated design
          const lastDesign = designs.sort((a: UIBuilderDesign, b: UIBuilderDesign) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          
          setCurrentDesign(lastDesign);
          setHtmlCode(lastDesign.htmlCode);
          setCssCode(lastDesign.cssCode);
          setJsCode(lastDesign.jsCode);
          setMessages(lastDesign.messages);
        }
      } catch (error) {
        console.error('Failed to load design:', error);
      }
    };

    loadLastDesign();
    
    // Clean up function to clear localStorage when component unmounts
    return () => {
      localStorage.removeItem('current_ui_project');
    };
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!currentDesign) return;

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const updatedDesign: UIBuilderDesign = {
          ...currentDesign,
          htmlCode,
          cssCode,
          jsCode,
          messages,
          updatedAt: new Date().toISOString(),
          version: currentDesign.version + 1
        };

        await db.updateDesign(updatedDesign);
        setCurrentDesign(updatedDesign);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');
      }
    }, 3000); // Auto-save after 3 seconds of no changes

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [htmlCode, cssCode, jsCode, messages, currentDesign]);

  // Save current design
  const saveDesign = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      let designToSave: UIBuilderDesign;
      
      // Check for project ID from localStorage
      const currentProjectId = localStorage.getItem('current_ui_project');
      
      if (currentDesign) {
        // Update existing design
        designToSave = {
          ...currentDesign,
          htmlCode,
          cssCode,
          jsCode,
          messages,
          updatedAt: new Date().toISOString(),
          version: currentDesign.version + 1
        };
      } else if (currentProjectId) {
        // If we have a current project ID but no design loaded, try to load it first
        try {
          const project = await uiBuilderService.getProjectById(currentProjectId);
          if (project) {
            designToSave = {
              id: project.id,
              name: project.name,
              description: project.description || '',
              htmlCode,
              cssCode,
              jsCode,
              messages,
              createdAt: project.createdAt,
              updatedAt: new Date().toISOString(),
              version: project.version + 1
            };
          } else {
            // Project not found, create new
            designToSave = {
              id: uuidv4(),
              name: 'Untitled Design',
              htmlCode,
              cssCode,
              jsCode,
              messages,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1
            };
          }
        } catch (err) {
          console.error('Failed to load existing project:', err);
          // Create new if loading fails
          designToSave = {
            id: uuidv4(),
            name: 'Untitled Design',
            htmlCode,
            cssCode,
            jsCode,
            messages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1
          };
        }
      } else {
        // Create new design
        designToSave = {
          id: uuidv4(),
          name: 'Untitled Design',
          htmlCode,
          cssCode,
          jsCode,
          messages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1
        };
      }

      // Update the local design state
      await db.updateDesign(designToSave);
      setCurrentDesign(designToSave);
      
      // Also update the UIBuilderProject in the service if this is a project
      if (currentProjectId || (currentDesign && currentDesign.id)) {
        const projectId = currentProjectId || (currentDesign?.id || '');
        if (projectId) {
          // Check if project exists
          const existingProject = await uiBuilderService.getProjectById(projectId);
          
          if (existingProject) {
            // Update existing project
            await uiBuilderService.updateProject({
              ...existingProject,
              htmlCode,
              cssCode,
              jsCode,
              messages,
              updatedAt: new Date().toISOString(),
              version: existingProject.version + 1
            });
          } else if (designToSave) {
            // Create new project from design - fix the createProject parameters
            await uiBuilderService.createProject({
              name: designToSave.name,
              description: designToSave.description || '',
              htmlCode: designToSave.htmlCode,
              cssCode: designToSave.cssCode,
              jsCode: designToSave.jsCode,
              messages: designToSave.messages,
              isArchived: false,
              isDeleted: false,
              tags: [],
              category: 'ui',
              isPublic: false
            });
            // Save project ID to localStorage
            localStorage.setItem('current_ui_project', designToSave.id);
          }
        }
      }
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save design:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Update preview function simplified
  const updatePreview = useCallback(() => {
    // Preview is now handled directly by PreviewPanel
    // No need for postMessage communication
  }, [htmlCode, cssCode, jsCode]);

  // Update preview when code changes
  useEffect(() => {
    if (activeTab === 'preview') {
      // Add a small delay to ensure components are ready
      const timeoutId = setTimeout(() => {
        updatePreview();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, updatePreview]);

  // Handle horizontal resize start
  const startHorizontalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingHorizontal(true);
  };

  // Handle resize dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingHorizontal && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftPanelWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        // Constrain to reasonable limits (15% to 85%)
        if (newLeftPanelWidth >= 15 && newLeftPanelWidth <= 85) {
          setLeftPanelWidth(newLeftPanelWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingHorizontal(false);
    };

    if (isResizingHorizontal) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingHorizontal]);

  // Helper function to get system prompt based on mode and purpose
  const getSystemPrompt = (mode: 'chat' | 'design', purpose: 'generate' | 'enhance' = 'generate') => {
    if (isTargetedEdit && mode === 'design') {
      return `You are a code editing assistant. You will be given the full HTML, CSS, and JS code of a project, and a user request for a change. Your job is to return ONLY a JSON object with the following structure:
{
  "target": "html" | "css" | "js",
  "find": "<the exact code to be replaced>",
  "replace": "<the new code to insert instead>"
}
- The 'find' string MUST match exactly and uniquely in the code. Use enough context (e.g., full lines, surrounding code) to ensure a unique match.
- The 'replace' string should be a valid code fragment that will replace 'find'.
- DO NOT return the whole file, only the minimal code to be replaced and the replacement.
- Avoid ambiguous or partial matches. If you cannot find a unique match, return a JSON with an 'error' field, e.g. { "error": "No unique match found" }.
- Your response must be a single JSON object, no extra text or explanation.
- This is for a local LLM, so keep your response simple, robust, and clear.`;
    }
    if (purpose === 'enhance') {
      return `You are an expert UI/UX prompt engineer. Your task is to enhance and expand the user's input to create a more detailed and specific prompt that will lead to better UI generation results.

Key aspects to consider and include in the enhanced prompt:
1. Visual Design:
   - Layout structure and hierarchy
   - Color scheme and consistency
   - Typography choices and scale
   - Spacing and alignment
   - Visual elements (shadows, gradients, borders)

2. Functionality:
   - Interactive elements
   - Animations and transitions
   - User feedback mechanisms
   - Responsive behavior

3. User Experience:
   - Accessibility considerations
   - Mobile responsiveness
   - Loading states
   - Error handling
   - User feedback

4. Technical Specifications:
   - Specific Tailwind classes
   - Custom animations
   - JavaScript interactions
   - Performance optimizations

Format the enhanced prompt to be clear and structured, but maintain a natural language flow. Focus on the user's original intent while adding necessary technical and design details.

Original prompt: {input}

Respond with a single enhanced prompt that expands on the user's request while maintaining their core intention. Keep the tone friendly and conversational while being technically precise.`;
    }
    
    // For design mode, system prompt should focus on rules and context only
    return mode === 'design' ? `You are a UI design assistant specializing in modern web development. You help create and modify HTML, CSS, and JavaScript code based on user requests.\n\nAvailable Frameworks and Libraries:\n1. CSS Frameworks:\n   - Tailwind CSS (v3) - Primary framework, prefer using Tailwind utility classes\n   - Font Awesome (v6) - For icons, use 'fas', 'far', 'fab' classes\n   - Custom CSS - For animations and custom styles not possible with Tailwind\n\n2. JavaScript Capabilities:\n   - Vanilla JavaScript with modern ES6+ features\n   - DOM manipulation and event handling\n   - Animations and transitions\n   - Async/await and Promises\n\nBest Practices to Follow:\n1. HTML Structure:\n   - Use semantic HTML5 elements (nav, header, main, footer, etc.)\n   - Maintain proper heading hierarchy (h1 -> h6)\n   - Include proper meta tags and viewport settings\n   - Use aria-labels and roles for accessibility\n\n2. Tailwind CSS Usage:\n   - Prefer Tailwind utility classes over custom CSS\n   - Use @apply in custom CSS only when necessary\n   - Follow mobile-first responsive design:\n     * Default: Mobile (<640px)\n     * sm: 640px and up\n     * md: 768px and up\n     * lg: 1024px and up\n     * xl: 1280px and up\n   - Use Tailwind's color palette (e.g., blue-500, gray-700)\n   - Utilize Tailwind's built-in animations and transitions\n\n3. JavaScript Guidelines:\n   - Use 'DOMContentLoaded' event listener\n   - Implement proper event delegation\n   - Handle errors gracefully\n   - Clean up event listeners and intervals\n   - Use const/let appropriately\n   - Implement smooth animations\n\n4. Common Components to Consider:\n   - Navigation bars\n   - Hero sections\n   - Cards and grids\n   - Forms and inputs\n   - Modals and dialogs\n   - Buttons and CTAs\n   - Lists and tables\n   - Footers\n\n5. Performance Considerations:\n   - Minimize DOM manipulations\n   - Use CSS transforms for animations\n   - Debounce event handlers when needed\n   - Optimize images and assets\n   - Use proper loading strategies\n\nAlways respond with valid JSON in the following format:\n{\n  "html": "...",\n  "css": "...",\n  "js": "..."\n}`
    : "You are Clara, a helpful and knowledgeable AI assistant. Provide clear, concise, and accurate responses to the user's questions.";
  };

  // Helper function to build the design mode prompt
  const buildDesignPrompt = (userPrompt: string, htmlCode: string, cssCode: string, jsCode: string, messages: Message[]) => {
    if (isTargetedEdit) {
      return `You are given the following code:
HTML:\n${htmlCode}\n\nCSS:\n${cssCode}\n\nJS:\n${jsCode}\n\nThe user wants to make this change: ${userPrompt}

Reply ONLY with a JSON object like this:
{
  "target": "html" | "css" | "js",
  "find": "<the exact code to be replaced>",
  "replace": "<the new code to insert instead>"
}
- The 'find' string MUST match exactly and uniquely in the code. Use enough context (e.g., full lines, surrounding code) to ensure a unique match.
- The 'replace' string should be a valid code fragment that will replace 'find'.
- DO NOT return the whole file, only the minimal code to be replaced and the replacement.
- Avoid ambiguous or partial matches. If you cannot find a unique match, return a JSON with an 'error' field, e.g. { "error": "No unique match found" }.
- Your response must be a single JSON object, no extra text or explanation.
- This is for a local LLM, so keep your response simple, robust, and clear.`;
    }
    // Optionally, you can include the previous design as JSON or as a chat history
    const designJson = JSON.stringify({ html: htmlCode, css: cssCode, js: jsCode }, null, 2);
    // Optionally, include chat history if needed (not included here for brevity)
    return `Previous design (JSON):\n${designJson}\n\nHere is what you have to do to the above code:\n${userPrompt}`;
  };

  // Add state for live streaming stats
  const [streamStats, setStreamStats] = useState<{ charCount: number; lineCount: number }>({ charCount: 0, lineCount: 0 });

  // Add state for processing status
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to simulate progress during processing
  const simulateProgress = () => {
    setProcessingProgress(0);
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Start a new interval to increment the progress
    progressIntervalRef.current = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 95) {
          // Max out at 95% until we get real data
          return 95;
        }
        // Move faster at first, then slower as we approach 95%
        const increment = Math.max(0.5, (95 - prev) / 20);
        return prev + increment;
      });
    }, 100); // Update every 100ms
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Generate completion for chat or design mode
  const generateCompletion = async () => {
    const hasModel = apiType === 'ollama' ? selectedOllamaModel : selectedOpenAIModel;
    if (!hasModel || !chatInput.trim() || isGenerating) return;
    
    // Immediately show processing state
    setIsProcessing(true);
    simulateProgress();
    
    // Add user message to the chat
    setMessages(prev => [...prev, { content: chatInput, sender: 'user' }]);
    setIsGenerating(true);
    setStreamStats({ charCount: 0, lineCount: 0 });

    try {
      let systemPrompt = '';
      let prompt = chatInput;

      if (chatMode === 'design') {
        // Design mode - provide the current HTML, CSS, and JS as context in the prompt
        systemPrompt = getSystemPrompt(chatMode);
        prompt = buildDesignPrompt(chatInput, htmlCode, cssCode, jsCode, messages);
      } else {
        // Normal chat mode
        systemPrompt = getSystemPrompt(chatMode);
      }
      
      let aiResponseContent = '';
      
      // Generate the response based on selected API type
      if (apiType === 'ollama' && selectedOllamaModel) {
        // Use Ollama service
        await ollamaService.generateCompletionStream(
          {
            model: selectedOllamaModel.name,
            prompt,
            system: systemPrompt,
            options: {
              temperature: 0.7,
            },
            format: chatMode === 'design' ? 'json' : undefined,
          },
          (chunk) => {
            // Accumulate the response
            aiResponseContent += chunk.response;
            
            // Update message in UI
            updateAIMessage(aiResponseContent);
          },
          () => finalizeResponse(aiResponseContent),
          (error) => handleGenerationError(error)
        );
      } else if (apiType === 'openai' && selectedOpenAIModel) {
        // Use OpenAI service
        if (!apiConfig.openai_api_key) {
          setIsGenerating(false);
          setIsProcessing(false);
          setMessages(prev => [
            ...prev,
            { content: "Error: OpenAI API key is not configured. Please set it in Settings.", sender: 'ai' }
          ]);
          return;
        }
        
        // Configure OpenAI service with current settings
        openAIService.setApiKey(apiConfig.openai_api_key);
        openAIService.setBaseUrl(apiConfig.openai_base_url || 'https://api.openai.com/v1');
        
        // Prepare messages for OpenAI format
        const openaiMessages = [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: prompt }
        ];
        
        await openAIService.generateCompletionStream(
          {
            model: selectedOpenAIModel.id,
            messages: openaiMessages,
            temperature: 0.7,
            stream: true,
            response_format: chatMode === 'design' ? { type: 'json_object' } : undefined,
          },
          (chunk) => {
            // Accumulate the response
            aiResponseContent += chunk.response;
            
            // Update message in UI
            updateAIMessage(aiResponseContent);
          },
          () => finalizeResponse(aiResponseContent),
          (error) => handleGenerationError(error)
        );
      }
    } catch (error) {
      console.error('Failed to generate completion:', error);
      setIsGenerating(false);
      setIsProcessing(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setMessages(prev => [
        ...prev, 
        { content: `Error: ${error instanceof Error ? error.message : 'An error occurred.'}`, sender: 'ai' }
      ]);
    }
    
    setChatInput('');
  };

  // Helper function to update AI message as streaming progresses
  const updateAIMessage = (content: string) => {
    // Once streaming starts, we have real data, so progress to 100%
    if (content.length > 0 && processingProgress < 100) {
      setProcessingProgress(100);
      // We keep isProcessing true until finalizeResponse
    }
    
    setMessages(prev => {
      // Check if we already have an AI message that we need to update
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.sender === 'ai') {
        // Update the last message
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: content,
        };
        return updatedMessages;
      } else {
        // Add a new AI message
        return [...prev, { content: content, sender: 'ai' }];
      }
    });
    
    // Update streaming stats with each new chunk
    const lineCount = content.split('\n').length;
    setStreamStats({ 
      charCount: content.length, 
      lineCount: lineCount 
    });
  };

  // Helper function to finalize response handling
  const finalizeResponse = (content: string) => {
    setIsGenerating(false);
    setIsProcessing(false);
    setStreamStats({ charCount: 0, lineCount: 0 });
    // Clear any progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    // Targeted Edit Mode
    if (isTargetedEdit && chatMode === 'design') {
      let status: 'success' | 'fail' = 'fail';
      let responseJson: any = null;
      try {
        responseJson = JSON.parse(content);
        if (responseJson && responseJson.target && responseJson.find !== undefined && responseJson.replace !== undefined) {
          if (responseJson.target === 'html') {
            const prev = htmlCode;
            if (prev.includes(responseJson.find)) {
              const next = prev.replace(responseJson.find, responseJson.replace);
              setHtmlCode(next);
              status = 'success';
              updatePreview();
            }
          } else if (responseJson.target === 'css') {
            const prev = cssCode;
            if (prev.includes(responseJson.find)) {
              const next = prev.replace(responseJson.find, responseJson.replace);
              setCssCode(next);
              status = 'success';
              updatePreview();
            }
          } else if (responseJson.target === 'js') {
            const prev = jsCode;
            if (prev.includes(responseJson.find)) {
              const next = prev.replace(responseJson.find, responseJson.replace);
              setJsCode(next);
              status = 'success';
              updatePreview();
            }
          }
        }
      } catch (error) {
        // Parsing failed, status remains 'fail'
      }
      // Always show the AI response in chat, with status
      setMessages((prev) => [
        ...prev,
        { content, sender: 'ai', status }
      ]);
      return;
    }
    
    // If in design mode, try to parse the JSON response and update the code
    if (chatMode === 'design') {
      try {
        const responseJson = JSON.parse(content);
        if (responseJson.html) setHtmlCode(responseJson.html);
        if (responseJson.css) setCssCode(responseJson.css);
        if (responseJson.js) setJsCode(responseJson.js);
        
        // Update the preview
        updatePreview();
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
        // Append an error message
        setMessages(prev => [
          ...prev, 
          { content: "Sorry, I couldn't parse the response as valid JSON to update the code.", sender: 'ai' }
        ]);
      }
    }
  };

  // Helper function to handle generation errors
  const handleGenerationError = (error: Error) => {
    console.error('Generation error:', error);
    setIsGenerating(false);
    setIsProcessing(false);
    setMessages(prev => [
      ...prev, 
      { content: `Error: ${error.message || 'An error occurred while generating the response.'}`, sender: 'ai' }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateCompletion();
    }
  };

  const handleExportSuccess = (projectId: string) => {
    console.log('Project exported successfully with ID:', projectId);
    
    // Optionally, you could reset the form or show a success notification
    // For now, we'll just close the modal
    
    // You could also navigate to a project details page if you have one
    // onPageChange('project-details?id=' + projectId);
  };

  const handleSelectProject = async (project: UIBuilderProject) => {
    try {
      // First, save the current project if any
      if (currentDesign) {
        await saveDesign();
      }
      
      // Then load the selected project
      setHtmlCode(project.htmlCode);
      setCssCode(project.cssCode);
      setJsCode(project.jsCode);
      setMessages(project.messages);
      
      // Convert UIBuilderProject to UIBuilderDesign
      const designFromProject: UIBuilderDesign = {
        id: project.id,
        name: project.name,
        description: project.description || '',
        htmlCode: project.htmlCode,
        cssCode: project.cssCode,
        jsCode: project.jsCode,
        messages: project.messages,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        version: project.version
      };
      
      setCurrentDesign(designFromProject);
      
      // Save current project ID to localStorage
      localStorage.setItem('current_ui_project', project.id);
      
      setShowProjectManager(false);
      
      // Update the preview
      setActiveTab('preview');
      setTimeout(() => {
        updatePreview();
      }, 100);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const handleOllamaModelSelect = (model: OllamaModel) => {
    setSelectedOllamaModel(model);
    // Save to localStorage for persistence
    localStorage.setItem('ollama_ui_builder_selected_model', JSON.stringify(model));
  };

  const handleOpenAIModelSelect = (model: OpenAIModel) => {
    setSelectedOpenAIModel(model);
    // Save to localStorage for persistence
    localStorage.setItem('openai_ui_builder_selected_model', JSON.stringify(model));
  };

  const handleApiTypeChange = async (type: 'ollama' | 'openai' | 'litellm') => {
    console.log('UIBuilder: Changing API type to:', type);
    setApiType(type);
    
    try {
      // Save the API type preference to the database
      const config = await db.getAPIConfig();
      console.log('UIBuilder: Current config:', config);
      if (config) {
        await db.updateAPIConfig({
          ...config,
          api_type: type
        });
        console.log('UIBuilder: Updated config with new API type');
        
        // Update the OpenAI and Ollama service instances with current config
        if (type === 'openai' && config.openai_base_url) {
          openAIService.setBaseUrl(config.openai_base_url);
          openAIService.setApiKey(config.openai_api_key || '');
          console.log('UIBuilder: Updated OpenAI service with URL:', config.openai_base_url);
        } else if (type === 'ollama' && config.ollama_base_url) {
          try {
            // Just use the full URL as-is
            ollamaSettingsStore.updateConnection({
              host: config.ollama_base_url,
              port: 11434, // This will be ignored if host is a full URL
              secure: config.ollama_base_url.startsWith('https://')
            });
            
            console.log(`UIBuilder: Updated Ollama connection to URL: ${config.ollama_base_url}`);
          } catch (err) {
            console.error('Failed to update Ollama connection:', err);
          }
        }
      }

      // Reset selected model when switching API types
      if (type === 'ollama') {
        // Load saved Ollama model or set to null
        const savedOllamaModel = localStorage.getItem('ollama_ui_builder_selected_model');
        console.log('UIBuilder: Loading saved Ollama model:', savedOllamaModel);
        if (savedOllamaModel) {
          try {
            setSelectedOllamaModel(JSON.parse(savedOllamaModel));
          } catch (e) {
            console.warn('Failed to parse saved Ollama model', e);
            setSelectedOllamaModel(null);
          }
        } else {
          setSelectedOllamaModel(null);
        }
        setSelectedOpenAIModel(null);
      } else {
        // Load saved OpenAI model or set default
        const savedOpenAIModel = localStorage.getItem('openai_ui_builder_selected_model');
        console.log('UIBuilder: Loading saved OpenAI model:', savedOpenAIModel);
        if (savedOpenAIModel) {
          try {
            setSelectedOpenAIModel(JSON.parse(savedOpenAIModel));
          } catch (e) {
            console.warn('Failed to parse saved OpenAI model', e);
            // Set default OpenAI model
            const defaultModel: OpenAIModel = {
              id: 'gpt-3.5-turbo',
              name: 'GPT-3.5 Turbo',
              maxTokens: 16000,
              category: 'gpt',
              contextWindow: 16000
            };
            setSelectedOpenAIModel(defaultModel);
            localStorage.setItem('openai_ui_builder_selected_model', JSON.stringify(defaultModel));
          }
        } else {
          // Set default OpenAI model
          const defaultModel: OpenAIModel = {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            maxTokens: 16000,
            category: 'gpt',
            contextWindow: 16000
          };
          setSelectedOpenAIModel(defaultModel);
          localStorage.setItem('openai_ui_builder_selected_model', JSON.stringify(defaultModel));
        }
        setSelectedOllamaModel(null);
      }
    } catch (error) {
      console.error('Failed to update API type:', error);
    }
  };

  // Add enhance prompt function
  const enhancePrompt = async () => {
    if (!chatInput.trim() || isEnhancing || isGenerating || isProcessing) return;
    
    setIsEnhancing(true);
    try {
      const hasModel = apiType === 'ollama' ? selectedOllamaModel : selectedOpenAIModel;
      if (!hasModel) return;

      let enhancedPrompt = '';
      
      if (apiType === 'ollama' && selectedOllamaModel) {
        await ollamaService.generateCompletionStream(
          {
            model: selectedOllamaModel.name,
            prompt: chatInput,
            system: getSystemPrompt(chatMode, 'enhance'),
            options: {
              temperature: 0.7,
            }
          },
          (chunk) => {
            enhancedPrompt += chunk.response;
          },
          () => {}, // onComplete callback
          (error) => console.error('Error enhancing prompt:', error) // onError callback
        );
      } else if (apiType === 'openai' && selectedOpenAIModel) {
        if (!apiConfig.openai_api_key) {
          throw new Error("OpenAI API key is not configured");
        }
        
        const messages = [
          { role: 'system' as const, content: getSystemPrompt(chatMode, 'enhance') },
          { role: 'user' as const, content: chatInput }
        ];
        
        await openAIService.generateCompletionStream(
          {
            model: selectedOpenAIModel.id,
            messages: messages,
            temperature: 0.7,
            stream: true,
          },
          (chunk) => {
            enhancedPrompt += chunk.response;
          },
          () => {}, // onComplete callback
          (error) => console.error('Error enhancing prompt:', error) // onError callback
        );
      }

      setChatInput(enhancedPrompt.trim());
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Function to reset the UI Builder to a new project
  const handleNewProject = () => {
    // Default HTML template
    const defaultHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Clara Apps</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>
<body class="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
  <!-- Navbar -->
  <nav class="bg-white shadow-md py-4 px-8 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <i class="fa-solid fa-cube text-purple-500 text-2xl"></i>
      <span class="font-bold text-xl text-gray-800">Clara Apps</span>
    </div>
    <ul class="flex gap-6 text-gray-600 font-medium">
      <li><a href="#features" class="hover:text-purple-500 transition">Features</a></li>
      <li><a href="#form" class="hover:text-purple-500 transition">Contact</a></li>
      <li><a href="#" class="hover:text-purple-500 transition">About</a></li>
    </ul>
  </nav>

  <!-- Hero Section -->
  <section class="py-16 px-4 text-center">
    <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Create Anything with Clara Apps</h1>
    <p class="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">Unleash your creativity: build custom chat apps, connect to your n8n workflows, integrate with Ollama for AI, and design beautiful single-page sites—all in one place. Clara Apps empowers you to turn your ideas into reality, no limits.</p>
    <div class="flex flex-wrap justify-center gap-3 mb-8">
      <span class="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"><i class="fa-solid fa-plug mr-2"></i>Connect Workflows</span>
      <span class="inline-flex items-center bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold"><i class="fa-solid fa-robot mr-2"></i>Ollama AI</span>
      <span class="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"><i class="fa-solid fa-comments mr-2"></i>Chat Apps</span>
      <span class="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"><i class="fa-solid fa-wand-magic-sparkles mr-2"></i>Anything You Imagine</span>
    </div>
    <a href="#features" class="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition">Get Started</a>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-12 px-4 max-w-5xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">What Can You Build?</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <i class="fa-solid fa-plug text-3xl text-purple-500 mb-4"></i>
        <h3 class="font-semibold text-lg mb-2">Connect n8n Workflows</h3>
        <p class="text-gray-500 text-center">Integrate your automations and trigger actions directly from your custom UI.</p>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <i class="fa-solid fa-robot text-3xl text-pink-500 mb-4"></i>
        <h3 class="font-semibold text-lg mb-2">Ollama AI Integration</h3>
        <p class="text-gray-500 text-center">Leverage local AI models for chat, content generation, and more—right in your app.</p>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <i class="fa-solid fa-comments text-3xl text-blue-500 mb-4"></i>
        <h3 class="font-semibold text-lg mb-2">Build Chat Apps</h3>
        <p class="text-gray-500 text-center">Create your own chatbots, assistants, or collaborative chat experiences with ease.</p>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <i class="fa-solid fa-wand-magic-sparkles text-3xl text-green-500 mb-4"></i>
        <h3 class="font-semibold text-lg mb-2">Design Anything</h3>
        <p class="text-gray-500 text-center">Mix and match cards, forms, navbars, and more to build any single-page site you can imagine.</p>
      </div>
    </div>
    <div class="mt-10 text-center">
      <span class="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold text-lg shadow-lg">Your ideas. Your workflows. Your AI. <span class="font-bold">No limits.</span></span>
    </div>
  </section>

  <!-- Form Section -->
  <section id="form" class="py-12 px-4 max-w-xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Contact Us</h2>
    <form class="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4">
      <div>
        <label class="block text-gray-700 mb-1" for="name">Name</label>
        <input class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" type="text" id="name" placeholder="Your Name" />
      </div>
      <div>
        <label class="block text-gray-700 mb-1" for="email">Email</label>
        <input class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400" type="email" id="email" placeholder="you@email.com" />
      </div>
      <div>
        <label class="block text-gray-700 mb-1" for="message">Message</label>
        <textarea class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" id="message" rows="3" placeholder="How can we help?"></textarea>
      </div>
      <button type="submit" class="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition">Send <i class="fa-solid fa-paper-plane ml-2"></i></button>
    </form>
  </section>

  <!-- Footer -->
  <footer class="py-6 text-center text-gray-400 text-sm">
    <span>&copy; 2024 Clara Apps. All rights reserved.</span>
  </footer>
</body>
</html>`;

    // Default CSS template
    const defaultCssTemplate = `/* Custom animations and styles for Clara Apps example */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.fa-cube, .fa-bolt, .fa-layer-group, .fa-wand-magic-sparkles {
  animation: float 3s ease-in-out infinite;
}

/* Add your custom styles here */

/* Example: Card hover effect */
.bg-white.rounded-2xl.shadow-lg:hover {
  box-shadow: 0 8px 32px 0 rgba(236, 72, 153, 0.15), 0 1.5px 4px 0 rgba(139, 92, 246, 0.10);
  transform: translateY(-4px) scale(1.03);
  transition: all 0.2s;
}

/* Example: Button focus ring */
button:focus {
  outline: 2px solid #a78bfa;
  outline-offset: 2px;
}`;

    // Default JS template
    const defaultJsTemplate = `document.addEventListener('DOMContentLoaded', function() {
  // Example: Animate nav links on click
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      this.classList.add('scale-110');
      setTimeout(() => this.classList.remove('scale-110'), 200);
    });
  });

  // Example: Form submit handler
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for contacting Clara Apps!');
      form.reset();
    });
  }
});`;

    // Reset the state
    setHtmlCode(defaultHtmlTemplate);
    setCssCode(defaultCssTemplate);
    setJsCode(defaultJsTemplate);
    setMessages([]);
    setCurrentDesign(null);
    
    // Update the preview
    setActiveTab('preview');
    setTimeout(() => {
      updatePreview();
    }, 100);
  };

  // Add an auto-save effect
  useEffect(() => {
    const autoSaveChanges = () => {
      // Check if we have a current design or current project ID
      const shouldSave = currentDesign || localStorage.getItem('current_ui_project');
      if (shouldSave) {
        saveDesign();
      }
    };
    
    // Set up auto-save with debounce
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveChanges();
    }, 3000); // Auto-save after 3 seconds of inactivity
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [htmlCode, cssCode, jsCode]); // Add only code changes as dependencies

  // Find the index of the last AI message in the full messages array
  const lastStreamingMessageIndex = messages.length - 1;

  // Add dark mode toggle functionality
  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else if (theme === 'system') setTheme('dark');
  };

  return (
    <div className={`flex h-screen flex-col`}>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage="uibuilder" onPageChange={onPageChange || (() => {})} />
        <div className="flex flex-1 flex-col">
          <Topbar 
            userName="User"
            onPageChange={onPageChange}
            isDarkMode={isDark}
            onToggleDarkMode={toggleTheme}
          />
          
          <div className="dark:bg-neutral-950 flex flex-1 flex-col overflow-hidden bg-neutral-50">
            {/* Dark mode toggle */}
            <div className="absolute top-20 right-4 z-10">
              <button
                onClick={toggleTheme}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
            
            {/* Rest of the content */}
            <div className="flex-1 flex overflow-hidden">
              <div className="z-10">
                <div 
                  style={{ width: `${leftPanelWidth}%` }} 
                  className="h-full flex flex-col glassmorphic transition-all duration-100 overflow-hidden"
                >
                  <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-sakura-500" />
                      <h2 className="font-medium text-gray-900 dark:text-white text-sm">Clara's Designer</h2>
                    </div>
                    <ApiTypeSelector 
                      onApiTypeChange={handleApiTypeChange}
                      currentApiType={apiType}
                      onPageChange={onPageChange}
                    />
                  </div>
                  
                  {/* Fixed height chat panel */}
                  <div className="flex-1 overflow-hidden">
                    <ChatPanel 
                      messages={messages} 
                      mode={chatMode} 
                      onModeChange={setChatMode}
                      selectedModel={apiType === 'ollama' ? selectedOllamaModel : selectedOpenAIModel as any}
                      onModelSelect={apiType === 'ollama' ? handleOllamaModelSelect : handleOpenAIModelSelect as any}
                      apiType={apiType}
                      onRestoreCheckpoint={({ html, css, js, find, replace }) => {
                        // Targeted restore: only one of html/css/js is non-empty and both find/replace are present
                        if (
                          ((html !== '' && css === '' && js === '') || (html === '' && css !== '' && js === '') || (html === '' && css === '' && js !== '')) &&
                          typeof find === 'string' && typeof replace === 'string'
                        ) {
                          let didRestore = false;
                          if (html !== '') setHtmlCode(prev => {
                            if (prev.includes(replace)) {
                              didRestore = true;
                              return prev.replace(replace, find);
                            }
                            return prev;
                          });
                          if (css !== '') setCssCode(prev => {
                            if (prev.includes(replace)) {
                              didRestore = true;
                              return prev.replace(replace, find);
                            }
                            return prev;
                          });
                          if (js !== '') setJsCode(prev => {
                            if (prev.includes(replace)) {
                              didRestore = true;
                              return prev.replace(replace, find);
                            }
                            return prev;
                          });
                          setToast({
                            message: didRestore ? 'Checkpoint restored successfully.' : 'Could not find the edit to restore.',
                            type: didRestore ? 'success' : 'error',
                            visible: true
                          });
                          setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
                        } else {
                          // Normal restore (full code)
                          if (html !== '') setHtmlCode(html);
                          if (css !== '') setCssCode(css);
                          if (js !== '') setJsCode(js);
                        }
                        setActiveTab('preview');
                        setTimeout(() => updatePreview(), 100);
                      }}
                      isGenerating={isGenerating}
                      isProcessing={isProcessing}
                      processingProgress={processingProgress}
                      streamStats={streamStats}
                      lastStreamingMessageIndex={lastStreamingMessageIndex}
                    />
                  </div>
                  
                  {/* Fixed input box */}
                  <div className="p-4 bg-transparent backdrop-blur-sm border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0">
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={chatMode === 'design' 
                          ? "Describe changes you want to make to the UI..." 
                          : "Type a message..."}
                        className="w-full p-3 pr-24 text-sm rounded-xl min-h-[44px] max-h-[180px] bg-transparent dark:text-white focus:outline-none resize-none overflow-hidden border border-gray-200 dark:border-gray-700/50"
                        style={{ height: 'auto' }}
                      />
                      <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsTargetedEdit(v => !v)}
                          className={`p-2 rounded-full transition-colors ${isTargetedEdit ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 hover:text-purple-500'}`}
                          title="Targeted Edit: Only update a specific part of the code"
                        >
                          <Target className={`w-4 h-4 ${isTargetedEdit ? 'fill-purple-500' : ''}`} />
                        </button>
                        <button
                          onClick={enhancePrompt}
                          disabled={!chatInput.trim() || isEnhancing || isGenerating || isProcessing}
                          className={`p-2 rounded-lg transition-colors ${
                            chatInput.trim() && !isEnhancing && !isGenerating && !isProcessing
                              ? 'bg-purple-500/80 hover:bg-purple-600/90 text-white'
                              : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isEnhancing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wand2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={generateCompletion}
                          disabled={
                            (apiType === 'ollama' && !selectedOllamaModel) || 
                            (apiType === 'openai' && (!selectedOpenAIModel || !apiConfig.openai_api_key)) || 
                            !chatInput.trim() || 
                            isGenerating ||
                            isEnhancing ||
                            isProcessing
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            chatInput.trim() && ((apiType === 'ollama' && selectedOllamaModel) || (apiType === 'openai' && selectedOpenAIModel && apiConfig.openai_api_key)) && !isGenerating && !isEnhancing && !isProcessing
                              ? 'bg-blue-500/80 hover:bg-blue-600/90 text-white'
                              : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isGenerating || isProcessing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <ArrowRight className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Horizontal Resize Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 cursor-col-resize z-10 hover:bg-sakura-400/30 active:bg-sakura-400/50 transition-colors"
                  style={{ left: `${leftPanelWidth}%` }}
                  onMouseDown={startHorizontalResize}
                />
                
                {/* Right Panel - Code Editors with Tabs */}
                <div 
                  id="right-panel"
                  style={{ width: `${100 - leftPanelWidth}%` }} 
                  className="h-full flex flex-col transition-all duration-100 bg-transparent backdrop-blur-sm"
                >
                  <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md flex-shrink-0">
                    <Tabs defaultValue="html" className="w-auto">
                      <TabsList className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-lg p-1 gap-1">
                        <TabsTrigger 
                          value="html" 
                          onClick={() => setActiveTab('html')}
                          className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                            activeTab === 'html' 
                              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                          }`}
                          aria-label="HTML"
                        >
                          <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'html' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Code className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium ml-1 sm:inline hidden">HTML</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="css" 
                          onClick={() => setActiveTab('css')}
                          className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                            activeTab === 'css' 
                              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                          }`}
                          aria-label="CSS"
                        >
                          <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'css' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Code className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium ml-1 sm:inline hidden">CSS</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="js" 
                          onClick={() => setActiveTab('js')}
                          className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                            activeTab === 'js' 
                              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                          }`}
                          aria-label="JavaScript"
                        >
                          <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'js' ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Code className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium ml-1 sm:inline hidden">JS</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="preview" 
                          onClick={() => {
                            setActiveTab('preview');
                          }}
                          className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                            activeTab === 'preview' 
                              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                          }`}
                          aria-label="Preview"
                        >
                          <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'preview' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-medium ml-1 sm:inline hidden">Preview</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPageChange('apps')}
                        className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors"
                        title="Back to Apps"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      
                      <div className="h-9 px-2 bg-gray-100/80 dark:bg-gray-800/80 rounded-md flex items-center">
                        <button
                          onClick={() => setShowProjectManager(true)}
                          className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 px-1.5 py-1 rounded"
                          title="Open Project Manager"
                        >
                          <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                      
                      <div ref={containerRef} className="flex-1 flex relative overflow-hidden">
                        {/* Left Panel - Clara's Designer Interface */}
                        <div 
                          style={{ width: `${leftPanelWidth}%` }} 
                          className="h-full flex flex-col glassmorphic transition-all duration-100 overflow-hidden"
                        >
                          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-gray-200 dark:border-gray-700/50">
                            <div className="flex items-center gap-2">
                              <Wand2 className="w-5 h-5 text-sakura-500" />
                              <h2 className="font-medium text-gray-900 dark:text-white text-sm">Clara's Designer</h2>
                            </div>
                            <ApiTypeSelector 
                              onApiTypeChange={handleApiTypeChange}
                              currentApiType={apiType}
                              onPageChange={onPageChange}
                            />
                          </div>
                          
                          {/* Fixed height chat panel */}
                          <div className="flex-1 overflow-hidden">
                            <ChatPanel 
                              messages={messages} 
                              mode={chatMode} 
                              onModeChange={setChatMode}
                              selectedModel={apiType === 'ollama' ? selectedOllamaModel : selectedOpenAIModel as any}
                              onModelSelect={apiType === 'ollama' ? handleOllamaModelSelect : handleOpenAIModelSelect as any}
                              apiType={apiType}
                              onRestoreCheckpoint={({ html, css, js, find, replace }) => {
                                // Targeted restore: only one of html/css/js is non-empty and both find/replace are present
                                if (
                                  ((html !== '' && css === '' && js === '') || (html === '' && css !== '' && js === '') || (html === '' && css === '' && js !== '')) &&
                                  typeof find === 'string' && typeof replace === 'string'
                                ) {
                                  let didRestore = false;
                                  if (html !== '') setHtmlCode(prev => {
                                    if (prev.includes(replace)) {
                                      didRestore = true;
                                      return prev.replace(replace, find);
                                    }
                                    return prev;
                                  });
                                  if (css !== '') setCssCode(prev => {
                                    if (prev.includes(replace)) {
                                      didRestore = true;
                                      return prev.replace(replace, find);
                                    }
                                    return prev;
                                  });
                                  if (js !== '') setJsCode(prev => {
                                    if (prev.includes(replace)) {
                                      didRestore = true;
                                      return prev.replace(replace, find);
                                    }
                                    return prev;
                                  });
                                  setToast({
                                    message: didRestore ? 'Checkpoint restored successfully.' : 'Could not find the edit to restore.',
                                    type: didRestore ? 'success' : 'error',
                                    visible: true
                                  });
                                  setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
                                } else {
                                  // Normal restore (full code)
                                  if (html !== '') setHtmlCode(html);
                                  if (css !== '') setCssCode(css);
                                  if (js !== '') setJsCode(js);
                                }
                                setActiveTab('preview');
                                setTimeout(() => updatePreview(), 100);
                              }}
                              isGenerating={isGenerating}
                              isProcessing={isProcessing}
                              processingProgress={processingProgress}
                              streamStats={streamStats}
                              lastStreamingMessageIndex={lastStreamingMessageIndex}
                            />
                          </div>
                          
                          {/* Fixed input box */}
                          <div className="p-4 bg-transparent backdrop-blur-sm border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0">
                            <div className="relative">
                              <textarea
                                ref={textareaRef}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={chatMode === 'design' 
                                  ? "Describe changes you want to make to the UI..." 
                                  : "Type a message..."}
                                className="w-full p-3 pr-24 text-sm rounded-xl min-h-[44px] max-h-[180px] bg-transparent dark:text-white focus:outline-none resize-none overflow-hidden border border-gray-200 dark:border-gray-700/50"
                                style={{ height: 'auto' }}
                              />
                              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsTargetedEdit(v => !v)}
                                  className={`p-2 rounded-full transition-colors ${isTargetedEdit ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 hover:text-purple-500'}`}
                                  title="Targeted Edit: Only update a specific part of the code"
                                >
                                  <Target className={`w-4 h-4 ${isTargetedEdit ? 'fill-purple-500' : ''}`} />
                                </button>
                                <button
                                  onClick={enhancePrompt}
                                  disabled={!chatInput.trim() || isEnhancing || isGenerating || isProcessing}
                                  className={`p-2 rounded-lg transition-colors ${
                                    chatInput.trim() && !isEnhancing && !isGenerating && !isProcessing
                                      ? 'bg-purple-500/80 hover:bg-purple-600/90 text-white'
                                      : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  {isEnhancing ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Wand2 className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={generateCompletion}
                                  disabled={
                                    (apiType === 'ollama' && !selectedOllamaModel) || 
                                    (apiType === 'openai' && (!selectedOpenAIModel || !apiConfig.openai_api_key)) || 
                                    !chatInput.trim() || 
                                    isGenerating ||
                                    isEnhancing ||
                                    isProcessing
                                  }
                                  className={`p-2 rounded-lg transition-colors ${
                                    chatInput.trim() && ((apiType === 'ollama' && selectedOllamaModel) || (apiType === 'openai' && selectedOpenAIModel && apiConfig.openai_api_key)) && !isGenerating && !isEnhancing && !isProcessing
                                      ? 'bg-blue-500/80 hover:bg-blue-600/90 text-white'
                                      : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  {isGenerating || isProcessing ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <ArrowRight className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Horizontal Resize Handle */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 cursor-col-resize z-10 hover:bg-sakura-400/30 active:bg-sakura-400/50 transition-colors"
                          style={{ left: `${leftPanelWidth}%` }}
                          onMouseDown={startHorizontalResize}
                        />
                        
                        {/* Right Panel - Code Editors with Tabs */}
                        <div 
                          id="right-panel"
                          style={{ width: `${100 - leftPanelWidth}%` }} 
                          className="h-full flex flex-col transition-all duration-100 bg-transparent backdrop-blur-sm"
                        >
                          <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md flex-shrink-0">
                            <Tabs defaultValue="html" className="w-auto">
                              <TabsList className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-lg p-1 gap-1">
                                <TabsTrigger 
                                  value="html" 
                                  onClick={() => setActiveTab('html')}
                                  className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                                    activeTab === 'html' 
                                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                  }`}
                                  aria-label="HTML"
                                >
                                  <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'html' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <Code className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-medium ml-1 sm:inline hidden">HTML</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                  value="css" 
                                  onClick={() => setActiveTab('css')}
                                  className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                                    activeTab === 'css' 
                                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                  }`}
                                  aria-label="CSS"
                                >
                                  <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'css' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <Code className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-medium ml-1 sm:inline hidden">CSS</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                  value="js" 
                                  onClick={() => setActiveTab('js')}
                                  className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                                    activeTab === 'js' 
                                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                  }`}
                                  aria-label="JavaScript"
                                >
                                  <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'js' ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <Code className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-medium ml-1 sm:inline hidden">JS</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                  value="preview" 
                                  onClick={() => {
                                    setActiveTab('preview');
                                  }}
                                  className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                                    activeTab === 'preview' 
                                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                  }`}
                                  aria-label="Preview"
                                >
                                  <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'preview' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <Eye className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-medium ml-1 sm:inline hidden">Preview</span>
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onPageChange('apps')}
                                className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors"
                                title="Back to Apps"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              
                              <div className="h-9 px-2 bg-gray-100/80 dark:bg-gray-800/80 rounded-md flex items-center">
                                <button
                                  onClick={() => setShowProjectManager(true)}
                                  className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 px-1.5 py-1 rounded"
                                  title="Open Project Manager"
                                >
                                  <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>
                              </div>
                              
                              <div ref={containerRef} className="flex-1 flex relative overflow-hidden">
                                {/* Left Panel - Clara's Designer Interface */}
                                <div 
                                  style={{ width: `${leftPanelWidth}%` }} 
                                  className="h-full flex flex-col glassmorphic transition-all duration-100 overflow-hidden"
                                >
                                  <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-gray-200 dark:border-gray-700/50">
                                    <div className="flex items-center gap-2">
                                      <Wand2 className="w-5 h-5 text-sakura-500" />
                                      <h2 className="font-medium text-gray-900 dark:text-white text-sm">Clara's Designer</h2>
                                    </div>
                                    <ApiTypeSelector 
                                      onApiTypeChange={handleApiTypeChange}
                                      currentApiType={apiType}
                                      onPageChange={onPageChange}
                                    />
                                  </div>
                                  
                                  {/* Fixed height chat panel */}
                                  <div className="flex-1 overflow-hidden">
                                    <ChatPanel 
                                      messages={messages} 
                                      mode={chatMode} 
                                      onModeChange={setChatMode}
                                      selectedModel={apiType === 'ollama' ? selectedOllamaModel : selectedOpenAIModel as any}
                                      onModelSelect={apiType === 'ollama' ? handleOllamaModelSelect : handleOpenAIModelSelect as any}
                                      apiType={apiType}
                                      onRestoreCheckpoint={({ html, css, js, find, replace }) => {
                                        // Targeted restore: only one of html/css/js is non-empty and both find/replace are present
                                        if (
                                          ((html !== '' && css === '' && js === '') || (html === '' && css !== '' && js === '') || (html === '' && css === '' && js !== '')) &&
                                          typeof find === 'string' && typeof replace === 'string'
                                        ) {
                                          let didRestore = false;
                                          if (html !== '') setHtmlCode(prev => {
                                            if (prev.includes(replace)) {
                                              didRestore = true;
                                              return prev.replace(replace, find);
                                            }
                                            return prev;
                                          });
                                          if (css !== '') setCssCode(prev => {
                                            if (prev.includes(replace)) {
                                              didRestore = true;
                                              return prev.replace(replace, find);
                                            }
                                            return prev;
                                          });
                                          if (js !== '') setJsCode(prev => {
                                            if (prev.includes(replace)) {
                                              didRestore = true;
                                              return prev.replace(replace, find);
                                            }
                                            return prev;
                                          });
                                          setToast({
                                            message: didRestore ? 'Checkpoint restored successfully.' : 'Could not find the edit to restore.',
                                            type: didRestore ? 'success' : 'error',
                                            visible: true
                                          });
                                          setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
                                        } else {
                                          // Normal restore (full code)
                                          if (html !== '') setHtmlCode(html);
                                          if (css !== '') setCssCode(css);
                                          if (js !== '') setJsCode(js);
                                        }
                                        setActiveTab('preview');
                                        setTimeout(() => updatePreview(), 100);
                                      }}
                                      isGenerating={isGenerating}
                                      isProcessing={isProcessing}
                                      processingProgress={processingProgress}
                                      streamStats={streamStats}
                                      lastStreamingMessageIndex={lastStreamingMessageIndex}
                                    />
                                  </div>
                                  
                                  {/* Fixed input box */}
                                  <div className="p-4 bg-transparent backdrop-blur-sm border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0">
                                    <div className="relative">
                                      <textarea
                                        ref={textareaRef}
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={chatMode === 'design' 
                                          ? "Describe changes you want to make to the UI..." 
                                          : "Type a message..."}
                                        className="w-full p-3 pr-24 text-sm rounded-xl min-h-[44px] max-h-[180px] bg-transparent dark:text-white focus:outline-none resize-none overflow-hidden border border-gray-200 dark:border-gray-700/50"
                                        style={{ height: 'auto' }}
                                      />
                                      <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setIsTargetedEdit(v => !v)}
                                          className={`p-2 rounded-full transition-colors ${isTargetedEdit ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 hover:text-purple-500'}`}
                                          title="Targeted Edit: Only update a specific part of the code"
                                        >
                                          <Target className={`w-4 h-4 ${isTargetedEdit ? 'fill-purple-500' : ''}`} />
                                        </button>
                                        <button
                                          onClick={enhancePrompt}
                                          disabled={!chatInput.trim() || isEnhancing || isGenerating || isProcessing}
                                          className={`p-2 rounded-lg transition-colors ${
                                            chatInput.trim() && !isEnhancing && !isGenerating && !isProcessing
                                              ? 'bg-purple-500/80 hover:bg-purple-600/90 text-white'
                                              : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                          }`}
                                        >
                                          {isEnhancing ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Wand2 className="w-4 h-4" />
                                          )}
                                        </button>
                                        <button
                                          onClick={generateCompletion}
                                          disabled={
                                            (apiType === 'ollama' && !selectedOllamaModel) || 
                                            (apiType === 'openai' && (!selectedOpenAIModel || !apiConfig.openai_api_key)) || 
                                            !chatInput.trim() || 
                                            isGenerating ||
                                            isEnhancing ||
                                            isProcessing
                                          }
                                          className={`p-2 rounded-lg transition-colors ${
                                            chatInput.trim() && ((apiType === 'ollama' && selectedOllamaModel) || (apiType === 'openai' && selectedOpenAIModel && apiConfig.openai_api_key)) && !isGenerating && !isEnhancing && !isProcessing
                                              ? 'bg-blue-500/80 hover:bg-blue-600/90 text-white'
                                              : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                          }`}
                                        >
                                          {isGenerating || isProcessing ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <ArrowRight className="w-4 h-4" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Horizontal Resize Handle */}
                                <div 
                                  className="absolute top-0 bottom-0 w-1 cursor-col-resize z-10 hover:bg-sakura-400/30 active:bg-sakura-400/50 transition-colors"
                                  style={{ left: `${leftPanelWidth}%` }}
                                  onMouseDown={startHorizontalResize}
                                />
                                
                                {/* Right Panel - Code Editors with Tabs */}
                                <div 
                                  id="right-panel"
                                  style={{ width: `${100 - leftPanelWidth}%` }} 
                                  className="h-full flex flex-col transition-all duration-100 bg-transparent backdrop-blur-sm"
                                >
                                  <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md flex-shrink-0">
                                    <Tabs defaultValue="html" className="w-auto">
                                      <TabsList className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-lg p-1 gap-1">
                                        <TabsTrigger 
                                          value="html" 
                                          onClick={() => setActiveTab('html')}
                                          className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                                            activeTab === 'html' 
                                              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                          }`}
                                          aria-label="HTML"
                                        >
                                          <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'html' ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                            <Code className="w-3.5 h-3.5" />
                                          </div>
                                          <span className="text-xs font-medium ml-1 sm:inline hidden">HTML</span>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                          value="css" 
                                          onClick={() => setActiveTab('css')}
                                          className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                                            activeTab === 'css' 
                                              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                          }`}
                                          aria-label="CSS"
                                        >
                                          <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'css' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                            <Code className="w-3.5 h-3.5" />
                                          </div>
                                          <span className="text-xs font-medium ml-1 sm:inline hidden">CSS</span>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                          value="js" 
                                          onClick={() => setActiveTab('js')}
                                          className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                                            activeTab === 'js' 
                                              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                          }`}
                                          aria-label="JavaScript"
                                        >
                                          <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'js' ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                            <Code className="w-3.5 h-3.5" />
                                          </div>
                                          <span className="text-xs font-medium ml-1 sm:inline hidden">JS</span>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                          value="preview" 
                                          onClick={() => {
                                            setActiveTab('preview');
                                          }}
                                          className={`min-w-[40px] px-2 py-1.5 flex items-center justify-center rounded-md transition-all duration-200 ${
                                            activeTab === 'preview' 
                                              ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                          }`}
                                          aria-label="Preview"
                                        >
                                          <div className={`flex items-center justify-center w-5 h-5 rounded ${activeTab === 'preview' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                            <Eye className="w-3.5 h-3.5" />
                                          </div>
                                          <span className="text-xs font-medium ml-1 sm:inline hidden">Preview</span>
                                        </TabsTrigger>
                                      </TabsList>
                                    </Tabs>
                                    
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => onPageChange('apps')}
                                        className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors"
                                        title="Back to Apps"
                                      >
                                        <ArrowLeft className="w-4 h-4" />
                                      </button>
                                      
                                      <div className="h-9 px-2 bg-gray-100/80 dark:bg-gray-800/80 rounded-md flex items-center">
                                        <button
                                          onClick={() => setShowProjectManager(true)}
                                          className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 px-1.5 py-1 rounded"
                                          title="Open Project Manager"
                                        >
                                          <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate sm:inline hidden">
                                            {currentDesign?.name || "Untitled Project"}
                                          </span>
                                        </button>
                                      </div>
                                      
                                      <button 
                                        className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors"
                                        onClick={updatePreview}
                                        title="Refresh Preview"
                                      >
                                        <RefreshCw className="w-4 h-4" />
                                      </button>
                                      
                                      <button 
                                        onClick={handleNewProject}
                                        className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors"
                                        title="New Project"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                      
                                      <button
                                        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
                                          isSaving
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : saveStatus === 'success'
                                            ? 'bg-green-500 text-white'
                                            : saveStatus === 'error'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-blue-500/90 hover:bg-blue-600 text-white'
                                        }`}
                                        onClick={saveDesign}
                                        disabled={isSaving}
                                        title={isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Project'}
                                      >
                                        {isSaving ? (
                                          <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : saveStatus === 'success' ? (
                                          <Check className="w-4 h-4" />
                                        ) : (
                                          <Save className="w-4 h-4" />
                                        )}
                                      </button>
                                      
                                      <button
                                        className="w-9 h-9 flex items-center justify-center rounded-md bg-sakura-500 hover:bg-sakura-600 text-white transition-colors"
                                        onClick={() => setShowExportModal(true)}
                                        title="Export Project"
                                      >
                                        <FolderPlus className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 overflow-hidden">
                                    {/* Code Editors and Preview */}
                                    <div className="h-full shadow-inner">
                                      {activeTab === 'html' && (
                                        <Editor
                                          value={htmlCode}
                                          onChange={(value) => setHtmlCode(value || '')}
                                          language="html"
                                          theme={isDark ? 'vs-dark' : 'vs-light'}
                                          options={{
                                            minimap: { enabled: true },
                                            fontSize: 14,
                                            wordWrap: 'on',
                                            automaticLayout: true,
                                            padding: { top: 16 },
                                            scrollBeyondLastLine: false,
                                            lineNumbers: 'on',
                                            lineDecorationsWidth: 10,
                                            lineNumbersMinChars: 3,
                                            renderLineHighlight: 'all',
                                            cursorBlinking: 'smooth',
                                            cursorSmoothCaretAnimation: 'on',
                                            bracketPairColorization: { enabled: true },
                                            folding: true,
                                            scrollbar: {
                                              vertical: 'visible',
                                              horizontal: 'visible',
                                              verticalScrollbarSize: 12,
                                              horizontalScrollbarSize: 12,
                                            }
                                          }}
                                          className="h-full w-full"
                                        />
                                      )}
                                      {activeTab === 'css' && (
                                        <Editor
                                          value={cssCode}
                                          onChange={(value) => setCssCode(value || '')}
                                          language="css"
                                          theme={isDark ? 'vs-dark' : 'vs-light'}
                                          options={{
                                            minimap: { enabled: true },
                                            fontSize: 14,
                                            wordWrap: 'on',
                                            automaticLayout: true,
                                            padding: { top: 16 },
                                            scrollBeyondLastLine: false,
                                            lineNumbers: 'on',
                                            lineDecorationsWidth: 10,
                                            lineNumbersMinChars: 3,
                                            renderLineHighlight: 'all',
                                            cursorBlinking: 'smooth',
                                            cursorSmoothCaretAnimation: 'on',
                                            bracketPairColorization: { enabled: true },
                                            folding: true,
                                            scrollbar: {
                                              vertical: 'visible',
                                              horizontal: 'visible',
                                              verticalScrollbarSize: 12,
                                              horizontalScrollbarSize: 12,
                                            }
                                          }}
                                          className="h-full w-full"
                                        />
                                      )}
                                      {activeTab === 'js' && (
                                        <Editor
                                          value={jsCode}
                                          onChange={(value) => setJsCode(value || '')}
                                          language="javascript"
                                          theme={isDark ? 'vs-dark' : 'vs-light'}
                                          options={{
                                            minimap: { enabled: true },
                                            fontSize: 14,
                                            wordWrap: 'on',
                                            automaticLayout: true,
                                            padding: { top: 16 },
                                            scrollBeyondLastLine: false,
                                            lineNumbers: 'on',
                                            lineDecorationsWidth: 10,
                                            lineNumbersMinChars: 3,
                                            renderLineHighlight: 'all',
                                            cursorBlinking: 'smooth',
                                            cursorSmoothCaretAnimation: 'on',
                                            bracketPairColorization: { enabled: true },
                                            folding: true,
                                            scrollbar: {
                                              vertical: 'visible',
                                              horizontal: 'visible',
                                              verticalScrollbarSize: 12,
                                              horizontalScrollbarSize: 12,
                                            }
                                          }}
                                          className="h-full w-full"
                                        />
                                      )}
                                      {activeTab === 'preview' && (
                                        <div className="w-full h-full relative overflow-hidden">
                                          {previewError && (
                                            <div className="absolute top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-sm z-50">
                                              Error on line {previewError.line}: {previewError.message}
                                            </div>
                                          )}
                                          <div className="absolute inset-0">
                                            <PreviewPanel
                                              elements={[{ id: '1', type: 'div', props: {}, children: [] }]}
                                              htmlContent={htmlCode}
                                              cssContent={cssCode}
                                              jsContent={jsCode}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ExportProjectModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportSuccess}
        currentHtml={htmlCode}
        currentCss={cssCode}
        currentJs={jsCode}
        messages={messages}
        currentName={currentDesign?.name}
        currentDescription={currentDesign?.description}
      />
      <ProjectManagerModal
        isOpen={showProjectManager}
        onClose={() => setShowProjectManager(false)}
        onSelectProject={handleSelectProject}
        onCreateNew={handleNewProject}
        currentProjectId={currentDesign?.id}
      />
      {toast.visible && <ToastNotification message={toast.message} type={toast.type} />}
    </div>
  );
};

export default UIBuilder; 