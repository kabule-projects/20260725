import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const STAFFING_DATA = [
  {
    group: '策划',
    subgroups: [
      {
        name: '总策划',
        members: [
          { id: '@查米吗琳' },
          { id: '@小木叮叮当当' }
        ]
      },
      {
        name: '考据顾问',
        members: [
          { id: '@岑嵛_过载版' }
        ]
      }
    ]
  },
  {
    group: '美术',
    subgroups: [
      {
        name: '商品组',
        members: [
          { id: '@胡同口卯時二刻', years: '2014' },
          { id: '@久不晚睡', years: '2015、2018' },
          { id: '@迷匣匣匣', years: '2016、2019' },
          { id: '@一锅望仔', years: '2017' },
          { id: '@啾星原产果冻现摘现发', years: '2020、2025' },
          { id: '@邪恶小毛米', years: '2021、2024' },
          { id: '@纳米大瓢', years: '2022' },
          { id: '@氵衮去看书', years: '2023' },
          { id: '@积极向上桔叨叨', years: '2026' }
        ]
      },
      {
        name: '互动组',
        members: [
          { id: '@甜团子咸粽子', years: '2014' },
          { id: '@hinatayuki', years: '2015' },
          { id: '@迷匣匣匣', years: '2016、2019' },
          { id: '@一锅望仔', years: '2017、2025' },
          { id: '@久不晚睡', years: '2018、2023' },
          { id: '@王久哔哔叭叭', years: '2019' },
          { id: '@茗酱白粥铺', years: '2019' },
          { id: '@dontmind_冬麦', years: '2020' },
          { id: '@王工头又困了', years: '2021' },
          { id: '@大山深处的唢呐', years: '2022' },
          { id: '@邪恶小毛米', years: '2024' },
          { id: '@Gululu苔古', years: '2026' }
        ]
      }
    ]
  },
  {
    group: '美工',
    subgroups: [
      {
        name: '网页视觉概念',
        members: [{ id: '@查米吗琳' }]
      },
      {
        name: '网页视觉美术',
        members: [{ id: '@朽夜' }, { id: '@迷匣匣匣' }, { id: '@王工头又困了' }]
      },
      {
        name: '网页UI视觉',
        members: [{ id: '@PPN_楠' }]
      },
      {
        name: '企划logo设计',
        members: [{ id: '@PPN_楠' }]
      }
    ]
  },
  {
    group: '文案',
    subgroups: [
      {
        name: '',
        members: [
          { id: '@查米吗琳' },
          { id: '@大山深处的唢呐' }
        ]
      }
    ]
  },
  {
    group: '技术',
    subgroups: [
      {
        name: '全栈工程',
        members: [
          { id: '@小木叮叮当当' }
        ]
      }
    ]
  },
  {
    group: '运营赞助',
    subgroups: [
      {
        name: '服务器赞助',
        members: [
          { id: '@小木叮叮当当' }
        ]
      }
    ]
  },
  {
    group: '特别鸣谢',
    subgroups: [
      {
        name: '',
        members: [
          { id: '@卡布叻_周深' }
        ]
      }
    ]
  }
];

const Staffing = () => {
  return (
    <div className="min-h-screen pb-12">
      <header className="relative py-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-serif text-gradient mb-4">
            企划人员名单
          </h1>
          <p className="text-memory-glow/60 text-sm tracking-widest uppercase">
            Staffing
          </p>
        </motion.div>
      </header>

      <main className="px-4 md:px-6 max-w-2xl mx-auto">
        <motion.div
          className="bg-memory-card/50 rounded-lg p-6 md:p-8 surreal-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >

          {STAFFING_DATA.map((section, sectionIndex) => (
            <motion.div
              key={section.group}
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + sectionIndex * 0.1 }}
            >
              <h2 className="text-memory-accent font-medium text-lg mb-4 text-center">
                {section.group}
              </h2>

              {section.subgroups.map((subgroup, subgroupIndex) => (
                <div key={subgroup.name || subgroupIndex} className="mb-6">
                  {subgroup.name && (
                    <h3 className="text-memory-glow/70 text-sm mb-2 ml-2">
                      {subgroup.name}
                    </h3>
                  )}
                  <div className="flex flex-wrap gap-2 ml-4">
                    {subgroup.members.map((member, memberIndex) => (
                      <span
                        key={memberIndex}
                        className={`px-3 py-1 rounded-full text-xs ${subgroup.name ? 'bg-memory-glow/10' : 'bg-memory-glow/10'}`}
                      >
                        <span className={subgroup.name ? 'text-memory-glow' : 'text-memory-glow'}>{member.id}</span>
                        {member.years && (
                          <span className="text-memory-glow/50 ml-1">（{member.years}）</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="mt-12 text-center px-6">
        <motion.button
          className="px-6 py-2 bg-memory-glow/20 text-memory-glow rounded-lg border border-memory-glow/30 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/">返回首页</Link>
        </motion.button>
      </footer>
    </div>
  );
};

export default Staffing;