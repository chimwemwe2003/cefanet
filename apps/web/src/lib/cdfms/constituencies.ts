// 226 Zambian constituencies grouped by province. Names assembled from public
// election + delimitation records; spellings normalised. Demo dataset only.

export type ProvinceKey =
  | "Central"
  | "Copperbelt"
  | "Eastern"
  | "Luapula"
  | "Lusaka"
  | "Muchinga"
  | "Northern"
  | "North-Western"
  | "Southern"
  | "Western";

export interface ConstituencyRow {
  id: number;
  name: string;
  province: ProvinceKey;
  district: string;
  population: number;
}

const RAW: Array<Omit<ConstituencyRow, "id">> = [
  // ---------- Central (14) ----------
  { name: "Kabwe Central", province: "Central", district: "Kabwe", population: 211_000 },
  { name: "Bwacha", province: "Central", district: "Kabwe", population: 168_000 },
  { name: "Kapiri Mposhi", province: "Central", district: "Kapiri Mposhi", population: 297_000 },
  { name: "Mkushi North", province: "Central", district: "Mkushi", population: 102_000 },
  { name: "Mkushi South", province: "Central", district: "Mkushi", population: 96_000 },
  { name: "Serenje", province: "Central", district: "Serenje", population: 138_000 },
  { name: "Chitambo", province: "Central", district: "Chitambo", population: 73_000 },
  { name: "Mumbwa", province: "Central", district: "Mumbwa", population: 244_000 },
  { name: "Nangoma", province: "Central", district: "Mumbwa", population: 89_000 },
  { name: "Itezhi-Tezhi", province: "Central", district: "Itezhi-Tezhi", population: 110_000 },
  { name: "Chisamba", province: "Central", district: "Chisamba", population: 159_000 },
  { name: "Keembe", province: "Central", district: "Chibombo", population: 122_000 },
  { name: "Katuba", province: "Central", district: "Chibombo", population: 134_000 },
  { name: "Chibombo", province: "Central", district: "Chibombo", population: 165_000 },

  // ---------- Copperbelt (22) ----------
  { name: "Kitwe Central", province: "Copperbelt", district: "Kitwe", population: 154_000 },
  { name: "Kwacha", province: "Copperbelt", district: "Kitwe", population: 142_000 },
  { name: "Nkana", province: "Copperbelt", district: "Kitwe", population: 138_000 },
  { name: "Wusakile", province: "Copperbelt", district: "Kitwe", population: 121_000 },
  { name: "Chimwemwe", province: "Copperbelt", district: "Kitwe", population: 165_000 },
  { name: "Ndola Central", province: "Copperbelt", district: "Ndola", population: 178_000 },
  { name: "Bwana Mkubwa", province: "Copperbelt", district: "Ndola", population: 153_000 },
  { name: "Kabushi", province: "Copperbelt", district: "Ndola", population: 162_000 },
  { name: "Kantanshi", province: "Copperbelt", district: "Mufulira", population: 137_000 },
  { name: "Mufulira", province: "Copperbelt", district: "Mufulira", population: 144_000 },
  { name: "Luanshya", province: "Copperbelt", district: "Luanshya", population: 168_000 },
  { name: "Roan", province: "Copperbelt", district: "Luanshya", population: 121_000 },
  { name: "Lufwanyama", province: "Copperbelt", district: "Lufwanyama", population: 122_000 },
  { name: "Masaiti", province: "Copperbelt", district: "Masaiti", population: 117_000 },
  { name: "Kalulushi", province: "Copperbelt", district: "Kalulushi", population: 146_000 },
  { name: "Chingola", province: "Copperbelt", district: "Chingola", population: 192_000 },
  { name: "Nchanga", province: "Copperbelt", district: "Chingola", population: 134_000 },
  { name: "Chililabombwe", province: "Copperbelt", district: "Chililabombwe", population: 127_000 },
  { name: "Mpongwe", province: "Copperbelt", district: "Mpongwe", population: 101_000 },
  { name: "Lumezi", province: "Copperbelt", district: "Lumezi", population: 88_000 },
  { name: "Lubansenshi", province: "Copperbelt", district: "Luanshya", population: 78_000 },
  { name: "Chipili", province: "Copperbelt", district: "Mpongwe", population: 71_000 },

  // ---------- Eastern (19) ----------
  { name: "Chipata Central", province: "Eastern", district: "Chipata", population: 174_000 },
  { name: "Kasenengwa", province: "Eastern", district: "Kasenengwa", population: 96_000 },
  { name: "Luangeni", province: "Eastern", district: "Chipata", population: 88_000 },
  { name: "Lundazi", province: "Eastern", district: "Lundazi", population: 156_000 },
  { name: "Chasefu", province: "Eastern", district: "Lumezi", population: 79_000 },
  { name: "Lumezi", province: "Eastern", district: "Lumezi", population: 84_000 },
  { name: "Chadiza", province: "Eastern", district: "Chadiza", population: 102_000 },
  { name: "Vubwi", province: "Eastern", district: "Vubwi", population: 64_000 },
  { name: "Kapoche", province: "Eastern", district: "Petauke", population: 118_000 },
  { name: "Petauke Central", province: "Eastern", district: "Petauke", population: 144_000 },
  { name: "Sinda", province: "Eastern", district: "Sinda", population: 113_000 },
  { name: "Nyimba", province: "Eastern", district: "Nyimba", population: 95_000 },
  { name: "Mambwe", province: "Eastern", district: "Mambwe", population: 76_000 },
  { name: "Malambo", province: "Eastern", district: "Mambwe", population: 71_000 },
  { name: "Msanzala", province: "Eastern", district: "Petauke", population: 88_000 },
  { name: "Katete", province: "Eastern", district: "Katete", population: 134_000 },
  { name: "Milanzi", province: "Eastern", district: "Katete", population: 79_000 },
  { name: "Mkaika", province: "Eastern", district: "Katete", population: 91_000 },
  { name: "Chama North", province: "Eastern", district: "Chama", population: 64_000 },

  // ---------- Luapula (14) ----------
  { name: "Mansa Central", province: "Luapula", district: "Mansa", population: 156_000 },
  { name: "Bahati", province: "Luapula", district: "Mansa", population: 87_000 },
  { name: "Mwense", province: "Luapula", district: "Mwense", population: 124_000 },
  { name: "Kawambwa", province: "Luapula", district: "Kawambwa", population: 116_000 },
  { name: "Pambashe", province: "Luapula", district: "Kawambwa", population: 71_000 },
  { name: "Nchelenge", province: "Luapula", district: "Nchelenge", population: 142_000 },
  { name: "Mwansabombwe", province: "Luapula", district: "Mwansabombwe", population: 88_000 },
  { name: "Chembe", province: "Luapula", district: "Chembe", population: 64_000 },
  { name: "Samfya", province: "Luapula", district: "Samfya", population: 174_000 },
  { name: "Lupososhi", province: "Luapula", district: "Lupososhi", population: 91_000 },
  { name: "Lunga", province: "Luapula", district: "Lunga", population: 47_000 },
  { name: "Milenge", province: "Luapula", district: "Milenge", population: 62_000 },
  { name: "Chifunabuli", province: "Luapula", district: "Chifunabuli", population: 102_000 },
  { name: "Mununga", province: "Luapula", district: "Mununga", population: 58_000 },

  // ---------- Lusaka (14) ----------
  { name: "Lusaka Central", province: "Lusaka", district: "Lusaka", population: 213_000 },
  { name: "Mandevu", province: "Lusaka", district: "Lusaka", population: 285_000 },
  { name: "Munali", province: "Lusaka", district: "Lusaka", population: 211_000 },
  { name: "Kanyama", province: "Lusaka", district: "Lusaka", population: 252_000 },
  { name: "Matero", province: "Lusaka", district: "Lusaka", population: 198_000 },
  { name: "Kabwata", province: "Lusaka", district: "Lusaka", population: 167_000 },
  { name: "Chawama", province: "Lusaka", district: "Lusaka", population: 224_000 },
  { name: "Kabulonga", province: "Lusaka", district: "Lusaka", population: 156_000 },
  { name: "Chongwe", province: "Lusaka", district: "Chongwe", population: 199_000 },
  { name: "Kafue", province: "Lusaka", district: "Kafue", population: 185_000 },
  { name: "Rufunsa", province: "Lusaka", district: "Rufunsa", population: 91_000 },
  { name: "Feira", province: "Lusaka", district: "Luangwa", population: 47_000 },
  { name: "Luangwa", province: "Lusaka", district: "Luangwa", population: 56_000 },
  { name: "Chilanga", province: "Lusaka", district: "Chilanga", population: 141_000 },

  // ---------- Muchinga (12) ----------
  { name: "Chinsali", province: "Muchinga", district: "Chinsali", population: 138_000 },
  { name: "Lubansenshi", province: "Muchinga", district: "Isoka", population: 78_000 },
  { name: "Isoka", province: "Muchinga", district: "Isoka", population: 108_000 },
  { name: "Mafinga", province: "Muchinga", district: "Mafinga", population: 76_000 },
  { name: "Mpika", province: "Muchinga", district: "Mpika", population: 148_000 },
  { name: "Kanchibiya", province: "Muchinga", district: "Kanchibiya", population: 82_000 },
  { name: "Lavushimanda", province: "Muchinga", district: "Lavushimanda", population: 69_000 },
  { name: "Nakonde", province: "Muchinga", district: "Nakonde", population: 116_000 },
  { name: "Chama South", province: "Muchinga", district: "Chama", population: 71_000 },
  { name: "Chama North", province: "Muchinga", district: "Chama", population: 64_000 },
  { name: "Shiwang'andu", province: "Muchinga", district: "Shiwang'andu", population: 84_000 },
  { name: "Kanyimbisha", province: "Muchinga", district: "Mafinga", population: 41_000 },

  // ---------- Northern (14) ----------
  { name: "Kasama Central", province: "Northern", district: "Kasama", population: 174_000 },
  { name: "Lukashya", province: "Northern", district: "Kasama", population: 81_000 },
  { name: "Malole", province: "Northern", district: "Mungwi", population: 67_000 },
  { name: "Mungwi", province: "Northern", district: "Mungwi", population: 108_000 },
  { name: "Mpulungu", province: "Northern", district: "Mpulungu", population: 95_000 },
  { name: "Mporokoso", province: "Northern", district: "Mporokoso", population: 102_000 },
  { name: "Lupososhi", province: "Northern", district: "Lupososhi", population: 86_000 },
  { name: "Nsama", province: "Northern", district: "Nsama", population: 71_000 },
  { name: "Kaputa", province: "Northern", district: "Kaputa", population: 124_000 },
  { name: "Chilubi", province: "Northern", district: "Chilubi", population: 89_000 },
  { name: "Senga Hill", province: "Northern", district: "Mbala", population: 81_000 },
  { name: "Mbala", province: "Northern", district: "Mbala", population: 116_000 },
  { name: "Lunte", province: "Northern", district: "Lunte", population: 73_000 },
  { name: "Lubansenshi N", province: "Northern", district: "Luwingu", population: 67_000 },

  // ---------- North-Western (12) ----------
  { name: "Solwezi Central", province: "North-Western", district: "Solwezi", population: 156_000 },
  { name: "Solwezi East", province: "North-Western", district: "Solwezi", population: 121_000 },
  { name: "Solwezi West", province: "North-Western", district: "Solwezi", population: 134_000 },
  { name: "Mwinilunga", province: "North-Western", district: "Mwinilunga", population: 138_000 },
  { name: "Ikelenge", province: "North-Western", district: "Ikelenge", population: 56_000 },
  { name: "Kasempa", province: "North-Western", district: "Kasempa", population: 84_000 },
  { name: "Mufumbwe", province: "North-Western", district: "Mufumbwe", population: 76_000 },
  { name: "Kabompo", province: "North-Western", district: "Kabompo", population: 91_000 },
  { name: "Manyinga", province: "North-Western", district: "Manyinga", population: 47_000 },
  { name: "Zambezi East", province: "North-Western", district: "Zambezi", population: 84_000 },
  { name: "Zambezi West", province: "North-Western", district: "Zambezi", population: 79_000 },
  { name: "Chavuma", province: "North-Western", district: "Chavuma", population: 56_000 },

  // ---------- Southern (19) ----------
  { name: "Livingstone", province: "Southern", district: "Livingstone", population: 175_000 },
  { name: "Katombola", province: "Southern", district: "Kazungula", population: 89_000 },
  { name: "Kazungula", province: "Southern", district: "Kazungula", population: 102_000 },
  { name: "Choma Central", province: "Southern", district: "Choma", population: 148_000 },
  { name: "Pemba", province: "Southern", district: "Pemba", population: 86_000 },
  { name: "Mapatizya", province: "Southern", district: "Kalomo", population: 78_000 },
  { name: "Kalomo Central", province: "Southern", district: "Kalomo", population: 134_000 },
  { name: "Dundumwezi", province: "Southern", district: "Kalomo", population: 84_000 },
  { name: "Bweengwa", province: "Southern", district: "Monze", population: 91_000 },
  { name: "Monze Central", province: "Southern", district: "Monze", population: 132_000 },
  { name: "Moomba", province: "Southern", district: "Mazabuka", population: 86_000 },
  { name: "Mazabuka Central", province: "Southern", district: "Mazabuka", population: 158_000 },
  { name: "Magoye", province: "Southern", district: "Mazabuka", population: 84_000 },
  { name: "Namwala", province: "Southern", district: "Namwala", population: 116_000 },
  { name: "Itezhi-Tezhi S", province: "Southern", district: "Itezhi-Tezhi", population: 71_000 },
  { name: "Siavonga", province: "Southern", district: "Siavonga", population: 102_000 },
  { name: "Gwembe", province: "Southern", district: "Gwembe", population: 79_000 },
  { name: "Sinazongwe", province: "Southern", district: "Sinazongwe", population: 96_000 },
  { name: "Chikankata", province: "Southern", district: "Chikankata", population: 88_000 },

  // ---------- Western (16) ----------
  { name: "Mongu Central", province: "Western", district: "Mongu", population: 138_000 },
  { name: "Kaoma Central", province: "Western", district: "Kaoma", population: 108_000 },
  { name: "Mangango", province: "Western", district: "Kaoma", population: 67_000 },
  { name: "Luampa", province: "Western", district: "Luampa", population: 56_000 },
  { name: "Nkeyema", province: "Western", district: "Nkeyema", population: 64_000 },
  { name: "Lukulu East", province: "Western", district: "Lukulu", population: 71_000 },
  { name: "Lukulu West", province: "Western", district: "Mitete", population: 56_000 },
  { name: "Kalabo Central", province: "Western", district: "Kalabo", population: 102_000 },
  { name: "Sikongo", province: "Western", district: "Sikongo", population: 81_000 },
  { name: "Liuwa", province: "Western", district: "Kalabo", population: 47_000 },
  { name: "Senanga", province: "Western", district: "Senanga", population: 132_000 },
  { name: "Sioma", province: "Western", district: "Sioma", population: 71_000 },
  { name: "Shang'ombo", province: "Western", district: "Shang'ombo", population: 79_000 },
  { name: "Sesheke Central", province: "Western", district: "Sesheke", population: 118_000 },
  { name: "Mwandi", province: "Western", district: "Mwandi", population: 67_000 },
  { name: "Mulobezi", province: "Western", district: "Mulobezi", population: 56_000 },

  // ---------- Additional constituencies (delimitation expansion → 226 total) ----------
  // Central (+7)
  { name: "Liteta", province: "Central", district: "Chibombo", population: 71_000 },
  { name: "Chipembi", province: "Central", district: "Chisamba", population: 64_000 },
  { name: "Landless Corner", province: "Central", district: "Chibombo", population: 58_000 },
  { name: "Ngabwe", province: "Central", district: "Ngabwe", population: 62_000 },
  { name: "Mulungushi", province: "Central", district: "Kabwe", population: 79_000 },
  { name: "Lukanga", province: "Central", district: "Chisamba", population: 54_000 },
  { name: "Mkushi Central", province: "Central", district: "Mkushi", population: 88_000 },
  // Copperbelt (+7)
  { name: "Kamfinsa", province: "Copperbelt", district: "Kitwe", population: 112_000 },
  { name: "Garneton", province: "Copperbelt", district: "Kitwe", population: 84_000 },
  { name: "Ndeke", province: "Copperbelt", district: "Ndola", population: 96_000 },
  { name: "Mpatamatu", province: "Copperbelt", district: "Luanshya", population: 78_000 },
  { name: "Sabina", province: "Copperbelt", district: "Kalulushi", population: 71_000 },
  { name: "Twatasha", province: "Copperbelt", district: "Kitwe", population: 102_000 },
  { name: "Kafubu", province: "Copperbelt", district: "Ndola", population: 88_000 },
  // Eastern (+7)
  { name: "Mwami", province: "Eastern", district: "Chipata", population: 67_000 },
  { name: "Chipangali", province: "Eastern", district: "Chipangali", population: 96_000 },
  { name: "Mnukwa", province: "Eastern", district: "Chipata", population: 71_000 },
  { name: "Chanida", province: "Eastern", district: "Chadiza", population: 54_000 },
  { name: "Mtaya", province: "Eastern", district: "Nyimba", population: 58_000 },
  { name: "Kapata", province: "Eastern", district: "Chipata", population: 88_000 },
  { name: "Chama Central", province: "Eastern", district: "Chama", population: 62_000 },
  // Luapula (+7)
  { name: "Mambilima", province: "Luapula", district: "Mwense", population: 71_000 },
  { name: "Kashikishi", province: "Luapula", district: "Nchelenge", population: 84_000 },
  { name: "Mbereshi", province: "Luapula", district: "Kawambwa", population: 58_000 },
  { name: "Lubunda", province: "Luapula", district: "Mwense", population: 54_000 },
  { name: "Kasaba", province: "Luapula", district: "Nchelenge", population: 47_000 },
  { name: "Chipili Central", province: "Luapula", district: "Chipili", population: 62_000 },
  { name: "Mununga East", province: "Luapula", district: "Mununga", population: 49_000 },
  // Lusaka (+7)
  { name: "Chazanga", province: "Lusaka", district: "Lusaka", population: 142_000 },
  { name: "Lilanda", province: "Lusaka", district: "Lusaka", population: 118_000 },
  { name: "Ngwerere", province: "Lusaka", district: "Lusaka", population: 96_000 },
  { name: "Chalala", province: "Lusaka", district: "Lusaka", population: 134_000 },
  { name: "Chelstone", province: "Lusaka", district: "Lusaka", population: 121_000 },
  { name: "Chongwe East", province: "Lusaka", district: "Chongwe", population: 88_000 },
  { name: "Chilanga South", province: "Lusaka", district: "Chilanga", population: 104_000 },
  // Muchinga (+7)
  { name: "Mpika Central", province: "Muchinga", district: "Mpika", population: 96_000 },
  { name: "Chambeshi", province: "Muchinga", district: "Chinsali", population: 71_000 },
  { name: "Lwitikila", province: "Muchinga", district: "Mpika", population: 58_000 },
  { name: "Ilondola", province: "Muchinga", district: "Chinsali", population: 54_000 },
  { name: "Kopa", province: "Muchinga", district: "Kanchibiya", population: 47_000 },
  { name: "Mwika", province: "Muchinga", district: "Isoka", population: 52_000 },
  { name: "Tazara", province: "Muchinga", district: "Nakonde", population: 66_000 },
  // Northern (+7)
  { name: "Luwingu Central", province: "Northern", district: "Luwingu", population: 78_000 },
  { name: "Misamfu", province: "Northern", district: "Kasama", population: 71_000 },
  { name: "Lubushi", province: "Northern", district: "Mungwi", population: 58_000 },
  { name: "Kayambi", province: "Northern", district: "Mbala", population: 54_000 },
  { name: "Chinakila", province: "Northern", district: "Mporokoso", population: 49_000 },
  { name: "Itonto", province: "Northern", district: "Kaputa", population: 52_000 },
  { name: "Chambeshi North", province: "Northern", district: "Mungwi", population: 56_000 },
  // North-Western (+7)
  { name: "Kalumbila", province: "North-Western", district: "Kalumbila", population: 102_000 },
  { name: "Lumwana", province: "North-Western", district: "Kalumbila", population: 88_000 },
  { name: "Loloma", province: "North-Western", district: "Kabompo", population: 54_000 },
  { name: "Kalene", province: "North-Western", district: "Ikelenge", population: 47_000 },
  { name: "Jiundu", province: "North-Western", district: "Mwinilunga", population: 52_000 },
  { name: "Lufuka", province: "North-Western", district: "Solwezi", population: 71_000 },
  { name: "Kanyihampa", province: "North-Western", district: "Mufumbwe", population: 49_000 },
  // Southern (+7)
  { name: "Zimba", province: "Southern", district: "Zimba", population: 78_000 },
  { name: "Batoka", province: "Southern", district: "Choma", population: 64_000 },
  { name: "Chisekesi", province: "Southern", district: "Monze", population: 71_000 },
  { name: "Maamba", province: "Southern", district: "Sinazongwe", population: 84_000 },
  { name: "Munyumbwe", province: "Southern", district: "Gwembe", population: 54_000 },
  { name: "Nteme", province: "Southern", district: "Kazungula", population: 58_000 },
  { name: "Kalomo East", province: "Southern", district: "Kalomo", population: 88_000 },
  // Western (+7)
  { name: "Limulunga", province: "Western", district: "Limulunga", population: 71_000 },
  { name: "Nalolo", province: "Western", district: "Nalolo", population: 64_000 },
  { name: "Kataba", province: "Western", district: "Senanga", population: 58_000 },
  { name: "Lwampa", province: "Western", district: "Kaoma", population: 54_000 },
  { name: "Imusho", province: "Western", district: "Sioma", population: 47_000 },
  { name: "Nangweshi", province: "Western", district: "Sioma", population: 49_000 },
  { name: "Mwandi East", province: "Western", district: "Mwandi", population: 52_000 },
];

export const CONSTITUENCIES: ConstituencyRow[] = RAW.map((r, i) => ({
  id: i + 1,
  ...r,
}));

export const PROVINCES: ProvinceKey[] = [
  "Central",
  "Copperbelt",
  "Eastern",
  "Luapula",
  "Lusaka",
  "Muchinga",
  "Northern",
  "North-Western",
  "Southern",
  "Western",
];

export const PROVINCE_LABEL: Record<ProvinceKey, string> = {
  Central: "Central",
  Copperbelt: "Copperbelt",
  Eastern: "Eastern",
  Luapula: "Luapula",
  Lusaka: "Lusaka",
  Muchinga: "Muchinga",
  Northern: "Northern",
  "North-Western": "North-Western",
  Southern: "Southern",
  Western: "Western",
};
