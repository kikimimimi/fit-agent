let currentUser = null;
let currentPlan = null;
let currentLanguage = localStorage.getItem("posturefit-language") || "en";
let currentStep = 0;
let currentView = "wizard";
const totalSteps = 4;

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
const problemOptionsContainer = document.querySelector("#problemOptions");

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
    stepScenario: "Step 3: Scenario",
    home: "Home",
    gym: "Gym",
    stepSchedule: "Step 4: Schedule",
    weeklyFrequency: "Weekly Frequency",
    sessionMinutes: "Session Minutes",
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
    weeklyPlan: "Weekly Plan",
    weeklyPlanHint: "Edit exercises, sets, reps, and rest time directly in the plan.",
    history: "History",
    warmup: "Warmup",
    cooldown: "Cooldown",
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
    stepScenario: "步骤 3：训练场景",
    home: "居家",
    gym: "健身房",
    stepSchedule: "步骤 4：训练安排",
    weeklyFrequency: "每周训练次数",
    sessionMinutes: "每次训练时长",
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
    weeklyPlan: "每周计划",
    weeklyPlanHint: "可以直接修改计划中的动作、组数、次数和休息时间。",
    history: "历史记录",
    warmup: "热身",
    cooldown: "放松",
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
  return {
    user_id: currentUser.id,
    problem: combinedProblemText(),
    weekly_frequency: Number(value("weeklyFrequency")),
    session_minutes: Number(value("sessionMinutes")),
    scenario: document.querySelector("input[name='scenario']:checked").value,
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
    <div class="muscle-map-header">
      <span>${t("muscleMapTitle")}</span>
      <small>${t("highlightedMuscles")}</small>
    </div>
    <div class="muscle-subhead">
      <span>${t("muscle2DTitle")}</span>
      <small>${t("highlightedMuscles")}</small>
    </div>
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
      <p><strong>${t("warmup")}:</strong> ${localizeWarmup(day.warmup)}</p>
      <div class="exercise-list"></div>
      <p><strong>${t("cooldown")}:</strong> ${localizeCooldown(day.cooldown)}</p>
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
    <input aria-label="Exercise name" value="${escapeAttr(exercise.name)}" data-field="name" />
    <input aria-label="Sets" value="${escapeAttr(exercise.sets)}" data-field="sets" />
    <input aria-label="Reps or duration" value="${escapeAttr(exercise.reps_or_duration)}" data-field="reps_or_duration" />
    <input aria-label="Rest seconds" type="number" value="${exercise.rest_seconds}" data-field="rest_seconds" />
    <div class="exercise-meta">${exercise.instruction}<br />${t("safety")}: ${exercise.safety_note}</div>
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
});

generateBtn.addEventListener("click", generatePlan);
savePlanBtn.addEventListener("click", savePlan);
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
  resultsPanel.classList.toggle("hidden", !showingResults);
  document.body.classList.toggle("result-mode", showingResults);
}

function validateCurrentStep() {
  const requiredByStep = [
    ["name", "age", "height", "weight"],
    ["problem"],
    [],
    ["weeklyFrequency", "sessionMinutes"],
  ];
  const missing =
    currentStep === 1
      ? !combinedProblemText()
      : requiredByStep[currentStep].some((id) => !value(id));
  if (missing) {
    alert(currentLanguage === "zh" ? "请先填写当前步骤的必填内容。" : "Please complete the required fields in this step.");
    return false;
  }
  return true;
}

function value(id) {
  return document.querySelector(`#${id}`).value.trim();
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
  const focus = title.includes(":") ? title.split(":").slice(1).join(":").trim().toLowerCase() : "";
  return `第 ${dayNumber} 天：${localizeTerm(focus)}`;
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
