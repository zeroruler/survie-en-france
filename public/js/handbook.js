// ══════════════════════════════════════════════
//   handbook.js — 단어장 (핸드북 단어 브라우저)
// ══════════════════════════════════════════════

const PAGE_SIZE   = 20;
const LS_KEY_HB   = "sf_handbook_memorized";

// ── 발음 표기 ─────────────────────────────────
export const PHONETICS = {
  "Bonjour": "bon-ZHOOR",
  "Salut": "sa-LUE",
  "Bonsoir": "bon-SWAHR",
  "Au revoir": "oh ruh-VWAHR",
  "Bonne journée": "bun zhoor-NAY",
  "Merci": "mair-SEE",
  "Ça va ?": "sah VAH",
  "Très bien": "treh BYEHN",
  "Moi aussi": "mwah oh-SEE",
  "Enchanté(e)": "ahn-shahn-TAY",
  "Comment allez-vous ?": "koh-mahn ta-lay VOO",
  "Je vais très bien": "zhuh veh treh BYEHN",
  "Comment vous appelez-vous ?": "koh-mahn voo za-play VOO",
  "Je m'appelle...": "zhuh ma-PELL",
  "Et vous ?": "ay VOO",
  "Comme ci, comme ça": "kum SEE kum SAH",
  "S'il vous plaît": "seel voo PLEH",
  "De rien": "duh RYEHN",
  "Pardon": "par-DOHN",
  "Excusez-moi": "ex-kue-zay MWAH",
  "La Corée": "la ko-RAY",
  "La France": "la FRAHNS",
  "La Chine": "la SHEEN",
  "Le Japon": "luh zhah-POHN",
  "Les États-Unis": "lay zay-ta zu-NEE",
  "L'Angleterre": "lahn-gluh-TAIR",
  "L'Allemagne": "la-luh-MAHN-yuh",
  "L'Italie": "lee-ta-LEE",
  "L'Espagne": "les-PAN-yuh",
  "L'Australie": "lo-stra-LEE",
  "Le Canada": "luh ka-na-DA",
  "L'Inde": "LEHND",
  "La Russie": "la rue-SEE",
  "La Grèce": "la GRESS",
  "La Suède": "la SWED",
  "L'Égypte": "lay-ZHEEPT",
  "Le Maroc": "luh ma-ROK",
  "L'Afrique du Sud": "la-freek due SUED",
  "La Nouvelle-Zélande": "la noo-vel zay-LAHND",
  "Un professeur": "uhn pro-fe-SUHR",
  "Un médecin": "uhn may-d-SEHN",
  "Un infirmier": "uhn ahn-feer-MYAY",
  "Un ingénieur": "uhn ahn-zhay-NYUHR",
  "Un avocat": "uhn a-vo-KAH",
  "Un juge": "uhn ZHUZH",
  "Un comptable": "uhn kohn-TAHBL",
  "Un journaliste": "uhn zhoor-na-LEEST",
  "Un architecte": "uhn ar-shee-TEKT",
  "Un acteur / une actrice": "uhn ak-TUHR / oon ak-TREES",
  "Un chanteur": "uhn shahn-TUHR",
  "Un musicien": "uhn mue-zee-SYEHN",
  "Un cuisinier": "uhn kwee-zee-NYAY",
  "Un boulanger": "uhn boo-lahn-ZHAY",
  "Un vendeur": "uhn vahn-DUHR",
  "Un agriculteur": "uhn a-gree-kul-TUHR",
  "Un fonctionnaire": "uhn fonk-syo-NAIR",
  "Un homme d'affaires": "uhn um da-FAIR",
  "Un employé": "uhn ahm-plwa-YAY",
  "Un athlète": "uhn at-LET",
  "Une femme au foyer": "oon fam oh fwa-YAY",
  "Un chômeur": "uhn shoh-MUHR",
  "Gentil(le)": "zhahn-TEE(y)",
  "Intelligent(e)": "ahn-teh-lee-ZHAHN(t)",
  "Généreux/généreuse": "zhay-nay-RUH / zhay-nay-RUHZ",
  "Honnête": "o-NET",
  "Aimable": "ay-MAHBL",
  "Sociable": "so-SYAHBL",
  "Sérieux/sérieuse": "say-RYUH / say-RYUHZ",
  "Calme": "KAHLM",
  "Créatif/créative": "kray-a-TEEF / kray-a-TEEV",
  "Ambitieux/ambitieuse": "ahm-bee-SYUH / ahm-bee-SYUHZ",
  "Aventureux": "a-vahn-tue-RUH",
  "Bavard(e)": "ba-VAHR(d)",
  "Ponctuel(le)": "ponk-TYELL",
  "Méchant(e)": "may-SHAHN(t)",
  "Sage": "SAHZH",
  "Fier / fière": "FYAIR",
  "Grand(e)": "GRAHN(d)",
  "Petit(e)": "puh-TEE(t)",
  "Beau / belle": "BOH / BEL",
  "Joli(e)": "zho-LEE",
  "Mince": "MEHNS",
  "Gros / grosse": "GROH / GROS",
  "Jeune": "ZHUHN",
  "Âgé(e)": "ah-ZHAY",
  "Fort(e)": "FOR(t)",
  "Bleu(e)": "BLUH",
  "Rouge": "ROOZH",
  "Vert(e)": "VAIR(t)",
  "Jaune": "ZHOHN",
  "Noir(e)": "NWAHR",
  "Blanc / blanche": "BLAHN / BLAHNSH",
  "Gris(e)": "GREE(z)",
  "Marron": "ma-ROHN",
  "Beige": "BEZH",
  "Rose": "ROHZ",
  "Violet(te)": "vyo-LAY(t)",
  "Orange": "o-RAHNZH",
  "Content(e)": "kohn-TAHN(t)",
  "Triste": "TREEST",
  "Heureux / heureuse": "uh-RUH / uh-RUHZ",
  "Malheureux": "mal-uh-RUH",
  "Amoureux": "a-moo-RUH",
  "Joyeux / joyeuse": "zhwa-YUH / zhwa-YUHZ",
  "Énervé(e)": "ay-nair-VAY",
  "La confiance": "la kohn-FYAHNS",
  "La honte": "la OHNT",
  "Le plaisir": "luh play-ZEER",
  "Rire": "REER",
  "Pleurer": "pluh-RAY",
  "Se disputer": "suh dees-pue-TAY",
  "Une école primaire": "oon ay-kol pree-MAIR",
  "Un collège": "uhn ko-LEZH",
  "Un lycée": "uhn lee-SAY",
  "Une université": "oon ue-nee-vair-see-TAY",
  "Un élève": "uhn ay-LEV",
  "Un examen": "uhn eg-za-MEHN",
  "Un cours": "uhn KOOR",
  "Un diplôme": "uhn dee-PLOHM",
  "Un stylo": "uhn stee-LOH",
  "Un crayon": "uhn kray-YOHN",
  "Une gomme": "oon GUM",
  "Une règle": "oon REG-luh",
  "Des ciseaux": "day see-ZOH",
  "Un livre": "uhn LEEVR",
  "Un cahier": "uhn ka-YAY",
  "Une trousse": "oon TROOS",
  "Un tableau": "uhn ta-BLOH",
  "Une bourse d'études": "oon boors day-TUED",
  "Une bonne note": "oon bun NOT",
  "Une mauvaise note": "oon moh-VEZ not",
  "Un sac": "uhn SAK",
  "Une clé": "oon KLAY",
  "Un portefeuille": "uhn port-FUH-yuh",
  "Un téléphone portable": "uhn tay-lay-fon por-TAHBL",
  "Un passeport": "uhn pas-POR",
  "Une voiture": "oon vwa-TUER",
  "Un vélo": "uhn vay-LOH",
  "Une moto": "oon mo-TOH",
  "Un avion": "uhn a-VYOHN",
  "Un train": "uhn TREHN",
  "Un bus": "uhn BUES",
  "Un taxi": "uhn tak-SEE",
  "Le métro": "luh may-TROH",
  "Une gare": "oon GAHR",
  "Un aéroport": "uhn a-ay-ro-POR",
  "Un arrêt de bus": "uhn a-REH duh BUES",
  "L'autoroute": "lo-to-ROOT",
  "Une maison": "oon may-ZOHN",
  "Un appartement": "uhn a-par-tuh-MAHN",
  "Une chambre": "oon SHAHMBR",
  "Un salon": "uhn sa-LOHN",
  "Une cuisine": "oon kwee-ZEEN",
  "Une salle de bains": "oon sal duh BEHN",
  "Des toilettes": "day twa-LET",
  "Un jardin": "uhn zhar-DEHN",
  "Un balcon": "uhn bal-KOHN",
  "Un lit": "uhn LEE",
  "Un canapé": "uhn ka-na-PAY",
  "Un fauteuil": "uhn foh-TUH-yuh",
  "Une table": "oon TAHBL",
  "Une chaise": "oon SHEZ",
  "Un bureau": "uhn bue-ROH",
  "Une armoire": "oon ar-MWAHR",
  "Un réfrigérateur": "uhn ray-free-zhay-ra-TUHR",
  "Un four": "uhn FOOR",
  "Un four à micro-ondes": "uhn foor a mee-kro-OHND",
  "Un lave-linge": "uhn lav-LEHNZH",
  "Un aspirateur": "uhn as-pee-ra-TUHR",
  "Une télévision": "oon tay-lay-vee-ZYOHN",
  "Un ordinateur": "uhn or-dee-na-TUHR",
  "Un miroir": "uhn mee-RWAHR",
  "Une douche": "oon DOOSH",
  "Une baignoire": "oon beh-NWAHR",
  "Un rideau": "uhn ree-DOH",
  "Un tapis": "uhn ta-PEE",
  "Une lampe": "oon LAHMP",
  "Une fenêtre": "oon fuh-NET-ruh",
  "Une porte": "oon PORT",
  "Un restaurant": "uhn res-to-RAHN",
  "Un café": "uhn ka-FAY",
  "Un hôtel": "uhn oh-TEL",
  "Un hôpital": "uhn oh-pee-TAL",
  "Une pharmacie": "oon far-ma-SEE",
  "Un musée": "uhn mue-ZAY",
  "Une bibliothèque": "oon bee-blee-o-TEK",
  "Une école": "oon ay-KOL",
  "Un parc": "uhn PARK",
  "Un cinéma": "uhn see-nay-MA",
  "Un théâtre": "uhn tay-AHT-ruh",
  "Un supermarché": "uhn sue-pair-mar-SHAY",
  "Un grand magasin": "uhn grahn ma-ga-ZEHN",
  "Une boulangerie": "oon boo-lahn-zhuh-REE",
  "Une librairie": "oon lee-bray-REE",
  "Une mairie": "oon may-REE",
  "Un stade": "uhn STAHD",
  "Une église": "oon ay-GLEEZ",
  "Un quartier": "uhn kar-TYAY",
  "Une rue": "oon RUE",
  "Un trottoir": "uhn tro-TWAHR",
  "Un manteau": "uhn mahn-TOH",
  "Une veste": "oon VEST",
  "Un pull": "uhn PUHL",
  "Une chemise": "oon shuh-MEEZ",
  "Un t-shirt": "uhn tee-SHIRT",
  "Une robe": "oon ROB",
  "Un pantalon": "uhn pahn-ta-LOHN",
  "Une jupe": "oon ZHUP",
  "Un jean": "uhn ZHEHN",
  "Un costume": "uhn kos-TYUM",
  "Des chaussures": "day shoh-SUER",
  "Des sandales": "day sahn-DAHL",
  "Des bottes": "day BOT",
  "Des chaussettes": "day shoh-SET",
  "Un chapeau": "uhn sha-POH",
  "Une casquette": "oon kas-KET",
  "Une cravate": "oon kra-VAHT",
  "Une ceinture": "oon sehn-TUER",
  "Un foulard": "uhn foo-LAR",
  "Un parapluie": "uhn pa-ra-PLWEE",
  "Un collier": "uhn ko-LYAY",
  "Une bague": "oon BAG",
  "Un bracelet": "uhn bras-LAY",
  "Des boucles d'oreilles": "day bookl do-RAY-yuh",
  "Le riz": "luh REE",
  "La farine": "la fa-REEN",
  "Le sucre": "luh SOOKR",
  "Le sel": "luh SEL",
  "Le poivre": "luh PWAHVR",
  "Une pomme": "oon PUM",
  "Une poire": "oon PWAHR",
  "Une orange": "oon o-RAHNZH",
  "Une fraise": "oon FREZ",
  "Une banane": "oon ba-NAN",
  "Un citron": "uhn see-TROHN",
  "Une pastèque": "oon pas-TEK",
  "Une pomme de terre": "oon pum duh TAIR",
  "Une carotte": "oon ka-ROT",
  "Une tomate": "oon to-MAT",
  "Un oignon": "uhn on-YOHN",
  "Un champignon": "uhn shahm-pee-NYOHN",
  "Le boeuf": "luh BUF",
  "Le porc": "luh POR",
  "Le poulet": "luh poo-LAY",
  "Le jambon": "luh zhahm-BOHN",
  "Le saumon": "luh soh-MOHN",
  "Le thon": "luh TOHN",
  "Une crevette": "oon kruh-VET",
  "Un crabe": "uhn KRAHB",
  "Le lait": "luh LAY",
  "Le beurre": "luh BUR",
  "Un oeuf": "uhn UHF",
  "Le fromage": "luh fro-MAHZH",
  "Le petit déjeuner": "luh puh-tee day-zhuh-NAY",
  "Le déjeuner": "luh day-zhuh-NAY",
  "Le dîner": "luh dee-NAY",
  "Un thé": "uhn TAY",
  "Une eau": "oon OH",
  "Un jus": "uhn ZHUE",
  "Une bière": "oon BYAIR",
  "Un vin": "uhn VEHN",
  "Un croissant": "uhn krwa-SAHN",
  "Une baguette": "oon ba-GET",
  "Un gâteau": "uhn ga-TOH",
  "Une glace": "oon GLAHS",
  "Un chocolat": "uhn sho-ko-LAH",
  "Une salade": "oon sa-LAD",
  "Une soupe": "oon SOOP",
  "Un steak": "uhn STEK",
  "Une pizza": "oon PEET-za",
  "Des frites": "day FREET",
  "L'addition": "la-dee-SYOHN",
  "Un pourboire": "uhn poor-BWAHR",
  "Un plat du jour": "uhn plah due ZHOOR",
  "Un père": "uhn PAIR",
  "Une mère": "oon MAIR",
  "Un mari": "uhn ma-REE",
  "Une femme": "oon FAM",
  "Un fils": "uhn FEES",
  "Une fille": "oon FEE-yuh",
  "Un frère": "uhn FRAIR",
  "Une soeur": "oon SUR",
  "Un grand frère": "uhn grahn FRAIR",
  "Une grande soeur": "oon grahnd SUR",
  "Un petit frère": "uhn puh-tee FRAIR",
  "Une petite soeur": "oon puh-teet SUR",
  "Un grand-père": "uhn grahn-PAIR",
  "Une grand-mère": "oon grahn-MAIR",
  "Un cousin / une cousine": "uhn koo-ZEHN / oon koo-ZEEN",
  "Un enfant": "uhn ahn-FAHN",
  "La musique": "la mue-ZEEK",
  "La lecture": "la lek-TUER",
  "La photographie": "la fo-to-gra-FEE",
  "La peinture": "la pehn-TUER",
  "Le cinéma": "luh see-nay-MA",
  "La cuisine": "la kwee-ZEEN",
  "Le sport": "luh SPOR",
  "La natation": "la na-ta-SYOHN",
  "La randonnée": "la rahn-do-NAY",
  "Le ski": "luh SKEE",
  "Le voyage": "luh vwa-YAHZH",
  "Le jardinage": "luh zhar-dee-NAHZH",
  "Le shopping": "luh SHO-peeng",
  "L'internet": "lehn-tair-NET",
  "Les jeux vidéos": "lay zhuh vee-day-OH",
  "Le théâtre": "luh tay-AHT-ruh",
  "Les bandes dessinées": "lay bahnd deh-see-NAY",
  "La tête": "la TET",
  "Le cou": "luh KOO",
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
  "L'oreille": "lo-RAY-yuh",
  "L'oeil / les yeux": "LUH-yuh / lay ZYUH",
  "Le nez": "luh NAY",
  "La bouche": "la BOOSH",
  "La dent": "la DAHN",
  "La langue": "la LAHNG",
  "Le matin": "luh ma-TEHN",
  "L'après-midi": "la-preh-mee-DEE",
  "Le soir": "luh SWAHR",
  "La nuit": "la NWEE",
  "Aujourd'hui": "oh-zhoor-DWEE",
  "Demain": "duh-MEHN",
  "Hier": "YAIR",
  "Un jour": "uhn ZHOOR",
  "Une semaine": "oon suh-MEN",
  "Un mois": "uhn MWAH",
  "Un an": "uhn AHN",
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
  "Le brouillard": "luh broo-YAHR",
  "Un orage": "uhn o-RAHZH",
  "Le tonnerre": "luh to-NAIR",
};

// ── 단어 데이터 ────────────────────────────────
export const HANDBOOK_WORDS = [
  { fr: "Bonjour", ko: "안녕하세요", cat: "인사말" },
  { fr: "Salut", ko: "안녕", cat: "인사말" },
  { fr: "Bonsoir", ko: "안녕하세요 (저녁)", cat: "인사말" },
  { fr: "Au revoir", ko: "안녕히 가세요", cat: "인사말" },
  { fr: "Bonne journée", ko: "좋은 하루 보내세요", cat: "인사말" },
  { fr: "Merci", ko: "감사합니다", cat: "인사말" },
  { fr: "Ça va ?", ko: "잘 지내?", cat: "인사말" },
  { fr: "Très bien", ko: "아주 잘", cat: "인사말" },
  { fr: "Moi aussi", ko: "나도", cat: "인사말" },
  { fr: "Enchanté(e)", ko: "만나서 반가워요", cat: "인사말" },
  { fr: "Comment allez-vous ?", ko: "어떻게 지내세요?", cat: "인사말" },
  { fr: "Je vais très bien", ko: "아주 잘 지내요", cat: "인사말" },
  { fr: "Comment vous appelez-vous ?", ko: "성함이 어떻게 되세요?", cat: "인사말" },
  { fr: "Je m'appelle...", ko: "제 이름은 ~입니다", cat: "인사말" },
  { fr: "Et vous ?", ko: "당신은요?", cat: "인사말" },
  { fr: "Comme ci, comme ça", ko: "그럭저럭", cat: "인사말" },
  { fr: "S'il vous plaît", ko: "부탁드립니다", cat: "인사말" },
  { fr: "De rien", ko: "천만에요", cat: "인사말" },
  { fr: "Pardon", ko: "실례합니다", cat: "인사말" },
  { fr: "Excusez-moi", ko: "실례합니다", cat: "인사말" },
  { fr: "La Corée", ko: "한국", cat: "나라" },
  { fr: "La France", ko: "프랑스", cat: "나라" },
  { fr: "La Chine", ko: "중국", cat: "나라" },
  { fr: "Le Japon", ko: "일본", cat: "나라" },
  { fr: "Les États-Unis", ko: "미국", cat: "나라" },
  { fr: "L'Angleterre", ko: "영국", cat: "나라" },
  { fr: "L'Allemagne", ko: "독일", cat: "나라" },
  { fr: "L'Italie", ko: "이탈리아", cat: "나라" },
  { fr: "L'Espagne", ko: "스페인", cat: "나라" },
  { fr: "L'Australie", ko: "오스트레일리아", cat: "나라" },
  { fr: "Le Canada", ko: "캐나다", cat: "나라" },
  { fr: "L'Inde", ko: "인도", cat: "나라" },
  { fr: "La Russie", ko: "러시아", cat: "나라" },
  { fr: "La Grèce", ko: "그리스", cat: "나라" },
  { fr: "La Suède", ko: "스웨덴", cat: "나라" },
  { fr: "L'Égypte", ko: "이집트", cat: "나라" },
  { fr: "Le Maroc", ko: "모로코", cat: "나라" },
  { fr: "L'Afrique du Sud", ko: "남아프리카 공화국", cat: "나라" },
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
let memorized     = new Set(JSON.parse(localStorage.getItem(LS_KEY_HB) || "[]"));

function saveMemorized() {
  localStorage.setItem(LS_KEY_HB, JSON.stringify([...memorized]));
}

function getFiltered() {
  return HANDBOOK_WORDS.filter(w => {
    if (hideMemorized && memorized.has(w.fr)) return false;
    if (!searchQuery) return true;
    return w.fr.toLowerCase().includes(searchQuery) || w.ko.includes(searchQuery);
  });
}

export function initHandbook() {
  renderHandbookPage();
}

function renderHandbookPage() {
  const page = document.getElementById("page-handbook");
  page.innerHTML = `
    <link rel="stylesheet" href="public/css/handbook.css?v=12" />

    <div class="hb-header">
      <button class="home-btn" onclick="window.navigateTo('dashboard')">← 홈</button>
      <h2 class="hb-title">단어장</h2>
      <p class="hb-sub">핸드북 단어 ${HANDBOOK_WORDS.length}개</p>
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
        <div class="hb-card ${isMem ? "hb-card-mem" : ""}">
          <span class="hb-card-cat">${cat}</span>
          <div class="hb-card-fr">${w.fr}</div>
          ${ph ? `<div class="hb-card-ph">${ph}</div>` : ""}
          <div class="hb-card-ko">${w.ko}</div>
          <button class="hb-mem-btn ${isMem ? "memorized" : ""}" id="hb-card-mem-btn">
            ${isMem ? "✓" : ""}
          </button>
        </div>
        <button class="hb-side-btn" id="hb-card-next" ${cardIndex >= filtered.length - 1 ? "disabled" : ""}>›</button>
      </div>
      <div class="hb-card-counter">${cardIndex + 1} / ${filtered.length}</div>
    </div>
  `;

  document.getElementById("hb-card-mem-btn").addEventListener("click", () => {
    if (memorized.has(w.fr)) memorized.delete(w.fr);
    else memorized.add(w.fr);
    saveMemorized();
    renderCardView();
  });
  document.getElementById("hb-card-prev")?.addEventListener("click", () => {
    if (cardIndex > 0) { cardIndex--; renderCardView(); }
  });
  document.getElementById("hb-card-next")?.addEventListener("click", () => {
    if (cardIndex < filtered.length - 1) { cardIndex++; renderCardView(); }
  });
}
