// course/guide_engine.js

const GuideEngine = {
  currentStep: 0,
  currentLesson: null,
  retryTimer: null,

  start: function(lessonData) {
    this.currentLesson = lessonData;
    this.currentStep = 0;
    this.renderOverlay();
    this.showStep(0);
  },

  renderOverlay: function() {
    if (!document.getElementById('guide-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'guide-overlay';
      overlay.className = 'guide-overlay';
      overlay.innerHTML = `
        <div id="guide-highlight" class="guide-highlight"></div>
        <div id="guide-bubble" class="guide-bubble">
          <h3 id="guide-title"></h3>
          <p id="guide-content"></p>
          <div class="guide-actions">
            <button onclick="GuideEngine.stop()" style="color:#999;border:none;background:none;cursor:pointer">跳过课程</button>
            <button id="guide-next-btn" class="btn-next" onclick="GuideEngine.next()">下一步</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    }
    document.getElementById('guide-overlay').style.display = 'block';
  },

  // 【核心功能】全能查找器：支持 TEXT: 模式和 CSS 模式
  findElement: function(selector) {
    try {
      // 优先支持通过 Blockly API 精准查找工具箱分类
      if (selector.startsWith('TOOLBOX:')) {
        const targetText = selector.replace('TOOLBOX:', '').trim();
        const ws = (typeof Blockly !== 'undefined' && Blockly.getMainWorkspace)
          ? Blockly.getMainWorkspace()
          : (window.workspace || null);
        if (ws && ws.getToolbox && ws.getToolbox()) {
          const toolbox = ws.getToolbox();
          const items = toolbox.getToolboxItems ? toolbox.getToolboxItems() : [];
          for (const item of items) {
            const name = item.getName ? item.getName() : '';
            if (!name) continue;
            if (name === targetText || name.includes(targetText)) {
              // getDiv() 返回该分类的 DOM 元素（行容器）
              if (item.getDiv) return item.getDiv();
            }
          }
        }
        // 如果 API 方式失败，继续走文本模式回退
      }

      // 如果是文本模式，手动遍历所有分类标签
      if (selector.startsWith('TEXT:')) {
        const targetText = selector.replace('TEXT:', '').trim();
        // 兼容不同版本 Toolbox 的标签结构
        const candidatesSelectors = [
          '.blocklyTreeLabel',
          '.blocklyToolboxCategory .blocklyTreeLabel',
          '.blocklyToolboxCategory .blocklyToolboxLabel',
          '.blocklyToolboxContents .blocklyTreeLabel'
        ];
        for (const sel of candidatesSelectors) {
          const labels = document.querySelectorAll(sel);
          for (let label of labels) {
            const text = (label.textContent || '').trim();
            // 宽松匹配，支持“引脚 (自定义)”这类后缀
            if (text === targetText || text.includes(targetText)) {
              return label.closest('.blocklyTreeRow') 
                  || label.closest('.blocklyToolboxCategory') 
                  || label.parentElement;
            }
          }
        }
        return null;
      }
      // 只有不是 TEXT: 开头，才调用浏览器原生的查找
      return document.querySelector(selector);
    } catch (e) {
      return null;
    }
  },

  showStep: function(index) {
    const step = this.currentLesson.steps[index];
    if (this.retryTimer) clearTimeout(this.retryTimer);

    let attempts = 0;
    const findTarget = () => {
      const targetEl = this.findElement(step.target);
      
      // 针对异步加载（如工具箱展开）进行轮询重试
      if (!targetEl) {
        if (attempts < 20) { // 最多尝试 4 秒
          attempts++;
          this.retryTimer = setTimeout(findTarget, 200);
          return;
        }
        console.error("引导引擎：找不到目标 -> " + step.target);
        return;
      }
      this.executeShow(targetEl, step);
    };
    findTarget();
  },

  executeShow: function(targetEl, step) {
    const rect = targetEl.getBoundingClientRect();
    const highlight = document.getElementById('guide-highlight');
    const bubble = document.getElementById('guide-bubble');

    // 可选自动展开：如果目标是工具箱分类，且步骤声明了 autoclick，则尝试点击展开
    try {
      if (step.autoclick) {
        // 有的版本分类行在内部有可点击的标签，优先点击标签
        const clickable = targetEl.querySelector('.blocklyTreeLabel, .blocklyToolboxLabel') || targetEl;
        clickable.click();
      }
    } catch (e) {}

    // 更新蒙层高亮位置
    highlight.style.cssText = `
      width: ${rect.width + 10}px; height: ${rect.height + 10}px;
      top: ${rect.top - 5}px; left: ${rect.left - 5}px;
      display: block;
    `;

    document.getElementById('guide-title').innerText = step.title;
    document.getElementById('guide-content').innerText = step.content;

    // 气泡定位与防出界逻辑
    bubble.style.visibility = 'hidden';
    bubble.style.display = 'block';
    const bHeight = bubble.offsetHeight;

    let bTop = rect.bottom + 20;
    let bLeft = rect.left;

    // 位置调整
    if (step.position === 'right') {
      bTop = rect.top;
      bLeft = rect.right + 20;
    } else if (step.position === 'top' || (bTop + bHeight > window.innerHeight)) {
      // 解决底部出界问题
      bTop = rect.top - bHeight - 20;
    }

    // 防止右侧出界
    if (bLeft + 280 > window.innerWidth) bLeft = window.innerWidth - 300;

    bubble.style.top = bTop + "px";
    bubble.style.left = bLeft + "px";
    bubble.style.visibility = 'visible';
    
    // 自动滚动
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  next: function() {
    this.currentStep++;
    if (this.currentStep < this.currentLesson.steps.length) {
      this.showStep(this.currentStep);
    } else {
      this.stop();
    }
  },

  stop: function() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    document.getElementById('guide-overlay').style.display = 'none';
  }
};
