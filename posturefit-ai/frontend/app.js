let currentUser = null;
let currentPlan = null;
let currentAgentResult = null;
let selectedFeedback = "";
let currentLanguage = localStorage.getItem("posturefit-language") || "en";
let currentStep = 0;
let currentView = "wizard";
const totalSteps = 3;

const apiStatus = document.querySelector("#apiStatus");
const generateBtn = document.querySelector("#generateBtn");
const savePlanBtn = document.querySelector("#savePlanBtn");
const languageToggle = document.querySelector("#languageToggle");
const prevStepBtn = document.querySelector("#prevStepBtn");
const nextStepBtn = document.querySelector("#nextStepBtn");
const editInputsBtn = document.querySelector("#editInputsBtn");
const stepCounter = document.querySelector("#stepCounter");
const progressBar = document.querySelector("#progressBar");
const wizardCard = document.querySelector("#wizardCard");
const resultsPanel = document.querySelector("#resultsPanel");
const agentWorkflowPreview = document.querySelector("#agentWorkflowPreview");
const problemOptionsContainer = document.querySelector("#problemOptions");
const submitFeedbackBtn = document.querySelector("#submitFeedbackBtn");
const weeklyReviewBtn = document.querySelector("#weeklyReviewBtn");

const problemOptionSets = {
  posture_improvement: [
    { en: "Hunchback", zh: "驼背", problem: "hunchback and thoracic posture improvement" },
    { en: "Forward head", zh: "头前倾", problem: "forward head posture and upper back posture improvement" },
    { en: "Rounded shoulders", zh: "圆肩", problem: "rounded shoulders and shoulder posture improvement" },
    { en: "Anterior pelvic tilt", zh: "骨盆前倾", problem: "anterior pelvic tilt and pelvis control" },
    { en: "Knock knees", zh: "X 型腿", problem: "knock knees / X-leg lower body alignment" },
    { en: "Bow legs", zh: "O 型腿", problem: "bow legs / O-leg lower body alignment" },
    { en: "Weak core", zh: "核心无力", problem: "weak core and low back stability" },
    { en: "Scapular control", zh: "肩胛控制", problem: "scapular control, upper back strength, and shoulder stability" },
  ],
  fat_loss: [
    { en: "Full body", zh: "全身减脂", problem: "fat loss full-body compound training" },
    { en: "Waist & belly", zh: "腰腹", problem: "fat loss with core stability and waist training focus" },
    { en: "Hips & thighs", zh: "臀腿", problem: "fat loss with lower body hips and thighs training focus" },
    { en: "Arms", zh: "手臂", problem: "fat loss with arms and upper body conditioning focus" },
    { en: "Back", zh: "背部", problem: "fat loss with back strengthening and posture training focus" },
    { en: "Lower body", zh: "下肢", problem: "fat loss with lower-limb stability and leg training focus" },
    { en: "Cardio endurance", zh: "心肺耐力", problem: "fat loss with cardio intervals and training consistency" },
    { en: "Beginner reset", zh: "新手恢复", problem: "fat loss beginner full-body strength and movement pattern" },
  ],
  muscle_gain: [
    { en: "Glutes", zh: "臀部", problem: "glutes muscle gain and progressive glute work" },
    { en: "Legs", zh: "腿部", problem: "legs muscle gain with quadriceps hamstrings and glutes" },
    { en: "Back", zh: "背部", problem: "back muscle gain with middle and lower trapezius and rhomboids" },
    { en: "Shoulders", zh: "肩部", problem: "shoulder muscle gain with deltoids and shoulder external rotators" },
    { en: "Core", zh: "核心", problem: "core strength and abdominal muscle control" },
    { en: "Posterior chain", zh: "后侧链", problem: "posterior chain muscle gain with glutes hamstrings and back" },
    { en: "Lower body", zh: "下半身", problem: "lower body muscle gain with squat hinge and single-leg control" },
    { en: "Full body", zh: "全身增肌", problem: "full-body compound training and muscle gain" },
  ],
  body_shape: [
    { en: "Glute shape", zh: "臀部塑形", problem: "glute shape and臀腿塑形 with progressive glute work" },
    { en: "Leg line", zh: "腿部线条", problem: "leg line shaping with lower-limb stability and quadriceps control" },
    { en: "Waist line", zh: "腰腹线条", problem: "waist line shaping with core control and obliques" },
    { en: "Back line", zh: "背部线条", problem: "back line shaping with scapular retraction and back strengthening" },
    { en: "Shoulder line", zh: "肩部线条", problem: "shoulder line shaping with rounded shoulders and rear deltoids" },
    { en: "Arm line", zh: "手臂线条", problem: "arm line shaping with upper body strength and shoulder stability" },
    { en: "Hip posture", zh: "髋部体态", problem: "hip posture, hip stability, and glute activation" },
    { en: "Full proportion", zh: "整体比例", problem: "full-body proportion shaping with posture improvement and compound training" },
  ],
};

const translations = {
  en: {
    subtitle: "Problem-driven posture and body-shape workout agent",
    checkingApi: "Checking API",
    apiOnline: "API online",
    apiOffline: "API offline",
    switchLanguage: "中文",
    stepProfile: "Step 1: Profile",
    name: "Name",
    age: "Age",
    sex: "Sex",
    female: "female",
    male: "male",
    other: "other",
    maleBody: "Male",
    femaleBody: "Female",
    neutralBody: "Neutral",
    fitnessLevel: "Fitness Level",
    beginner: "beginner",
    intermediate: "intermediate",
    advanced: "advanced",
    height: "Height (cm)",
    weight: "Weight (kg)",
    goal: "Goal",
    postureImprovement: "posture_improvement",
    fatLoss: "fat_loss",
    muscleGain: "muscle_gain",
    bodyShape: "body_shape",
    injuryNotes: "Injury Notes",
    injuryPlaceholder: "Optional. Mention pain or injury concerns.",
    stepProblem: "Step 2: Problem",
    problemOptions: "Choose common focus areas",
    problemLabel: "Optional note",
    problemPlaceholder: "Optional. Add your own description, e.g. discomfort after sitting, preferred body part, or extra goal.",
    defaultProblem: "",
    stepScenario: "Step 3: Weekly Arrangement",
    home: "Home",
    gym: "Gym",
    homeSessions: "Home sessions per week",
    homeMinutes: "Minutes per home session",
    gymSessions: "Gym sessions per week",
    gymMinutes: "Minutes per gym session",
    homeSceneAlt: "Home training setup",
    gymSceneAlt: "Gym training setup",
    scheduleError: "Choose 1 to 7 total sessions per week. Any selected scene needs a session length between 15 and 90 minutes.",
    generatePlan: "Generate Plan",
    generating: "Generating...",
    saveEdits: "Save Edits",
    saving: "Saving...",
    editInputs: "Edit Inputs",
    previousStep: "Previous",
    nextStep: "Next Step",
    stepCounter: "Step {current} of {total}",
    planResult: "Plan Result",
    emptyState: "Generate a plan to see analysis, target muscles, weekly training days, and completion logs.",
    problemAnalysis: "Problem Analysis",
    targetMuscles: "Target Muscles",
    muscleMapTitle: "Muscle Map",
    muscle2DTitle: "Detailed Muscle Map",
    frontView: "Front",
    backView: "Back",
    highlightedMuscles: "Highlighted areas match the target muscles selected by the rule engine.",
    trainingFocus: "Training Focus",
    focusPhotoAlt: "Training focus photo",
    agentSummary: "Agent Summary",
    agentActivityTitle: "Agent Activity",
    agentPreviewHint: "FitAgent works through multiple agent modules before it returns a plan.",
    previewProfileAgent: "Reads your profile, goal, schedule, and injury notes.",
    previewMemoryManager: "Checks what FitAgent already remembers about you.",
    previewWorkoutPlanner: "Builds a structured weekly plan with the exercise rules.",
    previewSafetyChecker: "Reviews obvious risk before the plan is shown.",
    agentMemoryTitle: "FitAgent Memory",
    safetyReviewTitle: "Safety Review",
    feedbackTitle: "Feedback & Adjust",
    feedbackHint: "Tell FitAgent how the plan felt. The agent will remember it for the next adjustment.",
    weeklyReview: "Weekly Review",
    tooEasy: "Too easy",
    feltGood: "Good",
    tooHard: "Too hard",
    painDiscomfort: "Pain or discomfort",
    feedbackPlaceholder: "Example: Day 1 felt too hard after the second exercise. Please reduce intensity next week.",
    sendFeedback: "Send Feedback",
    sendingFeedback: "Sending...",
    agentReviewing: "FitAgent is reviewing...",
    feedbackSaved: "Feedback recorded. FitAgent will use it for the next adjustment.",
    chooseFeedback: "Please choose a feedback option or write a short note.",
    safetyLow: "Low risk",
    safetyReviewNeeded: "Review needed",
    noMemoryYet: "No long-term memory yet. Generate a plan or send feedback to teach FitAgent.",
    noSafetyWarnings: "No obvious risk was found by the basic safety checker.",
    exerciseSets: "Sets",
    exerciseReps: "Reps / time",
    exerciseRest: "Rest",
    weeklyPlan: "Weekly Plan",
    weeklyPlanHint: "Edit exercises, sets, reps, and rest time directly in the plan.",
    history: "History",
    warmup: "Warmup",
    warmupActions: "Warmup Actions",
    mainTraining: "Main Training",
    cooldown: "Cooldown",
    cooldownActions: "Cooldown Actions",
    safety: "Safety",
    markCompleted: "Mark as Completed",
    noLogs: "No completed workouts yet.",
    completedAt: "completed at",
    completedDay: "Completed day",
    generateError: "Could not generate plan",
    saveError: "Could not save plan",
    disclaimer:
      "This product provides general fitness and posture-improvement guidance only. It is not a medical diagnosis or treatment plan. Users with pain, injury, chronic disease, pregnancy, or severe posture problems should consult a qualified professional.",
  },
  zh: {
    subtitle: "问题驱动的体态与塑形训练 Agent",
    checkingApi: "检查 API",
    apiOnline: "API 在线",
    apiOffline: "API 离线",
    switchLanguage: "EN",
    stepProfile: "步骤 1：个人资料",
    name: "姓名",
    age: "年龄",
    sex: "性别",
    female: "女",
    male: "男",
    other: "其他",
    maleBody: "男生",
    femaleBody: "女生",
    neutralBody: "通用",
    fitnessLevel: "训练水平",
    beginner: "初级",
    intermediate: "中级",
    advanced: "高级",
    height: "身高（cm）",
    weight: "体重（kg）",
    goal: "目标",
    postureImprovement: "体态改善",
    fatLoss: "减脂",
    muscleGain: "增肌",
    bodyShape: "塑形",
    injuryNotes: "伤病备注",
    injuryPlaceholder: "可选。请说明疼痛、伤病或不适情况。",
    stepProblem: "步骤 2：想改善的问题",
    problemOptions: "选择常见问题或部位",
    problemLabel: "可选备注",
    problemPlaceholder: "可选。补充自己的描述，例如久坐后不适、想重点改善的部位或额外目标。",
    defaultProblem: "",
    stepScenario: "步骤 3：一周训练安排",
    home: "居家",
    gym: "健身房",
    homeSessions: "每周居家次数",
    homeMinutes: "每次居家时长",
    gymSessions: "每周健身房次数",
    gymMinutes: "每次健身房时长",
    homeSceneAlt: "居家训练场景",
    gymSceneAlt: "健身房训练场景",
    scheduleError: "请选择每周总共 1 到 7 次训练；已选择的场景需要填写 15 到 90 分钟的训练时长。",
    generatePlan: "生成计划",
    generating: "生成中...",
    saveEdits: "保存修改",
    saving: "保存中...",
    editInputs: "修改输入",
    previousStep: "上一步",
    nextStep: "下一步",
    stepCounter: "第 {current} / {total} 步",
    planResult: "计划结果",
    emptyState: "生成计划后，可查看问题分析、目标肌群、每周训练安排和打卡记录。",
    problemAnalysis: "问题分析",
    targetMuscles: "目标肌群",
    muscleMapTitle: "肌肉示意图",
    muscle2DTitle: "精细肌肉分块图",
    frontView: "正面",
    backView: "背面",
    highlightedMuscles: "红色区域对应规则引擎推荐关注的目标肌群。",
    trainingFocus: "训练重点",
    focusPhotoAlt: "训练重点照片",
    agentSummary: "Agent 总结",
    agentActivityTitle: "Agent 工作流",
    agentPreviewHint: "FitAgent 会先通过多个 Agent 模块协作，然后再返回训练计划。",
    previewProfileAgent: "读取你的画像、目标、时间安排和伤病备注。",
    previewMemoryManager: "检查 FitAgent 已经记住的偏好和上下文。",
    previewWorkoutPlanner: "基于动作规则生成结构化每周训练计划。",
    previewSafetyChecker: "在展示计划前检查明显训练风险。",
    agentMemoryTitle: "FitAgent 记忆",
    safetyReviewTitle: "安全检查",
    feedbackTitle: "反馈与调整",
    feedbackHint: "告诉 FitAgent 这次训练感受如何，Agent 会记住并用于下次调整。",
    weeklyReview: "生成周复盘",
    tooEasy: "太轻松",
    feltGood: "刚刚好",
    tooHard: "太难",
    painDiscomfort: "疼痛或不适",
    feedbackPlaceholder: "例如：第 1 天第二个动作后感觉太难，下周请降低强度。",
    sendFeedback: "发送反馈",
    sendingFeedback: "发送中...",
    agentReviewing: "FitAgent 正在复盘...",
    feedbackSaved: "反馈已记录，FitAgent 会用于下次调整。",
    chooseFeedback: "请先选择一个反馈选项，或写一段简短说明。",
    safetyLow: "低风险",
    safetyReviewNeeded: "需要复核",
    noMemoryYet: "暂无长期记忆。生成计划或发送反馈后，FitAgent 会开始记住你的偏好。",
    noSafetyWarnings: "基础安全检查未发现明显风险。",
    exerciseSets: "组数",
    exerciseReps: "次数/时长",
    exerciseRest: "休息",
    weeklyPlan: "每周计划",
    weeklyPlanHint: "可以直接修改计划中的动作、组数、次数和休息时间。",
    history: "历史记录",
    warmup: "热身",
    warmupActions: "热身动作",
    mainTraining: "正式训练",
    cooldown: "放松",
    cooldownActions: "最后放松动作",
    safety: "安全提示",
    markCompleted: "标记完成",
    noLogs: "还没有完成记录。",
    completedAt: "完成于",
    completedDay: "完成第",
    generateError: "无法生成计划",
    saveError: "无法保存计划",
    disclaimer:
      "本产品仅提供一般性的健身与体态改善建议，不是医学诊断或治疗方案。如有疼痛、伤病、慢性疾病、孕期情况或严重体态问题，请咨询合格专业人士。",
  },
};

const termTranslations = {
  "gluteus medius": "臀中肌",
  "gluteus maximus": "臀大肌",
  "hip external rotators": "髋外旋肌群",
  "quadriceps control": "股四头肌稳定控制",
  adductors: "内收肌群",
  "calf stabilizers": "小腿稳定肌群",
  "middle and lower trapezius": "中下斜方肌",
  rhomboids: "菱形肌",
  "shoulder external rotators": "肩袖外旋肌群",
  "rear deltoids": "三角肌后束",
  "thoracic extensors": "胸椎伸展肌群",
  "core muscles": "核心肌群",
  hamstrings: "腘绳肌",
  "rectus abdominis": "腹直肌",
  obliques: "腹斜肌",
  "deep core": "深层核心",
  "spinal stabilizers": "脊柱稳定肌群",
  quadriceps: "股四头肌",
  "full-body compound training": "全身复合训练",
  "hip abduction": "髋外展",
  "glute activation": "臀部激活",
  "lower-limb stability": "下肢稳定性",
  "controlled squatting": "可控深蹲模式",
  "hip stability": "髋部稳定",
  "foot and ankle control": "足踝控制",
  "scapular retraction": "肩胛后缩",
  "thoracic extension": "胸椎伸展",
  "chest stretching": "胸肌拉伸",
  "thoracic mobility": "胸椎活动度",
  "back strengthening": "背部强化",
  "core stability": "核心稳定",
  "core control": "核心控制",
  "hip flexor stretching": "髋屈肌拉伸",
  "core bracing": "核心支撑",
  "spinal stability": "脊柱稳定",
  "controlled breathing": "控制呼吸",
  "progressive glute work": "渐进式臀部训练",
  "hip hinge pattern": "髋铰链模式",
  "single-leg control": "单腿控制",
  "strength training": "力量训练",
  "cardio intervals": "有氧间歇",
  "training consistency": "训练频率与坚持",
  "shoulder stability": "肩部稳定",
  foundation: "基础训练",
  home: "居家",
  gym: "健身房",
};

const exerciseTranslations = {
  "Glute Bridge": {
    name: "臀桥",
    instruction: "脚跟发力向上顶髋，在最高点短暂停留，注意不要塌腰。",
    safety: "如果出现明显腰痛，请停止动作。",
  },
  Clamshell: {
    name: "侧卧蚌式开合",
    instruction: "保持骨盆叠放稳定，打开上侧膝盖时不要让身体向后滚。",
    safety: "使用小而无痛的活动范围。",
  },
  "Side-Lying Hip Abduction": {
    name: "侧卧抬腿",
    instruction: "上侧腿略微向身体后方抬起，脚尖保持朝前。",
    safety: "避免髋前侧出现夹挤感。",
  },
  "Bodyweight Squat": {
    name: "徒手深蹲",
    instruction: "臀部向后向下坐，膝盖沿脚尖方向稳定移动。",
    safety: "深度以自己能稳定控制为准。",
  },
  "Wall Angel": {
    name: "靠墙滑臂",
    instruction: "肋骨下沉，手臂沿墙面在舒适范围内上下滑动。",
    safety: "不要强行追求肩部活动幅度。",
  },
  "Bird Dog": {
    name: "四点跪姿对侧伸展",
    instruction: "对侧手脚伸出，同时保持骨盆水平和躯干稳定。",
    safety: "慢速完成，颈部保持放松。",
  },
  "Dead Bug": {
    name: "仰卧死虫",
    instruction: "腰背轻轻贴向地面，对侧手脚缓慢移动。",
    safety: "如果腰部拱起，就缩小动作幅度。",
  },
  Plank: {
    name: "平板支撑",
    instruction: "从肩到脚踝保持一条直线，并持续稳定呼吸。",
    safety: "动作变形前就结束这一组。",
  },
  "Side Plank": {
    name: "侧桥支撑",
    instruction: "肩、髋叠放，抬起骨盆并保持身体侧线稳定。",
    safety: "需要时可以改成屈膝版本。",
  },
  "Hip Flexor Stretch": {
    name: "跪姿髋前侧拉伸",
    instruction: "轻轻收骨盆，再向前移动到髋前侧有拉伸感。",
    safety: "避免通过塌腰来增加幅度。",
  },
  "Doorway Chest Stretch": {
    name: "门框胸肌拉伸",
    instruction: "前臂扶在门框上，身体轻轻向前移动。",
    safety: "保持温和拉伸，不要拉到疼痛。",
  },
  "Reverse Snow Angel": {
    name: "俯卧肩胛划臂",
    instruction: "俯卧后手臂缓慢划弧，肩膀远离耳朵。",
    safety: "肩部紧张时缩小动作范围。",
  },
  "Step-Up": {
    name: "台阶踏上",
    instruction: "整只脚踩稳发力，下降阶段慢慢控制。",
    safety: "先使用较低台阶。",
  },
  "Split Squat": {
    name: "原地分腿蹲",
    instruction: "身体垂直下降，前侧膝盖稳定朝脚尖方向移动。",
    safety: "需要平衡时扶墙完成。",
  },
  "Bodyweight Good Morning": {
    name: "徒手髋铰链",
    instruction: "从髋部折叠，脊柱保持延展，再收紧臀部站起。",
    safety: "只做到能轻松控制的幅度。",
  },
  "Calf Raise": {
    name: "提踵",
    instruction: "通过大脚趾根部发力抬高脚跟，再慢慢下降。",
    safety: "可以扶墙保持平衡。",
  },
  "Slow Mountain Climber": {
    name: "慢速登山跑",
    instruction: "膝盖向胸口移动，避免髋部上下弹动。",
    safety: "手腕或腰背不适时放慢速度。",
  },
  "Glute Bridge March": {
    name: "臀桥交替抬腿",
    instruction: "保持臀桥姿势，交替抬脚时骨盆不要下沉。",
    safety: "动作变形时退回普通臀桥。",
  },
  "Hip Abduction Machine": {
    name: "坐姿髋外展",
    instruction: "有控制地打开双膝，短暂停顿后慢慢回位。",
    safety: "选择不会造成髋部夹挤的重量。",
  },
  "Cable Hip Abduction": {
    name: "绳索侧抬腿",
    instruction: "站直后将训练腿向身体外侧略后方移动。",
    safety: "避免身体倾斜或甩腿借力。",
  },
  "Romanian Deadlift": {
    name: "罗马尼亚硬拉",
    instruction: "从髋部折叠，重量贴近腿部移动。",
    safety: "脊柱保持中立，负重从保守重量开始。",
  },
  "Seated Row": {
    name: "坐姿划船",
    instruction: "手肘向后拉，轻轻夹紧肩胛骨。",
    safety: "避免耸肩代偿。",
  },
  "Lat Pulldown": {
    name: "高位下拉",
    instruction: "肋骨下沉，将横杆拉向上胸位置。",
    safety: "不要做颈后下拉。",
  },
  "Face Pull": {
    name: "绳索面拉",
    instruction: "绳索拉向眼睛高度，手肘抬高，手腕放松。",
    safety: "使用轻重量并保持动作顺滑。",
  },
  "Leg Press": {
    name: "器械腿举",
    instruction: "整只脚发力推起，膝盖稳定朝脚尖方向移动。",
    safety: "顶端不要用力锁死膝盖。",
  },
  "Goblet Squat": {
    name: "哑铃杯式深蹲",
    instruction: "将重量抱在胸前，深蹲时保持膝盖稳定。",
    safety: "选择能保持姿态稳定的重量。",
  },
  "Cable Pull Through": {
    name: "绳索臀部后拉",
    instruction: "向后做髋铰链，再通过收紧臀部站直。",
    safety: "不要把它做成深蹲。",
  },
  "Back Extension": {
    name: "罗马椅挺身",
    instruction: "从髋部发力完成动作，顶端保持脊柱自然延展。",
    safety: "不要过度后仰腰椎。",
  },
  "Chest-Supported Row": {
    name: "俯身胸托划船",
    instruction: "胸部贴稳长凳，手肘朝髋部方向拉。",
    safety: "颈部保持放松。",
  },
  "Pallof Press": {
    name: "绳索抗旋转推",
    instruction: "双手向前推出，同时抵抗躯干旋转。",
    safety: "先使用轻阻力。",
  },
  "Incline Walk": {
    name: "坡度快走",
    instruction: "用呼吸加快但仍可控制的速度行走。",
    safety: "只有需要平衡时才扶扶手。",
  },
  "Sled Push": {
    name: "推雪橇",
    instruction: "保持稳定躯干角度，用短而有力的步伐推动。",
    safety: "确认空间安全，并使用保守负重。",
  },
};

const routineActions = {
  warmup: [
    {
      name: "Breathing Reset",
      zhName: "呼吸重置",
      sets: "1",
      duration: "60 sec",
      zhDuration: "60 秒",
      instruction: "Stand tall or lie down, breathe through the nose, and let the ribs expand evenly.",
      zhInstruction: "站姿或仰卧，用鼻吸气，让肋骨均匀打开。",
    },
    {
      name: "Joint Mobility Flow",
      zhName: "关节活动流",
      sets: "1",
      duration: "2 min",
      zhDuration: "2 分钟",
      instruction: "Move shoulders, hips, knees, and ankles slowly through a comfortable range.",
      zhInstruction: "缓慢活动肩、髋、膝、踝，范围保持舒适。",
    },
  ],
  cooldown: [
    {
      name: "Target Area Stretch",
      zhName: "目标区域拉伸",
      sets: "1",
      duration: "45 sec each side",
      zhDuration: "每侧 45 秒",
      instruction: "Stretch the main area trained today with slow breathing and no bouncing.",
      zhInstruction: "拉伸当天主要训练区域，配合慢呼吸，不要弹振。",
    },
    {
      name: "Relaxed Breathing",
      zhName: "放松呼吸",
      sets: "1",
      duration: "90 sec",
      zhDuration: "90 秒",
      instruction: "Lower the heart rate with easy nasal breathing and relaxed shoulders.",
      zhInstruction: "用轻松鼻呼吸降低心率，同时放松肩颈。",
    },
  ],
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return response.json();
}

async function checkHealth() {
  try {
    await request("/api/health");
    apiStatus.textContent = t("apiOnline");
  } catch {
    apiStatus.textContent = t("apiOffline");
  }
}

function profilePayload() {
  return {
    name: value("name"),
    age: Number(value("age")),
    sex: choiceValue("sex"),
    height_cm: Number(value("height")),
    weight_kg: Number(value("weight")),
    fitness_level: choiceValue("fitnessLevel"),
    goal: choiceValue("goal"),
    injury_notes: value("injuryNotes"),
  };
}

function planPayload() {
  const schedule = schedulePayload();
  return {
    user_id: currentUser.id,
    problem: combinedProblemText(),
    weekly_frequency: schedule.weeklyFrequency,
    session_minutes: schedule.averageMinutes,
    scenario: schedule.scenario,
    home_sessions: schedule.homeSessions,
    home_minutes: schedule.homeMinutes,
    gym_sessions: schedule.gymSessions,
    gym_minutes: schedule.gymMinutes,
  };
}

function agentPayload(intent = null, message = null) {
  const payload = planPayload();
  return {
    ...payload,
    intent,
    message: message || payload.problem,
    injuries: value("injuryNotes"),
  };
}

async function generatePlan() {
  if (!validateCurrentStep()) return;
  generateBtn.disabled = true;
  generateBtn.textContent = t("generating");
  try {
    currentUser = await request("/api/users", {
      method: "POST",
      body: JSON.stringify(profilePayload()),
    });
    currentPlan = await request("/api/generate-plan", {
      method: "POST",
      body: JSON.stringify(planPayload()),
    });
    currentAgentResult = await request("/api/agent/run", {
      method: "POST",
      body: JSON.stringify(agentPayload("generate_workout_plan")),
    });
    currentView = "results";
    renderPlan(currentPlan);
    await renderHistory();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    alert(`${t("generateError")}: ${error.message}`);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = t("generatePlan");
  }
}

function renderPlan(plan) {
  applyViewMode();
  if (currentView === "results") {
    resultsPanel.classList.remove("hidden");
  }
  document.querySelector("#emptyState").classList.add("hidden");
  document.querySelector("#planOutput").classList.remove("hidden");
  savePlanBtn.disabled = false;
  text("problemAnalysis", localizeAnalysis(plan));
  text("agentSummary", localizeAgentSummary(plan));
  renderMuscleMap(plan.target_muscles);
  renderChips("targetMuscles", plan.target_muscles);
  renderTrainingFocusPhotos(plan.training_focus);
  renderChips("trainingFocus", plan.training_focus);
  renderWeeklyPlan(plan.weekly_plan);
  renderAgentExperience(currentAgentResult, plan);
}

function renderAgentExperience(agentResult, plan) {
  renderAgentActivity(agentResult);
  renderAgentMemory(agentResult);
  renderSafetyReview(agentResult);
  renderAgentAdjustment("");
}

function renderAgentActivity(agentResult) {
  const container = document.querySelector("#agentActivity");
  if (!container) return;
  const intent = agentResult?.intent || "generate_workout_plan";
  const steps =
    currentLanguage === "zh"
      ? [
          ["Profile Agent", "分析年龄、训练水平、目标、时间安排和伤病备注。"],
          ["Memory Manager", "读取已有偏好，并写入本次最新训练请求。"],
          ["Orchestrator", `将本次请求路由为 ${intent}。`],
          ["Workout Planner", "基于本地动作规则生成结构化每周训练计划。"],
          ["Safety Checker", "检查训练强度、休息日和明显伤病风险。"],
          ["Nutrition Planner", "补充保守的饮食习惯建议和健康免责声明。"],
        ]
      : [
          ["Profile Agent", "Analyzed age, training level, goal, schedule, and injury notes."],
          ["Memory Manager", "Checked previous preferences and wrote the latest request."],
          ["Orchestrator", `Routed this request as ${intent}.`],
          ["Workout Planner", "Generated a structured weekly plan from the local exercise rules."],
          ["Safety Checker", "Reviewed intensity, rest days, and obvious injury risk."],
          ["Nutrition Planner", "Added conservative habit guidance with a health disclaimer."],
        ];
  container.innerHTML = steps
    .map(
      ([title, detail]) => `
        <div class="agent-step">
          <span class="agent-step-icon">✓</span>
          <div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></div>
        </div>
      `
    )
    .join("");
}

function renderAgentMemory(agentResult) {
  const container = document.querySelector("#agentMemory");
  if (!container) return;
  const memories = agentResult?.memory || [];
  if (!memories.length) {
    container.innerHTML = `<p class="muted">${t("noMemoryYet")}</p>`;
    return;
  }
  container.innerHTML = memories
    .slice(0, 5)
    .map(
      (item) => `
        <div class="memory-row">
          <strong><span class="memory-type">${escapeHtml(item.type || "memory")}</span>${escapeHtml(humanizeKey(item.key || "memory"))}</strong>
          <span>${escapeHtml(localizeMemoryValue(item.value || ""))}</span>
        </div>
      `
    )
    .join("");
}

function renderSafetyReview(agentResult) {
  const container = document.querySelector("#safetyReview");
  if (!container) return;
  const review = agentResult?.safety_review;
  if (!review) {
    container.innerHTML = `<p class="muted">${t("noSafetyWarnings")}</p>`;
    return;
  }
  const warnings = review.warnings || [];
  const lowRisk = review.risk_level === "low";
  container.innerHTML = `
    <div class="safety-status ${lowRisk ? "low" : "review-needed"}">
      <strong>${lowRisk ? t("safetyLow") : t("safetyReviewNeeded")}</strong>
      <span>${escapeHtml(localizeSafetyDisclaimer(review.disclaimer || ""))}</span>
    </div>
    ${
      warnings.length
        ? `<ul class="safety-warning">${warnings.map((warning) => `<li>${escapeHtml(localizeSafetyWarning(warning))}</li>`).join("")}</ul>`
        : `<p class="muted">${t("noSafetyWarnings")}</p>`
    }
  `;
}

function renderAgentAdjustment(message, mode = "info") {
  const container = document.querySelector("#agentAdjustment");
  if (!container) return;
  if (!message) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = `<div class="agent-adjustment ${mode}">${escapeHtml(message)}</div>`;
}

function humanizeKey(key) {
  if (currentLanguage === "zh") {
    const labels = {
      latest_training_request: "最新训练请求",
      latest_safety_warnings: "最新安全提醒",
      latest_feedback: "最新训练反馈",
      memory: "记忆",
    };
    return labels[key] || String(key).replaceAll("_", " ");
  }
  return String(key).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function localizeMemoryValue(value) {
  if (currentLanguage !== "zh") return value;
  return String(value)
    .replace(/Create a/gi, "生成")
    .replace(/day home workout plan/gi, "天居家训练计划")
    .replace(/for rounded shoulders/gi, "用于改善圆肩")
    .replace(/The plan felt too easy/gi, "训练计划太轻松")
    .replace(/The plan felt good/gi, "训练计划刚刚好")
    .replace(/The plan felt too hard/gi, "训练计划太难")
    .replace(/I felt pain or discomfort/gi, "我感到疼痛或不适");
}

function localizeSafetyDisclaimer(value) {
  if (currentLanguage !== "zh") return value;
  return "这是基础自动安全筛查，不等同于医学许可或专业诊断。";
}

function localizeSafetyWarning(value) {
  if (currentLanguage !== "zh") return value;
  return String(value)
    .replace("Knee injury was mentioned, so high-impact or aggressive conditioning should be replaced.", "你提到了膝盖伤病，应替换高冲击或过于激烈的训练。")
    .replace("Beginner frequency above 5 sessions per week may reduce recovery. Start with 2-4 sessions.", "新手每周训练超过 5 次可能影响恢复，建议先从每周 2-4 次开始。")
    .replace("The weekly plan has no rest day. Add at least one recovery day.", "当前每周计划没有休息日，建议至少加入 1 天恢复日。")
    .replace("Pain, dizziness, numbness, or sharp discomfort requires stopping exercise and consulting a professional.", "如果出现疼痛、头晕、麻木或尖锐不适，应停止训练并咨询专业人士。");
}

function renderChips(id, items) {
  const container = document.querySelector(`#${id}`);
  container.innerHTML = "";
  items.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = localizeTerm(item);
    container.appendChild(chip);
  });
}

function renderTrainingFocusPhotos(focusItems) {
  const container = document.querySelector("#trainingFocusPhotos");
  container.innerHTML = "";
  const seen = new Set();
  focusItems.forEach((focus) => {
    const asset = focusPhotoFor(focus);
    if (seen.has(asset.src)) return;
    seen.add(asset.src);
    const card = document.createElement("article");
    card.className = "focus-photo-card";
    card.innerHTML = `
      <img src="${asset.src}" alt="${t("focusPhotoAlt")}: ${escapeAttr(localizeTerm(focus))}" loading="lazy" />
      <div>
        <strong>${localizeTerm(focus)}</strong>
        <span>${asset.caption}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderMuscleMap(targetMuscles) {
  const container = document.querySelector("#muscleMap");
  const activeSlugs = muscleSlugsFor(targetMuscles);
  const sex = currentUser?.sex || choiceValue("sex");
  const gender = sex === "female" ? "female" : "male";
  const sexLabel = gender === "female" ? t("femaleBody") : t("maleBody");
  container.innerHTML = `
    <div class="anatomy-map ${gender}" data-sex-label="${sexLabel}">
      <div class="muscle-body-grid">
        ${renderBodyFigure(gender, "front", activeSlugs)}
        ${renderBodyFigure(gender, "back", activeSlugs)}
      </div>
    </div>
    <p class="asset-credit">Muscle SVG model: <a href="https://github.com/soroojshehryar/react-muscle-highlighter" target="_blank" rel="noreferrer">react-muscle-highlighter</a>, MIT License</p>
  `;
}

function renderBodyFigure(gender, side, activeSlugs) {
  const model = window.MUSCLE_BODY_DATA?.[gender]?.[side] || [];
  const viewBox = viewBoxFor(gender, side);
  const label = side === "front" ? t("frontView") : t("backView");
  const paths = model
    .map((part) => renderBodyPart(part, activeSlugs))
    .join("");
  return `
    <figure class="muscle-body-figure">
      <figcaption>${label}</figcaption>
      <svg viewBox="${viewBox}" role="img" aria-label="${sexLabelFor(gender)} ${label} ${t("muscleMapTitle")}">
        ${paths}
      </svg>
    </figure>
  `;
}

function renderBodyPart(part, activeSlugs) {
  const isActive = activeSlugs.has(part.slug);
  const decorative = ["hair", "head", "hands", "feet", "ankles", "knees"].includes(part.slug);
  const classes = ["body-part", `part-${part.slug}`, isActive ? "active" : "", decorative ? "decorative" : ""]
    .filter(Boolean)
    .join(" ");
  return Object.values(part.path)
    .flat()
    .map((path) => `<path class="${classes}" data-muscle="${part.slug}" d="${path}"></path>`)
    .join("");
}

function viewBoxFor(gender, side) {
  if (gender === "female") {
    return side === "front" ? "-50 -40 734 1538" : "756 0 774 1448";
  }
  return side === "front" ? "0 0 724 1448" : "724 0 724 1448";
}

function sexLabelFor(gender) {
  return gender === "female" ? t("femaleBody") : t("maleBody");
}

function renderWeeklyPlan(days) {
  const container = document.querySelector("#weeklyPlan");
  container.innerHTML = "";
  days.forEach((day, dayIndex) => {
    const card = document.createElement("article");
    card.className = "day-card";
    card.innerHTML = `
      <h3>${localizeDayTitle(day.title, day.day_number)}</h3>
      <p><strong>${labelWithColon(t("warmup"))}</strong> ${localizeWarmup(day.warmup)}</p>
      ${renderRoutineBlock("warmup")}
      <h4 class="plan-section-title">${t("mainTraining")}</h4>
      <div class="exercise-list"></div>
      <p><strong>${labelWithColon(t("cooldown"))}</strong> ${localizeCooldown(day.cooldown)}</p>
      ${renderRoutineBlock("cooldown")}
      <button class="complete" data-day="${day.day_number}">${t("markCompleted")}</button>
    `;
    const list = card.querySelector(".exercise-list");
    day.exercises.forEach((exercise, exerciseIndex) => {
      list.appendChild(exerciseEditor(exercise, dayIndex, exerciseIndex));
    });
    container.appendChild(card);
  });
}

function exerciseEditor(exercise, dayIndex, exerciseIndex) {
  const row = document.createElement("div");
  row.className = "exercise-row";
  row.innerHTML = `
    <div class="exercise-visual">
      <img src="${exerciseImageSrc(exercise)}" alt="${escapeAttr(localizeExerciseName(exercise.name))} illustration" loading="lazy" />
    </div>
    <div class="exercise-fields">
      <input class="exercise-name-input" aria-label="Exercise name" value="${escapeAttr(localizeExerciseName(exercise.name))}" data-field="name" />
      <div class="exercise-stats">
        <label><span>${t("exerciseSets")}</span><input aria-label="Sets" value="${escapeAttr(exercise.sets)}" data-field="sets" /></label>
        <label><span>${t("exerciseReps")}</span><input aria-label="Reps or duration" value="${escapeAttr(localizeRepsOrDuration(exercise.reps_or_duration))}" data-field="reps_or_duration" /></label>
        <label><span>${t("exerciseRest")}</span><input aria-label="Rest seconds" type="number" value="${exercise.rest_seconds}" data-field="rest_seconds" /></label>
      </div>
    </div>
    <div class="exercise-meta">${escapeHtml(localizeExerciseInstruction(exercise))}<br />${labelWithColon(t("safety"))} ${escapeHtml(localizeExerciseSafety(exercise))}</div>
  `;
  row.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      const field = input.dataset.field;
      const value = field === "rest_seconds" ? Number(input.value) : input.value;
      currentPlan.weekly_plan[dayIndex].exercises[exerciseIndex][field] = value;
    });
  });
  return row;
}

const exerciseVisualById = {
  home_glute_bridge: "bridge",
  home_clamshell: "side_lying",
  home_side_lying_abduction: "side_lying",
  home_bodyweight_squat: "squat",
  home_wall_angel: "wall",
  home_bird_dog: "quadruped",
  home_dead_bug: "supine",
  home_plank: "plank",
  home_side_plank: "side_plank",
  home_hip_flexor_stretch: "lunge",
  home_chest_stretch: "doorway",
  home_reverse_snow_angel: "prone",
  home_step_up: "step",
  home_split_squat: "split_squat",
  home_good_morning: "hinge",
  home_calf_raise: "calf_raise",
  home_mountain_climber: "mountain",
  home_glute_march: "bridge",
  gym_hip_abduction_machine: "machine",
  gym_cable_hip_abduction: "cable_stand",
  gym_romanian_deadlift: "hinge_weight",
  gym_seated_row: "row",
  gym_lat_pulldown: "pulldown",
  gym_face_pull: "face_pull",
  gym_leg_press: "leg_press",
  gym_goblet_squat: "goblet",
  gym_cable_pull_through: "cable_hinge",
  gym_back_extension: "back_extension",
  gym_chest_supported_row: "bench_row",
  gym_pallof_press: "pallof",
  gym_treadmill_incline_walk: "treadmill",
  gym_sled_push: "sled",
};

function exerciseImageSrc(exercise) {
  const pose = exerciseVisualById[exercise.exercise_ref_id] || poseFromExerciseName(exercise.name);
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(exerciseSvg(exercise, pose))}`;
}

function poseFromExerciseName(name) {
  const text = String(name).toLowerCase();
  if (text.includes("squat")) return "squat";
  if (text.includes("row")) return "row";
  if (text.includes("plank")) return "plank";
  if (text.includes("bridge")) return "bridge";
  if (text.includes("stretch")) return "lunge";
  if (text.includes("walk")) return "treadmill";
  return "standing";
}

function exerciseSvg(exercise, pose) {
  const scene = sceneForExercise(exercise, pose);
  const body = exercisePoseMarkup(pose);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 168" role="img">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="${scene.bg}"/>
        </linearGradient>
      </defs>
      <rect width="240" height="168" rx="18" fill="url(#bg)"/>
      ${scene.backdrop}
      <path d="M22 134H218" stroke="#d8ded9" stroke-width="6" stroke-linecap="round"/>
      <rect x="14" y="12" width="${scene.badgeWidth}" height="25" rx="12.5" fill="${scene.badgeFill}"/>
      <text x="27" y="29" fill="${scene.badgeText}" font-family="Arial, sans-serif" font-size="12" font-weight="800">${scene.badge}</text>
      <text x="18" y="157" fill="#5f6874" font-family="Arial, sans-serif" font-size="12" font-weight="700">${escapeSvgText(scene.equipment)}</text>
      <g transform="translate(30 22) scale(1.06)">
        ${body}
      </g>
    </svg>
  `;
}

function sceneForExercise(exercise, pose) {
  const refId = exercise.exercise_ref_id || "";
  const isGym = refId.startsWith("gym_");
  const equipment = equipmentLabel(exercise, pose, isGym);
  return {
    bg: isGym ? "#f3f6fb" : "#f7faf8",
    badge: isGym ? (currentLanguage === "zh" ? "健身房" : "GYM") : currentLanguage === "zh" ? "居家" : "HOME",
    badgeWidth: currentLanguage === "zh" ? 66 : isGym ? 54 : 66,
    badgeFill: isGym ? "#dbeafe" : "#e4f1eb",
    badgeText: isGym ? "#326da8" : "#26735a",
    equipment,
    backdrop: isGym ? gymBackdrop(pose) : homeBackdrop(pose),
  };
}

function homeBackdrop(pose) {
  const mat = `<rect x="40" y="122" width="142" height="12" rx="6" fill="#dceee5"/>`;
  const room = `<path d="M190 34h28v38h-28z" fill="#fff" stroke="#d8ded9" stroke-width="3"/><path d="M204 34v38M190 53h28" stroke="#d8ded9" stroke-width="2"/>`;
  const plant = `<path d="M31 116c-7-14 2-28 13-34c1 16-3 26-13 34zM31 116c7-12 18-17 30-13c-8 10-17 14-30 13z" fill="#e4f1eb" stroke="#26735a" stroke-width="2"/>`;
  const wall = pose === "wall" ? `<path d="M42 38v86" stroke="#b38324" stroke-width="5" stroke-linecap="round"/>` : "";
  const doorway = pose === "doorway" ? `<path d="M46 32v92M130 32v92M46 32h84" stroke="#b38324" stroke-width="5" stroke-linecap="round"/>` : "";
  const step = pose === "step" ? `<rect x="126" y="112" width="62" height="18" rx="5" fill="#e4f1eb" stroke="#26735a" stroke-width="4"/>` : "";
  return `${room}${plant}${mat}${wall}${doorway}${step}`;
}

function gymBackdrop(pose) {
  const rack = `<path d="M34 34v92M206 34v92M34 48h172" stroke="#cbd4ce" stroke-width="5" stroke-linecap="round"/>`;
  const plates = `<circle cx="202" cy="103" r="14" fill="#edf1ed" stroke="#326da8" stroke-width="4"/><circle cx="202" cy="103" r="5" fill="#fff" stroke="#326da8" stroke-width="3"/>`;
  const cable = ["cable_stand", "cable_hinge", "face_pull", "pallof", "pulldown", "row"].includes(pose)
    ? `<path d="M38 28v102M38 45h30M38 112h30" stroke="#326da8" stroke-width="5" stroke-linecap="round"/><path d="M38 45L82 82" stroke="#5f6874" stroke-width="2"/>`
    : "";
  const bench = ["bench_row", "back_extension"].includes(pose)
    ? `<rect x="76" y="108" width="100" height="15" rx="5" fill="#dbeafe" stroke="#326da8" stroke-width="4"/>`
    : "";
  return `${rack}${plates}${cable}${bench}`;
}

function equipmentLabel(exercise, pose, isGym) {
  const refId = exercise.exercise_ref_id || "";
  const homeEquipment = {
    home_glute_bridge: ["Mat only", "瑜伽垫"],
    home_clamshell: ["Mat / mini band optional", "瑜伽垫 / 可加弹力带"],
    home_side_lying_abduction: ["Mat only", "瑜伽垫"],
    home_bodyweight_squat: ["Bodyweight", "徒手"],
    home_wall_angel: ["Wall", "墙面"],
    home_bird_dog: ["Mat only", "瑜伽垫"],
    home_dead_bug: ["Mat only", "瑜伽垫"],
    home_plank: ["Mat only", "瑜伽垫"],
    home_side_plank: ["Mat only", "瑜伽垫"],
    home_hip_flexor_stretch: ["Mat only", "瑜伽垫"],
    home_chest_stretch: ["Doorway", "门框"],
    home_reverse_snow_angel: ["Mat only", "瑜伽垫"],
    home_step_up: ["Stable step", "稳定台阶"],
    home_split_squat: ["Bodyweight", "徒手"],
    home_good_morning: ["Bodyweight", "徒手"],
    home_calf_raise: ["Wall support", "扶墙"],
    home_mountain_climber: ["Mat only", "瑜伽垫"],
    home_glute_march: ["Mat only", "瑜伽垫"],
  };
  const gymEquipment = {
    gym_hip_abduction_machine: ["Hip abduction machine", "髋外展器械"],
    gym_cable_hip_abduction: ["Cable machine", "绳索器械"],
    gym_romanian_deadlift: ["Dumbbells or barbell", "哑铃或杠铃"],
    gym_seated_row: ["Cable row", "坐姿划船器"],
    gym_lat_pulldown: ["Pulldown machine", "高位下拉器"],
    gym_face_pull: ["Cable rope", "绳索把手"],
    gym_leg_press: ["Leg press machine", "腿举器械"],
    gym_goblet_squat: ["Dumbbell", "哑铃"],
    gym_cable_pull_through: ["Cable machine", "绳索器械"],
    gym_back_extension: ["Back extension bench", "罗马椅"],
    gym_chest_supported_row: ["Bench and dumbbells", "上斜凳和哑铃"],
    gym_pallof_press: ["Cable or band", "绳索或弹力带"],
    gym_treadmill_incline_walk: ["Treadmill", "跑步机"],
    gym_sled_push: ["Sled", "训练雪橇"],
  };
  const label = isGym ? gymEquipment[refId] : homeEquipment[refId];
  if (Array.isArray(label)) return currentLanguage === "zh" ? label[1] : label[0];
  return isGym ? (currentLanguage === "zh" ? "健身房器械" : "Gym equipment") : currentLanguage === "zh" ? "居家训练" : "Home setup";
}

function escapeSvgText(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function exercisePoseMarkup(pose) {
  const stroke = "#20242a";
  const accent = "#26735a";
  const muted = "#b38324";
  const common = `stroke="${stroke}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const accentLine = `stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const thin = `stroke="${muted}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const head = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="10" fill="#f0c8b7" stroke="${stroke}" stroke-width="4"/>`;
  const dumbbell = `<path d="M36 92h24M32 84v16M64 84v16" ${thin}/>`;

  const poses = {
    standing: `${head(86, 30)}<path d="M86 42v34M68 58h36M86 76l-18 26M86 76l20 26" ${common}/>`,
    squat: `${head(84, 32)}<path d="M84 44l-12 30M72 74h36M72 74l-20 26M108 74l18 26M64 55l-18 20M99 55l26 12" ${common}/>`,
    goblet: `${head(86, 30)}<rect x="74" y="49" width="24" height="24" rx="6" fill="#e4f1eb" stroke="${accent}" stroke-width="4"/><path d="M86 44l-12 30M74 74h34M74 74l-20 26M108 74l18 26M74 58l-14-4M98 58l14-4" ${common}/>`,
    split_squat: `${head(83, 30)}<path d="M83 42l-8 34M75 76l-28 18M75 76l40 12M47 94l-10 14M115 88l18 16M70 55l-22 8M94 56l24 6" ${common}/>`,
    lunge: `${head(84, 28)}<path d="M84 40l-10 34M74 74l-32 16M74 74l45 4M42 90l-14 18M119 78l22 22M70 56l-26 4M94 55l28 12" ${common}/>`,
    hinge: `${head(76, 36)}<path d="M82 45l38 28M119 73l-10 31M119 73l31 31M91 61l-32 2M94 60l-12 28" ${common}/>`,
    hinge_weight: `${head(76, 34)}<path d="M82 45l38 28M119 73l-10 31M119 73l31 31M91 61l-32 2M94 60l-12 28" ${common}/>${dumbbell}`,
    cable_hinge: `<path d="M34 22v84M34 40h24M34 88h24" ${thin}/>${head(86, 35)}<path d="M90 46l30 28M120 74l-8 30M120 74l30 30M96 58l-38 24" ${common}/><path d="M58 82L34 68" ${accentLine}/>`,
    bridge: `${head(46, 75)}<path d="M56 78l34-24l42 24M88 55l12 48M132 78l18 25M54 80l-20 22" ${common}/><path d="M72 98h48" ${accentLine}/>`,
    side_lying: `${head(42, 79)}<path d="M54 82h60M72 84l-24 18M94 82l42-20M114 82l38 22" ${common}/><path d="M92 68l42-26" ${accentLine}/>`,
    supine: `${head(50, 76)}<path d="M60 78h58M78 76l-14-30M98 76l28-28M88 78l-14 28M110 78l32 20" ${common}/>`,
    prone: `${head(42, 72)}<path d="M54 76h66M74 76l-30 22M112 76l30 22M74 70l-28-20M110 70l28-20" ${common}/>`,
    quadruped: `${head(50, 55)}<path d="M62 62h56M78 62l-28 34M104 62l30 34M118 62l32-20M62 62l-22-20" ${common}/><path d="M118 62l34-30" ${accentLine}/>`,
    plank: `${head(42, 65)}<path d="M54 68h78M70 68l-22 34M132 68l32 34M48 102h28" ${common}/>`,
    side_plank: `${head(48, 62)}<path d="M58 66l64 18M78 72l-20 30M122 84l34 18M86 58l28-22" ${common}/><path d="M58 102h24" ${accentLine}/>`,
    wall: `<path d="M38 22v86" ${thin}/>${head(78, 32)}<path d="M78 44v36M78 52l-28-20M78 52l28-20M78 80l-18 24M78 80l18 24" ${common}/><path d="M50 34v34M106 34v34" ${accentLine}/>`,
    doorway: `<path d="M42 22v86M122 22v86M42 22h80" ${thin}/>${head(82, 44)}<path d="M82 56v34M82 60H52M82 60h30M82 90l-18 18M82 90l22 18" ${common}/>`,
    step: `<rect x="90" y="85" width="56" height="20" rx="4" fill="#e4f1eb" stroke="${accent}" stroke-width="4"/>${head(74, 28)}<path d="M74 40l8 32M82 72l34 14M82 72l-24 32M116 86l18-1M66 54l-28 12M86 54l26 12" ${common}/>`,
    calf_raise: `${head(86, 27)}<path d="M86 39v40M70 58h32M86 79l-18 26M86 79l20 26M68 105h24M106 105h24" ${common}/><path d="M66 103q12-8 28 0M104 103q12-8 28 0" ${accentLine}/>`,
    mountain: `${head(42, 60)}<path d="M54 66h70M70 66l-22 36M122 66l30 36M88 66l28 26M116 92l-20 12" ${common}/><path d="M82 82l36 8" ${accentLine}/>`,
    machine: `<rect x="34" y="38" width="42" height="58" rx="6" fill="#edf1ed" stroke="${accent}" stroke-width="4"/><path d="M112 38v68M104 106h46" ${thin}/>${head(90, 42)}<path d="M90 54l14 28M104 82h36M104 82l-32 24M112 82l34 20" ${common}/>`,
    cable_stand: `<path d="M36 22v86M36 36h28M36 94h28" ${thin}/>${head(94, 30)}<path d="M94 42v38M80 58h28M94 80l-18 26M94 80l42 12" ${common}/><path d="M136 92L36 66" ${accentLine}/>`,
    row: `<rect x="44" y="92" width="74" height="12" rx="4" fill="#e4f1eb" stroke="${accent}" stroke-width="4"/>${head(84, 46)}<path d="M88 58l28 24M116 82l-18 20M116 82l38 18M92 64l-36 8" ${common}/><path d="M56 72H32" ${accentLine}/>`,
    bench_row: `<rect x="50" y="58" width="84" height="16" rx="5" fill="#e4f1eb" stroke="${accent}" stroke-width="4"/>${head(58, 42)}<path d="M68 52h66M88 72l-18 30M116 72l26 30M100 72l-4 24" ${common}/><path d="M96 96h28" ${thin}/>`,
    pulldown: `<path d="M44 24h92M90 24v20" ${thin}/>${head(90, 52)}<path d="M90 64v34M90 66l-36-28M90 66l36-28M90 98l-20 18M90 98l22 18" ${common}/><path d="M54 38h72" ${accentLine}/>`,
    face_pull: `<path d="M34 26v82M34 42h24" ${thin}/>${head(98, 48)}<path d="M98 60v34M98 66l-38-18M98 66l-30 0M98 94l-18 18M98 94l22 18" ${common}/><path d="M60 48L34 52" ${accentLine}/>`,
    leg_press: `<rect x="96" y="36" width="44" height="62" rx="6" fill="#e4f1eb" stroke="${accent}" stroke-width="4"/>${head(50, 70)}<path d="M60 74l42-20M86 58l18 32M104 90l32 4M70 78l-28 26M58 78l-18 0" ${common}/>`,
    back_extension: `<rect x="58" y="82" width="82" height="14" rx="5" fill="#e4f1eb" stroke="${accent}" stroke-width="4"/>${head(62, 50)}<path d="M72 58l46 26M86 66l-32 36M118 84l30 20M84 62l-28 2" ${common}/>`,
    pallof: `<path d="M34 24v84M34 54h28" ${thin}/>${head(94, 30)}<path d="M94 42v38M94 58h42M94 80l-18 26M94 80l20 26" ${common}/><path d="M62 54h74" ${accentLine}/>`,
    treadmill: `<rect x="38" y="92" width="102" height="16" rx="8" fill="#e4f1eb" stroke="${accent}" stroke-width="4"/><path d="M124 92l18-52" ${thin}/>${head(84, 30)}<path d="M84 42l-10 34M74 76l-28 20M74 76l36 22M76 56l-28 8M88 56l28 8" ${common}/>`,
    sled: `<path d="M104 86h46M112 86l-20 20M150 86l-18 20" ${thin}/>${head(70, 40)}<path d="M78 50l30 34M108 84l-28 24M108 84l44 10M88 62l40-18" ${common}/><path d="M128 44l22 42" ${accentLine}/>`,
  };

  return poses[pose] || poses.standing;
}

function renderRoutineBlock(type) {
  const title = type === "warmup" ? t("warmupActions") : t("cooldownActions");
  const actions = routineActions[type] || [];
  return `
    <div class="routine-block ${type}">
      <h4 class="plan-section-title">${title}</h4>
      ${actions.map(renderRoutineAction).join("")}
    </div>
  `;
}

function renderRoutineAction(action) {
  const isZh = currentLanguage === "zh";
  return `
    <div class="routine-row">
      <strong>${isZh ? action.zhName : action.name}</strong>
      <span>${action.sets} x ${isZh ? action.zhDuration : action.duration}</span>
      <p>${isZh ? action.zhInstruction : action.instruction}</p>
    </div>
  `;
}

async function savePlan() {
  if (!currentPlan) return;
  savePlanBtn.disabled = true;
  savePlanBtn.textContent = t("saving");
  try {
    currentPlan = await request(`/api/plans/${currentPlan.plan_id}`, {
      method: "PUT",
      body: JSON.stringify({ weekly_plan: currentPlan.weekly_plan }),
    });
    renderPlan(currentPlan);
  } catch (error) {
    alert(`${t("saveError")}: ${error.message}`);
  } finally {
    savePlanBtn.disabled = false;
    savePlanBtn.textContent = t("saveEdits");
  }
}

async function completeDay(dayNumber) {
  if (!currentUser || !currentPlan) return;
  await request("/api/workout-logs", {
    method: "POST",
    body: JSON.stringify({
      user_id: currentUser.id,
      plan_id: currentPlan.plan_id,
      day_number: dayNumber,
      notes: `${t("completedDay")} ${dayNumber}`,
    }),
  });
  await renderHistory();
}

async function submitFeedback() {
  if (!currentUser) return;
  const feedbackText = value("feedbackText");
  const feedbackMessage = [feedbackLabel(selectedFeedback), feedbackText].filter(Boolean).join(". ");
  if (!feedbackMessage) {
    renderAgentAdjustment(t("chooseFeedback"), "warning");
    return;
  }
  submitFeedbackBtn.disabled = true;
  submitFeedbackBtn.textContent = t("sendingFeedback");
  renderAgentAdjustment(t("agentReviewing"));
  try {
    const result = await request("/api/agent/run", {
      method: "POST",
      body: JSON.stringify(agentPayload("record_feedback", feedbackMessage)),
    });
    currentAgentResult = { ...currentAgentResult, ...result };
    renderAgentMemory(currentAgentResult);
    renderAgentAdjustment(currentLanguage === "zh" ? t("feedbackSaved") : result.message || t("feedbackSaved"));
  } catch (error) {
    renderAgentAdjustment(error.message, "warning");
  } finally {
    submitFeedbackBtn.disabled = false;
    submitFeedbackBtn.textContent = t("sendFeedback");
  }
}

async function generateWeeklyReview() {
  if (!currentUser) return;
  weeklyReviewBtn.disabled = true;
  weeklyReviewBtn.textContent = t("agentReviewing");
  renderAgentAdjustment(t("agentReviewing"));
  try {
    const result = await request("/api/agent/run", {
      method: "POST",
      body: JSON.stringify(agentPayload("weekly_review", "Generate my weekly review")),
    });
    currentAgentResult = { ...currentAgentResult, ...result };
    const review = result.progress_review;
    const ratio = Math.round((review?.completion_ratio || 0) * 100);
    if (currentLanguage === "zh") {
      renderAgentAdjustment(
        `周复盘：已完成 ${review?.completed_sessions || 0}/${review?.target_frequency || 0} 次训练（${ratio}%）。${localizeProgressRecommendation(review?.recommendation || "")}`
      );
    } else {
      renderAgentAdjustment(
        `Weekly review: ${review?.completed_sessions || 0}/${review?.target_frequency || 0} sessions completed (${ratio}%). ${review?.recommendation || ""}`
      );
    }
  } catch (error) {
    renderAgentAdjustment(error.message, "warning");
  } finally {
    weeklyReviewBtn.disabled = false;
    weeklyReviewBtn.textContent = t("weeklyReview");
  }
}

function feedbackLabel(feedback) {
  const labels = {
    too_easy: "The plan felt too easy",
    good: "The plan felt good",
    too_hard: "The plan felt too hard",
    pain: "I felt pain or discomfort",
  };
  return labels[feedback] || "";
}

function localizeProgressRecommendation(value) {
  if (currentLanguage !== "zh") return value;
  return String(value)
    .replace("Start with the first planned session and record how it felt.", "建议先完成第一节训练，并记录实际感受。")
    .replace("Reduce friction: keep sessions shorter or lower weekly frequency for the next week.", "建议降低执行难度：下周缩短单次训练，或减少每周训练频率。")
    .replace("Keep the plan stable for one more week before increasing volume.", "建议下周先保持当前计划稳定，再考虑逐步增加训练量。");
}

async function renderHistory() {
  if (!currentUser) return;
  const history = await request(`/api/workout-logs/${currentUser.id}`);
  const container = document.querySelector("#history");
  container.innerHTML = history.length ? "" : `<p>${t("noLogs")}</p>`;
  history.forEach((item) => {
    const row = document.createElement("div");
    row.className = "log-item";
    row.textContent = `${currentLanguage === "zh" ? "第" : "Day "} ${item.day_number || "-"} ${currentLanguage === "zh" ? "天" : ""} ${t("completedAt")} ${new Date(item.completed_at).toLocaleString()} ${item.notes || ""}`;
    container.appendChild(row);
  });
}

document.addEventListener("click", (event) => {
  if (event.target.matches(".complete")) {
    completeDay(Number(event.target.dataset.day));
  }
  if (event.target.matches(".choice-button")) {
    selectChoice(event.target);
  }
  if (event.target.matches(".problem-option-button")) {
    event.target.classList.toggle("active");
    event.target.setAttribute("aria-pressed", event.target.classList.contains("active") ? "true" : "false");
  }
  if (event.target.matches(".feedback-choice")) {
    selectedFeedback = event.target.dataset.feedback || "";
    document.querySelectorAll(".feedback-choice").forEach((button) => {
      button.classList.toggle("active", button === event.target);
    });
  }
});

generateBtn.addEventListener("click", generatePlan);
savePlanBtn.addEventListener("click", savePlan);
submitFeedbackBtn?.addEventListener("click", submitFeedback);
weeklyReviewBtn?.addEventListener("click", generateWeeklyReview);
editInputsBtn.addEventListener("click", () => {
  currentView = "wizard";
  applyViewMode();
  wizardCard.scrollIntoView({ behavior: "smooth", block: "start" });
});
languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "zh" : "en";
  localStorage.setItem("posturefit-language", currentLanguage);
  applyLanguage();
});
prevStepBtn.addEventListener("click", () => {
  currentStep = Math.max(0, currentStep - 1);
  renderStep();
});
nextStepBtn.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  currentStep = Math.min(totalSteps - 1, currentStep + 1);
  renderStep();
});
applyLanguage();
renderProblemOptions();
renderStep();
checkHealth();

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-placeholder-key]").forEach((node) => {
    node.placeholder = t(node.dataset.placeholderKey);
  });
  document.querySelectorAll("[data-alt-key]").forEach((node) => {
    node.alt = t(node.dataset.altKey);
  });
  languageToggle.textContent = t("switchLanguage");
  apiStatus.textContent = t("checkingApi");
  renderProblemOptions();
  renderStep();
  if (!currentPlan && isDefaultProblemText()) {
    document.querySelector("#problem").value = t("defaultProblem");
  }
  if (currentPlan) {
    renderPlan(currentPlan);
    renderHistory();
  }
}

function renderStep() {
  document.querySelectorAll(".step-screen").forEach((screen) => {
    screen.classList.toggle("active", Number(screen.dataset.step) === currentStep);
  });
  prevStepBtn.disabled = currentStep === 0;
  nextStepBtn.classList.toggle("hidden", currentStep === totalSteps - 1);
  generateBtn.classList.toggle("hidden", currentStep !== totalSteps - 1);
  const current = currentStep + 1;
  stepCounter.textContent = t("stepCounter").replace("{current}", current).replace("{total}", totalSteps);
  progressBar.style.width = `${(current / totalSteps) * 100}%`;
}

function applyViewMode() {
  const showingResults = currentView === "results";
  wizardCard.classList.toggle("hidden", showingResults);
  agentWorkflowPreview?.classList.toggle("hidden", showingResults);
  resultsPanel.classList.toggle("hidden", !showingResults);
  document.body.classList.toggle("result-mode", showingResults);
}

function validateCurrentStep() {
  const requiredByStep = [
    ["name", "age", "height", "weight"],
    ["problem"],
    [],
  ];
  const missing =
    currentStep === 1
      ? !combinedProblemText()
      : requiredByStep[currentStep].some((id) => !value(id));
  if (missing) {
    alert(currentLanguage === "zh" ? "请先填写当前步骤的必填内容。" : "Please complete the required fields in this step.");
    return false;
  }
  if (currentStep === 2 && !isScheduleValid()) {
    alert(t("scheduleError"));
    return false;
  }
  return true;
}

function value(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function numberValue(id) {
  return Number(value(id) || 0);
}

function schedulePayload() {
  const homeSessions = numberValue("homeSessions");
  const gymSessions = numberValue("gymSessions");
  const homeMinutes = numberValue("homeMinutes");
  const gymMinutes = numberValue("gymMinutes");
  const weeklyFrequency = homeSessions + gymSessions;
  const weightedMinutes = homeSessions * homeMinutes + gymSessions * gymMinutes;
  const averageMinutes = weeklyFrequency ? Math.round(weightedMinutes / weeklyFrequency) : 30;
  const scenario = homeSessions > 0 && gymSessions > 0 ? "mixed" : homeSessions > 0 ? "home" : "gym";
  return { homeSessions, homeMinutes, gymSessions, gymMinutes, weeklyFrequency, averageMinutes, scenario };
}

function isScheduleValid() {
  const schedule = schedulePayload();
  const sessionCountsOk =
    Number.isInteger(schedule.homeSessions) &&
    Number.isInteger(schedule.gymSessions) &&
    schedule.homeSessions >= 0 &&
    schedule.homeSessions <= 7 &&
    schedule.gymSessions >= 0 &&
    schedule.gymSessions <= 7;
  const totalOk = Number.isInteger(schedule.weeklyFrequency) && schedule.weeklyFrequency >= 1 && schedule.weeklyFrequency <= 7;
  const homeOk = schedule.homeSessions === 0 || (schedule.homeMinutes >= 15 && schedule.homeMinutes <= 90);
  const gymOk = schedule.gymSessions === 0 || (schedule.gymMinutes >= 15 && schedule.gymMinutes <= 90);
  return sessionCountsOk && totalOk && homeOk && gymOk;
}

function choiceValue(name) {
  return document.querySelector(`.choice-button[data-choice="${name}"].active`)?.dataset.value || "";
}

function selectChoice(button) {
  const name = button.dataset.choice;
  document.querySelectorAll(`.choice-button[data-choice="${name}"]`).forEach((item) => {
    item.classList.toggle("active", item === button);
    item.setAttribute("aria-pressed", item === button ? "true" : "false");
  });
  if (name === "goal") {
    renderProblemOptions(true);
  }
}

function renderProblemOptions(resetSelection = false) {
  if (!problemOptionsContainer) return;
  const selectedValues = resetSelection
    ? new Set()
    : new Set([...problemOptionsContainer.querySelectorAll(".problem-option-button.active")].map((button) => button.dataset.problem));
  const options = problemOptionSets[choiceValue("goal")] || problemOptionSets.posture_improvement;
  problemOptionsContainer.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "problem-option-button";
    button.dataset.problem = option.problem;
    button.textContent = currentLanguage === "zh" ? option.zh : option.en;
    if (selectedValues.has(option.problem)) {
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }
    problemOptionsContainer.appendChild(button);
  });
}

function selectedProblemTexts() {
  return [...document.querySelectorAll(".problem-option-button.active")].map((button) => button.dataset.problem);
}

function combinedProblemText() {
  const selected = selectedProblemTexts();
  const custom = value("problem");
  return [...selected, custom].filter(Boolean).join(". ");
}

function text(id, content) {
  document.querySelector(`#${id}`).textContent = content;
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function labelWithColon(label) {
  return `${label}${currentLanguage === "zh" ? "：" : ":"}`;
}

function t(key) {
  if (Object.prototype.hasOwnProperty.call(translations[currentLanguage], key)) {
    return translations[currentLanguage][key];
  }
  if (Object.prototype.hasOwnProperty.call(translations.en, key)) {
    return translations.en[key];
  }
  return key;
}

function localizeTerm(term) {
  if (currentLanguage !== "zh") return term;
  return termTranslations[String(term).toLowerCase()] || term;
}

function localizeExerciseName(name) {
  if (currentLanguage !== "zh") return name;
  return exerciseTranslations[name]?.name || name;
}

function localizeExerciseInstruction(exercise) {
  if (currentLanguage !== "zh") return exercise.instruction;
  return exerciseTranslations[exercise.name]?.instruction || exercise.instruction;
}

function localizeExerciseSafety(exercise) {
  if (currentLanguage !== "zh") return exercise.safety_note;
  return exerciseTranslations[exercise.name]?.safety || exercise.safety_note;
}

function localizeRepsOrDuration(value) {
  if (currentLanguage !== "zh") return value;
  return String(value)
    .replace(/slow reps/gi, "慢速次")
    .replace(/reps each side/gi, "次/侧")
    .replace(/rep each side/gi, "次/侧")
    .replace(/reps/gi, "次")
    .replace(/sec each side/gi, "秒/侧")
    .replace(/sec/gi, "秒")
    .replace(/min/gi, "分钟")
    .replace(/(\d)\s*m\b/gi, "$1 米");
}

function focusPhotoFor(focus) {
  const text = String(focus).toLowerCase();
  if (text.includes("scapular") || text.includes("thoracic") || text.includes("chest stretching") || text.includes("back strengthening")) {
    return {
      src: "/frontend/assets/focus/shoulder-back.png",
      caption: currentLanguage === "zh" ? "肩胛控制、背部发力、胸椎伸展" : "Scapular control, back strength, thoracic extension",
    };
  }
  if (text.includes("core") || text.includes("spinal") || text.includes("breathing")) {
    return {
      src: "/frontend/assets/focus/core-stability.png",
      caption: currentLanguage === "zh" ? "核心稳定、躯干控制、呼吸配合" : "Core stability, trunk control, breathing",
    };
  }
  if (text.includes("squat") || text.includes("lower-limb") || text.includes("single-leg") || text.includes("hinge") || text.includes("strength") || text.includes("cardio")) {
    return {
      src: "/frontend/assets/focus/lower-body.png",
      caption: currentLanguage === "zh" ? "髋膝踝对齐、下肢稳定、复合动作" : "Hip-knee-ankle alignment, lower-body stability",
    };
  }
  return {
    src: "/frontend/assets/focus/hip-glute.png",
    caption: currentLanguage === "zh" ? "臀部激活、髋外展、髋部控制" : "Glute activation, hip abduction, hip control",
  };
}

function muscleSlugsFor(targetMuscles) {
  const text = targetMuscles.join(" ").toLowerCase();
  const slugs = new Set();
  if (text.includes("trapezius") || text.includes("rhomboid") || text.includes("thoracic")) {
    slugs.add("trapezius");
    slugs.add("upper-back");
  }
  if (text.includes("shoulder") || text.includes("deltoid")) {
    slugs.add("deltoids");
    slugs.add("trapezius");
  }
  if (text.includes("core") || text.includes("abdominis") || text.includes("oblique") || text.includes("spinal")) {
    slugs.add("abs");
    slugs.add("obliques");
    slugs.add("lower-back");
  }
  if (text.includes("glute")) {
    slugs.add("gluteal");
  }
  if (text.includes("hip external") || text.includes("adductor")) {
    slugs.add("gluteal");
    slugs.add("adductors");
  }
  if (text.includes("quad")) {
    slugs.add("quadriceps");
  }
  if (text.includes("hamstring")) {
    slugs.add("hamstring");
  }
  if (text.includes("calf")) {
    slugs.add("calves");
  }
  if (text.includes("full-body")) {
    ["chest", "trapezius", "upper-back", "abs", "obliques", "gluteal", "quadriceps", "hamstring", "calves", "deltoids"].forEach((slug) =>
      slugs.add(slug)
    );
  }
  return slugs;
}

function localizeDayTitle(title, dayNumber) {
  if (currentLanguage !== "zh") return title;
  const raw = title.includes(":") ? title.split(":").slice(1).join(":").trim() : title;
  const parts = raw.split("-").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return `第 ${dayNumber} 天：${localizeTerm(parts[0].toLowerCase())} - ${localizeTerm(parts.slice(1).join("-").toLowerCase())}`;
  }
  return `第 ${dayNumber} 天：${localizeTerm(raw.toLowerCase() || "foundation")}`;
}

function localizeWarmup(warmup) {
  if (currentLanguage !== "zh") return warmup;
  return "5 分钟轻松活动、呼吸练习和温和关节活动。";
}

function localizeCooldown(cooldown) {
  if (currentLanguage !== "zh") return cooldown;
  return "3-5 分钟放松拉伸，重点照顾当天训练区域。";
}

function localizeAnalysis(plan) {
  if (currentLanguage !== "zh") return plan.problem_analysis;
  return `根据你的输入，系统将重点放在 ${plan.target_muscles.map(localizeTerm).join("、")}。这属于一般性训练建议，目标是通过 ${plan.training_focus.map(localizeTerm).join("、")} 来支持更好的动作模式和体态习惯。`;
}

function localizeAgentSummary(plan) {
  if (currentLanguage !== "zh") return plan.agent_summary;
  const name = currentUser?.name || value("name") || "你好";
  const days = plan.weekly_plan.length;
  return `${name}，这是一个每周 ${days} 天的一般性训练计划。动作选择先由本地规则引擎根据问题、场景、训练水平和时长完成，Agent 层只负责解释原因与安全提醒。训练时保持动作可控，先用中低强度开始；如果出现疼痛、头晕、麻木或异常不适，请停止并咨询专业人士。`;
}

function isDefaultProblemText() {
  const problem = value("problem");
  return problem === translations.en.defaultProblem || problem === translations.zh.defaultProblem;
}
