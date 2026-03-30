// ══════════════════════════════════════════════
//   handbook.js — 단어장 (핸드북 단어 브라우저)
// ══════════════════════════════════════════════

import { loadCurriculumState, getUnlockedUnitIds, getAvailableVocabCategories } from "./curriculum_data.js";

const PAGE_SIZE   = 20;
let LS_KEY_HB   = "sf_handbook_memorized";
let curriculumWords = null; // 커리큘럼 필터 적용 단어 목록 (null = 전체)

// ── 발음 표기 ─────────────────────────────────
export const PHONETICS = {
  // 인사말
  "Bonjour": "bon-ZHOOR",
  "Bonsoir": "bon-SWAHR",
  "Salut": "sa-LUE",
  "Au revoir": "oh ruh-VWAHR",
  "Bonne journée": "bun zhoor-NAY",
  "Bonne nuit": "bun NWEE",
  "Merci": "mair-SEE",
  "De rien": "duh RYEHN",
  "S'il vous plaît": "seel voo PLEH",
  "Pardon": "par-DOHN",
  "Excusez-moi": "ex-kue-zay MWAH",
  "Ça va ?": "sah VAH",
  "Très bien": "treh BYEHN",
  "Pas mal": "pah MAHL",
  "Comme ci, comme ça": "kum SEE kum SAH",
  "Enchanté(e)": "ahn-shahn-TAY",
  "Je m'appelle...": "zhuh ma-PELL",
  "Comment vous appelez-vous ?": "koh-mahn voo za-play VOO",
  "Et vous ?": "ay VOO",
  "Moi aussi": "mwah oh-SEE",
  // 나라
  "La Corée": "la ko-RAY",
  "La France": "la FRAHNS",
  "Le Japon": "luh zhah-POHN",
  "Les États-Unis": "lay zay-ta zu-NEE",
  "L'Angleterre": "lahn-gluh-TAIR",
  "L'Allemagne": "la-luh-MAHN-yuh",
  "L'Italie": "lee-ta-LEE",
  "L'Espagne": "les-PAN-yuh",
  "La Chine": "la SHEEN",
  "Le Canada": "luh ka-na-DA",
  "Coréen(ne)": "ko-ray-EHN",
  "Français(e)": "frahn-SEH",
  "Japonais(e)": "zhah-po-NEH",
  "Américain(e)": "ah-may-ree-KEHN",
  "Anglais(e)": "ahn-GLEH",
  "Je suis de...": "zhuh SWEE duh",
  "Je viens de...": "zhuh VYEHN duh",
  "Je parle coréen": "zhuh PARL ko-ray-EHN",
  // 시간
  "Le matin": "luh ma-TEHN",
  "L'après-midi": "la-preh mee-DEE",
  "Le soir": "luh SWAHR",
  "La nuit": "la NWEE",
  "Aujourd'hui": "oh-zhoor-DWEE",
  "Demain": "duh-MEHN",
  "Hier": "YAIR",
  "Maintenant": "mehnt-NAHN",
  "Avant": "a-VAHN",
  "Après": "a-PREH",
  "Tôt": "TOH",
  "Tard": "TAR",
  "En retard": "ahn ruh-TAR",
  "À l'heure": "ah LUHR",
  "Toujours": "too-ZHOOR",
  "Souvent": "soo-VAHN",
  "Parfois": "par-FWAH",
  "Jamais": "zha-MAY",
  "Quelle heure est-il ?": "kel UHR ay-TEEL",
  "Il est midi": "eel ay mee-DEE",
  "Un rendez-vous": "uhn rahn-day-VOO",
  // 색깔
  "Bleu(e)": "BLUH",
  "Rouge": "ROOZH",
  "Vert(e)": "VAIR(t)",
  "Jaune": "ZHOHN",
  "Noir(e)": "NWAHR",
  "Blanc / blanche": "BLAHN / BLAHNSH",
  "Gris(e)": "GREE(z)",
  "Marron": "ma-ROHN",
  "Rose": "ROHZ",
  "Violet(te)": "vyo-LAY(t)",
  "Orange": "o-RAHNZH",
  "Beige": "BEZH",
  // 가족
  "Un père": "uhn PAIR",
  "Une mère": "oon MAIR",
  "Un mari": "uhn ma-REE",
  "Une femme": "oon FAM",
  "Un fils": "uhn FEES",
  "Une fille": "oon FEE-yuh",
  "Un frère": "uhn FRAIR",
  "Une sœur": "oon SUR",
  "Un grand-père": "uhn grahn-PAIR",
  "Une grand-mère": "oon grahn-MAIR",
  "Un oncle": "uhn OHNKL",
  "Une tante": "oon TAHNT",
  "Un cousin / une cousine": "uhn koo-ZEHN / oon koo-ZEEN",
  "Un enfant": "uhn ahn-FAHN",
  "La famille": "la fa-MEE-yuh",
  "Un(e) ami(e)": "uhn ah-MEE",
  // 집
  "Une maison": "oon may-ZOHN",
  "Un appartement": "uhn a-par-tuh-MAHN",
  "Un studio": "uhn stue-DYOH",
  "Un étage": "uhn ay-TAHZH",
  "Une chambre": "oon SHAHMBR",
  "Un salon": "uhn sa-LOHN",
  "Une cuisine": "oon kwee-ZEEN",
  "Une salle de bains": "oon sal duh BEHN",
  "Des toilettes": "day twa-LET",
  "Un balcon": "uhn bal-KOHN",
  "Un jardin": "uhn zhar-DEHN",
  "Un lit": "uhn LEE",
  "Un canapé": "uhn ka-na-PAY",
  "Une table": "oon TAHBL",
  "Une chaise": "oon SHEZ",
  "Un bureau": "uhn bue-ROH",
  "Une fenêtre": "oon fuh-NET-ruh",
  "Une porte": "oon PORT",
  "Un réfrigérateur": "uhn ray-free-zhay-ra-TUHR",
  "Un loyer": "uhn lwah-YAY",
  // 도시
  "Un restaurant": "uhn res-to-RAHN",
  "Un café": "uhn ka-FAY",
  "Un hôtel": "uhn oh-TEL",
  "Un hôpital": "uhn oh-pee-TAL",
  "Une pharmacie": "oon far-ma-SEE",
  "Un musée": "uhn mue-ZAY",
  "Un parc": "uhn PARK",
  "Un supermarché": "uhn sue-pair-mar-SHAY",
  "Une boulangerie": "oon boo-lahn-zhuh-REE",
  "Un cinéma": "uhn see-nay-MA",
  "Une poste": "oon POST",
  "Une banque": "oon BAHNK",
  "Une rue": "oon RUE",
  "Un boulevard": "uhn bool-VAHR",
  "Un quartier": "uhn kar-TYAY",
  "À gauche": "ah GOHSH",
  "À droite": "ah DRWAHT",
  "Tout droit": "too DRWAH",
  "Près d'ici": "preh dee-SEE",
  "Loin": "LWEHN",
  // 교통
  "Le métro": "luh may-TROH",
  "Le bus": "luh BUES",
  "Le train": "luh TREHN",
  "Le RER": "luh air-uh-AIR",
  "Un taxi": "uhn tak-SEE",
  "Un vélo": "uhn vay-LOH",
  "Un avion": "uhn a-VYOHN",
  "Une gare": "oon GAHR",
  "Un aéroport": "uhn a-ay-ro-POR",
  "Un arrêt de bus": "uhn a-REH duh BUES",
  "Un billet": "uhn bee-YEH",
  "Un ticket": "uhn tee-KEH",
  "La sortie": "la sor-TEE",
  "Le quai": "luh KAY",
  "Le terminus": "luh tair-mee-NUES",
  // 음식
  "Un croissant": "uhn krwa-SAHN",
  "Une baguette": "oon ba-GET",
  "Un pain au chocolat": "uhn pehn oh sho-ko-LAH",
  "Du fromage": "due fro-MAHZH",
  "Un oeuf": "uhn UHF",
  "Du beurre": "due BUR",
  "Du jambon": "due zhahm-BOHN",
  "Du poulet": "due poo-LAY",
  "Du boeuf": "due BUF",
  "Du saumon": "due soh-MOHN",
  "Une pomme": "oon PUM",
  "Une fraise": "oon FREZ",
  "Une banane": "oon ba-NAN",
  "Une tomate": "oon to-MAT",
  "Une pomme de terre": "oon pum duh TAIR",
  "Du riz": "due REE",
  "Du sucre": "due SOOKR",
  "Du sel": "due SEL",
  "Du poivre": "due PWAHVR",
  "Une carotte": "oon ka-ROT",
  // 식사
  "Le petit déjeuner": "luh puh-tee day-zhuh-NAY",
  "Le déjeuner": "luh day-zhuh-NAY",
  "Le dîner": "luh dee-NAY",
  "Un thé": "uhn TAY",
  "De l'eau": "duh LOH",
  "Un jus d'orange": "uhn zhue doh-RAHNZH",
  "Une bière": "oon BYAIR",
  "Un verre de vin": "uhn VAIR duh VEHN",
  "Un menu": "uhn muh-NUE",
  "La carte": "la KART",
  "Une entrée": "oon ahn-TRAY",
  "Un plat principal": "uhn plah prehn-see-PAHL",
  "Un dessert": "uhn deh-SAIR",
  "Un plat du jour": "uhn plah due ZHOOR",
  "L'addition": "la-dee-SYOHN",
  "Un pourboire": "uhn poor-BWAHR",
  "C'est délicieux": "say day-lee-SYUH",
  "Bon appétit !": "bohn ah-pay-TEE",
  "Je voudrais réserver": "zhuh voo-DREH ray-zair-VAY",
  // 옷
  "Un manteau": "uhn mahn-TOH",
  "Une veste": "oon VEST",
  "Un pull": "uhn PUHL",
  "Une chemise": "oon shuh-MEEZ",
  "Un t-shirt": "uhn tee-SHIRT",
  "Une robe": "oon ROB",
  "Un pantalon": "uhn pahn-ta-LOHN",
  "Une jupe": "oon ZHUP",
  "Un jean": "uhn ZHEHN",
  "Des chaussures": "day shoh-SUER",
  "Des bottes": "day BOT",
  "Des chaussettes": "day shoh-SET",
  "Un chapeau": "uhn sha-POH",
  "Un foulard": "uhn foo-LAR",
  "Un parapluie": "uhn pa-ra-PLWEE",
  "Ma taille": "ma TIE-yuh",
  "Trop grand(e)": "troh GRAHN(d)",
  "Trop petit(e)": "troh puh-TEE(t)",
  "Avez-vous en...?": "ah-vay VOO ahn",
  "Je cherche...": "zhuh SHAIRSH",
  // 소지품
  "Un sac": "uhn SAK",
  "Un sac à dos": "uhn sak ah DOH",
  "Une valise": "oon va-LEEZ",
  "Un portefeuille": "uhn port-FUH-yuh",
  "Une clé": "oon KLAY",
  "Un téléphone portable": "uhn tay-lay-fon por-TAHBL",
  "Un chargeur": "uhn shar-ZHUHR",
  "Des écouteurs": "day ay-koo-TUHR",
  "Un passeport": "uhn pas-POR",
  "Une carte d'identité": "oon kart dee-dahn-tee-TAY",
  "Une carte de crédit": "oon kart duh kray-DEE",
  "De l'argent": "duh lar-ZHAHN",
  "Un appareil photo": "uhn ah-pah-RAY fo-TOH",
  "Une montre": "oon MOHNTR",
  "Des lunettes": "day lue-NET",
  // 몸
  "La tête": "la TET",
  "Le cou": "luh KOO",
  "L'épaule": "lay-POHL",
  "Le bras": "luh BRAH",
  "La main": "la MEHN",
  "Le doigt": "luh DWAH",
  "La poitrine": "la pwa-TREEN",
  "Le ventre": "luh VAHN-truh",
  "Le dos": "luh DOH",
  "La jambe": "la ZHAHMB",
  "Le genou": "luh zhuh-NOO",
  "Le pied": "luh PYAY",
  "Le visage": "luh vee-ZAHZH",
  "Les cheveux": "lay shuh-VUH",
  "L'œil / les yeux": "LUH-yuh / lay ZYUH",
  "Le nez": "luh NAY",
  "La bouche": "la BOOSH",
  "La dent": "la DAHN",
  "L'oreille": "lo-RAY-yuh",
  "J'ai mal à...": "zhay mahl ah",
  // 외모
  "Grand(e)": "GRAHN(d)",
  "Petit(e)": "puh-TEE(t)",
  "Beau / belle": "BOH / BEL",
  "Joli(e)": "zho-LEE",
  "Mince": "MEHNS",
  "Corpulent(e)": "kor-pue-LAHN(t)",
  "Jeune": "ZHUHN",
  "Âgé(e)": "ah-ZHAY",
  "Élégant(e)": "ay-lay-GAHN(t)",
  "Les cheveux blonds": "lay shuh-VUH BLOHN",
  "Les cheveux bruns": "lay shuh-VUH BRUHN",
  "Les cheveux noirs": "lay shuh-VUH NWAHR",
  "Les yeux bleus": "lay ZYUH BLUH",
  "Les yeux marron": "lay ZYUH ma-ROHN",
  "Porter des lunettes": "por-TAY day lue-NET",
  // 날씨
  "Le printemps": "luh prehnt-TAHN",
  "L'été": "lay-TAY",
  "L'automne": "lo-TUN",
  "L'hiver": "lee-VAIR",
  "Il fait beau": "eel feh BOH",
  "Il fait mauvais": "eel feh moh-VEH",
  "Il fait chaud": "eel feh SHOH",
  "Il fait froid": "eel feh FRWAH",
  "Le soleil": "luh so-LAY-yuh",
  "La pluie": "la PLWEE",
  "Il pleut": "eel PLUH",
  "La neige": "la NEZH",
  "Il neige": "eel NEZH",
  "Le nuage": "luh nue-AHZH",
  "Le vent": "luh VAHN",
  "Un orage": "uhn o-RAHZH",
  "Le brouillard": "luh broo-YAHR",
  "La température": "la tahm-pay-ra-TUER",
  "Il fait... degrés": "eel feh...duh-GRAY",
  // 취미
  "La musique": "la mue-ZEEK",
  "La lecture": "la lek-TUER",
  "La peinture": "la pehn-TUER",
  "La photographie": "la fo-to-gra-FEE",
  "Le cinéma": "luh see-nay-MA",
  "La cuisine": "la kwee-ZEEN",
  "Le sport": "luh SPOR",
  "La natation": "la na-ta-SYOHN",
  "La randonnée": "la rahn-do-NAY",
  "Le ski": "luh SKEE",
  "Le vélo": "luh vay-LOH",
  "La danse": "la DAHNS",
  "Le voyage": "luh vwa-YAHZH",
  "Le shopping": "luh SHO-peeng",
  "Les jeux vidéo": "lay zhuh vee-day-OH",
  "J'aime...": "ZHEM",
  "Je fais...": "zhuh FEH",
  "C'est mon passe-temps": "say mohn pas-TAHN",
  // 감정
  "Content(e)": "kohn-TAHN(t)",
  "Triste": "TREEST",
  "Heureux / heureuse": "uh-RUH / uh-RUHZ",
  "Malheureux / malheureuse": "mal-uh-RUH / mal-uh-RUHZ",
  "En colère": "ahn ko-LAIR",
  "Stressé(e)": "streh-SAY",
  "Inquiet / inquiète": "ahn-KYEH / ahn-KYET",
  "Surpris(e)": "sue-PREE(z)",
  "Amoureux / amoureuse": "a-moo-RUH / a-moo-RUHZ",
  "Fatigué(e)": "fa-tee-GAY",
  "La joie": "la ZHWAH",
  "La tristesse": "la tree-TESS",
  "La peur": "la PUHR",
  "L'amour": "la-MOOR",
  "Je me sens...": "zhuh muh SAHN",
  // 성격
  "Gentil(le)": "zhahn-TEE(y)",
  "Méchant(e)": "may-SHAHN(t)",
  "Intelligent(e)": "ahn-teh-lee-ZHAHN(t)",
  "Généreux / généreuse": "zhay-nay-RUH / zhay-nay-RUHZ",
  "Égoïste": "ay-go-EEST",
  "Honnête": "o-NET",
  "Sociable": "so-SYAHBL",
  "Timide": "tee-MEED",
  "Courageux / courageuse": "koo-ra-ZHUH / koo-ra-ZHUHZ",
  "Paresseux / paresseuse": "pa-reh-SUH / pa-reh-SUHZ",
  "Sérieux / sérieuse": "say-RYUH / say-RYUHZ",
  "Drôle": "DROHL",
  "Sympa": "seh-MPAH",
  "Bavard(e)": "ba-VAHR(d)",
  "Calme": "KAHLM",
  // 직업
  "Un(e) professeur(e)": "uhn pro-fe-SUHR",
  "Un médecin": "uhn may-d-SEHN",
  "Un(e) infirmier(ère)": "uhn ahn-feer-MYAY",
  "Un(e) ingénieur(e)": "uhn ahn-zhay-NYUHR",
  "Un(e) avocat(e)": "uhn a-vo-KAH",
  "Un(e) comptable": "uhn kohn-TAHBL",
  "Un(e) journaliste": "uhn zhoor-na-LEEST",
  "Un(e) architecte": "uhn ar-shee-TEKT",
  "Un(e) acteur / actrice": "uhn ak-TUHR / ak-TREES",
  "Un(e) cuisinier(ère)": "uhn kwee-zee-NYAY",
  "Un(e) boulanger(ère)": "uhn boo-lahn-ZHAY",
  "Un(e) vendeur(euse)": "uhn vahn-DUHR",
  "Un homme / une femme d'affaires": "uhn um / oon fam da-FAIR",
  "Un(e) étudiant(e)": "uhn ay-tue-DYAHN(t)",
  "Je travaille comme...": "zhuh tra-VIE-yuh kum",
  "Je cherche un emploi": "zhuh SHAIRSH uhn ahn-PLWAH",
  "Un entretien": "uhn ahn-truh-TYEHN",
  // 학교
  "Une école": "oon ay-KOL",
  "Un collège": "uhn ko-LEZH",
  "Un lycée": "uhn lee-SAY",
  "Une université": "oon ue-nee-vair-see-TAY",
  "Un(e) élève": "uhn ay-LEV",
  "Un cours": "uhn KOOR",
  "Un examen": "uhn eg-za-MEHN",
  "Un devoir": "uhn duh-VWAHR",
  "Un diplôme": "uhn dee-PLOHM",
  "Les vacances": "lay va-KAHNS",
  "Un stylo": "uhn stee-LOH",
  "Un crayon": "uhn kray-YOHN",
  "Un livre": "uhn LEEVR",
  "Un cahier": "uhn ka-YAY",
  "Apprendre": "ah-PRAHN-druh",
  "Étudier": "ay-tue-DYAY",
  "Réussir": "ray-ue-SEER",
};

// ── 단어 데이터 ────────────────────────────────
export const HANDBOOK_WORDS = [
  // ── Week 1: 첫 만남과 자기소개 ──────────────────
  { fr: "Bonjour", ko: "안녕하세요", cat: "인사말" },
  { fr: "Bonsoir", ko: "안녕하세요 (저녁)", cat: "인사말" },
  { fr: "Salut", ko: "안녕 (친근한)", cat: "인사말" },
  { fr: "Au revoir", ko: "안녕히 가세요", cat: "인사말" },
  { fr: "Bonne journée", ko: "좋은 하루 보내세요", cat: "인사말" },
  { fr: "Bonne nuit", ko: "잘 자요", cat: "인사말" },
  { fr: "Merci", ko: "감사합니다", cat: "인사말" },
  { fr: "De rien", ko: "천만에요", cat: "인사말" },
  { fr: "S'il vous plaît", ko: "부탁드립니다", cat: "인사말" },
  { fr: "Pardon", ko: "실례합니다 / 죄송해요", cat: "인사말" },
  { fr: "Excusez-moi", ko: "실례합니다 (주목)", cat: "인사말" },
  { fr: "Ça va ?", ko: "잘 지내?", cat: "인사말" },
  { fr: "Très bien", ko: "아주 잘", cat: "인사말" },
  { fr: "Pas mal", ko: "나쁘지 않아요", cat: "인사말" },
  { fr: "Comme ci, comme ça", ko: "그럭저럭", cat: "인사말" },
  { fr: "Enchanté(e)", ko: "만나서 반가워요", cat: "인사말" },
  { fr: "Je m'appelle...", ko: "제 이름은 ~입니다", cat: "인사말" },
  { fr: "Comment vous appelez-vous ?", ko: "성함이 어떻게 되세요?", cat: "인사말" },
  { fr: "Et vous ?", ko: "당신은요?", cat: "인사말" },
  { fr: "Moi aussi", ko: "나도요", cat: "인사말" },

  { fr: "La Corée", ko: "한국", cat: "나라" },
  { fr: "La France", ko: "프랑스", cat: "나라" },
  { fr: "Le Japon", ko: "일본", cat: "나라" },
  { fr: "Les États-Unis", ko: "미국", cat: "나라" },
  { fr: "L'Angleterre", ko: "영국", cat: "나라" },
  { fr: "L'Allemagne", ko: "독일", cat: "나라" },
  { fr: "L'Italie", ko: "이탈리아", cat: "나라" },
  { fr: "L'Espagne", ko: "스페인", cat: "나라" },
  { fr: "La Chine", ko: "중국", cat: "나라" },
  { fr: "Le Canada", ko: "캐나다", cat: "나라" },
  { fr: "Coréen(ne)", ko: "한국인 / 한국어", cat: "나라" },
  { fr: "Français(e)", ko: "프랑스인 / 프랑스어", cat: "나라" },
  { fr: "Japonais(e)", ko: "일본인 / 일본어", cat: "나라" },
  { fr: "Américain(e)", ko: "미국인", cat: "나라" },
  { fr: "Anglais(e)", ko: "영국인 / 영어", cat: "나라" },
  { fr: "Je suis de...", ko: "저는 ~에서 왔어요", cat: "나라" },
  { fr: "Je viens de...", ko: "저는 ~출신이에요", cat: "나라" },
  { fr: "Je parle coréen", ko: "저는 한국어를 해요", cat: "나라" },

  // ── Week 2: 일상과 시간 ──────────────────────────
  { fr: "Le matin", ko: "아침", cat: "시간" },
  { fr: "L'après-midi", ko: "오후", cat: "시간" },
  { fr: "Le soir", ko: "저녁", cat: "시간" },
  { fr: "La nuit", ko: "밤", cat: "시간" },
  { fr: "Aujourd'hui", ko: "오늘", cat: "시간" },
  { fr: "Demain", ko: "내일", cat: "시간" },
  { fr: "Hier", ko: "어제", cat: "시간" },
  { fr: "Maintenant", ko: "지금", cat: "시간" },
  { fr: "Avant", ko: "~전에", cat: "시간" },
  { fr: "Après", ko: "~후에", cat: "시간" },
  { fr: "Tôt", ko: "일찍", cat: "시간" },
  { fr: "Tard", ko: "늦게", cat: "시간" },
  { fr: "En retard", ko: "늦은", cat: "시간" },
  { fr: "À l'heure", ko: "제시간에", cat: "시간" },
  { fr: "Toujours", ko: "언제나", cat: "시간" },
  { fr: "Souvent", ko: "자주", cat: "시간" },
  { fr: "Parfois", ko: "가끔", cat: "시간" },
  { fr: "Jamais", ko: "절대로 ~않다", cat: "시간" },
  { fr: "Quelle heure est-il ?", ko: "몇 시예요?", cat: "시간" },
  { fr: "Il est midi", ko: "정오예요", cat: "시간" },
  { fr: "Un rendez-vous", ko: "약속 / 예약", cat: "시간" },

  { fr: "Bleu(e)", ko: "파란색", cat: "색깔" },
  { fr: "Rouge", ko: "빨간색", cat: "색깔" },
  { fr: "Vert(e)", ko: "초록색", cat: "색깔" },
  { fr: "Jaune", ko: "노란색", cat: "색깔" },
  { fr: "Noir(e)", ko: "검정색", cat: "색깔" },
  { fr: "Blanc / blanche", ko: "하얀색", cat: "색깔" },
  { fr: "Gris(e)", ko: "회색", cat: "색깔" },
  { fr: "Marron", ko: "갈색", cat: "색깔" },
  { fr: "Rose", ko: "분홍색", cat: "색깔" },
  { fr: "Violet(te)", ko: "보라색", cat: "색깔" },
  { fr: "Orange", ko: "오렌지색", cat: "색깔" },
  { fr: "Beige", ko: "베이지색", cat: "색깔" },

  // ── Week 3: 가족과 집 ────────────────────────────
  { fr: "Un père", ko: "아버지", cat: "가족" },
  { fr: "Une mère", ko: "어머니", cat: "가족" },
  { fr: "Un mari", ko: "남편", cat: "가족" },
  { fr: "Une femme", ko: "아내", cat: "가족" },
  { fr: "Un fils", ko: "아들", cat: "가족" },
  { fr: "Une fille", ko: "딸", cat: "가족" },
  { fr: "Un frère", ko: "형제", cat: "가족" },
  { fr: "Une sœur", ko: "자매", cat: "가족" },
  { fr: "Un grand-père", ko: "할아버지", cat: "가족" },
  { fr: "Une grand-mère", ko: "할머니", cat: "가족" },
  { fr: "Un oncle", ko: "삼촌", cat: "가족" },
  { fr: "Une tante", ko: "이모 / 고모", cat: "가족" },
  { fr: "Un cousin / une cousine", ko: "사촌", cat: "가족" },
  { fr: "Un enfant", ko: "아이", cat: "가족" },
  { fr: "La famille", ko: "가족", cat: "가족" },
  { fr: "Un(e) ami(e)", ko: "친구", cat: "가족" },

  { fr: "Une maison", ko: "집", cat: "집" },
  { fr: "Un appartement", ko: "아파트", cat: "집" },
  { fr: "Un studio", ko: "원룸", cat: "집" },
  { fr: "Un étage", ko: "층", cat: "집" },
  { fr: "Une chambre", ko: "방 / 침실", cat: "집" },
  { fr: "Un salon", ko: "거실", cat: "집" },
  { fr: "Une cuisine", ko: "부엌", cat: "집" },
  { fr: "Une salle de bains", ko: "욕실", cat: "집" },
  { fr: "Des toilettes", ko: "화장실", cat: "집" },
  { fr: "Un balcon", ko: "발코니", cat: "집" },
  { fr: "Un jardin", ko: "정원", cat: "집" },
  { fr: "Un lit", ko: "침대", cat: "집" },
  { fr: "Un canapé", ko: "소파", cat: "집" },
  { fr: "Une table", ko: "탁자", cat: "집" },
  { fr: "Une chaise", ko: "의자", cat: "집" },
  { fr: "Un bureau", ko: "책상", cat: "집" },
  { fr: "Une fenêtre", ko: "창문", cat: "집" },
  { fr: "Une porte", ko: "문", cat: "집" },
  { fr: "Un réfrigérateur", ko: "냉장고", cat: "집" },
  { fr: "Un loyer", ko: "월세", cat: "집" },

  // ── Week 4: 길 찾기와 도시 ──────────────────────
  { fr: "Un restaurant", ko: "식당", cat: "도시" },
  { fr: "Un café", ko: "카페", cat: "도시" },
  { fr: "Un hôtel", ko: "호텔", cat: "도시" },
  { fr: "Un hôpital", ko: "병원", cat: "도시" },
  { fr: "Une pharmacie", ko: "약국", cat: "도시" },
  { fr: "Un musée", ko: "박물관", cat: "도시" },
  { fr: "Un parc", ko: "공원", cat: "도시" },
  { fr: "Un supermarché", ko: "슈퍼마켓", cat: "도시" },
  { fr: "Une boulangerie", ko: "빵집", cat: "도시" },
  { fr: "Un cinéma", ko: "영화관", cat: "도시" },
  { fr: "Une poste", ko: "우체국", cat: "도시" },
  { fr: "Une banque", ko: "은행", cat: "도시" },
  { fr: "Une rue", ko: "길", cat: "도시" },
  { fr: "Un boulevard", ko: "대로", cat: "도시" },
  { fr: "Un quartier", ko: "동네 / 지구", cat: "도시" },
  { fr: "À gauche", ko: "왼쪽으로", cat: "도시" },
  { fr: "À droite", ko: "오른쪽으로", cat: "도시" },
  { fr: "Tout droit", ko: "직진", cat: "도시" },
  { fr: "Près d'ici", ko: "이 근처에", cat: "도시" },
  { fr: "Loin", ko: "멀어요", cat: "도시" },

  { fr: "Le métro", ko: "지하철", cat: "교통" },
  { fr: "Le bus", ko: "버스", cat: "교통" },
  { fr: "Le train", ko: "기차", cat: "교통" },
  { fr: "Le RER", ko: "급행 지하철 (파리)", cat: "교통" },
  { fr: "Un taxi", ko: "택시", cat: "교통" },
  { fr: "Un vélo", ko: "자전거", cat: "교통" },
  { fr: "Un avion", ko: "비행기", cat: "교통" },
  { fr: "Une gare", ko: "기차역", cat: "교통" },
  { fr: "Un aéroport", ko: "공항", cat: "교통" },
  { fr: "Un arrêt de bus", ko: "버스 정류장", cat: "교통" },
  { fr: "Un billet", ko: "표 / 티켓", cat: "교통" },
  { fr: "Un ticket", ko: "승차권", cat: "교통" },
  { fr: "La sortie", ko: "출구", cat: "교통" },
  { fr: "Le quai", ko: "플랫폼", cat: "교통" },
  { fr: "Le terminus", ko: "종점", cat: "교통" },

  // ── Week 5: 음식과 식당 ──────────────────────────
  { fr: "Un croissant", ko: "크루아상", cat: "음식" },
  { fr: "Une baguette", ko: "바게트", cat: "음식" },
  { fr: "Un pain au chocolat", ko: "팽오쇼콜라 (초콜릿 빵)", cat: "음식" },
  { fr: "Du fromage", ko: "치즈", cat: "음식" },
  { fr: "Un oeuf", ko: "계란", cat: "음식" },
  { fr: "Du beurre", ko: "버터", cat: "음식" },
  { fr: "Du jambon", ko: "햄", cat: "음식" },
  { fr: "Du poulet", ko: "닭고기", cat: "음식" },
  { fr: "Du boeuf", ko: "소고기", cat: "음식" },
  { fr: "Du saumon", ko: "연어", cat: "음식" },
  { fr: "Une pomme", ko: "사과", cat: "음식" },
  { fr: "Une fraise", ko: "딸기", cat: "음식" },
  { fr: "Une banane", ko: "바나나", cat: "음식" },
  { fr: "Une tomate", ko: "토마토", cat: "음식" },
  { fr: "Une pomme de terre", ko: "감자", cat: "음식" },
  { fr: "Du riz", ko: "쌀 / 밥", cat: "음식" },
  { fr: "Du sucre", ko: "설탕", cat: "음식" },
  { fr: "Du sel", ko: "소금", cat: "음식" },
  { fr: "Du poivre", ko: "후추", cat: "음식" },
  { fr: "Une carotte", ko: "당근", cat: "음식" },

  { fr: "Le petit déjeuner", ko: "아침 식사", cat: "식사" },
  { fr: "Le déjeuner", ko: "점심 식사", cat: "식사" },
  { fr: "Le dîner", ko: "저녁 식사", cat: "식사" },
  { fr: "Un thé", ko: "차", cat: "식사" },
  { fr: "De l'eau", ko: "물", cat: "식사" },
  { fr: "Un jus d'orange", ko: "오렌지 주스", cat: "식사" },
  { fr: "Une bière", ko: "맥주", cat: "식사" },
  { fr: "Un verre de vin", ko: "와인 한 잔", cat: "식사" },
  { fr: "Un menu", ko: "메뉴", cat: "식사" },
  { fr: "La carte", ko: "메뉴판", cat: "식사" },
  { fr: "Une entrée", ko: "에피타이저", cat: "식사" },
  { fr: "Un plat principal", ko: "메인 요리", cat: "식사" },
  { fr: "Un dessert", ko: "디저트", cat: "식사" },
  { fr: "Un plat du jour", ko: "오늘의 요리", cat: "식사" },
  { fr: "L'addition", ko: "계산서", cat: "식사" },
  { fr: "Un pourboire", ko: "팁", cat: "식사" },
  { fr: "C'est délicieux", ko: "맛있어요", cat: "식사" },
  { fr: "Bon appétit !", ko: "맛있게 드세요!", cat: "식사" },
  { fr: "Je voudrais réserver", ko: "예약하고 싶어요", cat: "식사" },

  // ── Week 6: 쇼핑과 옷 ───────────────────────────
  { fr: "Un manteau", ko: "코트", cat: "옷" },
  { fr: "Une veste", ko: "자켓", cat: "옷" },
  { fr: "Un pull", ko: "스웨터", cat: "옷" },
  { fr: "Une chemise", ko: "셔츠", cat: "옷" },
  { fr: "Un t-shirt", ko: "티셔츠", cat: "옷" },
  { fr: "Une robe", ko: "드레스", cat: "옷" },
  { fr: "Un pantalon", ko: "바지", cat: "옷" },
  { fr: "Une jupe", ko: "치마", cat: "옷" },
  { fr: "Un jean", ko: "청바지", cat: "옷" },
  { fr: "Des chaussures", ko: "신발", cat: "옷" },
  { fr: "Des bottes", ko: "부츠", cat: "옷" },
  { fr: "Des chaussettes", ko: "양말", cat: "옷" },
  { fr: "Un chapeau", ko: "모자", cat: "옷" },
  { fr: "Un foulard", ko: "스카프", cat: "옷" },
  { fr: "Un parapluie", ko: "우산", cat: "옷" },
  { fr: "Ma taille", ko: "나의 사이즈", cat: "옷" },
  { fr: "Trop grand(e)", ko: "너무 커요", cat: "옷" },
  { fr: "Trop petit(e)", ko: "너무 작아요", cat: "옷" },
  { fr: "Avez-vous en...?", ko: "~이 있나요?", cat: "옷" },
  { fr: "Je cherche...", ko: "~을 찾고 있어요", cat: "옷" },

  { fr: "Un sac", ko: "가방", cat: "소지품" },
  { fr: "Un sac à dos", ko: "백팩", cat: "소지품" },
  { fr: "Une valise", ko: "여행 가방", cat: "소지품" },
  { fr: "Un portefeuille", ko: "지갑", cat: "소지품" },
  { fr: "Une clé", ko: "열쇠", cat: "소지품" },
  { fr: "Un téléphone portable", ko: "핸드폰", cat: "소지품" },
  { fr: "Un chargeur", ko: "충전기", cat: "소지품" },
  { fr: "Des écouteurs", ko: "이어폰", cat: "소지품" },
  { fr: "Un passeport", ko: "여권", cat: "소지품" },
  { fr: "Une carte d'identité", ko: "신분증", cat: "소지품" },
  { fr: "Une carte de crédit", ko: "신용카드", cat: "소지품" },
  { fr: "De l'argent", ko: "돈", cat: "소지품" },
  { fr: "Un appareil photo", ko: "카메라", cat: "소지품" },
  { fr: "Une montre", ko: "손목시계", cat: "소지품" },
  { fr: "Des lunettes", ko: "안경", cat: "소지품" },

  // ── Week 7: 몸과 건강 ────────────────────────────
  { fr: "La tête", ko: "머리", cat: "몸" },
  { fr: "Le cou", ko: "목", cat: "몸" },
  { fr: "L'épaule", ko: "어깨", cat: "몸" },
  { fr: "Le bras", ko: "팔", cat: "몸" },
  { fr: "La main", ko: "손", cat: "몸" },
  { fr: "Le doigt", ko: "손가락", cat: "몸" },
  { fr: "La poitrine", ko: "가슴", cat: "몸" },
  { fr: "Le ventre", ko: "배", cat: "몸" },
  { fr: "Le dos", ko: "등", cat: "몸" },
  { fr: "La jambe", ko: "다리", cat: "몸" },
  { fr: "Le genou", ko: "무릎", cat: "몸" },
  { fr: "Le pied", ko: "발", cat: "몸" },
  { fr: "Le visage", ko: "얼굴", cat: "몸" },
  { fr: "Les cheveux", ko: "머리카락", cat: "몸" },
  { fr: "L'œil / les yeux", ko: "눈", cat: "몸" },
  { fr: "Le nez", ko: "코", cat: "몸" },
  { fr: "La bouche", ko: "입", cat: "몸" },
  { fr: "La dent", ko: "이빨", cat: "몸" },
  { fr: "L'oreille", ko: "귀", cat: "몸" },
  { fr: "J'ai mal à...", ko: "~이 아파요", cat: "몸" },

  { fr: "Grand(e)", ko: "키가 큰", cat: "외모" },
  { fr: "Petit(e)", ko: "키가 작은", cat: "외모" },
  { fr: "Beau / belle", ko: "잘생긴 / 예쁜", cat: "외모" },
  { fr: "Joli(e)", ko: "예쁜", cat: "외모" },
  { fr: "Mince", ko: "날씬한", cat: "외모" },
  { fr: "Corpulent(e)", ko: "통통한", cat: "외모" },
  { fr: "Jeune", ko: "젊은", cat: "외모" },
  { fr: "Âgé(e)", ko: "나이 든", cat: "외모" },
  { fr: "Élégant(e)", ko: "우아한", cat: "외모" },
  { fr: "Les cheveux blonds", ko: "금발 머리", cat: "외모" },
  { fr: "Les cheveux bruns", ko: "갈색 머리", cat: "외모" },
  { fr: "Les cheveux noirs", ko: "검은 머리", cat: "외모" },
  { fr: "Les yeux bleus", ko: "파란 눈", cat: "외모" },
  { fr: "Les yeux marron", ko: "갈색 눈", cat: "외모" },
  { fr: "Porter des lunettes", ko: "안경을 쓰다", cat: "외모" },

  // ── Week 8: 날씨와 취미 ──────────────────────────
  { fr: "Le printemps", ko: "봄", cat: "날씨" },
  { fr: "L'été", ko: "여름", cat: "날씨" },
  { fr: "L'automne", ko: "가을", cat: "날씨" },
  { fr: "L'hiver", ko: "겨울", cat: "날씨" },
  { fr: "Il fait beau", ko: "날씨가 좋아요", cat: "날씨" },
  { fr: "Il fait mauvais", ko: "날씨가 나빠요", cat: "날씨" },
  { fr: "Il fait chaud", ko: "더워요", cat: "날씨" },
  { fr: "Il fait froid", ko: "추워요", cat: "날씨" },
  { fr: "Le soleil", ko: "태양 / 햇살", cat: "날씨" },
  { fr: "La pluie", ko: "비", cat: "날씨" },
  { fr: "Il pleut", ko: "비가 와요", cat: "날씨" },
  { fr: "La neige", ko: "눈", cat: "날씨" },
  { fr: "Il neige", ko: "눈이 와요", cat: "날씨" },
  { fr: "Le nuage", ko: "구름", cat: "날씨" },
  { fr: "Le vent", ko: "바람", cat: "날씨" },
  { fr: "Un orage", ko: "폭풍우", cat: "날씨" },
  { fr: "Le brouillard", ko: "안개", cat: "날씨" },
  { fr: "La température", ko: "기온 / 온도", cat: "날씨" },
  { fr: "Il fait... degrés", ko: "~도예요", cat: "날씨" },

  { fr: "La musique", ko: "음악", cat: "취미" },
  { fr: "La lecture", ko: "독서", cat: "취미" },
  { fr: "La peinture", ko: "그림", cat: "취미" },
  { fr: "La photographie", ko: "사진", cat: "취미" },
  { fr: "Le cinéma", ko: "영화", cat: "취미" },
  { fr: "La cuisine", ko: "요리", cat: "취미" },
  { fr: "Le sport", ko: "스포츠", cat: "취미" },
  { fr: "La natation", ko: "수영", cat: "취미" },
  { fr: "La randonnée", ko: "등산 / 하이킹", cat: "취미" },
  { fr: "Le ski", ko: "스키", cat: "취미" },
  { fr: "Le vélo", ko: "자전거 타기", cat: "취미" },
  { fr: "La danse", ko: "춤", cat: "취미" },
  { fr: "Le voyage", ko: "여행", cat: "취미" },
  { fr: "Le shopping", ko: "쇼핑", cat: "취미" },
  { fr: "Les jeux vidéo", ko: "비디오 게임", cat: "취미" },
  { fr: "J'aime...", ko: "~을 좋아해요", cat: "취미" },
  { fr: "Je fais...", ko: "~을 해요", cat: "취미" },
  { fr: "C'est mon passe-temps", ko: "이게 제 취미예요", cat: "취미" },

  // ── Week 9: 감정과 성격 ──────────────────────────
  { fr: "Content(e)", ko: "기쁜", cat: "감정" },
  { fr: "Triste", ko: "슬픈", cat: "감정" },
  { fr: "Heureux / heureuse", ko: "행복한", cat: "감정" },
  { fr: "Malheureux / malheureuse", ko: "불행한", cat: "감정" },
  { fr: "En colère", ko: "화가 난", cat: "감정" },
  { fr: "Stressé(e)", ko: "스트레스받는", cat: "감정" },
  { fr: "Inquiet / inquiète", ko: "걱정하는", cat: "감정" },
  { fr: "Surpris(e)", ko: "놀란", cat: "감정" },
  { fr: "Amoureux / amoureuse", ko: "사랑에 빠진", cat: "감정" },
  { fr: "Fatigué(e)", ko: "피곤한", cat: "감정" },
  { fr: "La joie", ko: "기쁨", cat: "감정" },
  { fr: "La tristesse", ko: "슬픔", cat: "감정" },
  { fr: "La peur", ko: "두려움", cat: "감정" },
  { fr: "L'amour", ko: "사랑", cat: "감정" },
  { fr: "Je me sens...", ko: "~한 느낌이에요", cat: "감정" },

  { fr: "Gentil(le)", ko: "친절한", cat: "성격" },
  { fr: "Méchant(e)", ko: "못된", cat: "성격" },
  { fr: "Intelligent(e)", ko: "똑똑한", cat: "성격" },
  { fr: "Généreux / généreuse", ko: "너그러운", cat: "성격" },
  { fr: "Égoïste", ko: "이기적인", cat: "성격" },
  { fr: "Honnête", ko: "정직한", cat: "성격" },
  { fr: "Sociable", ko: "사교적인", cat: "성격" },
  { fr: "Timide", ko: "소심한", cat: "성격" },
  { fr: "Courageux / courageuse", ko: "용감한", cat: "성격" },
  { fr: "Paresseux / paresseuse", ko: "게으른", cat: "성격" },
  { fr: "Sérieux / sérieuse", ko: "진지한", cat: "성격" },
  { fr: "Drôle", ko: "웃긴 / 재미있는", cat: "성격" },
  { fr: "Sympa", ko: "좋은 / 호감 가는", cat: "성격" },
  { fr: "Bavard(e)", ko: "수다스러운", cat: "성격" },
  { fr: "Calme", ko: "침착한", cat: "성격" },

  // ── Week 10: 직업과 학교 ─────────────────────────
  { fr: "Un(e) professeur(e)", ko: "선생님 / 교수", cat: "직업" },
  { fr: "Un médecin", ko: "의사", cat: "직업" },
  { fr: "Un(e) infirmier(ère)", ko: "간호사", cat: "직업" },
  { fr: "Un(e) ingénieur(e)", ko: "엔지니어", cat: "직업" },
  { fr: "Un(e) avocat(e)", ko: "변호사", cat: "직업" },
  { fr: "Un(e) comptable", ko: "회계사", cat: "직업" },
  { fr: "Un(e) journaliste", ko: "기자", cat: "직업" },
  { fr: "Un(e) architecte", ko: "건축가", cat: "직업" },
  { fr: "Un(e) acteur / actrice", ko: "배우", cat: "직업" },
  { fr: "Un(e) cuisinier(ère)", ko: "요리사", cat: "직업" },
  { fr: "Un(e) boulanger(ère)", ko: "제빵사", cat: "직업" },
  { fr: "Un(e) vendeur(euse)", ko: "판매원", cat: "직업" },
  { fr: "Un homme / une femme d'affaires", ko: "사업가", cat: "직업" },
  { fr: "Un(e) étudiant(e)", ko: "대학생", cat: "직업" },
  { fr: "Je travaille comme...", ko: "~로 일해요", cat: "직업" },
  { fr: "Je cherche un emploi", ko: "취직을 찾고 있어요", cat: "직업" },
  { fr: "Un entretien", ko: "면접", cat: "직업" },

  { fr: "Une école", ko: "학교", cat: "학교" },
  { fr: "Un collège", ko: "중학교", cat: "학교" },
  { fr: "Un lycée", ko: "고등학교", cat: "학교" },
  { fr: "Une université", ko: "대학교", cat: "학교" },
  { fr: "Un(e) élève", ko: "학생 (초중고)", cat: "학교" },
  { fr: "Un(e) étudiant(e)", ko: "대학생", cat: "학교" },
  { fr: "Un cours", ko: "수업", cat: "학교" },
  { fr: "Un examen", ko: "시험", cat: "학교" },
  { fr: "Un devoir", ko: "숙제", cat: "학교" },
  { fr: "Un diplôme", ko: "졸업장 / 학위", cat: "학교" },
  { fr: "Les vacances", ko: "방학 / 휴가", cat: "학교" },
  { fr: "Un stylo", ko: "펜", cat: "학교" },
  { fr: "Un crayon", ko: "연필", cat: "학교" },
  { fr: "Un livre", ko: "책", cat: "학교" },
  { fr: "Un cahier", ko: "공책", cat: "학교" },
  { fr: "Apprendre", ko: "배우다", cat: "학교" },
  { fr: "Étudier", ko: "공부하다", cat: "학교" },
  { fr: "Réussir", ko: "성공하다 / 합격하다", cat: "학교" },
  { fr: "La Nouvelle-Zélande", ko: "뉴질랜드", cat: "나라" },
  { fr: "Un professeur", ko: "선생님", cat: "직업" },
  { fr: "Un médecin", ko: "의사", cat: "직업" },
  { fr: "Un infirmier", ko: "간호사", cat: "직업" },
  { fr: "Un ingénieur", ko: "엔지니어", cat: "직업" },
  { fr: "Un avocat", ko: "변호사", cat: "직업" },
  { fr: "Un juge", ko: "판사", cat: "직업" },
  { fr: "Un comptable", ko: "회계사", cat: "직업" },
  { fr: "Un journaliste", ko: "기자", cat: "직업" },
  { fr: "Un architecte", ko: "건축가", cat: "직업" },
  { fr: "Un acteur / une actrice", ko: "배우", cat: "직업" },
  { fr: "Un chanteur", ko: "가수", cat: "직업" },
  { fr: "Un musicien", ko: "음악가", cat: "직업" },
  { fr: "Un cuisinier", ko: "요리사", cat: "직업" },
  { fr: "Un boulanger", ko: "제빵사", cat: "직업" },
  { fr: "Un vendeur", ko: "판매원", cat: "직업" },
  { fr: "Un agriculteur", ko: "농부", cat: "직업" },
  { fr: "Un fonctionnaire", ko: "공무원", cat: "직업" },
  { fr: "Un homme d'affaires", ko: "사업가", cat: "직업" },
  { fr: "Un employé", ko: "회사원", cat: "직업" },
  { fr: "Un athlète", ko: "운동선수", cat: "직업" },
  { fr: "Une femme au foyer", ko: "주부", cat: "직업" },
  { fr: "Un chômeur", ko: "실업자", cat: "직업" },
  { fr: "Gentil(le)", ko: "친절한", cat: "성격" },
  { fr: "Intelligent(e)", ko: "똑똑한", cat: "성격" },
  { fr: "Généreux/généreuse", ko: "너그러운", cat: "성격" },
  { fr: "Honnête", ko: "정직한", cat: "성격" },
  { fr: "Aimable", ko: "사랑스러운", cat: "성격" },
  { fr: "Sociable", ko: "사교적인", cat: "성격" },
  { fr: "Sérieux/sérieuse", ko: "진지한", cat: "성격" },
  { fr: "Calme", ko: "침착한", cat: "성격" },
  { fr: "Créatif/créative", ko: "창의적인", cat: "성격" },
  { fr: "Ambitieux/ambitieuse", ko: "야심적인", cat: "성격" },
  { fr: "Aventureux", ko: "모험적인", cat: "성격" },
  { fr: "Bavard(e)", ko: "수다스러운", cat: "성격" },
  { fr: "Ponctuel(le)", ko: "시간을 잘 지키는", cat: "성격" },
  { fr: "Méchant(e)", ko: "못된", cat: "성격" },
  { fr: "Sage", ko: "현명한", cat: "성격" },
  { fr: "Fier / fière", ko: "자존심이 강한", cat: "성격" },
  { fr: "Grand(e)", ko: "키가 큰", cat: "외모" },
  { fr: "Petit(e)", ko: "키가 작은", cat: "외모" },
  { fr: "Beau / belle", ko: "멋진, 예쁜", cat: "외모" },
  { fr: "Joli(e)", ko: "예쁜", cat: "외모" },
  { fr: "Mince", ko: "날씬한", cat: "외모" },
  { fr: "Gros / grosse", ko: "뚱뚱한", cat: "외모" },
  { fr: "Jeune", ko: "젊은", cat: "외모" },
  { fr: "Âgé(e)", ko: "나이가 많은", cat: "외모" },
  { fr: "Fort(e)", ko: "튼튼한", cat: "외모" },
  { fr: "Bleu(e)", ko: "파란색", cat: "색깔" },
  { fr: "Rouge", ko: "빨간색", cat: "색깔" },
  { fr: "Vert(e)", ko: "초록색", cat: "색깔" },
  { fr: "Jaune", ko: "노란색", cat: "색깔" },
  { fr: "Noir(e)", ko: "검정색", cat: "색깔" },
  { fr: "Blanc / blanche", ko: "하얀색", cat: "색깔" },
  { fr: "Gris(e)", ko: "회색", cat: "색깔" },
  { fr: "Marron", ko: "갈색", cat: "색깔" },
  { fr: "Beige", ko: "베이지색", cat: "색깔" },
  { fr: "Rose", ko: "분홍색", cat: "색깔" },
  { fr: "Violet(te)", ko: "보라색", cat: "색깔" },
  { fr: "Orange", ko: "오렌지색", cat: "색깔" },
  { fr: "Content(e)", ko: "기쁜", cat: "감정" },
  { fr: "Triste", ko: "슬픈", cat: "감정" },
  { fr: "Heureux / heureuse", ko: "행복한", cat: "감정" },
  { fr: "Malheureux", ko: "불행한", cat: "감정" },
  { fr: "Amoureux", ko: "사랑에 빠진", cat: "감정" },
  { fr: "Joyeux / joyeuse", ko: "즐거운", cat: "감정" },
  { fr: "Énervé(e)", ko: "짜증난", cat: "감정" },
  { fr: "La confiance", ko: "자신감", cat: "감정" },
  { fr: "La honte", ko: "창피함", cat: "감정" },
  { fr: "Le plaisir", ko: "기쁨, 즐거움", cat: "감정" },
  { fr: "Rire", ko: "웃다", cat: "감정" },
  { fr: "Pleurer", ko: "울다", cat: "감정" },
  { fr: "Se disputer", ko: "싸우다", cat: "감정" },
  { fr: "Une école primaire", ko: "초등학교", cat: "학교" },
  { fr: "Un collège", ko: "중학교", cat: "학교" },
  { fr: "Un lycée", ko: "고등학교", cat: "학교" },
  { fr: "Une université", ko: "대학교", cat: "학교" },
  { fr: "Un élève", ko: "학생", cat: "학교" },
  { fr: "Un examen", ko: "시험", cat: "학교" },
  { fr: "Un cours", ko: "수업", cat: "학교" },
  { fr: "Un diplôme", ko: "학위", cat: "학교" },
  { fr: "Un stylo", ko: "펜", cat: "학교" },
  { fr: "Un crayon", ko: "연필", cat: "학교" },
  { fr: "Une gomme", ko: "지우개", cat: "학교" },
  { fr: "Une règle", ko: "자", cat: "학교" },
  { fr: "Des ciseaux", ko: "가위", cat: "학교" },
  { fr: "Un livre", ko: "책", cat: "학교" },
  { fr: "Un cahier", ko: "공책", cat: "학교" },
  { fr: "Une trousse", ko: "필통", cat: "학교" },
  { fr: "Un tableau", ko: "칠판", cat: "학교" },
  { fr: "Une bourse d'études", ko: "장학금", cat: "학교" },
  { fr: "Une bonne note", ko: "좋은 성적", cat: "학교" },
  { fr: "Une mauvaise note", ko: "나쁜 성적", cat: "학교" },
  { fr: "Un sac", ko: "가방", cat: "소지품" },
  { fr: "Une clé", ko: "열쇠", cat: "소지품" },
  { fr: "Un portefeuille", ko: "지갑", cat: "소지품" },
  { fr: "Un téléphone portable", ko: "핸드폰", cat: "소지품" },
  { fr: "Un passeport", ko: "여권", cat: "소지품" },
  { fr: "Une voiture", ko: "자동차", cat: "교통" },
  { fr: "Un vélo", ko: "자전거", cat: "교통" },
  { fr: "Une moto", ko: "오토바이", cat: "교통" },
  { fr: "Un avion", ko: "비행기", cat: "교통" },
  { fr: "Un train", ko: "기차", cat: "교통" },
  { fr: "Un bus", ko: "버스", cat: "교통" },
  { fr: "Un taxi", ko: "택시", cat: "교통" },
  { fr: "Le métro", ko: "지하철", cat: "교통" },
  { fr: "Une gare", ko: "기차역", cat: "교통" },
  { fr: "Un aéroport", ko: "공항", cat: "교통" },
  { fr: "Un arrêt de bus", ko: "버스 정류장", cat: "교통" },
  { fr: "L'autoroute", ko: "고속도로", cat: "교통" },
  { fr: "Une maison", ko: "집", cat: "집" },
  { fr: "Un appartement", ko: "아파트", cat: "집" },
  { fr: "Une chambre", ko: "방", cat: "집" },
  { fr: "Un salon", ko: "거실", cat: "집" },
  { fr: "Une cuisine", ko: "부엌", cat: "집" },
  { fr: "Une salle de bains", ko: "욕실", cat: "집" },
  { fr: "Des toilettes", ko: "화장실", cat: "집" },
  { fr: "Un jardin", ko: "정원", cat: "집" },
  { fr: "Un balcon", ko: "발코니", cat: "집" },
  { fr: "Un lit", ko: "침대", cat: "집" },
  { fr: "Un canapé", ko: "소파", cat: "집" },
  { fr: "Un fauteuil", ko: "안락의자", cat: "집" },
  { fr: "Une table", ko: "탁자", cat: "집" },
  { fr: "Une chaise", ko: "의자", cat: "집" },
  { fr: "Un bureau", ko: "책상", cat: "집" },
  { fr: "Une armoire", ko: "옷장", cat: "집" },
  { fr: "Un réfrigérateur", ko: "냉장고", cat: "집" },
  { fr: "Un four", ko: "오븐", cat: "집" },
  { fr: "Un four à micro-ondes", ko: "전자레인지", cat: "집" },
  { fr: "Un lave-linge", ko: "세탁기", cat: "집" },
  { fr: "Un aspirateur", ko: "청소기", cat: "집" },
  { fr: "Une télévision", ko: "텔레비전", cat: "집" },
  { fr: "Un ordinateur", ko: "컴퓨터", cat: "집" },
  { fr: "Un miroir", ko: "거울", cat: "집" },
  { fr: "Une douche", ko: "샤워", cat: "집" },
  { fr: "Une baignoire", ko: "욕조", cat: "집" },
  { fr: "Un rideau", ko: "커튼", cat: "집" },
  { fr: "Un tapis", ko: "카펫", cat: "집" },
  { fr: "Une lampe", ko: "램프", cat: "집" },
  { fr: "Une fenêtre", ko: "창문", cat: "집" },
  { fr: "Une porte", ko: "문", cat: "집" },
  { fr: "Un restaurant", ko: "식당", cat: "도시" },
  { fr: "Un café", ko: "카페", cat: "도시" },
  { fr: "Un hôtel", ko: "호텔", cat: "도시" },
  { fr: "Un hôpital", ko: "병원", cat: "도시" },
  { fr: "Une pharmacie", ko: "약국", cat: "도시" },
  { fr: "Un musée", ko: "박물관", cat: "도시" },
  { fr: "Une bibliothèque", ko: "도서관", cat: "도시" },
  { fr: "Une école", ko: "학교", cat: "도시" },
  { fr: "Un parc", ko: "공원", cat: "도시" },
  { fr: "Un cinéma", ko: "영화관", cat: "도시" },
  { fr: "Un théâtre", ko: "극장", cat: "도시" },
  { fr: "Un supermarché", ko: "슈퍼마켓", cat: "도시" },
  { fr: "Un grand magasin", ko: "백화점", cat: "도시" },
  { fr: "Une boulangerie", ko: "빵집", cat: "도시" },
  { fr: "Une librairie", ko: "서점", cat: "도시" },
  { fr: "Une mairie", ko: "시청", cat: "도시" },
  { fr: "Un stade", ko: "경기장", cat: "도시" },
  { fr: "Une église", ko: "교회", cat: "도시" },
  { fr: "Un quartier", ko: "구역, 지구", cat: "도시" },
  { fr: "Une rue", ko: "길", cat: "도시" },
  { fr: "Un trottoir", ko: "보도", cat: "도시" },
  { fr: "Un manteau", ko: "코트", cat: "옷" },
  { fr: "Une veste", ko: "자켓", cat: "옷" },
  { fr: "Un pull", ko: "스웨터", cat: "옷" },
  { fr: "Une chemise", ko: "셔츠", cat: "옷" },
  { fr: "Un t-shirt", ko: "티셔츠", cat: "옷" },
  { fr: "Une robe", ko: "드레스", cat: "옷" },
  { fr: "Un pantalon", ko: "바지", cat: "옷" },
  { fr: "Une jupe", ko: "치마", cat: "옷" },
  { fr: "Un jean", ko: "청바지", cat: "옷" },
  { fr: "Un costume", ko: "양복", cat: "옷" },
  { fr: "Des chaussures", ko: "신발", cat: "옷" },
  { fr: "Des sandales", ko: "샌들", cat: "옷" },
  { fr: "Des bottes", ko: "부츠", cat: "옷" },
  { fr: "Des chaussettes", ko: "양말", cat: "옷" },
  { fr: "Un chapeau", ko: "모자", cat: "옷" },
  { fr: "Une casquette", ko: "캡 모자", cat: "옷" },
  { fr: "Une cravate", ko: "넥타이", cat: "옷" },
  { fr: "Une ceinture", ko: "벨트", cat: "옷" },
  { fr: "Un foulard", ko: "스카프", cat: "옷" },
  { fr: "Un parapluie", ko: "우산", cat: "옷" },
  { fr: "Un collier", ko: "목걸이", cat: "옷" },
  { fr: "Une bague", ko: "반지", cat: "옷" },
  { fr: "Un bracelet", ko: "팔찌", cat: "옷" },
  { fr: "Des boucles d'oreilles", ko: "귀걸이", cat: "옷" },
  { fr: "Le riz", ko: "쌀", cat: "음식" },
  { fr: "La farine", ko: "밀가루", cat: "음식" },
  { fr: "Le sucre", ko: "설탕", cat: "음식" },
  { fr: "Le sel", ko: "소금", cat: "음식" },
  { fr: "Le poivre", ko: "후추", cat: "음식" },
  { fr: "Une pomme", ko: "사과", cat: "음식" },
  { fr: "Une poire", ko: "배", cat: "음식" },
  { fr: "Une orange", ko: "오렌지", cat: "음식" },
  { fr: "Une fraise", ko: "딸기", cat: "음식" },
  { fr: "Une banane", ko: "바나나", cat: "음식" },
  { fr: "Un citron", ko: "레몬", cat: "음식" },
  { fr: "Une pastèque", ko: "수박", cat: "음식" },
  { fr: "Une pomme de terre", ko: "감자", cat: "음식" },
  { fr: "Une carotte", ko: "당근", cat: "음식" },
  { fr: "Une tomate", ko: "토마토", cat: "음식" },
  { fr: "Un oignon", ko: "양파", cat: "음식" },
  { fr: "Un champignon", ko: "버섯", cat: "음식" },
  { fr: "Le boeuf", ko: "소고기", cat: "음식" },
  { fr: "Le porc", ko: "돼지고기", cat: "음식" },
  { fr: "Le poulet", ko: "닭고기", cat: "음식" },
  { fr: "Le jambon", ko: "햄", cat: "음식" },
  { fr: "Le saumon", ko: "연어", cat: "음식" },
  { fr: "Le thon", ko: "참치", cat: "음식" },
  { fr: "Une crevette", ko: "새우", cat: "음식" },
  { fr: "Un crabe", ko: "게", cat: "음식" },
  { fr: "Le lait", ko: "우유", cat: "음식" },
  { fr: "Le beurre", ko: "버터", cat: "음식" },
  { fr: "Un oeuf", ko: "계란", cat: "음식" },
  { fr: "Le fromage", ko: "치즈", cat: "음식" },
  { fr: "Le petit déjeuner", ko: "아침 식사", cat: "식사" },
  { fr: "Le déjeuner", ko: "점심 식사", cat: "식사" },
  { fr: "Le dîner", ko: "저녁 식사", cat: "식사" },
  { fr: "Un café", ko: "커피", cat: "식사" },
  { fr: "Un thé", ko: "차", cat: "식사" },
  { fr: "Une eau", ko: "물", cat: "식사" },
  { fr: "Un jus", ko: "주스", cat: "식사" },
  { fr: "Une bière", ko: "맥주", cat: "식사" },
  { fr: "Un vin", ko: "와인", cat: "식사" },
  { fr: "Un croissant", ko: "크루아상", cat: "식사" },
  { fr: "Une baguette", ko: "바게트", cat: "식사" },
  { fr: "Un gâteau", ko: "케이크", cat: "식사" },
  { fr: "Une glace", ko: "아이스크림", cat: "식사" },
  { fr: "Un chocolat", ko: "초콜릿", cat: "식사" },
  { fr: "Une salade", ko: "샐러드", cat: "식사" },
  { fr: "Une soupe", ko: "수프", cat: "식사" },
  { fr: "Un steak", ko: "스테이크", cat: "식사" },
  { fr: "Une pizza", ko: "피자", cat: "식사" },
  { fr: "Des frites", ko: "감자튀김", cat: "식사" },
  { fr: "L'addition", ko: "계산서", cat: "식사" },
  { fr: "Un pourboire", ko: "팁", cat: "식사" },
  { fr: "Un plat du jour", ko: "오늘의 요리", cat: "식사" },
  { fr: "Un père", ko: "아버지", cat: "가족" },
  { fr: "Une mère", ko: "어머니", cat: "가족" },
  { fr: "Un mari", ko: "남편", cat: "가족" },
  { fr: "Une femme", ko: "아내", cat: "가족" },
  { fr: "Un fils", ko: "아들", cat: "가족" },
  { fr: "Une fille", ko: "딸", cat: "가족" },
  { fr: "Un frère", ko: "형제", cat: "가족" },
  { fr: "Une soeur", ko: "자매", cat: "가족" },
  { fr: "Un grand frère", ko: "형, 오빠", cat: "가족" },
  { fr: "Une grande soeur", ko: "언니, 누나", cat: "가족" },
  { fr: "Un petit frère", ko: "남동생", cat: "가족" },
  { fr: "Une petite soeur", ko: "여동생", cat: "가족" },
  { fr: "Un grand-père", ko: "할아버지", cat: "가족" },
  { fr: "Une grand-mère", ko: "할머니", cat: "가족" },
  { fr: "Un cousin / une cousine", ko: "사촌", cat: "가족" },
  { fr: "Un enfant", ko: "자녀", cat: "가족" },
  { fr: "La musique", ko: "음악", cat: "취미" },
  { fr: "La lecture", ko: "독서", cat: "취미" },
  { fr: "La photographie", ko: "사진", cat: "취미" },
  { fr: "La peinture", ko: "그림", cat: "취미" },
  { fr: "Le cinéma", ko: "영화", cat: "취미" },
  { fr: "La cuisine", ko: "요리", cat: "취미" },
  { fr: "Le sport", ko: "스포츠", cat: "취미" },
  { fr: "La natation", ko: "수영", cat: "취미" },
  { fr: "La randonnée", ko: "등산", cat: "취미" },
  { fr: "Le ski", ko: "스키", cat: "취미" },
  { fr: "Le voyage", ko: "여행", cat: "취미" },
  { fr: "Le jardinage", ko: "정원 가꾸기", cat: "취미" },
  { fr: "Le shopping", ko: "쇼핑", cat: "취미" },
  { fr: "L'internet", ko: "인터넷", cat: "취미" },
  { fr: "Les jeux vidéos", ko: "비디오 게임", cat: "취미" },
  { fr: "Le théâtre", ko: "연극", cat: "취미" },
  { fr: "Les bandes dessinées", ko: "만화책", cat: "취미" },
  { fr: "La tête", ko: "머리", cat: "몸" },
  { fr: "Le cou", ko: "목", cat: "몸" },
  { fr: "Le bras", ko: "팔", cat: "몸" },
  { fr: "La main", ko: "손", cat: "몸" },
  { fr: "Le doigt", ko: "손가락", cat: "몸" },
  { fr: "La poitrine", ko: "가슴", cat: "몸" },
  { fr: "Le ventre", ko: "배", cat: "몸" },
  { fr: "Le dos", ko: "등", cat: "몸" },
  { fr: "La jambe", ko: "다리", cat: "몸" },
  { fr: "Le genou", ko: "무릎", cat: "몸" },
  { fr: "Le pied", ko: "발", cat: "몸" },
  { fr: "Le visage", ko: "얼굴", cat: "몸" },
  { fr: "Les cheveux", ko: "머리카락", cat: "몸" },
  { fr: "L'oreille", ko: "귀", cat: "몸" },
  { fr: "L'oeil / les yeux", ko: "눈", cat: "몸" },
  { fr: "Le nez", ko: "코", cat: "몸" },
  { fr: "La bouche", ko: "입", cat: "몸" },
  { fr: "La dent", ko: "이빨", cat: "몸" },
  { fr: "La langue", ko: "혀", cat: "몸" },
  { fr: "Le matin", ko: "아침", cat: "시간" },
  { fr: "L'après-midi", ko: "오후", cat: "시간" },
  { fr: "Le soir", ko: "저녁", cat: "시간" },
  { fr: "La nuit", ko: "밤", cat: "시간" },
  { fr: "Aujourd'hui", ko: "오늘", cat: "시간" },
  { fr: "Demain", ko: "내일", cat: "시간" },
  { fr: "Hier", ko: "어제", cat: "시간" },
  { fr: "Un jour", ko: "하루", cat: "시간" },
  { fr: "Une semaine", ko: "일주일", cat: "시간" },
  { fr: "Un mois", ko: "한 달", cat: "시간" },
  { fr: "Un an", ko: "1년", cat: "시간" },
  { fr: "Maintenant", ko: "지금", cat: "시간" },
  { fr: "Avant", ko: "~전에", cat: "시간" },
  { fr: "Après", ko: "~후에", cat: "시간" },
  { fr: "Tôt", ko: "일찍", cat: "시간" },
  { fr: "Tard", ko: "늦게", cat: "시간" },
  { fr: "En retard", ko: "늦은", cat: "시간" },
  { fr: "À l'heure", ko: "제시간에", cat: "시간" },
  { fr: "Toujours", ko: "언제나", cat: "시간" },
  { fr: "Souvent", ko: "자주", cat: "시간" },
  { fr: "Parfois", ko: "가끔", cat: "시간" },
  { fr: "Jamais", ko: "절대로 ~ 않다", cat: "시간" },
  { fr: "Le printemps", ko: "봄", cat: "날씨" },
  { fr: "L'été", ko: "여름", cat: "날씨" },
  { fr: "L'automne", ko: "가을", cat: "날씨" },
  { fr: "L'hiver", ko: "겨울", cat: "날씨" },
  { fr: "Il fait beau", ko: "날씨가 좋다", cat: "날씨" },
  { fr: "Il fait mauvais", ko: "날씨가 나쁘다", cat: "날씨" },
  { fr: "Il fait chaud", ko: "덥다", cat: "날씨" },
  { fr: "Il fait froid", ko: "춥다", cat: "날씨" },
  { fr: "Le soleil", ko: "태양", cat: "날씨" },
  { fr: "La pluie", ko: "비", cat: "날씨" },
  { fr: "Il pleut", ko: "비가 온다", cat: "날씨" },
  { fr: "La neige", ko: "눈", cat: "날씨" },
  { fr: "Il neige", ko: "눈이 온다", cat: "날씨" },
  { fr: "Le nuage", ko: "구름", cat: "날씨" },
  { fr: "Le vent", ko: "바람", cat: "날씨" },
  { fr: "Le brouillard", ko: "안개", cat: "날씨" },
  { fr: "Un orage", ko: "폭풍우", cat: "날씨" },
  { fr: "Le tonnerre", ko: "천둥", cat: "날씨" },
];

// ── 상태 ──────────────────────────────────────
let currentPage   = 0;
let searchQuery   = "";
let hideMemorized = false;
let viewMode      = "list";   // "list" | "card"
let cardIndex     = 0;
let cardFlipped   = false;
let memorized     = new Set();

function saveMemorized() {
  localStorage.setItem(LS_KEY_HB, JSON.stringify([...memorized]));
  window.sfSave?.();
}

function getFiltered() {
  const baseWords = curriculumWords || HANDBOOK_WORDS;
  return baseWords.filter(w => {
    if (hideMemorized && memorized.has(w.fr)) return false;
    if (!searchQuery) return true;
    return w.fr.toLowerCase().includes(searchQuery) || w.ko.includes(searchQuery);
  });
}

export function initHandbook(userKey = "default") {
  LS_KEY_HB = `sf_handbook_mem_${userKey}`;
  memorized = new Set(JSON.parse(localStorage.getItem(LS_KEY_HB) || "[]"));

  // 커리큘럼 진도에 따라 사용 가능한 단어만 필터링
  const { grammarProgress, memorizedArr } = loadCurriculumState(userKey);
  const unlocked   = getUnlockedUnitIds(grammarProgress, [...memorized], HANDBOOK_WORDS);
  const availCats  = getAvailableVocabCategories(unlocked);
  curriculumWords  = HANDBOOK_WORDS.filter(w => availCats.includes(w.cat));

  renderHandbookPage();
}

function renderHandbookPage() {
  const page = document.getElementById("page-handbook");
  page.innerHTML = `
    <link rel="stylesheet" href="public/css/handbook.css?v=15" />

    <div class="hb-header">
      <h2 class="hb-title">단어장</h2>
      <p class="hb-sub">학습 중인 단어 ${(curriculumWords || HANDBOOK_WORDS).length}개</p>
      <div class="hb-controls">
        <input class="hb-search" id="hb-search" type="text" placeholder="프랑스어 또는 한국어로 검색..." autocomplete="off" />
        <div class="hb-btn-row">
          <button class="hb-block-btn hb-view-btn${viewMode === "card" ? " active" : ""}" id="hb-view-toggle">${viewMode === "list" ? "카드 보기" : "목록 보기"}</button>
          <button class="hb-block-btn hb-hide-btn${hideMemorized ? " active" : ""}" id="hb-hide-mem">외운 단어 숨기기</button>
        </div>
      </div>
    </div>

    <div id="hb-content"></div>
  `;

  if (viewMode === "list") renderList();
  else renderCardView();

  document.getElementById("hb-search").addEventListener("input", e => {
    searchQuery = e.target.value.trim().toLowerCase();
    currentPage = 0;
    cardIndex   = 0;
    if (viewMode === "list") renderList(); else renderCardView();
  });

  document.getElementById("hb-hide-mem").addEventListener("click", e => {
    hideMemorized = !hideMemorized;
    e.currentTarget.classList.toggle("active", hideMemorized);
    currentPage = 0;
    cardIndex   = 0;
    if (viewMode === "list") renderList(); else renderCardView();
  });

  document.getElementById("hb-view-toggle").addEventListener("click", () => {
    viewMode = viewMode === "list" ? "card" : "list";
    cardIndex = 0;
    currentPage = 0;
    document.getElementById("hb-view-toggle").textContent = viewMode === "list" ? "카드 보기" : "목록 보기";
    if (viewMode === "list") renderList(); else renderCardView();
  });
}

function renderList() {
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage >= totalPages) currentPage = totalPages - 1;

  const slice = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const content = document.getElementById("hb-content");
  content.innerHTML = `<div class="hb-list" id="hb-list"></div><div class="hb-pagination" id="hb-pagination"></div>`;
  const listEl = document.getElementById("hb-list");
  const pageEl = document.getElementById("hb-pagination");

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="hb-empty">검색 결과가 없어요</div>`;
    return;
  }

  listEl.innerHTML = slice.map(w => {
    const ph = PHONETICS[w.fr] || "";
    const isMem = memorized.has(w.fr);
    return `
      <div class="hb-row ${isMem ? "hb-row-mem" : ""}" data-fr="${w.fr.replace(/"/g, "&quot;")}">
        <div class="hb-row-main">
          <span class="hb-row-fr">${w.fr}</span>
          ${ph ? `<span class="hb-row-ph">[${ph}]</span>` : ""}
          <span class="hb-row-ko">${w.ko}</span>
        </div>
        <button class="hb-mem-btn ${isMem ? "memorized" : ""}" data-fr="${w.fr.replace(/"/g, "&quot;")}" title="${isMem ? "외움 취소" : "외운 단어로 표시"}">
          ${isMem ? "✓" : ""}
        </button>
      </div>
    `;
  }).join("");

  // 북마크 버튼 이벤트
  listEl.querySelectorAll(".hb-mem-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const fr = btn.dataset.fr;
      if (memorized.has(fr)) {
        memorized.delete(fr);
      } else {
        memorized.add(fr);
      }
      saveMemorized();
      renderList();
    });
  });

  // 페이지네이션
  const start = currentPage * PAGE_SIZE + 1;
  const end   = Math.min((currentPage + 1) * PAGE_SIZE, filtered.length);
  pageEl.innerHTML = `
    <button class="hb-page-btn" id="hb-prev" ${currentPage === 0 ? "disabled" : ""}>← 이전</button>
    <span class="hb-page-info">${start}–${end} / ${filtered.length}개</span>
    <button class="hb-page-btn" id="hb-next" ${currentPage >= totalPages - 1 ? "disabled" : ""}>다음 →</button>
  `;

  document.getElementById("hb-prev")?.addEventListener("click", () => {
    if (currentPage > 0) { currentPage--; renderList(); }
  });
  document.getElementById("hb-next")?.addEventListener("click", () => {
    if (currentPage < totalPages - 1) { currentPage++; renderList(); }
  });
}

function renderCardView() {
  const filtered = getFiltered();
  const content  = document.getElementById("hb-content");

  if (filtered.length === 0) {
    content.innerHTML = `<div class="hb-empty">검색 결과가 없어요</div>`;
    return;
  }

  if (cardIndex >= filtered.length) cardIndex = filtered.length - 1;
  if (cardIndex < 0) cardIndex = 0;

  const w     = filtered[cardIndex];
  const ph    = PHONETICS[w.fr] || "";
  const isMem = memorized.has(w.fr);
  const cat   = w.cat || "";

  content.innerHTML = `
    <div class="hb-card-view">
      <div class="hb-card-row">
        <button class="hb-side-btn" id="hb-card-prev" ${cardIndex === 0 ? "disabled" : ""}>‹</button>

        <div class="hb-flip-wrap" id="hb-flip-wrap">
          <div class="hb-flip-inner${cardFlipped ? " flipped" : ""}" id="hb-flip-inner">
            <!-- 앞면: 프랑스어 + 발음 -->
            <div class="hb-flip-front">
              <span class="hb-card-cat">${cat}</span>
              <div class="hb-card-fr">${w.fr}</div>
              ${ph ? `<div class="hb-card-ph">${ph}</div>` : ""}
              <div class="hb-flip-hint">탭하여 뜻 보기</div>
            </div>
            <!-- 뒷면: 한국어 뜻 + 외운 버튼 -->
            <div class="hb-flip-back">
              <span class="hb-card-cat">${cat}</span>
              <div class="hb-card-ko" style="font-size:28px">${w.ko}</div>
              <div class="hb-card-fr" style="font-size:18px;opacity:.55">${w.fr}</div>
              <button class="hb-mem-btn ${isMem ? "memorized" : ""}" id="hb-card-mem-btn">
                ${isMem ? "✓" : ""}
              </button>
              <div class="hb-flip-hint">${isMem ? "외운 단어" : "외운 단어로 표시"}</div>
            </div>
          </div>
        </div>

        <button class="hb-side-btn" id="hb-card-next" ${cardIndex >= filtered.length - 1 ? "disabled" : ""}>›</button>
      </div>
      <div class="hb-card-counter">${cardIndex + 1} / ${filtered.length}</div>
    </div>
  `;

  // 카드 탭 → 플립
  document.getElementById("hb-flip-wrap").addEventListener("click", (e) => {
    if (e.target.closest("#hb-card-mem-btn")) return; // 버튼 클릭 시 제외
    cardFlipped = !cardFlipped;
    document.getElementById("hb-flip-inner")?.classList.toggle("flipped", cardFlipped);
  });

  document.getElementById("hb-card-mem-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (memorized.has(w.fr)) memorized.delete(w.fr);
    else memorized.add(w.fr);
    saveMemorized();
    renderCardView();
  });

  document.getElementById("hb-card-prev")?.addEventListener("click", () => {
    if (cardIndex > 0) { cardIndex--; cardFlipped = false; renderCardView(); }
  });
  document.getElementById("hb-card-next")?.addEventListener("click", () => {
    if (cardIndex < filtered.length - 1) { cardIndex++; cardFlipped = false; renderCardView(); }
  });
}
