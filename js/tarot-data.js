/**
 * Mystic Weave Tarot - 塔罗牌数据
 * 莱德韦特（Rider-Waite）78张完整牌组 + 牌义关键词
 */
const TAROT_DECK = [
  // ===== 大阿尔卡纳 (Major Arcana) 22张 =====
  { id: 0, name: "The Fool", nameCN: "愚者", image: "images/rider-waite-tarot/major_arcana_fool.webp", keywords: "New Beginnings · Adventure · Spontaneity", keywordsCN: "新的开始 · 冒险 · 自发性" },
  { id: 1, name: "The Magician", nameCN: "魔术师", image: "images/rider-waite-tarot/major_arcana_magician.webp", keywords: "Willpower · Manifestation · Resourcefulness", keywordsCN: "意志力 · 显化 · 足智多谋" },
  { id: 2, name: "The High Priestess", nameCN: "女祭司", image: "images/rider-waite-tarot/major_arcana_priestess.webp", keywords: "Intuition · Mystery · Inner Voice", keywordsCN: "直觉 · 神秘 · 内在之声" },
  { id: 3, name: "The Empress", nameCN: "女皇", image: "images/rider-waite-tarot/major_arcana_empress.webp", keywords: "Abundance · Nurturing · Fertility", keywordsCN: "丰盛 · 养育 · 富饶" },
  { id: 4, name: "The Emperor", nameCN: "皇帝", image: "images/rider-waite-tarot/major_arcana_emperor.webp", keywords: "Authority · Structure · Leadership", keywordsCN: "权威 · 秩序 · 领导力" },
  { id: 5, name: "The Hierophant", nameCN: "教皇", image: "images/rider-waite-tarot/major_arcana_hierophant.webp", keywords: "Tradition · Wisdom · Spiritual Guidance", keywordsCN: "传统 · 智慧 · 精神指引" },
  { id: 6, name: "The Lovers", nameCN: "恋人", image: "images/rider-waite-tarot/major_arcana_lovers.webp", keywords: "Love · Harmony · Choices", keywordsCN: "爱情 · 和谐 · 选择" },
  { id: 7, name: "The Chariot", nameCN: "战车", image: "images/rider-waite-tarot/major_arcana_chariot.webp", keywords: "Determination · Victory · Willpower", keywordsCN: "决心 · 胜利 · 意志力" },
  { id: 8, name: "Strength", nameCN: "力量", image: "images/rider-waite-tarot/major_arcana_strength.webp", keywords: "Courage · Inner Strength · Patience", keywordsCN: "勇气 · 内在力量 · 耐心" },
  { id: 9, name: "The Hermit", nameCN: "隐者", image: "images/rider-waite-tarot/major_arcana_hermit.webp", keywords: "Solitude · Reflection · Inner Guidance", keywordsCN: "独处 · 反思 · 内在指引" },
  { id: 10, name: "Wheel of Fortune", nameCN: "命运之轮", image: "images/rider-waite-tarot/major_arcana_fortune.webp", keywords: "Destiny · Cycles · Turning Point", keywordsCN: "命运 · 循环 · 转折点" },
  { id: 11, name: "Justice", nameCN: "正义", image: "images/rider-waite-tarot/major_arcana_justice.webp", keywords: "Fairness · Truth · Balance", keywordsCN: "公正 · 真相 · 平衡" },
  { id: 12, name: "The Hanged Man", nameCN: "倒吊人", image: "images/rider-waite-tarot/major_arcana_hanged.webp", keywords: "Surrender · New Perspective · Letting Go", keywordsCN: "臣服 · 新视角 · 放手" },
  { id: 13, name: "Death", nameCN: "死神", image: "images/rider-waite-tarot/major_arcana_death.webp", keywords: "Transformation · Endings · Renewal", keywordsCN: "转变 · 结束 · 新生" },
  { id: 14, name: "Temperance", nameCN: "节制", image: "images/rider-waite-tarot/major_arcana_temperance.webp", keywords: "Balance · Moderation · Patience", keywordsCN: "平衡 · 节制 · 耐心" },
  { id: 15, name: "The Devil", nameCN: "恶魔", image: "images/rider-waite-tarot/major_arcana_devil.webp", keywords: "Temptation · Bondage · Shadow Self", keywordsCN: "诱惑 · 束缚 · 阴暗面" },
  { id: 16, name: "The Tower", nameCN: "塔", image: "images/rider-waite-tarot/major_arcana_tower.webp", keywords: "Upheaval · Revelation · Sudden Change", keywordsCN: "剧变 · 启示 · 突变" },
  { id: 17, name: "The Star", nameCN: "星星", image: "images/rider-waite-tarot/major_arcana_star.webp", keywords: "Hope · Inspiration · Serenity", keywordsCN: "希望 · 灵感 · 宁静" },
  { id: 18, name: "The Moon", nameCN: "月亮", image: "images/rider-waite-tarot/major_arcana_moon.webp", keywords: "Illusion · Intuition · Subconscious", keywordsCN: "幻象 · 直觉 · 潜意识" },
  { id: 19, name: "The Sun", nameCN: "太阳", image: "images/rider-waite-tarot/major_arcana_sun.webp", keywords: "Joy · Success · Vitality", keywordsCN: "喜悦 · 成功 · 活力" },
  { id: 20, name: "Judgement", nameCN: "审判", image: "images/rider-waite-tarot/major_arcana_judgement.webp", keywords: "Rebirth · Calling · Absolution", keywordsCN: "重生 · 召唤 · 赦免" },
  { id: 21, name: "The World", nameCN: "世界", image: "images/rider-waite-tarot/major_arcana_world.webp", keywords: "Completion · Achievement · Wholeness", keywordsCN: "圆满 · 成就 · 完整" },

  // ===== 小阿尔卡纳 - 权杖 (Wands) 14张 =====
  { id: 22, name: "Ace of Wands", nameCN: "权杖王牌", image: "images/rider-waite-tarot/minor_arcana_wands_ace.webp", keywords: "Inspiration · New Opportunity · Growth", keywordsCN: "灵感 · 新机遇 · 成长" },
  { id: 23, name: "Two of Wands", nameCN: "权杖二", image: "images/rider-waite-tarot/minor_arcana_wands_2.webp", keywords: "Planning · Decisions · Discovery", keywordsCN: "规划 · 决策 · 发现" },
  { id: 24, name: "Three of Wands", nameCN: "权杖三", image: "images/rider-waite-tarot/minor_arcana_wands_3.webp", keywords: "Expansion · Foresight · Progress", keywordsCN: "扩展 · 远见 · 进步" },
  { id: 25, name: "Four of Wands", nameCN: "权杖四", image: "images/rider-waite-tarot/minor_arcana_wands_4.webp", keywords: "Celebration · Harmony · Homecoming", keywordsCN: "庆祝 · 和谐 · 归属" },
  { id: 26, name: "Five of Wands", nameCN: "权杖五", image: "images/rider-waite-tarot/minor_arcana_wands_5.webp", keywords: "Conflict · Competition · Tension", keywordsCN: "冲突 · 竞争 · 紧张" },
  { id: 27, name: "Six of Wands", nameCN: "权杖六", image: "images/rider-waite-tarot/minor_arcana_wands_6.webp", keywords: "Victory · Recognition · Success", keywordsCN: "胜利 · 认可 · 成功" },
  { id: 28, name: "Seven of Wands", nameCN: "权杖七", image: "images/rider-waite-tarot/minor_arcana_wands_7.webp", keywords: "Courage · Perseverance · Defense", keywordsCN: "勇气 · 坚持 · 防御" },
  { id: 29, name: "Eight of Wands", nameCN: "权杖八", image: "images/rider-waite-tarot/minor_arcana_wands_8.webp", keywords: "Speed · Action · Swift Change", keywordsCN: "速度 · 行动 · 迅速变化" },
  { id: 30, name: "Nine of Wands", nameCN: "权杖九", image: "images/rider-waite-tarot/minor_arcana_wands_9.webp", keywords: "Resilience · Persistence · Last Stand", keywordsCN: "韧性 · 坚持 · 最后一搏" },
  { id: 31, name: "Ten of Wands", nameCN: "权杖十", image: "images/rider-waite-tarot/minor_arcana_wands_10.webp", keywords: "Burden · Responsibility · Hard Work", keywordsCN: "负担 · 责任 · 辛劳" },
  { id: 32, name: "Page of Wands", nameCN: "权杖侍从", image: "images/rider-waite-tarot/minor_arcana_wands_page.webp", keywords: "Enthusiasm · Exploration · Discovery", keywordsCN: "热情 · 探索 · 发现" },
  { id: 33, name: "Knight of Wands", nameCN: "权杖骑士", image: "images/rider-waite-tarot/minor_arcana_wands_knight.webp", keywords: "Energy · Passion · Adventure", keywordsCN: "能量 · 热情 · 冒险" },
  { id: 34, name: "Queen of Wands", nameCN: "权杖王后", image: "images/rider-waite-tarot/minor_arcana_wands_queen.webp", keywords: "Confidence · Independence · Warmth", keywordsCN: "自信 · 独立 · 温暖" },
  { id: 35, name: "King of Wands", nameCN: "权杖国王", image: "images/rider-waite-tarot/minor_arcana_wands_king.webp", keywords: "Leadership · Vision · Bold Action", keywordsCN: "领导力 · 远见 · 果敢" },

  // ===== 小阿尔卡纳 - 圣杯 (Cups) 14张 =====
  { id: 36, name: "Ace of Cups", nameCN: "圣杯王牌", image: "images/rider-waite-tarot/minor_arcana_cups_ace.webp", keywords: "New Love · Compassion · Emotional Beginning", keywordsCN: "新的爱 · 慈悲 · 情感开端" },
  { id: 37, name: "Two of Cups", nameCN: "圣杯二", image: "images/rider-waite-tarot/minor_arcana_cups_2.webp", keywords: "Partnership · Unity · Mutual Attraction", keywordsCN: "伙伴 · 联合 · 相互吸引" },
  { id: 38, name: "Three of Cups", nameCN: "圣杯三", image: "images/rider-waite-tarot/minor_arcana_cups_3.webp", keywords: "Celebration · Friendship · Community", keywordsCN: "庆祝 · 友谊 · 社群" },
  { id: 39, name: "Four of Cups", nameCN: "圣杯四", image: "images/rider-waite-tarot/minor_arcana_cups_4.webp", keywords: "Contemplation · Apathy · Re-evaluation", keywordsCN: "沉思 · 冷漠 · 重新评估" },
  { id: 40, name: "Five of Cups", nameCN: "圣杯五", image: "images/rider-waite-tarot/minor_arcana_cups_5.webp", keywords: "Loss · Grief · Regret", keywordsCN: "失去 · 悲伤 · 遗憾" },
  { id: 41, name: "Six of Cups", nameCN: "圣杯六", image: "images/rider-waite-tarot/minor_arcana_cups_6.webp", keywords: "Nostalgia · Innocence · Happy Memories", keywordsCN: "怀旧 · 纯真 · 美好回忆" },
  { id: 42, name: "Seven of Cups", nameCN: "圣杯七", image: "images/rider-waite-tarot/minor_arcana_cups_7.webp", keywords: "Fantasy · Illusion · Choices", keywordsCN: "幻想 · 幻觉 · 选择" },
  { id: 43, name: "Eight of Cups", nameCN: "圣杯八", image: "images/rider-waite-tarot/minor_arcana_cups_8.webp", keywords: "Walking Away · Seeking Truth · Letting Go", keywordsCN: "离开 · 寻求真相 · 放下" },
  { id: 44, name: "Nine of Cups", nameCN: "圣杯九", image: "images/rider-waite-tarot/minor_arcana_cups_9.webp", keywords: "Wishes Fulfilled · Satisfaction · Contentment", keywordsCN: "愿望成真 · 满足 · 知足" },
  { id: 45, name: "Ten of Cups", nameCN: "圣杯十", image: "images/rider-waite-tarot/minor_arcana_cups_10.webp", keywords: "Harmony · Family · Happiness", keywordsCN: "和谐 · 家庭 · 幸福" },
  { id: 46, name: "Page of Cups", nameCN: "圣杯侍从", image: "images/rider-waite-tarot/minor_arcana_cups_page.webp", keywords: "Creative Message · Intuition · Youthful Energy", keywordsCN: "创意讯息 · 直觉 · 年轻能量" },
  { id: 47, name: "Knight of Cups", nameCN: "圣杯骑士", image: "images/rider-waite-tarot/minor_arcana_cups_knight.webp", keywords: "Romance · Charm · Idealism", keywordsCN: "浪漫 · 魅力 · 理想主义" },
  { id: 48, name: "Queen of Cups", nameCN: "圣杯王后", image: "images/rider-waite-tarot/minor_arcana_cups_queen.webp", keywords: "Compassion · Calm · Emotional Security", keywordsCN: "慈悲 · 平静 · 情感安全" },
  { id: 49, name: "King of Cups", nameCN: "圣杯国王", image: "images/rider-waite-tarot/minor_arcana_cups_king.webp", keywords: "Emotional Balance · Diplomacy · Wisdom", keywordsCN: "情感平衡 · 外交 · 智慧" },

  // ===== 小阿尔卡纳 - 宝剑 (Swords) 14张 =====
  { id: 50, name: "Ace of Swords", nameCN: "宝剑王牌", image: "images/rider-waite-tarot/minor_arcana_swords_ace.webp", keywords: "Clarity · Breakthrough · Truth", keywordsCN: "清晰 · 突破 · 真相" },
  { id: 51, name: "Two of Swords", nameCN: "宝剑二", image: "images/rider-waite-tarot/minor_arcana_swords_2.webp", keywords: "Indecision · Stalemate · Difficult Choice", keywordsCN: "犹豫 · 僵局 · 艰难选择" },
  { id: 52, name: "Three of Swords", nameCN: "宝剑三", image: "images/rider-waite-tarot/minor_arcana_swords_3.webp", keywords: "Heartbreak · Sorrow · Painful Truth", keywordsCN: "心碎 · 悲伤 · 痛苦真相" },
  { id: 53, name: "Four of Swords", nameCN: "宝剑四", image: "images/rider-waite-tarot/minor_arcana_swords_4.webp", keywords: "Rest · Recovery · Contemplation", keywordsCN: "休息 · 恢复 · 沉思" },
  { id: 54, name: "Five of Swords", nameCN: "宝剑五", image: "images/rider-waite-tarot/minor_arcana_swords_5.webp", keywords: "Conflict · Defeat · Hollow Victory", keywordsCN: "冲突 · 失败 · 空虚的胜利" },
  { id: 55, name: "Six of Swords", nameCN: "宝剑六", image: "images/rider-waite-tarot/minor_arcana_swords_6.webp", keywords: "Transition · Moving On · Recovery", keywordsCN: "过渡 · 前行 · 恢复" },
  { id: 56, name: "Seven of Swords", nameCN: "宝剑七", image: "images/rider-waite-tarot/minor_arcana_swords_7.webp", keywords: "Strategy · Deception · Stealth", keywordsCN: "策略 · 欺骗 · 隐秘" },
  { id: 57, name: "Eight of Swords", nameCN: "宝剑八", image: "images/rider-waite-tarot/minor_arcana_swords_8.webp", keywords: "Restriction · Trapped · Self-Limiting", keywordsCN: "限制 · 困住 · 自我设限" },
  { id: 58, name: "Nine of Swords", nameCN: "宝剑九", image: "images/rider-waite-tarot/minor_arcana_swords_9.webp", keywords: "Anxiety · Worry · Nightmares", keywordsCN: "焦虑 · 担忧 · 噩梦" },
  { id: 59, name: "Ten of Swords", nameCN: "宝剑十", image: "images/rider-waite-tarot/minor_arcana_swords_10.webp", keywords: "Ending · Rock Bottom · New Dawn", keywordsCN: "终结 · 触底 · 新曙光" },
  { id: 60, name: "Page of Swords", nameCN: "宝剑侍从", image: "images/rider-waite-tarot/minor_arcana_swords_page.webp", keywords: "Curiosity · Vigilance · Mental Agility", keywordsCN: "好奇 · 警觉 · 思维敏捷" },
  { id: 61, name: "Knight of Swords", nameCN: "宝剑骑士", image: "images/rider-waite-tarot/minor_arcana_swords_knight.webp", keywords: "Ambition · Action · Impulsiveness", keywordsCN: "雄心 · 行动 · 冲动" },
  { id: 62, name: "Queen of Swords", nameCN: "宝剑王后", image: "images/rider-waite-tarot/minor_arcana_swords_queen.webp", keywords: "Independence · Clear Thinking · Honesty", keywordsCN: "独立 · 清晰思维 · 正直" },
  { id: 63, name: "King of Swords", nameCN: "宝剑国王", image: "images/rider-waite-tarot/minor_arcana_swords_king.webp", keywords: "Intellect · Authority · Truth", keywordsCN: "智慧 · 权威 · 真理" },

  // ===== 小阿尔卡纳 - 星币 (Pentacles) 14张 =====
  { id: 64, name: "Ace of Pentacles", nameCN: "星币王牌", image: "images/rider-waite-tarot/minor_arcana_pentacles_ace.webp", keywords: "New Financial Start · Prosperity · Opportunity", keywordsCN: "新财运 · 繁荣 · 机遇" },
  { id: 65, name: "Two of Pentacles", nameCN: "星币二", image: "images/rider-waite-tarot/minor_arcana_pentacles_2.webp", keywords: "Balance · Adaptability · Juggling", keywordsCN: "平衡 · 适应 · 兼顾" },
  { id: 66, name: "Three of Pentacles", nameCN: "星币三", image: "images/rider-waite-tarot/minor_arcana_pentacles_3.webp", keywords: "Teamwork · Craftsmanship · Collaboration", keywordsCN: "团队合作 · 工艺 · 协作" },
  { id: 67, name: "Four of Pentacles", nameCN: "星币四", image: "images/rider-waite-tarot/minor_arcana_pentacles_4.webp", keywords: "Security · Control · Possessiveness", keywordsCN: "安全感 · 控制 · 占有" },
  { id: 68, name: "Five of Pentacles", nameCN: "星币五", image: "images/rider-waite-tarot/minor_arcana_pentacles_5.webp", keywords: "Hardship · Loss · Isolation", keywordsCN: "困难 · 损失 · 孤立" },
  { id: 69, name: "Six of Pentacles", nameCN: "星币六", image: "images/rider-waite-tarot/minor_arcana_pentacles_6.webp", keywords: "Generosity · Charity · Sharing", keywordsCN: "慷慨 · 慈善 · 分享" },
  { id: 70, name: "Seven of Pentacles", nameCN: "星币七", image: "images/rider-waite-tarot/minor_arcana_pentacles_7.webp", keywords: "Patience · Investment · Long-term View", keywordsCN: "耐心 · 投资 · 长远眼光" },
  { id: 71, name: "Eight of Pentacles", nameCN: "星币八", image: "images/rider-waite-tarot/minor_arcana_pentacles_8.webp", keywords: "Diligence · Skill · Mastery", keywordsCN: "勤勉 · 技能 · 精通" },
  { id: 72, name: "Nine of Pentacles", nameCN: "星币九", image: "images/rider-waite-tarot/minor_arcana_pentacles_9.webp", keywords: "Luxury · Self-Sufficiency · Abundance", keywordsCN: "奢华 · 自给自足 · 丰裕" },
  { id: 73, name: "Ten of Pentacles", nameCN: "星币十", image: "images/rider-waite-tarot/minor_arcana_pentacles_10.webp", keywords: "Wealth · Legacy · Family Fortune", keywordsCN: "财富 · 传承 · 家族兴旺" },
  { id: 74, name: "Page of Pentacles", nameCN: "星币侍从", image: "images/rider-waite-tarot/minor_arcana_pentacles_page.webp", keywords: "Ambition · Studiousness · New Venture", keywordsCN: "抱负 · 好学 · 新事业" },
  { id: 75, name: "Knight of Pentacles", nameCN: "星币骑士", image: "images/rider-waite-tarot/minor_arcana_pentacles_knight.webp", keywords: "Hard Work · Reliability · Routine", keywordsCN: "努力 · 可靠 · 踏实" },
  { id: 76, name: "Queen of Pentacles", nameCN: "星币王后", image: "images/rider-waite-tarot/minor_arcana_pentacles_queen.webp", keywords: "Nurturing · Practicality · Comfort", keywordsCN: "养育 · 务实 · 舒适" },
  { id: 77, name: "King of Pentacles", nameCN: "星币国王", image: "images/rider-waite-tarot/minor_arcana_pentacles_king.webp", keywords: "Wealth · Business · Stability", keywordsCN: "财富 · 商业 · 稳定" }
];

/* 牌背图片路径 */
const CARD_BACK_IMAGE = "images/card_back.webp";