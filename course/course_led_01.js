// course/course_led_01.js

const Lesson_LED_Blink = {
  id: "led_01",
  title: "第一课：点亮内置 LED",
  steps: [
    {
      target: ".logo",
      title: "创客任务开始！",
      content: "今天我们要点亮 Arduino 板载的第 13 号 LED 灯。准备好了吗？",
      position: "bottom"
    },
    {
      // 通过 Blockly API 精准匹配工具箱分类
      target: "TOOLBOX:控件", 
      title: "第一步：打开分类",
      content: "请点击左侧‘控件’，展开积木选择面板。",
      autoclick: true, // 自动展开，避免下一步找不到飞出面板
      position: "right"
    },
    {
      // 通过 Block 类型在飞出面板中查找具体积木（更稳）
      target: "BLOCKTYPE:controls_digital_write", 
      title: "第二步：拖出积木",
      content: "把‘数字输出引脚’积木拖拽到中间的工作区。",
      position: "right"
    },
    {
      target: ".compile-btn", 
      title: "第三步：发送指令",
      content: "做得好！最后点击‘编译 & 上传’，观察实验现象。",
      position: "top"
    }
  ]
};
