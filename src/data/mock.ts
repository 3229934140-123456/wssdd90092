import type {
  EventItem,
  TimelineCard,
  ConcernItem,
  HandoffNote,
  MaterialItem,
} from "@/types";

export const mockEvents: EventItem[] = [
  {
    id: "evt-001",
    title: "XX小区自来水浑浊问题引发居民热议",
    level: "high",
    status: "responding",
    createdAt: "2026-06-17 08:30",
    updatedAt: "2026-06-18 16:20",
    description:
      "多个居民在微信群反映家中自来水出现浑浊、发黄现象，短视频平台出现多条相关视频，播放量累计超10万次。",
  },
  {
    id: "evt-002",
    title: "城区主干道施工围挡长期占用非机动车道",
    level: "medium",
    status: "monitoring",
    createdAt: "2026-06-16 14:15",
    updatedAt: "2026-06-18 09:00",
    description:
      "群众反映XX路与YY街交叉口施工围挡已设置三个月，占用非机动车道导致非机动车驶入机动车道，存在安全隐患。",
  },
  {
    id: "evt-003",
    title: "某学校疑似食品安全问题",
    level: "critical",
    status: "resolved",
    createdAt: "2026-06-15 11:20",
    updatedAt: "2026-06-17 18:45",
    description:
      "家长反映XX小学多名学生出现呕吐、腹泻症状，怀疑与学校午餐有关，事件引发家长群体广泛关注和讨论。",
  },
  {
    id: "evt-004",
    title: "城管执法过程中与商户发生冲突",
    level: "high",
    status: "resolved",
    createdAt: "2026-06-12 17:40",
    updatedAt: "2026-06-14 10:30",
    description:
      "网络流传一段城管执法视频，显示执法人员与占道经营商户发生肢体冲突，视频在短视频平台迅速传播。",
    isReview: true,
    reviewConclusion:
      "已对涉事执法人员停职检查，城管局开展全员执法规范培训。商户占道经营问题已规范处置。",
    reviewer: "王主任",
  },
  {
    id: "evt-005",
    title: "公园广场舞噪音扰民投诉持续增加",
    level: "low",
    status: "monitoring",
    createdAt: "2026-06-18 07:50",
    updatedAt: "2026-06-18 15:00",
    description:
      "多个居民通过12345热线投诉XX公园广场舞音量过大，影响周边居民正常休息和备考学生学习。",
  },
];

export const mockTimelineCards: TimelineCard[] = [
  {
    id: "tl-001-1",
    eventId: "evt-001",
    type: "wechat",
    title: "业主群集中反映水质问题",
    summary:
      "6月17日早8点起，XX花园、XX家园等5个小区业主群陆续有居民发布自来水浑浊照片，称早晨打开水龙头发现水呈黄褐色，有明显沉淀物。截至当日中午12点，相关微信群讨论量超过300条，涉及住户估计2000余户。",
    imageNote:
      "截图1：XX花园业主群聊天记录，显示多位业主发布水质照片并询问情况；截图2：居民家自来水样对比照片，左侧为浑浊水样，右侧为正常自来水。",
    impact: "涉及5个居民小区，约2000户居民受到影响",
    reachCount: 8000,
    channels: ["微信业主群(12个)", "朋友圈转发"],
    order: 1,
    sourceTime: "2026-06-17 08:30",
  },
  {
    id: "tl-001-2",
    eventId: "evt-001",
    type: "shortvideo",
    title: "多条短视频冲上本地热榜",
    summary:
      "6月17日下午起，抖音、快手等平台出现多条关于自来水浑浊的短视频，配文多为'XX县的自来水能喝吗？'等情绪化表达。其中一条播放量超6万，点赞3000+，评论区出现'被投毒了？''水管爆了？'等猜测性言论。",
    imageNote:
      "截图1：抖音热榜第8名'XX自来水浑浊'话题截图；截图2：高赞视频画面，居民直接接自来水展示浑浊状态。",
    impact: "短视频平台累计播放量超15万，本地热榜Top10",
    reachCount: 150000,
    channels: ["抖音", "快手", "视频号"],
    order: 2,
    sourceTime: "2026-06-17 15:45",
  },
  {
    id: "tl-001-3",
    eventId: "evt-001",
    type: "media",
    title: "市电视台关注报道",
    summary:
      "6月18日上午，市电视台《民生热线》栏目以《XX县多小区自来水浑浊 居民用水难》为题进行报道，采访了3位居民和小区物业，引用了部分网络视频。报道在市县两级电视台新闻频道播出，官方新媒体账号同步发布。",
    imageNote:
      "截图1：市电视台新闻报道画面截图，记者在居民家中采访；截图2：市电视台微信公众号推送文章截图，阅读量2万+。",
    impact: "市级媒体公开报道，舆论压力升级",
    reachCount: 50000,
    channels: ["市电视台新闻频道", "市电视台公众号", "今日头条号"],
    order: 3,
    sourceTime: "2026-06-18 09:00",
  },
  {
    id: "tl-001-4",
    eventId: "evt-001",
    type: "official",
    title: "水务局发布情况说明",
    summary:
      "6月18日下午16时，县水务局通过官方微信公众号发布《关于我县部分小区自来水浑浊问题的情况说明》，解释系供水管网冲洗导致，水质经检测符合安全标准，预计24小时内恢复正常。文末附24小时供水服务热线。",
    imageNote:
      "截图1：县水务局官方公众号发布的《情况说明》全文截图；截图2：水质检测报告关键数据页。",
    impact: "官方回应发布后，舆情热度开始回落，评论区正面评价占比提升至45%",
    reachCount: 35000,
    channels: ["县水务局公众号", "县融媒体中心各平台转发"],
    order: 4,
    sourceTime: "2026-06-18 16:20",
  },
  {
    id: "tl-003-1",
    eventId: "evt-003",
    type: "wechat",
    title: "家长群爆料学生集体呕吐腹泻",
    summary:
      "6月15日中午，XX小学多个家长群消息刷屏，称数十名学生午餐后出现呕吐、腹泻症状，部分学生已送医。家长情绪激动，质疑学校食堂食品安全。相关消息迅速在全县家长圈传播。",
    imageNote:
      "截图1：家长群聊天记录，多位家长反映孩子身体不适；截图2：医院儿科候诊区照片，多名学生在家长陪同下就诊。",
    impact: "涉及XX小学3-6年级学生，家长群体高度关注",
    reachCount: 12000,
    channels: ["家长群(18个)", "朋友圈"],
    order: 1,
    sourceTime: "2026-06-15 11:20",
  },
  {
    id: "tl-003-2",
    eventId: "evt-003",
    type: "shortvideo",
    title: "医院就诊视频引发更大关注",
    summary:
      "网络流传医院儿科就诊视频，可见多名学生在输液、候诊。配文'XX小学食物中毒了'，信息进一步失真。多条视频登上本地热搜，累计播放量超50万。",
    imageNote:
      "截图1：医院走廊学生就诊场景视频截图；截图2：抖音热榜第3名'XX小学食品安全'话题。",
    impact: "短视频平台舆情爆发，公众恐慌情绪蔓延",
    reachCount: 500000,
    channels: ["抖音", "快手", "微博"],
    order: 2,
    sourceTime: "2026-06-15 14:30",
  },
  {
    id: "tl-003-3",
    eventId: "evt-003",
    type: "media",
    title: "省级媒体介入报道",
    summary:
      "6月15日晚，省级都市频道《XX直通车》栏目连线报道，引用网络视频并电话采访了县教育局工作人员。报道标题为《疑食物中毒 数十名小学生送医》。",
    imageNote: "截图1：省电视台新闻报道截图，字幕'疑似食物中毒 校方暂无回应'。",
    impact: "省级媒体介入，事件影响范围扩大至全省",
    reachCount: 200000,
    channels: ["省都市频道", "省台新闻客户端"],
    order: 3,
    sourceTime: "2026-06-15 19:20",
  },
  {
    id: "tl-003-4",
    eventId: "evt-003",
    type: "official",
    title: "多部门联合发布调查结果",
    summary:
      "6月16日凌晨2点，县教育局、市场监管局、卫健委联合发布通报：经流调，学生症状与午餐无关，系诺如病毒感染引起。食堂食材留样检测均合格。同时公布就诊学生情况，均无大碍。",
    imageNote:
      "截图1：三部门联合通报全文截图；截图2：市场监管局食材检测报告摘要。",
    impact: "权威通报发布后，舆情迅速反转，'诺如病毒'话题取而代之",
    reachCount: 300000,
    channels: ["县政府官网", "所有官方新媒体", "转发至各家长群"],
    order: 4,
    sourceTime: "2026-06-16 02:00",
  },
];

export const mockConcerns: ConcernItem[] = [
  {
    id: "c-001-1",
    eventId: "evt-001",
    content: "自来水浑浊是不是水源被污染了？",
    category: "environment",
    checked: true,
    count: 128,
  },
  {
    id: "c-001-2",
    eventId: "evt-001",
    content: "浑浊的水喝了会不会生病？对健康有没有影响？",
    category: "healthcare",
    checked: true,
    count: 95,
  },
  {
    id: "c-001-3",
    eventId: "evt-001",
    content: "什么时候水才能恢复正常？有没有具体时间表？",
    category: "housing",
    checked: true,
    count: 87,
  },
  {
    id: "c-001-4",
    eventId: "evt-001",
    content: "之前怎么没通知？出了事才说管网友什么用？",
    category: "other",
    checked: true,
    count: 64,
  },
  {
    id: "c-001-5",
    eventId: "evt-001",
    content: "物业和自来水公司互相推诿，到底找谁负责？",
    category: "other",
    checked: false,
    count: 42,
  },
  {
    id: "c-001-6",
    eventId: "evt-001",
    content: "管网冲洗为什么不提前通知？",
    category: "housing",
    checked: true,
    count: 56,
  },
  {
    id: "c-001-7",
    eventId: "evt-001",
    content: "能不能安排送水车？老人小孩没水用很不方便。",
    category: "housing",
    checked: false,
    count: 38,
  },
  {
    id: "c-003-1",
    eventId: "evt-003",
    content: "学校食堂是不是没有卫生许可证？",
    category: "education",
    checked: true,
    count: 210,
  },
  {
    id: "c-003-2",
    eventId: "evt-003",
    content: "孩子现在情况怎么样？会不会有后遗症？",
    category: "healthcare",
    checked: true,
    count: 185,
  },
  {
    id: "c-003-3",
    eventId: "evt-003",
    content: "为什么不早点通知家长？信息公开太慢了。",
    category: "education",
    checked: true,
    count: 156,
  },
  {
    id: "c-003-4",
    eventId: "evt-003",
    content: "学校以后怎么保证食品安全？会不会换食堂承包商？",
    category: "education",
    checked: true,
    count: 134,
  },
  {
    id: "c-003-5",
    eventId: "evt-003",
    content: "相关责任人会不会被处理？",
    category: "law_enforcement",
    checked: false,
    count: 98,
  },
];

export const mockHandoffNotes: HandoffNote[] = [
  {
    id: "h-001-1",
    eventId: "evt-001",
    section: "unverified",
    content:
      "1. 有网友称'水烧开后有怪味'，目前尚未核实，建议安排水质复检；2. 传闻XX小区有老人因饮用浑水身体不适就医，未确认具体医院和人员信息。",
    author: "张值班",
    createdAt: "2026-06-17 22:30",
    shiftId: "2026-06-17-night",
    shiftLabel: "2026-06-17 夜班",
  },
  {
    id: "h-001-2",
    eventId: "evt-001",
    section: "to_contact",
    content:
      "需联系部门：1. 县水务局供水科（李科长 138XXXX），确认管网冲洗结束时间；2. XX街道办事处（王主任 139XXXX），协调社区开展入户解释；3. 县卫健局，协调出具官方水质安全意见。",
    author: "张值班",
    createdAt: "2026-06-17 22:35",
    shiftId: "2026-06-17-night",
    shiftLabel: "2026-06-17 夜班",
  },
  {
    id: "h-001-3",
    eventId: "evt-001",
    section: "confidential",
    content:
      "1. 水务局内部承认管网冲洗未按规定提前48小时通知，此信息暂不宜公开，待统一口径；2. 县领导对此事高度关注，要求24小时内必须解决并发布权威说明。",
    author: "张值班",
    createdAt: "2026-06-17 22:40",
    shiftId: "2026-06-17-night",
    shiftLabel: "2026-06-17 夜班",
  },
  {
    id: "h-003-1",
    eventId: "evt-003",
    section: "unverified",
    content:
      "网络传闻'有学生洗胃'，经初步核实为不实信息，但仍有个别自媒体在传播，需持续关注。",
    author: "李值班",
    createdAt: "2026-06-15 23:00",
    shiftId: "2026-06-15-night",
    shiftLabel: "2026-06-15 夜班",
  },
  {
    id: "h-003-2",
    eventId: "evt-003",
    section: "to_contact",
    content:
      "已联系县疾控中心、市监局、教育局，三方凌晨2点联合发布通报。下一班需联系各学校确认晨检情况，防止恐慌情绪扩散。",
    author: "李值班",
    createdAt: "2026-06-16 02:15",
    shiftId: "2026-06-15-night",
    shiftLabel: "2026-06-15 夜班",
  },
];

export const mockMaterials: MaterialItem[] = [
  {
    id: "m-001",
    eventId: "evt-001",
    eventTitle: "XX小区自来水浑浊问题",
    type: "水质检测报告",
    department: "县卫健局",
    deadline: "2026-06-19 18:00",
    status: "pending",
  },
  {
    id: "m-002",
    eventId: "evt-001",
    eventTitle: "XX小区自来水浑浊问题",
    type: "管网冲洗记录",
    department: "县水务局",
    deadline: "2026-06-19 12:00",
    status: "submitted",
  },
  {
    id: "m-003",
    eventId: "evt-002",
    eventTitle: "城区主干道施工围挡占道问题",
    type: "施工许可审批材料",
    department: "县住建局",
    deadline: "2026-06-20 18:00",
    status: "pending",
  },
  {
    id: "m-004",
    eventId: "evt-003",
    eventTitle: "某学校疑似食品安全问题",
    type: "食堂食材进货凭证",
    department: "县市监局",
    deadline: "2026-06-18 18:00",
    status: "approved",
  },
  {
    id: "m-005",
    eventId: "evt-004",
    eventTitle: "城管执法冲突事件",
    type: "执法记录仪完整视频",
    department: "县城管局",
    deadline: "2026-06-15 18:00",
    status: "approved",
  },
];
