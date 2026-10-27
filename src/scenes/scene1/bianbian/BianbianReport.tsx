import { Report } from './analysis';
import { BianbianIcon } from './BianbianIcon';
const riskLabels = { green: '暂未提示明显异常', yellow: '有变化，需要关注', orange: '需要进一步评估', red: '请优先寻求医疗帮助', unknown: '暂不能确定风险' };
export function BianbianReport({ report, demo, image, onEdit, onHome }: { report: Report; demo: boolean; image: string; onEdit: () => void; onHome: () => void }) {
  return <>
    <div className="bb-scroll" tabIndex={-1}>
      {demo && <div className="bb-demo-banner" role="status">示例报告 · 未分析照片，不代表健康结论</div>}
      <section className={`bb-result-hero bb-risk-${report.risk}`}>
        <span className="bb-eyebrow">{demo ? '报告结构预览' : '本次便便分析'}</span>
        <div className="bb-risk-label"><span aria-hidden="true" />{demo ? '示例内容' : riskLabels[report.risk]}</div>
        <h1>{report.summary}</h1>
        <p>{report.detail || '本次未返回完整说明，请补充信息后重试。'}</p>
        {report.risk === 'red' && <p className="bb-important">请优先联系医生，不要等待再次拍照或 AI 分析。</p>}
        <span className="bb-ai-note">AI 辅助信息，仅供参考，不替代医生诊断</span>
      </section>
      <section className="bb-card">
        <div className="bb-section-heading"><h2>照片里看到了什么</h2>{image && <img className="bb-result-thumb" src={image} alt="本次上传的照片" />}</div>
        <div className="bb-facts">{report.facts.map(f => <div key={f.label}><span>{f.label}</span><strong>{f.value}</strong><p>{f.detail || '未提供详细描述'}</p>{f.comparison && <small>{f.comparison}</small>}</div>)}</div>
        <p className="bb-footnote">光线、角度和拍摄时间会影响识别，照片不能单独判断疾病。</p>
      </section>
      {(report.cause || report.evidence.length > 0) && <section className="bb-card"><h2>结合宝宝的情况</h2>{report.cause && <p className="bb-body-text">{report.cause}</p>}<ul className="bb-evidence">{report.evidence.map((x, i) => <li key={i}>{x}</li>)}</ul></section>}
      {report.actions.map((group, i) => <section key={group.title} className={`bb-card ${i === 0 && report.risk === 'red' ? 'bb-urgent' : ''}`}><h2>{group.title}</h2><ol className="bb-actions">{group.items.map((item, j) => <li key={j}><span>{String(j + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ol></section>)}
      {!report.actions.length && <section className="bb-card"><h2>下一步</h2><p className="bb-body-text">本次没有返回可用建议，可以补充信息后重新分析；如宝宝不适，请直接咨询医生。</p></section>}
      {report.question && <section className="bb-card"><h2>可补充的信息</h2><p className="bb-body-text">{report.question}</p><p className="bb-footnote">可以修改上次填写的信息；如需就医，请优先就医。</p></section>}
      <p className="bb-end-note">每个宝宝的情况不同<br />有疑虑时，带上照片和近期记录咨询医生</p>
    </div>
    <footer className="bb-footer bb-result-footer"><button className="bb-secondary" onClick={onHome}>回到育儿</button><button className="bb-primary" onClick={onEdit}>{demo ? '开始我的分析' : '修改信息，再次分析'}<BianbianIcon type="back" /></button></footer>
  </>;
}
