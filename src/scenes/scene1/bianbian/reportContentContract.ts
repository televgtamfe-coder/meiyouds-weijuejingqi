// Shared by the browser request and the analysis service prompt.
export const reportContentContract=`结果内容规范 V46：
1. 保留原有 risk_level、objective_facts、core_conclusion、risk_observations、follow_up_question 等字段，不改变风险判定规则。
2. 新增 action_plan 数组，2至3项，每项为 {title,when,steps,watch_for}。title 为具体行动的短标题；when 明确时机，如下次排便时、下一次喂奶时、立即；steps 为1至2条可执行动作，写明记录什么、如何做；watch_for 为需要升级处理的具体变化，无新增内容可为空。按本次观察、已确认月龄、症状和喂养情况选择动作，不以继续观察、注意饮食、保持卫生等空话代替步骤。不凭照片给出药物、补充剂剂量或增减奶量的处方。不要求家长先补齐记录再就医。存在急症时 emergency_handling 原样完整保留并优先展示。
3. 新增 deep_analysis 对象，字段 appearance、feeding_context、attention，每项为面向家长的详细介绍，约80至140个汉字。appearance 解释已观察到的颜色、质地和分布特征及一般含义；feeding_context 解释已确认的月龄、喂养阶段及实际背景与本次表现的关系，资料缺失时明确缺失，不编造；attention 说明本次需要关注的表现、照片局限与应核实的信息，不重复行动步骤。只输出结论和可核实的简明解释，不输出内部思考、推理步骤、模型自述、排除诊断过程、思维链或“首先我判断、然后推断”等文字。不得仅凭照片排除感染、过敏或其他疾病。
4. deep_analysis、action_plan 必须与本次颜色、性状、三个风险字段和风险等级一致；不套用低风险示例。core_conclusion.detail 首句继续保留本次外观、性状及当前阶段匹配情况的一句综合描述。示例趋势不得混入真实报告。`;
export function parentExplanation(value:string):string {
 return value.replace(/<(think|analysis|reasoning)\b[^>]*>[\s\S]*?<\/\1>/gi,'').split(/(?<=[。！？])|\n+/).filter(s=>!/(?:思考过程|推理过程|内部推理|思维链|模型思考|chain.of.thought|^\s*(?:首先我|然后我|接下来我|我需要|我将|让我逐步|分析步骤))/i.test(s)).join('').replace(/\*\*/g,'').trim();
}
