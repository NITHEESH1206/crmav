import type { AvCategory } from "./categories";

export type CatalogSeed = {
  sku: string;
  name: string;
  brand: string;
  category: AvCategory;
  description: string;
  listPriceCents: number;
  costCents: number;
  /** Free-form key/values surfaced in the catalog detail + used by the BOQ builder. */
  specs?: Record<string, string | number | boolean>;
  /** Optional manufacturer datasheet URL. */
  datasheetUrl?: string;
};

/**
 * Curated production AV catalog — real model numbers across the most-specified
 * brands in commercial integration. Prices are USD list (educated estimates,
 * usually within ±10% of street). Cost is set at ~60% of list as a default
 * margin assumption.
 *
 * Extend by appending to this array; the seed script upserts by SKU so reruns
 * are idempotent.
 */

const m = (list: number, costRatio = 0.6) => ({
  listPriceCents: Math.round(list * 100),
  costCents: Math.round(list * 100 * costRatio),
});

export const CATALOG: CatalogSeed[] = [
  // ───────────────────────────────────────────────────────────────────
  // DISPLAYS — Samsung
  // ───────────────────────────────────────────────────────────────────
  { sku: "SAM-QM65R", brand: "Samsung", category: "Display", name: "QM65R 65\" UHD Display",
    description: "Commercial 4K UHD display with MagicInfo, 500 nits, 24/7 rated.",
    specs: { size: "65\"", resolution: "3840x2160", brightness: "500 nits", inputs: "HDMI 2.0 x2, DP" },
    ...m(2800) },
  { sku: "SAM-QM75R", brand: "Samsung", category: "Display", name: "QM75R 75\" UHD Display",
    description: "Commercial 4K display, 500 nits, signage-ready.",
    specs: { size: "75\"", brightness: "500 nits" }, ...m(4200) },
  { sku: "SAM-QM85R", brand: "Samsung", category: "Display", name: "QM85R 85\" UHD Display",
    description: "Large-format 85\" 4K signage display.",
    specs: { size: "85\"", brightness: "500 nits" }, ...m(6800) },
  { sku: "SAM-QM98R", brand: "Samsung", category: "Display", name: "QM98R 98\" UHD Display",
    description: "98\" signage display for boardrooms and atriums.",
    specs: { size: "98\"", brightness: "500 nits" }, ...m(13500) },
  { sku: "SAM-WM75B", brand: "Samsung", category: "Display - Interactive", name: "WM75B Interactive Display",
    description: "75\" interactive 4K display with InGlass touch and embedded apps.",
    specs: { size: "75\"", touchPoints: 20 }, ...m(5400) },
  { sku: "SAM-IA012B", brand: "Samsung", category: "Display - Video Wall LED", name: "IA012B 1.2mm LED Cabinet",
    description: "Direct-view LED cabinet, P1.2 pixel pitch, ideal for indoor video walls.",
    specs: { pitch: "1.2mm", cabinet: "480x270mm" }, ...m(3200) },
  { sku: "SAM-OH75A", brand: "Samsung", category: "Display - Outdoor", name: "OH75A 75\" Outdoor Display",
    description: "IP56 outdoor 4K display, 3500 nits, weatherproof signage.",
    specs: { size: "75\"", brightness: "3500 nits", ip: "IP56" }, ...m(17500) },

  // DISPLAYS — LG
  { sku: "LG-65UH5N", brand: "LG", category: "Display", name: "65UH5N 65\" UHD Signage",
    description: "Commercial UHD display with webOS 6.0, 500 nits.",
    specs: { size: "65\"", brightness: "500 nits" }, ...m(2600) },
  { sku: "LG-75UH5N", brand: "LG", category: "Display", name: "75UH5N 75\" UHD Signage",
    description: "75\" UHD commercial display with webOS.",
    specs: { size: "75\"" }, ...m(4000) },
  { sku: "LG-86UH5N", brand: "LG", category: "Display", name: "86UH5N 86\" UHD Signage",
    description: "86\" 4K signage for large meeting spaces.", ...m(6400) },
  { sku: "LG-98UH5N", brand: "LG", category: "Display", name: "98UH5N 98\" UHD Signage",
    description: "98\" commercial 4K display.", ...m(14200) },
  { sku: "LG-86TR3PJ", brand: "LG", category: "Display - Interactive", name: "86TR3PJ-B Interactive",
    description: "86\" 4K interactive display, 20-point touch, education-grade.",
    specs: { size: "86\"", touchPoints: 20 }, ...m(6200) },
  { sku: "LG-LSAB009", brand: "LG", category: "Display - Video Wall LED", name: "LSAB009 1.5mm LED Cabinet",
    description: "1.5mm pitch direct-view LED, 600x337.5mm cabinet.",
    specs: { pitch: "1.5mm" }, ...m(2900) },

  // DISPLAYS — Sony Pro
  { sku: "SONY-FW65BZ40H", brand: "Sony", category: "Display", name: "BRAVIA FW-65BZ40H",
    description: "65\" 4K BRAVIA professional display, 700 nits, X1 processor.", ...m(3500) },
  { sku: "SONY-FW75BZ40H", brand: "Sony", category: "Display", name: "BRAVIA FW-75BZ40H",
    description: "75\" 4K BRAVIA professional display, 700 nits.", ...m(5200) },
  { sku: "SONY-FW85BZ40H", brand: "Sony", category: "Display", name: "BRAVIA FW-85BZ40H",
    description: "85\" 4K BRAVIA professional display, 700 nits.", ...m(7800) },
  { sku: "SONY-FW98BZ50L", brand: "Sony", category: "Display", name: "BRAVIA FW-98BZ50L",
    description: "98\" 4K BRAVIA professional display, 780 nits.", ...m(17500) },

  // DISPLAYS — NEC/Sharp
  { sku: "NEC-M651", brand: "NEC", category: "Display", name: "MultiSync M651 65\" UHD",
    description: "65\" 4K commercial display with built-in media player.", ...m(2400) },
  { sku: "NEC-M751", brand: "NEC", category: "Display", name: "MultiSync M751 75\" UHD",
    description: "75\" 4K commercial display.", ...m(4100) },
  { sku: "NEC-M861", brand: "NEC", category: "Display", name: "MultiSync M861 86\" UHD",
    description: "86\" 4K commercial display.", ...m(6100) },
  { sku: "NEC-V554Q", brand: "NEC", category: "Display", name: "V554Q 55\" UHD",
    description: "55\" commercial 4K, 24/7 rated.", ...m(1850) },

  // PROJECTORS
  { sku: "SONY-VPLPHZ60", brand: "Sony", category: "Projector", name: "VPL-PHZ60 Laser Projector",
    description: "WUXGA laser projector, 6000 lumens, 20,000h life.",
    specs: { lumens: 6000, resolution: "WUXGA" }, ...m(4900) },
  { sku: "SONY-VPLFHZ91", brand: "Sony", category: "Projector", name: "VPL-FHZ91 Installation Projector",
    description: "WUXGA laser, 9000 lumens, lens shift.",
    specs: { lumens: 9000 }, ...m(13500) },
  { sku: "EPSON-L1505U", brand: "Epson", category: "Projector", name: "Pro L1505UHNL",
    description: "12,000 lumen WUXGA laser installation projector (no lens).",
    specs: { lumens: 12000 }, ...m(11800) },
  { sku: "PANA-PTRZ31K", brand: "Panasonic", category: "Projector", name: "PT-RZ31KU 31,000 Lumen",
    description: "31,000-lumen 3-chip DLP laser projector for auditoriums.",
    specs: { lumens: 31000 }, ...m(89000) },
  { sku: "EPSON-EBPU2220B", brand: "Epson", category: "Projector", name: "EB-PU2220B",
    description: "20,000 lumen WUXGA installation laser projector.",
    specs: { lumens: 20000 }, ...m(22500) },

  // ───────────────────────────────────────────────────────────────────
  // CRESTRON
  // ───────────────────────────────────────────────────────────────────
  { sku: "CRES-DMNVX360", brand: "Crestron", category: "AVoIP Encoder", name: "DM-NVX-360 Encoder/Decoder",
    description: "4K60 4:4:4 HDR encoder/decoder over 1GbE network. Pixel-perfect.",
    specs: { resolution: "4K60 4:4:4", network: "1GbE" }, ...m(2295) },
  { sku: "CRES-DMNVX352", brand: "Crestron", category: "AVoIP Decoder", name: "DM-NVX-352 Decoder",
    description: "Wall-plate AVoIP decoder, 4K60 4:4:4.", ...m(1995) },
  { sku: "CRES-DMNVXE30", brand: "Crestron", category: "AVoIP Encoder", name: "DM-NVX-E30 Wall-Plate Encoder",
    description: "Wall-plate transmitter for BYOD AVoIP.", ...m(1495) },
  { sku: "CRES-DMNVXD30", brand: "Crestron", category: "AVoIP Decoder", name: "DM-NVX-D30 Wall-Plate Decoder",
    description: "Wall-plate AVoIP decoder, USB & analog audio.", ...m(1495) },
  { sku: "CRES-DMMD8X8", brand: "Crestron", category: "Video Switcher", name: "DM-MD8X8 8x8 4K Matrix",
    description: "8x8 4K DigitalMedia presentation switcher chassis.", ...m(18500) },
  { sku: "CRES-DMMD16X16", brand: "Crestron", category: "Video Switcher", name: "DM-MD16X16 16x16 Matrix",
    description: "16x16 4K DigitalMedia matrix.", ...m(28500) },
  { sku: "CRES-DMMD32X32", brand: "Crestron", category: "Video Switcher", name: "DM-MD32X32 32x32 Matrix",
    description: "32x32 4K modular DigitalMedia matrix chassis.", ...m(54000) },
  { sku: "CRES-DMPS3-4K-150-C", brand: "Crestron", category: "Video Switcher", name: "DMPS3-4K-150-C",
    description: "All-in-one 4K presentation system with audio + control.", ...m(7200) },
  { sku: "CRES-NVXDIR", brand: "Crestron", category: "AVoIP Other", name: "DM NVX Director",
    description: "AVoIP system management & routing controller.", ...m(2895) },
  { sku: "CRES-MC4", brand: "Crestron", category: "Control - Processor", name: "Crestron MC4 Control System",
    description: "4-series control processor for medium installations.", ...m(1995) },
  { sku: "CRES-CP4", brand: "Crestron", category: "Control - Processor", name: "Crestron CP4 Control Processor",
    description: "Enterprise-grade 4-series control processor.", ...m(3995) },
  { sku: "CRES-PRO4", brand: "Crestron", category: "Control - Processor", name: "Crestron PRO4 Control Processor",
    description: "Top-tier 4-series control processor with dual-LAN.", ...m(5995) },
  { sku: "CRES-TSW770", brand: "Crestron", category: "Control - Touch Panel", name: "TSW-770 7\" Touch Screen",
    description: "7\" wall-mount touch screen with HD voice & camera.", ...m(1795) },
  { sku: "CRES-TSW1070", brand: "Crestron", category: "Control - Touch Panel", name: "TSW-1070 10.1\" Touch Screen",
    description: "10.1\" wall-mount touch screen.", ...m(2395) },
  { sku: "CRES-MTM1", brand: "Crestron", category: "Control - Touch Panel", name: "Crestron Mercury MTM-1",
    description: "Tabletop touch console for native MS Teams / Zoom Rooms.", ...m(995) },

  // ───────────────────────────────────────────────────────────────────
  // EXTRON
  // ───────────────────────────────────────────────────────────────────
  { sku: "EXT-DTP3T211", brand: "Extron", category: "AVoIP Encoder", name: "DTP3 T 211 4K Transmitter",
    description: "DTP3 HDMI 4K/60 transmitter over twisted pair, 330ft.", ...m(2295) },
  { sku: "EXT-DTP3R211", brand: "Extron", category: "AVoIP Decoder", name: "DTP3 R 211 4K Receiver",
    description: "DTP3 HDMI 4K/60 receiver with PoE.", ...m(2295) },
  { sku: "EXT-IN1606", brand: "Extron", category: "Video Switcher", name: "IN1606 6-Input Scaler",
    description: "Six-input HDCP-compliant scaling presentation switcher.", ...m(2950) },
  { sku: "EXT-IN1808", brand: "Extron", category: "Video Switcher", name: "IN1808 8-Input Scaler",
    description: "Eight-input 4K scaling presentation switcher.", ...m(4250) },
  { sku: "EXT-SMP351", brand: "Extron", category: "AVoIP Other", name: "SMP 351 Streaming Recorder",
    description: "H.264 streaming media processor, dual-channel HD recording.", ...m(5995) },
  { sku: "EXT-IPCPPRO350", brand: "Extron", category: "Control - Processor", name: "IPCP Pro 350",
    description: "Mid-tier IP-link Pro control processor.", ...m(1895) },
  { sku: "EXT-IPCPPRO555", brand: "Extron", category: "Control - Processor", name: "IPCP Pro 555",
    description: "Top-of-line IP-link Pro control processor.", ...m(3995) },
  { sku: "EXT-TLPPRO720T", brand: "Extron", category: "Control - Touch Panel", name: "TLP Pro 720T 7\" Touch Panel",
    description: "7\" tabletop touch panel with PoE.", ...m(1495) },
  { sku: "EXT-TLPPRO1025T", brand: "Extron", category: "Control - Touch Panel", name: "TLP Pro 1025T 10\" Touch Panel",
    description: "10\" tabletop touch panel.", ...m(2295) },
  { sku: "EXT-XPA1002", brand: "Extron", category: "Amplifier", name: "XPA 1002 100W Power Amp",
    description: "100W per channel, 2-channel, 70V/100V/8Ω amplifier.", ...m(1695) },
  { sku: "EXT-NETPA-U-1004", brand: "Extron", category: "Amplifier", name: "NetPA U 1004 1000W Amp",
    description: "Half-rack 4-channel networked amplifier with DSP.", ...m(2895) },

  // ───────────────────────────────────────────────────────────────────
  // Q-SYS (QSC)
  // ───────────────────────────────────────────────────────────────────
  { sku: "QSC-CORE110F", brand: "Q-SYS", category: "DSP", name: "Core 110f Integrated Processor",
    description: "Q-SYS integrated Core with DSP, video bridging, network audio.",
    specs: { channels: 128, q_lan: true }, ...m(3995) },
  { sku: "QSC-CORE510I", brand: "Q-SYS", category: "DSP", name: "Core 510i Processor",
    description: "Modular Q-SYS Core with up to 512 channels.", ...m(7995) },
  { sku: "QSC-CORENANO", brand: "Q-SYS", category: "DSP", name: "Core Nano",
    description: "Compact Q-SYS Core for huddle and small spaces.", ...m(1995) },
  { sku: "QSC-NIOUSBBT", brand: "Q-SYS", category: "AVoIP Other", name: "NIO-USB BT",
    description: "Networked USB & Bluetooth bridge for Q-SYS.", ...m(1295) },
  { sku: "QSC-NV3204K", brand: "Q-SYS", category: "AVoIP Encoder", name: "NV-32-H V2 Video Bridge",
    description: "4K60 4:4:4 HDR networked video endpoint for Q-SYS.", ...m(3495) },
  { sku: "QSC-CXQ8K8", brand: "QSC", category: "Amplifier", name: "CX-Q 8K8 Network Amplifier",
    description: "Eight-channel network amplifier, 8000W total, FAST FlexAmp.", ...m(5995) },
  { sku: "QSC-CXQ4K4", brand: "QSC", category: "Amplifier", name: "CX-Q 4K4 Network Amplifier",
    description: "Four-channel networked amplifier, 4000W.", ...m(4495) },
  { sku: "QSC-SPA4100", brand: "QSC", category: "Amplifier", name: "SPA4-100 Amplifier",
    description: "Four-channel SPA series amplifier, 100W per channel.", ...m(1195) },
  { sku: "QSC-TSC101G3", brand: "Q-SYS", category: "Control - Touch Panel", name: "TSC-101-G3 10.1\" Touch Controller",
    description: "10.1\" native Q-SYS touch controller.", ...m(1895) },
  { sku: "QSC-TSC70G3", brand: "Q-SYS", category: "Control - Touch Panel", name: "TSC-70-G3 7\" Touch Controller",
    description: "7\" Q-SYS touch controller.", ...m(1395) },

  // ───────────────────────────────────────────────────────────────────
  // BIAMP
  // ───────────────────────────────────────────────────────────────────
  { sku: "BIA-TESIRAFORTECI", brand: "Biamp", category: "DSP", name: "Tesira FORTÉ DAN CI",
    description: "Compact Tesira DSP with Dante and 12 analog I/O.", ...m(3995) },
  { sku: "BIA-TESIRASRV", brand: "Biamp", category: "DSP", name: "Tesira SERVER",
    description: "Expandable Tesira chassis for enterprise installs.", ...m(7995) },
  { sku: "BIA-TESIRASRVIO", brand: "Biamp", category: "DSP", name: "Tesira SERVER-IO",
    description: "Tesira server with onboard I/O slots.", ...m(8995) },
  { sku: "BIA-LUXOH1", brand: "Biamp", category: "AVoIP Encoder", name: "TesiraLUX OH-1 Encoder",
    description: "Uncompressed 4K AVoIP encoder for Tesira.", ...m(4495) },
  { sku: "BIA-LUXIDH1", brand: "Biamp", category: "AVoIP Decoder", name: "TesiraLUX IDH-1 Decoder",
    description: "Uncompressed 4K AVoIP decoder.", ...m(4495) },
  { sku: "BIA-DEVIOSCR25", brand: "Biamp", category: "Conferencing - Codec", name: "Devio SCR-25 BYOD Hub",
    description: "Tabletop BYOD conferencing hub with beamtracking mic.", ...m(2495) },
  { sku: "BIA-PARLE-TCM-1A", brand: "Biamp", category: "Microphone - Ceiling", name: "Parlé TCM-1A Ceiling Mic",
    description: "Square ceiling beamforming microphone with PoE.", ...m(1995) },
  { sku: "BIA-PARLE-TCM-XA", brand: "Biamp", category: "Microphone - Ceiling", name: "Parlé TCM-XA Ceiling Mic",
    description: "Rectangular ceiling beamforming microphone.", ...m(2495) },

  // ───────────────────────────────────────────────────────────────────
  // SHURE
  // ───────────────────────────────────────────────────────────────────
  { sku: "SHU-MXA920W", brand: "Shure", category: "Microphone - Ceiling", name: "Microflex MXA920 (Square, White)",
    description: "Premium ceiling array microphone, 24\" square, 8 lobes, IntelliMix DSP.",
    specs: { size: "24x24in", form: "square" }, ...m(4995) },
  { sku: "SHU-MXA920R", brand: "Shure", category: "Microphone - Ceiling", name: "Microflex MXA920 (Round)",
    description: "Round-format MXA920 ceiling array mic.", ...m(4995) },
  { sku: "SHU-MXA710", brand: "Shure", category: "Microphone - Ceiling", name: "Microflex MXA710 Linear Array",
    description: "Wall or ceiling-mount 2-foot linear array mic.", ...m(2495) },
  { sku: "SHU-MXA310", brand: "Shure", category: "Microphone - Boundary", name: "Microflex MXA310 Table Array",
    description: "Tabletop 4-channel beamforming mic.", ...m(1995) },
  { sku: "SHU-IMXROOM", brand: "Shure", category: "DSP", name: "IntelliMix Room Audio Software",
    description: "Software DSP for native MS Teams / Zoom Rooms.", ...m(1995) },
  { sku: "SHU-P300", brand: "Shure", category: "DSP", name: "IntelliMix P300 Conferencing DSP",
    description: "Hardware DSP for boardroom audio conferencing.", ...m(2495) },
  { sku: "SHU-ULXD4D-SM58", brand: "Shure", category: "Microphone - Wireless", name: "ULX-D Dual Wireless w/ SM58",
    description: "ULX-D dual-channel digital wireless with two SM58 handhelds.", ...m(2895) },
  { sku: "SHU-MXCW640", brand: "Shure", category: "Microphone - Wireless", name: "Microflex MXCW640 Conference Unit",
    description: "Wireless conference discussion unit with touchscreen.", ...m(1495) },

  // ───────────────────────────────────────────────────────────────────
  // SENNHEISER
  // ───────────────────────────────────────────────────────────────────
  { sku: "SEN-TCC2W", brand: "Sennheiser", category: "Microphone - Ceiling", name: "TeamConnect Ceiling 2 (White)",
    description: "Patented dynamic beamforming ceiling mic, automatic adaptive beams.", ...m(4495) },
  { sku: "SEN-TCCM", brand: "Sennheiser", category: "Microphone - Ceiling", name: "TeamConnect Ceiling Medium",
    description: "Smaller-format TCC for huddle and medium rooms.", ...m(3295) },
  { sku: "SEN-SLMCR2", brand: "Sennheiser", category: "Microphone - Wireless", name: "SpeechLine SL MCR 2",
    description: "Two-channel speech-only digital wireless receiver.", ...m(1895) },
  { sku: "SEN-EWDXEM4", brand: "Sennheiser", category: "Microphone - Wireless", name: "EW-DX EM 4 Quad Wireless",
    description: "EW-DX 4-channel rack wireless receiver.", ...m(3895) },

  // ───────────────────────────────────────────────────────────────────
  // AUDIO-TECHNICA
  // ───────────────────────────────────────────────────────────────────
  { sku: "ATU-ES954", brand: "Audio-Technica", category: "Microphone - Boundary", name: "ES954 Hanging Array Mic",
    description: "Four-element hanging cardioid array microphone.", ...m(1295) },
  { sku: "ATU-ATCM5", brand: "Audio-Technica", category: "Microphone - Ceiling", name: "AT-CM5 Ceiling Microphone",
    description: "Cardioid ceiling boundary microphone.", ...m(595) },

  // ───────────────────────────────────────────────────────────────────
  // SPEAKERS — Bose
  // ───────────────────────────────────────────────────────────────────
  { sku: "BOSE-DM3SE", brand: "Bose", category: "Speaker - Ceiling", name: "DesignMax DM3SE",
    description: "3\" full-range ceiling loudspeaker, 70/100V, sold in pairs.", ...m(395) },
  { sku: "BOSE-DM5SE", brand: "Bose", category: "Speaker - Ceiling", name: "DesignMax DM5SE",
    description: "5.25\" coaxial in-ceiling loudspeaker.", ...m(495) },
  { sku: "BOSE-DM8C", brand: "Bose", category: "Speaker - Ceiling", name: "DesignMax DM8C Ceiling Speaker",
    description: "8\" coaxial in-ceiling speaker.", ...m(545) },
  { sku: "BOSE-DM10S", brand: "Bose", category: "Speaker - Subwoofer", name: "DesignMax DM10S In-Ceiling Sub",
    description: "10\" in-ceiling subwoofer.", ...m(995) },
  { sku: "BOSE-EM180", brand: "Bose", category: "Speaker - Surface", name: "EdgeMax EM180",
    description: "180° in-ceiling wall-edge loudspeaker.", ...m(795) },

  // SPEAKERS — JBL Pro
  { sku: "JBL-CONTROL24CT", brand: "JBL", category: "Speaker - Ceiling", name: "Control 24CT Ceiling Speaker",
    description: "4\" full-range ceiling speaker, 70/100V transformer.", ...m(295) },
  { sku: "JBL-CONTROL47C", brand: "JBL", category: "Speaker - Ceiling", name: "Control 47C/T Ceiling Speaker",
    description: "6.5\" coax ceiling speaker with rotatable HF.", ...m(345) },
  { sku: "JBL-CONTROL322CT", brand: "JBL", category: "Speaker - Ceiling", name: "Control 322C/T",
    description: "8\" two-way in-ceiling premium loudspeaker.", ...m(495) },

  // SPEAKERS — Yamaha
  { sku: "YAM-VXC4W", brand: "Yamaha", category: "Speaker - Ceiling", name: "VXC4w Ceiling Speaker",
    description: "4\" ceiling speaker, white.", ...m(180) },
  { sku: "YAM-VXC6W", brand: "Yamaha", category: "Speaker - Ceiling", name: "VXC6w Ceiling Speaker",
    description: "6\" ceiling speaker, white.", ...m(220) },
  { sku: "YAM-VXC8", brand: "Yamaha", category: "Speaker - Ceiling", name: "VXC8 Ceiling Speaker",
    description: "8\" ceiling speaker.", ...m(280) },
  { sku: "YAM-VXS8", brand: "Yamaha", category: "Speaker - Surface", name: "VXS8 Surface Speaker",
    description: "8\" surface-mount loudspeaker.", ...m(395) },
  { sku: "YAM-MTX5D", brand: "Yamaha", category: "DSP", name: "MTX5-D Matrix Processor",
    description: "8x8 Dante matrix processor.", ...m(2295) },
  { sku: "YAM-XMV4140", brand: "Yamaha", category: "Amplifier", name: "XMV4140 4-Channel Amp",
    description: "4-channel 140W amplifier, 70/100V.", ...m(995) },

  // SPEAKERS — Genelec (Studio / Premium)
  { sku: "GEN-4420A", brand: "Genelec", category: "Speaker - Surface", name: "4420A IP Smart Speaker",
    description: "4\" intelligent installation speaker with PoE+ and Dante.", ...m(1895) },
  { sku: "GEN-4430A", brand: "Genelec", category: "Speaker - Surface", name: "4430A IP Smart Speaker",
    description: "5\" intelligent installation speaker, PoE+ Dante.", ...m(2295) },
  { sku: "GEN-8330A", brand: "Genelec", category: "Speaker - Surface", name: "8330A SAM Studio Monitor",
    description: "5\" Smart Active Monitor for control rooms.", ...m(1395) },

  // ───────────────────────────────────────────────────────────────────
  // CAMERAS & CONFERENCING
  // ───────────────────────────────────────────────────────────────────
  { sku: "LOG-RALLYBARPLUS", brand: "Logitech", category: "Conferencing - Video Bar", name: "Rally Bar Plus",
    description: "AI-powered all-in-one video bar for medium-large rooms.", ...m(4699) },
  { sku: "LOG-RALLYBAR", brand: "Logitech", category: "Conferencing - Video Bar", name: "Rally Bar",
    description: "Premier all-in-one video bar for medium rooms.", ...m(3999) },
  { sku: "LOG-RALLYBARMINI", brand: "Logitech", category: "Conferencing - Video Bar", name: "Rally Bar Mini",
    description: "All-in-one video bar for small-medium rooms.", ...m(2999) },
  { sku: "LOG-MEETUP2", brand: "Logitech", category: "Conferencing - Video Bar", name: "MeetUp 2",
    description: "Conferencecam for huddle rooms with 4K AI.", ...m(1299) },
  { sku: "LOG-TAPIP", brand: "Logitech", category: "Control - Touch Panel", name: "Tap IP Touch Controller",
    description: "PoE network-attached room scheduler / touch controller.", ...m(699) },
  { sku: "LOG-SCRIBE", brand: "Logitech", category: "Camera - Conference", name: "Scribe Whiteboard Camera",
    description: "AI whiteboard camera for hybrid meetings.", ...m(1199) },
  { sku: "POLY-X70", brand: "Poly", category: "Conferencing - Video Bar", name: "Studio X70 Dual-Camera Bar",
    description: "Dual-camera 4K video bar for large rooms.", ...m(7499) },
  { sku: "POLY-X52", brand: "Poly", category: "Conferencing - Video Bar", name: "Studio X52",
    description: "All-in-one 4K video bar for medium rooms.", ...m(3999) },
  { sku: "POLY-X30", brand: "Poly", category: "Conferencing - Video Bar", name: "Studio X30",
    description: "All-in-one 4K video bar for small rooms.", ...m(2199) },
  { sku: "POLY-TRIO-C60", brand: "Poly", category: "Conferencing - Codec", name: "Trio C60 Conference Phone",
    description: "Premium conference phone with smart camera support.", ...m(1199) },
  { sku: "YEA-MEETBAR-A50", brand: "Yealink", category: "Conferencing - Video Bar", name: "MeetingBar A50",
    description: "Android-based video bar for medium rooms.", ...m(2499) },
  { sku: "YEA-MEETBAR-A30", brand: "Yealink", category: "Conferencing - Video Bar", name: "MeetingBar A30",
    description: "Compact 4K video bar.", ...m(1899) },
  { sku: "YEA-UVC86", brand: "Yealink", category: "Camera - PTZ", name: "UVC86 4K Dual-Eye Camera",
    description: "PTZ with dual lenses and AI tracking.", ...m(2299) },
  { sku: "CIS-RBPRO", brand: "Cisco", category: "Conferencing - Video Bar", name: "Cisco Room Bar Pro",
    description: "Webex-native premium all-in-one video bar.", ...m(5995) },
  { sku: "CIS-RBAR", brand: "Cisco", category: "Conferencing - Video Bar", name: "Cisco Room Bar",
    description: "Webex-native all-in-one for medium rooms.", ...m(3995) },
  { sku: "CIS-RKEQX", brand: "Cisco", category: "Conferencing - Codec", name: "Cisco Room Kit EQX",
    description: "Premium Webex codec for large rooms with integrated cameras.", ...m(15995) },
  { sku: "CIS-DESKPRO", brand: "Cisco", category: "Conferencing - Video Bar", name: "Cisco Desk Pro",
    description: "27\" desktop collaboration device.", ...m(4995) },

  // CAMERAS — PTZ
  { sku: "SONY-SRGX400", brand: "Sony", category: "Camera - PTZ", name: "SRG-X400 PTZ Camera",
    description: "4K PTZ with 20x optical zoom, NDI HX.", ...m(4195) },
  { sku: "PANA-AWUE160", brand: "Panasonic", category: "Camera - PTZ", name: "AW-UE160 PTZ Camera",
    description: "Flagship 4K PTZ with 4K60p output and SRT.", ...m(13500) },
  { sku: "PANA-AWUE100", brand: "Panasonic", category: "Camera - PTZ", name: "AW-UE100 PTZ Camera",
    description: "4K integrated PTZ with NDI / SRT.", ...m(6500) },
  { sku: "PANA-AWUE40", brand: "Panasonic", category: "Camera - PTZ", name: "AW-UE40 PTZ Camera",
    description: "Compact 4K PTZ with 24x zoom.", ...m(2495) },
  { sku: "AVE-PTC500S", brand: "AVer", category: "Camera - PTZ", name: "PTC500S PTZ Auto-Tracking",
    description: "1080p PTZ with AI auto-tracking.", ...m(2895) },
  { sku: "AVE-PTZ310UV2", brand: "AVer", category: "Camera - PTZ", name: "PTZ310UV2 4K PTZ",
    description: "4K PTZ with USB/HDMI/NDI HX.", ...m(2295) },
  { sku: "LUM-VCA50P", brand: "Lumens", category: "Camera - PTZ", name: "VC-A50P 4K PTZ",
    description: "4K30 PTZ with 20x optical zoom.", ...m(3995) },
  { sku: "LUM-VCA50PN", brand: "Lumens", category: "Camera - PTZ", name: "VC-A50PN NDI HX PTZ",
    description: "4K30 PTZ with NDI HX.", ...m(4195) },
  { sku: "LUM-VCTR1", brand: "Lumens", category: "Camera - PTZ", name: "VC-TR1 Auto-Tracking Camera",
    description: "Single-lens auto-tracking PTZ for classrooms.", ...m(1895) },
  { sku: "LUM-VCTR60A", brand: "Lumens", category: "Camera - PTZ", name: "VC-TR60A Dual-Lens AI Camera",
    description: "Dual-lens AI auto-tracking PTZ.", ...m(3895) },
  { sku: "LUM-CAMCONNECT", brand: "Lumens", category: "AVoIP Other", name: "CamConnect AI Switcher",
    description: "AI camera director for multi-camera classrooms.", ...m(2495) },

  // ───────────────────────────────────────────────────────────────────
  // AVoIP — AVPro Edge / Atlona / Kramer / Lightware
  // ───────────────────────────────────────────────────────────────────
  { sku: "APE-MXNETEVOTX", brand: "AVPro Edge", category: "AVoIP Encoder", name: "AC-MXNET-1G-EVO Transmitter",
    description: "1Gb AVoIP transmitter for MXNet Evo platform.", ...m(1495) },
  { sku: "APE-MXNETEVOD", brand: "AVPro Edge", category: "AVoIP Decoder", name: "AC-MXNET-EVO-D Decoder",
    description: "MXNet Evo decoder with display + USB.", ...m(1495) },
  { sku: "APE-MX88", brand: "AVPro Edge", category: "Video Switcher", name: "AC-MX-88 8x8 Matrix",
    description: "8x8 18Gbps HDMI matrix switcher.", ...m(4995) },
  { sku: "ATL-OMEMS52W", brand: "Atlona", category: "Video Switcher", name: "AT-OME-MS52W 5x1 Switcher",
    description: "4K/UHD HDMI switcher with USB-C, soft codec interface.", ...m(2295) },
  { sku: "ATL-OMNISTREAM-RT", brand: "Atlona", category: "AVoIP Decoder", name: "OmniStream R-Type Decoder",
    description: "Single-channel networked AV decoder.", ...m(1295) },
  { sku: "KRA-VS88H2A", brand: "Kramer", category: "Video Switcher", name: "VS-88H2A 8x8 HDMI Matrix",
    description: "8x8 4K HDR matrix switcher.", ...m(4495) },
  { sku: "KRA-VS1616H2A", brand: "Kramer", category: "Video Switcher", name: "VS-1616H2A 16x16 Matrix",
    description: "16x16 4K HDR HDMI matrix.", ...m(11995) },
  { sku: "LW-UMXTPSTX140", brand: "Lightware", category: "AVoIP Encoder", name: "UMX-TPS-TX140 Transmitter",
    description: "HDBaseT transmitter, 4K, 130m reach.", ...m(1395) },
  { sku: "LW-UMXTPSRX140", brand: "Lightware", category: "AVoIP Decoder", name: "UMX-TPS-RX140 Receiver",
    description: "HDBaseT receiver paired with TX140.", ...m(1295) },

  // ───────────────────────────────────────────────────────────────────
  // RACKS / POWER
  // ───────────────────────────────────────────────────────────────────
  { sku: "MA-MRK4426", brand: "Middle Atlantic", category: "Rack", name: "MRK-4426 44U Enclosed Rack",
    description: "44U fully enclosed rack with locking front/rear doors.",
    specs: { U: 44 }, ...m(1495) },
  { sku: "MA-MRK3725", brand: "Middle Atlantic", category: "Rack", name: "MRK-3725 37U Enclosed Rack",
    description: "37U enclosed rack with venting and cable management.",
    specs: { U: 37 }, ...m(1295) },
  { sku: "MA-WMRK3225", brand: "Middle Atlantic", category: "Rack", name: "WMRK-3225 32U Wall-Mount Rack",
    description: "32U wall-mount/swing-out rack.",
    specs: { U: 32 }, ...m(995) },
  { sku: "MA-ERK2725", brand: "Middle Atlantic", category: "Rack", name: "ERK-2725 27U Floor Rack",
    description: "27U floor-standing rack.",
    specs: { U: 27 }, ...m(795) },
  { sku: "APC-SMTL3000RM2UC", brand: "APC", category: "Power", name: "Smart-UPS Lithium-Ion 3000VA",
    description: "Lithium-ion 2U rack UPS, 2700W, SmartConnect cloud.", ...m(2495) },
  { sku: "APC-AP7900B", brand: "APC", category: "Power", name: "AP7900B Switched PDU",
    description: "8-outlet switched rack PDU, 15A, 120V.", ...m(595) },
  { sku: "FUR-PLPROC", brand: "Furman", category: "Power", name: "PL-PRO C Power Conditioner",
    description: "Rack power conditioner with voltage regulation.", ...m(795) },
  { sku: "FUR-PLPLUSC", brand: "Furman", category: "Power", name: "PL-Plus C Power Conditioner",
    description: "Classic rack power conditioner with surge protection.", ...m(495) },

  // ───────────────────────────────────────────────────────────────────
  // NETWORK
  // ───────────────────────────────────────────────────────────────────
  { sku: "NET-M425048G4XF", brand: "NETGEAR", category: "Network Switch", name: "M4250-48G4XF AV Line Switch",
    description: "Pre-configured AV-over-IP managed switch, 48-port PoE+.",
    specs: { ports: 48, poe: "PoE+" }, ...m(2495) },
  { sku: "NET-M425026G4XF", brand: "NETGEAR", category: "Network Switch", name: "M4250-26G4XF AV Line Switch",
    description: "26-port AV-optimized managed switch with 10G uplinks.",
    specs: { ports: 26 }, ...m(1595) },
  { sku: "CISCO-C9300L48UXM", brand: "Cisco", category: "Network Switch", name: "Catalyst 9300L-48UXM",
    description: "Enterprise-grade 48-port multigigabit UPoE switch.", ...m(11500) },

  // ───────────────────────────────────────────────────────────────────
  // CABLES / ACCESSORIES (sample — not exhaustive)
  // ───────────────────────────────────────────────────────────────────
  { sku: "LIB-HDMI-AOC-15M", brand: "Liberty AV", category: "Cable", name: "AOC HDMI 2.1 — 15m",
    description: "Active optical 8K HDMI 2.1 cable, 15 meters.", ...m(225) },
  { sku: "LIB-CAT6A-305M", brand: "Liberty AV", category: "Cable", name: "Cat6A FTP Plenum 305m",
    description: "Cat6A shielded plenum cable, 305m spool.", ...m(595) },
  { sku: "BEL-DT4800", brand: "Belden", category: "Cable", name: "Belden DT-4800 Speaker Cable",
    description: "4-conductor 12 AWG plenum speaker cable, 1000ft.", ...m(395) },
  { sku: "BEL-1505A", brand: "Belden", category: "Cable", name: "Belden 1505A SDI 1000ft",
    description: "Precision RG-6 SDI/HD coaxial cable, 1000ft.", ...m(245) },
];
