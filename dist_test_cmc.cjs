var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/data/computerMasterCatalog.ts
var computerMasterCatalog_exports = {};
__export(computerMasterCatalog_exports, {
  DESKTOP_PC_COMPONENTS_CATALOG: () => DESKTOP_PC_COMPONENTS_CATALOG,
  LAPTOP_BRANDS_CATALOG: () => LAPTOP_BRANDS_CATALOG
});
module.exports = __toCommonJS(computerMasterCatalog_exports);
var LAPTOP_BRANDS_CATALOG = [
  {
    brandEn: "Apple MacBook",
    brandBn: "\u0985\u09CD\u09AF\u09BE\u09AA\u09B2 \u09AE\u09CD\u09AF\u09BE\u0995\u09AC\u09C1\u0995 (Apple MacBook)",
    models: [
      { en: "MacBook Pro 16-inch (M4 Max / M4 Pro 2024)", bn: "\u09AE\u09CD\u09AF\u09BE\u0995\u09AC\u09C1\u0995 \u09AA\u09CD\u09B0\u09CB \u09E7\u09EC \u0987\u099E\u09CD\u099A\u09BF (\u098F\u09AE\u09EA \u09AE\u09CD\u09AF\u09BE\u0995\u09CD\u09B8/\u09AA\u09CD\u09B0\u09CB)" },
      { en: "MacBook Pro 14-inch (M4 / M4 Pro / M4 Max 2024)", bn: "\u09AE\u09CD\u09AF\u09BE\u0995\u09AC\u09C1\u0995 \u09AA\u09CD\u09B0\u09CB \u09E7\u09EA \u0987\u099E\u09CD\u099A\u09BF (\u098F\u09AE\u09EA)" },
      { en: "MacBook Pro 16-inch / 14-inch (M3 Max / M3 Pro / M3)", bn: "\u09AE\u09CD\u09AF\u09BE\u0995\u09AC\u09C1\u0995 \u09AA\u09CD\u09B0\u09CB \u09E7\u09EC/\u09E7\u09EA \u0987\u099E\u09CD\u099A\u09BF (\u098F\u09AE\u09E9)" },
      { en: "MacBook Pro 16-inch / 14-inch (M2 Max / M2 Pro / M1 Pro)", bn: "\u09AE\u09CD\u09AF\u09BE\u0995\u09AC\u09C1\u0995 \u09AA\u09CD\u09B0\u09CB \u098F\u09AE\u09E8 / \u098F\u09AE\u09E7 \u09AA\u09CD\u09B0\u09CB" },
      { en: "MacBook Pro 13-inch (M2 / M1 Touch Bar)", bn: "\u09AE\u09CD\u09AF\u09BE\u0995\u09AC\u09C1\u0995 \u09AA\u09CD\u09B0\u09CB \u09E7\u09E9 \u0987\u099E\u09CD\u099A\u09BF \u098F\u09AE\u09E8 / \u098F\u09AE\u09E7" },
      { en: "MacBook Air 15-inch (M3 / M2 Liquid Retina)", bn: "\u09AE\u09CD\u09AF\u09BE\u0995\u09AC\u09C1\u0995 \u098F\u09AF\u09BC\u09BE\u09B0 \u09E7\u09EB \u0987\u099E\u09CD\u099A\u09BF (\u098F\u09AE\u09E9 / \u098F\u09AE\u09E8)" },
      { en: "MacBook Air 13-inch (M3 / M2 Liquid Retina)", bn: "\u09AE\u09CD\u09AF\u09BE\u0995\u09AC\u09C1\u0995 \u098F\u09AF\u09BC\u09BE\u09B0 \u09E7\u09E9 \u0987\u099E\u09CD\u099A\u09BF (\u098F\u09AE\u09E9 / \u098F\u09AE\u09E8)" },
      { en: "MacBook Air 13-inch (M1 2020 Classic)", bn: "\u09AE\u09CD\u09AF\u09BE\u0995\u09AC\u09C1\u0995 \u098F\u09AF\u09BC\u09BE\u09B0 \u09E7\u09E9 \u0987\u099E\u09CD\u099A\u09BF \u098F\u09AE\u09E7" }
    ]
  },
  {
    brandEn: "Dell",
    brandBn: "\u09A1\u09C7\u09B2 (Dell Laptops)",
    models: [
      { en: "Dell XPS 16 / XPS 14 / XPS 13 (Intel Core Ultra / OLED)", bn: "\u09A1\u09C7\u09B2 \u098F\u0995\u09CD\u09B8\u09AA\u09BF\u098F\u09B8 \u09E7\u09EC / \u09E7\u09EA / \u09E7\u09E9" },
      { en: "Dell XPS 15 / XPS 17 (Creator Edition)", bn: "\u09A1\u09C7\u09B2 \u098F\u0995\u09CD\u09B8\u09AA\u09BF\u098F\u09B8 \u09E7\u09EB / \u09E7\u09ED" },
      { en: "Dell Alienware m18 / m16 / x16 / x14 Gaming (RTX 4090/4080)", bn: "\u09A1\u09C7\u09B2 \u098F\u09B2\u09BF\u09AF\u09BC\u09C7\u09A8\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0997\u09C7\u09AE\u09BF\u0982" },
      { en: "Dell G16 / G15 Gaming Laptop (Core i7/i9 RTX 4060/4050)", bn: "\u09A1\u09C7\u09B2 \u099C\u09BF\u09E7\u09EC / \u099C\u09BF\u09E7\u09EB \u0997\u09C7\u09AE\u09BF\u0982" },
      { en: "Dell Inspiron 16 Plus / Inspiron 15 / Inspiron 14 2-in-1", bn: "\u09A1\u09C7\u09B2 \u0987\u09A8\u09CD\u09B8\u09AA\u09BE\u09AF\u09BC\u09B0\u09A8 \u09E7\u09EB / \u09E7\u09EA" },
      { en: "Dell Latitude 7440 / 5440 / 3440 / 3540 (Business Class)", bn: "\u09A1\u09C7\u09B2 \u09B2\u09CD\u09AF\u09BE\u099F\u09BF\u099F\u09BF\u0989\u09A1 \u09AC\u09BF\u099C\u09A8\u09C7\u09B8 \u09B2\u09CD\u09AF\u09BE\u09AA\u099F\u09AA" },
      { en: "Dell Precision 7780 / 5680 / 3581 Mobile Workstation", bn: "\u09A1\u09C7\u09B2 \u09AA\u09CD\u09B0\u09BF\u09B8\u09BF\u09B6\u09A8 \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995\u09B8\u09CD\u099F\u09C7\u09B6\u09A8" },
      { en: "Dell Vostro 3520 / 3420 / 5630", bn: "\u09A1\u09C7\u09B2 \u09AD\u09CB\u09B8\u09CD\u099F\u09CD\u09B0\u09CB" }
    ]
  },
  {
    brandEn: "HP",
    brandBn: "\u098F\u0987\u099A\u09AA\u09BF (HP Laptops)",
    models: [
      { en: "HP Spectre x360 16 / 14 (Intel Core Ultra 2-in-1 OLED)", bn: "\u098F\u0987\u099A\u09AA\u09BF \u09B8\u09CD\u09AA\u09C7\u0995\u09CD\u099F\u09BE\u09B0 \u098F\u0995\u09CD\u09B8\u09E9\u09EC\u09E6" },
      { en: "HP Envy x360 16 / 14 / Envy 17", bn: "\u098F\u0987\u099A\u09AA\u09BF \u098F\u09A8\u09AD\u09BF \u098F\u0995\u09CD\u09B8\u09E9\u09EC\u09E6" },
      { en: "HP OMEN Transcend 16 / OMEN 16 / OMEN 17 Gaming (RTX 4080)", bn: "\u098F\u0987\u099A\u09AA\u09BF \u0993\u09AE\u09C7\u09A8 \u099F\u09CD\u09B0\u09BE\u09A8\u09B8\u09C7\u09A8\u09CD\u09A1 \u0997\u09C7\u09AE\u09BF\u0982" },
      { en: "HP Victus 16 / Victus 15 Gaming (Ryzen 7 / Core i7 RTX 4060)", bn: "\u098F\u0987\u099A\u09AA\u09BF \u09AD\u09BF\u0995\u09CD\u099F\u09BE\u09B8 \u09E7\u09EC / \u09E7\u09EB" },
      { en: "HP Pavilion Plus 14 / Pavilion 15 / Pavilion x360", bn: "\u098F\u0987\u099A\u09AA\u09BF \u09AA\u09CD\u09AF\u09BE\u09AD\u09BF\u09B2\u09BF\u09AF\u09BC\u09A8 \u09E7\u09EB / \u09E7\u09EA" },
      { en: "HP EliteBook 840 G10 / 1040 G10 / 640 G10 (Premium Business)", bn: "\u098F\u0987\u099A\u09AA\u09BF \u098F\u09B2\u09BF\u099F\u09AC\u09C1\u0995 \u09EE\u09EA\u09E6 \u099C\u09BF\u09E7\u09E6 / \u099C\u09BF\u09EF" },
      { en: "HP ProBook 450 G10 / 440 G10 / 450 G9 / 440 G9", bn: "\u098F\u0987\u099A\u09AA\u09BF \u09AA\u09CD\u09B0\u09CB\u09AC\u09C1\u0995 \u09EA\u09EB\u09E6 \u099C\u09BF\u09E7\u09E6 / \u09EA\u09EA\u09E6 \u099C\u09BF\u09EF" },
      { en: "HP 15s / 14s / HP 250 G9 / G8 (Budget Daily Laptop)", bn: "\u098F\u0987\u099A\u09AA\u09BF \u09E7\u09EB\u098F\u09B8 / \u09E7\u09EA\u098F\u09B8" },
      { en: "HP ZBook Studio / ZBook Power G10 Mobile Workstation", bn: "\u098F\u0987\u099A\u09AA\u09BF \u099C\u09C7\u09A1\u09AC\u09C1\u0995 \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995\u09B8\u09CD\u099F\u09C7\u09B6\u09A8" }
    ]
  },
  {
    brandEn: "Lenovo",
    brandBn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB (Lenovo Laptops)",
    models: [
      { en: "Lenovo ThinkPad X1 Carbon Gen 12 / Gen 11 / X1 Nano", bn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB \u09A5\u09BF\u0999\u09CD\u0995\u09AA\u09CD\u09AF\u09BE\u09A1 \u098F\u0995\u09CD\u09B8\u09E7 \u0995\u09BE\u09B0\u09CD\u09AC\u09A8" },
      { en: "Lenovo ThinkPad T14 Gen 5 / T14s / E14 / E16 / L14", bn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB \u09A5\u09BF\u0999\u09CD\u0995\u09AA\u09CD\u09AF\u09BE\u09A1 \u099F\u09BF\u09E7\u09EA / \u0987\u09E7\u09EA" },
      { en: "Lenovo ThinkPad P16 / P1 Gen 7 Mobile Workstation", bn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB \u09A5\u09BF\u0999\u09CD\u0995\u09AA\u09CD\u09AF\u09BE\u09A1 \u09AA\u09BF\u09E7\u09EC" },
      { en: "Lenovo Legion Pro 7i / Legion 9i / Legion Pro 5i Gaming", bn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB \u09B2\u09BF\u099C\u09A8 \u09AA\u09CD\u09B0\u09CB \u09ED\u0986\u0987 / \u09EB\u0986\u0987" },
      { en: "Lenovo Legion Slim 5 / Legion 5 Gen 9 (RTX 4070/4060)", bn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB \u09B2\u09BF\u099C\u09A8 \u09B8\u09CD\u09B2\u09BF\u09AE \u09EB" },
      { en: "Lenovo LOQ 15 / LOQ 16 (Budget Gaming Laptop)", bn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB \u098F\u09B2\u0993\u0995\u09BF\u0989 \u09E7\u09EB" },
      { en: "Lenovo Yoga 9i Dual Screen / Yoga Slim 7x (Snapdragon X Elite)", bn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB \u0987\u09AF\u09BC\u09CB\u0997\u09BE \u09EF\u0986\u0987 / \u09B8\u09CD\u09B2\u09BF\u09AE \u09ED" },
      { en: "Lenovo Yoga 7i 2-in-1 / Yoga Pro 7 / Yoga 6", bn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB \u0987\u09AF\u09BC\u09CB\u0997\u09BE \u09ED\u0986\u0987" },
      { en: "Lenovo IdeaPad Slim 5 / Slim 3 / IdeaPad 1 / Flex 5", bn: "\u09B2\u09C7\u09A8\u09CB\u09AD\u09CB \u0986\u0987\u09A1\u09BF\u09AF\u09BC\u09BE \u09AA\u09CD\u09AF\u09BE\u09A1 \u09B8\u09CD\u09B2\u09BF\u09AE \u09EB / \u09E9" }
    ]
  },
  {
    brandEn: "ASUS",
    brandBn: "\u0986\u09B8\u09C1\u09B8 (ASUS ROG & ZenBook)",
    models: [
      { en: "ASUS ROG Zephyrus G16 / G14 (OLED 240Hz RTX 4090/4080)", bn: "\u0986\u09B8\u09C1\u09B8 \u0986\u09B0\u0993\u099C\u09BF \u099C\u09C7\u09AB\u09BF\u09B0\u09BE\u09B8 \u099C\u09BF\u09E7\u09EC / \u099C\u09BF\u09E7\u09EA" },
      { en: "ASUS ROG Strix SCAR 18 / SCAR 16 / G16 Gaming", bn: "\u0986\u09B8\u09C1\u09B8 \u0986\u09B0\u0993\u099C\u09BF \u09B8\u09CD\u099F\u09CD\u09B0\u09BF\u0995\u09CD\u09B8 \u09B8\u09CD\u0995\u09BE\u09B0 \u09E7\u09EE / \u09E7\u09EC" },
      { en: "ASUS TUF Gaming A15 / A16 / F15 / F16 (Military Grade RTX 4060)", bn: "\u0986\u09B8\u09C1\u09B8 \u099F\u09BE\u09AB \u0997\u09C7\u09AE\u09BF\u0982 \u098F\u09E7\u09EB / \u098F\u09AB\u09E7\u09EB" },
      { en: 'ASUS ZenBook Duo (Dual 14" OLED 120Hz) / ZenBook 14 OLED', bn: "\u0986\u09B8\u09C1\u09B8 \u099C\u09C7\u09A8\u09AC\u09C1\u0995 \u09A1\u09C1\u0993 \u0993\u09B2\u09C7\u09A1" },
      { en: "ASUS ZenBook Pro 16X OLED / ZenBook S 16 (AMD Ryzen AI 9)", bn: "\u0986\u09B8\u09C1\u09B8 \u099C\u09C7\u09A8\u09AC\u09C1\u0995 \u098F\u09B8 \u09E7\u09EC" },
      { en: "ASUS VivoBook Pro 15 OLED / VivoBook 16 / VivoBook 15 / 14", bn: "\u0986\u09B8\u09C1\u09B8 \u09AD\u09BF\u09AD\u09CB\u09AC\u09C1\u0995 \u09AA\u09CD\u09B0\u09CB \u09E7\u09EB / \u09E7\u09EC" },
      { en: "ASUS ProArt P16 / StudioBook (Creator Laptop)", bn: "\u0986\u09B8\u09C1\u09B8 \u09AA\u09CD\u09B0\u09CB\u0986\u09B0\u09CD\u099F \u09E7\u09EC" },
      { en: "ASUS ExpertBook B9 / B5 (Lightweight Business)", bn: "\u0986\u09B8\u09C1\u09B8 \u098F\u0995\u09CD\u09B8\u09AA\u09BE\u09B0\u09CD\u099F\u09AC\u09C1\u0995" }
    ]
  },
  {
    brandEn: "Acer & MSI",
    brandBn: "\u098F\u09B8\u09BE\u09B0 \u0993 \u098F\u09AE\u098F\u09B8\u0986\u0987 (Acer & MSI)",
    models: [
      { en: "Acer Predator Helios 18 / Helios 16 / Helios Neo 16", bn: "\u098F\u09B8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09C7\u09A1\u09C7\u099F\u09B0 \u09B9\u09C7\u09B2\u09BF\u0993\u09B8 \u09E7\u09EC" },
      { en: "Acer Nitro 16 / Nitro V 15 / Nitro 5 (Budget Gaming)", bn: "\u098F\u09B8\u09BE\u09B0 \u09A8\u09BE\u0987\u099F\u09CD\u09B0\u09CB \u09AD\u09BF \u09E7\u09EB / \u09EB" },
      { en: "Acer Swift Go 14 OLED / Swift X 14 / Swift Edge 16", bn: "\u098F\u09B8\u09BE\u09B0 \u09B8\u09C1\u0987\u09AB\u099F \u0997\u09CB \u09E7\u09EA \u0993\u09B2\u09C7\u09A1" },
      { en: "Acer Aspire 5 / Aspire 3 / Aspire 7 / Extensa 15", bn: "\u098F\u09B8\u09BE\u09B0 \u098F\u09B8\u09CD\u09AA\u09BE\u09AF\u09BC\u09BE\u09B0 \u09EB / \u09E9" },
      { en: "MSI Titan 18 HX / Raider GE78 HX / Stealth 16 (RTX 4090)", bn: "\u098F\u09AE\u098F\u09B8\u0986\u0987 \u099F\u09BE\u0987\u099F\u09BE\u09A8 \u09E7\u09EE / \u09B0\u09C7\u0987\u09A1\u09BE\u09B0" },
      { en: "MSI Katana 15 / Cyborg 15 / Thin 15 / Sword 16 Gaming", bn: "\u098F\u09AE\u098F\u09B8\u0986\u0987 \u0995\u09BE\u099F\u09BE\u09A8\u09BE \u09E7\u09EB / \u09B8\u09BE\u0987\u09AC\u09CB\u09B0\u09CD\u0997" },
      { en: "MSI Prestige 16 AI / Modern 15 / Modern 14", bn: "\u098F\u09AE\u098F\u09B8\u0986\u0987 \u09AA\u09CD\u09B0\u09C7\u09B8\u09CD\u099F\u09BF\u099C / \u09AE\u09A1\u09BE\u09B0\u09CD\u09A8 \u09E7\u09EA" }
    ]
  },
  {
    brandEn: "Microsoft & Other Laptops",
    brandBn: "\u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u09B8\u09AB\u099F \u0993 \u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF \u09B2\u09CD\u09AF\u09BE\u09AA\u099F\u09AA",
    models: [
      { en: "Microsoft Surface Laptop 7th Edition (Copilot+ PC Snapdragon X)", bn: "\u09B8\u09BE\u09B0\u09AB\u09C7\u09B8 \u09B2\u09CD\u09AF\u09BE\u09AA\u099F\u09AA \u09ED" },
      { en: "Microsoft Surface Laptop Studio 2 / Laptop 6 / Laptop 5", bn: "\u09B8\u09BE\u09B0\u09AB\u09C7\u09B8 \u09B2\u09CD\u09AF\u09BE\u09AA\u099F\u09AA \u09B8\u09CD\u099F\u09C1\u09A1\u09BF\u0993 \u09E8" },
      { en: "Razer Blade 16 / Blade 14 / Blade 18 (Mini-LED)", bn: "\u09B0\u09C7\u099C\u09BE\u09B0 \u09AC\u09CD\u09B2\u09C7\u09A1 \u09E7\u09EC / \u09E7\u09EA" },
      { en: "Gigabyte AORUS 17X / AORUS 16X / G5 KF Gaming", bn: "\u0997\u09BF\u0997\u09BE\u09AC\u09BE\u0987\u099F \u0985\u09B0\u09B8 \u0997\u09C7\u09AE\u09BF\u0982" },
      { en: "Samsung Galaxy Book4 Ultra / Galaxy Book4 Pro 360", bn: "\u09B8\u09CD\u09AF\u09BE\u09AE\u09B8\u09BE\u0982 \u0997\u09CD\u09AF\u09BE\u09B2\u09BE\u0995\u09CD\u09B8\u09BF \u09AC\u09C1\u0995\u09EA \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE" },
      { en: "LG Gram 17 / Gram 16 Pro / Gram SuperSlim", bn: "\u098F\u09B2\u099C\u09BF \u0997\u09CD\u09B0\u09BE\u09AE \u09E7\u09ED \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE\u09B2\u09BE\u0987\u099F" },
      { en: "Huawei MateBook X Pro / MateBook 16s / MateBook D15", bn: "\u09B9\u09C1\u09DF\u09BE\u0993\u09DF\u09C7 \u09AE\u09C7\u099F\u09AC\u09C1\u0995 \u098F\u0995\u09CD\u09B8 \u09AA\u09CD\u09B0\u09CB" },
      { en: "Walton Tamarind / Passion / Prelude Series", bn: "\u0993\u09AF\u09BC\u09BE\u09B2\u099F\u09A8 \u099F\u09CD\u09AF\u09BE\u09AE\u09BE\u09B0\u09BF\u09A8\u09CD\u09A1 / \u09AA\u09CD\u09AF\u09BE\u09B6\u09A8" }
    ]
  }
];
var DESKTOP_PC_COMPONENTS_CATALOG = [
  {
    brandEn: "Processors & CPUs",
    brandBn: "\u09AA\u09CD\u09B0\u09B8\u09C7\u09B8\u09B0 (Intel & AMD CPU)",
    models: [
      { en: "Intel Core Ultra 9 285K / Ultra 7 265K / Ultra 5 245K (Arrow Lake)", bn: "\u0987\u09A8\u09CD\u099F\u09C7\u09B2 \u0995\u09CB\u09B0 \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE \u09EF \u09E8\u09EE\u09EB\u0995\u09C7" },
      { en: "Intel Core i9 14900KS / 14900K / 13900K / 12900K", bn: "\u0987\u09A8\u09CD\u099F\u09C7\u09B2 \u0995\u09CB\u09B0 \u0986\u0987\u09EF \u09E7\u09EA\u09EF\u09E6\u09E6\u0995\u09C7" },
      { en: "Intel Core i7 14700K / 14700 / 13700K / 12700K", bn: "\u0987\u09A8\u09CD\u099F\u09C7\u09B2 \u0995\u09CB\u09B0 \u0986\u0987\u09ED \u09E7\u09EA\u09ED\u09E6\u09E6\u0995\u09C7" },
      { en: "Intel Core i5 14600K / 14400F / 13400 / 12400F / 10400", bn: "\u0987\u09A8\u09CD\u099F\u09C7\u09B2 \u0995\u09CB\u09B0 \u0986\u0987\u09EB \u09E7\u09E8\u09EA\u09E6\u09E6\u098F\u09AB / \u09E7\u09E9\u09EA\u09E6\u09E6" },
      { en: "Intel Core i3 14100 / 13100 / 12100 / 10100", bn: "\u0987\u09A8\u09CD\u099F\u09C7\u09B2 \u0995\u09CB\u09B0 \u0986\u0987\u09E9 \u09E7\u09E8\u09E7\u09E6\u09E6 / \u09E7\u09E9\u09E7\u09E6\u09E6" },
      { en: "AMD Ryzen 7 9800X3D / Ryzen 7 7800X3D (Ultimate Gaming CPU)", bn: "\u098F\u098F\u09AE\u09A1\u09BF \u09B0\u09BE\u0987\u099C\u09C7\u09A8 \u09ED \u09EF\u09EE\u09E6\u09E6\u098F\u0995\u09CD\u09B8\u09E9\u09A1\u09BF / \u09ED\u09EE\u09E6\u09E6\u098F\u0995\u09CD\u09B8\u09E9\u09A1\u09BF" },
      { en: "AMD Ryzen 9 9950X / 9900X / 7950X3D / 7900X / 5950X", bn: "\u098F\u098F\u09AE\u09A1\u09BF \u09B0\u09BE\u0987\u099C\u09C7\u09A8 \u09EF \u09EF\u09EF\u09EB\u09E6\u09E6\u098F\u0995\u09CD\u09B8" },
      { en: "AMD Ryzen 7 9700X / 7700X / 5700X3D / 5700X", bn: "\u098F\u098F\u09AE\u09A1\u09BF \u09B0\u09BE\u0987\u099C\u09C7\u09A8 \u09ED \u09EF\u09ED\u09E6\u09E6\u098F\u0995\u09CD\u09B8 / \u09EB\u09ED\u09E6\u09E6\u098F\u0995\u09CD\u09B8" },
      { en: "AMD Ryzen 5 9600X / 7600X / 7600 / 5600X / 5600G (with Radeon Graphics)", bn: "\u098F\u098F\u09AE\u09A1\u09BF \u09B0\u09BE\u0987\u099C\u09C7\u09A8 \u09EB \u09EB\u09EC\u09E6\u09E6\u099C\u09BF / \u09ED\u09EC\u09E6\u09E6" },
      { en: "AMD Ryzen Threadripper 7980X / 7970X (Workstation)", bn: "\u09B0\u09BE\u0987\u099C\u09C7\u09A8 \u09A5\u09CD\u09B0\u09C7\u09A1\u09B0\u09BF\u09AA\u09BE\u09B0 \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995\u09B8\u09CD\u099F\u09C7\u09B6\u09A8" }
    ]
  },
  {
    brandEn: "Graphics Cards / GPU",
    brandBn: "\u0997\u09CD\u09B0\u09BE\u09AB\u09BF\u0995\u09CD\u09B8 \u0995\u09BE\u09B0\u09CD\u09A1 (NVIDIA RTX & AMD Radeon)",
    models: [
      { en: "NVIDIA GeForce RTX 5090 / RTX 5080 / RTX 5070 Ti / RTX 5070 (Blackwell)", bn: "\u098F\u09A8\u09AD\u09BF\u09A1\u09BF\u09AF\u09BC\u09BE \u0986\u09B0\u099F\u09BF\u098F\u0995\u09CD\u09B8 \u09EB\u09E6\u09EF\u09E6 / \u09EB\u09E6\u09EE\u09E6 / \u09EB\u09E6\u09ED\u09E6" },
      { en: "NVIDIA GeForce RTX 4090 24GB / RTX 4080 Super 16GB", bn: "\u098F\u09A8\u09AD\u09BF\u09A1\u09BF\u09AF\u09BC\u09BE \u0986\u09B0\u099F\u09BF\u098F\u0995\u09CD\u09B8 \u09EA\u09E6\u09EF\u09E6 / \u09EA\u09E6\u09EE\u09E6 \u09B8\u09C1\u09AA\u09BE\u09B0" },
      { en: "NVIDIA GeForce RTX 4070 Ti Super / 4070 Super / 4070 12GB", bn: "\u098F\u09A8\u09AD\u09BF\u09A1\u09BF\u09AF\u09BC\u09BE \u0986\u09B0\u099F\u09BF\u098F\u0995\u09CD\u09B8 \u09EA\u09E6\u09ED\u09E6 \u09B8\u09C1\u09AA\u09BE\u09B0" },
      { en: "NVIDIA GeForce RTX 4060 Ti 16GB/8GB / RTX 4060 8GB", bn: "\u098F\u09A8\u09AD\u09BF\u09A1\u09BF\u09AF\u09BC\u09BE \u0986\u09B0\u099F\u09BF\u098F\u0995\u09CD\u09B8 \u09EA\u09E6\u09EC\u09E6 \u099F\u09BF\u0986\u0987 / \u09EA\u09E6\u09EC\u09E6" },
      { en: "NVIDIA GeForce RTX 3090 / 3080 / 3070 / 3060 12GB / 3050 8GB", bn: "\u098F\u09A8\u09AD\u09BF\u09A1\u09BF\u09AF\u09BC\u09BE \u0986\u09B0\u099F\u09BF\u098F\u0995\u09CD\u09B8 \u09E9\u09E6\u09EC\u09E6 \u09E7\u09E8\u099C\u09BF\u09AC\u09BF / \u09E9\u09E6\u09ED\u09E6" },
      { en: "NVIDIA GeForce GTX 1660 Super / GTX 1650 / GTX 1080 Ti", bn: "\u098F\u09A8\u09AD\u09BF\u09A1\u09BF\u09AF\u09BC\u09BE \u099C\u09BF\u099F\u09BF\u098F\u0995\u09CD\u09B8 \u09E7\u09EC\u09EC\u09E6 \u09B8\u09C1\u09AA\u09BE\u09B0" },
      { en: "AMD Radeon RX 7900 XTX 24GB / RX 7900 XT / RX 7800 XT 16GB", bn: "\u098F\u098F\u09AE\u09A1\u09BF \u09B0\u09C7\u09A1\u09BF\u09AF\u09BC\u09A8 \u0986\u09B0\u098F\u0995\u09CD\u09B8 \u09ED\u09EF\u09E6\u09E6 \u098F\u0995\u09CD\u09B8\u099F\u09BF\u098F\u0995\u09CD\u09B8" },
      { en: "AMD Radeon RX 7700 XT / RX 7600 XT 16GB / RX 6700 XT / RX 6600", bn: "\u098F\u098F\u09AE\u09A1\u09BF \u09B0\u09C7\u09A1\u09BF\u09AF\u09BC\u09A8 \u0986\u09B0\u098F\u0995\u09CD\u09B8 \u09ED\u09EC\u09E6\u09E6 \u098F\u0995\u09CD\u09B8\u099F\u09BF / \u09EC\u09EC\u09E6\u09E6" },
      { en: "Intel Arc B580 / Arc A770 16GB / Arc A750 8GB", bn: "\u0987\u09A8\u09CD\u099F\u09C7\u09B2 \u0986\u09B0\u09CD\u0995 \u09AC\u09BF\u09EB\u09EE\u09E6 / \u098F\u09ED\u09ED\u09E6" },
      { en: "ASUS ROG Strix / TUF / Dual / MSI Gaming X / Suprim / Gigabyte AORUS GPU", bn: "\u0986\u09B8\u09C1\u09B8 \u0986\u09B0\u0993\u099C\u09BF / \u098F\u09AE\u098F\u09B8\u0986\u0987 / \u0997\u09BF\u0997\u09BE\u09AC\u09BE\u0987\u099F \u0995\u09BE\u09B0\u09CD\u09A1" }
    ]
  },
  {
    brandEn: "Motherboards",
    brandBn: "\u09AE\u09BE\u09A6\u09BE\u09B0\u09AC\u09CB\u09B0\u09CD\u09A1 (ASUS, MSI, Gigabyte, ASRock)",
    models: [
      { en: "ASUS ROG Maximus Z890 / ROG Strix Z890-E / TUF Gaming Z890 (Intel LGA1851)", bn: "\u0986\u09B8\u09C1\u09B8 \u0986\u09B0\u0993\u099C\u09BF \u099C\u09C7\u09A1\u09EE\u09EF\u09E6 \u09AE\u09BE\u09A6\u09BE\u09B0\u09AC\u09CB\u09B0\u09CD\u09A1" },
      { en: "ASUS ROG Crosshair X870E / ROG Strix X870-F / TUF X870-Plus (AMD AM5)", bn: "\u0986\u09B8\u09C1\u09B8 \u0986\u09B0\u0993\u099C\u09BF \u098F\u0995\u09CD\u09B8\u09EE\u09ED\u09E6\u0987 \u09AE\u09BE\u09A6\u09BE\u09B0\u09AC\u09CB\u09B0\u09CD\u09A1" },
      { en: "MSI MEG Z890 GODLIKE / MAG Z890 Tomahawk WiFi", bn: "\u098F\u09AE\u098F\u09B8\u0986\u0987 \u099F\u09AE\u09BE\u09B9\u0995 \u099C\u09C7\u09A1\u09EE\u09EF\u09E6" },
      { en: "MSI MAG X870 Tomahawk WiFi / MPG B650 Carbon WiFi / B650M Mortar", bn: "\u098F\u09AE\u098F\u09B8\u0986\u0987 \u099F\u09AE\u09BE\u09B9\u0995 \u098F\u0995\u09CD\u09B8\u09EE\u09ED\u09E6 / \u09AC\u09BF\u09EC\u09EB\u09E6" },
      { en: "Gigabyte Z890 AORUS Master / Elite AX / B760 AORUS Elite", bn: "\u0997\u09BF\u0997\u09BE\u09AC\u09BE\u0987\u099F \u0985\u09B0\u09B8 \u099C\u09C7\u09A1\u09EE\u09EF\u09E6 / \u09AC\u09BF\u09ED\u09EC\u09E6" },
      { en: "Gigabyte X870E AORUS Master / B650 AORUS Elite AX / B550M DS3H", bn: "\u0997\u09BF\u0997\u09BE\u09AC\u09BE\u0987\u099F \u0985\u09B0\u09B8 \u098F\u0995\u09CD\u09B8\u09EE\u09ED\u09E6\u0987 / \u09AC\u09BF\u09EC\u09EB\u09E6" },
      { en: "ASRock Z890 Taichi / X870E Taichi / B650 Steel Legend / B450 Pro4", bn: "\u098F\u099C\u09B0\u0995 \u09A4\u09BE\u0987\u099A\u09BF / \u09B8\u09CD\u099F\u09BF\u09B2 \u09B2\u09BF\u099C\u09C7\u09A8\u09CD\u09A1" }
    ]
  },
  {
    brandEn: "Monitors & Displays",
    brandBn: "\u09AE\u09A8\u09BF\u099F\u09B0 \u0993 \u09A1\u09BF\u09B8\u09AA\u09CD\u09B2\u09C7 (Gaming & Professional)",
    models: [
      { en: 'ASUS ROG Swift OLED 32" 4K 240Hz (PG32UCDM) / ROG Strix 27" 2K', bn: "\u0986\u09B8\u09C1\u09B8 \u0986\u09B0\u0993\u099C\u09BF \u0993\u09B2\u09C7\u09A1 \u09AB\u09CB\u09B0\u0995\u09C7 \u09E8\u09EA\u09E6\u09B9\u09BE\u09B0\u09CD\u099F\u099C" },
      { en: 'ASUS TUF Gaming 27" / 24" Fast IPS 180Hz/165Hz (VG279Q/VG249Q)', bn: "\u0986\u09B8\u09C1\u09B8 \u099F\u09BE\u09AB \u0997\u09C7\u09AE\u09BF\u0982 \u0986\u0987\u09AA\u09BF\u098F\u09B8 \u09AE\u09A8\u09BF\u099F\u09B0" },
      { en: 'Samsung Odyssey OLED G9 49" Dual QHD / Odyssey G8 / Neo G7 4K', bn: "\u09B8\u09CD\u09AF\u09BE\u09AE\u09B8\u09BE\u0982 \u0985\u09A1\u09BF\u09B8\u09BF \u0993\u09B2\u09C7\u09A1 \u099C\u09BF\u09EF / \u099C\u09BF\u09EE" },
      { en: 'Samsung ViewFinity S9 5K 27" / Odyssey G5 2K 165Hz Curved / Essential S3', bn: "\u09B8\u09CD\u09AF\u09BE\u09AE\u09B8\u09BE\u0982 \u09AD\u09BF\u0989\u09AB\u09BF\u09A8\u09BF\u099F\u09BF \u09EB\u0995\u09C7 / \u099C\u09BF\u09EB" },
      { en: 'LG UltraGear OLED 27" / 34" Curved 240Hz (27GS95QE) / 24GN65R 144Hz', bn: "\u098F\u09B2\u099C\u09BF \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE\u0997\u09BF\u09AF\u09BC\u09BE\u09B0 \u0993\u09B2\u09C7\u09A1 \u09E8\u09EA\u09E6\u09B9\u09BE\u09B0\u09CD\u099F\u099C" },
      { en: 'LG UltraFine 4K 32" / 27" IPS Ergo / 22MP410 Full HD', bn: "\u098F\u09B2\u099C\u09BF \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE\u09AB\u09BE\u0987\u09A8 \u09AB\u09CB\u09B0\u0995\u09C7 / \u0986\u0987\u09AA\u09BF\u098F\u09B8" },
      { en: 'Dell UltraSharp 32" 4K IPS Black / 27" U2724D / S2722QC 4K USB-C', bn: "\u09A1\u09C7\u09B2 \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE\u09B6\u09BE\u09B0\u09CD\u09AA \u09AB\u09CB\u09B0\u0995\u09C7 \u09AA\u09CD\u09B0\u09AB\u09C7\u09B6\u09A8\u09BE\u09B2 \u09AE\u09A8\u09BF\u099F\u09B0" },
      { en: 'Dell Alienware 34" Curved OLED (AW3423DWF) / AW2725DF 360Hz', bn: "\u09A1\u09C7\u09B2 \u098F\u09B2\u09BF\u09AF\u09BC\u09C7\u09A8\u0993\u09AF\u09BC\u09CD\u09AF\u09BE\u09B0 \u0993\u09B2\u09C7\u09A1 \u09E9\u09EC\u09E6\u09B9\u09BE\u09B0\u09CD\u099F\u099C" },
      { en: "MSI MAG 274UPF 4K 144Hz / Optix G241 / G274F 180Hz Fast IPS", bn: "\u098F\u09AE\u098F\u09B8\u0986\u0987 \u09AB\u09CB\u09B0\u0995\u09C7 \u0993 \u09AB\u09BE\u09B8\u09CD\u099F \u0986\u0987\u09AA\u09BF\u098F\u09B8 \u09AE\u09A8\u09BF\u099F\u09B0" },
      { en: "Gigabyte M27Q 2K 170Hz KVM / G24F 2 180Hz / AORUS FO32U2 OLED", bn: "\u0997\u09BF\u0997\u09BE\u09AC\u09BE\u0987\u099F \u098F\u09AE\u09E8\u09ED\u0995\u09BF\u0989 \u09E8\u0995\u09C7 \u0995\u09C7\u09AD\u09BF\u098F\u09AE \u09AE\u09A8\u09BF\u099F\u09B0" },
      { en: 'Xiaomi 30" Curved Gaming / 27" 2K / 23.8" IPS Desktop Monitor 1C', bn: "\u09B6\u09BE\u0993\u09AE\u09BF \u0995\u09BE\u09B0\u09CD\u09AD\u09A1 \u0997\u09C7\u09AE\u09BF\u0982 \u0993 \u09A1\u09C7\u09B8\u09CD\u0995\u099F\u09AA \u09AE\u09A8\u09BF\u099F\u09B0" },
      { en: 'Walton 27" / 24" / 21.5" Frameless Full HD IPS Monitor', bn: "\u0993\u09AF\u09BC\u09BE\u09B2\u099F\u09A8 \u09AB\u09CD\u09B0\u09C7\u09AE\u09B2\u09C7\u09B8 \u0986\u0987\u09AA\u09BF\u098F\u09B8 \u09AE\u09A8\u09BF\u099F\u09B0" }
    ]
  },
  {
    brandEn: "RAM & Storage (SSD/HDD)",
    brandBn: "\u09B0\u200D\u09CD\u09AF\u09BE\u09AE \u0993 \u098F\u09B8\u098F\u09B8\u09A1\u09BF/\u09B9\u09BE\u09B0\u09CD\u09A1\u09A1\u09BF\u09B8\u09CD\u0995 (RAM & Storage)",
    models: [
      { en: "Samsung 990 PRO 4TB/2TB/1TB PCIe 4.0 NVMe M.2 SSD (7450 MB/s)", bn: "\u09B8\u09CD\u09AF\u09BE\u09AE\u09B8\u09BE\u0982 \u09EF\u09EF\u09E6 \u09AA\u09CD\u09B0\u09CB \u098F\u09A8\u09AD\u09BF\u098F\u09AE\u0987 \u098F\u09B8\u098F\u09B8\u09A1\u09BF" },
      { en: "Samsung 980 PRO / 970 EVO Plus / 870 EVO SATA SSD / T9 Portable SSD", bn: "\u09B8\u09CD\u09AF\u09BE\u09AE\u09B8\u09BE\u0982 \u09EF\u09EE\u09E6 \u09AA\u09CD\u09B0\u09CB / \u09EF\u09ED\u09E6 \u0987\u09AD\u09CB \u09AA\u09CD\u09B2\u09BE\u09B8" },
      { en: "WD_BLACK SN850X 4TB/2TB / SN770 NVMe / WD Blue SN580 1TB", bn: "\u0993\u09AF\u09BC\u09C7\u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u09A8 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09AC\u09CD\u09B2\u09CD\u09AF\u09BE\u0995 \u098F\u09B8\u098F\u09A8\u09EE\u09EB\u09E6\u098F\u0995\u09CD\u09B8" },
      { en: "WD Red Pro NAS / WD Purple Surveillance / WD Blue 4TB/2TB HDD", bn: "\u0993\u09AF\u09BC\u09C7\u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u09A8 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09AC\u09CD\u09B2\u09C1/\u09AA\u09BE\u09B0\u09CD\u09AA\u09B2 \u09B9\u09BE\u09B0\u09CD\u09A1\u09A1\u09BF\u09B8\u09CD\u0995" },
      { en: "Seagate FireCuda 530 / BarraCuda 4TB/2TB / IronWolf NAS HDD", bn: "\u09B8\u09BF\u0997\u09C7\u099F \u09AC\u09BE\u09B0\u09BE\u0995\u09C1\u09A1\u09BE \u0993 \u09AB\u09BE\u09AF\u09BC\u09BE\u09B0\u0995\u09C1\u09A1\u09BE" },
      { en: "Kingston Fury Renegade / KC3000 / NV3 / NV2 1TB/2TB NVMe SSD", bn: "\u0995\u09BF\u0982\u09B8\u09CD\u099F\u09A8 \u0995\u09C7\u09B8\u09BF\u09E9\u09E6\u09E6\u09E6 / \u098F\u09A8\u09AD\u09BF\u09E9 \u098F\u09B8\u098F\u09B8\u09A1\u09BF" },
      { en: "Crucial T700 Gen5 NVMe (12400 MB/s) / T500 / P3 Plus / MX500 SATA", bn: "\u0995\u09CD\u09B0\u09C1\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u099F\u09BF\u09ED\u09E6\u09E6 \u099C\u09C7\u09A8\u09EB / \u09AA\u09BF\u09E9 \u09AA\u09CD\u09B2\u09BE\u09B8" },
      { en: "Lexar NM790 / TeamGroup MP44L / ADATA XPG GAMMIX S70 Blade", bn: "\u09B2\u09C7\u0995\u09CD\u09B8\u09BE\u09B0 \u098F\u09A8\u098F\u09AE\u09ED\u09EF\u09E6 / \u098F\u0995\u09CD\u09B8\u09AA\u09BF\u099C\u09BF \u098F\u09B8\u09ED\u09E6 \u098F\u09B8\u098F\u09B8\u09A1\u09BF" },
      { en: "Corsair Dominator Titanium RGB DDR5 6000MHz/6400MHz (32GB/64GB kit)", bn: "\u0995\u09B0\u09B8\u09C7\u09AF\u09BC\u09BE\u09B0 \u09A1\u09AE\u09BF\u09A8\u09C7\u099F\u09B0 \u099F\u09BE\u0987\u099F\u09BE\u09A8\u09BF\u09AF\u09BC\u09BE\u09AE \u09A1\u09BF\u09A1\u09BF\u0986\u09B0\u09EB" },
      { en: "Corsair Vengeance RGB DDR5 / Vengeance LPX DDR4 3200MHz", bn: "\u0995\u09B0\u09B8\u09C7\u09AF\u09BC\u09BE\u09B0 \u09AD\u09C7\u099E\u09CD\u099C\u09C7\u09A8\u09CD\u09B8 \u09A1\u09BF\u09A1\u09BF\u0986\u09B0\u09EB / \u09A1\u09BF\u09A1\u09BF\u0986\u09B0\u09EA" },
      { en: "G.Skill Trident Z5 RGB / Royal DDR5 7200MHz / Ripjaws V DDR4", bn: "\u099C\u09BF.\u09B8\u09CD\u0995\u09BF\u09B2 \u099F\u09CD\u09B0\u09BE\u0987\u09A1\u09C7\u09A8\u09CD\u099F \u099C\u09C7\u09A1\u09EB \u09A1\u09BF\u09A1\u09BF\u0986\u09B0\u09EB" },
      { en: "Kingston Fury Beast RGB DDR5 6000MHz / Fury Beast DDR4 3200MHz", bn: "\u0995\u09BF\u0982\u09B8\u09CD\u099F\u09A8 \u09AB\u09BF\u0989\u09B0\u09BF \u09AC\u09BF\u09B8\u09CD\u099F \u09A1\u09BF\u09A1\u09BF\u0986\u09B0\u09EB / \u09A1\u09BF\u09A1\u09BF\u0986\u09B0\u09EA" },
      { en: "TeamGroup T-Force Delta RGB DDR5 / ADATA XPG Lancer Blade DDR5", bn: "\u099F\u09BF-\u09AB\u09CB\u09B0\u09CD\u09B8 \u09A1\u09C7\u09B2\u09CD\u099F\u09BE / \u098F\u0995\u09CD\u09B8\u09AA\u09BF\u099C\u09BF \u09A1\u09BF\u09A1\u09BF\u0986\u09B0\u09EB" }
    ]
  },
  {
    brandEn: "Routers & Networking",
    brandBn: "\u09B0\u09BE\u0989\u099F\u09BE\u09B0 \u0993 \u09A8\u09C7\u099F\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u0995\u09BF\u0982 (WiFi 7 & Mesh)",
    models: [
      { en: "TP-Link Archer BE800 / BE550 Tri-Band WiFi 7 Router", bn: "\u099F\u09BF\u09AA\u09BF-\u09B2\u09BF\u0999\u09CD\u0995 \u0993\u09AF\u09BC\u09BE\u0987\u09AB\u09BE\u0987 \u09ED \u09B0\u09BE\u0989\u099F\u09BE\u09B0" },
      { en: "TP-Link Archer AX73 / AX55 / AX53 / AX12 Dual-Band WiFi 6 Gigabit", bn: "\u099F\u09BF\u09AA\u09BF-\u09B2\u09BF\u0999\u09CD\u0995 \u0986\u09B0\u09CD\u099A\u09BE\u09B0 \u098F\u098F\u0995\u09CD\u09B8\u09ED\u09E9 / \u098F\u098F\u0995\u09CD\u09B8\u09EB\u09EB \u0993\u09AF\u09BC\u09BE\u0987\u09AB\u09BE\u0987 \u09EC" },
      { en: "TP-Link Archer C6 / C80 / C24 / WR840N / WR841N", bn: "\u099F\u09BF\u09AA\u09BF-\u09B2\u09BF\u0999\u09CD\u0995 \u0986\u09B0\u09CD\u099A\u09BE\u09B0 \u09B8\u09BF\u09EC / \u09B8\u09BF\u09EE\u09E6" },
      { en: "TP-Link Deco BE85 / X50 / X20 / M4 Whole Home Mesh WiFi", bn: "\u099F\u09BF\u09AA\u09BF-\u09B2\u09BF\u0999\u09CD\u0995 \u09A1\u09C7\u0995\u09CB \u09AE\u09C7\u09B6 \u0993\u09AF\u09BC\u09BE\u0987\u09AB\u09BE\u0987 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE" },
      { en: "MikroTik CCR2004 / RB5009 / hAP ax3 / hAP ac2 / RB750Gr3 (Hex)", bn: "\u09AE\u09BE\u0987\u0995\u09CD\u09B0\u09CB\u099F\u09BF\u0995 \u09B9\u09C7\u0995\u09CD\u09B8 \u0993 \u0995\u09CD\u09B2\u09BE\u0989\u09A1 \u09B0\u09BE\u0989\u099F\u09BE\u09B0" },
      { en: "Tenda TX12 Pro / TX2 Pro WiFi 6 / AC23 / AC10 Gigabit Router", bn: "\u099F\u09C7\u09A8\u09CD\u09A1\u09BE \u099F\u09BF\u098F\u0995\u09CD\u09B8\u09E7\u09E8 \u09AA\u09CD\u09B0\u09CB \u0993\u09AF\u09BC\u09BE\u0987\u09AB\u09BE\u0987 \u09EC / \u098F\u09B8\u09BF\u09E8\u09E9" },
      { en: "ASUS ROG Rapture GT-AX11000 Pro / RT-AX88U Pro / RT-AX58U Gaming", bn: "\u0986\u09B8\u09C1\u09B8 \u0986\u09B0\u0993\u099C\u09BF \u0997\u09C7\u09AE\u09BF\u0982 \u0993\u09AF\u09BC\u09BE\u0987\u09AB\u09BE\u0987 \u09B0\u09BE\u0989\u099F\u09BE\u09B0" },
      { en: "Ubiquiti UniFi Dream Machine Special Edition / U6 Pro Access Point", bn: "\u0987\u0989\u09AC\u09BF\u0995\u09C1\u0987\u099F\u09BF \u0987\u0989\u09A8\u09BF\u09AB\u09BE\u0987 \u09A1\u09CD\u09B0\u09BF\u09AE \u09AE\u09C7\u09B6\u09BF\u09A8" },
      { en: "D-Link DIR-X5460 / DIR-882 / Cudy WR3000 / Ruijie Reyee RG-EW3200GX", bn: "\u09A1\u09BF-\u09B2\u09BF\u0999\u09CD\u0995 / \u0995\u09C1\u09A1\u09BF / \u09B0\u09C1\u0987\u099C\u09BF \u09B0\u09C7\u09AF\u09BC\u09C0 \u09B0\u09BE\u0989\u099F\u09BE\u09B0" }
    ]
  },
  {
    brandEn: "Printers & Scanners",
    brandBn: "\u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0 \u0993 \u09B8\u09CD\u0995\u09CD\u09AF\u09BE\u09A8\u09BE\u09B0 (Epson, Canon, HP, Brother)",
    models: [
      { en: "Epson EcoTank L3210 / L3250 (All-in-One Wi-Fi Ink Tank Color)", bn: "\u098F\u09AA\u09B8\u09A8 \u0987\u0995\u09CB-\u099F\u09CD\u09AF\u09BE\u0999\u09CD\u0995 \u098F\u09B2\u09E9\u09E8\u09E7\u09E6 / \u098F\u09B2\u09E9\u09E8\u09EB\u09E6 \u0995\u09BE\u09B2\u09BE\u09B0" },
      { en: "Epson EcoTank L8050 / L18050 (6-Color Photo & PVC Card Printer)", bn: "\u098F\u09AA\u09B8\u09A8 \u098F\u09B2\u09EE\u09E6\u09EB\u09E6 \u09AB\u099F\u09CB \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0" },
      { en: "Canon PIXMA G3010 / G2010 / G3020 / G1010 All-in-One Ink Tank", bn: "\u0995\u09CD\u09AF\u09BE\u09A8\u09A8 \u09AA\u09BF\u0995\u09CD\u09B8\u09AE\u09BE \u099C\u09BF\u09E9\u09E6\u09E7\u09E6 / \u099C\u09BF\u09E8\u09E6\u09E7\u09E6 \u0995\u09BE\u09B2\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0" },
      { en: "Canon imageCLASS LBP2900B / LBP6030w Heavy Duty Laser Printer", bn: "\u0995\u09CD\u09AF\u09BE\u09A8\u09A8 \u098F\u09B2\u09AC\u09BF\u09AA\u09BF\u09E8\u09EF\u09E6\u09E6\u09AC\u09BF \u09B2\u09C7\u099C\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0" },
      { en: "HP Smart Tank 580 / 515 All-in-One Wireless Color Printer", bn: "\u098F\u0987\u099A\u09AA\u09BF \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F \u099F\u09CD\u09AF\u09BE\u0999\u09CD\u0995 \u09EB\u09EE\u09E6 \u0993\u09AF\u09BC\u09BE\u0987\u09AB\u09BE\u0987 \u0995\u09BE\u09B2\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0" },
      { en: "HP LaserJet Pro M404dn / M15w / MFP 135w Monochrome Laser", bn: "\u098F\u0987\u099A\u09AA\u09BF \u09B2\u09C7\u099C\u09BE\u09B0\u099C\u09C7\u099F \u09AA\u09CD\u09B0\u09CB \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0" },
      { en: "Brother DCP-T420W / DCP-T520W / DCP-T720DW Duplex WiFi Ink Tank", bn: "\u09AC\u09CD\u09B0\u09BE\u09A6\u09BE\u09B0 \u09A1\u09BF\u09B8\u09BF\u09AA\u09BF-\u099F\u09BF\u09EA\u09E8\u09E6\u09A1\u09AC\u09CD\u09B2\u09BF\u0989 \u0995\u09BE\u09B2\u09BE\u09B0 \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0" },
      { en: "Brother HL-L2320D / HL-L2365DW Auto Duplex Laser Printer", bn: "\u09AC\u09CD\u09B0\u09BE\u09A6\u09BE\u09B0 \u09B2\u09C7\u099C\u09BE\u09B0\u099C\u09C7\u099F \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0" },
      { en: "Zebra ZD220 / ZD230 / TSC TE244 Barcode & Label Thermal Printer", bn: "\u099C\u09C7\u09AC\u09CD\u09B0\u09BE \u0993 \u099F\u09BF\u098F\u09B8\u09B8\u09BF \u09AC\u09BE\u09B0\u0995\u09CB\u09A1 \u09B2\u09C7\u09AC\u09C7\u09B2 \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0" },
      { en: "POS Receipt Printer 80mm / 58mm Thermal (Epson/Xprinter/Rongta)", bn: "\u09AA\u09BF\u0993\u098F\u09B8 \u09AE\u09BE\u09A8\u09BF \u09B0\u09BF\u09B8\u09BF\u099F \u09A5\u09BE\u09B0\u09CD\u09AE\u09BE\u09B2 \u09AA\u09CD\u09B0\u09BF\u09A8\u09CD\u099F\u09BE\u09B0" }
    ]
  }
];
