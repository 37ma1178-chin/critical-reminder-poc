// Source of the Page 'India camper/RV approved vehicles by state and UT'
// https://cursor.com/canvas/store-ebe2d4fb-61ee-441d-9405-6cae046d2e78/73c376da-a5b9-4c71-80ff-3b20ab32962f
// Read with ReadCanvas on 21 Nov 2026 (IST). Copied as-is.
import { Page, Section, Text, Callout, Table, Metrics, BulletList, Steps, LinkCards, Segmented, TableOfContents, useState } from "grok/canvas";

type Group = "policy" | "inpolicy" | "draft" | "operating" | "none";

type Row = {
  name: string;
  kind: "State" | "UT";
  group: Group;
  status: string;
  vehicles: string;
  reference: string;
  conditions: string;
};

const GROUP_LABEL: Record<Group, string> = {
  policy: "Own caravan policy or rules",
  inpolicy: "Caravans inside a wider policy or tax rule",
  draft: "Draft only",
  operating: "Caravans running, no policy found",
  none: "Nothing found",
};

const rows: Row[] = [
  { name: "Andhra Pradesh", kind: "State", group: "policy", status: "Caravan Tourism Policy 2024-29 approved by Cabinet; Tourism Dept order issued 7 Oct 2025", vehicles: "(b) OG Dreamliner caravan bus run with APTDC, make not named", reference: "AP Tourism Dept order, Oct 2025 (news); no vehicle list", conditions: "Target 150 caravans, 25 parks. Life tax waived for first 25 vehicles, part rebate for next 25. Operator must insure travellers and follow Transport rules." },
  { name: "Arunachal Pradesh", kind: "State", group: "operating", status: "6 government tourist caravans unveiled Feb 2023", vehicles: "(b) 6 caravans, make not named", reference: "No caravan policy or vehicle list found", conditions: "Plan to lease to local tourism entrepreneurs." },
  { name: "Assam", kind: "State", group: "operating", status: "Assam Tourism (ATDC) caravans since about 2014", vehicles: "(b) Force Traveller caravan body by Prakash Body Constructions, Nagaon", reference: "No caravan policy or vehicle list found", conditions: "None published." },
  { name: "Bihar", kind: "State", group: "operating", status: "2 Bihar Tourism luxury caravans handed over Nov 2025, registration and permits pending", vehicles: "(b) BharatBenz chassis, body built in Chandigarh", reference: "No caravan policy or vehicle list found", conditions: "Seeking an all-India permit. Rent quoted at ₹75 per km, minimum 250 km a day." },
  { name: "Chhattisgarh", kind: "State", group: "inpolicy", status: "Transport Dept opened separate motor caravan registration, July 2023", vehicles: "None named", reference: "Transport Dept tax order, July 2023 (news); no vehicle list", conditions: "Tax of 10% of vehicle cost at registration. Old vehicle converted must be 3 years old or less." },
  { name: "Goa", kind: "State", group: "policy", status: "Goa Caravan Tourism Policy notified (valid 3 years)", vehicles: "None named; no public list of registered caravans", reference: "Goa Caravan Tourism Policy, Dept of Tourism", conditions: "Must be registered at a Goa RTO and with Goa Tourism. Must meet AIS-124 / AIS-113. Chassis 3 years old or less. Only first 50 caravans registered. Second-hand re-registered vehicles get no incentive." },
  { name: "Gujarat", kind: "State", group: "inpolicy", status: "Tourism Policy 2021-25 gives a purchase subsidy for caravans and campervans", vehicles: "None named", reference: "Gujarat Tourism investor guideline, section 2.1", conditions: "15% of ex-showroom cost, up to ₹10 lakh, max 3 vehicles. New vehicles only, commercially registered in Gujarat, certified by ARAI / BIS / other competent body." },
  { name: "Haryana", kind: "State", group: "none", status: "No state list found", vehicles: "None", reference: "Nothing findable", conditions: "Central rules apply." },
  { name: "Himachal Pradesh", kind: "State", group: "none", status: "No state list found; caravan tourism only announced (2022)", vehicles: "None", reference: "Announcement only, no policy text", conditions: "Central rules apply." },
  { name: "Jharkhand", kind: "State", group: "none", status: "No state list found", vehicles: "None", reference: "Nothing findable", conditions: "Central rules apply." },
  { name: "Karnataka", kind: "State", group: "inpolicy", status: "Tourism Policy 2024-29: motor vehicle tax waived for first 200 caravans registered", vehicles: "(a) LuxeCamper on Ashok Leyland 4200 mm chassis (ARAI, AIS-124). (a, builder's own claim) Earth Camper on Force Traveller 3350 and 4020, and an Eicher. (b) Trippy Wheels on Tata Winger, Mahindra Imperio, Force (Tempo) Traveller", reference: "Karnataka Tourism Policy 2024-29 (Cabinet, 28 Oct 2024)", conditions: "Tax waiver capped at first 200 caravans. Trippy Wheels says the Transport Dept does not allow self-drive caravans." },
  { name: "Kerala", kind: "State", group: "policy", status: "Caravan Tourism Policy, G.O. 18/2021/Tourism, 8 Oct 2021 (Keravan Kerala)", vehicles: "(a) Pinnacle Motorhome on Force Traveller T2 4020 (ARAI, AIS-124). (b) JCBL caravan on BharatBenz 1017; LuxeCamper truck-camper; operators incl. Sonic (BharatBenz) and Hotel Fort Munnar (Mercedes-Benz)", reference: "G.O. 18/2021/Tourism; Kerala Finance Act 2022 tax cut", conditions: "Type approval to AIS-124 needed for each make and model. Minimum fittings listed (bed, kitchenette, toilet, AC, partition behind driver). Ideal length about 8.5 m. Subsidy for first 300 caravans, max 5 per company. Tax halved for Tourism Dept rental caravans." },
  { name: "Madhya Pradesh", kind: "State", group: "operating", status: "MP Tourism has run caravans since 2010", vehicles: "(b) Force Traveller (Deluxe Caravan); Eicher truck chassis (Luxury Caravan)", reference: "No official caravan policy text found", conditions: "Driver and helper always supplied." },
  { name: "Maharashtra", kind: "State", group: "policy", status: "Caravan Tourism Policy GR, 15 Mar 2021; 17 caravans registered with Tourism Dept by Nov 2022", vehicles: "(b) Motohom: Mahindra Marazzo campervan (self-drive) and an Ashok Leyland motorhome", reference: "GR TDS 2021/02/Sr. No. 501/Tourism", conditions: "Commercial caravans must register with the Directorate of Tourism. Vehicle tax exemption promised (order not found)." },
  { name: "Manipur", kind: "State", group: "none", status: "No state list found", vehicles: "None", reference: "Nothing findable", conditions: "Central rules apply." },
  { name: "Meghalaya", kind: "State", group: "policy", status: "Meghalaya Motorcaravan Scheme flagged off Oct 2026 (CM ELEVATE)", vehicles: "None named in the source read", reference: "Meghalaya Motorcaravan Scheme, Oct 2026", conditions: "Up to 50% of project cost as upfront support plus EMI co-payment, for eligible local entrepreneurs." },
  { name: "Mizoram", kind: "State", group: "policy", status: "Guidelines for Caravan Tourism in Mizoram notified", vehicles: "None named", reference: "Notification No. C.31012/3/2020-TOUR/1, 18 Aug 2021 (corrigendum)", conditions: "Operational and site rules; vehicle details not in the page read." },
  { name: "Nagaland", kind: "State", group: "none", status: "No state list found", vehicles: "None", reference: "Tourism policy does not mention caravans", conditions: "Central rules apply." },
  { name: "Odisha", kind: "State", group: "inpolicy", status: "3 luxury caravans flagged off 4 Feb 2026 (public-private, Sand Pebbles Tour 'N' Travels)", vehicles: "(b) 3 caravans, make not named", reference: "Odisha Tourism (Amendment) Policy 2026 caravan parks (reported)", conditions: "Fares from ₹11,111 a day. Parking at OTDC Panthanivas and eco-camps (reported)." },
  { name: "Punjab", kind: "State", group: "inpolicy", status: "Caravan tourism listed as an eligible unit in Industrial and Business Development Policy 2022", vehicles: "None named", reference: "Punjab IBDP 2022", conditions: "Gets general tourism incentives only." },
  { name: "Rajasthan", kind: "State", group: "inpolicy", status: "Tourism Policy 2020 and Rural Tourism Scheme cover caravan parks only", vehicles: "None named", reference: "Rajasthan Tourism Policy 2020", conditions: "Rules are for parks (land size, road access), not vehicles." },
  { name: "Sikkim", kind: "State", group: "none", status: "No state list found", vehicles: "None", reference: "Only a general tourist trade licensing act (2022)", conditions: "Central rules apply." },
  { name: "Tamil Nadu", kind: "State", group: "policy", status: "Guidelines for registering Caravan Tour Operators and Caravan Parks, Sept 2022", vehicles: "None named; no public list", reference: "TN Tourism registration guidelines (tntourismtors.com)", conditions: "Caravan must comply with AIS-124 and be registered with TN or another state's Transport Dept. Minimum fittings listed. Registration valid 3 years." },
  { name: "Telangana", kind: "State", group: "operating", status: "Telangana Tourism runs a caravan (9 seats, 4 berths), 2025", vehicles: "(b) 1 caravan, make not named", reference: "No caravan policy or vehicle list found", conditions: "Rent quoted from ₹14,000 a day." },
  { name: "Tripura", kind: "State", group: "none", status: "No state list found", vehicles: "None", reference: "Nothing findable", conditions: "Central rules apply." },
  { name: "Uttar Pradesh", kind: "State", group: "inpolicy", status: "Tourism Policy 2022 plans caravan parks; UP Tourism and Motohom launched a motorhome, Jan 2024", vehicles: "(b) Motohom motorhome, make not named", reference: "UP Tourism Policy 2022", conditions: "Bookings through UPSTDC." },
  { name: "Uttarakhand", kind: "State", group: "inpolicy", status: "First state caravan inaugurated Sept 2021; Tourism Policy 2023 lists motor caravans (reported)", vehicles: "(b) 1 caravan, make not named", reference: "Uttarakhand Tourism Policy 2023 (reported)", conditions: "Capital subsidy and UTDB registration for motor caravan operators (reported)." },
  { name: "West Bengal", kind: "State", group: "none", status: "No state list found", vehicles: "None (one private caravan reported in Alipurduar, 2018)", reference: "Nothing official", conditions: "Central rules apply." },
  { name: "Andaman and Nicobar Islands", kind: "UT", group: "draft", status: "Draft caravan tourism policy put out for comments, Aug 2023", vehicles: "None", reference: "Draft only", conditions: "Not final." },
  { name: "Chandigarh", kind: "UT", group: "none", status: "No list found (Bihar's caravans were built here)", vehicles: "None", reference: "Nothing findable", conditions: "Central rules apply." },
  { name: "Dadra and Nagar Haveli and Daman and Diu", kind: "UT", group: "none", status: "No list found", vehicles: "None", reference: "Nothing findable", conditions: "Central rules apply." },
  { name: "Delhi", kind: "UT", group: "none", status: "No list found", vehicles: "None", reference: "Nothing findable", conditions: "Central rules apply." },
  { name: "Jammu and Kashmir", kind: "UT", group: "draft", status: "Draft tourism policy names caravan tourism as a priority", vehicles: "None", reference: "J&K draft tourism policy", conditions: "Vehicle standards to be set later with the Transport Dept." },
  { name: "Ladakh", kind: "UT", group: "none", status: "No list found", vehicles: "None", reference: "Nothing findable", conditions: "Central rules apply; camping limits at some lakes." },
  { name: "Lakshadweep", kind: "UT", group: "none", status: "No list found", vehicles: "None", reference: "2026 tourist trade guidelines do not cover caravans", conditions: "Not applicable in practice." },
  { name: "Puducherry", kind: "UT", group: "inpolicy", status: "Transport Dept notified a tax for camper vans and caravans, June 2025", vehicles: "None named", reference: "Puducherry Transport Dept tax notification, 2025", conditions: "Annual tax ₹32,000 (light/medium) or ₹48,000 (heavy). Short 3, 7 or 30-day tax for caravans from other states." },
];

const groupOrder: Group[] = ["policy", "inpolicy", "draft", "operating", "none"];

export default function App() {
  const [filter, setFilter] = useState<string>("all");
  const shown = filter === "all" ? rows : rows.filter((r: Row) => r.group === filter);
  const count = (g: Group) => rows.filter((r: Row) => r.group === g).length;

  return (
    <Page
      title="India camper/RV approved vehicles by state and UT"
      summary="No state or UT publishes a list of approved camper/RV vehicle models. Approval is done once, centrally, for each design. What exists is state policies, plus a few named vehicles that are type-approved or running as caravans."
      width="wide"
    >
      <TableOfContents
        items={[
          { label: "Key findings" },
          { label: "All 36 states and UTs" },
          { label: "Vehicles seen in more than one state" },
          { label: "Every named vehicle found" },
          { label: "How approval actually works" },
          { label: "Gaps and limits" },
          { label: "Sources" },
        ]}
      />

      <Section heading="Key findings">
        <Metrics
          metrics={[
            { value: "0 of 36", label: "States/UTs with an approved vehicle list" },
            { value: "7", label: "Own caravan policy or rules" },
            { value: "9", label: "Caravans inside a wider policy or tax" },
            { value: "13", label: "Nothing found" },
          ]}
        />
        <Callout lead="The short answer">
          There is no RTO or Government of India list of approved camper vehicles. A design is approved once by a central test agency such as ARAI, the Automotive Research Association of India, under the AIS-124 motor caravan standard. Any state RTO then registers it. States only add tourism rules, tax breaks and subsidies.
        </Callout>
        <BulletList
          items={[
            "Labels used: (a) a vehicle reported as type-approved to AIS-124, (b) a vehicle running or registered as a caravan in that state, per news or the operator.",
            "Only 2 vehicles have an independent report of AIS-124 approval: Force Traveller T2 4020 (Pinnacle) and an Ashok Leyland 4200 mm chassis (LuxeCamper).",
            "Vehicles that recur across states: Force Traveller (4 states), BharatBenz chassis (2), Ashok Leyland (2), Eicher (2).",
            "No state or UT bans camper/RV conversions. Where nothing was found, the central rules still apply.",
          ]}
        />
      </Section>

      <Section heading="All 36 states and UTs" caption="Status as found on 19 Nov 2026. Use the switch to filter.">
        <Segmented
          options={[
            { value: "all", label: "All", count: rows.length },
            ...groupOrder.map((g: Group) => ({ value: g, label: GROUP_LABEL[g], count: count(g) })),
          ]}
          value={filter}
          onChange={(v: string) => setFilter(v)}
        />
        <Table
          columns={["State / UT", "Status", "Vehicles found", "Reference", "Conditions"]}
          rows={shown.map((r: Row) => [
            `${r.name} (${r.kind})`,
            { text: r.status, tone: r.group === "policy" ? "success" : r.group === "none" ? "danger" : r.group === "draft" ? "warning" : undefined },
            r.vehicles,
            r.reference,
            r.conditions,
          ])}
        />
      </Section>

      <Section heading="Vehicles seen in more than one state">
        <Table
          columns={["Base vehicle", "States", "Strongest evidence"]}
          rows={[
            ["Force Traveller (incl. T2 4020, 3350 wheelbase)", "Kerala, Madhya Pradesh, Assam, Karnataka", { text: "(a) T2 4020 Pinnacle Motorhome, ARAI AIS-124", tone: "success" }],
            ["BharatBenz chassis (1017 in Kerala)", "Kerala, Bihar", "(b) running / handed over as caravans"],
            ["Ashok Leyland chassis", "Karnataka, Maharashtra", { text: "(a) LuxeCamper, 4200 mm wheelbase, ARAI AIS-124", tone: "success" }],
            ["Eicher chassis", "Madhya Pradesh, Karnataka", "(b) MP Tourism; builder's own ARAI claim in Karnataka"],
          ]}
        />
        <Text>Mahindra appears in two states but as different models (Marazzo in Maharashtra, Imperio in Karnataka), so it is not counted as the same vehicle.</Text>
      </Section>

      <Section heading="Every named vehicle found">
        <Table
          columns={["Vehicle", "Built or run by", "Where", "Label", "Note"]}
          rows={[
            ["Force Traveller T2 4020", "Pinnacle Industries", "Kerala", { text: "(a)", tone: "success" }, "ARAI approved to AIS-124 per carandbike and commercialvehicle.in; certificate number not published"],
            ["Ashok Leyland, 4200 mm wheelbase", "Campervan Camps (LuxeCamper)", "Karnataka", { text: "(a)", tone: "success" }, "ARAI approved to AIS-124 per Autocar India, June 2020"],
            ["Force Traveller 3350 and 4020 wheelbase", "Earth Camper, Bengaluru", "Karnataka", { text: "(a) claim", tone: "warning" }, "Builder's own website claim of ARAI certification"],
            ["Eicher, 3515 mm wheelbase", "Earth Camper, Bengaluru", "Karnataka", { text: "(a) claim", tone: "warning" }, "Builder's own claim; exact model wording unclear on site"],
            ["BharatBenz 1017", "JCBL with Autobahn Trucking", "Kerala", "(b)", "First Keravan Kerala caravan, Oct 2021; AIS-124 certificate not shown"],
            ["BharatBenz chassis", "Bihar Tourism (built in Chandigarh)", "Bihar", "(b)", "Registration pending, Nov 2025"],
            ["Mercedes-Benz caravan", "Hotel Fort Munnar", "Kerala", "(b)", "Listed on Keravan Kerala booking page"],
            ["Force Traveller", "MP Tourism", "Madhya Pradesh", "(b)", "Deluxe Caravan"],
            ["Eicher truck chassis", "MP Tourism", "Madhya Pradesh", "(b)", "Luxury Caravan"],
            ["Force Traveller", "Assam Tourism, body by PBC Nagaon", "Assam", "(b)", "Blog photos, 2015"],
            ["Ashok Leyland", "Motohom", "Maharashtra", "(b)", "Motorhome with roof deck, run with MTDC"],
            ["Mahindra Marazzo", "Motohom", "Maharashtra", "(b)", "Self-drive campervan with roof tent"],
            ["Isuzu D-Max V-Cross", "Sthira Technovations for LuxeCamper", "Karnataka (Kerala launch likely the same)", "(b)", "Demountable truck camper; builder says road legal, no AIS-124 report"],
            ["Tata Winger, Mahindra Imperio, Force (Tempo) Traveller", "Trippy Wheels", "Karnataka", "(b)", "2019 conversions; no approval stated, and before conversions had to meet AIS-124"],
          ]}
        />
      </Section>

      <Section heading="How approval actually works">
        <Steps
          steps={[
            { title: "Central law defines the vehicle", detail: "CMVR Rule 2(za) (the national motor vehicle rules) defines a motor caravan: seats and table, sleeping space, cooking and storage, all fixed." },
            { title: "A test agency approves the design", detail: "The vehicle maker or caravan builder gets a type approval to AIS-124 from a Rule 126 test agency: ARAI, ICAT, GARC, VRDE, NATRAX and others. This is per make and model, not per state." },
            { title: "Conversions have limits", detail: "Base vehicle must be registered and 3 years old or less. Chassis, suspension, brakes, engine and fuel system must not be changed. Since about Feb 2022 every vehicle modified into a caravan must meet AIS-124 (G.S.R. 596(E), 2021)." },
            { title: "Any RTO registers it", detail: "The approval number goes on Form 22-A. The change is endorsed on the RC (registration certificate) within 14 days." },
            { title: "States add tourism rules", detail: "Tourism registration, tax cuts, subsidies and caravan parks. Renting it out needs a tourist permit." },
          ]}
        />
      </Section>

      <Section heading="Gaps and limits">
        <BulletList
          items={[
            "ARAI, ICAT and other agencies do not publish a public list of AIS-124 approvals, so no certificate numbers were found for any vehicle.",
            "Kerala (198 operator applications by Dec 2021) and Maharashtra (17 caravans) keep registers, but neither publishes the vehicle models.",
            "Several state launches (Odisha, Telangana, Arunachal, Uttarakhand, UP, Andhra Pradesh) never name the base vehicle.",
            "Some state and central sites timed out (Goa Tourism, Haryana Transport, MoRTH). The Andhra Pradesh order PDF would not open, so news reports were used.",
            "Odisha's 2026 amendment and Uttarakhand's 2023 caravan clauses come from search summaries, not the policy text.",
          ]}
        />
      </Section>

      <Section heading="Sources">
        <LinkCards
          links={[
            { title: "AIS-124 motor caravan standard (copy)", site: "overlanders.co.in", href: "https://overlanders.co.in/wp-content/uploads/2024/07/86201482519AM4_AIS-124_F.pdf" },
            { title: "ARAI homologation: motor caravan approvals", site: "araiindia.com", href: "https://www.araiindia.com/departments-laboratories/homologation-management-regulation/our-key-activities" },
            { title: "Form 22-A (caravan type approval number)", site: "parivahan.gov.in", href: "https://parivahan.gov.in/sites/default/files/DownloadForm/cmvr/FORM-22A.pdf" },
            { title: "Kerala Caravan Tourism Policy G.O. 18/2021", site: "keralatourism.org", href: "https://www.keralatourism.org/latestfromkeralatourism/caravan__tourism_policy_.pdf" },
            { title: "Keravan Kerala operators (booking page)", site: "keralatourism.org", href: "https://www.keralatourism.org/keravan-kerala/book-your-trip" },
            { title: "Keravan Kerala news: Pinnacle, LuxeCamper, 198 applications", site: "keralatourism.org", href: "https://www.keralatourism.org/keravan-kerala/news" },
            { title: "Pinnacle Force Traveller T2 4020, ARAI AIS-124", site: "carandbike.com", href: "https://www.carandbike.com/news/pinnacle-industries-along-with-kerala-government-unveils-a-luxury-caravan-to-promote-tourism-2710885" },
            { title: "Pinnacle motorhome, ARAI AIS-124", site: "commercialvehicle.in", href: "https://commercialvehicle.in/motor-homes-by-pinnacle-industries-kerala-tourism/" },
            { title: "JCBL caravan on BharatBenz 1017", site: "jcbl.com", href: "https://jcbl.com/blog/the-jcbl-caravan-a-major-leap-forward-for-luxury-tourism-in-the-country" },
            { title: "BharatBenz caravan for Kerala Tourism", site: "keralatourism.org", href: "https://www.keralatourism.org/articlesonkerala/07_10_202120211008092510_1.pdf" },
            { title: "LuxeCamper on Ashok Leyland, ARAI AIS-124", site: "autocarpro.in", href: "https://www.autocarpro.in/news-national/araiapproved-luxecamper-motorhome-unveiled-56598" },
            { title: "LuxeCamper in Karnataka", site: "cntraveller.in", href: "https://www.cntraveller.in/story/rent-campervan-rv-caravan-cost-drive-karnataka-weekend-getaways-bengaluru-coorg-anil-kumble-backed-startup/" },
            { title: "Isuzu D-Max demountable camper", site: "sthiratech.in", href: "https://www.sthiratech.in/product/campervan/" },
            { title: "Earth Camper ARAI claim", site: "earthcamper.com", href: "https://www.earthcamper.com/" },
            { title: "Trippy Wheels, Karnataka", site: "edexlive.com", href: "https://www.edexlive.com/news/meet-the-karnataka-duo-whose-made-in-india-caravans-will-give-you-travelgoals-5683.html" },
            { title: "Karnataka Tourism Policy 2024-29, 200 caravans", site: "thehindu.com", href: "https://www.thehindu.com/news/national/karnataka/cabinet-clears-new-tourism-policy/article68807833.ece" },
            { title: "Maharashtra Caravan Tourism Policy GR", site: "maharashtratourism.gov.in", href: "https://maharashtratourism.gov.in/wp-content/uploads/2024/11/Caravan-Tourism-Policy-english.pdf" },
            { title: "Maharashtra: 17 caravans registered", site: "indianexpress.com", href: "https://indianexpress.com/article/cities/mumbai/caravan-scheme-draws-good-response-as-17-vehicles-register-8253559/" },
            { title: "Motohom Marazzo and Ashok Leyland, MTDC", site: "overdrive.in", href: "https://www.overdrive.in/news-cars-auto/features/counter-to-covid-mtdc-flags-off-its-motorhome-and-campervan/" },
            { title: "MP Tourism caravans: Force Traveller and Eicher", site: "overdrive.in", href: "https://www.overdrive.in/news-cars-auto/features/counter-to-covid19-camper-van-tourism/" },
            { title: "Goa Caravan Tourism Policy", site: "goatourism.gov.in", href: "https://goatourism.gov.in/caravan-tourism-policy/" },
            { title: "Tamil Nadu caravan operator guidelines", site: "tntourismtors.com", href: "https://www.tntourismtors.com/ApplicationGuideLines/Guidelines_CaravanParkOperator.pdf" },
            { title: "Gujarat caravan subsidy guideline", site: "gujarattourism.com", href: "https://gujarattourism.com/content/dam/gujrattourism/images/document/INVESTOR_APPLICATION_GUIDELINE.pdf" },
            { title: "Andhra Pradesh caravan policy approved", site: "bwtravel.com", href: "https://www.bwtravel.com/industry-insights/andhra-pradesh-approves-caravan-tourism-policy-and-major-urban-projects-10527723" },
            { title: "Andhra Pradesh caravan order (Telugu)", site: "andhrajyothy.com", href: "https://www.andhrajyothy.com/2025/andhra-pradesh/andhra-pradesh-govt-approves-caravan-tourism-with-5-crore-incentives-1454174.html" },
            { title: "AP OG Dreamliner caravan with APTDC", site: "etvbharat.com", href: "https://www.etvbharat.com/en/!state/hotel-on-wheels-andhra-pradesh-launches-luxury-caravan-tourism-enn25100603355" },
            { title: "Mizoram caravan guidelines corrigendum", site: "tourism.mizoram.gov.in", href: "https://tourism.mizoram.gov.in/uploads/attachments/2022/02/7bcb878e9ca5cbf06324387bba91c3cd/pages-36-amendment-guidelines-for-caravan-tourism-in-mizoram-18th-aug-2021.pdf" },
            { title: "Meghalaya Motorcaravan Scheme", site: "indiatodayne.in", href: "https://www.indiatodayne.in/meghalaya/story/meghalaya-flags-off-motorcaravan-scheme-upgrades-wards-lake-tourism-facilities-1462677-2026-10-14" },
            { title: "Odisha caravans flagged off", site: "newindianexpress.com", href: "https://www.newindianexpress.com/states/odisha/2026/Feb/05/van-tastic-odisha-launches-home-on-wheels-for-wanderlust" },
            { title: "Odisha caravan tourism and policy", site: "timesofindia.indiatimes.com", href: "https://timesofindia.indiatimes.com/city/bhubaneswar/caravan-tourism-rolls-out-to-redefine-comfort-luxury-in-state/articleshow/127917678.cms" },
            { title: "Chhattisgarh caravan registration", site: "the-journalist.com", href: "https://www.the-journalist.com/raipur-caravan-registration-started-in-transport-department-to-promote-caravan-tourism/" },
            { title: "Puducherry caravan tax", site: "thehindu.com", href: "https://www.thehindu.com/news/cities/puducherry/puducherry-rolls-out-caravan-tourism/article69670765.ece" },
            { title: "Bihar caravans on BharatBenz", site: "outlooktraveller.com", href: "https://www.outlooktraveller.com/News/bihar-tourism-launches-luxury-caravans-to-boost-premium-travel-experiences" },
            { title: "Arunachal six caravans", site: "arunachaltimes.in", href: "https://archive.arunachaltimes.in/index.php/2023/02/16/cm-unveils-six-tourist-caravans/" },
            { title: "Assam Tourism Force Traveller caravan", site: "blogspot.com", href: "http://biswajit-svmchaser.blogspot.com/2015/08/assam-tourism-force-traveller-caravan.html" },
            { title: "UP Tourism and Motohom", site: "traveltradejournal.com", href: "https://traveltradejournal.com/uttar-pradesh-tourism-launches-caravan-tourism-to-boost-family-oriented-travel/" },
            { title: "UP Tourism Policy 2022", site: "invest.up.gov.in", href: "https://invest.up.gov.in/wp-content/uploads/2023/02/Tourism_Policy_2022.pdf" },
            { title: "Uttarakhand first caravan", site: "timesofindia.indiatimes.com", href: "https://timesofindia.indiatimes.com/city/dehradun/caravan-tourism-to-start-in-ukhand-tourists-can-travel-to-lesser-known-spots-while-avoiding-crowds/articleshow/86516035.cms" },
            { title: "Uttarakhand Tourism Policy 2023", site: "uttarakhandtourism.gov.in", href: "https://uttarakhandtourism.gov.in/assets/media/UTDB_media_1738567470Uttarakhand_Tourism_Policy_2023.pdf" },
            { title: "Telangana Tourism caravan", site: "etvbharat.com", href: "https://www.etvbharat.com/te/!state/you-can-rent-a-caravan-to-explore-telangana-tourism-destinations-telangana-news-tgs25071303625" },
            { title: "Punjab IBDP 2022 (caravan tourism)", site: "punjab.gov.in", href: "https://pbtilabs.punjab.gov.in/pdf/Punjab_Industrial_and_Business_Development_Policy_2022.pdf" },
            { title: "Rajasthan Tourism Policy 2020", site: "tourism.rajasthan.gov.in", href: "https://www.tourism.rajasthan.gov.in/content/dam/rajasthan-tourism/english/homepage/topslider/Rajasthan%20Tourism%20Policy%202020.pdf" },
            { title: "Andaman draft caravan policy", site: "indianexpress.com", href: "https://indianexpress.com/article/lifestyle/destination-of-the-week/andaman-luxury-caravan-tourism-8898124/" },
            { title: "J&K draft tourism policy", site: "jktourism.org", href: "https://jktourism.org/draft-tourism-policy/" },
            { title: "Himachal caravan announcement", site: "gnn.asia", href: "https://www.gnn.asia/caravan-tourism-to-come-to-himachal-pradesh-soon/" },
            { title: "Lakshadweep Tourist Trade Guidelines 2026", site: "lakshadweep.gov.in", href: "https://lakshadweep.gov.in/document/lakshadweep-tourist-trade-guidelines-2026/" },
          ]}
        />
      </Section>
    </Page>
  );
}
