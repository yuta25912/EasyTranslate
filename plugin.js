class Plugin {
    constructor(workspace) {
        this.workspace = workspace;
        this.catName = '翻訳';
    }

    async onload() {
        this.registerBlocks();
        console.log("EasyTranslate Plugin loaded!");
    }

    async onunload() {
        this.unregisterBlocks();
        console.log("EasyTranslate Plugin unloaded.");
    }

    registerBlocks() {
        if (typeof Blockly === 'undefined') return;

        // 1. 翻訳実行 (APIキー不要版)
        Blockly.Blocks['translate_text'] = {
            init: function () {
                this.appendValueInput("TEXT")
                    .setCheck("String")
                    .appendField("🌍 ");
                this.appendDummyInput()
                    .appendField("を")
                    .appendField(new Blockly.FieldDropdown([
                        ["日本語", "ja"],
                        ["英語", "en"],
                        ["韓国語", "ko"],
                        ["中国語", "zh-CN"],
                        ["ドイツ語", "de"],
                        ["フランス語", "fr"],
                        ["スペイン語", "es"],
                        ["イタリア語", "it"]
                    ]), "LANG")
                    .appendField("に翻訳");
                this.setOutput(true, "String");
                this.setColour(230);
                this.setTooltip("指定したテキストをAPIキーなしで翻訳します。");
            }
        };

        // 2. 言語検知
        Blockly.Blocks['translate_detect_lang'] = {
            init: function () {
                this.appendValueInput("TEXT")
                    .setCheck("String")
                    .appendField("🌍 ");
                this.appendDummyInput()
                    .appendField("が何語か調べる");
                this.setOutput(true, "String");
                this.setColour(230);
                this.setTooltip("入力されたテキストが何語かを判定し、言語コード(ja, enなど)を返します。");
            }
        };

        const registerGenerator = (id, fn) => {
            if (Blockly.Python) {
                if (Blockly.Python.forBlock) {
                    Blockly.Python.forBlock[id] = fn;
                }
                Blockly.Python[id] = fn;
            }
        };

        // 翻訳実行ジェネレータ (GoogleTranslator)
        registerGenerator('translate_text', (block) => {
            const text = Blockly.Python.valueToCode(block, 'TEXT', (Blockly.Python.ORDER_ATOMIC || 0)) || '""';
            const lang = block.getFieldValue('LANG');

            if (Blockly.Python) {
                Blockly.Python.definitions_['import_google_translator'] = 'from deep_translator import GoogleTranslator';
            }

            // source='auto' で自動言語検出
            const code = `GoogleTranslator(source='auto', target='${lang}').translate(${text})`;
            return [code, (Blockly.Python.ORDER_ATOMIC || 0)];
        });

        // 言語検知ジェネレータ
        registerGenerator('translate_detect_lang', (block) => {
            const text = Blockly.Python.valueToCode(block, 'TEXT', (Blockly.Python.ORDER_ATOMIC || 0)) || '""';

            if (Blockly.Python) {
                Blockly.Python.definitions_['import_google_translator'] = 'from deep_translator import GoogleTranslator';
            }

            const code = `GoogleTranslator().detect(${text})`;
            return [code, (Blockly.Python.ORDER_ATOMIC || 0)];
        });

        this.updateToolbox();
    }

    updateToolbox() {
        const toolbox = document.getElementById('toolbox');
        if (!toolbox) return;

        let category = toolbox.querySelector(`category[name="${this.catName}"]`);
        if (!category) {
            category = document.createElement('category');
            category.setAttribute('name', this.catName);
            category.setAttribute('data-icon', '🌍');
            category.setAttribute('colour', '#42A5F5');
            toolbox.appendChild(category);
        }

        category.innerHTML = `
            <block type="translate_text"></block>
            <block type="translate_detect_lang"></block>
        `;

        if (this.workspace && this.workspace.updateToolbox) {
            this.workspace.updateToolbox(toolbox);
        }
    }

    unregisterBlocks() {
        const toolbox = document.getElementById('toolbox');
        if (toolbox) {
            const category = toolbox.querySelector(`category[name="${this.catName}"]`);
            if (category) {
                category.remove();
                if (this.workspace && this.workspace.updateToolbox) {
                    this.workspace.updateToolbox(toolbox);
                }
            }
        }
    }
}
