/* ===== Translations ===== */
const translations = {
  en: {
    nav_online: "Online",
    nav_offline: "Offline",
    nav_fixes: "Fixes",
    nav_notes: "Notes",
    nav_ios: "iOS",
    hero_badge: "FAN-MADE REVIVAL · 2026",
    hero_sub: "Complete installation, troubleshooting and tips guide<br />for the community server. No bloat. Just what you need.",
    hero_cta_online: "Online guide",
    hero_cta_offline: "Offline guide",
    hero_cta_ios: "iOS Sideload",
    warning: "<strong>Warning:</strong> Fan-made, unofficial project. Not affiliated with Bandai Namco / GREE. Everything is free. Download the APK <em>only</em> from the official Discord / site.",
    online_title: "Online Mode",
    online_sub: "Live servers · Discord-linked account · Banners progress chronologically",
    on_s1_title: "Join the Discord",
    on_s1_desc: "Your game account is linked to Discord. Join the official server and verify.",
    on_s2_title: "Download the APK",
    on_s2_desc: "From the official site or #downloads channel. If the download does not finish 100%, switch browser (Chrome to Firefox or vice versa) and try again.",
    on_s3_title: "Install",
    on_s3_desc: "Open the APK. <strong>Play Protect will appear</strong> → tap <em>More info</em> / <em>Show more</em> → then <em>Install anyway</em>. Do not skip this step.",
    on_s4_title: "Sign in with Discord",
    on_s4_desc: "Open the game → Sign in with Discord. Account is created automatically. Let it download the ~220 MB game data (Wi-Fi, keep screen on).",
    on_card1_title: "Link Discord later",
    on_card1_desc: "Others → Account. DATA TRANSFER is not valid for Online — you must link from inside the game menu.",
    on_card2_title: "Banners",
    on_card2_desc: "Starts with the 2016 One Tail Naruto banner. Banners change chronologically as the server progresses.",
    on_card3_title: "Separate accounts",
    on_card3_desc: "Online and Offline are completely separate apps with separate accounts. Progress does not transfer between them.",
    offline_title: "Offline Mode",
    offline_sub: "Launcher + game · Local save only · All banners available",
    offline_warning: "<strong>Important:</strong> Offline data is saved only on your device. Deleting the game = permanent loss of progress. There are 2 separate offline modes with separate local accounts.",
    off_s1_title: "Download the correct APK",
    off_s1_desc: "From the <strong>#downloads</strong> channel on Discord:<br />• <strong>ARM</strong> → real Android phone<br />• <strong>x86_x64</strong> → emulator",
    off_s2_title: "Install the Launcher",
    off_s2_desc: "<strong>Play Protect will appear</strong> → <em>More info</em> → <em>Install anyway</em>. Open the app (Naruto Sage Mode icon).",
    off_s3_title: "Update pop-up → Later",
    off_s3_desc: "An update pop-up appears. Tap <strong>Later</strong> (it is an older version).",
    off_s4_title: "Switch to Beta channel",
    off_s4_desc: "Open the left-side menu → <strong>Updates</strong>. Change first setting from <em>Stable</em> to <em>Beta</em>. Then press <strong>Check for updates</strong>.",
    off_s5_title: "Update to latest (v0.28+)",
    off_s5_desc: "Press <strong>Update now</strong>. Wait until it reinstalls the app (white UI like first install) → press Install when prompted.",
    off_s6_title: "Fix + download game data",
    off_s6_desc: "Reopen the launcher → press <strong>Fix</strong>. The game (original icon) will download. <strong>Play Protect may appear again</strong> (sometimes twice) → always <em>More info</em> → <em>Install anyway</em> until the <strong>Play</strong> button appears.",
    off_s7_title: "Play",
    off_s7_desc: "When the Play button is visible, tap it to launch the game.",
    off_card1_title: "Vanilla mode",
    off_card1_desc: "Starts at level 1 with 1000 pearls. All banners available from the start (unlike Online which starts in 2016 and progresses).",
    off_card2_title: "Rewards / Gameplay",
    off_card2_desc: "You can change rewards and gameplay options from the Launcher → GAMEPLAY settings.",
    off_card3_title: "Local save only",
    off_card3_desc: "Progress is stored on the device. Uninstalling the game deletes everything. No cloud backup.",
    ios_title: "iOS Sideloading",
    ios_sub: "SideStore + LiveContainer · Unlimited apps · No PC required on iOS 27",
    ios_warning: "<strong>Important:</strong> Use only official sources. The site <em>sideinstaller.com</em> is <strong>fake / malware</strong>. Official: sideinstaller.net and frizzlem.github.io/SideInstaller",
    ios_nopc_h: "Method 1 — No PC (iOS 27 recommended)",
    ios_nopc_intro: "Uses SideInstaller. Fully on-device on iOS 27. On iOS 18–26 you still need a pairing file generated once on a PC.",
    ios_s1_title: "Install LocalDevVPN",
    ios_s1_desc: "Open App Store → search LocalDevVPN → install. Open the app and tap Connect. Keep the VPN on during the whole installation.",
    ios_s2_title: "Install SideInstaller (official only)",
    ios_s2_desc: "Open Safari → go to frizzlem.github.io/SideInstaller. Follow the on-page steps (DNS profile + choose an available certificate → Install). Then go to Settings → General → VPN & Device Management → Trust the developer profile.",
    ios_s3_title: "Install SideStore + LiveContainer",
    ios_s3_desc: "Open SideInstaller → make sure LocalDevVPN is connected → sign in with an Apple ID (preferably a secondary / burner account) → choose Install SideStore + LiveContainer. Wait until it finishes.",
    ios_s4_title: "Trust + Developer Mode",
    ios_s4_desc: "Settings → General → VPN & Device Management → Trust the Apple ID profile. Then Settings → Privacy & Security → Developer Mode → On (phone will restart). Open LiveContainer → open the built-in SideStore → sign in with the same Apple ID → do a manual Refresh.",
    ios_s5_title: "Clean up",
    ios_s5_desc: "After everything works, go to Settings → General → VPN & Device Management and remove the SideInstaller DNS profile. Keep LocalDevVPN installed — you need it for weekly refreshes.",
    ios_pc_h: "Method 2 — With PC (iloader)",
    ios_pc_intro: "Works on most iOS versions. You only need the computer for the first install. After that everything is on-device.",
    ios_pc1_title: "Install LocalDevVPN + iloader",
    ios_pc1_desc: "On iPhone: install LocalDevVPN from App Store and connect it. On computer: download iloader from the official SideStore docs or iloader.app.",
    ios_pc2_title: "Connect & install",
    ios_pc2_desc: "Connect iPhone via USB → trust the computer. Open iloader → sign in with Apple ID → select your device → choose LiveContainer + SideStore (or SideStore first). Install.",
    ios_pc3_title: "Trust + Developer Mode + Refresh",
    ios_pc3_desc: "Same as Method 1: Trust the profile, enable Developer Mode, open SideStore / LiveContainer, sign in, do a manual refresh with LocalDevVPN connected.",
    ios_card1_title: "Why LiveContainer?",
    ios_card1_desc: "Free Apple ID allows only 3 sideloaded apps. LiveContainer runs other apps inside itself so they don’t count toward the limit.",
    ios_card2_title: "7-day refresh",
    ios_card2_desc: "Apps expire every 7 days on a free Apple ID. Connect LocalDevVPN and refresh inside SideStore (or use scheduled refresh if available).",
    ios_card3_title: "Burner Apple ID",
    ios_card3_desc: "Strongly recommended. If Apple locks the account you don’t lose your main one.",
    fix_title: "Fixes & Troubleshooting",
    fix_sub: "Most common issues and real solutions from helpers",
    fix_online_h: "Online — Communication / Connection error",
    faq_on1_q: "1. Play Protect blocked the install",
    faq_on1_a: "During installation you must press More info / Show more → Install anyway. If you skipped this, uninstall and reinstall correctly.",
    faq_on2_q: "2. Antivirus / Firewall / Private DNS",
    faq_on2_a: "Turn off antivirus, firewall and Private DNS temporarily. These often block the connection to the private server.",
    faq_on3_q: "3. VPN needed (Europe recommended)",
    faq_on3_a: "Some regions need a VPN. European servers are recommended. Connect to an EU location and try again.",
    fix_offline_h: "Offline — Communication / Connection error",
    faq_off1_q: "1. Outdated Launcher",
    faq_off1_a: "You must switch to Beta channel and update to the latest version (see Offline installation steps 4–5). Old launcher causes connection errors.",
    faq_off2_q: "2. Play Protect blocked during install",
    faq_off2_a: "Same as Online: More info → Install anyway. If you continued without this, reinstall both launcher and game properly.",
    faq_off3_q: "3. Corrupted file",
    faq_off3_a: "Delete the APK and redownload from #downloads. Incomplete downloads are common.",
    faq_off4_q: "4. Restart game / phone",
    faq_off4_a: "Force close the game completely and reopen, or restart the phone. Simple but often works.",
    faq_off5_q: "5. Antivirus / Private DNS",
    faq_off5_a: "Disable antivirus and Private DNS. Same issue as Online.",
    faq_off6_q: "6. VPN (EU recommended)",
    faq_off6_a: "Some regions need a European VPN even for Offline mode.",
    fix_ios_h: "iOS — Common problems",
    faq_ios1_q: "1. SideInstaller won’t open / certificate revoked",
    faq_ios1_a: "Go back to the official install page and try another available certificate. Certificates get revoked frequently.",
    faq_ios2_q: "2. Unable to verify app",
    faq_ios2_a: "Settings → General → VPN & Device Management → tap the developer profile → Trust.",
    faq_ios3_q: "3. Refresh fails / apps expire",
    faq_ios3_a: "Make sure LocalDevVPN is connected. Open SideStore → My Apps → tap the 7 DAYS timer to force a refresh.",
    faq_ios4_q: "4. Apple ID too new / rate limited",
    faq_ios4_a: "Wait 15–30 minutes or use a different (older) Apple ID. Very new accounts are often restricted by Apple.",
    notes_title: "Important notes",
    notes_sub: "Emulator, accounts and common mistakes",
    note1_label: "EMULATOR",
    note1_title: "Use Pie64 image",
    note1_desc: "Many users from USA and Asia automatically get the Nougat image. Offline update then crashes. Always choose the Pie64 (Android 9 64-bit) system image when creating the emulator instance.",
    note2_label: "ACCOUNTS",
    note2_title: "Online ≠ Offline",
    note2_desc: "They are completely separate applications with separate accounts. Progress never transfers. Online links via Discord (Others → Account). Offline is local only.",
    note3_label: "ONLINE",
    note3_title: "No Data Transfer",
    note3_desc: "The old Data Transfer code does not work for Online. You must link the account from inside the game: Others → Account → Discord.",
    note4_label: "OFFLINE",
    note4_title: "Local data only",
    note4_desc: "Everything is stored on the phone/emulator. Uninstalling the game or clearing data = permanent loss. There is no cloud backup.",
    links_title: "Official links",
    links_sub: "Verified sources only",
    link_site: "Official site",
    link_apk: "Download APK (Online)",
    link_apk_sub: "Only from here",
    link_discord_sub: "#downloads channel for Offline",
    link_sideinstaller: "SideInstaller (official)",
    footer_note: "Unofficial guide made by a community helper.<br />Not affiliated with the official project team.",
    footer_update: "Last update: October 2026",
    footer_free: "Fan-made project · Free",
    footer_credit: "Site designed & built by <a href=\"https://github.com/txrrot\" target=\"_blank\" rel=\"noopener\">TXRROT</a>",
  },
  ro: {
    nav_online: "Online",
    nav_offline: "Offline",
    nav_fixes: "Fix-uri",
    nav_notes: "Note",
    nav_ios: "iOS",
    hero_badge: "FAN-MADE REVIVAL · 2026",
    hero_sub: "Ghidul complet de instalare, troubleshooting și sfaturi<br />pentru serverul comunității. Fără bloat. Doar ce ai nevoie.",
    hero_cta_online: "Ghid Online",
    hero_cta_offline: "Ghid Offline",
    hero_cta_ios: "iOS Sideload",
    warning: "<strong>Atenție:</strong> Proiect fan-made, neoficial. Nu este afiliat cu Bandai Namco / GREE. Totul este gratuit. Descarcă APK-ul <em>doar</em> de pe Discord / site-ul oficial.",
    online_title: "Mod Online",
    online_sub: "Servere live · Cont legat de Discord · Bannerele progresează cronologic",
    on_s1_title: "Intră pe Discord",
    on_s1_desc: "Contul de joc este legat de Discord. Alătură-te serverului oficial și verifică-te.",
    on_s2_title: "Descarcă APK-ul",
    on_s2_desc: "De pe site-ul oficial sau canalul #downloads. Dacă download-ul nu se termină 100%, schimbă browserul (Chrome ↔ Firefox) și încearcă din nou.",
    on_s3_title: "Instalează",
    on_s3_desc: "Deschide APK-ul. <strong>Play Protect va apărea</strong> → apasă <em>More info</em> / <em>Show more</em> → apoi <em>Install anyway</em>. Nu sări peste acest pas.",
    on_s4_title: "Sign in with Discord",
    on_s4_desc: "Deschide jocul → Sign in with Discord. Contul se creează automat. Lasă să descarce ~220 MB de date (Wi-Fi, ecran aprins).",
    on_card1_title: "Link Discord mai târziu",
    on_card1_desc: "Others → Account. DATA TRANSFER nu e valid pentru Online — trebuie linkuit din meniul jocului.",
    on_card2_title: "Bannere",
    on_card2_desc: "Începe cu bannerul One Tail Naruto din 2016. Bannerele se schimbă cronologic pe măsură ce serverul progresează.",
    on_card3_title: "Conturi separate",
    on_card3_desc: "Online și Offline sunt aplicații complet separate cu conturi separate. Progresul nu se transferă între ele.",
    offline_title: "Mod Offline",
    offline_sub: "Launcher + joc · Salvare locală · Toate bannerele disponibile",
    offline_warning: "<strong>Important:</strong> Datele Offline sunt salvate doar pe dispozitiv. Ștergerea jocului = pierdere permanentă a progresului. Există 2 moduri offline separate cu conturi locale separate.",
    off_s1_title: "Descarcă APK-ul corect",
    off_s1_desc: "Din canalul <strong>#downloads</strong> pe Discord:<br />• <strong>ARM</strong> → telefon Android real<br />• <strong>x86_x64</strong> → emulator",
    off_s2_title: "Instalează Launcher-ul",
    off_s2_desc: "<strong>Play Protect va apărea</strong> → <em>More info</em> → <em>Install anyway</em>. Deschide aplicația (iconița Naruto Sage Mode).",
    off_s3_title: "Pop-up update → Later",
    off_s3_desc: "Apare un pop-up de update. Apasă <strong>Later</strong> (e o versiune mai veche).",
    off_s4_title: "Treci pe canalul Beta",
    off_s4_desc: "Deschide meniul din stânga → <strong>Updates</strong>. Schimbă primul setting din <em>Stable</em> în <em>Beta</em>. Apoi apasă <strong>Check for updates</strong>.",
    off_s5_title: "Update la ultima versiune (v0.28+)",
    off_s5_desc: "Apasă <strong>Update now</strong>. Așteaptă reinstalarea (UI alb ca la prima instalare) → apasă Install când apare.",
    off_s6_title: "Fix + download date joc",
    off_s6_desc: "Redeschide launcher-ul → apasă <strong>Fix</strong>. Jocul (iconița originală) se descarcă. <strong>Play Protect poate apărea din nou</strong> (uneori de 2 ori) → mereu <em>More info</em> → <em>Install anyway</em> până apare butonul <strong>Play</strong>.",
    off_s7_title: "Joacă",
    off_s7_desc: "Când vezi butonul Play, apasă-l ca să lansezi jocul.",
    off_card1_title: "Mod Vanilla",
    off_card1_desc: "Începi la level 1 cu 1000 de pearls. Toate bannerele disponibile de la început (spre deosebire de Online care începe în 2016).",
    off_card2_title: "Rewards / Gameplay",
    off_card2_desc: "Poți schimba reward-urile și opțiunile de gameplay din Launcher → GAMEPLAY.",
    off_card3_title: "Salvare locală",
    off_card3_desc: "Progresul e stocat pe dispozitiv. Dezinstalarea jocului șterge tot. Nu există backup cloud.",
    ios_title: "Sideloading iOS",
    ios_sub: "SideStore + LiveContainer · Aplicații nelimitate · Fără PC pe iOS 27",
    ios_warning: "<strong>Important:</strong> Folosește doar surse oficiale. Site-ul <em>sideinstaller.com</em> este <strong>fals / malware</strong>. Oficial: sideinstaller.net și frizzlem.github.io/SideInstaller",
    ios_nopc_h: "Metoda 1 — Fără PC (iOS 27 recomandat)",
    ios_nopc_intro: "Folosește SideInstaller. Complet pe dispozitiv pe iOS 27. Pe iOS 18–26 ai nevoie de un pairing file generat o dată pe PC.",
    ios_s1_title: "Instalează LocalDevVPN",
    ios_s1_desc: "Deschide App Store → caută LocalDevVPN → instalează. Deschide aplicația și apasă Connect. Lasă VPN-ul pornit pe toată durata instalării.",
    ios_s2_title: "Instalează SideInstaller (doar oficial)",
    ios_s2_desc: "Deschide Safari → meri pe frizzlem.github.io/SideInstaller. Urmează pașii de pe pagină (DNS profile + alege un certificat disponibil → Install). Apoi Settings → General → VPN & Device Management → Trust profilul de developer.",
    ios_s3_title: "Instalează SideStore + LiveContainer",
    ios_s3_desc: "Deschide SideInstaller → asigură-te că LocalDevVPN e conectat → loghează-te cu un Apple ID (preferabil unul secundar / burner) → alege Install SideStore + LiveContainer. Așteaptă până se termină.",
    ios_s4_title: "Trust + Developer Mode",
    ios_s4_desc: "Settings → General → VPN & Device Management → Trust profilul Apple ID. Apoi Settings → Privacy & Security → Developer Mode → On (telefonul restartează). Deschide LiveContainer → deschide SideStore din interior → loghează-te cu același Apple ID → fă un Refresh manual.",
    ios_s5_title: "Curățenie",
    ios_s5_desc: "După ce totul funcționează, mergi la Settings → General → VPN & Device Management și șterge profilul DNS SideInstaller. Păstrează LocalDevVPN — îl folosești la refresh săptămânal.",
    ios_pc_h: "Metoda 2 — Cu PC (iloader)",
    ios_pc_intro: "Funcționează pe majoritatea versiunilor iOS. Ai nevoie de computer doar la prima instalare. După aceea totul e pe dispozitiv.",
    ios_pc1_title: "Instalează LocalDevVPN + iloader",
    ios_pc1_desc: "Pe iPhone: instalează LocalDevVPN din App Store și conectează-l. Pe computer: descarcă iloader de pe documentația oficială SideStore sau iloader.app.",
    ios_pc2_title: "Conectează & instalează",
    ios_pc2_desc: "Conectează iPhone-ul prin USB → trust computerul. Deschide iloader → loghează-te cu Apple ID → selectează dispozitivul → alege LiveContainer + SideStore (sau SideStore primul). Instalează.",
    ios_pc3_title: "Trust + Developer Mode + Refresh",
    ios_pc3_desc: "La fel ca Metoda 1: Trust profilul, activează Developer Mode, deschide SideStore / LiveContainer, loghează-te, fă refresh manual cu LocalDevVPN conectat.",
    ios_card1_title: "De ce LiveContainer?",
    ios_card1_desc: "Un Apple ID free permite doar 3 aplicații sideloadate. LiveContainer rulează alte aplicații în interiorul lui, deci nu contează la limită.",
    ios_card2_title: "Refresh la 7 zile",
    ios_card2_desc: "Aplicațiile expiră la 7 zile pe free Apple ID. Conectează LocalDevVPN și fă refresh în SideStore (sau scheduled refresh dacă e disponibil).",
    ios_card3_title: "Apple ID burner",
    ios_card3_desc: "Foarte recomandat. Dacă Apple blochează contul, nu pierzi contul principal.",
    fix_title: "Fix-uri & Troubleshooting",
    fix_sub: "Problemele cele mai frecvente și soluțiile reale de la helperi",
    fix_online_h: "Online — Eroare de comunicare / conexiune",
    faq_on1_q: "1. Play Protect a blocat instalarea",
    faq_on1_a: "La instalare trebuie să apeși More info / Show more → Install anyway. Dacă ai sărit peste, dezinstalează și reinstalează corect.",
    faq_on2_q: "2. Antivirus / Firewall / DNS Privat",
    faq_on2_a: "Oprește temporar antivirusul, firewall-ul și DNS-ul privat. Acestea blochează des conexiunea la serverul privat.",
    faq_on3_q: "3. VPN necesar (Europa recomandată)",
    faq_on3_a: "Unele regiuni au nevoie de VPN. Se recomandă servere europene. Conectează-te pe o locație EU și încearcă din nou.",
    fix_offline_h: "Offline — Eroare de comunicare / conexiune",
    faq_off1_q: "1. Launcher outdated",
    faq_off1_a: "Trebuie să treci pe canalul Beta și să updatezi la ultima versiune (vezi pașii Offline 4–5). Launcher-ul vechi dă erori de conexiune.",
    faq_off2_q: "2. Play Protect a blocat la instalare",
    faq_off2_a: "La fel ca Online: More info → Install anyway. Dacă ai continuat fără, reinstalează atât launcher-ul cât și jocul corect.",
    faq_off3_q: "3. Fișier corupt",
    faq_off3_a: "Șterge APK-ul și descarcă din nou din #downloads. Download-urile incomplete sunt frecvente.",
    faq_off4_q: "4. Restart joc / telefon",
    faq_off4_a: "Închide forțat jocul și redeschide, sau restartează telefonul. Simplu, dar funcționează des.",
    faq_off5_q: "5. Antivirus / DNS Privat",
    faq_off5_a: "Dezactivează antivirusul și DNS-ul privat. Aceeași problemă ca la Online.",
    faq_off6_q: "6. VPN (EU recomandat)",
    faq_off6_a: "Unele regiuni au nevoie de VPN european chiar și pentru Offline.",
    fix_ios_h: "iOS — Probleme frecvente",
    faq_ios1_q: "1. SideInstaller nu se deschide / certificat revocat",
    faq_ios1_a: "Revino pe pagina oficială de instalare și încearcă alt certificat disponibil. Certificatele se revocă frecvent.",
    faq_ios2_q: "2. Unable to verify app",
    faq_ios2_a: "Settings → General → VPN & Device Management → apasă pe profilul de developer → Trust.",
    faq_ios3_q: "3. Refresh eșuează / aplicațiile expiră",
    faq_ios3_a: "Asigură-te că LocalDevVPN e conectat. Deschide SideStore → My Apps → apasă pe timerul 7 DAYS ca să forțezi refresh-ul.",
    faq_ios4_q: "4. Apple ID prea nou / rate limited",
    faq_ios4_a: "Așteaptă 15–30 minute sau folosește un alt Apple ID (mai vechi). Conturile foarte noi sunt restricționate de Apple.",
    notes_title: "Note importante",
    notes_sub: "Emulator, conturi și greșeli frecvente",
    note1_label: "EMULATOR",
    note1_title: "Folosește imaginea Pie64",
    note1_desc: "Mulți useri din USA și Asia descarcă automat imaginea Nougat. Update-ul Offline dă crash. Alege mereu Pie64 (Android 9 64-bit) când creezi instanța de emulator.",
    note2_label: "CONTURI",
    note2_title: "Online ≠ Offline",
    note2_desc: "Sunt aplicații complet separate cu conturi separate. Progresul nu se transferă niciodată. Online se leagă prin Discord (Others → Account). Offline e doar local.",
    note3_label: "ONLINE",
    note3_title: "Fără Data Transfer",
    note3_desc: "Codul vechi de Data Transfer nu funcționează pentru Online. Trebuie să legi contul din joc: Others → Account → Discord.",
    note4_label: "OFFLINE",
    note4_title: "Date doar locale",
    note4_desc: "Totul e stocat pe telefon/emulator. Dezinstalarea sau ștergerea datelor = pierdere permanentă. Nu există backup cloud.",
    links_title: "Link-uri oficiale",
    links_sub: "Doar sursele verificate",
    link_site: "Site oficial",
    link_apk: "Download APK (Online)",
    link_apk_sub: "Doar de aici",
    link_discord_sub: "Canalul #downloads pentru Offline",
    link_sideinstaller: "SideInstaller (oficial)",
    footer_note: "Ghid neoficial făcut de un helper din comunitate.<br />Nu este afiliat cu echipa oficială a proiectului.",
    footer_update: "Ultima actualizare: Octombrie 2026",
    footer_free: "Proiect fan-made · Gratuit",
    footer_credit: "Site creat de <a href=\"https://github.com/txrrot\" target=\"_blank\" rel=\"noopener\">TXRROT</a>",
  }
};

/* Keep the rest of the original script logic for lang switcher, reveal, faq, etc. */
(function() {
  document.documentElement.classList.add("js");
  const langBtn = document.getElementById("langBtn");
  const langDropdown = document.getElementById("langDropdown");
  const langCurrent = document.getElementById("langCurrent");
  let currentLang = localStorage.getItem("blazing-lang") || "en";

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem("blazing-lang", lang);
    langCurrent.textContent = lang.toUpperCase();
    const t = translations[lang] || translations.en;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const key = el.getAttribute("data-i18n-html");
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll(".lang-dropdown button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }

  if (langBtn && langDropdown) {
    langBtn.addEventListener("click", e => {
      e.stopPropagation();
      document.querySelector(".lang-switcher").classList.toggle("open");
    });
    langDropdown.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        applyLang(btn.dataset.lang);
        document.querySelector(".lang-switcher").classList.remove("open");
      });
    });
    document.addEventListener("click", () => {
      document.querySelector(".lang-switcher")?.classList.remove("open");
    });
  }

  applyLang(currentLang);

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach(el => io.observe(el));

  // FAQ accordion
  document.querySelectorAll(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const was = item.classList.contains("active");
      document.querySelectorAll(".faq-item.active").forEach(i => i.classList.remove("active"));
      if (!was) item.classList.add("active");
    });
  });

  // Nav scroll + parallax
  const navEl = document.querySelector(".nav");
  const heroGlow = document.querySelector(".hero-glow");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (heroGlow) {
      heroGlow.style.transform = "translateX(-50%) translateY(" + (y * 0.35) + "px");
      heroGlow.style.opacity = String(Math.max(0.15, 0.55 - y / 1200));
    }
    if (navEl) navEl.classList.toggle("scrolled", y > 40);
  }, { passive: true });
})();
