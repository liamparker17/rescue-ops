import { PrismaClient, AccountType, TaskPriority, TaskStatus, SecurityType, CreditorStage, VotingStatus } from "../generated/client";

const prisma = new PrismaClient();

const ORG_ID = "org_mpumalanga_steel";

async function main() {
  console.log("Seeding rescue-ops database...");

  // Clear existing data (order matters for FK constraints)
  await prisma.auditLog.deleteMany();
  await prisma.creditorCommunication.deleteMany();
  await prisma.creditor.deleteMany();
  await prisma.operationalTask.deleteMany();
  await prisma.taskSequence.deleteMany();
  await prisma.openingBalance.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.organisation.deleteMany();

  // ─── Organisation ──────────────────────────────────────────
  const org = await prisma.organisation.create({
    data: {
      id: ORG_ID,
      name: "Mpumalanga Steel Fabricators (Pty) Ltd",
      registrationNo: "2018/234567/07",
      sector: "Steel Fabrication & Construction",
    },
  });

  // ─── Contacts ──────────────────────────────────────────────
  const contactsData = [
    { name: "Thabo Molefe", role: "Workshop Foreman", company: "Mpumalanga Steel", email: "thabo@mpumalangasteel.co.za", phone: "082 345 6789" },
    { name: "Sarah Chen", role: "Financial Controller", company: "Mpumalanga Steel", email: "sarah@mpumalangasteel.co.za", phone: "083 456 7890" },
    { name: "David Nkosi", role: "Operations Manager", company: "Mpumalanga Steel", email: "david@mpumalangasteel.co.za", phone: "084 567 8901" },
    { name: "Pieter Joubert", role: "Business Rescue Liaison", company: "Nedbank", email: "pjoubert@nedbank.co.za", phone: "011 294 3000" },
    { name: "Amanda Pretorius", role: "Collections Manager", company: "WesBank", email: "apretorius@wesbank.co.za", phone: "011 632 6000" },
    { name: "Ravi Govender", role: "Key Account Manager", company: "ArcelorMittal", email: "ravi.govender@arcelormittal.com", phone: "016 889 9111" },
    { name: "Johan van Wyk", role: "Credit Controller", company: "Macsteel", email: "jvanwyk@macsteel.co.za", phone: "011 871 0000" },
    { name: "Sipho Dlamini", role: "Account Manager", company: "Eskom", email: "dlaminisb@eskom.co.za", phone: "011 800 8111" },
    { name: "Linda Fourie", role: "Property Manager", company: "Titan Properties", email: "linda@titanprop.co.za", phone: "013 752 2100" },
    { name: "Mark Thompson", role: "Regional Sales Manager", company: "Afrox", email: "mthompson@afrox.co.za", phone: "011 490 0400" },
  ];

  const contacts: Record<string, string> = {};
  for (const c of contactsData) {
    const contact = await prisma.contact.create({
      data: { orgId: org.id, ...c },
    });
    contacts[c.name] = contact.id;
  }

  // ─── Opening Balances (as at 01/03/2026) ───────────────────
  const balances = [
    { accountCode: "1000", accountName: "FNB Current Account", accountType: AccountType.Asset, balanceInCents: 34000000 },
    { accountCode: "1001", accountName: "Petty Cash", accountType: AccountType.Asset, balanceInCents: 850000 },
    { accountCode: "1100", accountName: "Trade Debtors", accountType: AccountType.Asset, balanceInCents: 125000000 },
    { accountCode: "1200", accountName: "Raw Materials Inventory", accountType: AccountType.Asset, balanceInCents: 89000000 },
    { accountCode: "1300", accountName: "Machinery & Equipment", accountType: AccountType.Asset, balanceInCents: 320000000 },
    { accountCode: "1400", accountName: "Vehicles", accountType: AccountType.Asset, balanceInCents: 145000000 },
    { accountCode: "2000", accountName: "FNB Overdraft Facility", accountType: AccountType.Liability, balanceInCents: 75000000 },
    { accountCode: "2100", accountName: "Trade Creditors", accountType: AccountType.Liability, balanceInCents: 468000000 },
    { accountCode: "2200", accountName: "SARS — VAT Payable", accountType: AccountType.Liability, balanceInCents: 52000000 },
    { accountCode: "2201", accountName: "SARS — PAYE Payable", accountType: AccountType.Liability, balanceInCents: 38000000 },
    { accountCode: "2300", accountName: "Nedbank Term Loan", accountType: AccountType.Liability, balanceInCents: 210000000 },
    { accountCode: "2400", accountName: "Vehicle Finance — WesBank", accountType: AccountType.Liability, balanceInCents: 98000000 },
    { accountCode: "2500", accountName: "Directors' Loans", accountType: AccountType.Liability, balanceInCents: 60000000 },
    { accountCode: "3000", accountName: "Share Capital", accountType: AccountType.Equity, balanceInCents: 10000000 },
    { accountCode: "3100", accountName: "Retained Earnings (Loss)", accountType: AccountType.Equity, balanceInCents: -297200000 },
    { accountCode: "5000", accountName: "Salaries & Wages", accountType: AccountType.Expense, balanceInCents: 48000000 },
    { accountCode: "5100", accountName: "Rent — Workshop", accountType: AccountType.Expense, balanceInCents: 6500000 },
    { accountCode: "5200", accountName: "Electricity", accountType: AccountType.Expense, balanceInCents: 4200000 },
    { accountCode: "5300", accountName: "Insurance", accountType: AccountType.Expense, balanceInCents: 1800000 },
    { accountCode: "5400", accountName: "Vehicle Running Costs", accountType: AccountType.Expense, balanceInCents: 3500000 },
  ];

  const asAtDate = new Date("2026-03-01T00:00:00.000Z");
  for (const b of balances) {
    await prisma.openingBalance.create({
      data: { orgId: org.id, asAtDate, ...b },
    });
  }

  // ─── Task Sequence ─────────────────────────────────────────
  await prisma.taskSequence.create({
    data: { orgId: org.id, lastSeq: 10 },
  });

  // ─── Operational Tasks ─────────────────────────────────────
  const tasks = [
    { taskNumber: 1, title: "Secure workshop premises — change locks & alarm codes", description: "Immediately change all access codes and locks to prevent unauthorised removal of assets. Contact ADT for alarm code reset.", priority: TaskPriority.Critical, status: TaskStatus.Open, responsibleId: contacts["Thabo Molefe"], dueDate: new Date("2026-03-03") },
    { taskNumber: 2, title: "Freeze all non-essential bank payments", description: "Instruct FNB to halt all debit orders and scheduled payments except payroll and essential utilities. Preserve cash position.", priority: TaskPriority.Critical, status: TaskStatus.Completed, responsibleId: contacts["Sarah Chen"], dueDate: new Date("2026-03-02"), completedAt: new Date("2026-03-02") },
    { taskNumber: 3, title: "Inventory count — raw materials & finished goods", description: "Full physical count of steel plate, bar, tube, and finished fabrications in workshop and yard. Reconcile to last stock sheet.", priority: TaskPriority.Critical, status: TaskStatus.InProgress, responsibleId: contacts["David Nkosi"], dueDate: new Date("2026-03-05") },
    { taskNumber: 4, title: "Notify all employees of business rescue — Section 145", description: "Issue written notice to all 47 employees per Section 145(1) of the Companies Act. Include FAQ sheet on employee rights during business rescue.", priority: TaskPriority.High, status: TaskStatus.Completed, dueDate: new Date("2026-03-01"), completedAt: new Date("2026-03-01") },
    { taskNumber: 5, title: "Obtain 3 months bank statements — FNB & Nedbank", description: "Request detailed statements for Dec 2025 to Feb 2026 from both FNB (current + overdraft) and Nedbank (term loan). Needed for cash flow reconstruction.", priority: TaskPriority.High, status: TaskStatus.InProgress, responsibleId: contacts["Sarah Chen"], dueDate: new Date("2026-03-07") },
    { taskNumber: 6, title: "Secure IT systems — change admin passwords", description: "Reset all admin passwords for Sage, email server, and workshop Wi-Fi. Revoke ex-director remote access. Back up all financial data.", priority: TaskPriority.High, status: TaskStatus.Open, responsibleId: contacts["Thabo Molefe"], dueDate: new Date("2026-03-04") },
    { taskNumber: 7, title: "Review all current contracts & purchase orders", description: "Compile list of all active contracts, open POs, and standing orders. Identify which can be cancelled, renegotiated, or must continue.", priority: TaskPriority.Normal, status: TaskStatus.Open, responsibleId: contacts["David Nkosi"], dueDate: new Date("2026-03-14") },
    { taskNumber: 8, title: "Assess workshop equipment condition", description: "Physical inspection of CNC plasma cutter, MIG welders, overhead crane, and forklift. Note any maintenance overdue or safety concerns.", priority: TaskPriority.Normal, status: TaskStatus.Open, responsibleId: contacts["Thabo Molefe"], dueDate: new Date("2026-03-10") },
    { taskNumber: 9, title: "Contact major debtors — arrange accelerated collection", description: "Call top 5 debtors (R 1.25M outstanding). Negotiate early payment or partial settlement. Priority: Murray & Roberts (R 380k), Group Five (R 290k).", priority: TaskPriority.High, status: TaskStatus.Open, responsibleId: contacts["Sarah Chen"], dueDate: new Date("2026-03-08") },
    { taskNumber: 10, title: "Prepare preliminary cash flow forecast", description: "Build 13-week rolling cash flow forecast. Include confirmed debtors, known creditor obligations, payroll, and essential operating costs.", priority: TaskPriority.Normal, status: TaskStatus.Open, dueDate: new Date("2026-03-12") },
  ];

  for (const t of tasks) {
    await prisma.operationalTask.create({
      data: { orgId: org.id, ...t },
    });
  }

  // ─── Creditors ─────────────────────────────────────────────
  const creditorsData = [
    {
      creditorName: "Nedbank Ltd",
      claimAmountInCents: 210000000,
      securityType: SecurityType.Secured,
      stage: CreditorStage.InNegotiation,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Pieter Joubert"],
      lastContactDate: new Date("2026-03-15"),
      notes: "Term loan secured by general notarial bond over movable assets. Bank amenable to restructuring if cash flow projections support repayment.",
      communications: [
        { method: "Meeting", date: new Date("2026-03-10"), summary: "Discussed proposal to restructure term loan over 36 months at prime + 2%. Bank requested updated cash flow projections before next meeting." },
        { method: "Email", date: new Date("2026-03-15"), summary: "Emailed revised cash flow forecast. Highlighted that continued trading generates R 180k/month toward debt service." },
        { method: "Phone", date: new Date("2026-03-18"), summary: "Pieter confirmed receipt of projections. Internal credit committee meeting scheduled for 22/03. Verbal indication of support for restructure." },
      ],
    },
    {
      creditorName: "WesBank (FirstRand)",
      claimAmountInCents: 98000000,
      securityType: SecurityType.Secured,
      stage: CreditorStage.Notified,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Amanda Pretorius"],
      lastContactDate: new Date("2026-03-06"),
      notes: "Vehicle finance — instalment sale agreements on 3 delivery trucks and 1 flatbed.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Sent formal Section 128 notification of commencement of business rescue proceedings." },
        { method: "Phone", date: new Date("2026-03-06"), summary: "Amanda acknowledged receipt. Requested list of specific vehicles and current mileage. Will assign a dedicated workout officer." },
      ],
    },
    {
      creditorName: "ArcelorMittal SA",
      claimAmountInCents: 185000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.OfferMade,
      votingStatus: VotingStatus.For,
      contactId: contacts["Ravi Govender"],
      lastContactDate: new Date("2026-03-20"),
      notes: "Largest trade creditor. Critical supplier — continued supply essential for ongoing operations.",
      communications: [
        { method: "Meeting", date: new Date("2026-03-08"), summary: "Initial meeting. Ravi expressed willingness to continue supply on COD basis if historical debt addressed. Discussed 60c/R1 settlement." },
        { method: "Phone", date: new Date("2026-03-12"), summary: "Ravi confirmed ArcelorMittal willing to accept 60c/R1 settlement paid over 12 months. Requires board approval — expects response by 20/03." },
        { method: "Email", date: new Date("2026-03-20"), summary: "Board approved settlement in principle. Ravi sending formal offer letter. Will vote in favour of BRP if terms included." },
      ],
    },
    {
      creditorName: "Macsteel Service Centres",
      claimAmountInCents: 120000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.InNegotiation,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Johan van Wyk"],
      lastContactDate: new Date("2026-03-14"),
      notes: "Secondary steel supplier. Less critical than ArcelorMittal but useful for specialty sections.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Formal notification sent per Section 128." },
        { method: "Phone", date: new Date("2026-03-09"), summary: "Johan requested full statement of account and proof of claim form. Indicated Macsteel's legal team will review before any settlement discussion." },
        { method: "Meeting", date: new Date("2026-03-14"), summary: "Met with Johan and Macsteel's in-house counsel. Presented 50c/R1 over 18 months. They countered at 70c/R1 over 12 months. Negotiations ongoing." },
      ],
    },
    {
      creditorName: "SARS",
      claimAmountInCents: 90000000,
      securityType: SecurityType.Preferent,
      stage: CreditorStage.Identified,
      votingStatus: VotingStatus.Pending,
      lastContactDate: new Date("2026-03-02"),
      notes: "VAT (R 520k) and PAYE (R 380k) arrears. SARS is a preferent creditor per Section 145. Filing compliance is critical.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Filed Form BR1 notification. Auto-generated acknowledgement received. No case officer assigned yet." },
        { method: "Email", date: new Date("2026-03-10"), summary: "Submitted updated VAT201 and EMP201 returns for Oct-Feb period via eFiling. Requested meeting with assigned debt management officer." },
      ],
    },
    {
      creditorName: "Eskom",
      claimAmountInCents: 38000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.Notified,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Sipho Dlamini"],
      lastContactDate: new Date("2026-03-07"),
      notes: "3-phase industrial supply. Disconnection would halt all workshop operations immediately.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Formal business rescue notification sent to Eskom key accounts division." },
        { method: "Phone", date: new Date("2026-03-07"), summary: "Sipho confirmed supply will continue during rescue proceedings. Requested current account be kept in good standing. Agreed to COD arrangement for ongoing consumption." },
      ],
    },
    {
      creditorName: "Titan Properties (Landlord)",
      claimAmountInCents: 65000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.Agreed,
      votingStatus: VotingStatus.For,
      contactId: contacts["Linda Fourie"],
      lastContactDate: new Date("2026-03-18"),
      notes: "Workshop lease — R 65k/month. 3 years remaining on 5-year lease. Landlord cooperative.",
      communications: [
        { method: "Meeting", date: new Date("2026-03-05"), summary: "Met Linda on-site. Explained rescue process and need for rent concession. She expressed sympathy — her father ran a steel business." },
        { method: "Phone", date: new Date("2026-03-12"), summary: "Linda proposed 50% rent reduction for 6 months in exchange for 2-year lease extension. Practitioner agreed in principle." },
        { method: "Meeting", date: new Date("2026-03-18"), summary: "Linda agreed to 50% rent reduction for 6 months in exchange for lease extension. Drafting written agreement." },
      ],
    },
    {
      creditorName: "Afrox (Linde)",
      claimAmountInCents: 60000000,
      securityType: SecurityType.Concurrent,
      stage: CreditorStage.Notified,
      votingStatus: VotingStatus.Pending,
      contactId: contacts["Mark Thompson"],
      lastContactDate: new Date("2026-03-06"),
      notes: "Welding gas supplier (argon, CO2, acetylene). Monthly consumption ~R 18k. Outstanding balance is 3+ months.",
      communications: [
        { method: "Letter", date: new Date("2026-03-02"), summary: "Formal Section 128 notification sent to Afrox head office and regional branch." },
        { method: "Phone", date: new Date("2026-03-06"), summary: "Mark acknowledged notification. Gas cylinder rental continues as cylinders are Afrox property. Will continue supply on strict COD basis pending rescue outcome." },
      ],
    },
  ];

  for (const c of creditorsData) {
    const { communications, ...creditorData } = c;
    const creditor = await prisma.creditor.create({
      data: { orgId: org.id, ...creditorData },
    });
    for (const comm of communications) {
      await prisma.creditorCommunication.create({
        data: { creditorId: creditor.id, ...comm },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`  Organisation: ${org.name}`);
  console.log(`  Contacts: ${contactsData.length}`);
  console.log(`  Opening Balances: ${balances.length}`);
  console.log(`  Operational Tasks: ${tasks.length}`);
  console.log(`  Creditors: ${creditorsData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
