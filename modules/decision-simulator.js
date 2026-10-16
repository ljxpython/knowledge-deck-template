export function init({ root }) {
  const source = root.querySelector('#sim-source');
  const stepRetrieve = root.querySelector('#sim-step-retrieve');
  const stepPrompt = root.querySelector('#sim-step-prompt');
  const stepSummarize = root.querySelector('#sim-step-summarize');
  const answer = root.querySelector('#sim-answer');
  const jitter = root.querySelector('#sim-jitter');
  const burnTag = root.querySelector('#sim-burn');
  const stage = root.querySelector('#sim-stage');
  const stagePh = root.querySelector('#sim-stage-ph');
  const compileStatus = root.querySelector('#sim-compile-status');
  const tallyI = root.querySelector('#sim-tally-i');
  const tallyISteps = root.querySelector('#sim-tally-i-steps');
  const verdictI = root.querySelector('#sim-verdict-i');
  const tallyC = root.querySelector('#sim-tally-c');
  const tallyCHit = root.querySelector('#sim-tally-c-hit');
  const verdictC = root.querySelector('#sim-verdict-c');
  const askBtn = root.querySelector('#sim-ask-btn');
  const replayBtn = root.querySelector('#sim-replay-btn');
  const stageInd = root.querySelector('#sim-stage-ind');
  const fork = root.querySelector('#sim-fork');

  if (!askBtn) return () => {};

  const questionPool = [
    '大促突发峰值流量，QPS 超过日常 5 倍，系统如何应对？',
    '下游依赖服务偶发 2000ms 慢调用，会不会拖垮核心主链路？',
    '新业务线申请接入主数据库，应该允许直连还是走标准契约 API？',
    '系统主库磁盘报警只剩 15%，紧急垂直扩容还是冷热数据归档？',
    '模块架构重构拆分，团队对领域职责与事务边界产生严重分歧？'
  ];

  const summaryPool = [
    '临时通知运维盲目加机器扩容，先抗过今晚再说',
    '当场在调用处临时加个 try-catch 并硬编码 500ms 超时',
    '会议室拉齐 8 个人激烈争吵 2 小时，最后由 Leader 拍脑袋定夺',
    '临时写脚本把一周前的数据手动 truncate，风险不可控',
    '先搁置架构争议，采用妥协方案各写各的，技术债务累积'
  ];

  let qIdx = -1;
  let lastIdx = -1;
  let askCount = 0;
  let compiled = false;
  let busy = false;
  let timers = [];

  function later(fn, ms) {
    const t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function pickSummary() {
    let idx;
    do {
      idx = Math.floor(Math.random() * summaryPool.length);
    } while (idx === lastIdx && summaryPool.length > 1);
    lastIdx = idx;
    return summaryPool[idx];
  }

  function resetLeft() {
    [stepRetrieve, stepPrompt, stepSummarize].forEach(el => {
      if (el) el.classList.remove('active');
    });
    if (answer) answer.classList.remove('visible');
    if (jitter) jitter.textContent = '';
    if (burnTag) burnTag.classList.remove('show');
  }

  function setStage(text) {
    if (stageInd) stageInd.textContent = text;
  }

  function updateTally() {
    if (tallyI) tallyI.textContent = askCount;
    if (tallyISteps) tallyISteps.textContent = askCount * 3;
    if (verdictI) verdictI.textContent = askCount >= 2 ? '✗ 每个场景都重走·零资产复用' : '⚠ 临时拍脑袋·方案不沉淀';
    if (tallyC) tallyC.textContent = '1';
    if (tallyCHit) tallyCHit.textContent = askCount;
    if (verdictC) verdictC.textContent = askCount >= 2 ? '✓ 一次编译·持续工程复利' : '✓ 资产已沉淀·规则自闭环';
  }

  function runAsk() {
    if (busy) return;
    busy = true;
    askCount++;
    if (askBtn) askBtn.disabled = true;
    resetLeft();
    if (source) source.classList.add('reading');

    qIdx = (qIdx + 1) % questionPool.length;
    if (fork) {
      fork.classList.add('asking');
      fork.innerHTML = `<span class="dual-sim-q-tag">场景 ${askCount}</span>${questionPool[qIdx]}`;
    }

    setStage('左路 1/3 · 翻查零碎代码与文档 —— 即席推演每次都从头折腾');
    if (stepRetrieve) stepRetrieve.classList.add('active');

    if (!compiled) {
      if (stagePh) stagePh.style.display = 'none';
      if (stage) {
        stage.classList.remove('hit', 'done');
        stage.classList.add('compiling');
      }
      if (compileStatus) compileStatus.textContent = '首次推演：正在将工程共识编译为互链 ADR...';
    } else {
      if (stage) {
        stage.classList.remove('compiling');
        stage.classList.add('done', 'hit');
      }
      if (compileStatus) compileStatus.textContent = '新场景输入 → 立即命中已沉淀 ADR 知识网络 · 0ms 决策复利 ⚡';
      later(() => {
        if (stage) stage.classList.remove('hit');
      }, 750);
    }

    later(() => {
      if (stepPrompt) stepPrompt.classList.add('active');
      setStage('左路 2/3 · 拼凑临时方案 —— 各抒己见缺乏统一基准');
    }, 700);

    later(() => {
      if (stepSummarize) stepSummarize.classList.add('active');
      setStage('左路 3/3 · 现场拍脑袋拍板 —— 当场决策，质量不可靠且无法追溯');
      if (!compiled) {
        if (stage) {
          stage.classList.remove('compiling');
          stage.classList.add('done');
        }
        if (compileStatus) compileStatus.textContent = '编译完成 ✓ ADR 已沉淀为组织复利资产（持续可执行）';
        compiled = true;
      }
    }, 1400);

    later(() => {
      const ans = pickSummary();
      if (answer) {
        answer.textContent = ans;
        answer.classList.add('visible');
      }
      if (jitter) jitter.textContent = `第 ${askCount} 次 · 决策标准漂移`;
      if (burnTag) burnTag.classList.add('show');
      if (source) source.classList.remove('reading');
      updateTally();
      busy = false;
      if (askBtn) {
        askBtn.disabled = false;
        askBtn.textContent = '模拟下个决策场景';
      }
    }, 2000);
  }

  function resetAll() {
    clearTimers();
    busy = false;
    askCount = 0;
    qIdx = -1;
    lastIdx = -1;
    compiled = false;

    resetLeft();
    if (source) source.classList.remove('reading');
    if (fork) {
      fork.classList.remove('asking');
      fork.innerHTML = '点击「模拟下个决策场景」——观察 <b>即席推演</b> 与 <b>编译网络</b> 两种截然不同的演进命运 ↓';
    }
    if (answer) answer.textContent = '点击「模拟」后，临时得出一个即席决议……';
    if (stagePh) stagePh.style.display = '';
    if (stage) stage.classList.remove('compiling', 'done', 'hit');
    if (compileStatus) compileStatus.textContent = '等待首次决策编译……';

    if (tallyI) tallyI.textContent = '0';
    if (tallyISteps) tallyISteps.textContent = '0';
    if (verdictI) verdictI.textContent = '— 待观察';
    if (tallyC) tallyC.textContent = '0';
    if (tallyCHit) tallyCHit.textContent = '0';
    if (verdictC) verdictC.textContent = '— 产物待生成';

    if (askBtn) {
      askBtn.disabled = false;
      askBtn.textContent = '首次推演场景';
    }
    setStage('准备好后点击「首次推演场景」——左路重走三步，右路一次沉淀终身复用');
  }

  askBtn.addEventListener('click', runAsk);
  if (replayBtn) replayBtn.addEventListener('click', resetAll);

  return () => {
    clearTimers();
    askBtn.removeEventListener('click', runAsk);
    if (replayBtn) replayBtn.removeEventListener('click', resetAll);
  };
}
