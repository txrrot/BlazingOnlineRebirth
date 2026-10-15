// Textele pentru modul VIDEO, în cele 5 limbi.
// Fișier separat de translations.ts (care e regenerat de scripts/generate-translations.js).
// Textele sunt simple (fără HTML). Căile din iOS rămân în engleză, ca în restul site-ului.

import type { Lang } from './translations'

export interface VideoUiText {
  modeLabel: string
  clipHeading: string
  step: string
  steps: string
  tapToWatch: string
  loadError: string
  close: string
}

export interface VideoPartText {
  title: string
  bullets: string[]
}

export const VIDEO_UI: Record<Lang, VideoUiText> = {
  en: { modeLabel: 'Guide format', clipHeading: 'In this clip', step: 'Step', steps: 'Steps', tapToWatch: 'Tap to watch', loadError: 'Video could not be loaded.', close: 'Close' },
  ro: { modeLabel: 'Format ghid', clipHeading: 'În acest clip', step: 'Pasul', steps: 'Pașii', tapToWatch: 'Apasă pentru a vedea', loadError: 'Videoclipul nu a putut fi încărcat.', close: 'Închide' },
  fr: { modeLabel: 'Format du guide', clipHeading: 'Dans cette vidéo', step: 'Étape', steps: 'Étapes', tapToWatch: 'Appuyez pour regarder', loadError: "La vidéo n'a pas pu être chargée.", close: 'Fermer' },
  es: { modeLabel: 'Formato de la guía', clipHeading: 'En este clip', step: 'Paso', steps: 'Pasos', tapToWatch: 'Toca para ver', loadError: 'No se pudo cargar el vídeo.', close: 'Cerrar' },
  ko: { modeLabel: '가이드 형식', clipHeading: '이 영상에서', step: '단계', steps: '단계', tapToWatch: '눌러서 보기', loadError: '영상을 불러올 수 없습니다.', close: '닫기' },
}

export const VIDEO_PARTS_TEXT: Record<Lang, Record<string, VideoPartText>> = {
  en: {
    'esign-1': {
      title: 'Install the Anti-Revoke DNS',
      bullets: [
        'Open khoindvn.io.vn in Safari',
        'Tap DNS Anti-Revoke and allow the profile download',
        'Settings → Profile Downloaded → Install',
        'Enter your passcode and confirm',
      ],
    },
    'esign-2': {
      title: 'Install ESign & trust the certificate',
      bullets: [
        'Install ESign from the portal, in Safari',
        'Settings → General → VPN & Device Management',
        'Trust the Enterprise certificate for ESign',
        'In ESign: Manage → Certificate Management — it must show Valid',
      ],
    },
    'esign-3': {
      title: 'Download the game, import & sign',
      bullets: [
        'Download the IPA from this site',
        'Open ESign and import the .ipa file',
        'Add it to Apps and sign the app (Signature)',
        'Install it, then open the game',
      ],
    },
  },
  ro: {
    'esign-1': {
      title: 'Instalează DNS-ul Anti-Revoke',
      bullets: [
        'Deschide khoindvn.io.vn în Safari',
        'Apasă DNS Anti-Revoke și permite descărcarea profilului',
        'Settings → Profile Downloaded → Install',
        'Introdu codul de acces și confirmă',
      ],
    },
    'esign-2': {
      title: 'Instalează ESign și acordă încredere certificatului',
      bullets: [
        'Instalează ESign din portal, în Safari',
        'Settings → General → VPN & Device Management',
        'Acordă încredere (Trust) certificatului Enterprise pentru ESign',
        'În ESign: Manage → Certificate Management — trebuie să apară Valid',
      ],
    },
    'esign-3': {
      title: 'Descarcă jocul, importă și semnează',
      bullets: [
        'Descarcă IPA-ul de pe acest site',
        'Deschide ESign și importă fișierul .ipa',
        'Adaugă-l în Apps și semnează aplicația (Signature)',
        'Instalează-l, apoi deschide jocul',
      ],
    },
  },
  fr: {
    'esign-1': {
      title: 'Installer le DNS Anti-Révocation',
      bullets: [
        'Ouvrez khoindvn.io.vn dans Safari',
        'Appuyez sur DNS Anti-Revoke et autorisez le téléchargement du profil',
        'Settings → Profile Downloaded → Install',
        'Saisissez votre code et confirmez',
      ],
    },
    'esign-2': {
      title: "Installer ESign et approuver le certificat",
      bullets: [
        'Installez ESign depuis le portail, dans Safari',
        'Settings → General → VPN & Device Management',
        "Faites confiance (Trust) au certificat Enterprise d'ESign",
        'Dans ESign : Manage → Certificate Management — il doit afficher Valid',
      ],
    },
    'esign-3': {
      title: 'Télécharger le jeu, importer et signer',
      bullets: [
        "Téléchargez l'IPA depuis ce site",
        'Ouvrez ESign et importez le fichier .ipa',
        "Ajoutez-le dans Apps et signez l'application (Signature)",
        'Installez-la, puis lancez le jeu',
      ],
    },
  },
  es: {
    'esign-1': {
      title: 'Instalar el DNS Anti-Revocación',
      bullets: [
        'Abre khoindvn.io.vn en Safari',
        'Toca DNS Anti-Revoke y permite la descarga del perfil',
        'Settings → Profile Downloaded → Install',
        'Introduce tu código y confirma',
      ],
    },
    'esign-2': {
      title: 'Instalar ESign y confiar en el certificado',
      bullets: [
        'Instala ESign desde el portal, en Safari',
        'Settings → General → VPN & Device Management',
        'Confía (Trust) en el certificado Enterprise de ESign',
        'En ESign: Manage → Certificate Management — debe aparecer Valid',
      ],
    },
    'esign-3': {
      title: 'Descargar el juego, importar y firmar',
      bullets: [
        'Descarga el IPA desde este sitio',
        'Abre ESign e importa el archivo .ipa',
        'Añádelo a Apps y firma la aplicación (Signature)',
        'Instálala y abre el juego',
      ],
    },
  },
  ko: {
    'esign-1': {
      title: '안티 리보크 DNS 설치',
      bullets: [
        'Safari에서 khoindvn.io.vn 열기',
        'DNS Anti-Revoke를 누르고 프로필 다운로드 허용',
        'Settings → Profile Downloaded → Install',
        '암호를 입력하고 설치 확인',
      ],
    },
    'esign-2': {
      title: 'ESign 설치 및 인증서 신뢰',
      bullets: [
        'Safari에서 포털을 통해 ESign 설치',
        'Settings → General → VPN & Device Management',
        'ESign의 Enterprise 인증서를 신뢰(Trust)',
        'ESign에서 Manage → Certificate Management로 이동해 Valid인지 확인',
      ],
    },
    'esign-3': {
      title: '게임 다운로드, 가져오기 및 서명',
      bullets: [
        '이 사이트에서 IPA 다운로드',
        'ESign을 열고 .ipa 파일 가져오기',
        'Apps에 추가한 뒤 앱에 서명(Signature)',
        '설치한 뒤 게임 실행',
      ],
    },
  },
}
