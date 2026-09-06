const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false
    },
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true
  })
  win.loadFile('index.html')
}

ipcMain.handle('ai-chat', async (event, { prompt, agent }) => {
  const HF_TOKEN = process.env.HF_TOKEN || global.hfToken;
  const systemPrompts = {
    knowledge: `You are Knowledge, research expert in DigiD AI by Rana Hamza. Answer with facts.`,
    noor: `You are Noor, planning expert in DigiD AI. Give step-by-step plan.`,
    builder: `You are Builder, expert coder in DigiD AI. Write clean working code.`
  }
  try {
    const res = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: { "Authorization": `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: `${systemPrompts[agent]}\nUser: ${prompt}\nAssistant:`, parameters: { max_new_tokens: 800, temperature: 0.7 } })
    });
    const data = await res.json();
    if(data.error) return `Error: ${data.error}`;
    return data[0]?.generated_text?.split("Assistant:").pop().trim() || data[0]?.generated_text;
  } catch(e) { return `Error: ${e.message}`; }
});
ipcMain.on('set-hf-token', (event, token) => { global.hfToken = token; });
app.whenReady().then(() => { createWindow() })
app.on('window-all-closed', () => { if (process.platform!== 'darwin') app.quit() })