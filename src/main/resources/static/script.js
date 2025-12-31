require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});

require(['vs/editor/editor.main'], function() {
    // Initial states
    const states = {
        java: {
            code: [
                '// Do not change the name of the Main class',
                'public class Main {',
                '    public static void main(String[] args) {',
                '        System.out.println("Hello, ByteCraft!");',
                '    }',
                '}'
            ].join('\n'),
            language: 'java'
        },
        json: {
            code: '{\n  "message": "Hello World",\n  "status": 200\n}',
            language: 'json'
        },
        xml: {
            code: '<root>\n  <message>Hello World</message>\n</root>',
            language: 'xml'
        },
        json2xml: {
            code: '{\n  "message": "Convert Me to XML"\n}',
            language: 'json'
        },
        xml2json: {
            code: '<root>\n  <message>Convert Me to JSON</message>\n</root>',
            language: 'xml'
        }
    };

    // Jolt default inputs
    const joltDefaultInput = '{\n  "rating": {\n    "primary": {\n      "value": 3\n    }\n  }\n}';
    const joltDefaultSpec = '[\n  {\n    "operation": "shift",\n    "spec": {\n      "rating": {\n        "primary": {\n          "value": "Rating"\n        }\n      }\n    }\n  }\n]';

    let currentMode = 'java';

    // Main Editor
    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: states.java.code,
        language: 'java',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14
    });

    // Jolt Editors
    const joltInputEditor = monaco.editor.create(document.getElementById('jolt-input'), {
        value: joltDefaultInput,
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13
    });
    
    const joltSpecEditor = monaco.editor.create(document.getElementById('jolt-spec'), {
        value: joltDefaultSpec,
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13
    });

    const outputElement = document.getElementById('output');
    const statusElement = document.getElementById('status');
    const actionContainer = document.getElementById('action-container');
    
    const javaTab = document.getElementById('tab-java');
    const formatterTab = document.getElementById('tab-formatter');
    const converterTab = document.getElementById('tab-converter');
    const joltTab = document.getElementById('tab-jolt');
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');

    const editorDiv = document.getElementById('editor');
    const joltContainer = document.getElementById('jolt-container');

    // UI Renderers
    function renderActions() {
        actionContainer.innerHTML = '';
        if (currentMode === 'java') {
            const btn = document.createElement('button');
            btn.className = 'run-button';
            btn.innerHTML = 'Run Code <span class="play-icon">▶</span>';
            btn.onclick = runJava;
            actionContainer.appendChild(btn);
        } else if (currentMode === 'jolt') {
            const btn = document.createElement('button');
            btn.className = 'run-button';
            btn.innerHTML = 'Transform JOLT';
            btn.onclick = runJolt;
            actionContainer.appendChild(btn);
        } else if (currentMode === 'json2xml') {
            const btn = document.createElement('button');
            btn.className = 'run-button';
            btn.innerHTML = 'Convert to XML';
            btn.onclick = () => convertCode('json-to-xml');
            actionContainer.appendChild(btn);
        } else if (currentMode === 'xml2json') {
            const btn = document.createElement('button');
            btn.className = 'run-button';
            btn.innerHTML = 'Convert to JSON';
            btn.onclick = () => convertCode('xml-to-json');
            actionContainer.appendChild(btn);
        } else {
            // Formatter
            const beautifyBtn = document.createElement('button');
            beautifyBtn.className = 'run-button';
            beautifyBtn.innerText = 'Beautify';
            beautifyBtn.onclick = () => formatCode('beautify');
            beautifyBtn.style.marginRight = '0.5rem';

            const minifyBtn = document.createElement('button');
            minifyBtn.className = 'run-button';
            minifyBtn.innerText = 'Minify';
            minifyBtn.onclick = () => formatCode('minify');

            actionContainer.appendChild(beautifyBtn);
            actionContainer.appendChild(minifyBtn);
        }
    }

    function switchMode(newMode) {
        // Save old state if valid
        if (currentMode !== 'jolt' && states[currentMode]) {
             states[currentMode].code = editor.getValue();
        }

        // Update UI Tabs
        javaTab.classList.remove('active');
        formatterTab.classList.remove('active');
        converterTab.classList.remove('active');
        joltTab.classList.remove('active');
        
        // Reset Dropdown labels
        formatterTab.textContent = 'Formatter';
        converterTab.textContent = 'Converter';

        if (newMode === 'java') {
            javaTab.classList.add('active');
            showEditor(true);
        } else if (newMode === 'jolt') {
            joltTab.classList.add('active');
            showEditor(false);
        } else if (newMode === 'json2xml' || newMode === 'xml2json') {
            converterTab.classList.add('active');
            const label = newMode === 'json2xml' ? 'JSON to XML' : 'XML to JSON';
            converterTab.textContent = `Converter: ${label}`;
            showEditor(true);
        } else {
            // Formatter modes
            formatterTab.classList.add('active');
            formatterTab.textContent = `Formatter: ${newMode.toUpperCase()}`;
            showEditor(true);
        }

        currentMode = newMode;
        
        // Load content if standard editor
        if (newMode !== 'jolt') {
            const newState = states[currentMode];
            monaco.editor.setModelLanguage(editor.getModel(), newState.language);
            editor.setValue(newState.code);
        }

        renderActions();
        outputElement.textContent = '';
        statusElement.textContent = 'Ready';
        
        // Force layout update for split panes
        if (newMode === 'jolt') {
            setTimeout(() => {
                joltInputEditor.layout();
                joltSpecEditor.layout();
            }, 10);
        }
        
        updateCopyButtonVisibility(newMode);
    }

    function showEditor(showStandard) {
        if (showStandard) {
            editorDiv.style.display = 'block';
            joltContainer.style.display = 'none';
        } else {
            editorDiv.style.display = 'none';
            joltContainer.style.display = 'flex';
        }
    }

    // Event Listeners
    javaTab.addEventListener('click', () => switchMode('java'));
    joltTab.addEventListener('click', () => switchMode('jolt'));

    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (link.dataset.mode) {
                switchMode(link.dataset.mode);
            } else if (link.dataset.theme) {
                switchTheme(link.dataset.theme);
            }
        });
    });

    function switchTheme(theme) {
        document.body.className = ''; // Reset classes
        if (theme !== 'dark') {
            document.body.classList.add(`theme-${theme}`);
        }
        
        const themes = {
            'oceanic': { base: 'vs-dark', bg: '#0f172a' },
            'dracula': { base: 'vs-dark', bg: '#282a36' },
            'forest': { base: 'vs-dark', bg: '#1b2b23' },
            'cyberpunk': { base: 'hc-black', bg: '#0b0c15' },
            'sunset': { base: 'vs', bg: '#fffaf4' },
            'lavender': { base: 'vs', bg: '#fbfbfe' },
            'solarized': { base: 'vs', bg: '#fdf6e3' }
        };

        let monacoTheme = 'vs-dark'; // Default
        
        if (theme === 'light') {
            monacoTheme = 'vs';
        } else if (themes[theme]) {
            // Define custom theme on the fly
            const t = themes[theme];
            const themeName = 'custom-' + theme;
            monaco.editor.defineTheme(themeName, {
                base: t.base,
                inherit: true,
                rules: [],
                colors: {
                    'editor.background': t.bg
                }
            });
            monacoTheme = themeName;
        }
        
        monaco.editor.setTheme(monacoTheme);
    }

    // API Callers
    async function runJava() {
        const btn = actionContainer.querySelector('button');
        const code = editor.getValue();
        btn.disabled = true;
        statusElement.textContent = 'Running...';
        outputElement.textContent = '';
        outputElement.classList.remove('error-text');

        try {
            const response = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code })
            });

            const data = await response.json();
            if (data.error) {
                outputElement.textContent = data.error;
                outputElement.classList.add('error-text');
                statusElement.textContent = 'Error';
            } else {
                outputElement.textContent = data.output;
                statusElement.textContent = `Completed in ${data.executionTime}ms`;
            }
        } catch (error) {
            outputElement.textContent = 'Error: ' + error.message;
            outputElement.classList.add('error-text');
        } finally {
            btn.disabled = false;
        }
    }

    async function formatCode(action) {
        const buttons = actionContainer.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);
        const content = editor.getValue();
        statusElement.textContent = 'Processing...';
        outputElement.textContent = '';
        outputElement.classList.remove('error-text');

        try {
            const response = await fetch(`/api/format/${currentMode}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content })
            });

            const data = await response.json();
            if (data.error) {
                outputElement.textContent = data.error;
                outputElement.classList.add('error-text');
                statusElement.textContent = 'Error';
            } else {
                editor.setValue(data.result);
                outputElement.textContent = "Formatted successfully!";
                statusElement.textContent = 'Completed';
            }
        } catch (error) {
            outputElement.textContent = 'Error: ' + error.message;
            outputElement.classList.add('error-text');
        } finally {
            buttons.forEach(b => b.disabled = false);
        }
    }

    async function convertCode(endpoint) {
        const btn = actionContainer.querySelector('button');
        btn.disabled = true;
        const content = editor.getValue();
        statusElement.textContent = 'Converting...';
        outputElement.textContent = '';
        outputElement.classList.remove('error-text');

        try {
            const response = await fetch(`/api/format/convert/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: content })
            });

            const data = await response.json();
            if (data.error) {
                outputElement.textContent = data.error;
                outputElement.classList.add('error-text');
                statusElement.textContent = 'Error';
            } else {
                outputElement.textContent = data.result;
                statusElement.textContent = 'Conversion Complete. See Output.';
                
                // Optionally verify if we want to update the editor or just show in output
                // Usually converters show output in separate pane or replace editor.
                // Let's replace editor content if it's successful? 
                // Wait, if I replace, I need to change the mode too?
                // Let's just show in output for now described in status.
                // Or better, update the editor to show the result so they can copy it.
                // But we need to switch language then!
                
                // Let's keep it simple: Show in Output pane.
                // "Conversion Complete. See Output."
            }
        } catch (error) {
            outputElement.textContent = 'Error: ' + error.message;
            outputElement.classList.add('error-text');
        } finally {
            btn.disabled = false;
        }
    }

    async function runJolt() {
        const btn = actionContainer.querySelector('button');
        const input = joltInputEditor.getValue();
        const spec = joltSpecEditor.getValue();
        
        btn.disabled = true;
        statusElement.textContent = 'Transforming...';
        outputElement.textContent = '';
        outputElement.classList.remove('error-text');

        try {
            const response = await fetch('/api/jolt/transform', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputJson: input, specJson: spec })
            });

            const data = await response.json();
            if (data.error) {
                outputElement.textContent = data.error;
                outputElement.classList.add('error-text');
                statusElement.textContent = 'Error';
            } else {
                outputElement.textContent = data.result;
                statusElement.textContent = 'Transformation Complete';
            }
        } catch (error) {
            outputElement.textContent = 'Error: ' + error.message;
            outputElement.classList.add('error-text');
        } finally {
            btn.disabled = false;
        }
    }

    // Init
    renderActions();
    updateCopyButtonVisibility(currentMode);

    // Make editors and globals available for copy function
    window.mainEditor = editor;
    window.joltInputEditor = joltInputEditor;
    window.joltSpecEditor = joltSpecEditor;
});

// Update visibility of main editor buttons
function updateCopyButtonVisibility(mode) {
    const copyBtn = document.getElementById('editor-copy-btn');
    const clearBtn = document.getElementById('editor-clear-btn');
    
    if (mode === 'java') {
        // Java Mode: Hide clear, show copy
        copyBtn.style.display = 'block';
        clearBtn.style.display = 'none';
    } else if (mode === 'jolt') {
        // Jolt Mode: Hide main editor buttons (Jolt has its own)
        copyBtn.style.display = 'none';
        clearBtn.style.display = 'none';
    } else {
        // Formatter/Converter Modes: Show both
        copyBtn.style.display = 'block';
        clearBtn.style.display = 'block';
    }
}

// Clear Content Logic
function clearContent(target) {
    if (target === 'editor') {
        window.mainEditor.setValue('');
    } else if (target === 'jolt-input') {
        window.joltInputEditor.setValue('');
    } else if (target === 'jolt-spec') {
        window.joltSpecEditor.setValue('');
    }
}

// Resizer Logic
const resizer = document.getElementById('resizer');
const outputContainer = document.getElementById('output-container');
const editorContainer = document.querySelector('.editor-container');

let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
    });
});

function handleMouseMove(e) {
    if (!isResizing) return;
    const containerHeight = document.body.clientHeight;
    const headerHeight = document.querySelector('header').clientHeight; // Approx header height
    const newOutputHeight = containerHeight - e.clientY;
    
    // Limits
    if (newOutputHeight > 50 && newOutputHeight < containerHeight - headerHeight - 50) {
        outputContainer.style.height = `${newOutputHeight}px`;
    }
}

// Copy Logic
function copyToClipboard(source) {
    let textToCopy = '';
    
    if (source === 'output') {
        textToCopy = document.getElementById('output').textContent;
    } else if (source === 'jolt-input-content') {
        textToCopy = window.joltInputEditor.getValue();
    } else if (source === 'jolt-spec-content') {
        textToCopy = window.joltSpecEditor.getValue();
    } else if (source === 'editor-content') {
        // Main editor content
        const editor = monaco.editor.getModels()[0]; // Getting the first model or current active one attached to 'editor'
        // Since we created 'editor' in local scope start of file, we need access.
        // But we can assume window.editor is set or just set it now.
        textToCopy = window.mainEditor.getValue();
    }

    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalStatus = document.getElementById('status').textContent;
            document.getElementById('status').textContent = 'Copied!';
            setTimeout(() => {
                document.getElementById('status').textContent = originalStatus;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
}
