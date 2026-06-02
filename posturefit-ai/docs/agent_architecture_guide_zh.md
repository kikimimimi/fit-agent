# FitAgent Agent 设计架构中文讲解

这份文档面向不太熟悉 AI Agent 架构的读者。它会用比较直观的方式说明：FitAgent 为什么不只是一个健身计划 demo，而是一个由多个小 agent 协作完成任务的 AI 健身助手。

## 1. 一句话理解 FitAgent

FitAgent 是一个面向健身新手的 AI Personal Fitness Coach。用户输入个人资料、训练目标、居家或健身房安排后，系统不会简单地把文字丢给大模型生成答案，而是由一个 Orchestrator Agent 负责调度多个小 agent：

- Profile Agent 整理用户画像。
- Workout Planner 生成结构化训练计划。
- Safety Checker 做基础安全审查。
- Nutrition Planner 给出保守饮食建议。
- Progress Tracker 根据训练日志做周复盘。
- Memory Manager 记录偏好、反馈和安全提醒。
- LLM Coach 调用大模型，把结构化结果解释成自然语言。

因此，FitAgent 的核心不是“一个聊天框”，而是“多个小 agent 围绕一个健身任务协作”。

## 2. Demo 和 Agent 的区别

一个普通 demo 通常是：

```text
用户输入 -> 规则或模板 -> 直接输出结果
```

FitAgent 的流程更接近：

```text
用户输入
  -> Orchestrator Agent 判断意图
  -> Profile Agent 整理用户画像
  -> Memory Manager 读取历史记忆
  -> Workout Planner / Nutrition Planner / Progress Tracker 选择合适工具
  -> Safety Checker 审查风险
  -> LLM Coach 生成个性化解释
  -> Memory Manager 写入本次偏好或反馈
  -> 前端展示计划、模型状态、Agent 工作流和可编辑结果
```

区别在于：

- Agent 会判断用户想做什么，而不是固定执行一个流程。
- Agent 会调用不同工具，而不是只靠一个函数。
- Agent 会保留记忆，例如最近训练请求、反馈、安全提醒。
- Agent 会把计划、安全、饮食、解释拆成不同模块，降低健康建议风险。
- Agent 可以在没有大模型时降级为规则模式，有大模型时增强解释和聊天能力。

## 3. 总体架构

FitAgent 当前采用 FastAPI 后端、SQLite 数据库、原生 HTML/CSS/JavaScript 前端。

```text
前端页面
  - Step 1: 用户画像
  - Step 2: 目标/问题选择
  - Step 3: 居家与健身房安排
  - 顶部健身小助手聊天框
  - 结果页：计划、图片、导出、Agent 状态

后端 API
  - /api/users
  - /api/generate-plan
  - /api/agent/run
  - /api/health
  - /api/exercise-images

Agent 层
  - OrchestratorAgent
  - ProfileAgent
  - MemoryManager
  - WorkoutPlanner
  - SafetyChecker
  - NutritionPlanner
  - ProgressTracker
  - LLMClient / LLM Coach
  - ExerciseImageClient

数据层
  - User / UserProfile
  - Plan / PlanDay / PlanExercise
  - WorkoutLog
  - AgentMemory
  - LLMCallLog
```

## 4. 核心入口：Orchestrator Agent

Orchestrator Agent 可以理解为“总调度员”。

它的职责不是亲自完成所有事情，而是决定：

- 用户现在想生成计划，还是问健身问题？
- 用户是在反馈计划太难，还是想做周复盘？
- 是否需要调用训练计划生成器？
- 是否需要调用营养建议模块？
- 是否需要读取或写入记忆？
- 是否需要让大模型生成自然语言解释？

代码位置：

```text
posturefit-ai/agents/orchestrator.py
```

它支持的主要意图包括：

| 意图 | 含义 | 典型用户输入 |
| --- | --- | --- |
| generate_workout_plan | 生成训练计划 | “帮我生成一周训练计划” |
| general_fitness_question | 普通健身问答 | “久坐腰不舒服怎么缓解？” |
| record_feedback | 记录反馈 | “第 2 天太难了” |
| weekly_review | 周复盘 | “本周训练完成得怎么样？” |
| nutrition_advice | 饮食建议 | “减脂期间怎么吃？” |

如果大模型可用，Orchestrator 会尝试用 LLM 判断意图；如果大模型不可用，就使用本地关键词规则判断。这保证系统即使没有 API Key 也能运行。

## 5. 小 Agent 逐个说明

### 5.1 Profile Agent：用户画像整理员

代码位置：

```text
posturefit-ai/agents/profile_agent.py
```

Profile Agent 负责把用户填写的资料整理成统一格式，例如：

- 年龄
- 性别
- 身高体重
- 训练目标
- 训练水平
- 伤病备注
- 每周训练频率
- 训练经验

为什么需要它：

如果后续每个模块都直接读取原始表单，很容易字段混乱。Profile Agent 把资料统一成标准画像，后续 Workout Planner、Safety Checker、LLM Coach 都可以用同一份上下文。

它的输出示意：

```json
{
  "name": "Demo User",
  "age": 28,
  "gender": "female",
  "fitness_goal": "posture_improvement",
  "training_level": "beginner",
  "injuries": "knee pain",
  "weekly_frequency": 3
}
```

### 5.2 Workout Planner：训练计划规划员

代码位置：

```text
posturefit-ai/agents/workout_planner.py
posturefit-ai/recommendation_engine.py
```

Workout Planner 负责生成真正的训练计划。

它会考虑：

- 用户目标，例如体态改善、减脂、增肌、塑形。
- 用户选择的问题，例如圆肩、骨盆前倾、核心无力、臀腿塑形。
- 用户训练水平，例如 beginner / intermediate / advanced。
- 场景，例如 home / gym / mixed。
- 每周训练次数。
- 每次训练时长。
- 居家和健身房分别有几次。

它输出的不是一段随意文字，而是结构化计划：

```json
{
  "weekly_plan": [
    {
      "day": 1,
      "scenario": "home",
      "exercises": [
        {
          "name": "臀桥",
          "sets": 3,
          "reps_or_duration": "10-12 次",
          "rest_seconds": 60,
          "target_muscles": ["gluteal", "core"],
          "instruction": "保持骨盆稳定，臀部发力抬起。"
        }
      ]
    }
  ]
}
```

为什么不用大模型直接生成动作：

健身建议涉及安全风险。如果完全让大模型自由生成动作，它可能推荐不适合新手或不适合伤病用户的训练。FitAgent 当前用规则引擎决定动作和训练量，再让大模型负责解释，这样更可控。

### 5.3 Safety Checker：安全审查员

代码位置：

```text
posturefit-ai/agents/safety_checker.py
```

Safety Checker 负责检查明显风险。

它会关注：

- 用户是否提到膝盖、ACL、半月板等问题。
- 计划里是否有跳跃、冲刺、雪橇推、登山跑等高冲击动作。
- 新手每周训练频率是否过高。
- 是否完全没有休息日。
- 是否出现疼痛、头晕、麻木、尖锐不适等危险信号。

输出示意：

```json
{
  "risk_level": "review_needed",
  "warnings": [
    "Knee injury was mentioned, so high-impact or aggressive conditioning should be replaced."
  ],
  "disclaimer": "This is a basic automated safety screen, not medical clearance."
}
```

这个模块很重要，因为 FitAgent 是健身建议工具，不是医疗诊断工具。它必须主动提醒用户：如果有疼痛、伤病、慢性疾病、怀孕或严重体态问题，应咨询专业人士。

### 5.4 Nutrition Planner：饮食习惯建议员

代码位置：

```text
posturefit-ai/agents/nutrition_planner.py
```

Nutrition Planner 不做医学营养处方，而是给出保守、通用的健康习惯建议。

例如：

- 每餐包含蛋白质、蔬菜或水果、稳定碳水或健康脂肪。
- 训练前后注意补水。
- 不建议极端节食。
- 减脂时建议温和热量缺口。
- 增肌时建议配合足够蛋白质和总热量。

为什么这个模块要保守：

饮食建议很容易涉及医疗和个体健康风险。FitAgent 当前只提供一般健康教育，不提供治疗、诊断或医学处方。

### 5.5 Progress Tracker：训练进度复盘员

代码位置：

```text
posturefit-ai/agents/progress_tracker.py
```

Progress Tracker 根据 WorkoutLog 统计用户完成了多少次训练，并给出简单复盘建议。

它会计算：

- 本周完成次数。
- 目标训练次数。
- 完成率。
- 下周是否需要降低难度、保持计划或逐步增加。

示意输出：

```json
{
  "completed_sessions": 2,
  "target_frequency": 3,
  "completion_ratio": 0.67,
  "recommendation": "Keep the plan stable for one more week before increasing volume."
}
```

这让 FitAgent 不只是“一次性生成计划”，而是可以根据用户后续执行情况做反馈。

### 5.6 Memory Manager：长期记忆管理员

代码位置：

```text
posturefit-ai/agents/memory_manager.py
```

Memory Manager 使用 SQLite 保存 agent 记忆。

当前保存的内容包括：

- latest_training_request：最近一次训练请求。
- latest_safety_warnings：最近一次安全提醒。
- latest_feedback：用户对计划的反馈，例如太难、太轻松、疼痛不适。

记忆的作用：

下次用户再生成计划或聊天时，Agent 可以知道用户之前说过什么，而不是每次都从零开始。

示意：

```text
用户第一次说：第 2 天太难了
Memory Manager 记录：latest_feedback = 第 2 天太难了
用户下次让系统调整计划
Orchestrator 读取记忆，并把它传给 LLM Coach
```

在更生产级的版本里，这个模块可以升级成向量数据库记忆，但当前 MVP 用 SQLite 已经能展示 agent memory 的基本概念。

### 5.7 LLM Client / LLM Coach：大模型解释员

代码位置：

```text
posturefit-ai/agents/llm_client.py
```

LLM Coach 的职责不是替代所有规则，而是做自然语言解释和对话增强。

它会用于：

- 判断用户意图。
- 给训练计划生成更像教练的解释。
- 回答顶部“健身小助手”中的问题。
- 根据当前计划回答针对性问题。
- 解释训练反馈和周复盘。

当前支持：

- OpenAI。
- DeepSeek。
- OpenAI-compatible proxy。
- 无大模型时自动回退为本地规则模式。

环境变量示例：

```text
LLM_PROVIDER=deepseek
LLM_MODEL=deepseek-chat
DEEPSEEK_API_KEY=your_key
LLM_DISPLAY_NAME=DeepSeek
```

或者：

```text
LLM_PROVIDER=openai
LLM_MODEL=deepseek-chat
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=https://api.deepseek.com
LLM_DISPLAY_NAME=DeepSeek
```

为什么要保留规则回退：

如果 API Key 没配置、接口失败、额度用完，FitAgent 仍然能生成训练计划和基础回答。这样系统不会因为大模型不可用就完全崩掉。

### 5.8 Exercise Image Client：动作图片生成/兜底工具

代码位置：

```text
posturefit-ai/agents/image_client.py
frontend/assets/exercises/
```

这个模块负责处理动作图像。

当前项目已经包含男女动作图片库。前端会根据：

- 用户性别
- 动作 id
- 居家或健身房场景

选择对应图片。

如果缺图，系统可以通过图片生成接口补图；如果图片生成不可用，则回退到本地 fallback。这样用户看到的不只是动作名称，还能通过图片理解动作。

## 6. 典型工作流：生成训练计划

用户点击“生成计划”后，系统会发生这些步骤：

```text
1. 前端收集用户资料、目标、问题、训练安排
2. /api/users 创建用户和用户画像
3. /api/generate-plan 生成结构化训练计划
4. /api/agent/run 启动 Agent 工作流
5. Orchestrator 判断意图：generate_workout_plan
6. Profile Agent 整理画像
7. Memory Manager 读取最近记忆
8. Workout Planner 生成训练计划
9. Safety Checker 做安全审查
10. Nutrition Planner 补充饮食建议
11. Memory Manager 写入本次请求和安全提醒
12. LLM Coach 生成自然语言解释
13. 后端记录 LLM 调用日志
14. 前端展示结果页
```

结果页会显示：

- 问题分析。
- 目标肌群。
- 训练重点。
- 每周计划。
- 每个动作图片、组数、次数、休息时间。
- Agent Summary。
- 模型接入状态。
- Agent 工作流。
- FitAgent Memory。
- Safety Review。
- 导出文档功能。

## 7. 典型工作流：顶部健身小助手聊天

顶部“健身小助手”是一个独立问答入口。它的设计目标是让用户可以随时问健身相关问题，不一定要完成主流程。

例如：

```text
用户：我久坐腰不舒服，怎么缓解？
```

系统流程：

```text
1. 前端发送用户问题到 /api/agent/run
2. intent 固定为 general_fitness_question
3. 如果当前页面已有训练计划，前端会附带 current_plan 摘要
4. Orchestrator 读取用户画像和记忆
5. LLM Coach 尝试用大模型回答
6. 如果大模型不可用，则使用本地规则 fallback
7. 前端在顶部聊天区域显示回答
```

为什么这里要固定为 general_fitness_question：

用户在聊天框里说“计划”“训练”等词时，并不一定是要重新生成计划。他可能只是问“这个计划怎么调整”。因此顶部聊天框更适合作为独立问答入口，而不是触发完整主流程。

## 8. 为什么这是多 Agent 架构

FitAgent 具备以下 Agent 特征：

### 8.1 有 Orchestrator

系统不是所有请求都走同一个函数，而是由 Orchestrator 判断意图并选择工具。

### 8.2 有工具调用

Orchestrator 会调用不同小 agent：

- 计划生成工具。
- 安全审查工具。
- 饮食建议工具。
- 进度复盘工具。
- 记忆管理工具。
- 大模型解释工具。

### 8.3 有记忆

系统会保存用户反馈、偏好和安全提醒，而不是一次性响应后就忘记。

### 8.4 有安全边界

训练动作由规则引擎生成，安全审查由 Safety Checker 处理，大模型主要做解释和对话，不允许随意编造医疗结论。

### 8.5 有降级能力

大模型不可用时，FitAgent 仍然能运行。模型可用时，它会增强解释和聊天体验。

## 9. 大模型在系统中的真实位置

在 FitAgent 中，大模型不是唯一核心。

更准确地说：

```text
规则引擎负责确定计划内容
Safety Checker 负责安全边界
数据库负责保存用户和记忆
LLM Coach 负责解释、总结、对话和意图理解
```

这种设计比“全部交给大模型”更适合健康健身场景，因为：

- 可控性更强。
- 输出结构更稳定。
- 更容易测试。
- 出错时可以回退。
- 可以清楚解释每一步是怎么来的。

## 10. 前端如何让用户感觉这是 Agent

FitAgent 前端不是只展示一个结果，而是展示 Agent 的工作过程：

- 顶部有健身小助手，可以随时提问。
- 结果页显示模型是否接入成功。
- Agent 工作流展示 Profile Agent、Memory Manager、Workout Planner 等模块做了什么。
- FitAgent Memory 展示系统记住了什么。
- Safety Review 展示安全审查结果。
- 用户可以修改计划、保存修改、提交反馈。
- 用户可以导出计划文档。

这些设计让用户感觉系统不是单纯生成一段文字，而是在“理解、规划、检查、解释、记忆和调整”。

## 11. 当前 MVP 和未来生产级 Agent 的区别

当前项目已经实现：

- 多 agent 模块拆分。
- Orchestrator 调度。
- 结构化训练计划。
- 安全审查。
- SQLite 记忆。
- LLM 接入与状态显示。
- DeepSeek / OpenAI-compatible 支持。
- 顶部健身问答助手。
- 计划导出。
- 动作图片库。

未来可以继续增强：

- 向量数据库记忆，让用户历史反馈检索更智能。
- 更细的动作替换逻辑，例如根据疼痛、器械缺失自动替换动作。
- 多轮对话状态，让小助手记住连续追问。
- 更强的进度分析，例如训练负荷、恢复评分、动作完成率。
- RAG 知识库，用经过审核的健身知识回答问题。
- 更严格的医疗安全分类，把高风险问题转向专业建议。
- 流式输出，让聊天体验更像真实助手。

## 12. 给老师看的简短总结

FitAgent 的设计重点是把健身建议拆成多个可控 agent，而不是让大模型一次性生成全部内容。系统由 Orchestrator Agent 负责判断用户意图，并调用 Profile Agent、Workout Planner、Safety Checker、Nutrition Planner、Progress Tracker、Memory Manager 和 LLM Coach。训练计划由规则和用户画像决定，安全风险由专门模块审查，大模型负责解释、总结和自然语言问答。这样既能体现 AI Agent 的多模块工作流，又能降低健身健康场景中大模型胡乱生成建议的风险。

## 13. 文件对应关系速查

| 功能 | 文件 |
| --- | --- |
| 后端入口 | `app.py` |
| Agent 总调度 | `agents/orchestrator.py` |
| 用户画像整理 | `agents/profile_agent.py` |
| 训练计划工具 | `agents/workout_planner.py` |
| 推荐规则引擎 | `recommendation_engine.py` |
| 安全审查 | `agents/safety_checker.py` |
| 饮食建议 | `agents/nutrition_planner.py` |
| 进度复盘 | `agents/progress_tracker.py` |
| 记忆管理 | `agents/memory_manager.py` |
| 大模型调用 | `agents/llm_client.py` |
| 动作图片生成/兜底 | `agents/image_client.py` |
| 数据库模型 | `database.py` |
| API 数据结构 | `schemas.py` |
| 前端页面 | `frontend/index.html` |
| 前端交互逻辑 | `frontend/app.js` |
| 前端样式 | `frontend/styles.css` |

