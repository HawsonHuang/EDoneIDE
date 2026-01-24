// 1. 注入 Blockly
var toolboxDom = Blockly.utils.xml.textToDom(toolboxXml);

var workspace = Blockly.inject('blocklyDiv', {
  toolbox: typeof toolboxXml !== 'undefined' ? toolboxXml : '<xml></xml>', 
  grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
  trashcan: true,
  zoom: { controls: true, wheel: true }
});

// 2. 实时生成代码到右侧预览区
var currentGenerator = arduinoGenerator;
function updateCode() {
  // 1. 调用 arduinoGenerator 的全文生成逻辑
  // 该函数内部会自动调用 finish()，返回包含 setup 和 loop 的完整 .ino 字符串
  const code = arduinoGenerator.workspaceToCode(workspace);

  // 2. 获取 UI 中的代码预览文本框
  const codePreview = document.getElementById('code-preview');

  // 3. 【核心修正】直接赋值，不要在外面包裹任何字符串模板
  if (codePreview) {
    codePreview.value = code;
  }
}

// 监听工作区变化
workspace.addChangeListener(updateCode);

// 3. Tab 切换逻辑
window.switchTab = function(tabName) {
  // 移除所有 active 类
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  // 激活当前选中的
  if (tabName === 'code') {
    document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
    document.getElementById('tab-content-code').classList.add('active');
  } else {
    document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
    document.getElementById('tab-content-ai').classList.add('active');
  }
};

// 4. 模拟编译上传
window.compileAndUpload = function() {
  const logDiv = document.getElementById('debug-log');
  const now = new Date().toLocaleTimeString();
  
  // 辅助函数：追加日志
  function log(msg, color) {
    const style = color ? `style="color: ${color}"` : '';
    logDiv.innerHTML += `<div ${style}>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  const code = arduinoGenerator.workspaceToCode(workspace);
  if (!code || code.trim() === "// 助创客体系 自动生成代码\nvoid setup() {\n}\n\nvoid loop() {\n\n}") {
    log("提示：当前画布为空，仅生成了基础模板。", "#ffa502");
  }
  log(`目标平台: ${document.getElementById('board-select').value}`);
  
  // 执行下载逻辑
  try {
    // 创建 Blob 对象，指定内容类型为纯文本
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // 创建虚拟链接进行下载
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    
    // 文件名建议：获取当前日期时间，防止重名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadLink.download = `sketch_${timestamp}.ino`;
    
    // 触发点击并移除
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // 释放 URL 对象内存
    URL.revokeObjectURL(url);

    log(`代码导出成功！文件已保存为 .ino 格式。`, '#2ed573');
  } catch (err) {
    log(`导出失败: ${err.message}`, '#ff4757');
  }
  
  // 模拟编译提示
  setTimeout(() => {
    log(`本地编译环境已就绪。请使用 Arduino IDE 打开下载的文件进行上传。`);
  }, 1000);
};

// 初始化时触发一次代码更新
updateCode();

// 处理窗口大小调整，Blockly 需要重新计算尺寸
window.addEventListener('resize', function() {
  Blockly.svgResize(workspace);
});

// 5. 布局拖拽缩放逻辑
(function() {
  const sidebarResizer = document.getElementById('sidebar-resizer');
  const footerResizer = document.getElementById('footer-resizer');
  const sidebar = document.querySelector('.right-sidebar');
  const footer = document.querySelector('.footer');
  const body = document.body;

  let isResizingSidebar = false;
  let isResizingFooter = false;

  // --- Sidebar Resizing ---
  sidebarResizer.addEventListener('mousedown', function(e) {
    e.preventDefault(); // 防止默认选择行为
    isResizingSidebar = true;
    sidebarResizer.classList.add('resizing');
    body.style.cursor = 'col-resize';
    body.style.userSelect = 'none'; 
  });

  // --- Footer Resizing ---
  footerResizer.addEventListener('mousedown', function(e) {
    e.preventDefault(); // 防止默认选择行为
    isResizingFooter = true;
    footerResizer.classList.add('resizing');
    body.style.cursor = 'row-resize';
    body.style.userSelect = 'none';
  });

  // --- Global Mouse Move ---
  document.addEventListener('mousemove', function(e) {
    if (!isResizingSidebar && !isResizingFooter) return;
    
    e.preventDefault(); // 防止拖拽时的意外选中

    if (isResizingSidebar) {
      // 计算新宽度：窗口宽度 - 鼠标X坐标
      // 可以添加最小/最大宽度限制
      let newWidth = window.innerWidth - e.clientX;
      if (newWidth < 200) newWidth = 200; // Min width
      if (newWidth > 600) newWidth = 600; // Max width
      
      sidebar.style.width = newWidth + 'px';
      
      // 调整 CSS 变量 (可选，如果 CSS 中使用了变量)
      // document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px');
    }

    if (isResizingFooter) {
      // 计算新高度：窗口高度 - 鼠标Y坐标
      let newHeight = window.innerHeight - e.clientY;
      if (newHeight < 50) newHeight = 50; // Min height
      if (newHeight > 400) newHeight = 400; // Max height

      footer.style.height = newHeight + 'px';
      // document.documentElement.style.setProperty('--footer-height', newHeight + 'px');
    }

    // 重要：Blockly 需要重新计算布局
    Blockly.svgResize(workspace);
  });

  // --- Global Mouse Up ---
  document.addEventListener('mouseup', function(e) {
    if (isResizingSidebar || isResizingFooter) {
      isResizingSidebar = false;
      isResizingFooter = false;
      sidebarResizer.classList.remove('resizing');
      footerResizer.classList.remove('resizing');
      body.style.cursor = '';
      body.style.userSelect = '';
      
      // 最后再触发一次 resize 确保万无一失
      Blockly.svgResize(workspace);
    }
  });
})();

// 6. [新增] 侧边栏与底边栏隐藏/显示切换逻辑

// 切换侧边栏
window.toggleSidebar = function() {
  const sidebar = document.querySelector('.right-sidebar');
  const resizer = document.getElementById('sidebar-resizer');
  const trigger = document.getElementById('side-trigger');
  
  // 切换折叠类名
  const isCollapsed = sidebar.classList.toggle('collapsed');
  
  // 隐藏边栏时，同时隐藏拖拽条，显示边缘感应区
  resizer.style.display = isCollapsed ? 'none' : 'block';
  trigger.style.display = isCollapsed ? 'flex' : 'none';
  
  // 通知 Blockly 重新计算布局宽度
  Blockly.svgResize(workspace);
};

// 切换底部栏
window.toggleFooter = function() {
  const footer = document.querySelector('.footer');
  const resizer = document.getElementById('footer-resizer'); // 底部拖拽条
  const trigger = document.getElementById('foot-trigger');   // 底部感应区
  // 切换折叠类名
  const isCollapsed = footer.classList.toggle('collapsed');
  
  // 显示或隐藏底部的边缘感应区
  resizer.style.display = isCollapsed ? 'none' : 'block';
  trigger.style.display = isCollapsed ? 'flex' : 'none';
  
  // 延迟执行重绘以确保布局更新完成
  Blockly.svgResize(workspace);
};

window.openCourse = function() {
  // 检查引擎和课程数据是否已加载
  if (typeof GuideEngine !== 'undefined' && typeof Lesson_LED_Blink !== 'undefined') {
    // 调用独立引擎，传入独立文档中的课程对象
    GuideEngine.start(Lesson_LED_Blink);
    
  } else {
    console.error("教学模块加载失败，请检查 course 文件夹路径。");
  }
};

// AI 对话交互逻辑
document.getElementById('ai-send-btn').addEventListener('click', function() {
  const input = document.getElementById('ai-input');
  const msg = input.value.trim();
  if (!msg) return;

  const chatContainer = document.getElementById('ai-chat-container');

  // 1. 添加用户消息气泡
  const userDiv = document.createElement('div');
  userDiv.className = 'message user-msg';
  userDiv.innerHTML = `<div class="bubble">${msg}</div>`;
  chatContainer.appendChild(userDiv);

  // 2. 清空输入并滚动到底部
  input.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // 3. 模拟 AI 自动回复（后续接入 n8n/API）
  setTimeout(() => {
    const aiDiv = document.createElement('div');
    aiDiv.className = 'message ai-msg';
    aiDiv.innerHTML = `
      <i class="fas fa-robot"></i>
      <div class="bubble">正在分析您的需求并尝试构建代码块...</div>
    `;
    chatContainer.appendChild(aiDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 800);
});

// 支持回车发送
document.getElementById('ai-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') document.getElementById('ai-send-btn').click();
});

// 预览面板关闭函数
window.closeAiPreview = function() {
  document.getElementById('ai-block-preview-area').style.display = 'none';
};