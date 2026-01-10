// 1. 注入 Blockly
var toolboxDom = Blockly.utils.xml.textToDom(toolboxXml);

var workspace = Blockly.inject('blocklyDiv', {
  toolbox: typeof toolboxXml !== 'undefined' ? toolboxXml : '<xml></xml>', 
  grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
  trashcan: true,
  zoom: { controls: true, wheel: true }
});

// 2. 实时生成代码到右侧预览区
function updateCode() {
  var code = javascript.javascriptGenerator.workspaceToCode(workspace);
  // 获取 textarea 元素，注意这里的 ID 要和 HTML 对应
  var codeArea = document.getElementById('code-preview');
  if (codeArea) {
    codeArea.value = code;
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

  log(`开始编译...`);
  log(`目标平台: ${document.getElementById('board-select').value}`);
  
  // 模拟延迟
  setTimeout(() => {
    log(`编译成功! (Sketch uses 12% program storage space)`);
    log(`开始上传...`);
  }, 1000);
  
  setTimeout(() => {
    log(`上传完成!`, '#2ed573');
  }, 2500);
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
