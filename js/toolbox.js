// 定义 Toolbox 的 XML 结构字符串
var toolboxXml = `
<xml id="toolbox" style="display: none">
  <category name="逻辑" colour="#5b80a5">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_negate"></block>
    <block type="logic_boolean"></block>
    <block type="logic_null"></block>
    <block type="logic_ternary"></block>
  </category>

  <category name="循环" colour="#5ba55b">
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    <block type="controls_whileUntil"></block>
    <block type="controls_for"></block>
  </category>

  <category name="数字" colour="#5b67a5">
    <block type="math_number">
      <field name="NUM">0</field>
    </block>
    <block type="math_arithmetic"></block>
    <block type="math_single"></block>
    <block type="math_trig"></block>
    <block type="math_constant"></block>
    <block type="math_number_property"></block>
    <block type="math_round"></block>
    <block type="math_modulo"></block>
    <block type="math_constrain"></block>
    <block type="math_random_int"></block>
  </category>

  <category name="变量" colour="#a55b80" custom="VARIABLE"></category>

  <sep></sep>

  <category name="控件" colour="#57945a">
    <block type="controls_digital_write"></block>
    <block type="controls_digital_read"></block>
    <block type="controls_delay">
      <value name="DELAY_TIME">
        <shadow type="math_number">
          <field name="NUM">1000</field>
        </shadow>
      </value>
    </block>
  </category>
</xml>
`;