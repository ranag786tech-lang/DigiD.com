const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true
  })
  win.loadFile('index.html')
}

// === ASLI AI KA DIMAGH - YAHAN SE AI CALL HOGA ===
ipcMain.handle('ai-chat', async (event, { prompt, agent }) => {
  const HF_TOKEN = process.env.HF_TOKEN || global.hfToken; // Token yahan ayega

  // 3 Agents ke alag prompts
  const systemPrompts = {
    knowledge: `You are Knowledge, a research expert. You are part of DigiD AI by Rana Hamza. Answer any question with deep research, facts, and sources. Language: User's language.`,
    noor: `You are Noor, a planning expert. You are part of DigiD AI. Break any task into clear step-by-step plan with timeline, budget, risks. Be practical.`,
    builder: `You are Builder, an expert coder. You are part of DigiD AI. Write clean, working code. Explain code briefly. Support: HTML, JS, Python, Next.js, Node.js. If user asks for app, give full code.`
  }

  const system = systemPrompts[agent] || systemPrompts.knowledge;
  const fullPrompt = `${system}\n\nUser: ${prompt}\nAssistant:`;

  try {
    // Hugging Face FREE model - Llama 3.1 - Best for coding & planning
    const res = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: { max_new_tokens: 800, temperature: 0.7, top_p: 0.9 }
      })
    });
    const data = await res.json();
    if(data.error) return `Error: ${data.error} - Check HF Token`;
    return data[0]?.generated_text?.split("Assistant:").pop().trim() || data[0]?.generated_text || "AI se jawab nahi aaya, dobara try karo.";
  } catch (e) {
    return `AI Error: ${e.message}. Internet check karo aur HF Token settings me dalo.`;
  }
});

ipcMain.on('set-hf-token', (event, token) => { global.hfToken = token; });

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})
app.on('window-all-closed', () => { if (process.platform!== 'darwin') app.quit() })