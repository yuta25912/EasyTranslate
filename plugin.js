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
                this.setTooltip("指定したテキストをAPIキーなしで翻訳します。ボットをブロックしないよう非同期で実行されます。");
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
                this.setTooltip("入力されたテキストが何語かを判定し、言語コード(ja, enなど)を返します。ボットをブロックしないよう非同期で実行されます。");
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

        // 翻訳実行ジェネレータ
        // run_in_executor でスレッドを分けてボットをブロックしない
        // エラー時は "error" を返しコンソールに出力
        registerGenerator('translate_text', (block) => {
            const text = Blockly.Python.valueToCode(block, 'TEXT', (Blockly.Python.ORDER_ATOMIC || 0)) || '""';
            const lang = block.getFieldValue('LANG');

            if (Blockly.Python) {
                Blockly.Python.definitions_['import_google_translator'] = 'from deep_translator import GoogleTranslator';
                Blockly.Python.definitions_['import_asyncio'] = 'import asyncio';
                Blockly.Python.definitions_['import_functools'] = 'import functools';
                Blockly.Python.definitions_['helper_translate_text'] = [
                    'async def _translate_text(text, lang):',
                    '    try:',
                    '        # 数値を半角に変換',
                    '        _table = str.maketrans("０１２３４５６７８９", "0123456789")',
                    '        text = str(text).translate(_table)',
                    '        return await asyncio.get_event_loop().run_in_executor(None, functools.partial(GoogleTranslator(source="auto", target=lang).translate, text))',
                    '    except Exception as e:',
                    '        print(f"[EasyTranslate] 翻訳エラー: {e}")',
                    '        return "error"',
                ].join('\n');
            }

            const code = `await _translate_text(${text}, '${lang}')`;
            return [code, (Blockly.Python.ORDER_ATOMIC || 0)];
        });

        // 言語検知ジェネレータ
        // langdetect.detect を使用 (APIキー不要)
        // エラー時は "error" を返しコンソールに出力
        registerGenerator('translate_detect_lang', (block) => {
            const text = Blockly.Python.valueToCode(block, 'TEXT', (Blockly.Python.ORDER_ATOMIC || 0)) || '""';

            if (Blockly.Python) {
                Blockly.Python.definitions_['import_langdetect'] = 'from langdetect import detect as _langdetect_detect';
                Blockly.Python.definitions_['import_asyncio'] = 'import asyncio';
                Blockly.Python.definitions_['helper_detect_lang'] = [
                    'async def _detect_lang(text):',
                    '    try:',
                    '        text = str(text)',
                    '        if not text.strip(): return "error"',
                    '        # 数値のみの場合の判定ルール',
                    '        _is_half = all("0" <= c <= "9" for c in text)',
                    '        _is_full = all("\\uff10" <= c <= "\\uff19" for c in text)',
                    '        if _is_half: return "en"',
                    '        if _is_full: return "ja"',
                    '        return await asyncio.get_event_loop().run_in_executor(None, _langdetect_detect, text)',
                    '    except Exception as e:',
                    '        print(f"[EasyTranslate] 言語検知エラー: {e}")',
                    '        return "error"',
                ].join('\n');
            }

            const code = `await _detect_lang(${text})`;
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
