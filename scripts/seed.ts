/**
 * CEFANET Digital Notice Board — seed script
 * Run with: npm run seed
 */
import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(__dirname, "../.env") });

import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  constituencies,
  users,
  projects,
  projectUpdates,
  fundDisbursements,
  expenditureLines,
  bursaries,
  beneficiaries,
  alerts,
} from "@cefanet/db";
import type {
  NewProject,
  NewBeneficiary,
  NewExpenditureLine,
} from "@cefanet/db";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://cefanet:cefanet@localhost:5432/cefanet_dnb";

type Category = "infrastructure" | "education" | "health" | "empowerment" | "bursaries";
type Status = "planned" | "ongoing" | "complete" | "stalled";

interface ConstituencySeed {
  name: string;
  province: string;
  district: string;
  population: number;
  centerLat: number;
  centerLng: number;
}

interface ProjectSeed {
  name: string;
  category: Category;
  status: Status;
  budget: number;
  expenditure: number;
  completionPct: number;
  contractor: string;
  startDate: string;
  endDate: string;
  description: string;
  latOffset: number;
  lngOffset: number;
}

const CONSTITUENCIES: ConstituencySeed[] = [
  {
    name: "Lusaka Central",
    province: "Lusaka",
    district: "Lusaka",
    population: 213000,
    centerLat: -15.4167,
    centerLng: 28.2833,
  },
  {
    name: "Mandevu",
    province: "Lusaka",
    district: "Lusaka",
    population: 285000,
    centerLat: -15.3650,
    centerLng: 28.3200,
  },
  {
    name: "Kabulonga",
    province: "Lusaka",
    district: "Lusaka",
    population: 156000,
    centerLat: -15.4150,
    centerLng: 28.3400,
  },
  {
    name: "Kabwe Central",
    province: "Central",
    district: "Kabwe",
    population: 198000,
    centerLat: -14.4469,
    centerLng: 28.4464,
  },
  {
    name: "Livingstone",
    province: "Southern",
    district: "Livingstone",
    population: 175000,
    centerLat: -17.8419,
    centerLng: 25.8543,
  },
];

const PROJECT_TEMPLATES: Record<string, ProjectSeed[]> = {
  "Lusaka Central": [
    {
      name: "Matero Road Rehabilitation Phase 2",
      category: "infrastructure",
      status: "ongoing",
      budget: 7500000,
      expenditure: 4125000,
      completionPct: 55,
      contractor: "Zambezi Construction Ltd",
      startDate: "2025-08-15",
      endDate: "2026-09-30",
      description: "Resurfacing of 12km of feeder roads connecting Matero to Lusaka CBD.",
      latOffset: 0.012,
      lngOffset: -0.008,
    },
    {
      name: "Kalingalinga Health Post Expansion",
      category: "health",
      status: "complete",
      budget: 2200000,
      expenditure: 2150000,
      completionPct: 100,
      contractor: "Mwamba Builders",
      startDate: "2025-02-01",
      endDate: "2025-11-20",
      description: "Construction of maternity wing and pharmacy block.",
      latOffset: -0.005,
      lngOffset: 0.011,
    },
    {
      name: "Ng'ombe Basic School Block Construction",
      category: "education",
      status: "ongoing",
      budget: 3800000,
      expenditure: 2280000,
      completionPct: 60,
      contractor: "Lusaka Civil Works",
      startDate: "2025-05-10",
      endDate: "2026-04-15",
      description: "1x4 classroom block with ablution facilities for 240 learners.",
      latOffset: 0.018,
      lngOffset: 0.015,
    },
    {
      name: "Chibolya Youth Skills Centre",
      category: "empowerment",
      status: "stalled",
      budget: 1800000,
      expenditure: 540000,
      completionPct: 30,
      contractor: "Chongwe Holdings",
      startDate: "2024-11-01",
      endDate: "2025-08-30",
      description: "Vocational training centre offering tailoring, welding, ICT.",
      latOffset: -0.014,
      lngOffset: -0.012,
    },
    {
      name: "Kanyama Drainage Improvement",
      category: "infrastructure",
      status: "stalled",
      budget: 4200000,
      expenditure: 840000,
      completionPct: 20,
      contractor: "Drainage Solutions Zm",
      startDate: "2024-09-15",
      endDate: "2025-09-30",
      description: "Storm-water drainage to reduce annual flooding in Kanyama compound.",
      latOffset: -0.022,
      lngOffset: -0.018,
    },
    {
      name: "Lusaka Central Bursary Programme 2026",
      category: "bursaries",
      status: "ongoing",
      budget: 2500000,
      expenditure: 1250000,
      completionPct: 50,
      contractor: "MoE / CEFANET",
      startDate: "2026-01-15",
      endDate: "2026-12-15",
      description: "Tertiary and secondary school bursaries for vulnerable learners.",
      latOffset: 0.004,
      lngOffset: 0.003,
    },
    {
      name: "Mtendere Market Refurbishment",
      category: "infrastructure",
      status: "complete",
      budget: 1900000,
      expenditure: 1880000,
      completionPct: 100,
      contractor: "Urban Renewal Ltd",
      startDate: "2024-08-01",
      endDate: "2025-06-30",
      description: "Roofing, electrification and sanitation upgrade for traders.",
      latOffset: 0.008,
      lngOffset: 0.018,
    },
    {
      name: "Bauleni Women Co-op Grant",
      category: "empowerment",
      status: "ongoing",
      budget: 900000,
      expenditure: 720000,
      completionPct: 80,
      contractor: "Bauleni Women Co-op",
      startDate: "2025-03-01",
      endDate: "2026-02-28",
      description: "Capital injection for women-led tailoring and food-vending co-op.",
      latOffset: -0.010,
      lngOffset: 0.020,
    },
    {
      name: "Kalingalinga Clinic Solar Power",
      category: "health",
      status: "planned",
      budget: 650000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-06-01",
      endDate: "2026-12-15",
      description: "Off-grid solar to ensure 24/7 clinic operations during load-shedding.",
      latOffset: -0.006,
      lngOffset: 0.013,
    },
    {
      name: "Kamwala South Secondary Lab Block",
      category: "education",
      status: "planned",
      budget: 3100000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-07-01",
      endDate: "2027-06-30",
      description: "Science and ICT laboratory block for 600 secondary learners.",
      latOffset: 0.014,
      lngOffset: -0.014,
    },
  ],
  Mandevu: [
    {
      name: "Mandevu Township Road Upgrade",
      category: "infrastructure",
      status: "ongoing",
      budget: 6800000,
      expenditure: 3060000,
      completionPct: 45,
      contractor: "Kafue Roads Co.",
      startDate: "2025-07-01",
      endDate: "2026-08-15",
      description: "Tarring of 8km of inner Mandevu access roads.",
      latOffset: 0.010,
      lngOffset: 0.012,
    },
    {
      name: "Mandevu First-Level Hospital Wing",
      category: "health",
      status: "ongoing",
      budget: 7200000,
      expenditure: 4320000,
      completionPct: 60,
      contractor: "Health Builders Zm",
      startDate: "2025-03-15",
      endDate: "2026-09-30",
      description: "New 60-bed inpatient wing including pediatric ward.",
      latOffset: -0.008,
      lngOffset: 0.005,
    },
    {
      name: "Garden Compound Primary School Renovation",
      category: "education",
      status: "complete",
      budget: 1800000,
      expenditure: 1750000,
      completionPct: 100,
      contractor: "Northstar Construction",
      startDate: "2024-09-01",
      endDate: "2025-05-30",
      description: "Renovation of 12 classrooms, new desks and library.",
      latOffset: 0.015,
      lngOffset: -0.010,
    },
    {
      name: "Mandevu Youth ICT Hub",
      category: "empowerment",
      status: "stalled",
      budget: 2100000,
      expenditure: 525000,
      completionPct: 25,
      contractor: "Tech4Youth Zm",
      startDate: "2024-12-01",
      endDate: "2025-10-31",
      description: "Free ICT and digital-skills hub for unemployed youth.",
      latOffset: -0.012,
      lngOffset: -0.015,
    },
    {
      name: "Chipata Compound Water Reticulation",
      category: "infrastructure",
      status: "stalled",
      budget: 5400000,
      expenditure: 1620000,
      completionPct: 30,
      contractor: "WaterAid Zm",
      startDate: "2024-10-15",
      endDate: "2025-12-15",
      description: "Mains water pipeline serving 1,200 households.",
      latOffset: 0.020,
      lngOffset: -0.005,
    },
    {
      name: "Mandevu Bursary Programme 2026",
      category: "bursaries",
      status: "ongoing",
      budget: 2200000,
      expenditure: 1100000,
      completionPct: 50,
      contractor: "MoE / CEFANET",
      startDate: "2026-01-15",
      endDate: "2026-12-15",
      description: "Bursaries for 320 learners across all levels.",
      latOffset: 0.002,
      lngOffset: 0.001,
    },
    {
      name: "Mandevu Police Post Construction",
      category: "infrastructure",
      status: "complete",
      budget: 1400000,
      expenditure: 1380000,
      completionPct: 100,
      contractor: "Heritage Builders",
      startDate: "2024-07-01",
      endDate: "2025-04-30",
      description: "Community policing post with two cells and admin block.",
      latOffset: 0.005,
      lngOffset: 0.018,
    },
    {
      name: "Mandevu Empowerment Capital Pool",
      category: "empowerment",
      status: "ongoing",
      budget: 1500000,
      expenditure: 900000,
      completionPct: 60,
      contractor: "Local CBOs",
      startDate: "2025-04-01",
      endDate: "2026-03-31",
      description: "Revolving loan fund for women and youth co-ops.",
      latOffset: -0.018,
      lngOffset: 0.010,
    },
    {
      name: "Mandevu Maternity Equipment Procurement",
      category: "health",
      status: "planned",
      budget: 850000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-05-01",
      endDate: "2026-10-30",
      description: "Delivery beds, incubators, monitoring equipment.",
      latOffset: -0.004,
      lngOffset: 0.008,
    },
    {
      name: "Mandevu Skills Training Initiative",
      category: "education",
      status: "planned",
      budget: 1700000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-08-01",
      endDate: "2027-07-31",
      description: "Adult literacy and skills-training programme.",
      latOffset: 0.012,
      lngOffset: -0.018,
    },
  ],
  Kabulonga: [
    {
      name: "Leopards Hill Road Maintenance",
      category: "infrastructure",
      status: "ongoing",
      budget: 5200000,
      expenditure: 2340000,
      completionPct: 45,
      contractor: "Premier Roads",
      startDate: "2025-06-15",
      endDate: "2026-07-30",
      description: "Pothole repair and shoulder strengthening on Leopards Hill.",
      latOffset: 0.008,
      lngOffset: 0.014,
    },
    {
      name: "Kabulonga Clinic Equipment Upgrade",
      category: "health",
      status: "complete",
      budget: 1600000,
      expenditure: 1570000,
      completionPct: 100,
      contractor: "MedSupply Zm",
      startDate: "2024-10-01",
      endDate: "2025-06-30",
      description: "Diagnostic equipment, dental chair and pharmacy refit.",
      latOffset: -0.006,
      lngOffset: 0.010,
    },
    {
      name: "Woodlands Primary School ICT Lab",
      category: "education",
      status: "ongoing",
      budget: 1100000,
      expenditure: 770000,
      completionPct: 70,
      contractor: "EduTech Africa",
      startDate: "2025-04-01",
      endDate: "2026-03-30",
      description: "30-seat ICT lab with networking and projector.",
      latOffset: 0.014,
      lngOffset: -0.009,
    },
    {
      name: "Kabulonga Youth Entrepreneurship Fund",
      category: "empowerment",
      status: "stalled",
      budget: 1200000,
      expenditure: 360000,
      completionPct: 30,
      contractor: "Youth Forum Zm",
      startDate: "2024-12-15",
      endDate: "2025-11-30",
      description: "Seed-grant fund for youth-led businesses.",
      latOffset: -0.010,
      lngOffset: -0.014,
    },
    {
      name: "Ibex Hill Solid-Waste Management",
      category: "infrastructure",
      status: "stalled",
      budget: 2800000,
      expenditure: 840000,
      completionPct: 30,
      contractor: "CleanCity Ltd",
      startDate: "2024-11-01",
      endDate: "2025-10-31",
      description: "Waste-collection routes, bins and transfer station.",
      latOffset: 0.018,
      lngOffset: 0.020,
    },
    {
      name: "Kabulonga Bursary Programme 2026",
      category: "bursaries",
      status: "ongoing",
      budget: 1800000,
      expenditure: 900000,
      completionPct: 50,
      contractor: "MoE / CEFANET",
      startDate: "2026-01-15",
      endDate: "2026-12-15",
      description: "Tertiary scholarships and secondary-school fees.",
      latOffset: 0.001,
      lngOffset: 0.001,
    },
    {
      name: "Sunningdale Recreation Park",
      category: "infrastructure",
      status: "complete",
      budget: 950000,
      expenditure: 940000,
      completionPct: 100,
      contractor: "GreenSpaces Ltd",
      startDate: "2024-08-01",
      endDate: "2025-03-30",
      description: "Family park with playground and outdoor gym.",
      latOffset: 0.011,
      lngOffset: 0.005,
    },
    {
      name: "Kabulonga Women Tailoring Co-op",
      category: "empowerment",
      status: "ongoing",
      budget: 700000,
      expenditure: 560000,
      completionPct: 80,
      contractor: "Kabulonga Women SACCO",
      startDate: "2025-05-01",
      endDate: "2026-04-30",
      description: "Equipment and working-capital grant for tailoring co-op.",
      latOffset: -0.005,
      lngOffset: -0.008,
    },
    {
      name: "Kabulonga Maternal Outreach Programme",
      category: "health",
      status: "planned",
      budget: 500000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-06-01",
      endDate: "2026-12-15",
      description: "Mobile maternal-health outreach to under-served areas.",
      latOffset: -0.012,
      lngOffset: 0.012,
    },
    {
      name: "Kabulonga Secondary Lab Refurbishment",
      category: "education",
      status: "planned",
      budget: 1300000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-07-01",
      endDate: "2027-04-30",
      description: "Chemistry/biology lab refurbishment with new equipment.",
      latOffset: 0.009,
      lngOffset: -0.013,
    },
  ],
  "Kabwe Central": [
    {
      name: "Kabwe-Kapiri Mposhi Feeder Road",
      category: "infrastructure",
      status: "ongoing",
      budget: 6500000,
      expenditure: 3250000,
      completionPct: 50,
      contractor: "Central Roads Authority",
      startDate: "2025-05-01",
      endDate: "2026-08-30",
      description: "15km feeder road improvement linking rural farms to Kabwe.",
      latOffset: 0.018,
      lngOffset: 0.012,
    },
    {
      name: "Kabwe General Hospital Renovation",
      category: "health",
      status: "ongoing",
      budget: 8000000,
      expenditure: 4800000,
      completionPct: 60,
      contractor: "Health Infra Zm",
      startDate: "2025-02-15",
      endDate: "2026-12-30",
      description: "Renovation of wards, theatre, and outpatient department.",
      latOffset: -0.008,
      lngOffset: 0.005,
    },
    {
      name: "Bwacha Community Secondary School",
      category: "education",
      status: "complete",
      budget: 4200000,
      expenditure: 4150000,
      completionPct: 100,
      contractor: "Bwacha Builders",
      startDate: "2024-06-01",
      endDate: "2025-08-30",
      description: "New community secondary school for 600 learners.",
      latOffset: 0.012,
      lngOffset: -0.010,
    },
    {
      name: "Kabwe Mining Compound Youth Centre",
      category: "empowerment",
      status: "stalled",
      budget: 1700000,
      expenditure: 425000,
      completionPct: 25,
      contractor: "Mining Heritage Zm",
      startDate: "2024-10-01",
      endDate: "2025-09-30",
      description: "Skills centre serving former mining communities.",
      latOffset: -0.014,
      lngOffset: -0.012,
    },
    {
      name: "Kabwe Lead-Contamination Remediation Phase 1",
      category: "health",
      status: "stalled",
      budget: 3600000,
      expenditure: 720000,
      completionPct: 20,
      contractor: "EnviroSafe Zm",
      startDate: "2024-09-01",
      endDate: "2025-11-30",
      description: "Soil remediation in former Kabwe mining township.",
      latOffset: -0.020,
      lngOffset: -0.018,
    },
    {
      name: "Kabwe Central Bursary Programme 2026",
      category: "bursaries",
      status: "ongoing",
      budget: 2000000,
      expenditure: 1000000,
      completionPct: 50,
      contractor: "MoE / CEFANET",
      startDate: "2026-01-15",
      endDate: "2026-12-15",
      description: "Comprehensive bursary programme covering 280 learners.",
      latOffset: 0.001,
      lngOffset: 0.001,
    },
    {
      name: "Kabwe Bus Terminus Renovation",
      category: "infrastructure",
      status: "complete",
      budget: 2400000,
      expenditure: 2360000,
      completionPct: 100,
      contractor: "Terminus Builders",
      startDate: "2024-07-01",
      endDate: "2025-05-30",
      description: "Renovation of intercity bus station with ablutions.",
      latOffset: 0.006,
      lngOffset: 0.014,
    },
    {
      name: "Kabwe Farmers Co-op Inputs Grant",
      category: "empowerment",
      status: "ongoing",
      budget: 1300000,
      expenditure: 910000,
      completionPct: 70,
      contractor: "Kabwe Farmers Co-op",
      startDate: "2025-09-01",
      endDate: "2026-04-30",
      description: "Fertiliser and seed inputs for 800 smallholder farmers.",
      latOffset: 0.022,
      lngOffset: -0.015,
    },
    {
      name: "Kabwe Maternal Health Outreach",
      category: "health",
      status: "planned",
      budget: 750000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-05-15",
      endDate: "2026-12-30",
      description: "Mobile maternal-health teams for rural Kabwe.",
      latOffset: -0.011,
      lngOffset: 0.018,
    },
    {
      name: "Kabwe Vocational Centre Equipment",
      category: "education",
      status: "planned",
      budget: 1600000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-06-01",
      endDate: "2027-03-31",
      description: "Welding, carpentry and electrical training equipment.",
      latOffset: 0.016,
      lngOffset: 0.008,
    },
  ],
  Livingstone: [
    {
      name: "Mosi-oa-Tunya Road Resurfacing",
      category: "infrastructure",
      status: "ongoing",
      budget: 7800000,
      expenditure: 3900000,
      completionPct: 50,
      contractor: "Victoria Roads Ltd",
      startDate: "2025-06-01",
      endDate: "2026-10-30",
      description: "Resurfacing of tourism corridor leading to Victoria Falls.",
      latOffset: 0.015,
      lngOffset: -0.014,
    },
    {
      name: "Livingstone General Hospital ICU",
      category: "health",
      status: "ongoing",
      budget: 6900000,
      expenditure: 4485000,
      completionPct: 65,
      contractor: "Tropical Health Ltd",
      startDate: "2025-03-01",
      endDate: "2026-08-30",
      description: "8-bed ICU with oxygen plant and monitoring equipment.",
      latOffset: -0.008,
      lngOffset: 0.009,
    },
    {
      name: "Maramba Township School Block",
      category: "education",
      status: "complete",
      budget: 2900000,
      expenditure: 2870000,
      completionPct: 100,
      contractor: "Maramba Construction",
      startDate: "2024-08-01",
      endDate: "2025-07-30",
      description: "1x6 classroom block and admin office.",
      latOffset: 0.011,
      lngOffset: 0.013,
    },
    {
      name: "Livingstone Tourism Skills Hub",
      category: "empowerment",
      status: "stalled",
      budget: 2300000,
      expenditure: 575000,
      completionPct: 25,
      contractor: "Tourism Skills Zm",
      startDate: "2024-11-15",
      endDate: "2025-10-30",
      description: "Training centre for hospitality and tour-guiding.",
      latOffset: -0.014,
      lngOffset: -0.010,
    },
    {
      name: "Livingstone Stormwater Drains Phase 1",
      category: "infrastructure",
      status: "stalled",
      budget: 4900000,
      expenditure: 980000,
      completionPct: 20,
      contractor: "Drainage Solutions Zm",
      startDate: "2024-10-01",
      endDate: "2025-11-30",
      description: "Storm-water drainage for Maramba and Linda compounds.",
      latOffset: -0.018,
      lngOffset: 0.018,
    },
    {
      name: "Livingstone Bursary Programme 2026",
      category: "bursaries",
      status: "ongoing",
      budget: 1900000,
      expenditure: 950000,
      completionPct: 50,
      contractor: "MoE / CEFANET",
      startDate: "2026-01-15",
      endDate: "2026-12-15",
      description: "Bursaries for 260 vulnerable learners.",
      latOffset: 0.001,
      lngOffset: 0.001,
    },
    {
      name: "Dambwa Market Roofing",
      category: "infrastructure",
      status: "complete",
      budget: 1200000,
      expenditure: 1180000,
      completionPct: 100,
      contractor: "Dambwa Builders",
      startDate: "2024-09-01",
      endDate: "2025-05-31",
      description: "Roofing and concrete flooring for Dambwa Market.",
      latOffset: 0.006,
      lngOffset: -0.020,
    },
    {
      name: "Livingstone Women Crafts Co-op",
      category: "empowerment",
      status: "ongoing",
      budget: 800000,
      expenditure: 640000,
      completionPct: 80,
      contractor: "Livingstone Women SACCO",
      startDate: "2025-04-15",
      endDate: "2026-03-31",
      description: "Working-capital and equipment grant for crafts co-op.",
      latOffset: -0.005,
      lngOffset: 0.018,
    },
    {
      name: "Maramba Clinic Solar Power",
      category: "health",
      status: "planned",
      budget: 600000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-06-01",
      endDate: "2026-12-15",
      description: "Solar power for 24/7 clinic operations.",
      latOffset: 0.013,
      lngOffset: 0.014,
    },
    {
      name: "Livingstone Skills Bursary Top-up",
      category: "education",
      status: "planned",
      budget: 1400000,
      expenditure: 0,
      completionPct: 0,
      contractor: "TBD (tendering)",
      startDate: "2026-07-01",
      endDate: "2027-06-30",
      description: "Top-up bursaries for technical-college students.",
      latOffset: -0.009,
      lngOffset: -0.016,
    },
  ],
};

const FEMALE_NAMES = [
  "Chanda", "Mwape", "Bupe", "Mutinta", "Nchimunya", "Chileshe", "Kunda",
  "Inonge", "Towela", "Namakau", "Mwila", "Chipo", "Bwalya", "Lubona",
  "Mutale", "Natasha", "Memory", "Ireen", "Patience", "Joyce",
];

const MALE_NAMES = [
  "Mwansa", "Kapasa", "Mubita", "Choolwe", "Lukundo", "Kennedy",
  "Mukuka", "Kasonde", "Bwembya", "Mainza", "Lwando", "Pumulo",
  "Chibwe", "Kelvin", "Brian", "Felix", "Geoffrey", "Aaron",
];

const INSTITUTIONS_BY_LEVEL: Record<string, string[]> = {
  primary: [
    "Matero Primary School",
    "Ng'ombe Basic School",
    "Garden Primary School",
    "Maramba Primary School",
    "Bwacha Basic School",
  ],
  secondary: [
    "Kamwala Secondary School",
    "Lusaka Boys Secondary",
    "Hillside Girls Secondary",
    "Kabwe Boys High",
    "David Livingstone Secondary",
  ],
  tertiary: [
    "University of Zambia",
    "Copperbelt University",
    "Mulungushi University",
    "Evelyn Hone College",
    "Northern Technical College",
  ],
};

async function main(): Promise<void> {
  console.log("[seed] connecting to", DATABASE_URL);
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  console.log("[seed] clearing existing data...");
  // Order matters because of FKs
  await db.delete(alerts);
  await db.delete(beneficiaries);
  await db.delete(bursaries);
  await db.delete(expenditureLines);
  await db.delete(fundDisbursements);
  await db.delete(projectUpdates);
  await db.delete(projects);
  await db.delete(users);
  await db.delete(constituencies);

  console.log("[seed] inserting constituencies...");
  const insertedConstituencies = await db
    .insert(constituencies)
    .values(
      CONSTITUENCIES.map((c) => ({
        name: c.name,
        province: c.province,
        district: c.district,
        population: c.population,
        centerLat: c.centerLat,
        centerLng: c.centerLng,
        allocationZmw: "40000000.00",
      }))
    )
    .returning();

  const cByName = new Map(insertedConstituencies.map((c) => [c.name, c]));

  console.log("[seed] inserting users...");
  const adminHash = await bcrypt.hash("demo123", 8);
  const officerHash = await bcrypt.hash("demo123", 8);
  const lusakaCentral = cByName.get("Lusaka Central");
  if (!lusakaCentral) throw new Error("Lusaka Central not seeded");

  await db.insert(users).values([
    {
      email: "admin@cefanet.org",
      passwordHash: adminHash,
      fullName: "CEFANET Administrator",
      role: "super_admin",
      constituencyId: null,
    },
    {
      email: "officer@lusaka.gov.zm",
      passwordHash: officerHash,
      fullName: "Mwansa Banda",
      role: "district_officer",
      constituencyId: lusakaCentral.id,
    },
  ]);

  console.log("[seed] inserting projects + updates + expenditures + disbursements...");

  let beneficiaryCounter = 0;
  for (const cseed of CONSTITUENCIES) {
    const c = cByName.get(cseed.name);
    if (!c) continue;
    const templates = PROJECT_TEMPLATES[cseed.name] ?? [];

    const projectRows: NewProject[] = templates.map((p) => ({
      constituencyId: c.id,
      name: p.name,
      description: p.description,
      category: p.category,
      status: p.status,
      budgetZmw: p.budget.toFixed(2),
      expenditureZmw: p.expenditure.toFixed(2),
      completionPct: p.completionPct,
      contractor: p.contractor,
      startDate: p.startDate,
      endDate: p.endDate,
      lat: c.centerLat + p.latOffset,
      lng: c.centerLng + p.lngOffset,
    }));

    const insertedProjects = await db.insert(projects).values(projectRows).returning();

    // Project updates timeline (2-4 per project)
    for (const p of insertedProjects) {
      const updateCount = p.status === "complete" ? 4 : p.status === "ongoing" ? 3 : 2;
      const updates = [];
      for (let i = 0; i < updateCount; i++) {
        const daysAgo = (updateCount - i) * 25;
        updates.push({
          projectId: p.id,
          title:
            i === 0
              ? "Project launched"
              : i === updateCount - 1
              ? p.status === "complete"
                ? "Project completed and handed over"
                : "Latest field inspection note"
              : `Site progress update ${i}`,
          note:
            i === 0
              ? "Contract signed, mobilisation under way."
              : p.status === "stalled"
              ? "Works on site have stalled pending second tranche disbursement."
              : p.status === "complete"
              ? "Final inspection completed. Project handed over to the line ministry."
              : "Works progressing in line with revised schedule.",
          postedAt: new Date(Date.now() - daysAgo * 24 * 3600 * 1000),
          postedBy: "CEFANET Field Officer",
        });
      }
      await db.insert(projectUpdates).values(updates);
    }

    // Fund disbursements (3 tranches)
    await db.insert(fundDisbursements).values([
      {
        constituencyId: c.id,
        tranche: "Tranche 1",
        amountZmw: "15000000.00",
        disbursedAt: "2025-07-15",
        source: "Ministry of Finance",
      },
      {
        constituencyId: c.id,
        tranche: "Tranche 2",
        amountZmw: "13000000.00",
        disbursedAt: "2025-11-30",
        source: "Ministry of Finance",
      },
      {
        constituencyId: c.id,
        tranche: "Tranche 3",
        amountZmw: "12000000.00",
        disbursedAt: "2026-03-20",
        source: "Ministry of Finance",
      },
    ]);

    // Monthly expenditure trend — last 6 months (Nov 2025 to Apr 2026)
    const expenditureRows: NewExpenditureLine[] = [];
    const months = [
      "2025-11-01",
      "2025-12-01",
      "2026-01-01",
      "2026-02-01",
      "2026-03-01",
      "2026-04-01",
    ];
    const categories: Category[] = [
      "infrastructure",
      "education",
      "health",
      "empowerment",
      "bursaries",
    ];

    months.forEach((m, mi) => {
      categories.forEach((cat) => {
        // Higher amounts in earlier months to show realistic ramp
        const base = 350000 + Math.random() * 250000 + mi * 35000;
        expenditureRows.push({
          constituencyId: c.id,
          projectId: null,
          category: cat,
          amountZmw: base.toFixed(2),
          month: m,
          description: `${cat} spending`,
        });
      });
    });
    await db.insert(expenditureLines).values(expenditureRows);

    // Bursary programme
    const [bursary] = await db
      .insert(bursaries)
      .values({
        constituencyId: c.id,
        programName: `${cseed.name} Bursary Programme 2026`,
        academicYear: "2026",
        totalAllocatedZmw: "2000000.00",
      })
      .returning();

    // 18 beneficiaries per constituency, ~55% female / 45% male
    const beneficiaryRows: NewBeneficiary[] = [];
    const total = 18;
    for (let i = 0; i < total; i++) {
      beneficiaryCounter++;
      const gender: "female" | "male" = i < Math.round(total * 0.55) ? "female" : "male";
      const level: "primary" | "secondary" | "tertiary" =
        i % 3 === 0 ? "tertiary" : i % 3 === 1 ? "secondary" : "primary";
      const amount =
        level === "tertiary" ? 25000 : level === "secondary" ? 8500 : 3200;
      const status: "active" | "completed" = i % 6 === 0 ? "completed" : "active";
      const institutions = INSTITUTIONS_BY_LEVEL[level] ?? ["Local Institution"];
      beneficiaryRows.push({
        bursaryId: bursary.id,
        constituencyId: c.id,
        code: `BEN-${String(beneficiaryCounter).padStart(4, "0")}`,
        level,
        gender,
        amountZmw: amount.toFixed(2),
        status,
        institution: institutions[i % institutions.length],
      });
    }
    await db.insert(beneficiaries).values(beneficiaryRows);

    // Alerts for stalled projects
    const stalledProjects = insertedProjects.filter((p) => p.status === "stalled");
    for (const sp of stalledProjects) {
      const startDate = sp.startDate ? new Date(sp.startDate) : new Date();
      const daysOverdue = Math.max(
        30,
        Math.floor((Date.now() - startDate.getTime()) / (24 * 3600 * 1000)) - 180
      );
      const budgetAtRisk =
        parseFloat(sp.budgetZmw) - parseFloat(sp.expenditureZmw);
      await db.insert(alerts).values({
        constituencyId: c.id,
        projectId: sp.id,
        severity: daysOverdue > 180 ? "critical" : "warning",
        title: `${sp.name} is stalled`,
        message: `Project has been stalled for ${daysOverdue} days. ${(
          (parseFloat(sp.expenditureZmw) / parseFloat(sp.budgetZmw)) *
          100
        ).toFixed(0)}% spent against budget; balance at risk.`,
        daysOverdue,
        budgetAtRiskZmw: budgetAtRisk.toFixed(2),
        resolved: false,
      });
    }
  }

  // Quick sanity counts (raw SQL — works on any Drizzle version)
  const [r] = await client`
    select
      (select count(*)::int from constituencies)     as c,
      (select count(*)::int from projects)           as p,
      (select count(*)::int from beneficiaries)      as b,
      (select count(*)::int from alerts)             as a,
      (select count(*)::int from expenditure_lines)  as e
  `;
  console.log(
    `[seed] done. constituencies=${r.c} projects=${r.p} beneficiaries=${r.b} alerts=${r.a} expenditure_lines=${r.e}`
  );

  await client.end();
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
