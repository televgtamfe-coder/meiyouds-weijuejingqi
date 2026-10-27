import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KitIcon, KitIconName } from './bianbian/KitIcon';
import './bianbian/bianbian.css';
import heroBackground from '../../assets/scene1-parenting/ad60b58af7505e4a5892e8ad1f0830db7b9df0f2.webp';
import babyAvatar from '../../assets/scene1-parenting/Ellipse_8_34771.png';
import inviteIcon from '../../assets/scene1-parenting/Group_8_34814.png';
import inviteArrow from '../../assets/scene1-parenting/Frame_8_34821.png';
import todayCardArt from '../../assets/scene1-parenting/Frame_80_146673.png';
import entryPhotoA from '../../assets/scene1-parenting/63fc3fcc2b72b6ca1b3d9e4770641b7b471e2e57.png';
import entryPhotoB from '../../assets/scene1-parenting/84737e0ae3402fa33a235e8b6e0d4da68a63cb94.png';
import entryPhotoC from '../../assets/scene1-parenting/5dc14bab99b339fd992a6f5c0a2dc0a1fd42b5c3.png';
import entryPhotoD from '../../assets/scene1-parenting/17c0ef8efe8642eb0085b750154d50d557cca927.png';
import entryPhotoE from '../../assets/scene1-parenting/4cd678b252d3a58fa1c120bcaba0c80224947098.png';
import entryPhotoF from '../../assets/scene1-parenting/dd9c702943b7af3d401557c595ad5d88c741013d.png';
import entryPhotoG from '../../assets/scene1-parenting/a7082d33a6801a12d42de234e12433ea09fee6f0.png';
import entryPhotoH from '../../assets/scene1-parenting/fafc02233724b6d2b69cf266f8af574f3a3d7cb1.png';
import entryPhotoI from '../../assets/scene1-parenting/128a80054ac0ada6bd649bc2875d775a18340b43.png';
import entryPhotoJ from '../../assets/scene1-parenting/66ba8a347c2ed848d7d2ba06821d58c36ecc2283.png';
import { Scene1BottomTabBar } from './components/Scene1BottomTabBar';
import { StatusBar } from './components/StatusBar';

type RecordEntry = {
  id: string;
  date: string;
  age: string;
  title: string;
  summary: string;
  images: string[];
  tags: string[];
  author: string;
  time: string;
  badge?: string;
  footer?: string;
};

const quickActions: { key: string; label: string; icon: KitIconName }[] = [
  { key: 'feeding', label: '喂养记录', icon: 'feeding' },
  { key: 'bianbian', label: '便便分析', icon: 'camera' },
  { key: 'early-learning', label: '在家早教', icon: 'learning' },
  { key: 'growth', label: '身高体重', icon: 'growth' },
  { key: 'more', label: '更多', icon: 'more' },
];

const recordEntries: RecordEntry[] = [
  {
    id: 'today',
    date: '今天',
    age: '9个月10天',
    title: '宝宝已经可以自己坐起来啦',
    summary: '来上传和爸爸一起看的成长瞬间，也可以顺手记录今天的新变化。',
    badge: '立即记录',
    images: [todayCardArt],
    tags: ['会坐了', '成长记录', '小可爱'],
    author: '妈妈',
    time: '刚刚',
    footer: '爷爷、奶奶都能看到这条成长记录',
  },
  {
    id: 'yesterday-a',
    date: '8月8日',
    age: '9个月9天',
    title: '宝宝开始咿咿呀呀地自言自语了',
    summary: '今天会盯着玩具发出很多小声音，像是在认真跟我们聊天。',
    images: [entryPhotoA, entryPhotoB, entryPhotoC],
    tags: ['咿呀学语', '互动', '好奇心'],
    author: '妈妈',
    time: '刚刚',
  },
  {
    id: 'yesterday-b',
    date: '8月8日',
    age: '9个月9天',
    title: '第一次自己扶着坐稳',
    summary: '把今天的照片和一句成长备注都留在这里，后面翻看会很有感觉。',
    images: [entryPhotoD, entryPhotoE, entryPhotoF, entryPhotoG, entryPhotoH, entryPhotoI, entryPhotoJ],
    tags: ['会坐了', '家庭相册', '成长记录'],
    author: '妈妈',
    time: '刚刚',
  },
];

function getRecordMediaClassName(imageCount: number) {
  if (imageCount === 1) {
    return 'scene1-parenting-record-media scene1-parenting-record-media-single';
  }

  if (imageCount > 3) {
    return 'scene1-parenting-record-media scene1-parenting-record-media-mosaic';
  }

  return 'scene1-parenting-record-media';
}

export function Scene1ParentingPage() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="scene1-parenting-page" data-testid="scene1-parenting-shell">
      <StatusBar />
      <nav className="bb-parenting-modes" aria-label="健康模式">
        {[['经期', '/scene1'], ['备孕', '/scene1-prep'], ['怀孕', '/scene1-pregnancy'], ['育儿', '/scene1-parenting']].map(([label, path]) => <button type="button" key={label} aria-current={label === '育儿' ? 'page' : undefined} onClick={() => navigate(path)}>{label}</button>)}
      </nav>

      <div className="scene1-parenting-scroll">
        <header className="scene1-parenting-hero" data-testid="scene1-parenting-hero">
          <img
            src={heroBackground}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="scene1-parenting-hero-bg"
          />
          <div className="scene1-parenting-hero-overlay" />

          <div
            className="scene1-parenting-profile-panel"
            data-testid="scene1-parenting-profile-panel"
          >
            <div className="scene1-parenting-profile">
              <div className="scene1-parenting-profile-main">
                <img src={babyAvatar} alt="" aria-hidden="true" className="scene1-parenting-avatar" />
                <div className="scene1-parenting-profile-copy">
                  <strong>宝宝</strong>
                  <p className="scene1-parenting-profile-summary">陪伴宝宝，记录每一点变化</p>
                  <button type="button" className="scene1-parenting-age-chip" onClick={() => navigate('/scene1-bianbian')}>
                    <span>填写宝宝情况</span>
                    <img src={inviteArrow} alt="" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <button type="button" className="scene1-parenting-invite-pill" onClick={() => navigate('/scene1')}>
                <img src={inviteIcon} alt="" aria-hidden="true" />
                <span>切换模式</span>
                <img
                  src={inviteArrow}
                  alt=""
                  aria-hidden="true"
                  className="scene1-parenting-invite-arrow"
                />
              </button>
            </div>

            <section className="scene1-parenting-change-card">
              <div className="scene1-parenting-change-copy">
                <p className="scene1-parenting-change-label">今日陪伴</p>
                <p className="scene1-parenting-change-text">
                  从吃得怎么样，到便便的小变化，把每一次观察留给更安心的照顾。
                </p>
              </div>
              <div className="scene1-parenting-change-meta">
                <span>育儿健康小工具</span>
                <span className="bb-parenting-label">陪宝宝慢慢长大</span>
              </div>
            </section>
          </div>
        </header>

        <main className="scene1-parenting-body">
          <section className="scene1-parenting-quick-card" data-testid="scene1-parenting-quick-grid">
            {quickActions.map((item) => (
              <button key={item.key} type="button" className="scene1-parenting-quick-item" aria-expanded={item.key === 'more' ? expanded : undefined} onClick={() => { if (item.key === 'bianbian') navigate('/scene1-bianbian'); if (item.key === 'more') setExpanded(!expanded); }}>
                <span className="scene1-parenting-quick-icon-wrap">
                  <KitIcon name={item.icon} />
                </span>
                <span className="scene1-parenting-quick-label">{item.label}</span>
              </button>
            ))}
            {expanded && <div className="bb-quick-extra"><button type="button" className="scene1-parenting-quick-item"><span className="scene1-parenting-quick-icon-wrap"><KitIcon name="story" /></span><span className="scene1-parenting-quick-label">儿歌故事</span></button></div>}
          </section>

          <section className="scene1-parenting-family-card" data-testid="scene1-parenting-family-card">
            <div className="scene1-parenting-family-copy">
              <p>邀请爷爷奶奶，一起上传宝宝照片</p>
              <span>全家都能在这里看见宝宝今天的新变化</span>
            </div>
            <button type="button">去邀请</button>
          </section>

          <section
            className="scene1-parenting-record-section"
            data-testid="scene1-parenting-record-section"
          >
            <div className="scene1-parenting-record-section-head">
              <div>
                <h2>成长记录示例</h2>
                <p>以下为原页面的示例内容，不是宝宝的真实记录</p>
              </div>
            </div>

            <section className="scene1-parenting-record-list" data-testid="scene1-parenting-record-list">
              {recordEntries.map((entry) => (
                <article key={entry.id} className="scene1-parenting-record">
                  <div className="scene1-parenting-record-date">
                    <div className="scene1-parenting-record-date-dot" aria-hidden="true" />
                    <div className="scene1-parenting-record-date-copy">
                      <strong>{entry.date}</strong>
                      <span>{entry.age}</span>
                    </div>
                  </div>

                  <div className="scene1-parenting-record-card">
                    <div className="scene1-parenting-record-copy">
                      <div className="scene1-parenting-record-head">
                        <h3>{entry.title}</h3>
                        {entry.badge ? <button type="button">{entry.badge}</button> : null}
                      </div>
                      <p>{entry.summary}</p>
                    </div>

                    <div className={getRecordMediaClassName(entry.images.length)}>
                      {entry.images.map((image, index) => (
                        <div
                          key={`${entry.id}-image-${index}`}
                          className="scene1-parenting-record-media-frame"
                        >
                          <img src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        </div>
                      ))}
                    </div>

                    <div className="scene1-parenting-record-tags">
                      {entry.tags.map((tag) => (
                        <span key={`${entry.id}-${tag}`}>{tag}</span>
                      ))}
                    </div>

                    <footer className="scene1-parenting-record-footer">
                      <div className="scene1-parenting-record-author">
                        <span>{entry.author}</span>
                        <span>{entry.time}</span>
                      </div>
                      <button type="button" className="scene1-parenting-record-like" aria-label="点赞">
                        <span aria-hidden="true">♡</span>
                      </button>
                    </footer>

                    {entry.footer ? <p className="scene1-parenting-record-note">{entry.footer}</p> : null}
                  </div>
                </article>
              ))}
            </section>
          </section>

          <p className="scene1-parenting-empty">没有更多记录了</p>
        </main>
      </div>

      <div
        className="scene1-parenting-mode-switch"
        data-testid="scene1-parenting-mode-switch"
        aria-label="育儿模式切换"
      >
        <button type="button" className="scene1-parenting-mode-pill" onClick={() => navigate('/scene1')}>
          妈妈
        </button>
        <button type="button" className="scene1-parenting-mode-pill active">
          宝宝
        </button>
      </div>

      <Scene1BottomTabBar activeTab="home" className="scene1-parenting-tabbar" />
      <div className="scene1-home-indicator" aria-hidden="true" />
    </div>
  );
}
