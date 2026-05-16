'use client'

interface IconProps {
  name: string
  size?: number
  stroke?: string
  sw?: number
  fill?: string
  style?: React.CSSProperties
}

const paths: Record<string, React.ReactNode> = {
  'arrow-right-to-bracket': <><path d="M11 16l4-4-4-4"/><path d="M15 12H3"/><path d="M19 4h-4a2 2 0 0 0-2 2v0"/><path d="M13 18v0a2 2 0 0 0 2 2h4"/></>,
  'arrow-right-from-bracket': <><path d="M15 16l4-4-4-4"/><path d="M19 12H7"/><path d="M11 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6"/></>,
  'cpu': <><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></>,
  'wrench': <><path d="M14.7 6.3a4 4 0 1 0 4.6 6.3l-4.3-4.3.7-2 1.7-.7-3.4-1-2 .7Z"/><path d="m13 9-7.5 7.5a2.1 2.1 0 1 0 3 3L16 12"/></>,
  'sitemap': <><rect x="9" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M12 9v3M12 12H6v3M12 12h6v3"/></>,
  'database': <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
  'git-branch': <><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M18 8.5a6 6 0 0 1-6 6h-1.5"/></>,
  'user': <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
  'layers': <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></>,
  'package': <><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  'sticky-note': <><path d="M15 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h11l5-5V5a2 2 0 0 0-2-2z"/><polyline points="15 21 15 15 21 15"/></>,
  'search': <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></>,
  'chevron-down': <polyline points="6 9 12 15 18 9"/>,
  'chevron-right': <polyline points="9 6 15 12 9 18"/>,
  'chevron-left': <polyline points="15 6 9 12 15 18"/>,
  'play': <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/>,
  'square': <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none"/>,
  'settings': <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.72V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  'upload': <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  'download': <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  'sparkles': <><path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7Z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z"/><path d="M5 4l.5 1.4L7 6l-1.5.6L5 8l-.5-1.4L3 6l1.5-.6Z"/></>,
  'wand': <><path d="m15 4-3-1-1-3-1 3-3 1 3 1 1 3 1-3z"/><path d="m20 11-1.5-.5L18 9l-.5 1.5L16 11l1.5.5.5 1.5.5-1.5z"/><path d="m6 21 13-13"/><path d="m17 4 3 3"/></>,
  'git-compare': <><circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M12 6h4a2 2 0 0 1 2 2v8"/><path d="M12 18H8a2 2 0 0 1-2-2V8"/><polyline points="14 8 12 6 14 4"/><polyline points="10 16 12 18 10 20"/></>,
  'plus': <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  'x': <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  'check': <polyline points="20 6 9 17 4 12"/>,
  'minus': <line x1="5" y1="12" x2="19" y2="12"/>,
  'maximize': <><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>,
  'minimize': <><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></>,
  'grip': <><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></>,
  'more': <><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>,
  'focus': <><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></>,
  'history': <><polyline points="3 12 3 6 9 6"/><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="12 7 12 12 16 14"/></>,
  'circle': <circle cx="12" cy="12" r="9"/>,
  'loader': <><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>,
  'trash': <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  'edit': <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></>,
  'copy': <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  'tag': <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.6 8.57a2 2 0 0 1 0 2.83Z"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/></>,
  'folder': <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>,
  'arrow-right': <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  'star': <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2"/>,
  'bell': <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
  'message-square': <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
  'send': <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  'pause': <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
  'square-dashed': <><path d="M5 3H3v2"/><path d="M3 9v2"/><path d="M3 15v2"/><path d="M3 21h2"/><path d="M9 21h2"/><path d="M15 21h2"/><path d="M21 21v-2"/><path d="M21 15v-2"/><path d="M21 9V7"/><path d="M21 3h-2"/><path d="M15 3h-2"/><path d="M9 3H7"/></>,
  'keyboard': <><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8M6 14h.01M18 14h.01"/></>,
  'sun': <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
  'moon': <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
  'help-circle': <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"/></>,
}

export default function Icon({ name, size = 14, stroke = 'currentColor', sw = 2, fill = 'none', style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name] || null}
    </svg>
  )
}
