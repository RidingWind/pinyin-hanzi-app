/* =====================================================
   拼音乐园 · 课程数据
   字段: c=汉字 p=拼音 m=释义 rad=部首 st=笔画数 tip=字源小知识
        e=义演示主表情 a=动画类 bg=场景底色 t=场景说明
        w=常用词语[[词,拼音]]  s=造句[[句子,拼音,英文]]
   ===================================================== */
window.TONE_COLORS = { 1: '#FF4B4B', 2: '#FF9600', 3: '#1CB0F6', 4: '#CE82FF', 5: '#9AA3AF' };

/* 拼音标准呼读音录音（第一声），文件名对应 audio/{值}.mp3 */
window.PINYIN_AUDIO = {
  b: 'bo1', p: 'po1', m: 'mo1', f: 'fo1', d: 'de1', t: 'te1', n: 'ne1', l: 'le1',
  g: 'ge1', k: 'ke1', h: 'he1', j: 'ji1', q: 'qi1', x: 'xi1',
  zh: 'zhi1', ch: 'chi1', sh: 'shi1', r: 'ri1', z: 'zi1', c: 'ci1', s: 'si1', y: 'yi1', w: 'wu1',
  a: 'a1', o: 'o1', e: 'e1', i: 'yi1', u: 'wu1', 'ü': 'yu1',
  ai: 'ai1', ei: 'ei1', ui: 'wei1', ao: 'ao1', ou: 'ou1', iu: 'you1', ie: 'ye1', 'üe': 'yue1', er: 'er1',
  an: 'an1', en: 'en1', in: 'yin1', un: 'wen1', 'ün': 'yun1',
  ang: 'ang1', eng: 'eng1', ing: 'ying1', ong: 'ong1',
  zhi: 'zhi1', chi: 'chi1', shi: 'shi1', ri: 'ri1', zi: 'zi1', ci: 'ci1', si: 'si1',
  yi: 'yi1', wu: 'wu1', yu: 'yu1', ye: 'ye1', yue: 'yue1', yuan: 'yuan1', yin: 'yin1', yun: 'yun1', ying: 'ying1'
};

window.PINYIN_DATA = {
  initials: [['b','玻'],['p','坡'],['m','摸'],['f','佛'],['d','得'],['t','特'],['n','讷'],['l','勒'],['g','哥'],['k','科'],['h','喝'],['j','鸡'],['q','七'],['x','西'],['zh','知'],['ch','吃'],['sh','诗'],['r','日'],['z','资'],['c','刺'],['s','思'],['y','衣'],['w','乌']],
  finals: [['a','啊'],['o','喔'],['e','鹅'],['i','衣'],['u','乌'],['ü','迂'],['ai','哀'],['ei','欸'],['ui','威'],['ao','熬'],['ou','欧'],['iu','优'],['ie','耶'],['üe','约'],['er','儿'],['an','安'],['en','恩'],['in','音'],['un','温'],['ün','晕'],['ang','昂'],['eng','灯'],['ing','英'],['ong','中']],
  integral: [['zhi','知'],['chi','吃'],['shi','诗'],['ri','日'],['zi','资'],['ci','刺'],['si','思'],['yi','一'],['wu','五'],['yu','鱼'],['ye','叶'],['yue','月'],['yuan','元'],['yin','因'],['yun','云'],['ying','鹰']]
};

/* 声调练习行：同拼音不同声调 */
window.TONE_ROWS = [
  [['妈','mā'],['麻','má'],['马','mǎ'],['骂','mà']],
  [['汤','tāng'],['糖','táng'],['躺','tǎng'],['烫','tàng']],
  [['衣','yī'],['移','yí'],['椅','yǐ'],['意','yì']]
];

/* 拼音启蒙课程：听音辨音题组（每个小数组是易混淆组） */
window.PINYIN_LESSONS = [
  { id:'p1', name:'声母辨认', emoji:'🔤', desc:'听发音，选出正确的声母', sets:[
    [['八','bā'],['搭','dā'],['趴','pā']],
    [['妈','mā'],['拿','ná'],['拉','lā']],
    [['发','fā'],['哈','hā'],['虾','xiā']],
    [['嘎','gā'],['咖','kā'],['哈','hā']],
    [['鸡','jī'],['七','qī'],['西','xī']],
    [['知','zhī'],['吃','chī'],['师','shī'],['日','rì']],
    [['自','zì'],['刺','cì'],['四','sì']],
    [['衣','yī'],['乌','wū'],['鱼','yú']]
  ]},
  { id:'p2', name:'韵母辨认', emoji:'🎵', desc:'听发音，选出正确的韵母', sets:[
    [['三','sān'],['上','shàng']],
    [['门','mén'],['灯','dēng']],
    [['心','xīn'],['星','xīng']],
    [['白','bái'],['北','běi']],
    [['猫','māo'],['楼','lóu']],
    [['云','yún'],['温','wēn']],
    [['叶','yè'],['月','yuè']]
  ]},
  { id:'p3', name:'声调高手', emoji:'🎹', desc:'四声不同，耳朵来分辨', tone:true }
];

window.UNITS = [
/* ---------- 单元1：数字乐园 ---------- */
{ id:'num', name:'数字乐园', emoji:'🔢', color:'#FF9600', desc:'学会 1-10，数数不求人', chars:[
 {c:'一',p:'yī',m:'数字一（one）',rad:'一',st:1,tip:'一横就是“一”，古人用横线记数。',e:'🍎',a:'pop',bg:'#FFF3D6',t:'一个红苹果',w:[['一个','yí gè'],['一起','yìqǐ'],['第一','dì-yī']],s:[['我有一个苹果。','wǒ yǒu yí gè píngguǒ.','I have an apple.'],['我们一起玩。','wǒmen yìqǐ wán.','We play together.']]},
 {c:'二',p:'èr',m:'数字二（two）',rad:'二',st:2,tip:'两横叠起来就是“二”。',e:'👀',a:'blink',bg:'#E7F0FF',t:'两只眼睛眨呀眨',w:[['二十','èrshí'],['第二','dì-èr']],s:[['一加一等于二。','yì jiā yì děngyú èr.','One plus one is two.'],['弟弟排第二。','dìdi pái dì-èr.','Brother ranks second.']]},
 {c:'三',p:'sān',m:'数字三（three）',rad:'一',st:3,tip:'三横就是“三”，古人照样画杠杠记数。',e:'🌲',a:'sway',bg:'#E3F6E8',t:'三棵小树',w:[['三个','sān gè'],['三月','sānyuè']],s:[['我有三本书。','wǒ yǒu sān běn shū.','I have three books.'],['树上有三只鸟。','shù shàng yǒu sān zhī niǎo.','There are three birds in the tree.']]},
 {c:'四',p:'sì',m:'数字四（four）',rad:'囗',st:5,tip:'“四”像窗户格子，也像四条腿的小板凳。',e:'🐕',a:'run',bg:'#FFF0E0',t:'小狗有四条腿',w:[['四个','sì gè'],['四川','sìchuān']],s:[['小狗有四条腿。','xiǎogǒu yǒu sì tiáo tuǐ.','A dog has four legs.']]},
 {c:'五',p:'wǔ',m:'数字五（five）',rad:'二',st:4,tip:'想到五根手指就记住“五”啦。',e:'🖐',a:'pop',bg:'#F3EAFF',t:'五根手指',w:[['五个','wǔ gè'],['五星','wǔxīng']],s:[['我有五根手指。','wǒ yǒu wǔ gēn shǒuzhǐ.','I have five fingers.']]},
 {c:'六',p:'liù',m:'数字六（six）',rad:'八',st:4,tip:'“六”像一座小房子，稳稳当当。',e:'🎈',a:'rise',bg:'#FFE9EE',t:'六个气球',w:[['六个','liù gè'],['六月','liùyuè']],s:[['今天星期六。','jīntiān xīngqīliù.','Today is Saturday.']]},
 {c:'七',p:'qī',m:'数字七（seven）',rad:'一',st:2,tip:'一竖一弯真有趣，这就是“七”。',e:'🌈',a:'glow',bg:'#E0F7FA',t:'七彩彩虹',w:[['七个','qī gè'],['七彩','qīcǎi']],s:[['一个星期有七天。','yí gè xīngqī yǒu qī tiān.','A week has seven days.']]},
 {c:'八',p:'bā',m:'数字八（eight）',rad:'八',st:2,tip:'两笔分开像剪刀，就是“八”。',e:'🕷',a:'sway',bg:'#EFEBFF',t:'八脚小蜘蛛',w:[['八个','bā gè'],['八月','bāyuè']],s:[['我八点起床。','wǒ bā diǎn qǐchuáng.','I get up at eight.']]},
 {c:'九',p:'jiǔ',m:'数字九（nine）',rad:'丿',st:2,tip:'一笔弯钩像鱼钩，这是“九”。',e:'🎈',a:'sway',bg:'#FFECCF',t:'九个气球',w:[['九个','jiǔ gè'],['九月','jiǔyuè']],s:[['弟弟今年九岁。','dìdi jīnnián jiǔ suì.','Brother is nine years old.']]},
 {c:'十',p:'shí',m:'数字十（ten）',rad:'十',st:2,tip:'一横一竖交叉，就是“十”。',e:'🎯',a:'pop',bg:'#FFE3E3',t:'正中靶心',w:[['十个','shí gè'],['十分','shífēn']],s:[['我十岁了。','wǒ shí suì le.','I am ten years old.'],['十分满意？那就是满分！','shífēn mǎnyì? nà jiùshì mǎnfēn!','Very satisfied means full marks!']]}
]},
/* ---------- 单元2：自然天地 ---------- */
{ id:'nature', name:'自然天地', emoji:'🌳', color:'#58CC02', desc:'山川日月，自然朋友', chars:[
 {c:'天',p:'tiān',m:'天空（sky）',rad:'大',st:4,tip:'“大”字上加一横，表示头顶上的天空。',e:'🐦',a:'fly',bg:'#DCF1FF',t:'小鸟飞上天',w:[['天空','tiānkōng'],['今天','jīntiān'],['明天','míngtiān']],s:[['天上有小鸟。','tiān shàng yǒu xiǎo niǎo.','There are birds in the sky.'],['今天天气很好。','jīntiān tiānqì hěn hǎo.','The weather is nice today.']]},
 {c:'地',p:'dì',m:'大地（earth）',rad:'土',st:6,tip:'“土”加“也”，合起来表示大地。',e:'🌍',a:'spin',bg:'#DFF3E3',t:'我们的地球',w:[['土地','tǔdì'],['地上','dìshàng'],['地球','dìqiú']],s:[['地上有很多花。','dìshàng yǒu hěn duō huā.','There are many flowers on the ground.'],['地球是我们的家。','dìqiú shì wǒmen de jiā.','Earth is our home.']]},
 {c:'山',p:'shān',m:'大山（mountain）',rad:'山',st:3,tip:'像三座山峰连在一起。',e:'⛰️',a:'bob',bg:'#E3F6E8',t:'高高的大山',w:[['大山','dàshān'],['上山','shàngshān'],['山水','shānshuǐ']],s:[['山上有很多树。','shān shàng yǒu hěn duō shù.','There are many trees on the mountain.'],['我们去爬山。','wǒmen qù páshān.','Let us go hiking.']]},
 {c:'水',p:'shuǐ',m:'水（water）',rad:'水',st:4,tip:'像流动的水波纹。',e:'💧',a:'fall',bg:'#DCF1FF',t:'清清的水滴',w:[['喝水','hēshuǐ'],['水果','shuǐguǒ'],['河水','héshuǐ']],s:[['我每天要喝水。','wǒ měitiān yào hē shuǐ.','I drink water every day.'],['河水很清。','héshuǐ hěn qīng.','The river water is clear.']]},
 {c:'火',p:'huǒ',m:'火（fire）',rad:'火',st:4,tip:'像火苗跳动的样子。',e:'🔥',a:'flicker',bg:'#FFEAD5',t:'跳动的火苗',w:[['火车','huǒchē'],['大火','dàhuǒ'],['火苗','huǒmiáo']],s:[['火车跑得快。','huǒchē pǎo de kuài.','The train runs fast.'],['不要玩火。','bú yào wán huǒ.','Do not play with fire.']]},
 {c:'土',p:'tǔ',m:'泥土（soil）',rad:'土',st:3,tip:'下面一横是大地，上面是小小的土堆。',e:'🌱',a:'rise',bg:'#EADFC8',t:'种子的家',w:[['泥土','nítǔ'],['土豆','tǔdòu'],['土地','tǔdì']],s:[['种子在泥土里发芽。','zhǒngzi zài nítǔ lǐ fāyá.','Seeds sprout in the soil.']]},
 {c:'日',p:'rì',m:'太阳、日子（sun）',rad:'日',st:4,tip:'圆圈里加一点，就是太阳。',e:'☀️',a:'spin',bg:'#FFF6D9',t:'太阳公公',w:[['生日','shēngrì'],['日出','rìchū'],['日子','rìzi']],s:[['今天是我的生日。','jīntiān shì wǒ de shēngrì.','Today is my birthday.'],['日出真美。','rìchū zhēn měi.','The sunrise is beautiful.']]},
 {c:'月',p:'yuè',m:'月亮、月份（moon）',rad:'月',st:4,tip:'像一弯月牙挂在天上。',e:'🌙',a:'glow',bg:'#EDEAFF',t:'弯弯的月牙',w:[['月亮','yuèliang'],['月光','yuèguāng']],s:[['月亮挂在天上。','yuèliang guà zài tiān shàng.','The moon hangs in the sky.']]},
 {c:'云',p:'yún',m:'云朵（cloud）',rad:'二',st:4,tip:'古文字像天上的云朵打转转。',e:'☁️',a:'drift',bg:'#EAF3FF',t:'白云飘啊飘',w:[['白云','báiyún'],['云朵','yúnduǒ'],['乌云','wūyún']],s:[['天上飘着白云。','tiān shàng piāo zhe báiyún.','White clouds float in the sky.'],['白云像棉花糖。','báiyún xiàng miánhuātáng.','Clouds look like cotton candy.']]},
 {c:'雨',p:'yǔ',m:'雨（rain）',rad:'雨',st:8,tip:'像雨点从天上落下来。',e:'🌧️',a:'fall',bg:'#DDEBFF',t:'淅沥淅沥下雨啦',w:[['下雨','xiàyǔ'],['雨点','yǔdiǎn'],['雨伞','yǔsǎn']],s:[['下雨了，快回家。','xià yǔ le, kuài huí jiā.','It is raining, go home quickly.'],['雨点落在伞上。','yǔdiǎn luò zài sǎn shàng.','Raindrops fall on the umbrella.']]},
 {c:'木',p:'mù',m:'树木（wood/tree）',rad:'木',st:4,tip:'像一棵树：上有枝，下有根。',e:'🌳',a:'sway',bg:'#E3F6E8',t:'一棵大树',w:[['木头','mùtou'],['树木','shùmù'],['木门','mùmén']],s:[['桌子是木头做的。','zhuōzi shì mùtou zuò de.','The table is made of wood.'],['树木是大地的朋友。','shùmù shì dàdì de péngyou.','Trees are friends of the earth.']]}
]},
/* ---------- 单元3：身体五官 ---------- */
{ id:'body', name:'身体五官', emoji:'🖐', color:'#CE82FF', desc:'认识自己，从小做起', chars:[
 {c:'人',p:'rén',m:'人（person）',rad:'人',st:2,tip:'像侧着身子走路的人。',e:'🚶',a:'walk',bg:'#EAF3FF',t:'人在走路',w:[['人们','rénmen'],['大人','dàren'],['好人','hǎorén']],s:[['公园里有很多人。','gōngyuán lǐ yǒu hěn duō rén.','There are many people in the park.']]},
 {c:'口',p:'kǒu',m:'嘴巴（mouth）',rad:'口',st:3,tip:'像一张张开的嘴巴。',e:'👄',a:'pop',bg:'#FFE9EE',t:'张开的嘴巴',w:[['门口','ménkǒu'],['人口','rénkǒu'],['开口','kāikǒu']],s:[['门口有一只小猫。','ménkǒu yǒu yì zhī xiāomāo.','There is a cat at the door.'],['张开口说话。','zhāng kāi kǒu shuōhuà.','Open your mouth and speak.']]},
 {c:'手',p:'shǒu',m:'手（hand）',rad:'手',st:4,tip:'像五根手指张开的手。',e:'🖐',a:'sway',bg:'#FFF0E0',t:'挥挥小手',w:[['手指','shǒuzhǐ'],['小手','xiǎoshǒu'],['洗手','xǐshǒu']],s:[['我用小手写字。','wǒ yòng xiǎo shǒu xiězì.','I write with my hands.'],['饭前要洗手。','fàn qián yào xǐ shǒu.','Wash hands before meals.']]},
 {c:'目',p:'mù',m:'眼睛（eye）',rad:'目',st:5,tip:'像一只眼睛：外面是眼眶，里面是眼珠。',e:'👀',a:'blink',bg:'#DFF6E9',t:'明亮的眼睛',w:[['目光','mùguāng'],['耳目','ěrmù'],['题目','tímù']],s:[['他的目光很温柔。','tā de mùguāng hěn wēnróu.','His gaze is gentle.']]},
 {c:'耳',p:'ěr',m:'耳朵（ear）',rad:'耳',st:6,tip:'像一只耳朵的形状。',e:'👂',a:'sway',bg:'#FDEFFB',t:'灵敏的耳朵',w:[['耳朵','ěrduo'],['木耳','mù’ěr'],['耳机','ěrjī']],s:[['小兔子的耳朵长。','xiǎo tùzi de ěrduo cháng.','Rabbits have long ears.'],['耳朵能听到声音。','ěrduo néng tīngdào shēngyīn.','Ears can hear sounds.']]},
 {c:'大',p:'dà',m:'大（big）',rad:'大',st:3,tip:'像一个人张开双臂：“我这么大！”',e:'🐘',a:'grow',bg:'#EAF3FF',t:'大象大大的',w:[['大人','dàren'],['大山','dàshān'],['大小','dàxiǎo']],s:[['大象真大！','dàxiàng zhēn dà!','The elephant is so big!'],['爸爸的手真大。','bàba de shǒu zhēn dà.','Papa has big hands.']]},
 {c:'小',p:'xiǎo',m:'小（small）',rad:'小',st:3,tip:'小小点点聚在一起，表示“小”。',e:'🐜',a:'pop',bg:'#FFF6D9',t:'小蚂蚁小小的',w:[['小鸟','xiǎoniǎo'],['小河','xiǎohé'],['小心','xiǎoxīn']],s:[['小鸟在唱歌。','xiǎo niǎo zài chànggē.','The bird is singing.'],['我是小学生。','wǒ shì xiǎoxuéshēng.','I am a pupil.']]},
 {c:'多',p:'duō',m:'多（many）',rad:'夕',st:6,tip:'两个“夕”叠起来，表示很多。',e:'🧸',a:'sway',bg:'#FFECCF',t:'许多小熊',w:[['很多','hěn duō'],['多少','duōshao'],['许多','xǔduō']],s:[['天上有多少星星？','tiān shàng yǒu duōshao xīngxing?','How many stars are in the sky?'],['我有很多好朋友。','wǒ yǒu hěn duō hǎo péngyou.','I have many good friends.']]},
 {c:'少',p:'shǎo',m:'少（few）',rad:'小',st:4,tip:'“小”加一撇，表示数量不多。',e:'🍬',a:'shrink',bg:'#FFE3E3',t:'糖糖变少了',w:[['多少','duōshao'],['减少','jiǎnshǎo'],['少年','shàonián']],s:[['水杯里的水少了。','shuǐbēi lǐ de shuǐ shǎo le.','There is less water in the cup.'],['多读书，少玩手机。','duō dúshū, shǎo wán shǒujī.','Read more, play less.']]}
]},
/* ---------- 单元4：幸福家庭 ---------- */
{ id:'family', name:'幸福家庭', emoji:'🏠', color:'#FF4B4B', desc:'叫一声爸爸妈妈', chars:[
 {c:'爸',p:'bà',m:'爸爸（dad）',rad:'父',st:8,tip:'上面是“父”，下面是“巴”，合起来叫爸爸。',e:'👨',a:'bob',bg:'#DCF1FF',t:'高大的爸爸',w:[['爸爸','bàba'],['老爸','lǎobà']],s:[['爸爸带我出去玩。','bàba dài wǒ chūqù wán.','Dad takes me out to play.'],['我爱爸爸。','wǒ ài bàba.','I love dad.']]},
 {c:'妈',p:'mā',m:'妈妈（mom）',rad:'女',st:6,tip:'“女”加“马”，妈妈像小马一样忙碌温柔。',e:'👩',a:'bob',bg:'#FFE9EE',t:'温柔的妈妈',w:[['妈妈','māma'],['姨妈','yímā']],s:[['妈妈做饭真好吃。','māma zuò fàn zhēn hǎochī.','Mom cooks delicious food.'],['妈妈，我爱你。','māma, wǒ ài nǐ.','Mom, I love you.']]},
 {c:'哥',p:'gē',m:'哥哥（elder brother）',rad:'口',st:10,tip:'两个“可”叠起来，亲亲热热叫哥哥。',e:'👦',a:'walk',bg:'#E3F6E8',t:'哥哥去上学',w:[['哥哥','gēge'],['大哥','dàgē']],s:[['哥哥会骑自行车。','gēge huì qí zìxíngchē.','Brother can ride a bike.'],['我和哥哥一起玩。','wǒ hé gēge yìqǐ wán.','I play with my brother.']]},
 {c:'姐',p:'jiě',m:'姐姐（elder sister）',rad:'女',st:8,tip:'“女”加“且”，是对年长女子的称呼。',e:'👧',a:'sway',bg:'#FDEFFB',t:'姐姐扎辫子',w:[['姐姐','jiějie'],['大姐','dàjiě']],s:[['姐姐在读书。','jiějie zài dúshū.','Sister is reading.'],['姐姐送我一支笔。','jiějie sòng wǒ yì zhī bǐ.','Sister gave me a pen.']]},
 {c:'弟',p:'dì',m:'弟弟（younger brother）',rad:'弓',st:7,tip:'古文字像绳圈缠绕，表示“次第在后”，后来指弟弟。',e:'👶',a:'pop',bg:'#FFF6D9',t:'调皮的弟弟',w:[['弟弟','dìdi'],['表弟','biǎodì']],s:[['弟弟今年五岁。','dìdi jīnnián wǔ suì.','Brother is five years old.'],['弟弟爱玩皮球。','dìdi ài wán píqiú.','Brother loves playing ball.']]},
 {c:'妹',p:'mèi',m:'妹妹（younger sister）',rad:'女',st:8,tip:'“女”加“未”，指年幼的女孩。',e:'🍭',a:'pop',bg:'#FFE9EE',t:'爱吃糖的妹妹',w:[['妹妹','mèimei'],['表妹','biǎomèi']],s:[['妹妹在跳舞。','mèimei zài tiàowǔ.','Little sister is dancing.'],['小妹妹真可爱。','xiǎo mèimei zhēn kě’ài.','Little sister is so cute.']]},
 {c:'子',p:'zǐ',m:'孩子（child）',rad:'子',st:3,tip:'像襁褓里的婴儿，挥动着小手。',e:'🧒',a:'sway',bg:'#EAF3FF',t:'可爱的孩子',w:[['孩子','háizi'],['日子','rìzi'],['瓜子','guāzǐ']],s:[['我是妈妈的孩子。','wǒ shì māma de háizi.','I am the child of mom.']]},
 {c:'女',p:'nǚ',m:'女孩、女儿（girl）',rad:'女',st:3,tip:'像交叠双手跪坐的人形。',e:'👧',a:'spin',bg:'#FDEFFB',t:'女孩转圈圈',w:[['女儿','nǚ’ér'],['女孩','nǚhái'],['女生','nǚshēng']],s:[['女儿爱唱歌。','nǚ’ér ài chànggē.','Daughters love singing.'],['女儿是妈妈的小棉袄。','nǚ’ér shì māma de xiǎo mián’ǎo.','A daughter is the little cotton jacket of mom.']]}
]},
/* ---------- 单元5：动物朋友 ---------- */
{ id:'animal', name:'动物朋友', emoji:'🐼', color:'#FFC800', desc:'汪汪喵喵，一起玩耍', chars:[
 {c:'猫',p:'māo',m:'小猫（cat）',rad:'犭',st:11,tip:'猫叫“喵喵”，所以“猫”用“苗”作声旁。',e:'🐱',a:'bob',bg:'#FFF3D6',t:'喵喵叫的小猫',w:[['小猫','xiāomāo'],['熊猫','xióngmāo'],['猫咪','māomī']],s:[['小猫爱吃鱼。','xiāomāo ài chī yú.','The cat loves fish.'],['熊猫在吃竹子。','xióngmāo zài chī zhúzi.','The panda is eating bamboo.']]},
 {c:'狗',p:'gǒu',m:'小狗（dog）',rad:'犭',st:8,tip:'“犭”表示动物，“句”提示读音。',e:'🐶',a:'sway',bg:'#EAF3FF',t:'摇尾巴的小狗',w:[['小狗','xiǎogǒu'],['狗狗','gǒugou']],s:[['小狗汪汪叫。','xiǎogǒu wāng wāng jiào.','The dog barks woof woof.'],['小狗摇着尾巴。','xiǎogǒu yáo zhe wěiba.','The dog wags its tail.']]},
 {c:'鸟',p:'niǎo',m:'小鸟（bird）',rad:'鸟',st:5,tip:'像一只长着羽毛的小鸟。',e:'🐦',a:'fly',bg:'#DCF1FF',t:'小鸟飞呀飞',w:[['小鸟','xiǎoniǎo'],['飞鸟','fēiniǎo'],['鸟窝','niǎowō']],s:[['小鸟在天上飞。','xiǎo niǎo zài tiān shàng fēi.','Birds fly in the sky.'],['鸟窝里有小鸟。','niǎowō lǐ yǒu xiǎo niǎo.','There are chicks in the nest.']]},
 {c:'鱼',p:'yú',m:'鱼（fish）',rad:'鱼',st:8,tip:'像一条鱼：有头、有尾、有鳍。',e:'🐟',a:'swim',bg:'#DCF1FF',t:'鱼儿吐泡泡',w:[['小鱼','xiǎoyú'],['金鱼','jīnyú'],['钓鱼','diàoyú']],s:[['鱼儿在水里游。','yú’er zài shuǐ lǐ yóu.','Fish swim in the water.'],['金鱼吐泡泡。','jīnyú tǔ pàopao.','Goldfish blow bubbles.']]},
 {c:'马',p:'mǎ',m:'马（horse）',rad:'马',st:3,tip:'像一匹扬蹄奔跑的马。',e:'🐎',a:'run',bg:'#EADFC8',t:'骏马哒哒跑',w:[['小马','xiǎomǎ'],['白马','báimǎ'],['马上','mǎshàng']],s:[['小马跑得快。','xiǎomǎ pǎo de kuài.','The horse runs fast.'],['马儿哒哒跑。','mǎ’er dādā pǎo.','Clippety-clop goes the horse.']]},
 {c:'牛',p:'niú',m:'牛（cow）',rad:'牛',st:4,tip:'像正面看的牛头，两只角很威风。',e:'🐄',a:'bob',bg:'#E3F6E8',t:'老牛在吃草',w:[['小牛','xiǎoniú'],['牛奶','niúnǎi'],['老牛','lǎoniú']],s:[['牛在草地上吃草。','niú zài cǎodì shàng chī cǎo.','Cows eat grass on the field.'],['我每天喝牛奶。','wǒ měitiān hē niúnǎi.','I drink milk every day.']]},
 {c:'羊',p:'yáng',m:'羊（sheep）',rad:'羊',st:6,tip:'像羊头，弯弯的羊角。',e:'🐑',a:'bob',bg:'#FFF6D9',t:'咩咩叫的小羊',w:[['小羊','xiǎoyáng'],['山羊','shānyáng'],['绵羊','miányáng']],s:[['小羊咩咩叫。','xiǎo yáng miē miē jiào.','Baa baa bleats the lamb.'],['山羊在山坡上。','shānyáng zài shānpō shàng.','The goat is on the hillside.']]},
 {c:'虫',p:'chóng',m:'虫子（insect）',rad:'虫',st:6,tip:'像一条小虫子蜿蜒爬行。',e:'🐛',a:'walk',bg:'#E3F6E8',t:'毛毛虫爬呀爬',w:[['虫子','chóngzi'],['毛毛虫','máomáochóng'],['益虫','yìchóng']],s:[['毛毛虫变蝴蝶。','máomáochóng biàn húdié.','The caterpillar becomes a butterfly.'],['小虫在叶子上。','xiǎo chóng zài yèzi shàng.','The bug is on the leaf.']]}
]},
/* ---------- 单元6：能干的小手 ---------- */
{ id:'action', name:'能干的小手', emoji:'🏃', color:'#1CB0F6', desc:'吃吃喝喝，蹦蹦跳跳', chars:[
 {c:'吃',p:'chī',m:'吃（eat）',rad:'口',st:6,tip:'“口”加“乞”，用嘴巴吃东西。',e:'🍜',a:'pop',bg:'#FFF0E0',t:'大口吃饭香喷喷',w:[['吃饭','chīfàn'],['好吃','hǎochī'],['小吃','xiǎochī']],s:[['我爱吃苹果。','wǒ ài chī píngguǒ.','I love apples.'],['到吃饭时间啦。','dào chīfàn shíjiān la.','It is time to eat.']]},
 {c:'喝',p:'hē',m:'喝（drink）',rad:'口',st:12,tip:'“口”加“曷”，用嘴喝水。',e:'🥤',a:'sway',bg:'#DCF1FF',t:'咕嘟咕嘟喝水',w:[['喝水','hēshuǐ'],['喝茶','hēchá'],['喝奶','hēnǎi']],s:[['我要喝水。','wǒ yào hē shuǐ.','I want to drink water.'],['口渴了要喝水。','kǒu kě le yào hē shuǐ.','When thirsty, drink water.']]},
 {c:'看',p:'kàn',m:'看（look）',rad:'目',st:9,tip:'手搭在眼睛上远望，就是“看”。',e:'🔍',a:'sway',bg:'#EDEAFF',t:'睁大眼睛看',w:[['看书','kànshū'],['看见','kànjiàn'],['好看','hǎokàn']],s:[['我在看书。','wǒ zài kàn shū.','I am reading.'],['我看见一只小鸟。','wǒ kànjiàn yì zhī xiǎo niǎo.','I see a little bird.']]},
 {c:'听',p:'tīng',m:'听（listen）',rad:'口',st:7,tip:'用耳朵接收声音，原来的字里有一个“耳”。',e:'🎧',a:'pulse',bg:'#E7F0FF',t:'竖起耳朵听',w:[['听话','tīnghuà'],['好听','hǎotīng'],['听歌','tīnggē']],s:[['我爱听故事。','wǒ ài tīng gùshi.','I love listening to stories.'],['上课要认真听讲。','shàngkè yào rènzhēn tīng jiǎng.','Listen carefully in class.']]},
 {c:'说',p:'shuō',m:'说（speak）',rad:'讠',st:9,tip:'“讠”是言语，用话语表达。',e:'💬',a:'pop',bg:'#DFF6E9',t:'大声说出来',w:[['说话','shuōhuà'],['听说','tīngshuō'],['小说','xiǎoshuō']],s:[['请小声说话。','qǐng xiǎoshēng shuōhuà.','Please talk quietly.'],['我会说普通话。','wǒ huì shuō pǔtōnghuà.','I can speak Mandarin.']]},
 {c:'走',p:'zǒu',m:'走（walk）',rad:'走',st:7,tip:'像人甩着双臂奔跑，本义是“跑”。',e:'👟',a:'walk',bg:'#FFECCF',t:'迈开脚步走',w:[['走路','zǒulù'],['走开','zǒukāi']],s:[['我们走路回家。','wǒmen zǒulù huí jiā.','We walk home.'],['过马路要走斑马线。','guò mǎlù yào zǒu bānmǎxiàn.','Cross the road on the zebra crossing.']]},
 {c:'坐',p:'zuò',m:'坐（sit）',rad:'土',st:7,tip:'两个“人”坐在“土”堆上，就是“坐”。',e:'🧘',a:'pop',bg:'#F3EAFF',t:'安静坐好',w:[['坐下','zuòxià'],['请坐','qǐngzuò'],['坐车','zuòchē']],s:[['请坐下来休息。','qǐng zuò xiàlái xiūxi.','Please sit down and rest.'],['我坐公交车上学。','wǒ zuò gōngjiāochē shàngxué.','I take the bus to school.']]},
 {c:'来',p:'lái',m:'来（come）',rad:'木',st:7,tip:'原本像一株麦子，借用来表示“来去”的来。',e:'👋',a:'sway',bg:'#FFE9EE',t:'快到这里来',w:[['回来','huílái'],['来到','láidào'],['起来','qǐlái']],s:[['妈妈回来了。','māma huílái le.','Mom is back.'],['小猫向我跑来。','xiāomāo xiàng wǒ pǎo lái.','The kitten runs to me.']]},
 {c:'去',p:'qù',m:'去（go）',rad:'厶',st:5,tip:'像人离开住的地方走远了。',e:'🧳',a:'walk',bg:'#EADFC8',t:'背起背包出发',w:[['回去','huíqù'],['出去','chūqù'],['上去','shàngqù']],s:[['我们去公园玩。','wǒmen qù gōngyuán wán.','Let us go to the park.'],['我去上学。','wǒ qù shàngxué.','I am off to school.']]},
 {c:'飞',p:'fēi',m:'飞（fly）',rad:'飞',st:3,tip:'像鸟儿展翅飞翔。',e:'✈️',a:'fly',bg:'#DCF1FF',t:'飞机飞上蓝天',w:[['飞机','fēijī'],['飞鸟','fēiniǎo'],['起飞','qǐfēi']],s:[['小鸟飞得高。','xiǎo niǎo fēi de gāo.','Birds fly high.'],['飞机在天上飞。','fēijī zài tiān shàng fēi.','Planes fly in the sky.']]}
]},
/* ---------- 单元7：快乐生活 ---------- */
{ id:'life', name:'快乐生活', emoji:'📚', color:'#58CC02', desc:'上学读书，真快乐', chars:[
 {c:'门',p:'mén',m:'门（door）',rad:'门',st:3,tip:'像两扇门板。',e:'🚪',a:'pop',bg:'#EADFC8',t:'打开小门',w:[['门口','ménkǒu'],['大门','dàmén'],['开门','kāimén']],s:[['请随手关门。','qǐng suíshǒu guānmén.','Please close the door.'],['门口有一棵大树。','ménkǒu yǒu yì kē dàshù.','There is a big tree at the gate.']]},
 {c:'书',p:'shū',m:'书（book）',rad:'乙',st:4,tip:'繁体“書”像手拿笔在写字。',e:'📖',a:'sway',bg:'#E7F0FF',t:'翻开小书',w:[['读书','dúshū'],['书包','shūbāo'],['看书','kànshū']],s:[['我爱读书。','wǒ ài dúshū.','I love reading.'],['书包里有新书。','shūbāo lǐ yǒu xīn shū.','There is a new book in my bag.']]},
 {c:'车',p:'chē',m:'车（vehicle）',rad:'车',st:4,tip:'像车轮和车轴的样子。',e:'🚗',a:'run',bg:'#FFECCF',t:'小汽车嘀嘀嘀',w:[['火车','huǒchē'],['汽车','qìchē'],['上车','shàngchē']],s:[['火车开动了。','huǒchē kāidòng le.','The train starts moving.'],['马路上有很多车。','mǎlù shàng yǒu hěn duō chē.','There are many cars on the road.']]},
 {c:'上',p:'shàng',m:'上（up）',rad:'一',st:3,tip:'一横在上面，表示位置高。',e:'🚀',a:'rise',bg:'#EDEAFF',t:'火箭升上天',w:[['上面','shàngmiàn'],['上学','shàngxué'],['上车','shàngchē']],s:[['我上一年级了。','wǒ shàng yì niánjí le.','I am in first grade.'],['书在桌子上。','shū zài zhuōzi shàng.','The book is on the desk.']]},
 {c:'下',p:'xià',m:'下（down）',rad:'一',st:3,tip:'一横在下面，表示位置低。',e:'🍂',a:'fall',bg:'#FFEAD5',t:'树叶飘下来',w:[['下面','xiàmiàn'],['下雨','xiàyǔ'],['下车','xiàchē']],s:[['下雨了。','xià yǔ le.','It is raining.'],['我下车了。','wǒ xiàchē le.','I got off the bus.']]},
 {c:'中',p:'zhōng',m:'中间（middle）',rad:'丨',st:4,tip:'像旗杆立在正中间。',e:'🚩',a:'pop',bg:'#FFE3E3',t:'立正站中间',w:[['中间','zhōngjiān'],['中午','zhōngwǔ'],['中国','zhōngguó']],s:[['中午，我们去吃饭。','zhōngwǔ, wǒmen qù chīfàn.','At noon we go to eat.'],['我住在中国。','wǒ zhù zài zhōngguó.','I live in China.']]},
 {c:'好',p:'hǎo',m:'好（good）',rad:'女',st:6,tip:'“女”加“子”：妈妈抱着孩子，就是“好”。',e:'👍',a:'pop',bg:'#DFF6E9',t:'真棒！你真好',w:[['你好','nǐhǎo'],['好人','hǎorén'],['好吃','hǎochī']],s:[['你好！很高兴认识你。','nǐ hǎo! hěn gāoxìng rènshi nǐ.','Hello! Nice to meet you.'],['我们是好朋友。','wǒmen shì hǎo péngyou.','We are good friends.']]},
 {c:'爱',p:'ài',m:'爱（love）',rad:'心',st:10,tip:'繁体“愛”里有“心”，用心疼爱。',e:'❤️',a:'pulse',bg:'#FFE9EE',t:'爱心暖暖的',w:[['爱心','àixīn'],['可爱','kě’ài'],['爱好','àihào']],s:[['我爱爸爸妈妈。','wǒ ài bàba māma.','I love mom and dad.'],['爱心让世界更美。','àixīn ràng shìjiè gèng měi.','Love makes the world nicer.']]}
]},
/* ---------- 单元8：说话高手 ---------- */
{ id:'grammar', name:'说话高手', emoji:'💬', color:'#CE82FF', desc:'“我你他”拼出完整句子', chars:[
 {c:'我',p:'wǒ',m:'我（I）',rad:'戈',st:7,tip:'原是一种带齿的兵器，借来表示“自己”。',e:'🙋',a:'pop',bg:'#EAF3FF',t:'这就是我',w:[['我们','wǒmen'],['我的','wǒde']],s:[['我是小学生。','wǒ shì xiǎoxuéshēng.','I am a pupil.'],['我们一起去玩吧。','wǒmen yìqǐ qù wán ba.','Let us play together.']]},
 {c:'你',p:'nǐ',m:'你（you）',rad:'亻',st:7,tip:'“亻”表示人，用来称呼对方。',e:'👉',a:'sway',bg:'#FFF6D9',t:'就是你呀',w:[['你们','nǐmen'],['你好','nǐhǎo'],['迷你','mínǐ']],s:[['你会唱歌吗？','nǐ huì chànggē ma?','Can you sing?'],['你叫什么名字？','nǐ jiào shénme míngzi?','What is your name?']]},
 {c:'他',p:'tā',m:'他（he）',rad:'亻',st:5,tip:'“亻”加“也”，指别人。',e:'🧍',a:'pop',bg:'#E3F6E8',t:'他站在那里',w:[['他们','tāmen'],['其他','qítā']],s:[['他是我的好朋友。','tā shì wǒ de hǎo péngyou.','He is my good friend.'],['他们在踢球。','tāmen zài tī qiú.','They are playing football.']]},
 {c:'是',p:'shì',m:'是（is/are）',rad:'日',st:9,tip:'上面“日”下面“正”，本义端正、对。',e:'✅',a:'pop',bg:'#DFF6E9',t:'没错，就是这个！',w:[['但是','dànshì'],['就是','jiùshì'],['可是','kěshì']],s:[['这是我的书。','zhè shì wǒ de shū.','This is my book.'],['今天是星期天。','jīntiān shì xīngqītiān.','Today is Sunday.']]},
 {c:'的',p:'de',m:'“的”：表示“谁的”（的）',rad:'白',st:8,tip:'“白”加“勺”，本指箭靶的中心，后来变成小帮手“的”。',e:'🎁',a:'pop',bg:'#FFECCF',t:'这是我的礼物',w:[['我的','wǒde'],['你的','nǐde'],['好吃的','hǎochī de']],s:[['这是妈妈的包。','zhè shì māma de bāo.','This is the bag of mom.'],['我的书在桌上。','wǒ de shū zài zhuō shàng.','My book is on the desk.']]},
 {c:'不',p:'bù',m:'不（no/not）',rad:'一',st:4,tip:'原本指花托，借来做“说不要”的字。',e:'🙅',a:'no',bg:'#FFE3E3',t:'摇摇头，不可以',w:[['不是','búshì'],['不好','bùhǎo'],['不行','bùxíng']],s:[['我不是小猫。','wǒ bú shì xiāomāo.','I am not a cat.'],['上课不乱说话。','shàngkè bú luàn shuōhuà.','No random talking in class.']]},
 {c:'在',p:'zài',m:'在（at/in）',rad:'土',st:6,tip:'“土”上加一点一撇，表示存在、在哪里。',e:'🏠',a:'pop',bg:'#FFF0E0',t:'妈妈在家',w:[['现在','xiànzài'],['在家','zài jiā'],['正在','zhèngzài']],s:[['妈妈在家。','māma zài jiā.','Mom is at home.'],['小鸟在树上唱歌。','xiǎo niǎo zài shù shàng chànggē.','The bird sings in the tree.']]},
 {c:'有',p:'yǒu',m:'有（have）',rad:'月',st:6,tip:'一只手拿着一块肉，手里就“有”东西啦。',e:'🍬',a:'pop',bg:'#FFE9EE',t:'手里有一颗糖',w:[['没有','méiyǒu'],['有的','yǒude'],['拥有','yōngyǒu']],s:[['我有一只小猫。','wǒ yǒu yì zhī xiāomāo.','I have a kitten.'],['桌上有一个苹果。','zhuō shàng yǒu yí gè píngguǒ.','There is an apple on the table.']]},
 {c:'会',p:'huì',m:'会（can/will）',rad:'人',st:6,tip:'“人”加“云”，像人们聚在一起说话，本义“会合”。',e:'💪',a:'pop',bg:'#FDEFFB',t:'我能做到！',w:[['学会','xuéhuì'],['不会','búhuì'],['开会','kāihuì']],s:[['我会游泳。','wǒ huì yóuyǒng.','I can swim.'],['我会自己穿衣服。','wǒ huì zìjǐ chuān yīfu.','I can dress myself.']]},
 {c:'能',p:'néng',m:'能（be able to）',rad:'月',st:10,tip:'原本像熊的样子，借来表示“能够”。',e:'🏋️',a:'pop',bg:'#E7F0FF',t:'大力士能举高',w:[['可能','kěnéng'],['能够','nénggòu'],['能力','nénglì']],s:[['你能帮我吗？','nǐ néng bāng wǒ ma?','Can you help me?'],['我能自己完成。','wǒ néng zìjǐ wánchéng.','I can do it myself.']]}
]}
];
