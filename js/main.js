// 1. 注入 Blockly
var toolboxDom = Blockly.utils.xml.textToDom(toolboxXml);

var workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxDom,
  grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
  trashcan: true,
  zoom: { controls: true, wheel: true } // 开启缩放
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
