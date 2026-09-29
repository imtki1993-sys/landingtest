export type DesignMode="light"|"dark";
export type PageKind="landing"|"store"|"dashboard"|"orders"|"analytics";
export type ProductProfile="automotive-tech"|"beauty"|"fashion-luxury"|"health-wellness"|"sport-fitness"|"home-lifestyle"|"electronics-tech"|"kids-family"|"general";
export type Locale="darija"|"ar"|"fr"|"en";
export interface DesignContext{page:PageKind;profile?:ProductProfile;locale?:Locale;goal?:"conversion"|"commerce"|"management";mode?:DesignMode;variance?:number;motion?:number;density?:number}
export interface DesignColors{primary:string;secondary:string;accent:string;background:string;surface:string;text:string;muted:string;border:string;onPrimary:string;onAccent:string}
export interface DesignTypography{headingFont:string;bodyFont:string;headingScale:number[];bodySize:number;lineHeight:number;direction:"ltr"|"rtl"}
export interface LandProDesignSystem{version:"1";id:string;style:string;mode:DesignMode;colors:DesignColors;typography:DesignTypography;layout:{density:number;variance:number;containerWidth:number;sectionSpacing:number;radius:number};motion:{intensity:number;duration:number};components:{hero:string;productCard:string;button:string;form:string;gallery:string;testimonials:string};responsive:{mobileBreakpoint:number;tabletBreakpoint:number;buttonMinHeight:number;inputMinHeight:number};accessibility:{primaryContrast:number;accentContrast:number;wcagAA:boolean}}
