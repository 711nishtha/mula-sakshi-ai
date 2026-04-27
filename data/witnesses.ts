/**
 * Mūla Śākṣī — Synthetic Witness Dataset
 * 70 witness entries: varied language, noisy inputs, diverse Indian regions.
 * Used for consensus logic in Stage 2 contradiction detection.
 */

export interface WitnessEntry {
  id: string;
  alias: string;
  region: string;
  language: string;
  statement: string;
  domain: "land" | "ration" | "pension" | "tender" | "scholarship" | "health" | "employment";
  credibilityScore: number;
  corroboratesOfficial: boolean;
  noisyInput: boolean;
}

export const WITNESS_DATASET: WitnessEntry[] = [
  // ── Land Records ──────────────────────────────────────────────────────
  {
    id: "W001", alias: "Witness Alpha", region: "Mahesana, Gujarat", language: "Gujarati",
    statement: "Maro plot 247-B ni nodhani ma 2.1 acre che pan tahsildar record ma 3.5 acre dikhave che. Farq khub moto che.",
    domain: "land", credibilityScore: 0.91, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W002", alias: "Witness Beta", region: "Surat, Gujarat", language: "Hindi",
    statement: "Plot ka registration ghalat hai. Humne 2.1 acre ke liye stamp duty bhari thi, lekin government record mein 3.5 acre dikhta hai.",
    domain: "land", credibilityScore: 0.87, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W003", alias: "Witness Gamma", region: "Ahmedabad, Gujarat", language: "English",
    statement: "The land measurement in the patta clearly states 2.1 acres. The discrepancy with the registration record of 3.5 acres is suspicious and worth investigating.",
    domain: "land", credibilityScore: 0.94, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W004", alias: "Witness Delta", region: "Vadodara, Gujarat", language: "Gujarati",
    statement: "Mara padoshi nu pan aavu j thayelu. Patta alag alag aakda dikhaave che. Sarkari record ma faerfar che.",
    domain: "land", credibilityScore: 0.78, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W005", alias: "Witness Epsilon", region: "Rajkot, Gujarat", language: "Hindi",
    statement: "Land records mein bahut problems hain. 2.1 aur 3.5 acres mein 1.4 acre ka fark hai. Yeh sirf mistake nahi lag raha.",
    domain: "land", credibilityScore: 0.82, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W006", alias: "Witness Zeta", region: "Gandhinagar, Gujarat", language: "English",
    statement: "I work as a surveyor. A discrepancy of 1.4 acres cannot be a measurement error. Someone has altered the records.",
    domain: "land", credibilityScore: 0.96, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W007", alias: "Witness Eta", region: "Junagadh, Gujarat", language: "Gujarati",
    statement: "Aama tahsildar no haath che. Patel saheb na kehva pramaan aa plot ni vaav change karva ma aayi che.",
    domain: "land", credibilityScore: 0.69, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W008", alias: "Witness Theta", region: "Anand, Gujarat", language: "Hindi",
    statement: "Maine khud sub-registrar office mein dekha tha ki record mein 3.5 acres likha tha jabki maalik kehta hai 2.1 acres.",
    domain: "land", credibilityScore: 0.88, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W009", alias: "Witness Iota", region: "Bhavnagar, Gujarat", language: "English",
    statement: "Th3 p4tta d0cument sh0ws 2.1 acr3s cl3arly. R3g1strat10n 0ff1c3 rec0rd 1s w0rng.",
    domain: "land", credibilityScore: 0.55, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W010", alias: "Witness Kappa", region: "Navsari, Gujarat", language: "Gujarati",
    statement: "Plot no. 247-B nu kayadesan shu che? Government record to 3.5 acre dikhaave, parat patta 2.1 acre che. Bhrastachaar no case cho.",
    domain: "land", credibilityScore: 0.84, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W011", alias: "Witness Lambda", region: "Surat, Gujarat", language: "Hindi",
    statement: "Mujhe lagta hai government record sahi hai. 3.5 acres sahi ho sakta hai. Patta purana hai shayad.",
    domain: "land", credibilityScore: 0.72, corroboratesOfficial: true, noisyInput: false,
  },
  {
    id: "W012", alias: "Witness Mu", region: "Mehsana, Gujarat", language: "English",
    statement: "Both records can't be right. Either the patta or the registration is fraudulent. Given the builder connection, I believe the registration was inflated.",
    domain: "land", credibilityScore: 0.91, corroboratesOfficial: false, noisyInput: false,
  },

  // ── Ration/PDS ────────────────────────────────────────────────────────
  {
    id: "W013", alias: "Witness Nu", region: "Surat, Gujarat", language: "Gujarati",
    statement: "Ration card ma 25 kg chhe. Fair price shop nu register 35 kg dikhaave che. 10 kg kyaa jay che khabar nathi.",
    domain: "ration", credibilityScore: 0.89, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W014", alias: "Witness Xi", region: "Ahmedabad, Gujarat", language: "Hindi",
    statement: "PDS mein bahut bade paimane par chori ho rahi hai. Humara 25 kg allowance hai lekin shop wala 35 kg dikhata hai aur baaki black market mein bech deta hai.",
    domain: "ration", credibilityScore: 0.93, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W015", alias: "Witness Omicron", region: "Vadodara, Gujarat", language: "English",
    statement: "January 2023 tak toh grains mil rahe the. Uske baad kuch nahi aaya. Ye scheme discontinue nahi hui, yeh fraud hai.",
    domain: "ration", credibilityScore: 0.86, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W016", alias: "Witness Pi", region: "Gandhinagar, Gujarat", language: "Gujarati",
    statement: "BPL card 2018 ma aapyo hato. Hu 4 members nu card dharo chu. Government 25 kg aapvanu kahe che pan aapta nathi.",
    domain: "ration", credibilityScore: 0.77, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W017", alias: "Witness Rho", region: "Porbandar, Gujarat", language: "Hindi",
    statement: "Fair price shop ka register hamesha galat bhar ke rakha jata hai. 35 kg likhte hain aur dete hain 20-25 kg. Yeh meri aankho dekhi baat hai.",
    domain: "ration", credibilityScore: 0.90, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W018", alias: "Witness Sigma", region: "Jamnagar, Gujarat", language: "English",
    statement: "The ration allocation under BPL is 25 kg as per Food Security Act. Any record showing 35 kg is clearly falsified.",
    domain: "ration", credibilityScore: 0.95, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W019", alias: "Witness Tau", region: "Kutch, Gujarat", language: "Gujarati",
    statement: "Aa toh 10 kg nu ghaplo che. Amara bija 6 padosi pan ahu j kahe che. Saheb dhyan nathi rakhta.",
    domain: "ration", credibilityScore: 0.71, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W020", alias: "Witness Upsilon", region: "Surat, Gujarat", language: "Hindi",
    statement: "Sarkari record sahi hai. 35 kg likhna galat nahi hai. Kuch mahine extra diya gaya tha COVID ke samay.",
    domain: "ration", credibilityScore: 0.61, corroboratesOfficial: true, noisyInput: false,
  },
  {
    id: "W021", alias: "Witness Phi", region: "Rajkot, Gujarat", language: "English",
    statement: "I've filed 3 complaints with the Food Department. No action taken. The FPS owner clearly manipulates records.",
    domain: "ration", credibilityScore: 0.92, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W022", alias: "Witness Chi", region: "Amreli, Gujarat", language: "Gujarati",
    statement: "BPL na 4 log chhe amara. 25 kg j malavvu joye. 35 kg kyare pan nahi malayu.",
    domain: "ration", credibilityScore: 0.83, corroboratesOfficial: false, noisyInput: false,
  },

  // ── Pension ───────────────────────────────────────────────────────────
  {
    id: "W023", alias: "Witness Psi", region: "Rajkot, Gujarat", language: "Hindi",
    statement: "Savitaben ji ko October 2023 ke baad koi pension nahi mili. Bank account mein zero credit hai. Yeh saaf siphoning hai.",
    domain: "pension", credibilityScore: 0.94, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W024", alias: "Witness Omega", region: "Rajkot, Gujarat", language: "Gujarati",
    statement: "Savitaben mara padoshi che. October 2023 thhi pension nathi mildhi. Bank statement haji paan che.",
    domain: "pension", credibilityScore: 0.88, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W025", alias: "Witness Alpha-2", region: "Bhavnagar, Gujarat", language: "English",
    statement: "Post office says delivery confirmed but Savitaben has no bank credit. Someone is pocketing ₹1200 per month fraudulently.",
    domain: "pension", credibilityScore: 0.97, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W026", alias: "Witness Beta-2", region: "Surendranagar, Gujarat", language: "Hindi",
    statement: "Mujhe bhi 4 mahine se pension nahi mili. Ye sirf Savitaben ki problem nahi hai. Poore area mein yahi ho raha hai.",
    domain: "pension", credibilityScore: 0.86, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W027", alias: "Witness Gamma-2", region: "Rajkot, Gujarat", language: "Gujarati",
    statement: "Post office no manchaho delivery report aapo che, pan amount bank ma nathi jaatu. Aa bahu motu fraud che.",
    domain: "pension", credibilityScore: 0.91, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W028", alias: "Witness Delta-2", region: "Morbi, Gujarat", language: "English",
    statement: "P3ns10n d1sburs3m3nt sh0ws compl3te. B4nk r3c0rds sh0w n0 c0rr3sp0nd1ng cr3d1t s1nc3 0ct 2023.",
    domain: "pension", credibilityScore: 0.58, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W029", alias: "Witness Epsilon-2", region: "Rajkot, Gujarat", language: "Hindi",
    statement: "Savitaben ki DOB 12/03/1948 hai. Unhe ₹1200 milna chahiye. October 2023 ke baad nahi mila. Post office report jhooth bol rahi hai.",
    domain: "pension", credibilityScore: 0.89, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W030", alias: "Witness Zeta-2", region: "Junagadh, Gujarat", language: "English",
    statement: "Government records show pension disbursed. But the beneficiary has bank statements showing zero credit. This is clear-cut fraud.",
    domain: "pension", credibilityScore: 0.96, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W031", alias: "Witness Eta-2", region: "Rajkot, Gujarat", language: "Gujarati",
    statement: "Savitaben na dikra maara dost che. Kahu chu tame ke maa ne pension nathi mildhi. Government kehta che mal e che. Aafat che.",
    domain: "pension", credibilityScore: 0.79, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W032", alias: "Witness Theta-2", region: "Rajkot, Gujarat", language: "Hindi",
    statement: "Sarkari record sahi ho sakta hai. Bank mein delay ho sakta hai. Zaroor investigation ki zaroorat hai.",
    domain: "pension", credibilityScore: 0.64, corroboratesOfficial: true, noisyInput: false,
  },

  // ── Road/Tender ───────────────────────────────────────────────────────
  {
    id: "W033", alias: "Witness Iota-2", region: "Ahmedabad, Gujarat", language: "English",
    statement: "The CG Road tender was awarded at ₹3.8 crore. The road is still unpaved as of April 2026. ₹5.2 crore was claimed via change order. This is blatant fraud.",
    domain: "tender", credibilityScore: 0.98, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W034", alias: "Witness Kappa-2", region: "Ahmedabad, Gujarat", language: "Gujarati",
    statement: "CG Road par road nathi bani. ₹5.2 crore kharchavanu dikhavyu che, pan road to kaachi j che. Badha jowe che aa scam ne.",
    domain: "tender", credibilityScore: 0.95, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W035", alias: "Witness Lambda-2", region: "Ahmedabad, Gujarat", language: "Hindi",
    statement: "Change order March 2025 mein approve hua. Kaam December 2024 tak khatam hona tha. Na kaam hua na khatam hua. Paisa khaa liya.",
    domain: "tender", credibilityScore: 0.92, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W036", alias: "Witness Mu-2", region: "Ahmedabad, Gujarat", language: "English",
    statement: "I drive through CG Road daily. No construction visible. Completion certificate is definitely fraudulent.",
    domain: "tender", credibilityScore: 0.93, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W037", alias: "Witness Nu-2", region: "Ahmedabad, Gujarat", language: "Gujarati",
    statement: "Bharat Infra Pvt Ltd ne 3.8 crore ma contract maalyun. Pachhi 5.2 crore ni bill bharee. Road nathi bandhi. Aafat che badhane.",
    domain: "tender", credibilityScore: 0.88, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W038", alias: "Witness Xi-2", region: "Surat, Gujarat", language: "Hindi",
    statement: "Road department inspector ne galat completion certificate diya. Uska bhi haath hai is mein. ₹1.4 crore bahar gaya.",
    domain: "tender", credibilityScore: 0.84, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W039", alias: "Witness Omicron-2", region: "Gandhinagar, Gujarat", language: "English",
    statement: "The tender process for GJ-NH-2024-0078 was transparent. But the execution is clearly fraudulent based on change order dates.",
    domain: "tender", credibilityScore: 0.91, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W040", alias: "Witness Pi-2", region: "Ahmedabad, Gujarat", language: "Hindi",
    statement: "Mujhe lagta hai change order valid hai. Kaam ki quality zyada expensive thi. Shayad price sahi hai.",
    domain: "tender", credibilityScore: 0.56, corroboratesOfficial: true, noisyInput: false,
  },
  {
    id: "W041", alias: "Witness Rho-2", region: "Ahmedabad, Gujarat", language: "Gujarati",
    statement: "CG Road par road nathi, pan completion certificate maa likhu che ke road badhi gayi. Aa jhooth che saaf.",
    domain: "tender", credibilityScore: 0.90, corroboratesOfficial: false, noisyInput: false,
  },

  // ── Scholarship ───────────────────────────────────────────────────────
  {
    id: "W042", alias: "Witness Sigma-2", region: "Vadodara, Gujarat", language: "English",
    statement: "Student GJ-SC-2023-4821 Ronak Patel withdrew from the college in June 2023. Receiving ₹75,000 scholarship post-withdrawal is clear ghost beneficiary fraud.",
    domain: "scholarship", credibilityScore: 0.97, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W043", alias: "Witness Tau-2", region: "Vadodara, Gujarat", language: "Gujarati",
    statement: "Ronak Patel college chhodee gayelo June 2023 ma. Scholarship pachi kem malti? Ghost beneficiary banavyo che.",
    domain: "scholarship", credibilityScore: 0.91, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W044", alias: "Witness Upsilon-2", region: "Vadodara, Gujarat", language: "Hindi",
    statement: "Main Ronak ke saath college mein tha. Usne June 2023 mein college chhor diya. ₹75,000 scholarship uske baad aayi? Yeh possible nahi hai.",
    domain: "scholarship", credibilityScore: 0.94, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W045", alias: "Witness Phi-2", region: "Vadodara, Gujarat", language: "English",
    statement: "The education department record shows GJ-SC-2023-4821 as active beneficiary. College records show he withdrew. Cannot both be true.",
    domain: "scholarship", credibilityScore: 0.96, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W046", alias: "Witness Chi-2", region: "Vadodara, Gujarat", language: "Gujarati",
    statement: "Scholarship department ne student nu record check nahi karyu. Aa bhul che, fraud nahi. Haji janvanu che.",
    domain: "scholarship", credibilityScore: 0.65, corroboratesOfficial: true, noisyInput: false,
  },
  {
    id: "W047", alias: "Witness Psi-2", region: "Surat, Gujarat", language: "Hindi",
    statement: "SC/ST scholarship mein aise bahut cases hain jahan student nikla ho lekin scholarship chalti rahe. System mein badi khamiya hain.",
    domain: "scholarship", credibilityScore: 0.87, corroboratesOfficial: false, noisyInput: false,
  },

  // ── Health/MGNREGS/Other ──────────────────────────────────────────────
  {
    id: "W048", alias: "Witness Omega-2", region: "Kutch, Gujarat", language: "Gujarati",
    statement: "MGNREGS ma kaam karyu che 100 din. Paisa fakt 60 din no aapyo. 40 din no hisaab nathi.",
    domain: "employment", credibilityScore: 0.89, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W049", alias: "Witness Alpha-3", region: "Dahod, Gujarat", language: "Hindi",
    statement: "100 din ka rozgar kaam kiya. Sirf 60 din ki payment aayi. 40 din ka paisa kahaan gaya? Yeh MGNREGS fraud hai.",
    domain: "employment", credibilityScore: 0.88, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W050", alias: "Witness Beta-3", region: "Narmada, Gujarat", language: "English",
    statement: "MGNREGS job card shows 100 days worked. Payment released for only 60 days. 40 days payment siphoned by local contractor.",
    domain: "employment", credibilityScore: 0.93, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W051", alias: "Witness Gamma-3", region: "Valsad, Gujarat", language: "Gujarati",
    statement: "Health camp lagvo hato, pan dawai j nathi aaveli. Paisa government e aapyo dawa ni, pan dawai market ma vhechai gai.",
    domain: "health", credibilityScore: 0.86, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W052", alias: "Witness Delta-3", region: "Sabarkantha, Gujarat", language: "Hindi",
    statement: "Ration card mein naam hai lekin biometric machine par thumb print match nahi hoti. Isliye ration nahi mil raha.",
    domain: "ration", credibilityScore: 0.73, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W053", alias: "Witness Epsilon-3", region: "Panchmahal, Gujarat", language: "English",
    statement: "Mera land 0.8 acres hai. Patta mein 0.8 acres. Registration mein 1.2 acres. Koi explain nahi kar sakta yeh 0.4 acres kahan se aaye.",
    domain: "land", credibilityScore: 0.85, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W054", alias: "Witness Zeta-3", region: "Banaskantha, Gujarat", language: "Gujarati",
    statement: "Kisan sanstha ma joday ne paan aanu j jovu padyu che. Hisaab barobar nathi. Sarpanch ne kaho pan koi fark nathi paadto.",
    domain: "employment", credibilityScore: 0.74, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W055", alias: "Witness Eta-3", region: "Tapi, Gujarat", language: "Hindi",
    statement: "Pension ₹1200 hai lekin main chahta hoon ki yeh investigate ho. Meri dadi ko October 2023 ke baad kuch nahi mila.",
    domain: "pension", credibilityScore: 0.88, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W056", alias: "Witness Theta-3", region: "Mahisagar, Gujarat", language: "English",
    statement: "Th3 w1tn3ss d4t4 I h4v3 sh0ws s1m1l4r fr4ud 1n oth3r v1ll4g3s. N0t 1s0l4t3d 1nc1d3nt.",
    domain: "ration", credibilityScore: 0.52, corroboratesOfficial: false, noisyInput: true,
  },
  {
    id: "W057", alias: "Witness Iota-3", region: "Chhota Udaipur, Gujarat", language: "Gujarati",
    statement: "Tender nu kaam kharaab riite thayelu che. Material badlu vaapreyu che. Contract price yogya nathi laagtun.",
    domain: "tender", credibilityScore: 0.79, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W058", alias: "Witness Kappa-3", region: "Botad, Gujarat", language: "Hindi",
    statement: "Mujhe aisa lagta hai aap sab overthink kar rahe hain. Government records zyada reliable hote hain. Nagarik ki aadat hoti hai galat yaad rakhna.",
    domain: "land", credibilityScore: 0.48, corroboratesOfficial: true, noisyInput: false,
  },
  {
    id: "W059", alias: "Witness Lambda-3", region: "Aravalli, Gujarat", language: "English",
    statement: "I'm a retired IAS officer. The pattern described is consistent with systemic fraud in rural land records. Requires CBI investigation.",
    domain: "land", credibilityScore: 0.99, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W060", alias: "Witness Mu-3", region: "Kheda, Gujarat", language: "Gujarati",
    statement: "Hu lawyer chu. Aam dosto ma fair price shop na record 10 kg vadhaara dikhave che. Sarkari record sathe match nathi thatu. Fraud ni shankha che.",
    domain: "ration", credibilityScore: 0.93, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W061", alias: "Witness Nu-3", region: "Gir Somnath, Gujarat", language: "Hindi",
    statement: "Scholarship disbursement date September 2023 hai. Student ne June 2023 mein hi admission cancel kiya tha. Teen mahine baad paisa kaise mila?",
    domain: "scholarship", credibilityScore: 0.92, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W062", alias: "Witness Xi-3", region: "Devbhoomi Dwarka, Gujarat", language: "English",
    statement: "Road work was supposed to complete December 2024. Change order extended it with extra ₹1.4 crore. Road is still incomplete in April 2026.",
    domain: "tender", credibilityScore: 0.95, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W063", alias: "Witness Omicron-3", region: "Porbandar, Gujarat", language: "Gujarati",
    statement: "Government scheme bandh thaya ni vaato karev chu naahi. Scheme active che pan FPS owner rooth che.",
    domain: "ration", credibilityScore: 0.80, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W064", alias: "Witness Pi-3", region: "Morbi, Gujarat", language: "Hindi",
    statement: "BPL card ka renewal 2018 mein hua tha. 4 members hain. 25 kg allocation sahi hai. Fair price shop galat record rakh rahi hai.",
    domain: "ration", credibilityScore: 0.87, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W065", alias: "Witness Rho-3", region: "Anand, Gujarat", language: "English",
    statement: "The witness statements paint a clear picture. 12 out of 15 similar cases in this district show PDS diversion of 8-15kg per family.",
    domain: "ration", credibilityScore: 0.96, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W066", alias: "Witness Sigma-3", region: "Navsari, Gujarat", language: "Gujarati",
    statement: "Maro MGNREGS job card no. GJ-DH-2023-1147. 100 din no kaam dikhavyu, fakt 60 din ni payment maali. 40 din no paisa contractor rakhee gaayo.",
    domain: "employment", credibilityScore: 0.90, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W067", alias: "Witness Tau-3", region: "Valsad, Gujarat", language: "Hindi",
    statement: "Job card mein 100 din likhe hain. Mere account mein 60 din ka hi paisa aaya. Contractor ko shikayat ki toh unhone dhamki di.",
    domain: "employment", credibilityScore: 0.88, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W068", alias: "Witness Upsilon-3", region: "Dahod, Gujarat", language: "English",
    statement: "MGNREGS fraud is systematic here. Contractors inflate days worked and pocket the difference. This needs district collector's attention.",
    domain: "employment", credibilityScore: 0.94, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W069", alias: "Witness Phi-3", region: "Tapi, Gujarat", language: "Gujarati",
    statement: "Dava na camp ma sarkari record dikhave che ke 500 logo ne dawa malee. Pan hu pachhi gayo hato — 200 j log aavya hata.",
    domain: "health", credibilityScore: 0.85, corroboratesOfficial: false, noisyInput: false,
  },
  {
    id: "W070", alias: "Witness Chi-3", region: "Narmada, Gujarat", language: "English",
    statement: "Health camp records show 500 beneficiaries. Actual count was 200. 300 ghost beneficiaries created to divert medicine allocation.",
    domain: "health", credibilityScore: 0.93, corroboratesOfficial: false, noisyInput: false,
  },
];

// ─── Consensus helper ─────────────────────────────────────────────────────────

export function computeWitnessConsensus(
  domain: WitnessEntry["domain"],
  claimContent: string
): { consensusScore: number; supportingCount: number; totalRelevant: number; topWitnesses: WitnessEntry[] } {
  const relevant = WITNESS_DATASET.filter((w) => w.domain === domain && !w.noisyInput);
  const supporting = relevant.filter((w) => !w.corroboratesOfficial);
  const avgCredibility =
    supporting.reduce((sum, w) => sum + w.credibilityScore, 0) / (supporting.length || 1);

  return {
    consensusScore: Math.round(avgCredibility * 100),
    supportingCount: supporting.length,
    totalRelevant: relevant.length,
    topWitnesses: supporting.sort((a, b) => b.credibilityScore - a.credibilityScore).slice(0, 3),
  };
}
