// function markdownToHtml(markdown) {

//     console.log('输入的markdown:', markdown); // 添加调试日志
  
//     let html = markdown;
    
//     // 1. 标题：# 标题1 → <h1>标题1</h1>
//     html = html.replace(/^#{1} (.*?)$/gm, '<h1>$1</h1>'); // h1
//     html = html.replace(/^#{2} (.*?)$/gm, '<h2>$1</h2>'); // h2
//     html = html.replace(/^#{3} (.*?)$/gm, '<h3>$1</h3>'); // h3
//     html = html.replace(/^#{4} (.*?)$/gm, '<h4>$1</h4>'); // h4
    
//     // 2. 无序列表：- 列表项 → <li>列表项</li>，并包裹<ul>
//     html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  
//     // 处理列表块（将连续的<li>包裹成<ul>）
//     html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
//     html = html.replace(/((<li>.*?<\/li>)+)/gs, '<ul>$1</ul>');
    
//     // 3. 加粗：**文本** → <strong>文本</strong>
//     html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
//     // 4. 代码块：```代码``` → <pre><code>代码</code></pre>
//     html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
//     // 5. 换行处理（将\n替换为<br>，但不在块元素内换行）
//     html = html.replace(/\n/g, '<br>');

    
    
  
//     console.log('转换后的HTML:', html); // 添加调试日志
  
//     return html;
  
  
//   }


function markdownToHtml(markdown) {
    const lines = markdown.split(/\r?\n/);
    const blocks = [];
    let curTable = [];
    let curText = [];

    const flushTable = () => { if (curTable.length) { blocks.push({ type: 'table', lines: curTable.slice() }); curTable = []; } };
    const flushText = () => { if (curText.length) { blocks.push({ type: 'text', text: curText.join('\n') }); curText = []; } };

    for (let raw of lines) {
        const line = raw.replace(/\u00A0/g, ' ');
        if (line.trim().startsWith('|')) {
            flushText();
            curTable.push(line);
        } else {
            flushTable();
            curText.push(line);
        }
    }
    flushTable(); flushText();

    function splitCells(line) {
        let t = line.trim();
        if (t.startsWith('|')) t = t.slice(1);
        if (t.endsWith('|')) t = t.slice(0, -1);
        return t.split('|').map(c => c.trim());
    }

    function isSeparatorLine(line) {
        return /^[\s|:\-]+$/.test(line.trim()) && /\-/.test(line);
    }

    function convertTableBlock(lines) {
        const cleaned = lines.filter(l => l.trim() && !isSeparatorLine(l));
        if (!cleaned.length) return '';
        const header = splitCells(cleaned[0]).map(c => c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));
        const colCount = header.length;
        let html = '<table class="cost-table"><thead><tr>';
        header.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
        for (let i = 1; i < cleaned.length; i++) {
            const cells = splitCells(cleaned[i]).map(c => c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));
            while (cells.length < colCount) cells.push('');
            if (cells.length > colCount) cells.length = colCount;
            html += '<tr>';
            cells.forEach(cell => html += `<td>${cell}</td>`);
            html += '</tr>';
        }
        html += '</tbody></table>';
        return html;
    }

    let html = '';
    blocks.forEach(b => {
        if (b.type === 'table') {
            html += convertTableBlock(b.lines);
        } else {
            let t = b.text;
            t = t.replace(/^####\s*(.*?)$/gm, '<h4>$1</h4>');
            t = t.replace(/^###\s*(.*?)$/gm, '<h3>$1</h3>');
            t = t.replace(/^##\s*(.*?)$/gm, '<h2>$1</h2>');
            t = t.replace(/^#\s*(.*?)$/gm, '<h1>$1</h1>');

            // 无序列表（将连续的 - 行转换为 <ul><li>...）
            t = t.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
            t = t.replace(/(<li>.*?<\/li>\s*)+/g, m => `<ul>${m}</ul>`);


            t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            t = t.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            t = t.replace(/\n/g, '<br>');
            html += `<div>${t}</div>`;
        }
    });
    return html;
}


  
  
  const API_KEY = "app-55b3BLz4vubaUd7qoDoLUeok";
  class EcoRestorationSystem {
  
  
      showLoading(show) {
        const loadingElement = document.getElementById('loading');
        const generateBtn = document.getElementById('generateBtn');
        const improveBtn = document.getElementById('improveBtn');
  
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
        if (generateBtn) {
            generateBtn.disabled = show;
        }
        if (improveBtn) {
            improveBtn.disabled = show;
        }
    }
  
    /**
     * 构造函数
     * 初始化系统实例和必要属性
     */
    constructor() {
  
        this.uploadedImage = null;  // 存储上传的图片
        this.currentPlan = null;    // 存储当前的恢复方案
        this.isGenerating = false;
  
        // 确保在DOM加载完成后初始化
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
              this.initializeEventListeners();
          });
        } else {
            this.initializeEventListeners();
        }
    }
  
    /**
     * 初始化所有事件监听器
     * 包括文件上传、按钮点击、窗口大小变化等
     */
    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const generateBtn = document.getElementById('generateBtn');
        const improveBtn = document.getElementById('improveBtn');
  
        
  
        // 检查元素是否存在
        if (!uploadArea || !imageInput) {
          console.error('找不到必要的元素');
          return;
        }
  
         // 上传区域点击事件
        uploadArea.addEventListener('click', (e) => {
          console.log('uploadArea被点击');
          if (e.target.tagName !== 'IMG') {
              imageInput.click();
          }
      });
  
          // 拖拽事件
          uploadArea.addEventListener('dragover', (e) => {
              e.preventDefault();
              uploadArea.classList.add('dragover');
          });
  
          uploadArea.addEventListener('dragleave', (e) => {
              e.preventDefault();
              uploadArea.classList.remove('dragover');
          });
  
          uploadArea.addEventListener('drop', (e) => {
              e.preventDefault();
              uploadArea.classList.remove('dragover');
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                  this.processFile(files[0]);
              }
          });
  
          // 文件选择事件
          imageInput.addEventListener('change', (e) => {
              const file = e.target.files[0];
              console.log('文件被选择:', file); // 添加调试日志
  
              if (file) {
                  this.processFile(file);
              }
          });
  
          // 按钮事件
          if (generateBtn) {
              generateBtn.addEventListener('click', () => this.generatePlan());
          }
          if (improveBtn) {
              improveBtn.addEventListener('click', () => this.improvePlan());
          }
  
          // 窗口大小变化事件
          
  }
  
    /**
     * 处理拖拽悬停事件
     * @param {Event} e - 拖拽事件对象
     */
    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.add('dragover');
    }
  
    /**
     * 处理拖拽离开事件
     * @param {Event} e - 拖拽事件对象
     */
    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
    }
  
    /**
     * 处理文件拖放事件
     * @param {Event} e - 拖放事件对象
     */
    handleDrop(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
  
    /**
       * 处理上传的文件
       * @param {File} file - 上传的文件对象
       */
    processFile(file) {
      this.uploadedImage = file;
      this.showImagePreview(file, 'imagePreview'); // 使用新的通用方法
    }
  
  // 添加通用的图片预览方法
    showImagePreview(file, containerId) {
      if (!file.type.startsWith('image/')) {
          alert('请上传图片文件！');
          return;
      }
  
      const reader = new FileReader();
      reader.onload = (e) => {
          const preview = document.getElementById(containerId);
          if (preview) {
              preview.innerHTML = `
                    <img src="${e.target.result}" class="uploaded-image" alt="预览图片">
              `;
          }
      };
      reader.onerror = (error) => {
          console.error('文件读取失败:', error);
          alert('图片读取失败，请重试');
      };
      reader.readAsDataURL(file);
    }
  
  
  async generatePlan() {
    console.log('generatePlan 开始执行');
    if (this.isGenerating) return;
    
    console.log('检查输入参数');
    const imageFile = document.getElementById("imageInput").files[0];
    const location = document.getElementById("location").value.trim();
    const userText = document.getElementById("userText").value.trim();
    const pictureEl = document.getElementById('pictureContent');
    const analysisEl = document.getElementById('analysisContent');
    const planEl = document.getElementById('planContent');
    const waitingEl = document.getElementById('waitingMessage');
  
    if (!imageFile) {
        alert("请先选择一张图片文件");
        return;
    }
    if (!location) {
        alert("请输入地理位置");
        return;
    }
  
   
  
    try {
  
        this.isGenerating = true;
        this.showLoading(true);
        waitingEl.textContent = "正在上传图片...";
        // 上传图片
        const uploadForm = new FormData();
        uploadForm.append("file", imageFile);
        const uploadResp = await fetch("https://api.dify.ai/v1/files/upload", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
            body: uploadForm,
        });
  
        if (!uploadResp.ok) {
            throw new Error("图片上传失败");
        }
  
        const uploadData = await uploadResp.json();
        const upload_file_id = uploadData.id;
        waitingEl.textContent = "图片上传成功，正在发送请求...";
  
        // 发送分析请求
        const requestBody = {
            inputs: {
                location: location,
                damageimage: {
                    type: "image",
                    transfer_method: "local_file",
                    upload_file_id: upload_file_id,
                },
            },
            query: "请根据提供的图片和地理位置,生成生态相关分析和恢复方案,并以Markdown格式返回，用户要求如下：" + userText,
            response_mode: "streaming",
            conversation_id: "",
            user: "user_00",
            files: [{
                type: "image",
                transfer_method: "local_file",
                upload_file_id: upload_file_id,
                name: "damageimage",
            }],
        };
  
        const response = await fetch("https://api.dify.ai/v1/chat-messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
            throw new Error(`HTTP错误 ${response.status}`);
        }
        waitingEl.textContent = "图片识别模型分析中......";
  
        // 处理流式响应
        const reader = response.body.getReader();
        console.log('response:', reader); // 添加调试日志
        const decoder = new TextDecoder();
        console.log('decoder:', decoder); // 添加调试日志
  
  
        let pictureText = "";
        let analysisText = "";
        let planText = "";
        let currentSection = null; // 用于区分当前是分析还是方案
  
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
  
            const chunk = decoder.decode(value, { stream: true });
            console.log('chunk:', chunk); // 添加调试日志
            const lines = chunk.split("\n");
            console.log('lines:', lines); // 添加调试日志
  
            for (const line of lines) {
                if (line.trim() === "data: [DONE]") {
                    reader.cancel();
                    break;
                }
                if (!line.startsWith("data:")) continue;
  
                try {
                  const data = JSON.parse(line.slice(5));
                  
  
                  if (data.answer) {
                    console.log('Data:', data); // 添加调试日志
                    console.log('Data-answer:', data.answer); // 添加调试日志
    
                    waitingEl.innerHTML = markdownToHtml(waitingEl.textContent);
  

                    // 检查章节标记并切割内容（核心修改）
                    if (data.answer.includes("## 图片描述")) {
                        // 分割标记前后内容，只保留标记后部分
                        const parts = data.answer.split("## 图片描述");
                        const contentAfterMarker = parts.slice(1).join("## 图片识别情况");
                        
                        currentSection = "picture";
                        analysisText = contentAfterMarker; // 重置为标记后内容
                        analysisEl.innerHTML = markdownToHtml(pictureText);
                        continue;
                    }
                    // 1. 处理"## 图片描述"标记
                    if (data.answer.includes("## 生态背景分析")) {
                        // 分割标记前后内容，只保留标记后部分
                        const parts = data.answer.split("## 生态背景分析");
                        const contentAfterMarker = parts.slice(1).join("## 生态背景分析");
                        
                        currentSection = "analysis";
                        analysisText = contentAfterMarker; // 重置为标记后内容
                        analysisEl.innerHTML = markdownToHtml(analysisText);
                        continue;
                    }

                    // 2. 处理"## 生态恢复方案"标记
                    if (data.answer.includes("## 生态恢复方案")) {
                        const parts = data.answer.split("## 生态恢复方案");
                        const contentAfterMarker = parts.slice(1).join("## 生态恢复方案");
                        
                        currentSection = "plan";
                        planText = contentAfterMarker; // 重置为标记后内容
                        planEl.innerHTML = markdownToHtml(planText);
                        continue;
                    }

                    // 3. 根据当前章节追加内容（仅在检测到标记后才开始累积）
                    if (currentSection === "picture") {
                        document.getElementById("resultsSection").style.display = 'block';
                        document.getElementById("imageRecognitionCard").style.display = 'block';
                        pictureText += data.answer;
                        pictureEl.innerHTML = markdownToHtml(pictureText);
                        console.log('图片文本累积:', pictureText);
                    } else if (currentSection === "analysis") {
                        document.getElementById("resultsGrid").style.display = 'grid';
                        document.getElementById("bagAnalysisCard").style.display = 'block';
                        analysisText += data.answer;
                        analysisEl.innerHTML = markdownToHtml(analysisText);
                        console.log('方案文本累积:', analysisText);
                    }
                    else if (currentSection === "plan") {
                        document.getElementById("bagPlanCard").style.display = 'block';
                        planText += data.answer;
                        planEl.innerHTML = markdownToHtml(planText);
                        console.log('方案文本累积:', planText);
                    }
    
                    }
                } catch (e) {
                    console.warn("解析失败行：", line);
                }
            }
        }
    
            // 保存当前方案
            this.currentPlan = {
                analysis: analysisText,
                plan: planText,
                location: location
            };
  
        
  
            } catch (error) {
                waitingEl.textContent = `错误：${error.message}`;
                console.error("请求失败：", error);
            } finally {
                this.isGenerating = false;
                this.showLoading(false);
            }
        }
  
  
  }
  
  
