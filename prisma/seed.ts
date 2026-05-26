/**
 * Seed ZynexAV with a realistic AV CRM dataset.
 * Run with: `npm run seed`
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ZynexAV CRM…");

  // Wipe in dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.serviceTicket.deleteMany();
  await prisma.aMCContract.deleteMany();
  await prisma.pOLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.rMA.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.bOQItem.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectTechnician.deleteMany();
  await prisma.device.deleteMany();
  await prisma.signalFlow.deleteMany();
  await prisma.aVRack.deleteMany();
  await prisma.commissioningChecklist.deleteMany();
  await prisma.siteSurvey.deleteMany();
  await prisma.drawing.deleteMany();
  await prisma.room.deleteMany();
  await prisma.project.deleteMany();
  await prisma.quoteLine.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.account.deleteMany();
  await prisma.catalogItem.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  const ws = await prisma.workspace.create({
    data: {
      name: "Soundstage Integration",
      slug: "soundstage",
      currency: "USD",
      timezone: "America/New_York",
    },
  });

  // Users
  const users = await Promise.all([
    prisma.user.create({ data: { workspaceId: ws.id, email: "marcus@soundstage.av", name: "Marcus Reyes", role: "OWNER", jobTitle: "Founder & CEO" } }),
    prisma.user.create({ data: { workspaceId: ws.id, email: "daniel@soundstage.av", name: "Daniel Reyes", role: "SALES", jobTitle: "Director of Sales" } }),
    prisma.user.create({ data: { workspaceId: ws.id, email: "priya@soundstage.av", name: "Priya Mehta", role: "ENGINEER", jobTitle: "Lead AV Engineer" } }),
    prisma.user.create({ data: { workspaceId: ws.id, email: "lena@soundstage.av", name: "Lena Rivera", role: "SERVICE_TECH", jobTitle: "Senior Service Tech" } }),
    prisma.user.create({ data: { workspaceId: ws.id, email: "anthony@soundstage.av", name: "Anthony Patel", role: "SERVICE_TECH", jobTitle: "Service Tech" } }),
    prisma.user.create({ data: { workspaceId: ws.id, email: "hannah@soundstage.av", name: "Hannah Kowalski", role: "ENGINEER", jobTitle: "Inventory Lead" } }),
  ]);

  // Accounts
  const accountSpecs = [
    { name: "Hilton Worldwide", tier: "ENTERPRISE" as const, ltvCents: 124_000_000, health: 92 },
    { name: "Marriott International", tier: "ENTERPRISE" as const, ltvCents: 241_000_000, health: 88 },
    { name: "Nexus Capital", tier: "GROWTH" as const, ltvCents: 48_200_000, health: 76 },
    { name: "Bloomberg L.P.", tier: "ENTERPRISE" as const, ltvCents: 182_000_000, health: 94 },
    { name: "Apex Media", tier: "GROWTH" as const, ltvCents: 18_800_000, health: 84 },
    { name: "Vertex Ltd.", tier: "STARTER" as const, ltvCents: 9_400_000, health: 68 },
    { name: "RXR Realty", tier: "GROWTH" as const, ltvCents: 32_400_000, health: 80 },
    { name: "Soho Studios", tier: "STARTER" as const, ltvCents: 6_200_000, health: 72 },
  ];
  const accounts = await Promise.all(
    accountSpecs.map((a) =>
      prisma.account.create({
        data: { workspaceId: ws.id, name: a.name, tier: a.tier, ltvCents: a.ltvCents, healthScore: a.health, industry: "Hospitality / Tech" },
      })
    )
  );

  // Contacts (2-3 per account)
  for (const acc of accounts) {
    await prisma.contact.createMany({
      data: [
        { workspaceId: ws.id, accountId: acc.id, firstName: "Alex", lastName: "Director", title: "AV Director", isPrimary: true, email: `alex@${acc.name.toLowerCase().replace(/\s+/g, "")}.com` },
        { workspaceId: ws.id, accountId: acc.id, firstName: "Sam", lastName: "Buyer", title: "Procurement Lead", email: `sam@${acc.name.toLowerCase().replace(/\s+/g, "")}.com` },
      ],
    });
  }

  // Catalog
  const catalogSpecs = [
    { sku: "CRES-DM-NVX-360", name: "Crestron DM-NVX-360", brand: "Crestron", category: "Distribution", price: 1_200_000, cost: 950_000 },
    { sku: "QSYS-CORE-110F", name: "Q-SYS Core 110f", brand: "Q-SYS", category: "Control", price: 598_000, cost: 478_000 },
    { sku: "SHRE-MXA920", name: "Shure MXA920 Ceiling Array", brand: "Shure", category: "Audio", price: 428_000, cost: 312_000 },
    { sku: "BIMP-TES-FORTE", name: "Biamp Tesira Forté X 800", brand: "Biamp", category: "Audio", price: 466_000, cost: 358_000 },
    { sku: "EXTR-SMP-351", name: "Extron SMP 351 Streaming", brand: "Extron", category: "Distribution", price: 460_000, cost: 348_000 },
    { sku: "SONY-BRAVIA-85", name: "Sony BRAVIA 85\" 4K Pro", brand: "Sony", category: "Displays", price: 840_000, cost: 612_000 },
    { sku: "POLY-STUDIO-X70", name: "Poly Studio X70", brand: "Poly", category: "Conferencing", price: 620_000, cost: 480_000 },
    { sku: "LOGI-RALLY-BAR", name: "Logitech Rally Bar", brand: "Logitech", category: "Conferencing", price: 380_000, cost: 290_000 },
    { sku: "GENL-8030C", name: "Genelec 8030C Monitor", brand: "Genelec", category: "Audio", price: 124_000, cost: 92_000 },
    { sku: "YAMA-RM-CR", name: "Yamaha RM-CR Conference Processor", brand: "Yamaha", category: "Audio", price: 290_000, cost: 220_000 },
    { sku: "SAMS-Q70-65", name: "Samsung Q70 65\" 4K", brand: "Samsung", category: "Displays", price: 240_000, cost: 184_000 },
    { sku: "CREST-TS-1542", name: "Crestron TS-1542 Touch Panel", brand: "Crestron", category: "Control", price: 320_000, cost: 240_000 },
  ];
  const catalog = await Promise.all(
    catalogSpecs.map((c) =>
      prisma.catalogItem.create({
        data: {
          workspaceId: ws.id,
          sku: c.sku,
          name: c.name,
          brand: c.brand,
          category: c.category,
          listPriceCents: c.price,
          costCents: c.cost,
        },
      })
    )
  );

  // Warehouses + inventory
  const warehouses = await Promise.all([
    prisma.warehouse.create({ data: { workspaceId: ws.id, name: "Warehouse 01 — Manhattan", location: "New York, NY" } }),
    prisma.warehouse.create({ data: { workspaceId: ws.id, name: "Warehouse 02 — Brooklyn", location: "Brooklyn, NY" } }),
  ]);
  for (const c of catalog) {
    await prisma.inventoryItem.create({
      data: {
        workspaceId: ws.id,
        warehouseId: warehouses[0].id,
        catalogId: c.id,
        stock: Math.floor(Math.random() * 18) + 4,
        allocated: Math.floor(Math.random() * 8),
        reorderLevel: 4,
      },
    });
  }

  // Vendors + POs
  const vendors = await Promise.all([
    prisma.vendor.create({ data: { workspaceId: ws.id, name: "Crestron Direct", healthScore: 92, avgLeadDays: 9 } }),
    prisma.vendor.create({ data: { workspaceId: ws.id, name: "AVTec Distribution", healthScore: 84, avgLeadDays: 12 } }),
    prisma.vendor.create({ data: { workspaceId: ws.id, name: "Q-SYS Direct", healthScore: 90, avgLeadDays: 14 } }),
    prisma.vendor.create({ data: { workspaceId: ws.id, name: "ProSound Group", healthScore: 78, avgLeadDays: 16 } }),
  ]);
  const poSpecs = [
    { number: "PO-2147", vendor: vendors[0], total: 14_280_000, status: "APPROVED" as const, days: 6 },
    { number: "PO-2145", vendor: vendors[2], total: 8_640_000, status: "PENDING" as const, days: 12 },
    { number: "PO-2142", vendor: vendors[1], total: 3_870_000, status: "DELIVERED" as const, days: -4 },
    { number: "PO-2140", vendor: vendors[3], total: 5_420_000, status: "IN_TRANSIT" as const, days: 9 },
    { number: "PO-2138", vendor: vendors[1], total: 7_290_000, status: "DELIVERED" as const, days: -10 },
  ];
  for (const po of poSpecs) {
    await prisma.purchaseOrder.create({
      data: {
        workspaceId: ws.id,
        vendorId: po.vendor.id,
        number: po.number,
        status: po.status,
        totalCents: po.total,
        expectedDate: po.days >= 0 ? new Date(Date.now() + po.days * 86_400_000) : null,
        receivedAt: po.days < 0 ? new Date(Date.now() + po.days * 86_400_000) : null,
      },
    });
  }

  // Opportunities
  const oppSpecs = [
    { name: "Soho HQ — Phase 1", stage: "DISCOVERY" as const, value: 18_400_000, ai: 72, account: accounts[2] },
    { name: "Lobby digital signage", stage: "DISCOVERY" as const, value: 9_650_000, ai: 58, account: accounts[6] },
    { name: "Boardroom AV upgrade", stage: "DISCOVERY" as const, value: 14_200_000, ai: null, account: accounts[5] },
    { name: "Convention center AV", stage: "PROPOSAL" as const, value: 41_200_000, ai: 84, account: accounts[1] },
    { name: "Conference room set", stage: "PROPOSAL" as const, value: 18_800_000, ai: 76, account: accounts[3] },
    { name: "Hilton restaurant AV", stage: "NEGOTIATION" as const, value: 28_000_000, ai: 88, account: accounts[0] },
    { name: "Studio post-prod", stage: "NEGOTIATION" as const, value: 16_200_000, ai: 71, account: accounts[4] },
    { name: "Westin DSP recommissioning", stage: "CLOSED_WON" as const, value: 9_640_000, ai: 96, account: accounts[1] },
    { name: "Apex AMC renewal", stage: "CLOSED_WON" as const, value: 4_800_000, ai: 100, account: accounts[4] },
  ] as const;
  for (const o of oppSpecs) {
    await prisma.opportunity.create({
      data: {
        workspaceId: ws.id,
        accountId: o.account.id,
        ownerId: users[1].id,
        name: o.name,
        stage: o.stage,
        valueCents: o.value,
        aiScore: o.ai,
        probability: 60,
      },
    });
  }

  // Projects + Rooms + BOQ
  const projectSpecs = [
    { name: "Hilton Garden Inn — Boardroom AV", phase: "COMMISSIONING" as const, value: 18_400_000, progress: 82, account: accounts[0], risk: "LOW" as const, days: 7 },
    { name: "Westin DSP Recommissioning", phase: "INSTALLATION" as const, value: 9_640_000, progress: 64, account: accounts[1], risk: "LOW" as const, days: 14 },
    { name: "Nexus HQ — Phase 2 (Rms 4-8)", phase: "ENGINEERING" as const, value: 41_200_000, progress: 41, account: accounts[2], risk: "HIGH" as const, days: 30 },
    { name: "Apex Studio Control Surface", phase: "PROCUREMENT" as const, value: 16_200_000, progress: 28, account: accounts[4], risk: "MEDIUM" as const, days: 45 },
    { name: "Bloomberg Conference Set", phase: "ENGINEERING" as const, value: 18_800_000, progress: 18, account: accounts[3], risk: "LOW" as const, days: 60 },
  ] as const;
  const projects = [];
  for (const p of projectSpecs) {
    const project = await prisma.project.create({
      data: {
        workspaceId: ws.id,
        accountId: p.account.id,
        name: p.name,
        phase: p.phase,
        contractValueCents: p.value,
        progress: p.progress,
        riskLevel: p.risk,
        dueDate: new Date(Date.now() + p.days * 86_400_000),
      },
    });
    projects.push(project);
    const room = await prisma.room.create({
      data: { workspaceId: ws.id, projectId: project.id, accountId: p.account.id, name: "Boardroom 1", roomType: "BOARDROOM", capacity: 12 },
    });
    await prisma.bOQItem.create({
      data: { projectId: project.id, roomId: room.id, catalogId: catalog[0].id, description: catalog[0].name, quantity: 2, unitPriceCents: catalog[0].listPriceCents },
    });
    await prisma.bOQItem.create({
      data: { projectId: project.id, roomId: room.id, catalogId: catalog[1].id, description: catalog[1].name, quantity: 1, unitPriceCents: catalog[1].listPriceCents },
    });
    await prisma.bOQItem.create({
      data: { projectId: project.id, roomId: room.id, catalogId: catalog[2].id, description: catalog[2].name, quantity: 3, unitPriceCents: catalog[2].listPriceCents },
    });
  }

  // Add extra Rooms across accounts for service-mix variety
  const roomTypes = ["BOARDROOM", "HUDDLE", "TRAINING", "STUDIO", "AUDITORIUM", "LOBBY", "COMMAND_CENTER"] as const;
  for (let i = 0; i < 14; i++) {
    await prisma.room.create({
      data: {
        workspaceId: ws.id,
        accountId: accounts[i % accounts.length].id,
        name: `${roomTypes[i % roomTypes.length]} ${i + 1}`,
        roomType: roomTypes[i % roomTypes.length],
        capacity: 6 + i,
      },
    });
  }

  // Service tickets
  await prisma.serviceTicket.createMany({
    data: [
      { workspaceId: ws.id, accountId: accounts[2].id, projectId: projects[2].id, assigneeId: users[3].id, number: "T-844", title: "Q-SYS Core 110f offline", priority: "P1", status: "OPEN" },
      { workspaceId: ws.id, accountId: accounts[1].id, projectId: projects[1].id, assigneeId: users[3].id, number: "T-841", title: "Conference mic muted on join", priority: "P2", status: "OPEN" },
      { workspaceId: ws.id, accountId: accounts[0].id, projectId: projects[0].id, assigneeId: users[4].id, number: "T-838", title: "DM-NVX video sync loss", priority: "P2", status: "IN_PROGRESS" },
      { workspaceId: ws.id, accountId: accounts[3].id, assigneeId: users[2].id, number: "T-836", title: "Touch panel firmware update", priority: "P3", status: "SCHEDULED" },
      { workspaceId: ws.id, accountId: accounts[4].id, assigneeId: users[5].id, number: "T-832", title: "Quarterly AMC visit", priority: "P3", status: "SCHEDULED" },
      { workspaceId: ws.id, accountId: accounts[0].id, assigneeId: users[3].id, number: "T-828", title: "DSP reset after power outage", priority: "P2", status: "RESOLVED", resolvedAt: new Date(Date.now() - 86400000) },
      { workspaceId: ws.id, accountId: accounts[1].id, assigneeId: users[4].id, number: "T-826", title: "Conference cam auto-focus calibration", priority: "P3", status: "RESOLVED", resolvedAt: new Date(Date.now() - 2 * 86400000) },
    ],
  });

  // AMC
  await prisma.aMCContract.createMany({
    data: [
      { workspaceId: ws.id, accountId: accounts[4].id, name: "Apex Media — Premier AMC", tier: "PREMIER", startDate: new Date(), endDate: new Date(Date.now() + 365 * 86_400_000), visitsTotal: 12, visitsUsed: 4, monthlyValueCents: 480_000, healthScore: 96 },
      { workspaceId: ws.id, accountId: accounts[0].id, name: "Hilton — Standard AMC", tier: "STANDARD", startDate: new Date(), endDate: new Date(Date.now() + 280 * 86_400_000), visitsTotal: 6, visitsUsed: 1, monthlyValueCents: 280_000, healthScore: 88 },
      { workspaceId: ws.id, accountId: accounts[2].id, name: "Nexus — Premier AMC", tier: "PREMIER", startDate: new Date(), endDate: new Date(Date.now() + 220 * 86_400_000), visitsTotal: 12, visitsUsed: 5, monthlyValueCents: 620_000, healthScore: 72 },
    ],
  });

  // Invoices — including 12 months of historical paid invoices for revenue charts
  const monthlyHistoryData: Array<{ monthsAgo: number; amounts: number[]; account: number }> = [
    // Past 12 months — varied amounts to show growth curve
    { monthsAgo: 12, amounts: [4_200_000, 6_800_000], account: 0 },
    { monthsAgo: 11, amounts: [5_400_000, 3_900_000], account: 1 },
    { monthsAgo: 10, amounts: [7_100_000, 4_800_000, 2_600_000], account: 2 },
    { monthsAgo: 9, amounts: [6_300_000, 5_200_000], account: 3 },
    { monthsAgo: 8, amounts: [8_400_000, 4_100_000, 3_300_000], account: 0 },
    { monthsAgo: 7, amounts: [9_800_000, 6_700_000], account: 1 },
    { monthsAgo: 6, amounts: [11_200_000, 5_900_000, 4_200_000], account: 4 },
    { monthsAgo: 5, amounts: [9_400_000, 7_800_000, 3_600_000], account: 2 },
    { monthsAgo: 4, amounts: [12_600_000, 8_200_000], account: 3 },
    { monthsAgo: 3, amounts: [14_100_000, 9_400_000, 5_800_000], account: 0 },
    { monthsAgo: 2, amounts: [13_800_000, 11_200_000, 4_900_000], account: 1 },
    { monthsAgo: 1, amounts: [16_400_000, 9_800_000, 7_200_000], account: 2 },
  ];

  let invCounter = 1000;
  const historyInvoices = monthlyHistoryData.flatMap(({ monthsAgo, amounts, account }) =>
    amounts.map((amount, i) => {
      const issued = new Date();
      issued.setMonth(issued.getMonth() - monthsAgo);
      issued.setDate(5 + i * 7);
      const paid = new Date(issued);
      paid.setDate(paid.getDate() + 18 + Math.floor(Math.random() * 14));
      return {
        workspaceId: ws.id,
        accountId: accounts[(account + i) % accounts.length].id,
        number: `INV-${invCounter++}`,
        status: "PAID" as const,
        totalCents: amount,
        issuedAt: issued,
        paidAt: paid,
        dueAt: new Date(issued.getTime() + 30 * 86_400_000),
      };
    })
  );

  await prisma.invoice.createMany({
    data: [
      // Current outstanding / recent
      { workspaceId: ws.id, accountId: accounts[0].id, projectId: projects[0].id, number: "INV-1182", status: "SENT", totalCents: 8_420_000, issuedAt: new Date(), dueAt: new Date(Date.now() + 14 * 86_400_000) },
      { workspaceId: ws.id, accountId: accounts[1].id, projectId: projects[1].id, number: "INV-1181", status: "OVERDUE", totalCents: 14_200_000, issuedAt: new Date(Date.now() - 40 * 86_400_000), dueAt: new Date(Date.now() - 12 * 86_400_000) },
      { workspaceId: ws.id, accountId: accounts[2].id, number: "INV-1180", status: "SENT", totalCents: 3_840_000, issuedAt: new Date(), dueAt: new Date(Date.now() + 10 * 86_400_000) },
      { workspaceId: ws.id, accountId: accounts[3].id, number: "INV-1178", status: "PAID", totalCents: 9_640_000, issuedAt: new Date(Date.now() - 14 * 86_400_000), paidAt: new Date(Date.now() - 5 * 86_400_000) },
      { workspaceId: ws.id, accountId: accounts[4].id, number: "INV-1175", status: "PAID", totalCents: 2_400_000, issuedAt: new Date(Date.now() - 20 * 86_400_000), paidAt: new Date(Date.now() - 12 * 86_400_000) },
      { workspaceId: ws.id, accountId: accounts[0].id, number: "INV-1172", status: "PAID", totalCents: 12_800_000, issuedAt: new Date(Date.now() - 40 * 86_400_000), paidAt: new Date(Date.now() - 28 * 86_400_000) },
      ...historyInvoices,
    ],
  });

  // Service tickets — historical resolved tickets for SLA chart
  let ticketCounter = 700;
  for (let weeksAgo = 12; weeksAgo >= 1; weeksAgo--) {
    const baseDate = new Date(Date.now() - weeksAgo * 7 * 86_400_000);
    const numTickets = 4 + Math.floor(Math.random() * 4);
    for (let t = 0; t < numTickets; t++) {
      const created = new Date(baseDate.getTime() + t * 12 * 3600_000);
      const slaTarget = new Date(created.getTime() + 24 * 3600_000);
      // 70-90% met SLA, improving over time
      const slaHitRate = 0.7 + (12 - weeksAgo) * 0.015;
      const onTime = Math.random() < slaHitRate;
      const resolved = new Date(created.getTime() + (onTime ? 4 + Math.random() * 18 : 26 + Math.random() * 20) * 3600_000);
      await prisma.serviceTicket.create({
        data: {
          workspaceId: ws.id,
          accountId: accounts[(t + weeksAgo) % accounts.length].id,
          assigneeId: users[3 + (t % 3)].id,
          number: `T-${ticketCounter++}`,
          title: ["DSP firmware update", "Camera calibration", "AMC visit", "Display warm-up issue", "Mic gain reset"][t % 5],
          priority: (["P2", "P3", "P3", "P2", "P4"] as const)[t % 5],
          status: "RESOLVED",
          slaDueAt: slaTarget,
          resolvedAt: resolved,
          createdAt: created,
        },
      });
    }
  }

  // Subscriptions
  await prisma.subscription.createMany({
    data: [
      { workspaceId: ws.id, accountId: accounts[0].id, plan: "Premier AMC", status: "ACTIVE", monthlyCents: 480_000, renewsAt: new Date(Date.now() + 90 * 86_400_000) },
      { workspaceId: ws.id, accountId: accounts[1].id, plan: "Premier AMC ×3", status: "ACTIVE", monthlyCents: 1_240_000, renewsAt: new Date(Date.now() + 150 * 86_400_000) },
      { workspaceId: ws.id, accountId: accounts[3].id, plan: "Premier + Monitoring", status: "ACTIVE", monthlyCents: 620_000, renewsAt: new Date(Date.now() + 200 * 86_400_000) },
    ],
  });

  // Time entries (last 7 days)
  const days = [0, 1, 2, 3, 4, 5, 6];
  const timeData = [
    { userId: users[3].id, projectId: projects[0].id, minutes: [380, 420, 360, 300, 280, 0, 0], billable: 0.92 },
    { userId: users[4].id, projectId: projects[1].id, minutes: [320, 380, 340, 360, 300, 0, 0], billable: 0.88 },
    { userId: users[2].id, projectId: projects[2].id, minutes: [240, 300, 280, 260, 220, 0, 0], billable: 0.78 },
    { userId: users[5].id, projectId: projects[3].id, minutes: [180, 220, 200, 240, 240, 0, 0], billable: 1.0 },
  ];
  for (const t of timeData) {
    for (const d of days) {
      const minutes = t.minutes[d];
      if (minutes === 0) continue;
      await prisma.timeEntry.create({
        data: {
          workspaceId: ws.id,
          userId: t.userId,
          projectId: t.projectId,
          date: new Date(Date.now() - d * 86_400_000),
          minutes,
          billable: Math.random() < t.billable,
        },
      });
    }
  }

  // Todos
  await prisma.todo.createMany({
    data: [
      { workspaceId: ws.id, projectId: projects[1].id, assigneeId: users[0].id, title: "Send signed quote to Marriott legal", priority: "P1", dueDate: new Date() },
      { workspaceId: ws.id, projectId: projects[2].id, assigneeId: users[5].id, title: "Order replacement Q-SYS Core for Nexus", priority: "P1", dueDate: new Date() },
      { workspaceId: ws.id, projectId: projects[0].id, assigneeId: users[3].id, title: "Schedule commissioning walkthrough", priority: "P2", dueDate: new Date(Date.now() + 86_400_000) },
      { workspaceId: ws.id, projectId: projects[3].id, assigneeId: users[2].id, title: "Update DSP file for Bloomberg confs", priority: "P2", dueDate: new Date(Date.now() + 3 * 86_400_000) },
      { workspaceId: ws.id, projectId: projects[4].id, assigneeId: users[4].id, title: "Run preventive maintenance — Apex", priority: "P3", dueDate: new Date(Date.now() + 9 * 86_400_000) },
      { workspaceId: ws.id, projectId: projects[2].id, assigneeId: users[1].id, title: "Draft proposal for Soho HQ Phase 2", priority: "P2", dueDate: new Date(Date.now() + 11 * 86_400_000) },
    ],
  });

  // Calendar events — spread across the current week (Sunday-start)
  const weekStart = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  })();
  const at = (dayOffset: number, hour: number, minute = 0) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  await prisma.calendarEvent.createMany({
    data: [
      // Monday
      { workspaceId: ws.id, userId: users[3].id, title: "Site survey — Nexus Floor 4", startsAt: at(1, 9), endsAt: at(1, 11), location: "Nexus HQ, NYC", eventType: "SITE_VISIT" },
      { workspaceId: ws.id, userId: users[2].id, title: "Crestron review · Hilton AV", startsAt: at(1, 13), endsAt: at(1, 14), location: "Teams", eventType: "MEETING" },
      { workspaceId: ws.id, userId: users[5].id, title: "AMC renewal — Apex Media", startsAt: at(1, 15, 30), endsAt: at(1, 16), location: "Phone", eventType: "MEETING" },
      // Tuesday
      { workspaceId: ws.id, userId: users[4].id, title: "Boardroom install — Hilton", startsAt: at(2, 8), endsAt: at(2, 12), location: "Hilton GI", eventType: "INSTALL" },
      { workspaceId: ws.id, userId: users[1].id, title: "Pipeline review w/ leadership", startsAt: at(2, 14), endsAt: at(2, 15), location: "HQ", eventType: "MEETING" },
      // Wednesday
      { workspaceId: ws.id, userId: users[3].id, title: "DSP commissioning — Westin", startsAt: at(3, 9, 30), endsAt: at(3, 13), location: "Westin TS", eventType: "INSTALL" },
      { workspaceId: ws.id, userId: users[0].id, title: "Marriott QBR", startsAt: at(3, 14), endsAt: at(3, 15, 30), location: "Marriott HQ", eventType: "MEETING" },
      // Thursday
      { workspaceId: ws.id, userId: users[5].id, title: "Quarterly AMC visit — Apex", startsAt: at(4, 10), endsAt: at(4, 12), location: "Apex Studios", eventType: "AMC_VISIT" },
      { workspaceId: ws.id, userId: users[2].id, title: "Bloomberg signal flow review", startsAt: at(4, 13, 30), endsAt: at(4, 15), location: "Teams", eventType: "MEETING" },
      // Friday
      { workspaceId: ws.id, userId: users[4].id, title: "Touch panel firmware push", startsAt: at(5, 9), endsAt: at(5, 10), location: "Bloomberg", eventType: "TASK" },
      { workspaceId: ws.id, userId: users[3].id, title: "Site survey — Soho HQ", startsAt: at(5, 11), endsAt: at(5, 13), location: "Soho NYC", eventType: "SITE_VISIT" },
      { workspaceId: ws.id, userId: users[1].id, title: "Weekly sales standup", startsAt: at(5, 16), endsAt: at(5, 16, 30), location: "Zoom", eventType: "MEETING" },
    ],
  });

  // AV Racks (with starter layouts)
  const projectRooms = await prisma.room.findMany({ where: { workspaceId: ws.id, projectId: { not: null } }, take: 3 });
  await prisma.aVRack.create({
    data: {
      workspaceId: ws.id,
      roomId: projectRooms[0]?.id,
      name: "Hilton GI — Main Rack",
      totalU: 42,
      layoutJson: {
        items: [
          { id: "1", uStart: 40, uHeight: 1, catalogSku: "QSYS-CORE-110F", label: "Q-SYS Core 110f" },
          { id: "2", uStart: 38, uHeight: 2, catalogSku: "CRES-DM-NVX-360", label: "Crestron DM-NVX-360" },
          { id: "3", uStart: 36, uHeight: 1, catalogSku: "EXTR-SMP-351", label: "Extron SMP 351" },
          { id: "4", uStart: 34, uHeight: 2, catalogSku: "BIMP-TES-FORTE", label: "Biamp Tesira Forté X 800" },
          { id: "5", uStart: 32, uHeight: 1, catalogSku: "YAMA-RM-CR", label: "Yamaha RM-CR" },
          { id: "6", uStart: 22, uHeight: 6, catalogSku: null, label: "Patch panel (6U)" },
          { id: "7", uStart: 18, uHeight: 2, catalogSku: null, label: "Network switch" },
          { id: "8", uStart: 2, uHeight: 2, catalogSku: null, label: "UPS — APC SRT3000" },
        ],
      },
    },
  });
  await prisma.aVRack.create({
    data: {
      workspaceId: ws.id,
      roomId: projectRooms[1]?.id,
      name: "Westin — Conference AV Rack",
      totalU: 42,
      layoutJson: {
        items: [
          { id: "1", uStart: 40, uHeight: 1, catalogSku: "QSYS-CORE-110F", label: "Q-SYS Core 110f" },
          { id: "2", uStart: 38, uHeight: 2, catalogSku: "CRES-DM-NVX-360", label: "Crestron DM-NVX-360" },
          { id: "3", uStart: 36, uHeight: 1, catalogSku: "CREST-TS-1542", label: "Crestron Touch Panel Driver" },
        ],
      },
    },
  });

  // Signal Flow diagrams — CAD/technical style with port-level connections
  const port = (id: string, label: string, type: string, direction: "in" | "out") => ({
    id,
    label,
    type,
    direction,
  });

  await prisma.signalFlow.create({
    data: {
      workspaceId: ws.id,
      roomId: projectRooms[0]?.id,
      name: "Hilton GI — Boardroom Signal Flow",
      diagramJson: {
        nodes: [
          // Endpoints — left column
          {
            id: "podium-pc",
            category: "endpoint",
            title: "PODIUM PC",
            subtitle: "HDMI",
            endpointIcon: "pc",
            x: 60, y: 80, width: 110,
            ports: [port("out", "HDMI", "HDMI", "out")],
          },
          {
            id: "laptop-byod",
            category: "endpoint",
            title: "LAPTOP (BYOD)",
            subtitle: "HDMI",
            endpointIcon: "laptop",
            x: 60, y: 170, width: 110,
            ports: [port("out", "HDMI", "HDMI", "out")],
          },
          {
            id: "visualizer",
            category: "endpoint",
            title: "VISUALIZER",
            subtitle: "HDMI",
            endpointIcon: "pc",
            x: 60, y: 260, width: 110,
            ports: [port("out", "HDMI", "HDMI", "out")],
          },
          // Microphones
          {
            id: "shure-sm58-1",
            category: "endpoint",
            title: "SHURE SM58 (1)",
            endpointIcon: "mic",
            x: 60, y: 380, width: 110,
            ports: [port("out", "RF", "WIRELESS", "out")],
          },
          {
            id: "shure-sm58-2",
            category: "endpoint",
            title: "SHURE SM58 (2)",
            endpointIcon: "mic",
            x: 60, y: 460, width: 110,
            ports: [port("out", "RF", "WIRELESS", "out")],
          },
          {
            id: "shure-wl183-1",
            category: "endpoint",
            title: "SHURE WL183 (1)",
            endpointIcon: "mic",
            x: 60, y: 540, width: 110,
            ports: [port("out", "RF", "WIRELESS", "out")],
          },
          {
            id: "shure-wl183-2",
            category: "endpoint",
            title: "SHURE WL183 (2)",
            endpointIcon: "mic",
            x: 60, y: 620, width: 110,
            ports: [port("out", "RF", "WIRELESS", "out")],
          },
          // Main switcher
          {
            id: "switcher",
            category: "switcher",
            title: "SWITCHER",
            brand: "EXTRON",
            model: "DTP CROSSPOINT 86 4K IPCP SA",
            x: 270, y: 40, width: 260,
            ports: [
              port("hdmi-in-1", "HDMI IN 1", "HDMI", "in"),
              port("hdmi-in-2", "HDMI IN 2", "HDMI", "in"),
              port("hdmi-in-3", "HDMI IN 3", "HDMI", "in"),
              port("hdmi-in-4", "HDMI IN 4", "HDMI", "in"),
              port("dtp-in-1",  "DTP IN 1",  "RJ45", "in"),
              port("av-lan-1",  "AV LAN 1",  "RJ45", "in"),
              port("hdmi-out-1","HDMI OUT 1","HDMI", "out"),
              port("hdmi-out-2","HDMI OUT 2","HDMI", "out"),
              port("dtp-out-1", "DTP OUT 1", "RJ45", "out"),
              port("dtp-out-2", "DTP OUT 2", "RJ45", "out"),
              port("av-lan-2",  "AV LAN 2",  "RJ45", "out"),
              port("usb-a",     "USB-A",     "TYPE-A","out"),
            ],
          },
          // LED Controller
          {
            id: "led-ctrl",
            category: "led-controller",
            title: "LED CONTROLLER",
            brand: "LED PROCESSOR",
            model: "HDMI → CAT6",
            x: 680, y: 40, width: 220,
            ports: [
              port("hdmi-in", "HDMI IN", "HDMI", "in"),
              port("network", "NETWORK", "RJ45", "in"),
              port("power",   "POWER",   "EC",   "in"),
              port("out-1",   "OUTPUT 1", "RJ45", "out"),
              port("out-2",   "OUTPUT 2", "RJ45", "out"),
              port("out-3",   "OUTPUT 3", "RJ45", "out"),
            ],
          },
          // Active LED Wall
          {
            id: "led-wall",
            category: "endpoint",
            title: "ACTIVE LED WALL",
            subtitle: "CAT6 driven",
            endpointIcon: "led-wall",
            x: 1000, y: 40, width: 160,
            ports: [port("in", "CAT6 IN", "RJ45", "in")],
          },
          // Amplifier
          {
            id: "amp",
            category: "amplifier",
            title: "AMPLIFIER",
            brand: "QSC",
            model: "SPA2-200",
            x: 270, y: 380, width: 220,
            ports: [
              port("line-in-1", "LINE IN 1", "PLUG", "in"),
              port("line-in-2", "LINE IN 2", "PLUG", "in"),
              port("remote",    "REMOTE",    "PIN-EP", "in"),
              port("power",     "POWER",     "EC",     "in"),
              port("sp-out-1",  "SPEAKER OP 1", "PLUG", "out"),
              port("sp-out-2",  "SPEAKER OP 2", "PLUG", "out"),
              port("gpio",      "GPIO",      "PIN-EP", "out"),
            ],
          },
          // DSP Processor
          {
            id: "dsp",
            category: "processor",
            title: "PROCESSOR",
            brand: "EXTRON",
            model: "DMP 128 PLUS C V AT",
            x: 600, y: 320, width: 280,
            ports: [
              port("dante-pri", "DANTE A (PRI)", "RJ45", "in"),
              port("dante-sec", "DANTE B (SEC)", "RJ45", "in"),
              port("mic-1", "MIC/LINE IN 1", "PLUG", "in"),
              port("mic-2", "MIC/LINE IN 2", "PLUG", "in"),
              port("mic-3", "MIC/LINE IN 3", "PLUG", "in"),
              port("mic-4", "MIC/LINE IN 4", "PLUG", "in"),
              port("mic-5", "MIC/LINE IN 5", "PLUG", "in"),
              port("mic-6", "MIC/LINE IN 6", "PLUG", "in"),
              port("av-lan", "AV LAN", "RJ45", "in"),
              port("line-out-1", "LINE OP 1", "PLUG", "out"),
              port("line-out-2", "LINE OP 2", "PLUG", "out"),
              port("line-out-3", "LINE OP 3", "PLUG", "out"),
              port("line-out-4", "LINE OP 4", "PLUG", "out"),
              port("usb-aud", "USB AUDIO", "TYPE-A", "out"),
              port("gpio", "GPIO", "PIN-EP", "out"),
            ],
          },
          // DTP Receiver
          {
            id: "receiver",
            category: "receiver",
            title: "RECEIVER",
            brand: "EXTRON",
            model: "DTP HDMI 4K 330 RX",
            x: 270, y: 600, width: 240,
            ports: [
              port("dtp-in", "DTP IN 1", "RJ45", "in"),
              port("ir-in", "IR OVER DTP", "PLUG", "in"),
              port("power", "POWER", "PLUG", "in"),
              port("hdmi-out", "HDMI OP 1", "HDMI", "out"),
              port("audio-lr", "AUDIO L/R", "PLUG", "out"),
              port("rs232-out", "RS232 OUT", "PIN-EP", "out"),
            ],
          },
          // Rear Display
          {
            id: "rear-display",
            category: "endpoint",
            title: "REAR DISPLAY",
            subtitle: "via Receiver (HDMI)",
            endpointIcon: "tv",
            x: 1000, y: 320, width: 160,
            ports: [port("in", "HDMI", "HDMI", "in")],
          },
          // Speakers
          {
            id: "speaker-1",
            category: "endpoint",
            title: "QSC AD-S162T-W (1)",
            endpointIcon: "speaker",
            x: 1000, y: 460, width: 160,
            ports: [port("in", "SPK", "PLUG", "in")],
          },
          {
            id: "speaker-2",
            category: "endpoint",
            title: "QSC AD-S162T-W (2)",
            endpointIcon: "speaker",
            x: 1000, y: 540, width: 160,
            ports: [port("in", "SPK", "PLUG", "in")],
          },
          // Network Switch
          {
            id: "network",
            category: "network",
            title: "NETWORK SWITCH",
            brand: "CISCO",
            model: "CBS220-24T-4G",
            x: 680, y: 660, width: 260,
            ports: [
              port("lan-1", "LAN PORT 1", "RJ45", "in"),
              port("lan-2", "LAN PORT 2", "RJ45", "in"),
              port("lan-3", "LAN PORT 3", "RJ45", "in"),
              port("lan-4", "LAN PORT 4", "RJ45", "in"),
              port("lan-5", "LAN PORT 5", "RJ45", "in"),
              port("lan-6", "LAN PORT 6", "RJ45", "in"),
              port("sfp-1", "SFP+ 1", "OPTICAL", "in"),
              port("lan-out-13", "LAN PORT 13", "RJ45", "out"),
              port("lan-out-14", "LAN PORT 14", "RJ45", "out"),
              port("lan-out-15", "LAN PORT 15", "RJ45", "out"),
              port("lan-out-16", "LAN PORT 16", "RJ45", "out"),
              port("mgmt", "MGMT", "RJ45", "out"),
            ],
          },
          // Access Point
          {
            id: "access-point",
            category: "access-point",
            title: "ACCESS POINT",
            brand: "SHURE",
            model: "MXWAPX4+-Z11",
            x: 410, y: 800, width: 220,
            ports: [
              port("usb-c", "USB-C", "TYPE-C", "in"),
              port("lan-poe", "LAN / PoE", "RJ45", "in"),
              port("reset", "RESET", "BTN", "in"),
              port("ant-a", "ANT A", "SMA", "out"),
              port("ant-b", "ANT B", "SMA", "out"),
              port("gpio", "GPIO", "PIN-EP", "out"),
            ],
          },
          // Recharging Station
          {
            id: "recharger",
            category: "recharging-station",
            title: "RECHARGING STATION",
            brand: "SHURE",
            model: "MXWNDX",
            x: 60, y: 800, width: 220,
            ports: [
              port("bay-1", "BAY 1", "DOCK", "in"),
              port("bay-2", "BAY 2", "DOCK", "in"),
              port("bay-3", "BAY 3", "DOCK", "in"),
              port("bay-4", "BAY 4", "DOCK", "in"),
              port("power", "POWER", "EC", "in"),
              port("network", "NETWORK", "RJ45", "out"),
              port("usb", "USB", "TYPE-B", "out"),
            ],
          },
        ],
        edges: [
          // Sources → Switcher (HDMI)
          { id: "e1", from: { nodeId: "podium-pc",   portId: "out" }, to: { nodeId: "switcher", portId: "hdmi-in-1" }, signal: "hdmi", label: "HDMI" },
          { id: "e2", from: { nodeId: "laptop-byod", portId: "out" }, to: { nodeId: "switcher", portId: "hdmi-in-2" }, signal: "hdmi", label: "HDMI" },
          { id: "e3", from: { nodeId: "visualizer",  portId: "out" }, to: { nodeId: "switcher", portId: "hdmi-in-3" }, signal: "hdmi", label: "HDMI" },
          // Mics → DSP via wireless to access point then to DSP
          { id: "e4", from: { nodeId: "shure-sm58-1",  portId: "out" }, to: { nodeId: "access-point", portId: "ant-a" }, signal: "wireless", label: "Wi-Fi" },
          { id: "e5", from: { nodeId: "shure-sm58-2",  portId: "out" }, to: { nodeId: "access-point", portId: "ant-a" }, signal: "wireless", label: "Wi-Fi" },
          { id: "e6", from: { nodeId: "shure-wl183-1", portId: "out" }, to: { nodeId: "access-point", portId: "ant-b" }, signal: "wireless", label: "Wi-Fi" },
          { id: "e7", from: { nodeId: "shure-wl183-2", portId: "out" }, to: { nodeId: "access-point", portId: "ant-b" }, signal: "wireless", label: "Wi-Fi" },
          // Access Point → Network (LAN PoE) → DSP (Dante)
          { id: "e8", from: { nodeId: "access-point", portId: "lan-poe" }, to: { nodeId: "network", portId: "lan-1" }, signal: "network", label: "LAN PoE" },
          { id: "e9", from: { nodeId: "network", portId: "lan-out-13" }, to: { nodeId: "dsp", portId: "dante-pri" }, signal: "dante", label: "DANTE" },
          // Switcher → LED Controller (HDMI)
          { id: "e10", from: { nodeId: "switcher", portId: "hdmi-out-1" }, to: { nodeId: "led-ctrl", portId: "hdmi-in" }, signal: "hdmi", label: "HDMI" },
          // LED Controller → LED Wall (CAT6)
          { id: "e11", from: { nodeId: "led-ctrl", portId: "out-1" }, to: { nodeId: "led-wall", portId: "in" }, signal: "cat6", label: "CAT6" },
          // Switcher → Receiver (DTP)
          { id: "e12", from: { nodeId: "switcher", portId: "dtp-out-1" }, to: { nodeId: "receiver", portId: "dtp-in" }, signal: "cat6", label: "DTP" },
          // Receiver → Rear Display (HDMI)
          { id: "e13", from: { nodeId: "receiver", portId: "hdmi-out" }, to: { nodeId: "rear-display", portId: "in" }, signal: "hdmi", label: "HDMI" },
          // DSP → Amplifier
          { id: "e14", from: { nodeId: "dsp", portId: "line-out-1" }, to: { nodeId: "amp", portId: "line-in-1" }, signal: "balanced", label: "Bal" },
          { id: "e15", from: { nodeId: "dsp", portId: "line-out-2" }, to: { nodeId: "amp", portId: "line-in-2" }, signal: "balanced", label: "Bal" },
          // Amplifier → Speakers
          { id: "e16", from: { nodeId: "amp", portId: "sp-out-1" }, to: { nodeId: "speaker-1", portId: "in" }, signal: "speaker", label: "SPK" },
          { id: "e17", from: { nodeId: "amp", portId: "sp-out-2" }, to: { nodeId: "speaker-2", portId: "in" }, signal: "speaker", label: "SPK" },
          // Recharger → Network
          { id: "e18", from: { nodeId: "recharger", portId: "network" }, to: { nodeId: "network", portId: "lan-3" }, signal: "network", label: "LAN" },
          // Switcher → Network (control LAN)
          { id: "e19", from: { nodeId: "switcher", portId: "av-lan-2" }, to: { nodeId: "network", portId: "lan-5" }, signal: "network", label: "LAN" },
        ],
      },
    },
  });

  await prisma.signalFlow.create({
    data: {
      workspaceId: ws.id,
      roomId: projectRooms[1]?.id,
      name: "Westin — Recommissioning Flow",
      diagramJson: {
        nodes: [
          {
            id: "mic-1",
            category: "endpoint",
            title: "BEAMFORMING MIC",
            endpointIcon: "mic",
            x: 60, y: 120, width: 130,
            ports: [port("out", "DANTE", "RJ45", "out")],
          },
          {
            id: "cam-1",
            category: "endpoint",
            title: "PTZ CAMERA",
            endpointIcon: "camera",
            x: 60, y: 240, width: 130,
            ports: [port("out", "HDMI", "HDMI", "out")],
          },
          {
            id: "dsp-1",
            category: "processor",
            title: "PROCESSOR",
            brand: "BIAMP",
            model: "TESIRA FORTÉ X 800",
            x: 300, y: 140, width: 240,
            ports: [
              port("dante-in", "DANTE IN", "RJ45", "in"),
              port("hdmi-in", "HDMI IN", "HDMI", "in"),
              port("line-out-1", "LINE OP 1", "PLUG", "out"),
              port("usb-aud", "USB AUDIO", "TYPE-A", "out"),
            ],
          },
          {
            id: "zoom-1",
            category: "endpoint",
            title: "ZOOM ROOM",
            endpointIcon: "tv",
            x: 660, y: 120, width: 140,
            ports: [port("in", "USB", "TYPE-A", "in")],
          },
          {
            id: "sp-1",
            category: "endpoint",
            title: "GENELEC 8030C",
            endpointIcon: "speaker",
            x: 660, y: 240, width: 140,
            ports: [port("in", "BAL", "PLUG", "in")],
          },
        ],
        edges: [
          { id: "we1", from: { nodeId: "mic-1", portId: "out" }, to: { nodeId: "dsp-1", portId: "dante-in" }, signal: "dante", label: "DANTE" },
          { id: "we2", from: { nodeId: "cam-1", portId: "out" }, to: { nodeId: "dsp-1", portId: "hdmi-in" }, signal: "hdmi", label: "HDMI" },
          { id: "we3", from: { nodeId: "dsp-1", portId: "usb-aud" }, to: { nodeId: "zoom-1", portId: "in" }, signal: "network", label: "USB" },
          { id: "we4", from: { nodeId: "dsp-1", portId: "line-out-1" }, to: { nodeId: "sp-1", portId: "in" }, signal: "balanced", label: "Bal" },
        ],
      },
    },
  });

  // Devices — populated from catalog into the project rooms
  const allRooms = await prisma.room.findMany({ where: { workspaceId: ws.id, projectId: { not: null } } });
  const deviceSeeds: Array<{
    sku: string;
    roomIdx: number;
    serial: string;
    ip: string;
    mac: string;
    firmware: string;
    status: "ONLINE" | "OFFLINE" | "WARNING" | "RETIRED";
    minutesAgo: number;
  }> = [
    // Hilton boardroom (room 0)
    { sku: "QSYS-CORE-110F",   roomIdx: 0, serial: "QSC-CORE-110F-A4172", ip: "10.20.4.10",  mac: "00:60:74:A4:17:2C", firmware: "9.10.0",  status: "ONLINE",  minutesAgo: 2 },
    { sku: "CRES-DM-NVX-360",  roomIdx: 0, serial: "CRES-NVX-360-B2204", ip: "10.20.4.11",  mac: "00:1A:2B:B2:20:4D", firmware: "4.0.99",  status: "ONLINE",  minutesAgo: 1 },
    { sku: "SHRE-MXA920",      roomIdx: 0, serial: "SHR-MXA920-C8841",   ip: "10.20.4.20",  mac: "5C:F0:64:C8:84:1E", firmware: "1.4.1",   status: "ONLINE",  minutesAgo: 4 },
    { sku: "SONY-BRAVIA-85",   roomIdx: 0, serial: "SNY-BRAVIA85-D1102", ip: "10.20.4.30",  mac: "AC:9B:0A:D1:10:24", firmware: "Sony-PR0.4.2", status: "WARNING", minutesAgo: 42 },
    // Westin DSP recom (room 1)
    { sku: "QSYS-CORE-110F",   roomIdx: 1, serial: "QSC-CORE-110F-A4188", ip: "10.30.2.10",  mac: "00:60:74:A4:18:80", firmware: "9.10.0",  status: "ONLINE",  minutesAgo: 6 },
    { sku: "BIMP-TES-FORTE",   roomIdx: 1, serial: "BMP-FORTE-E5510",    ip: "10.30.2.12",  mac: "00:90:5E:E5:51:01", firmware: "4.5.2",   status: "OFFLINE", minutesAgo: 178 },
    { sku: "EXTR-SMP-351",     roomIdx: 1, serial: "EXT-SMP351-F2240",   ip: "10.30.2.13",  mac: "00:05:A6:F2:24:09", firmware: "2.16",    status: "ONLINE",  minutesAgo: 8 },
    // Nexus HQ (room 2 if present)
    { sku: "CREST-TS-1542",    roomIdx: 2, serial: "CRES-TS1542-G8801",  ip: "10.40.1.40",  mac: "00:1A:2B:G8:80:11", firmware: "2.014",   status: "ONLINE",  minutesAgo: 3 },
    { sku: "POLY-STUDIO-X70",  roomIdx: 2, serial: "POL-X70-H7720",      ip: "10.40.1.50",  mac: "64:16:7F:H7:72:0F", firmware: "3.10.3",  status: "ONLINE",  minutesAgo: 12 },
    { sku: "YAMA-RM-CR",       roomIdx: 2, serial: "YMH-RMCR-I9930",     ip: "10.40.1.51",  mac: "00:A0:DE:I9:93:0A", firmware: "1.6.2",   status: "WARNING", minutesAgo: 28 },
    // Apex Studio (room 3)
    { sku: "LOGI-RALLY-BAR",   roomIdx: 3, serial: "LGI-RALLY-J3315",    ip: "10.50.1.10",  mac: "00:E0:4C:J3:31:55", firmware: "v2.1.85", status: "ONLINE",  minutesAgo: 5 },
    { sku: "GENL-8030C",       roomIdx: 3, serial: "GEN-8030C-K6612",    ip: "—",           mac: "—",                 firmware: "—",       status: "ONLINE",  minutesAgo: 0 },
    // Bloomberg (room 4)
    { sku: "QSYS-CORE-110F",   roomIdx: 4, serial: "QSC-CORE-110F-L2211", ip: "10.60.3.10", mac: "00:60:74:L2:21:13", firmware: "9.10.0",  status: "ONLINE",  minutesAgo: 1 },
    { sku: "SAMS-Q70-65",      roomIdx: 4, serial: "SMS-Q70-65-M5544",   ip: "10.60.3.30",  mac: "08:08:C2:M5:54:42", firmware: "T-MSL-6.0", status: "ONLINE", minutesAgo: 14 },
    // Retired
    { sku: "EXTR-SMP-351",     roomIdx: 0, serial: "EXT-SMP351-Z0001",   ip: "—",           mac: "—",                 firmware: "1.10",    status: "RETIRED", minutesAgo: 60 * 24 * 14 },
  ];

  for (const d of deviceSeeds) {
    const room = allRooms[d.roomIdx];
    if (!room) continue;
    const cat = catalog.find((c) => c.sku === d.sku);
    if (!cat) continue;
    await prisma.device.create({
      data: {
        workspaceId: ws.id,
        roomId: room.id,
        catalogId: cat.id,
        serialNumber: d.serial,
        ipAddress: d.ip === "—" ? null : d.ip,
        macAddress: d.mac === "—" ? null : d.mac,
        firmware: d.firmware === "—" ? null : d.firmware,
        status: d.status,
        lastSeenAt: new Date(Date.now() - d.minutesAgo * 60_000),
      },
    });
  }

  console.log("✓ Seeded workspace:", ws.name);
  console.log("  Accounts:", accounts.length, "· Projects:", projects.length, "· Catalog items:", catalog.length);
  console.log("  + AV Racks: 2, Signal Flows: 2, Devices:", deviceSeeds.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
