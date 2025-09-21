// ===== 西柚英语“看义选词”全自动答题脚本 V4 (temp1 定制版) =====
// 使用方法:
// 1. 打开做题网页
// 2. 在控制台准备好 `temp1` 变量 (包含单词列表)
// 3. 复制并粘贴本脚本的全部内容，按回车键运行

async function runXiyouSolverV4() {
    console.log('--- 自动答题脚本 V4 (temp1 定制版) 已启动 ---');

    // 步骤 1: 智能等待 `temp1` 变量
    async function waitForTemp1(timeout = 10000) {
        console.log('步骤 1: 正在等待 temp1 变量定义...');
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                if (typeof window.temp1 !== 'undefined' && Array.isArray(window.temp1) && window.temp1.length > 0) {
                    clearInterval(interval);
                    console.log('temp1 变量已找到！');
                    resolve(window.temp1);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    reject(new Error(`在 ${timeout / 1000} 秒内未能找到 temp1 变量。请确保已在控制台定义了 temp1。`));
                }
            }, 500); // 每 500ms 检查一次
        });
    }

    let wordList;
    try {
        wordList = await waitForTemp1();
        console.log(`成功从 temp1 加载 ${wordList.length} 个单词。`);
    } catch (e) {
        console.error('错误: ' + e.message);
        alert('错误: ' + e.message);
        return;
    }

    // 步骤 2: 创建标准化的答案地图
    console.log('步骤 2: 正在创建答案地图...');
    const answerMap = new Map();
    const normalizeText = (text) => text.replace(/\s+/g, ' ').trim();

    for (const item of wordList) {
        if (item.textBookParaphrase && item.titleType && item.titleType.optionsTypeList) {
            const chineseMeaning = normalizeText(item.textBookParaphrase);
            const correctOption = item.titleType.optionsTypeList.find(opt => opt.answer === true);
            if (chineseMeaning && correctOption) {
                const correctAnswerText = normalizeText(correctOption.text.replace(/^[A-D]\.\s*/, ''));
                answerMap.set(chineseMeaning, correctAnswerText);
            }
        }
    }
    console.log(`答案地图创建完成，共 ${answerMap.size} 个条目。`);

    // 步骤 3: 定义并执行解题循环
    async function solveNext() {
        const visibleQuestion = Array.from(document.querySelectorAll('.word-list')).find(el => el.offsetParent !== null);
        if (!visibleQuestion) {
            console.log('--- 任务完成 ---');
            alert('恭喜！所有题目已完成！');
            return;
        }
        const questionTextElement = visibleQuestion.querySelector('.name.fs-17');
        if (!questionTextElement) {
            setTimeout(solveNext, 1000);
            return;
        }
        const questionText = normalizeText(questionTextElement.innerText);
        const correctAnswer = answerMap.get(questionText);
        if (!correctAnswer) {
            console.error(`未找到答案: "${questionText}"`);
            const nextButton = visibleQuestion.querySelector('.next-btn');
            if (nextButton) {
                console.log('跳过此题...');
                nextButton.click();
                await new Promise(resolve => setTimeout(resolve, 1500));
                solveNext();
            }
            return;
        }
        const optionElements = visibleQuestion.querySelectorAll('.options .text');
        for (const optionElement of optionElements) {
            const optionText = normalizeText(optionElement.innerText.replace(/^[A-D]\.\s*/, ''));
            if (optionText === correctAnswer) {
                console.log(`找到答案: "${questionText}" -> "${correctAnswer}". 正在点击...`);
                optionElement.click();
                break;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 1200));
        const nextButton = visibleQuestion.querySelector('.next-btn');
        if (nextButton && nextButton.offsetParent !== null) {
            nextButton.click();
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
        solveNext();
    }

    console.log('步骤 3: 开始自动答题...');
    solveNext();
}

runXiyouSolverV4();