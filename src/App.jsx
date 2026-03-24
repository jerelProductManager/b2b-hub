import { useState, useCallback } from "react";

// ─── B&H Design Tokens ───────────────────────────────────────────────────────
const T = {
  scarlet:     "#990000",
  scarletLight:"#EFD8D5",
  bond:        "#007AB8",
  bondLight:   "#E6F2F8",
  orange:      "#E67300",
  orangeLight: "#FDF1E6",
  green:       "#3F9A59",
  greenLight:  "#F0F8EE",
  gray1:       "#F2F2F2",
  gray2:       "#E5E5E5",
  gray3:       "#CCCCCC",
  gray4:       "#999999",
  gray5:       "#666666",
  gray6:       "#333333",
  white:       "#FFFFFF",
  black:       "#000000",
};

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const CATEGORIES = [
  { label: "IT & Storage", emoji: "💻" }, { label: "Audio-Visual", emoji: "📺" },
  { label: "Surveillance", emoji: "📹" }, { label: "Optics",        emoji: "🔭" },
  { label: "Pro Audio",    emoji: "🎙" }, { label: "Photo",         emoji: "📷" },
  { label: "Mobile Electronics", emoji: "📱" }, { label: "Video",  emoji: "🎬" },
];
const USERS = [
  { id: "ariel", name: "Ariel Goldman",  role: "B2B Manager",       avatar: "AG", canDirectPublish: true  },
  { id: "jerel", name: "Jerel Smith",    role: "Senior PM",          avatar: "JS", canDirectPublish: false },
  { id: "josh",  name: "Josh Bernstein", role: "Project Management", avatar: "JB", canDirectPublish: false },
];

// ─── INITIAL CONFIG ───────────────────────────────────────────────────────────
const INITIAL_CONFIG = {
  meta: { lastUpdatedBy: "system", lastUpdatedAt: "2026-03-20T09:00:00Z", version: "2.0.0" },

  hero: {
    headline:   "B&H for Business",
    subheadline:"Exclusive pricing, cooperative contracts, and dedicated support for organizations of every size.",
    badge:      "Trusted by 50,000+ organizations",
    ctaLabel:   "Get Started — Tell Us About Your Organization",
    ctaSubtext: "No commitment required. Takes 2 minutes.",
    heroImageUrl:"",  // base64 or CDN URL for home hero background photo
    signupUrl:  "https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
  },

  signupForm: {
    title:    "Let\'s find the right solution for you.",
    subtitle: "Answer a few questions and we\'ll match you with the contracts, pricing, and portal that fit your organization.",
    orgTypes: [
      { id:"higher_ed",   label:"College / University",           segment:"higher_ed",   icon:"🎓" },
      { id:"k12",         label:"K-12 School / District",         segment:"k12",         icon:"🏫" },
      { id:"federal",     label:"Federal Agency",                 segment:"federal",     icon:"🏛️" },
      { id:"state_local", label:"State / Local Government",       segment:"state_local", icon:"🗺️" },
      { id:"nonprofit",   label:"Nonprofit / Faith Organization", segment:"nonprofit",   icon:"🤝" },
      { id:"healthcare",  label:"Healthcare Organization",        segment:"healthcare",  icon:"🏥" },
      { id:"corporate",   label:"Corporation / Enterprise",       segment:"corporate",   icon:"🏢" },
      { id:"smb",         label:"Small Business",                 segment:"smb",         icon:"🛍️" },
      { id:"creative",    label:"Production / Creative Studio",   segment:"creative",    icon:"🎬" },
      { id:"si",          label:"Systems Integrator",             segment:"si",          icon:"🔧" },
      { id:"diversity",   label:"Diversity Supplier",             segment:"diversity",   icon:"⭐" },
      { id:"intl",        label:"International Organization",     segment:"intl",        icon:"🌐" },
    ],
  },

  segments: {
    higher_ed:   { name:"Higher Education",         color:"#007AB8", description:"E&I, MHEC, and education cooperative contracts. Auto-verified via .edu domain." },
    k12:         { name:"K-12 / State & Local",     color:"#3F9A59", description:"TIPS, BuyBoard, PEPPM, Omnia, and Equalis contracts for public schools and districts." },
    federal:     { name:"Federal Marketplace",      color:"#990000", description:"GSA Schedule and federal procurement portals with dedicated government pricing." },
    state_local: { name:"State & Local Government", color:"#E67300", description:"Cooperative purchasing through TIPS, Omnia, and Equalis with .gov auto-verification." },
    nonprofit:   { name:"Nonprofit / Faith",        color:"#8B4513", description:"Tax-exempt purchasing with net terms eligibility and simplified sign-up." },
    healthcare:  { name:"Healthcare",               color:"#2E86AB", description:"HIPAA-aware procurement with D&B verified organizational accounts." },
    corporate:   { name:"Corporate / Enterprise",   color:"#333333", description:"Custom portals, eProcurement integration, and dedicated account management." },
    smb:         { name:"Small Business",           color:"#6B21A8", description:"Straightforward B2B pricing with net terms and business verification." },
    creative:    { name:"Production & Post",        color:"#B45309", description:"Studio Hub — specialized gear sourcing for production houses and post facilities." },
    si:          { name:"Systems Integrator",       color:"#0F766E", description:"Volume pricing, project support, and integration partner benefits." },
    diversity:   { name:"Diversity Suppliers",      color:"#BE185D", description:"MBE, WBE, and SBE certified supplier accounts with tailored support." },
    intl:        { name:"International",            color:"#1D4ED8", description:"Export licensing, international shipping, and English-speaking rep access." },
  },

  // Contract entities are the single source of truth for name, logo, and contract number.
  // Updating any field here propagates to: hub contract strip, all segment page sidebars,
  // featured contract displays, and all contract pages automatically.
  contracts: [
    { id:"ei",       name:"E&I Cooperative Services", logoLabel:"E&I",       logoUrl:"", contractNumber:"CNR01261", active:true, segments:["higher_ed","nonprofit"],        description:"The leading higher education cooperative, trusted by 1,900+ institutions." },
    { id:"omnia",    name:"Omnia Partners (NIPA)",     logoLabel:"OMNIA",     logoUrl:"", contractNumber:"R191902",  active:true, segments:["k12","state_local","higher_ed"], description:"Cooperative purchasing for public sector — state, local, and education." },
    { id:"equalis",  name:"Equalis Group",             logoLabel:"EQUALIS",   logoUrl:"", contractNumber:"EQ-0421",  active:true, segments:["k12","state_local"],             description:"National cooperative purchasing organization for government and education." },
    { id:"tips",     name:"TIPS-USA",                  logoLabel:"TIPS",      logoUrl:"", contractNumber:"210102",   active:true, segments:["k12","state_local"],             description:"Interlocal purchasing cooperative for Texas and nationwide agencies." },
    { id:"buyboard", name:"BuyBoard",                  logoLabel:"BuyBoard",  logoUrl:"", contractNumber:"589-19",   active:true, segments:["k12","state_local"],             description:"Texas-based purchasing cooperative with nationwide reach." },
    { id:"peppm",    name:"PEPPM K-12",                logoLabel:"PEPPM",     logoUrl:"", contractNumber:"PP-2021",  active:true, segments:["k12"],                           description:"Pennsylvania's statewide purchasing cooperative for K-12." },
    { id:"mhec",     name:"MHEC",                      logoLabel:"MHEC",      logoUrl:"", contractNumber:"2021-14",  active:true, segments:["higher_ed"],                     description:"Maryland Higher Education Consortium — cooperative contract." },
    { id:"naspo",    name:"NASPO ValuePoint",          logoLabel:"NASPO",     logoUrl:"", contractNumber:"NASPO-22", active:true, segments:["state_local","federal"],         description:"Cooperative for state and local government technology procurement." },
    { id:"gsa",      name:"GSA Schedule",              logoLabel:"GSA",       logoUrl:"", contractNumber:"GS-35F",   active:true, segments:["federal"],                       description:"Federal supply schedule for government technology procurement." },
  ],
  errorStates: {
    dnb_no_match:    { message:"We couldn\'t verify your business automatically.", cta:"Request Manual Review" },
    dnb_timeout:     { message:"Our verification service is temporarily unavailable.", cta:"Try Again" },
    domain_mismatch: { message:"Your email domain doesn\'t match an approved institution list.", cta:"Request Manual Review" },
  },

  footer: {
    contactEmail:"b2b@bhphotovideo.com",
    repPhone:    "1-800-952-9005",
    tagline:     "B&H Photo Video Pro Audio · Serving Business & Government Since 1973",
  },

  // ── Segment Pages (12) ─────────────────────────────────────────────────────
  segmentPages: {
    higher_ed: {
      headline:"Higher Ed", intro:"Discover why hundreds of advanced learning institutions across the USA rely on B&H B2B for their technology needs.", subIntro:"We offer competitive contract pricing, multiple e-Procurement platforms and p-card enabled checkout portals.",
      showOrgTypeFilter:true, showStateFilter:false,
      signupBannerTitle:"E&I Purchasing at B&H", signupBannerBody:"Ready to receive E&I contract pricing while enjoying all the benefits of the B&H B2B online buying experience?",
      featuredContractId:"ei", featuredTitle:"B&H B2B for Higher Education powered by E&I",
      featuredBody:"B&H B2B is integrated with E&I-approved cooperative contract purchasing—so you can bypass the bidding process and leverage the collective buying power of over 10,000 member organizations.",
      featuredBenefits:["Fast, easy quotes","One-stop shopping for our entire catalog of products","Hassle-free price comparisons","Expert advice from reps with real product know-how"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Learn More",
      otherContractIds:["equalis","ei","omnia","tips","buyboard","peppm"], otherContractsTitle:"Other Contracts", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    k12: {
      headline:"K-12", intro:"B&H B2B serves K-12 schools and districts across the country with cooperative purchasing contracts and a full catalog of classroom and administrative technology.", subIntro:"We offer competitive contract pricing through multiple cooperative purchasing programs.",
      showOrgTypeFilter:true, showStateFilter:true,
      signupBannerTitle:"B2B Purchasing for K-12", signupBannerBody:"Ready to receive contract pricing while enjoying all the benefits of the B&H B2B online buying experience?",
      featuredContractId:"omnia", featuredTitle:"B&H B2B for K-12 powered by Omnia Partners",
      featuredBody:"Through Omnia Partners (NIPA), K-12 schools and districts can access B&H B2B\'s full catalog with cooperative contract pricing—bypassing the bidding process entirely.",
      featuredBenefits:["Dedicated purchasing portal with e-quote and P-card support","Electronic PO submission","Expert advice from experienced professionals","Same day shipping on select items before 6pm ET"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Learn More",
      otherContractIds:["tips","buyboard","peppm","equalis"], otherContractsTitle:"Other Contracts", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    federal: {
      headline:"Federal Marketplace", intro:"B&H B2B serves federal agencies with GSA Schedule pricing, specialized procurement support, and a comprehensive catalog of technology products.", subIntro:"Access contract pricing through the GSA Schedule and NASPO ValuePoint cooperative.",
      showOrgTypeFilter:false, showStateFilter:false,
      signupBannerTitle:"Federal Purchasing at B&H", signupBannerBody:"Ready to receive GSA Schedule pricing and streamlined government purchasing experience?",
      featuredContractId:"gsa", featuredTitle:"B&H B2B on the GSA Schedule",
      featuredBody:"B&H Photo Video is a GSA-approved vendor, giving federal agencies direct access to competitive pricing on our full catalog without the need to open a competitive bid.",
      featuredBenefits:["GSA Schedule pricing on thousands of products","Dedicated federal account managers","Electronic PO and requisition support","Compliant with FAR and agency-specific requirements"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Learn More",
      otherContractIds:["naspo"], otherContractsTitle:"Other Contracts", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    state_local: {
      headline:"State, Local & Government", intro:"B&H B2B helps state agencies, city governments, counties, and public institutions source technology with ease, compliance, and competitive pricing.", subIntro:"Cooperative contracts eliminate bidding requirements and streamline procurement.",
      showOrgTypeFilter:true, showStateFilter:true,
      signupBannerTitle:"Government Purchasing at B&H", signupBannerBody:"Ready to access cooperative contract pricing and a streamlined government purchasing experience?",
      featuredContractId:"equalis", featuredTitle:"B&H B2B for State, Local & Government powered by Equalis",
      featuredBody:"The Equalis Group cooperative contract gives state and local government entities access to B&H B2B\'s full catalog with competitively-awarded contract pricing.",
      featuredBenefits:["Dedicated purchasing portal with P-card support","No minimum order requirements","Same day shipping on many items","Expert advice from experienced professionals"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Learn More",
      otherContractIds:["omnia","tips","buyboard","naspo"], otherContractsTitle:"Other Contracts", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    nonprofit: {
      headline:"Non-Profit", intro:"From starting a movement on a shoestring to managing a pledge cycle, B&H B2B\'s full-service online shopping solution can help you stretch your dollars to the limit.", subIntro:"Tax exemption, net terms, and cooperative contract pricing for eligible organizations.",
      showOrgTypeFilter:false, showStateFilter:false,
      signupBannerTitle:"Non-Profit Purchasing at B&H", signupBannerBody:"Ready to access tax-exempt pricing and streamlined purchasing for your nonprofit organization?",
      featuredContractId:"omnia", featuredTitle:"B&H B2B for Non-Profit Organizations",
      featuredBody:"Sign up today to become eligible for special discounts and promotions and streamlined purchasing, backed by our signature service.",
      featuredBenefits:["Easy online quotes","Net terms*","Fast & free shipping","Tax exemption*","Custom pricing for larger orders"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Learn More",
      otherContractIds:["ei"], otherContractsTitle:"Cooperative Contracts", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    healthcare: {
      headline:"Healthcare", intro:"From clinics and private practice to hospitals and pharmaceutical, B&H B2B for Healthcare helps professionals like you focus on what you do best.", subIntro:"GHX integration available. Specialized procurement support for healthcare organizations.",
      showOrgTypeFilter:false, showStateFilter:false,
      signupBannerTitle:"Healthcare Purchasing at B&H", signupBannerBody:"Ready to receive healthcare discount pricing while enjoying a streamlined B2B purchasing experience?",
      featuredContractId:null, featuredTitle:"B&H B2B for Healthcare",
      featuredBody:"Whether you\'re updating a network, renovating a station or improving security, B&H B2B for Healthcare can help you resolve challenges while maintaining a vital, balanced budget. We are a supplier on GHX.",
      featuredBenefits:["Fast, easy quotes","Pay with POs","Expert advice & support","GHX integration available"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Contact Us",
      otherContractIds:[], otherContractsTitle:"", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    corporate: {
      headline:"Corporate", intro:"Whether you are upgrading an office or stockpiling supplies, B&H B2B offers competitive pricing that ensures you get the best deal on the gear you need.", subIntro:"Discount pricing, special promotions, and a streamlined purchasing experience for corporations of every size.",
      showOrgTypeFilter:true, showStateFilter:false,
      signupBannerTitle:"Enterprise Purchasing, Fast", signupBannerBody:"Ready to receive discount pricing, special promotions and a streamlined purchasing experience?",
      featuredContractId:null, featuredTitle:"B&H B2B Enterprise",
      featuredBody:"Sign up today to become eligible for special discounts and promotions and streamlined purchasing, all backed by our signature service.",
      featuredBenefits:["Easy online account management","Net 30 payment terms","Electronic PO submission","Expert advice & support"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Learn More",
      otherContractIds:[], otherContractsTitle:"Contract & eProcurement Solutions", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    smb: {
      headline:"Small Business", intro:"B&H B2B for Small Business provides straightforward pricing, net terms, and dedicated support — everything you need to compete at any scale.", subIntro:"Business verification, net terms eligibility, and a full catalog of professional equipment.",
      showOrgTypeFilter:false, showStateFilter:false,
      signupBannerTitle:"Small Business Purchasing at B&H", signupBannerBody:"Ready to access business pricing, net terms, and dedicated support for your small business?",
      featuredContractId:null, featuredTitle:"B&H B2B for Small Business",
      featuredBody:"Sign up today to become eligible for special discounts and promotions and streamlined purchasing, all backed by our signature service.",
      featuredBenefits:["Business-verified account","Net terms eligibility","Fast & free shipping","Expert advice & support"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Learn More",
      otherContractIds:[], otherContractsTitle:"", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    creative: {
      headline:"Creative, Production & Post", intro:"Discover why top production houses and post-production facilities across the country rely on B&H B2B for their creative technology needs.", subIntro:"Industry expertise, competitive pricing, and dedicated account reps who know your gear.",
      showOrgTypeFilter:false, showStateFilter:false,
      signupBannerTitle:"Studio Purchasing at B&H", signupBannerBody:"Ready to access production pricing, dedicated studio reps, and the world\'s largest in-stock catalog?",
      featuredContractId:null, featuredTitle:"B&H B2B for Creative & Production",
      featuredBody:"B&H has been the go-to resource for production professionals for decades. Our B2B team offers project-based support, rental referrals, and access to thousands of products across photo, video, audio, and post-production.",
      featuredBenefits:["Dedicated studio account rep","One-on-one service from a team of industry peers","Custom demos of the latest tech (by appointment only)","Fast, easy quotes"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Explore The Studio",
      otherContractIds:[], otherContractsTitle:"", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    si: {
      headline:"Systems Integrator", intro:"Easily find everything you need at amazing low prices with fast, free shipping so you have all the essential gear you need to get every job done.", subIntro:"Volume pricing, project support, and integration partner benefits for AV and IT integrators.",
      showOrgTypeFilter:false, showStateFilter:false,
      signupBannerTitle:"Integrator Purchasing at B&H", signupBannerBody:"Ready to access project pricing, volume discounts, and dedicated integrator support?",
      featuredContractId:null, featuredTitle:"B&H B2B for Systems Integrators",
      featuredBody:"Whether you\'re hanging a projector, installing a NOC or integrating a SAN, B&H B2B offers a custom, full-service online shopping solution designed to help you manage your bottom line.",
      featuredBenefits:["Fast, easy quotes","Pay with POs","Price breaks for larger quantities","Project-based delivery dates"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Learn More",
      otherContractIds:[], otherContractsTitle:"", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    diversity: {
      headline:"Diversity Suppliers", intro:"B&H B2B provides dedicated support for MBE, WBE, SBE, and other certified diversity suppliers looking to purchase technology through a trusted vendor.", subIntro:"Certified supplier accounts with tailored support and competitive pricing.",
      showOrgTypeFilter:false, showStateFilter:false,
      signupBannerTitle:"Diversity Supplier Purchasing at B&H", signupBannerBody:"Ready to access certified supplier pricing and dedicated diversity business support?",
      featuredContractId:null, featuredTitle:"B&H B2B for Diversity Suppliers",
      featuredBody:"B&H B2B supports MBE, WBE, SBE, and other certified diversity suppliers with streamlined account setup, competitive pricing, and a dedicated team familiar with diversity procurement requirements.",
      featuredBenefits:["Certification-aware account setup","Dedicated diversity supplier rep","Volume pricing and project support","Fast & free shipping"],
      featuredSignupCta:"Sign Up", featuredLearnMoreCta:"Learn More",
      otherContractIds:[], otherContractsTitle:"", phoneNumber:"212.239.7503",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    intl: {
      headline:"International", intro:"B&H Global Sales is a team of dedicated specialists who are trained specifically to assist you, providing one-on-one service every step of the way through the ordering process.", subIntro:"Export licensing, international shipping support, and English-speaking reps available.",
      showOrgTypeFilter:false, showStateFilter:false,
      signupBannerTitle:"International Purchasing at B&H", signupBannerBody:"Ready to access international pricing and dedicated global sales support?",
      featuredContractId:null, featuredTitle:"B&H B2B Global Sales",
      featuredBody:"Our international specialists handle all import documentation, coordinate with freight forwarders, and offer contract purchasing and shipping advice for customers worldwide. Support en Español and em Português available.",
      featuredBenefits:["Easy coordination with freight forwarders","All import documentation handled","Contract purchasing support","Corporate and Government ordering support"],
      featuredSignupCta:"Contact Global Sales", featuredLearnMoreCta:"Learn More",
      otherContractIds:[], otherContractsTitle:"", phoneNumber:"212.239.7503 x7751",
      heroImageUrl:"",    // background photo for hero banner (base64 or URL)
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
  },

  // ── Contract Pages (9) ─────────────────────────────────────────────────────
  contractPages: {
    ei: {
      headline:"E&I", subheadline:"E&I Portal at B&H",
      blurb:"Save time and money by purchasing through the competitively-awarded E&I contract for Higher Ed, K-12, and Non-profit organizations.",
      benefits:["Dedicated E&I purchasing portal, with the ability to request instant e-quotes, order with a P-card, or upload purchase orders all online","Technical advice, planning and solutions from experienced professionals","State-of-the-art warehouses, efficient order processing and real-time tracking","Same day shipping available for select items on orders placed before 6pm ET"],
      signupCta:"Sign Up", contractInfoCta:"Contract Info",
      promoTitle:"Enjoy the benefits the pros have come to expect!", promoBullets:["The Most Technology - In Stock, Always","Fast & Free Shipping","Amazing Prices","Expert Advice"],
      heroImageUrl:"",    // background photo for contract page hero banner
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    equalis: {
      headline:"Equalis Group", subheadline:"Equalis Group Portal at B&H",
      blurb:"Save time and money by purchasing through the competitively-awarded contract for State, Local, and County establishments.",
      benefits:["Dedicated Equalis Group purchasing portal, with the ability to request instant e-quotes, order with a P-card, or upload purchase orders all online","Technical advice, planning and solutions from experienced professionals","State-of-the-art warehouses, efficient order processing and real-time tracking","Same day shipping available for select items on orders placed before 6pm ET"],
      signupCta:"Sign Up", contractInfoCta:"Contract Info",
      promoTitle:"Enjoy the benefits the pros have come to expect!", promoBullets:["The Most Technology - In Stock, Always","Fast & Free Shipping","Amazing Prices","Expert Advice"],
      heroImageUrl:"",    // background photo for contract page hero banner
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    omnia: {
      headline:"Omnia K-12", subheadline:"Omnia K-12 Portal at B&H",
      blurb:"Save time and money by purchasing through the competitively-awarded OMNIA Partners (NIPA) contract for Higher Ed, K-12, and Non-profit organizations.",
      benefits:["Dedicated Omnia K-12 purchasing portal, with the ability to request instant e-quotes, order with a P-card, or upload purchase orders all online","Technical advice, planning and solutions from experienced professionals","State-of-the-art warehouses, efficient order processing and real-time tracking","Same day shipping available for select items on orders placed before 6pm ET"],
      signupCta:"Sign Up", contractInfoCta:"Contract Info",
      promoTitle:"Enjoy the benefits the pros have come to expect!", promoBullets:["The Most Technology - In Stock, Always","Fast & Free Shipping","Amazing Prices","Expert Advice"],
      heroImageUrl:"",    // background photo for contract page hero banner
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    tips: {
      headline:"TIPS-USA", subheadline:"TIPS Portal at B&H",
      blurb:"Save time and money by purchasing through the competitively-awarded TIPS-USA cooperative contract for K-12 schools and state and local government agencies.",
      benefits:["Dedicated TIPS purchasing portal with P-card and e-quote support","Technical advice, planning and solutions from experienced professionals","State-of-the-art warehouses, efficient order processing and real-time tracking","Same day shipping available for select items on orders placed before 6pm ET"],
      signupCta:"Sign Up", contractInfoCta:"Contract Info",
      promoTitle:"Enjoy the benefits the pros have come to expect!", promoBullets:["The Most Technology - In Stock, Always","Fast & Free Shipping","Amazing Prices","Expert Advice"],
      heroImageUrl:"",    // background photo for contract page hero banner
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    buyboard: {
      headline:"BuyBoard", subheadline:"BuyBoard Portal at B&H",
      blurb:"Save time and money by purchasing through the BuyBoard cooperative purchasing contract for Texas and nationwide K-12 and government agencies.",
      benefits:["Dedicated BuyBoard purchasing portal with P-card and e-quote support","Technical advice, planning and solutions from experienced professionals","State-of-the-art warehouses, efficient order processing and real-time tracking","Same day shipping available for select items on orders placed before 6pm ET"],
      signupCta:"Sign Up", contractInfoCta:"Contract Info",
      promoTitle:"Enjoy the benefits the pros have come to expect!", promoBullets:["The Most Technology - In Stock, Always","Fast & Free Shipping","Amazing Prices","Expert Advice"],
      heroImageUrl:"",    // background photo for contract page hero banner
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    peppm: {
      headline:"PEPPM K-12", subheadline:"PEPPM Portal at B&H",
      blurb:"Save time and money by purchasing through the PEPPM cooperative purchasing contract for K-12 schools across Pennsylvania and nationwide.",
      benefits:["Dedicated PEPPM purchasing portal with P-card and e-quote support","Technical advice, planning and solutions from experienced professionals","State-of-the-art warehouses, efficient order processing and real-time tracking","Same day shipping available for select items on orders placed before 6pm ET"],
      signupCta:"Sign Up", contractInfoCta:"Contract Info",
      promoTitle:"Enjoy the benefits the pros have come to expect!", promoBullets:["The Most Technology - In Stock, Always","Fast & Free Shipping","Amazing Prices","Expert Advice"],
      heroImageUrl:"",    // background photo for contract page hero banner
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    mhec: {
      headline:"MHEC", subheadline:"MHEC Portal at B&H",
      blurb:"Save time and money by purchasing through the Maryland Higher Education Consortium (MHEC) cooperative contract for higher education institutions.",
      benefits:["Dedicated MHEC purchasing portal with P-card and e-quote support","Technical advice, planning and solutions from experienced professionals","State-of-the-art warehouses, efficient order processing and real-time tracking","Same day shipping available for select items on orders placed before 6pm ET"],
      signupCta:"Sign Up", contractInfoCta:"Contract Info",
      promoTitle:"Enjoy the benefits the pros have come to expect!", promoBullets:["The Most Technology - In Stock, Always","Fast & Free Shipping","Amazing Prices","Expert Advice"],
      heroImageUrl:"",    // background photo for contract page hero banner
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    naspo: {
      headline:"NASPO ValuePoint", subheadline:"NASPO ValuePoint Portal at B&H",
      blurb:"Save time and money by purchasing through the NASPO ValuePoint cooperative contract for state and local government agencies.",
      benefits:["Dedicated NASPO purchasing portal with P-card and e-quote support","Technical advice, planning and solutions from experienced professionals","State-of-the-art warehouses, efficient order processing and real-time tracking","Same day shipping available for select items on orders placed before 6pm ET"],
      signupCta:"Sign Up", contractInfoCta:"Contract Info",
      promoTitle:"Enjoy the benefits the pros have come to expect!", promoBullets:["The Most Technology - In Stock, Always","Fast & Free Shipping","Amazing Prices","Expert Advice"],
      heroImageUrl:"",    // background photo for contract page hero banner
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
    gsa: {
      headline:"GSA Schedule", subheadline:"GSA Schedule Portal at B&H",
      blurb:"Save time and money by purchasing through B&H\'s GSA Schedule contract for federal agencies and eligible government entities.",
      benefits:["Dedicated GSA purchasing portal with compliant pricing and ordering","Technical advice, planning and solutions from experienced professionals","State-of-the-art warehouses, efficient order processing and real-time tracking","Same day shipping available for select items on orders placed before 6pm ET"],
      signupCta:"Sign Up", contractInfoCta:"Contract Info",
      promoTitle:"Enjoy the benefits the pros have come to expect!", promoBullets:["The Most Technology - In Stock, Always","Fast & Free Shipping","Amazing Prices","Expert Advice"],
      heroImageUrl:"",    // background photo for contract page hero banner
      signupUrl:"https://www.bhphotovideo.com/find/shared/b2bHub/signup.jsp",
    },
  },
};



// ─── Shared Image Upload Helper ───────────────────────────────────────────────
// Reused in every CMS editor that needs a photo/image upload field.
// Stores result as base64 data URI in config. Phase 2: swap for CDN upload.
function ImageUploadField({ label, value, onChange, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: T.gray5, textTransform: "uppercase", letterSpacing: .4, display: "block", marginBottom: 6 }}>{label}</label>
      {hint && <div style={{ fontSize: 11, color: T.gray4, marginBottom: 6 }}>{hint}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.bondLight, color: T.bond, border: `1px solid ${T.bond}`, borderRadius: 4, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          🖼 Upload Image
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => onChange(ev.target.result);
            reader.readAsDataURL(file);
          }} />
        </label>
        {value ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={value} alt="preview" style={{ height: 40, maxWidth: 120, objectFit: "cover", borderRadius: 4, border: `1px solid ${T.gray3}` }} />
            <button onClick={() => onChange("")} style={{ background: "none", border: "none", color: T.scarlet, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✕ Remove</button>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: T.gray4 }}>No image — using CSS gradient fallback</span>
        )}
      </div>
    </div>
  );
}

// ─── HeroBanner: renders photo when present, CSS gradient fallback ─────────────
function HeroBanner({ imageUrl, fallbackStyle, minHeight = 180, children }) {
  const bg = imageUrl
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : fallbackStyle;
  return (
    <div style={{ ...bg, minHeight, position: "relative" }}>
      {imageUrl && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── ContractLogo: single source of truth rendering ─────────────────────────
// Used everywhere a contract logo appears. Falls back to logoLabel text if no
// logoUrl is set. This ensures one edit propagates across all surfaces.
function ContractLogo({contract, height=24, maxWidth=80}){
  if(contract.logoUrl){
    return <img src={contract.logoUrl} alt={contract.logoLabel} style={{maxHeight:height,maxWidth,objectFit:"contain",display:"block"}}/>;
  }
  return <span style={{fontWeight:900,fontSize:Math.round(height*0.7),color:"#333",fontFamily:"Montserrat,sans-serif",letterSpacing:-0.5}}>{contract.logoLabel}</span>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ts        = () => new Date().toISOString();
const fmtTs     = (s) => new Date(s).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
const deepClone = (o) => JSON.parse(JSON.stringify(o));
const truncate  = (s,n=60) => s&&s.length>n ? s.slice(0,n)+"…" : s;
function computeDiff(a,b,path="",diffs=[]){
  if(typeof a!==typeof b){diffs.push({path,before:String(a),after:String(b)});return diffs;}
  if(typeof a!=="object"||a===null){if(a!==b)diffs.push({path,before:String(a),after:String(b)});return diffs;}
  if(Array.isArray(a)){const len=Math.max(a.length,b.length);for(let i=0;i<len;i++)computeDiff(a[i],b[i],`${path}[${i}]`,diffs);return diffs;}
  for(const k of new Set([...Object.keys(a||{}),...Object.keys(b||{})])){if(k==="meta")continue;computeDiff(a?.[k],b?.[k],path?`${path}.${k}`:k,diffs);}
  return diffs;
}
function bumpVersion(v){const p=(v||"2.0.0").split(".").map(Number);p[2]++;return p.join(".");}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [liveConfig,     setLiveConfig]     = useState(()=>deepClone(INITIAL_CONFIG));
  const [draftConfig,    setDraftConfig]    = useState(()=>deepClone(INITIAL_CONFIG));
  const [pendingChanges, setPendingChanges] = useState([]);
  const [route,    setRoute]    = useState({view:"hub",id:null}); // view: hub|segment|contract|static
  const [mainTab,  setMainTab]  = useState("hub");
  const [hubStep,       setHubStep]       = useState("entry");
  const [signupData,    setSignupData]    = useState({orgType:null,state:"",firstName:"",lastName:"",email:"",orgName:"",phone:"",purchaseVolume:"",primaryNeed:""});
  const [deducedSegment,setDeducedSegment]= useState(null);
  const [adminTab,     setAdminTab]     = useState("form");
  const [activeSection,setActiveSection]= useState("hero");
  const [jsonText,     setJsonText]     = useState(JSON.stringify(INITIAL_CONFIG,null,2));
  const [jsonError,    setJsonError]    = useState(null);
  const [currentUser,  setCurrentUser]  = useState(USERS[0]);
  const hasUnsaved = JSON.stringify(draftConfig)!==JSON.stringify(liveConfig);

  const updateDraft = useCallback((fn)=>{
    setDraftConfig(prev=>{const next=deepClone(prev);fn(next);setJsonText(JSON.stringify(next,null,2));return next;});
  },[]);

  const handleJsonChange = useCallback((text)=>{
    setJsonText(text);
    try{const p=JSON.parse(text);setJsonError(null);setDraftConfig(p);}catch(e){setJsonError(e.message.split("\n")[0]);}
  },[]);

  const deduceSegment = useCallback(()=>{
    setDeducedSegment(signupData.orgType?.segment||"corporate");
    setHubStep("result");
  },[signupData]);

  const handlePublishOrSubmit = useCallback(()=>{
    const diff=computeDiff(liveConfig,draftConfig);
    if(!diff.length)return;
    const next=deepClone(draftConfig);
    next.meta.lastUpdatedBy=currentUser.name;
    next.meta.lastUpdatedAt=ts();
    next.meta.version=bumpVersion(liveConfig.meta.version);
    if(currentUser.canDirectPublish){
      setLiveConfig(next);setDraftConfig(next);setJsonText(JSON.stringify(next,null,2));
    } else {
      setPendingChanges(prev=>[{id:`chg_${Date.now()}`,submittedBy:currentUser.name,submittedAt:ts(),status:"pending",draft:next,diff},...prev]);
    }
  },[liveConfig,draftConfig,currentUser]);

  const handleApprove = useCallback((id)=>{
    setPendingChanges(prev=>prev.map(c=>{
      if(c.id!==id)return c;
      setLiveConfig(c.draft);setDraftConfig(c.draft);setJsonText(JSON.stringify(c.draft,null,2));
      return{...c,status:"approved"};
    }));
  },[]);
  const handleReject = useCallback((id)=>{
    setPendingChanges(prev=>prev.map(c=>c.id===id?{...c,status:"rejected"}:c));
  },[]);

  const goHub      = ()=>{setRoute({view:"hub",id:null});setMainTab("hub");};
  // All Sign Up buttons in the prototype route to the internal 3-step sign-up flow
  const handleSignUp = ()=>{setRoute({view:"hub",id:null});setMainTab("hub");setHubStep("step1");window.scrollTo(0,0);};
  const goStatic   = (id)=>{setRoute({view:"static",id});setMainTab("hub");window.scrollTo(0,0)};
  const goSegment  = (id)=>{setRoute({view:"segment",id});setMainTab("hub");window.scrollTo(0,0);};
  const goContract = (id)=>{setRoute({view:"contract",id});setMainTab("hub");window.scrollTo(0,0);};
  const goAdmin    = ()=>{setRoute({view:"admin",id:null});setMainTab("admin");};
  const goApprovals= ()=>{setRoute({view:"approvals",id:null});setMainTab("approvals");};

  const c = liveConfig;

  return (
    <div style={{fontFamily:"\'Open Sans\',sans-serif",background:T.gray1,minHeight:"100vh",color:T.gray6}}>
      <style>{`
        @import url(\'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;500;600;700&display=swap\');
        *{box-sizing:border-box;margin:0;}
        @keyframes fadeUp{from{transform:translateY(12px);opacity:0;}to{transform:translateY(0);opacity:1;}}
        button:hover{opacity:0.9;}
      `}</style>

      {/* Top bar */}
      <div style={{background:T.white,borderBottom:`1px solid ${T.gray2}`,padding:"5px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <a href="https://bhphotovideo.com" style={{fontSize:12,color:T.bond,textDecoration:"none"}}>‹ B&H Consumer Site</a>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:12,color:T.gray5}}>Already registered for B&H B2B?</span>
          <button style={{border:`1px solid ${T.gray4}`,background:T.white,padding:"4px 14px",borderRadius:4,fontSize:12,cursor:"pointer",fontWeight:600}}>Log In</button>
        </div>
      </div>

      {/* Nav */}
      <div style={{background:T.white,borderBottom:`1px solid ${T.gray2}`,padding:"0 24px",display:"flex",alignItems:"center"}}>
        <button onClick={goHub} style={{display:"flex",alignItems:"center",gap:8,border:"none",background:"none",cursor:"pointer",padding:"10px 0",marginRight:20}}>
          <div style={{width:42,height:42,background:T.black,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#FFD700",fontWeight:900,fontSize:15,fontFamily:"Montserrat"}}>B&H</span>
          </div>
          <span style={{fontWeight:700,color:T.gray6,fontSize:14,fontFamily:"Montserrat",letterSpacing:1}}>B2B</span>
        </button>
        {[
          {label:"Home",                    action:goHub},
          {label:"About B&H",              action:()=>goStatic("about")},
          {label:"Contracts & eProcurement",action:()=>goStatic("contracts_eprocurement")},
          {label:"The Studio",             action:()=>goStatic("studio")},
          {label:"B2B IT Services",        action:()=>goStatic("it_services")},
          {label:"Contact",                action:()=>goStatic("contact")},
        ].map(lk=>(
          <button key={lk.label} onClick={lk.action} style={{background:"none",border:"none",cursor:"pointer",padding:"16px 12px",fontSize:13,fontWeight:600,color:T.bond,fontFamily:"Open Sans,sans-serif",whiteSpace:"nowrap"}}>
            {lk.label}
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <select value={currentUser.id} onChange={e=>setCurrentUser(USERS.find(u=>u.id===e.target.value))} style={{fontSize:12,border:`1px solid ${T.gray3}`,borderRadius:4,padding:"4px 8px",background:T.white,cursor:"pointer"}}>
            {USERS.map(u=><option key={u.id} value={u.id}>{u.avatar} — {u.name}</option>)}
          </select>
          <button onClick={goAdmin} style={{padding:"6px 12px",background:mainTab==="admin"?T.scarlet:T.gray2,color:mainTab==="admin"?T.white:T.gray6,border:"none",borderRadius:4,fontSize:12,fontWeight:700,cursor:"pointer"}}>✏️ CMS</button>
          <button onClick={goApprovals} style={{padding:"6px 12px",background:mainTab==="approvals"?T.bond:T.gray2,color:mainTab==="approvals"?T.white:T.gray6,border:"none",borderRadius:4,fontSize:12,fontWeight:700,cursor:"pointer",position:"relative"}}>
            📋 Approvals
            {pendingChanges.filter(x=>x.status==="pending").length>0&&(
              <span style={{position:"absolute",top:-4,right:-4,background:T.orange,color:T.white,borderRadius:"50%",width:16,height:16,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {pendingChanges.filter(x=>x.status==="pending").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pages */}
      {mainTab==="hub"&&route.view==="hub"&&<HubView config={c} hubStep={hubStep} setHubStep={setHubStep} signupData={signupData} setSignupData={setSignupData} deducedSegment={deducedSegment} setDeducedSegment={setDeducedSegment} deduceSegment={deduceSegment} onGoSegment={goSegment} onGoContract={goContract}/>}
      {mainTab==="hub"&&route.view==="static"&&route.id&&<StaticPageView pageId={route.id} config={c} onGoHub={goHub} onGoSegment={goSegment} onGoContract={goContract} onSignUp={handleSignUp}/>}
      {mainTab==="hub"&&route.view==="segment"&&route.id&&<SegmentPageView segmentId={route.id} config={c} onGoHub={goHub} onGoSegment={goSegment} onGoContract={goContract} onSignUp={handleSignUp}/>}
      {mainTab==="hub"&&route.view==="contract"&&route.id&&<ContractPageView contractId={route.id} config={c} onGoHub={goHub} onGoContract={goContract} onSignUp={handleSignUp}/>}
      {mainTab==="admin"&&<AdminView config={draftConfig} liveConfig={liveConfig} onChange={updateDraft} adminTab={adminTab} setAdminTab={setAdminTab} jsonText={jsonText} jsonError={jsonError} onJsonChange={handleJsonChange} currentUser={currentUser} onPublishOrSubmit={handlePublishOrSubmit} hasUnsaved={hasUnsaved} activeSection={activeSection} setActiveSection={setActiveSection} onGoSegment={goSegment} onGoContract={goContract}/>}
      {mainTab==="approvals"&&<ApprovalsView pendingChanges={pendingChanges} liveConfig={liveConfig} currentUser={currentUser} onApprove={handleApprove} onReject={handleReject}/>}
    </div>
  );
}

// ─── Hub View ─────────────────────────────────────────────────────────────────
function HubView({config:c,hubStep,setHubStep,signupData,setSignupData,deducedSegment,setDeducedSegment,deduceSegment,onGoSegment,onGoContract}){
  const seg=deducedSegment?c.segments[deducedSegment]:null;
  const relContracts=deducedSegment?c.contracts.filter(ct=>ct.active&&ct.segments.includes(deducedSegment)):[];
  const resetHub=()=>{setHubStep("entry");setSignupData({orgType:null,state:"",firstName:"",lastName:"",email:"",orgName:"",phone:"",purchaseVolume:"",primaryNeed:""});setDeducedSegment(null);};

  return(
    <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{background:"#fff3cd",border:"1px solid #ffc107",borderRadius:6,padding:"8px 14px",marginBottom:20,fontSize:12,color:"#856404",display:"flex",justifyContent:"space-between"}}>
        <span>📡 Live config <strong>v{c.meta.version}</strong> — last updated by <strong>{c.meta.lastUpdatedBy}</strong> at {fmtTs(c.meta.lastUpdatedAt)}</span>
        <span style={{color:T.gray4}}>Switch to CMS tab to make changes</span>
      </div>

      {hubStep==="entry"&&(
        <div style={{animation:"fadeUp .3s ease"}}>
          <HeroBanner imageUrl={c.hero.heroImageUrl} fallbackStyle={{background:"linear-gradient(135deg,#990000 0%,#660000 50%,#1a1a1a 100%)"}} minHeight={220}>
          <div style={{borderRadius:12,padding:"52px 48px"}}>
            <div style={{background:T.scarlet,color:T.white,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,display:"inline-block",marginBottom:16,letterSpacing:1}}>{c.hero.badge}</div>
            <h1 style={{fontFamily:"Montserrat,sans-serif",fontSize:42,fontWeight:800,color:T.white,marginBottom:16,lineHeight:1.15}}>{c.hero.headline}</h1>
            <p style={{color:T.scarletLight,fontSize:17,marginBottom:32,maxWidth:560,lineHeight:1.6}}>{c.hero.subheadline}</p>
            <button onClick={()=>setHubStep("step1")} style={{background:T.white,color:T.scarlet,border:"none",padding:"16px 28px",borderRadius:8,fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"Montserrat,sans-serif",boxShadow:"0 4px 20px rgba(0,0,0,.3)"}}>
              {c.hero.ctaLabel} →
            </button>
            <div style={{color:T.scarletLight,fontSize:12,marginTop:10}}>{c.hero.ctaSubtext}</div>
          </div>
          </HeroBanner>
          <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:14,fontWeight:700,color:T.gray4,marginBottom:14,letterSpacing:.5,textTransform:"uppercase"}}>We serve 12 organization types</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
            {c.signupForm.orgTypes.map(ot=>(
              <button key={ot.id} onClick={()=>onGoSegment(ot.segment)} style={{background:T.white,border:`1.5px solid ${T.gray2}`,borderRadius:8,padding:"14px 10px",cursor:"pointer",textAlign:"center",fontSize:12,color:T.gray6,fontWeight:600}}>
                <div style={{fontSize:22,marginBottom:6}}>{ot.icon}</div>{ot.label}
              </button>
            ))}
          </div>
          <div style={{background:T.white,borderRadius:10,border:`1px solid ${T.gray2}`,padding:"20px 24px"}}>
            <div style={{fontSize:11,fontWeight:700,color:T.gray4,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Active cooperative contracts</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {c.contracts.filter(ct=>ct.active).map(ct=>(
                <button key={ct.id} onClick={()=>onGoContract(ct.id)} style={{background:T.gray1,border:`1px solid ${T.gray2}`,borderRadius:6,padding:"8px 14px",fontSize:12,fontWeight:700,color:T.gray6,cursor:"pointer"}}>
                  {ct.logoLabel} <span style={{color:T.gray4,fontWeight:400}}>#{ct.contractNumber}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {hubStep==="step1"&&(
        <div style={{animation:"fadeUp .3s ease",maxWidth:720,margin:"0 auto"}}>
          <StepHeader step={1} total={3} title={c.signupForm.title} subtitle={c.signupForm.subtitle} onBack={resetHub}/>
          <div style={{background:T.white,borderRadius:12,border:`1px solid ${T.gray2}`,padding:32}}>
            <label style={{fontSize:13,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:16}}>What type of organization are you with?</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {c.signupForm.orgTypes.map(ot=>(
                <button key={ot.id} onClick={()=>setSignupData(p=>({...p,orgType:ot}))} style={{background:signupData.orgType?.id===ot.id?T.scarletLight:"#fafafa",border:`2px solid ${signupData.orgType?.id===ot.id?T.scarlet:T.gray2}`,borderRadius:8,padding:"14px 10px",cursor:"pointer",textAlign:"center",fontSize:12,color:T.gray6,fontWeight:600}}>
                  <div style={{fontSize:24,marginBottom:6}}>{ot.icon}</div>{ot.label}
                </button>
              ))}
            </div>
            <div style={{marginTop:24,display:"flex",justifyContent:"flex-end"}}>
              <button onClick={()=>signupData.orgType&&setHubStep("step2")} style={{background:signupData.orgType?T.scarlet:T.gray3,color:T.white,border:"none",padding:"14px 32px",borderRadius:8,fontWeight:700,fontSize:15,cursor:signupData.orgType?"pointer":"not-allowed",fontFamily:"Montserrat,sans-serif"}}>Continue →</button>
            </div>
          </div>
        </div>
      )}

      {hubStep==="step2"&&(
        <div style={{animation:"fadeUp .3s ease",maxWidth:720,margin:"0 auto"}}>
          <StepHeader step={2} total={3} title="Tell us about yourself" subtitle={`Getting set up for ${signupData.orgType?.label||"your organization"}`} onBack={()=>setHubStep("step1")}/>
          <div style={{background:T.white,borderRadius:12,border:`1px solid ${T.gray2}`,padding:32}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <FormField label="First Name" value={signupData.firstName} onChange={v=>setSignupData(p=>({...p,firstName:v}))} placeholder="Jane"/>
              <FormField label="Last Name"  value={signupData.lastName}  onChange={v=>setSignupData(p=>({...p,lastName:v}))}  placeholder="Smith"/>
            </div>
            <div style={{marginBottom:16}}><FormField label="Business Email" value={signupData.email} onChange={v=>setSignupData(p=>({...p,email:v}))} placeholder="jane@university.edu" type="email"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <FormField label="Organization Name" value={signupData.orgName} onChange={v=>setSignupData(p=>({...p,orgName:v}))} placeholder="State University"/>
              <FormField label="Business Phone"    value={signupData.phone}   onChange={v=>setSignupData(p=>({...p,phone:v}))}   placeholder="(212) 555-0100" type="tel"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:6}}>State</label>
                <select value={signupData.state} onChange={e=>setSignupData(p=>({...p,state:e.target.value}))} style={{width:"100%",padding:"11px 12px",border:`1.5px solid ${T.gray3}`,borderRadius:7,fontSize:14,background:T.white}}>
                  <option value="">Select state…</option>{STATES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:6}}>Annual Purchase Volume</label>
                <select value={signupData.purchaseVolume} onChange={e=>setSignupData(p=>({...p,purchaseVolume:e.target.value}))} style={{width:"100%",padding:"11px 12px",border:`1.5px solid ${T.gray3}`,borderRadius:7,fontSize:14,background:T.white}}>
                  <option value="">Estimate…</option><option>Under $10,000</option><option>$10,000 – $50,000</option><option>$50,000 – $250,000</option><option>$250,000 – $1M</option><option>Over $1M</option>
                </select>
              </div>
            </div>
            <div style={{marginTop:24,display:"flex",justifyContent:"space-between"}}>
              <button onClick={()=>setHubStep("step1")} style={{background:"none",border:"none",color:T.gray5,cursor:"pointer",fontSize:14}}>← Back</button>
              <button onClick={()=>setHubStep("step3")} style={{background:T.scarlet,color:T.white,border:"none",padding:"14px 32px",borderRadius:8,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Continue →</button>
            </div>
          </div>
        </div>
      )}

      {hubStep==="step3"&&(
        <div style={{animation:"fadeUp .3s ease",maxWidth:720,margin:"0 auto"}}>
          <StepHeader step={3} total={3} title="One last thing" subtitle="This helps us find the right contracts and portal for you." onBack={()=>setHubStep("step2")}/>
          <div style={{background:T.white,borderRadius:12,border:`1px solid ${T.gray2}`,padding:32}}>
            <label style={{fontSize:13,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:16}}>What\'s your primary purchasing need?</label>
            {["Equipment for a specific project","Ongoing / recurring hardware purchases","Cooperative contract compliance","Setting up an eProcurement integration","Net terms / credit account","Just exploring options"].map(opt=>(
              <button key={opt} onClick={()=>setSignupData(p=>({...p,primaryNeed:opt}))} style={{display:"block",width:"100%",marginBottom:10,background:signupData.primaryNeed===opt?T.scarletLight:"#fafafa",border:`2px solid ${signupData.primaryNeed===opt?T.scarlet:T.gray2}`,borderRadius:8,padding:"14px 20px",cursor:"pointer",textAlign:"left",fontSize:14,fontWeight:signupData.primaryNeed===opt?700:500}}>{opt}</button>
            ))}
            <div style={{background:T.gray1,borderRadius:8,padding:16,marginTop:20,fontSize:13,color:T.gray5}}>
              <strong style={{color:T.gray6}}>Your profile:</strong> {signupData.orgType?.label}{signupData.state?` · ${signupData.state}`:""}{signupData.orgName?` · ${signupData.orgName}`:""}
            </div>
            <div style={{marginTop:24,display:"flex",justifyContent:"space-between"}}>
              <button onClick={()=>setHubStep("step2")} style={{background:"none",border:"none",color:T.gray5,cursor:"pointer",fontSize:14}}>← Back</button>
              <button onClick={deduceSegment} style={{background:T.scarlet,color:T.white,border:"none",padding:"16px 36px",borderRadius:8,fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"Montserrat,sans-serif",boxShadow:`0 4px 16px rgba(153,0,0,.3)`}}>Find My Portal →</button>
            </div>
          </div>
        </div>
      )}

      {hubStep==="result"&&seg&&(
        <div style={{animation:"fadeUp .3s ease",maxWidth:780,margin:"0 auto"}}>
          <div style={{background:seg.color,borderRadius:12,padding:"32px 36px",marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.7)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Your matched segment</div>
            <h2 style={{fontFamily:"Montserrat,sans-serif",fontSize:30,fontWeight:800,color:T.white,marginBottom:10}}>{seg.name}</h2>
            <p style={{color:"rgba(255,255,255,.85)",fontSize:15,lineHeight:1.6,marginBottom:20}}>{seg.description}</p>
            <button onClick={()=>onGoSegment(deducedSegment)} style={{background:T.white,color:seg.color,border:"none",padding:"12px 24px",borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>View {seg.name} Hub Page →</button>
          </div>
          {relContracts.length>0&&(
            <div style={{background:T.white,borderRadius:12,border:`1px solid ${T.gray2}`,padding:28,marginBottom:20}}>
              <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:16,fontWeight:700,marginBottom:18,color:T.gray6}}>Available contracts for your organization</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
                {relContracts.map(ct=>(
                  <button key={ct.id} onClick={()=>onGoContract(ct.id)} style={{border:`1.5px solid ${T.gray2}`,borderRadius:8,padding:"16px 18px",cursor:"pointer",textAlign:"left",background:T.white}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{background:T.gray1,fontWeight:800,fontSize:12,padding:"4px 10px",borderRadius:4}}>{ct.logoLabel}</span>
                      <span style={{fontSize:11,color:T.gray4}}>#{ct.contractNumber}</span>
                    </div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:4,color:T.gray6}}>{ct.name}</div>
                    <div style={{fontSize:12,color:T.gray5}}>{ct.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{background:T.white,borderRadius:12,border:`1px solid ${T.gray2}`,padding:24}}>
            <h3 style={{fontFamily:"Montserrat,sans-serif",fontWeight:700,fontSize:15,marginBottom:16}}>Ready to create your account?</h3>
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>{setHubStep("step1");window.scrollTo(0,0);}} style={{flex:1,background:T.scarlet,color:T.white,border:"none",padding:14,borderRadius:8,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Create My Account →</button>
              <button onClick={resetHub} style={{background:T.gray1,color:T.gray5,border:"none",padding:"14px 20px",borderRadius:8,fontWeight:600,fontSize:14,cursor:"pointer"}}>Start Over</button>
            </div>
            <div style={{fontSize:12,color:T.gray4,marginTop:10}}>📧 {c.footer.contactEmail} · 📞 {c.footer.repPhone}</div>
          </div>
        </div>
      )}
      <HubFooter config={c}/>
    </div>
  );
}

// ─── Segment Page View ────────────────────────────────────────────────────────
function SegmentPageView({segmentId,config:c,onGoHub,onGoSegment,onGoContract,onSignUp}){
  const sp=c.segmentPages[segmentId];
  const seg=c.segments[segmentId];
  const [state,setState]=useState("");
  if(!sp||!seg)return<div style={{padding:40,textAlign:"center"}}>Segment not found.</div>;
  const featuredCt=sp.featuredContractId?c.contracts.find(x=>x.id===sp.featuredContractId):null;
  const otherCts=(sp.otherContractIds||[]).map(id=>c.contracts.find(x=>x.id===id)).filter(Boolean);
  const icon=c.signupForm.orgTypes.find(ot=>ot.segment===segmentId)?.icon||"🏢";
  return(
    <div>
      {/* Breadcrumb */}
      <div style={{background:T.white,borderBottom:`1px solid ${T.gray2}`,padding:"8px 24px",display:"flex",gap:6,fontSize:12,alignItems:"center"}}>
        <button onClick={onGoHub} style={{background:"none",border:"none",cursor:"pointer",color:T.bond,fontWeight:600}}>Home</button>
        <span style={{color:T.gray4}}>›</span><span style={{color:T.gray5}}>{sp.headline}</span>
      </div>
      {/* Hero */}
      <HeroBanner imageUrl={sp.heroImageUrl} fallbackStyle={{background:`linear-gradient(135deg,${seg.color}dd 0%,#1a1a1a 100%)`}} minHeight={180}>
      <div style={{display:"flex",alignItems:"flex-end",position:"relative",overflow:"hidden"}}>
        {sp.signupBannerTitle&&(
          <div style={{position:"absolute",top:16,right:24,background:T.white,borderRadius:6,padding:"16px 20px",width:260,boxShadow:"0 2px 12px rgba(0,0,0,.15)",zIndex:2}}>
            <div style={{fontFamily:"Montserrat,sans-serif",fontWeight:700,fontSize:14,marginBottom:8,color:T.gray6}}>{sp.signupBannerTitle}</div>
            <div style={{fontSize:12,color:T.gray5,lineHeight:1.5,marginBottom:12}}>{sp.signupBannerBody}</div>
            <button onClick={onSignUp} style={{width:"100%",background:T.green,color:T.white,border:"none",padding:10,borderRadius:4,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Sign Up</button>
            <div style={{marginTop:8,fontSize:11,color:T.gray5,textAlign:"center"}}>Already registered? <span style={{color:T.bond,cursor:"pointer",fontWeight:600}}>Log In</span></div>
          </div>
        )}
        <div style={{position:"relative",zIndex:1,padding:"32px 24px 24px",flex:1}}>
          <h1 style={{fontFamily:"Montserrat,sans-serif",fontSize:32,fontWeight:800,color:T.white,marginBottom:12}}>{sp.headline}</h1>
          {sp.showOrgTypeFilter&&(
            <select style={{padding:"8px 14px",borderRadius:4,border:"none",fontSize:13,fontWeight:600,background:T.white,cursor:"pointer",color:T.gray6}}>
              <option>Choose Organization Type</option>
              {c.signupForm.orgTypes.map(ot=><option key={ot.id}>{ot.label}</option>)}
            </select>
          )}
        </div>
      </div>
      </HeroBanner>
      {/* Body */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px"}}>
        {/* Intro */}
        <div style={{display:"flex",gap:20,marginBottom:36,alignItems:"flex-start"}}>
          <div style={{width:72,height:72,background:seg.color,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>{icon}</div>
          <div>
            <p style={{fontSize:17,fontWeight:600,color:T.gray6,lineHeight:1.5,marginBottom:8}}>{sp.intro}</p>
            <p style={{fontSize:14,color:T.gray5,lineHeight:1.6}}>{sp.subIntro}</p>
          </div>
        </div>
        {/* Two-column */}
        <div style={{display:"grid",gridTemplateColumns:(otherCts.length>0||sp.showStateFilter)?"1fr 300px":"1fr",gap:32,alignItems:"start"}}>
          {/* Featured section */}
          <div>
            {sp.featuredTitle&&(
              <div style={{background:T.white,borderRadius:10,border:`1px solid ${T.gray2}`,padding:28,marginBottom:16}}>
                <h2 style={{fontFamily:"Montserrat,sans-serif",fontSize:18,fontWeight:700,color:seg.color,marginBottom:16}}>{sp.featuredTitle}</h2>
                {featuredCt&&(
                  <div style={{background:T.white,border:`1px solid ${T.gray2}`,borderRadius:6,padding:"14px 18px",display:"inline-flex",alignItems:"center",gap:10,marginBottom:16}}>
                    <ContractLogo contract={featuredCt} height={28} maxWidth={120}/>
                    <span style={{fontSize:11,color:T.gray4}}>{featuredCt.name}</span>
                  </div>
                )}
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:16}}>{sp.featuredBody}</p>
                <p style={{fontSize:14,fontWeight:700,color:T.gray6,marginBottom:12}}>Sign up today to enjoy:</p>
                {(sp.featuredBenefits||[]).map((b,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,fontSize:14,color:T.gray6,fontWeight:i<2?700:400}}>
                    <span style={{color:seg.color,flexShrink:0,marginTop:2}}>✓</span>{b}
                  </div>
                ))}
                <div style={{display:"flex",gap:12,marginTop:20}}>
                  <button onClick={onSignUp} style={{background:T.green,color:T.white,border:"none",padding:"12px 24px",borderRadius:4,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>{sp.featuredSignupCta}</button>
                  {sp.featuredLearnMoreCta&&(
                    <button onClick={featuredCt?()=>onGoContract(featuredCt.id):undefined} style={{background:T.white,color:T.green,border:`1.5px solid ${T.green}`,padding:"12px 24px",borderRadius:4,fontWeight:700,fontSize:14,cursor:"pointer"}}>{sp.featuredLearnMoreCta}</button>
                  )}
                </div>
              </div>
            )}
            {segmentId==="corporate"&&(
              <div style={{background:T.gray1,border:`1px solid ${T.gray2}`,borderRadius:8,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",marginTop:8}}>
                <div style={{width:44,height:44,background:T.bond,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>📋</div>
                <div style={{flex:1,fontWeight:700,fontSize:14,color:T.gray6}}>Looking for Contract or eProcurement Solutions?</div>
                <button style={{background:T.white,border:`1.5px solid ${T.green}`,color:T.green,padding:"8px 16px",borderRadius:4,fontWeight:700,fontSize:13,cursor:"pointer"}}>Learn More</button>
              </div>
            )}
          </div>
          {/* Sidebar */}
          {(otherCts.length>0||sp.showStateFilter)&&(
            <div>
              {sp.otherContractsTitle&&<h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:16,fontWeight:700,color:T.gray6,marginBottom:16}}>{sp.otherContractsTitle}</h3>}
              {sp.showStateFilter&&(
                <div style={{marginBottom:16}}>
                  <select value={state} onChange={e=>setState(e.target.value)} style={{width:"100%",padding:"10px 14px",border:`1px solid ${T.gray3}`,borderRadius:6,fontSize:13,background:T.white,fontWeight:600}}>
                    <option value="">Select Your State</option>{STATES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div style={{background:T.white,border:`1px solid ${T.gray2}`,borderRadius:8,overflow:"hidden"}}>
                {otherCts.map((ct,i)=>(
                  <button key={ct.id} onClick={()=>onGoContract(ct.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"13px 16px",background:T.white,border:"none",borderBottom:i<otherCts.length-1?`1px solid ${T.gray2}`:"none",cursor:"pointer",textAlign:"left"}}>
                    <span style={{fontSize:13,color:T.gray6,fontWeight:600}}>{ct.name}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:10,fontWeight:700,color:T.gray4,background:T.gray1,padding:"2px 7px",borderRadius:4}}>{ct.logoLabel}</span>
                      <span style={{color:T.bond,fontWeight:700}}>›</span>
                    </div>
                  </button>
                ))}
              </div>
              {sp.phoneNumber&&<div style={{marginTop:14,fontSize:12,color:T.gray5}}>Can\'t find the contract you need? Call us at {sp.phoneNumber}</div>}
            </div>
          )}
        </div>
      </div>
      <HubFooter config={c}/>
    </div>
  );
}

// ─── Contract Page View ───────────────────────────────────────────────────────
function ContractPageView({contractId,config:c,onGoHub,onGoContract,onSignUp}){
  const cp=c.contractPages[contractId];
  const ct=c.contracts.find(x=>x.id===contractId);
  if(!cp||!ct)return<div style={{padding:40,textAlign:"center"}}>Contract page not found.</div>;
  return(
    <div>
      <div style={{background:T.white,borderBottom:`1px solid ${T.gray2}`,padding:"8px 24px",display:"flex",gap:6,fontSize:12,alignItems:"center"}}>
        <button onClick={onGoHub} style={{background:"none",border:"none",cursor:"pointer",color:T.bond,fontWeight:600}}>Home</button>
        <span style={{color:T.gray4}}>›</span><span style={{color:T.gray5}}>{cp.headline}</span>
      </div>
      {/* Hero */}
      <HeroBanner imageUrl={cp.heroImageUrl} fallbackStyle={{background:"linear-gradient(135deg,#1a2a3a 0%,#2a3a4a 100%)"}} minHeight={140}>
        <div style={{padding:"28px 24px"}}>
          <h1 style={{fontFamily:"Montserrat,sans-serif",fontSize:28,fontWeight:800,color:T.white}}>{cp.headline}</h1>
        </div>
      </HeroBanner>
      {/* Body */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 24px"}}>
        <div style={{marginBottom:48}}>
          <h2 style={{fontFamily:"Montserrat,sans-serif",fontSize:22,fontWeight:700,color:T.gray6,marginBottom:24}}>{cp.subheadline}</h2>
          <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:32,alignItems:"start"}}>
            <div style={{background:T.white,border:`1px solid ${T.gray2}`,borderRadius:6,padding:"24px 20px",display:"flex",alignItems:"center",justifyContent:"center",minHeight:100}}>
              <ContractLogo contract={ct} height={36} maxWidth={160}/>
            </div>
            <div>
              <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:16}}>{cp.blurb}</p>
              <p style={{fontSize:14,fontWeight:700,color:T.gray6,marginBottom:12}}>Sign up today to enjoy:</p>
              {(cp.benefits||[]).map((b,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10,fontSize:14,color:T.gray5}}>
                  <span style={{color:T.green,flexShrink:0,marginTop:2}}>✓</span>{b}
                </div>
              ))}
              <div style={{display:"flex",gap:12,marginTop:20}}>
                <button onClick={onSignUp} style={{background:T.green,color:T.white,border:"none",padding:"12px 24px",borderRadius:4,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>{cp.signupCta}</button>
                <button style={{background:T.white,color:T.green,border:`1.5px solid ${T.green}`,padding:"12px 24px",borderRadius:4,fontWeight:700,fontSize:14,cursor:"pointer"}}>{cp.contractInfoCta}</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
          <div>
            <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:16,fontWeight:700,color:T.gray6,marginBottom:16}}>B&H: One Stop For Technology</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {CATEGORIES.map(cat=>(
                <div key={cat.label} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:T.white,border:`1px solid ${T.gray2}`,borderRadius:6,cursor:"pointer"}}>
                  <span style={{fontSize:20}}>{cat.emoji}</span>
                  <span style={{fontSize:13,fontWeight:600,color:T.gray6}}>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:16,fontWeight:700,color:T.gray6,marginBottom:16}}>{cp.promoTitle}</h3>
            {(cp.promoBullets||[]).map((b,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,fontSize:15,fontWeight:500,color:T.gray6}}>
                <span style={{color:T.green,fontSize:16,fontWeight:700}}>✓</span>{b}
              </div>
            ))}
          </div>
        </div>
        <div style={{marginTop:36}}>
          <div style={{fontSize:12,fontWeight:700,color:T.gray4,letterSpacing:.5,textTransform:"uppercase",marginBottom:12}}>Other Cooperative Contracts</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {c.contracts.filter(x=>x.id!==contractId&&x.active).map(x=>(
              <button key={x.id} onClick={()=>onGoContract(x.id)} style={{background:T.white,border:`1px solid ${T.gray3}`,borderRadius:6,padding:"8px 16px",fontSize:12,fontWeight:700,color:T.bond,cursor:"pointer"}}>{x.logoLabel}</button>
            ))}
          </div>
        </div>
      </div>
      <HubFooter config={c}/>
    </div>
  );
}


// ─── Static Page View ─────────────────────────────────────────────────────────
// Handles the 4 nav-level pages that have unique layouts on the live site:
// contracts_eprocurement, studio, it_services, about, contact
const STATIC_PAGES = {
  contracts_eprocurement: {
    headline: "Contracts & eProcurement",
    heroStyle: { background: "linear-gradient(to bottom, #2a3a4a, #1a2530)" },
  },
  studio: {
    headline: "The Studio at B&H",
    heroStyle: { background: "linear-gradient(135deg, #1a1a1a 0%, #2a2020 100%)" },
  },
  it_services: {
    headline: "B2B IT Services",
    heroStyle: { background: "linear-gradient(135deg, #1a2a1a 0%, #0a1a2a 100%)" },
  },
  about: {
    headline: "About B&H",
    heroStyle: { background: "linear-gradient(to bottom, #222, #333)" },
  },
  contact: {
    headline: "Contact",
    heroStyle: { background: "linear-gradient(to bottom, #1a2a1a, #111)" },
  },
};

const EPROCUREMENT_PLATFORMS = [
  {name:"SAP Ariba", color:"#0070C0"},
  {name:"JAGGAER",   color:"#D62027"},
  {name:"ESM",       color:"#1B5E96"},
  {name:"Unimarket", color:"#E87722"},
  {name:"Coupa",     color:"#E63946"},
  {name:"SAP",       color:"#008FD3"},
  {name:"EqualLevel",color:"#5B2D8E"},
  {name:"Oracle",    color:"#C74634"},
];

function StaticPageView({pageId, config:c, onGoHub, onGoSegment, onGoContract, onSignUp}){
  const pg = STATIC_PAGES[pageId];
  if(!pg) return <div style={{padding:40,textAlign:"center"}}>Page not found.</div>;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{background:T.white,borderBottom:`1px solid ${T.gray2}`,padding:"8px 24px",display:"flex",gap:6,fontSize:12,alignItems:"center"}}>
        <button onClick={onGoHub} style={{background:"none",border:"none",cursor:"pointer",color:T.bond,fontWeight:600}}>Home</button>
        <span style={{color:T.gray4}}>›</span>
        <span style={{color:T.gray5}}>{pg.headline}</span>
      </div>

      {/* Hero */}
      <HeroBanner imageUrl={""} fallbackStyle={pg.heroStyle} minHeight={160}>
      <div style={{display:"flex", alignItems:"flex-end"}}>
        <div style={{padding:"32px 24px"}}>
          {pageId==="studio" ? (
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{width:56,height:56,background:"#990000",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:"#FFD700",fontWeight:900,fontSize:18,fontFamily:"Montserrat"}}>B&H</span>
              </div>
              <div>
                <h1 style={{fontFamily:"Montserrat,sans-serif",fontSize:26,fontWeight:800,color:T.white}}>The Studio at B&H</h1>
                <span style={{color:"#ccc",fontSize:14,fontStyle:"italic"}}>Tech Solutions for Media Professionals</span>
              </div>
            </div>
          ) : (
            <h1 style={{fontFamily:"Montserrat,sans-serif",fontSize:28,fontWeight:800,color:T.white}}>{pg.headline}</h1>
          )}
        </div>
      </div>
      </HeroBanner>

      {/* Page body */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 24px"}}>

        {/* ── CONTRACTS & ePROCUREMENT ── */}
        {pageId==="contracts_eprocurement" && (
          <div>
            {/* Direct Contracts section */}
            <div style={{display:"grid",gridTemplateColumns:"120px 1fr",gap:28,marginBottom:48,alignItems:"flex-start"}}>
              <div style={{width:100,height:100,background:T.bond,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44}}>📋</div>
              <div>
                <h2 style={{fontFamily:"Montserrat,sans-serif",fontSize:18,fontWeight:700,color:T.green,marginBottom:12}}>Direct Contracts</h2>
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:8}}>B&H understands that in order to thrive and grow, your business purchasing needs to be easy, seamless and customized for you.</p>
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:8}}>That's why we offer many contract and electronic purchasing options. Our experienced team will quickly turn around custom punch out, checkout portals and more.</p>
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:8}}>For State and Local Government and educational institutions, we offer a variety of publicly-awarded and competitively-bid contracts so you can ensure compliance and best value.</p>
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:20}}>For large corporate customers, we offer direct pricing agreements. Please contact our contract team at <span style={{color:T.bond,fontWeight:600}}>b2bcontracts@bhphoto.com</span></p>

                {/* Routing cards */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
                  <div style={{border:`1px solid ${T.gray2}`,borderRadius:8,padding:20}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:36,height:36,background:T.bond,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💡</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:T.gray6}}>Small or medium-sized business?</div>
                      </div>
                    </div>
                    <p style={{fontSize:13,color:T.gray5,marginBottom:14}}>Sign up for B&H B2B for Small Business and start purchasing today.</p>
                    <button onClick={()=>onGoSegment("smb")} style={{background:T.white,border:`1.5px solid ${T.green}`,color:T.green,padding:"8px 20px",borderRadius:4,fontWeight:700,fontSize:13,cursor:"pointer"}}>Learn More</button>
                  </div>
                  <div style={{border:`1px solid ${T.gray2}`,borderRadius:8,padding:20}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                      <div style={{width:36,height:36,background:T.bond,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏢</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:T.gray6}}>Over 500 employees? Don't need a contract?</div>
                      </div>
                    </div>
                    <p style={{fontSize:13,color:T.gray5,marginBottom:14}}>Check out B&H Corporate, our instant sign-up, self service purchasing solution.</p>
                    <button onClick={()=>onGoSegment("corporate")} style={{background:T.white,border:`1.5px solid ${T.green}`,color:T.green,padding:"8px 20px",borderRadius:4,fontWeight:700,fontSize:13,cursor:"pointer"}}>Learn More</button>
                  </div>
                </div>
              </div>
            </div>

            {/* eProcurement section */}
            <div style={{borderTop:`2px solid ${T.gray2}`,paddingTop:40}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48}}>
                <div>
                  <h2 style={{fontFamily:"Montserrat,sans-serif",fontSize:20,fontWeight:700,color:T.green,marginBottom:16}}>eProcurement</h2>
                  <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:10}}>B&H currently integrates with over 40 different eProcurement platforms such as Ariba, SAP, Jaggaer, ESM, Unimarket, Coupa, Oracle and more across hundreds of satisfied clients.</p>
                  <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:10}}>We can integrate with any and all eProcurement solutions. Plus, we offer cXML and EDI for POs and invoicing.</p>
                  <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:10}}>Unsure where to start? Not to worry: eProcurement at B&H is fast and free! Our team will be here to guide you every step of the way.</p>
                  <p style={{fontSize:14,color:T.gray6,lineHeight:1.7}}>Contact our eProcurement team at <span style={{color:T.bond,fontWeight:600}}>eprocurement@bhphoto.com</span></p>
                </div>
                <div>
                  <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:16,fontWeight:700,color:T.gray6,marginBottom:16}}>We Support All Major Platforms</h3>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {EPROCUREMENT_PLATFORMS.map(p=>(
                      <div key={p.name} style={{background:T.white,border:`1px solid ${T.gray2}`,borderRadius:6,padding:"16px 12px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontWeight:800,fontSize:14,color:p.color,fontFamily:"Montserrat,sans-serif"}}>{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contract links */}
            <div style={{marginTop:40,background:T.gray1,borderRadius:10,padding:24}}>
              <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:15,fontWeight:700,color:T.gray6,marginBottom:16}}>Browse Cooperative Contracts by Segment</h3>
              <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                {c.signupForm.orgTypes.slice(0,8).map(ot=>(
                  <button key={ot.id} onClick={()=>onGoSegment(ot.segment)} style={{background:T.white,border:`1px solid ${T.gray3}`,borderRadius:6,padding:"8px 16px",fontSize:12,fontWeight:600,color:T.bond,cursor:"pointer"}}>
                    {ot.icon} {ot.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── THE STUDIO ── */}
        {pageId==="studio" && (
          <div>
            <p style={{fontSize:16,color:T.gray6,lineHeight:1.7,marginBottom:32,maxWidth:800}}>The Studio specializes in completely customized applications and installations. This is where form meets function, for real. No matter how complex your project or requirements, our experts will work with you to determine the most appropriate equipment and solutions.</p>

            <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:16,fontWeight:700,color:T.gray6,marginBottom:16}}>The Studio Offers Solutions For:</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:16,marginBottom:40}}>
              {["Digital Cinema Production","Broadcast & Streaming","Studio & ENG","Editing, Color Grading & Post-Production","System Design & Implementation"].map(s=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 18px",background:T.white,border:`1px solid ${T.gray2}`,borderRadius:8,fontSize:13,fontWeight:600,color:T.gray6}}>🎬 {s}</div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,marginBottom:40}}>
              <div>
                <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:18,fontWeight:700,color:T.gray6,marginBottom:12}}>The Studio Technology Center (STC)</h3>
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:10}}>Building on B&H's long history of superior service, The Studio Technology Center is a unique solution-based environment dedicated to all professional media markets.</p>
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:10}}>The STC is a fully operational studio with an extensive array of high-end products and digital workflows — available to anyone. Reach out to schedule an appointment.</p>
                <p style={{fontSize:14,color:T.gray5}}>📞 212.465.0106 · <span style={{color:T.bond,cursor:"pointer"}}>contact us online</span></p>
              </div>
              <div style={{background:"linear-gradient(135deg,#1a1a1a,#2a1a1a)",borderRadius:10,minHeight:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:48}}>🎚</span>
              </div>
            </div>

            <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:16,fontWeight:700,color:T.gray6,marginBottom:16}}>What The Studio Can Do for You</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
              {[
                {icon:"💡",title:"Consultation & System Design",body:"Unsure which kind of technology and equipment you need for your project? You've come to the right place."},
                {icon:"🔧",title:"Installation, System Integration",body:"The Studio offers a range of integration services to all market verticals of the media industry."},
                {icon:"📚",title:"Technology Training",body:"From a quick brush-up to crash intensives, Studio experts can bring your team up to speed on the latest innovations."},
              ].map(item=>(
                <div key={item.title} style={{background:T.white,border:`1px solid ${T.gray2}`,borderRadius:8,padding:20}}>
                  <div style={{fontSize:28,marginBottom:10}}>{item.icon}</div>
                  <div style={{fontWeight:700,fontSize:14,color:T.gray6,marginBottom:8}}>{item.title}</div>
                  <div style={{fontSize:13,color:T.gray5,lineHeight:1.6}}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── B2B IT SERVICES ── */}
        {pageId==="it_services" && (
          <div>
            <p style={{fontSize:16,color:T.gray6,lineHeight:1.7,marginBottom:36,maxWidth:800}}>B&H B2B offers a full suite of extended support and integration services for your business. From automated updates to custom installations, equipment tagging and more, our team of trained professionals go above and beyond to help you succeed.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24,marginBottom:40}}>
              {[
                {icon:"🔗",title:"IT Integration Services",sub:"(NYC Metro Area Only)",body:"Outsource your next IT project to B&H and free up valuable resources for business-critical daily operations."},
                {icon:"⚙️",title:"Auto Enrollment",body:"Streamline your network with company-wide updates and device enrollments that are auto-synced to your management systems."},
                {icon:"🏷",title:"Asset Tagging",body:"Get your equipment pre-tagged with your company information including phone, serial and department number labels."},
                {icon:"💻",title:"Hardware & Mobile Device Configuration",body:"Get your gear delivered with extra memory, NICs and video cards installed, hard drives pre-formatted, and more."},
                {icon:"✏️",title:"Equipment Engraving & Etching",body:"Add prestige and brand awareness to your office equipment with custom logos, company names and titles."},
                {icon:"📦",title:"Kitting & Accessory Management",body:"End-to-end solutions, hardware and accessories delivered to your company's branch locations, remote offices and individuals."},
              ].map(item=>(
                <div key={item.title} style={{background:T.white,border:`1px solid ${T.gray2}`,borderRadius:8,padding:20}}>
                  <div style={{fontSize:28,marginBottom:8}}>{item.icon}</div>
                  <div style={{fontWeight:700,fontSize:14,color:T.gray6,marginBottom:item.sub?2:8}}>{item.title}</div>
                  {item.sub&&<div style={{fontSize:11,fontWeight:700,color:T.scarlet,marginBottom:8}}>{item.sub}</div>}
                  <div style={{fontSize:13,color:T.gray5,lineHeight:1.6}}>{item.body}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:14,color:T.gray5,marginBottom:40}}>For more details, please tell us about your project via email <span style={{color:T.bond,fontWeight:600}}>b2bitservices@BandH.com</span></div>

            {/* Apple Enterprise */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:32,background:T.white,border:`1px solid ${T.gray2}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{padding:28}}>
                <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:18,fontWeight:700,color:T.gray6,marginBottom:8}}>Enroll with Apple Enterprise Support Solutions</h3>
                <div style={{fontSize:12,fontWeight:700,color:T.gray5,marginBottom:12}}>Apple School Manager & Apple Business Manager Reseller ID: 101C20E0</div>
                <p style={{fontSize:13,color:T.gray5,lineHeight:1.6,marginBottom:16}}>B&H B2B is an Authorized Apple Reseller. Our internal team of industry experts can help you streamline inventory and supply for enterprise, as well as customize devices that your organization owns, while integrating Apple's free suite of tools.</p>
                <button style={{background:T.white,border:`1.5px solid ${T.green}`,color:T.green,padding:"8px 20px",borderRadius:4,fontWeight:700,fontSize:13,cursor:"pointer"}}>Learn More</button>
              </div>
              <div style={{background:"#1a1a1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,gap:12}}>
                <div style={{background:"#555",borderRadius:8,padding:"8px 16px",fontSize:11,fontWeight:700,color:"#fff",letterSpacing:1}}>Authorized Reseller</div>
                <span style={{fontSize:48}}>🍎</span>
                <div style={{color:"#ccc",fontSize:12,textAlign:"center"}}>Request Enrollment</div>
                {["Email Address","Organization Name","Organization Address","Apple Organization ID"].map(f=>(
                  <input key={f} placeholder={f} style={{width:"100%",padding:"8px 10px",borderRadius:4,border:`1px solid ${T.gray3}`,fontSize:12,background:"#fff"}}/>
                ))}
                <button style={{width:"100%",background:T.green,color:T.white,border:"none",padding:10,borderRadius:4,fontWeight:700,fontSize:13,cursor:"pointer"}}>Submit Request</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ABOUT B&H ── */}
        {pageId==="about" && (
          <div>
            <h2 style={{fontFamily:"Montserrat,sans-serif",fontSize:22,fontWeight:700,color:T.green,marginBottom:20}}>Serving the Pros Since 1973</h2>
            <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:32,marginBottom:36}}>
              <div style={{background:T.gray2,borderRadius:8,minHeight:200,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>📷</div>
              <div>
                <p style={{fontSize:15,fontWeight:600,color:T.gray6,lineHeight:1.7,marginBottom:16}}>When Blimie and Herman Schreiber opened a small Manhattan camera store in 1973, they followed a simple philosophy: "Be honest, be helpful, know the merchandise… and don't push."</p>
                <p style={{fontSize:14,color:T.gray5,lineHeight:1.7}}>That same credo blossomed into a midtown SuperStore supported by over thirteen acres of merchandise and a global reputation for honesty and integrity in retail. Today, our inventory spans audio-visual gear to office technology, conferencing equipment to computers.</p>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:32}}>
              <div>
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:10}}>Along the way, B&H established strong working relationships with owners and stakeholders in some of the world's biggest organizations. Discover why business owners and corporations the world over — spanning education, the arts, Fortune 500 and federal government — rely on B&H for personalized attention and comprehensive service.</p>
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7}}>Our team has achieved preferred-vendor status and negotiated contracts with numerous federal, state and local government entities.</p>
              </div>
              <div style={{background:T.gray2,borderRadius:8,minHeight:180,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🏙</div>
            </div>
          </div>
        )}

        {/* ── CONTACT ── */}
        {pageId==="contact" && (
          <div>
            <h2 style={{fontFamily:"Montserrat,sans-serif",fontSize:22,fontWeight:700,color:T.green,marginBottom:16}}>Our Team Is Here for You</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:32,marginBottom:40}}>
              <div>
                <p style={{fontSize:14,color:T.gray6,lineHeight:1.7,marginBottom:10}}>At B&H B2B we still believe in the personal touch. Each B2B customer gets assigned a personal Account Team, ensuring that a "live" agent will be available to assist you with your RFQs, purchasing and customer service needs from A to Z.</p>
                <p style={{fontSize:14,color:T.gray5,lineHeight:1.7}}>We stock the widest selection of security, IT, multimedia, optics and A/V presentation gear anywhere… which makes us a true one-stop shop for your organization.</p>
              </div>
              <div style={{background:T.gray2,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🏬</div>
            </div>

            <div style={{borderTop:`2px solid ${T.gray2}`,paddingTop:32}}>
              <h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:18,fontWeight:700,color:T.green,marginBottom:6}}>Send Us a Message or Upload a PO</h3>
              <p style={{fontSize:14,color:T.gray5,marginBottom:20}}>Help us put you in touch with the right team for you.</p>
              <div style={{display:"flex",gap:0,marginBottom:24}}>
                {[{label:"Business",sub:"For-profit enterprise"},{label:"Gov/Edu",sub:"Non-Profit, government agency, higher education or K-12"}].map((tab,i)=>(
                  <div key={tab.label} style={{flex:1,border:`1px solid ${T.gray3}`,padding:"12px 16px",background:i===0?T.gray1:T.white,cursor:"pointer"}}>
                    <div style={{fontWeight:700,fontSize:14,color:T.gray6}}>{tab.label}</div>
                    <div style={{fontSize:12,color:T.gray5}}>{tab.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{background:T.white,border:`1px solid ${T.gray2}`,borderRadius:8,padding:24}}>
                <p style={{fontSize:14,fontWeight:600,color:T.gray6,marginBottom:20}}>Tell us more about your organization so we can direct you to the right team.</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {["Email","Subject","First Name","Message","Last Name","Phone"].map(f=>(
                    <div key={f} style={{gridColumn:f==="Message"?"1 / -1":undefined}}>
                      <label style={{fontSize:12,fontWeight:700,color:T.gray5,display:"block",marginBottom:5}}>{f} *</label>
                      {f==="Message"
                        ? <textarea rows={4} style={{width:"100%",border:`1px solid ${T.gray3}`,borderRadius:5,padding:"8px 10px",fontSize:13,resize:"vertical"}}/>
                        : <input style={{width:"100%",border:`1px solid ${T.gray3}`,borderRadius:5,padding:"8px 10px",fontSize:13}}/>
                      }
                    </div>
                  ))}
                </div>
                <button style={{marginTop:20,background:T.scarlet,color:T.white,border:"none",padding:"12px 32px",borderRadius:4,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <HubFooter config={c}/>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
function HubFooter({config:c}){
  return(
    <footer style={{background:T.white,borderTop:`1px solid ${T.gray2}`,padding:"28px 24px",marginTop:40}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div style={{fontSize:12,color:T.gray5,lineHeight:2}}>
          <div>© 2000-2026 B & H Foto & Electronics Corp. 420 9th Ave, New York, NY 10001</div>
          <div style={{display:"flex",gap:14,marginTop:4}}>
            {["Privacy & Security","User Agreement & Disclaimer","Export Policy","Site Map"].map(l=><span key={l} style={{color:T.bond,cursor:"pointer"}}>{l}</span>)}
          </div>
        </div>
        <div style={{fontSize:12,color:T.gray5,textAlign:"right"}}>
          <div>We close every Friday afternoon to Saturday evening for Shabbat.</div>
          <div style={{color:T.bond,cursor:"pointer",marginTop:4}}>Weekend Hours</div>
        </div>
      </div>
    </footer>
  );
}

function StepHeader({step,total,title,subtitle,onBack}){
  return(
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:T.gray4,cursor:"pointer",fontSize:13}}>← Back</button>
        <div style={{flex:1,height:4,background:T.gray2,borderRadius:2,overflow:"hidden"}}>
          <div style={{width:`${(step/total)*100}%`,height:"100%",background:T.scarlet,borderRadius:2,transition:"width .3s"}}/>
        </div>
        <span style={{fontSize:12,color:T.gray4,fontWeight:600}}>Step {step} of {total}</span>
      </div>
      <h2 style={{fontFamily:"Montserrat,sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>{title}</h2>
      <p style={{color:T.gray5,fontSize:14}}>{subtitle}</p>
    </div>
  );
}

function FormField({label,value,onChange,placeholder,type="text"}){
  return(
    <div>
      <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:6}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"11px 12px",border:`1.5px solid ${T.gray3}`,borderRadius:7,fontSize:14,outline:"none",fontFamily:"Open Sans,sans-serif"}} onFocus={e=>e.target.style.borderColor=T.scarlet} onBlur={e=>e.target.style.borderColor=T.gray3}/>
    </div>
  );
}

function EditField({label,value,onChange,multiline,hint}){
  return(
    <div style={{marginBottom:18}}>
      <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:5}}>{label}</label>
      {hint&&<div style={{fontSize:11,color:T.gray4,marginBottom:6}}>{hint}</div>}
      {multiline
        ?<textarea value={value||""} onChange={e=>onChange(e.target.value)} rows={3} style={{width:"100%",border:`1.5px solid ${T.gray3}`,borderRadius:7,padding:"10px 12px",fontSize:14,resize:"vertical",fontFamily:"Open Sans,sans-serif",outline:"none"}} onFocus={e=>e.target.style.borderColor=T.scarlet} onBlur={e=>e.target.style.borderColor=T.gray3}/>
        :<input value={value||""} onChange={e=>onChange(e.target.value)} style={{width:"100%",border:`1.5px solid ${T.gray3}`,borderRadius:7,padding:"10px 12px",fontSize:14,fontFamily:"Open Sans,sans-serif",outline:"none"}} onFocus={e=>e.target.style.borderColor=T.scarlet} onBlur={e=>e.target.style.borderColor=T.gray3}/>
      }
    </div>
  );
}

function SectionTitle({children}){
  return<h3 style={{fontFamily:"Montserrat,sans-serif",fontSize:17,fontWeight:700,marginBottom:20,color:T.gray6}}>{children}</h3>;
}

// ─── Admin View ───────────────────────────────────────────────────────────────
function AdminView({config,liveConfig,onChange,adminTab,setAdminTab,jsonText,jsonError,onJsonChange,currentUser,onPublishOrSubmit,hasUnsaved,activeSection,setActiveSection,onGoSegment,onGoContract}){
  const hubSections=[
    {id:"hero",label:"Hero",icon:"🎯"},{id:"signup",label:"Sign-Up Form",icon:"📝"},
    {id:"segments",label:"Segments",icon:"🏷"},{id:"contracts",label:"Contracts",icon:"📋"},
    {id:"errors",label:"Error States",icon:"⚠️"},{id:"footer",label:"Footer",icon:"📌"},
  ];
  const segSections=Object.keys(config.segmentPages).map(id=>({id:`seg_${id}`,label:config.segments[id]?.name||id,icon:config.signupForm.orgTypes.find(ot=>ot.segment===id)?.icon||"🏢"}));
  const ctrSections=Object.keys(config.contractPages).map(id=>{const ct=config.contracts.find(c=>c.id===id);return{id:`ctr_${id}`,label:ct?.name||id,icon:"📄"};});
  const allSections=[...hubSections,...segSections,...ctrSections];
  const currentLabel=allSections.find(s=>s.id===activeSection)?.label||activeSection;

  const SGroup=({label,items})=>(
    <div style={{marginBottom:4}}>
      <div style={{background:T.gray1,padding:"7px 14px",fontSize:10,fontWeight:700,color:T.gray4,letterSpacing:1,textTransform:"uppercase"}}>{label}</div>
      {items.map(s=>(
        <button key={s.id} onClick={()=>{setActiveSection(s.id);setAdminTab("form");}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",background:activeSection===s.id&&adminTab==="form"?T.scarletLight:"transparent",border:"none",borderBottom:`1px solid ${T.gray1}`,cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:activeSection===s.id?700:500,color:activeSection===s.id?T.scarlet:T.gray5}}>
          <span style={{fontSize:12}}>{s.icon}</span>{s.label}
        </button>
      ))}
    </div>
  );

  return(
    <div style={{maxWidth:1280,margin:"0 auto",padding:"28px 24px",display:"flex",gap:24}}>
      {/* Sidebar */}
      <div style={{width:220,flexShrink:0}}>
        <div style={{background:T.white,borderRadius:10,border:`1px solid ${T.gray2}`,overflow:"hidden",marginBottom:10}}>
          <SGroup label="Hub Home" items={hubSections}/>
          <SGroup label="Segment Pages" items={segSections}/>
          <SGroup label="Contract Pages" items={ctrSections}/>
        </div>
        <div style={{background:T.white,borderRadius:10,border:`1px solid ${T.gray2}`,overflow:"hidden",marginBottom:10}}>
          <button onClick={()=>setAdminTab("json")} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"11px 14px",background:adminTab==="json"?T.scarletLight:"transparent",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:adminTab==="json"?700:500,color:adminTab==="json"?T.scarlet:T.gray5}}>
            <span>{"{}"}</span> Full JSON Editor
          </button>
        </div>
        <div style={{background:T.white,borderRadius:10,border:`1px solid ${T.gray2}`,padding:14}}>
          <div style={{fontSize:10,fontWeight:700,color:T.gray4,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Live Config</div>
          <div style={{fontSize:11,color:T.gray5}}><strong>Version:</strong> {liveConfig.meta.version}</div>
          <div style={{fontSize:11,color:T.gray5,marginTop:4}}><strong>By:</strong> {liveConfig.meta.lastUpdatedBy}</div>
          <div style={{fontSize:11,color:T.gray5,marginTop:4}}><strong>At:</strong> {fmtTs(liveConfig.meta.lastUpdatedAt)}</div>
        </div>
      </div>
      {/* Main */}
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:12,background:T.white,border:`1px solid ${T.gray2}`,borderBottom:"none",borderRadius:"10px 10px 0 0",padding:"10px 18px"}}>
          <div style={{fontSize:13,fontWeight:700,color:adminTab==="json"?T.gray5:T.scarlet,flex:1}}>
            {adminTab!=="json"?`✏️ Editing: ${currentLabel}`:"{ } Raw JSON"}
          </div>
          {hasUnsaved&&<span style={{fontSize:12,background:"#fff3cd",color:"#856404",padding:"3px 8px",borderRadius:4,fontWeight:600}}>● Unsaved changes</span>}
          <div style={{fontSize:12,color:T.gray4}}>{currentUser.canDirectPublish?"🟢 Direct publish":"📋 Submit for approval"}</div>
          <button onClick={onPublishOrSubmit} disabled={!hasUnsaved} style={{background:hasUnsaved?(currentUser.canDirectPublish?T.green:T.bond):T.gray3,color:T.white,border:"none",padding:"8px 18px",borderRadius:6,fontWeight:700,fontSize:13,cursor:hasUnsaved?"pointer":"not-allowed"}}>
            {currentUser.canDirectPublish?"⬆ Publish Live":"⬆ Submit for Approval"}
          </button>
        </div>
        <div style={{background:T.white,border:`1px solid ${T.gray2}`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:28,minHeight:500}}>
          {adminTab==="json"?(
            <div>
              <div style={{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:13,color:T.gray5}}>Edit JSON directly. Changes sync to form editors in real-time.</div>
                {jsonError&&<span style={{fontSize:12,color:T.scarlet,background:T.scarletLight,padding:"4px 10px",borderRadius:4,fontWeight:600}}>JSON Error: {jsonError}</span>}
              </div>
              <textarea value={jsonText} onChange={e=>onJsonChange(e.target.value)} style={{width:"100%",height:580,fontFamily:"\'Courier New\',monospace",fontSize:12,border:`1.5px solid ${jsonError?T.scarlet:T.gray3}`,borderRadius:8,padding:16,resize:"vertical",outline:"none",lineHeight:1.5,color:T.gray6,background:"#fafafa"}}/>
            </div>
          ):(
            <SectionEditor section={activeSection} config={config} onChange={onChange} onGoSegment={onGoSegment} onGoContract={onGoContract}/>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section Editor ───────────────────────────────────────────────────────────
function SectionEditor({section,config,onChange,onGoSegment,onGoContract}){
  if(section==="hero")return(
    <div>
      <SectionTitle>Hero Section</SectionTitle>
      <ImageUploadField label="Hero Background Image" value={config.hero.heroImageUrl||""} onChange={v=>onChange(d=>{d.hero.heroImageUrl=v;})} hint="Full-width background photo for the hub home banner. Falls back to scarlet gradient if empty."/>
      <EditField label="Headline"     value={config.hero.headline}    onChange={v=>onChange(d=>{d.hero.headline=v;})}    hint="Main banner headline"/>
      <EditField label="Subheadline"  value={config.hero.subheadline} onChange={v=>onChange(d=>{d.hero.subheadline=v;})} multiline/>
      <EditField label="Badge Text"   value={config.hero.badge}       onChange={v=>onChange(d=>{d.hero.badge=v;})}/>
      <EditField label="CTA Label"    value={config.hero.ctaLabel}    onChange={v=>onChange(d=>{d.hero.ctaLabel=v;})}    hint="Primary button text"/>
      <EditField label="CTA Sub-text" value={config.hero.ctaSubtext}  onChange={v=>onChange(d=>{d.hero.ctaSubtext=v;})} hint="Small text below CTA"/>
      <EditField label="Sign-Up URL"  value={config.hero.signupUrl||""} onChange={v=>onChange(d=>{d.hero.signupUrl=v;})} hint="URL for all hub Sign Up / Create Account buttons. Use the live B&H B2B registration URL."/>
    </div>
  );
  if(section==="signup")return(
    <div>
      <SectionTitle>Sign-Up Form</SectionTitle>
      <EditField label="Form Title"    value={config.signupForm.title}    onChange={v=>onChange(d=>{d.signupForm.title=v;})}/>
      <EditField label="Form Subtitle" value={config.signupForm.subtitle} onChange={v=>onChange(d=>{d.signupForm.subtitle=v;})} multiline/>
      <div style={{marginTop:20}}>
        <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:12}}>Organization Types</label>
        {config.signupForm.orgTypes.map((ot,i)=>(
          <div key={ot.id} style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,padding:"10px 12px",background:T.gray1,borderRadius:7,border:`1px solid ${T.gray2}`}}>
            <span style={{fontSize:18}}>{ot.icon}</span>
            <input value={ot.label} onChange={e=>onChange(d=>{d.signupForm.orgTypes[i].label=e.target.value;})} style={{flex:1,border:`1px solid ${T.gray3}`,borderRadius:5,padding:"7px 10px",fontSize:13}}/>
            <span style={{fontSize:11,color:T.gray4,background:T.bondLight,padding:"3px 8px",borderRadius:4}}>→ {ot.segment}</span>
          </div>
        ))}
      </div>
    </div>
  );
  if(section==="segments")return(
    <div>
      <SectionTitle>Segments</SectionTitle>
      {Object.entries(config.segments).map(([key,seg])=>(
        <div key={key} style={{marginBottom:16,padding:16,border:`1.5px solid ${T.gray2}`,borderRadius:10,borderLeft:`4px solid ${seg.color}`}}>
          <div style={{display:"flex",gap:12,marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:T.white,background:seg.color,padding:"4px 10px",borderRadius:4}}>{key}</div>
            <input value={seg.name}  onChange={e=>onChange(d=>{d.segments[key].name=e.target.value;})}  style={{flex:1,border:`1px solid ${T.gray3}`,borderRadius:5,padding:"6px 10px",fontSize:13,fontWeight:600}}/>
            <input value={seg.color} onChange={e=>onChange(d=>{d.segments[key].color=e.target.value;})} style={{width:90,border:`1px solid ${T.gray3}`,borderRadius:5,padding:"6px 10px",fontSize:12}}/>
          </div>
          <textarea value={seg.description} onChange={e=>onChange(d=>{d.segments[key].description=e.target.value;})} rows={2} style={{width:"100%",border:`1px solid ${T.gray3}`,borderRadius:5,padding:"7px 10px",fontSize:13,resize:"vertical"}}/>
        </div>
      ))}
    </div>
  );
  if(section==="contracts")return(
    <div>
      <SectionTitle>Cooperative Contracts</SectionTitle>
      {config.contracts.map((ct,i)=>(
        <div key={ct.id} style={{marginBottom:16,padding:18,border:`1.5px solid ${ct.active?T.green:T.gray3}`,borderRadius:10,background:ct.active?T.white:T.gray1}}>
          <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center"}}>
            <span style={{background:ct.active?T.green:T.gray4,color:T.white,fontSize:10,padding:"3px 8px",borderRadius:4,fontWeight:700}}>{ct.active?"ACTIVE":"INACTIVE"}</span>
            <input value={ct.name}           onChange={e=>onChange(d=>{d.contracts[i].name=e.target.value;})}           style={{flex:1,border:`1px solid ${T.gray3}`,borderRadius:5,padding:"7px 10px",fontSize:13,fontWeight:600}}/>
            <input value={ct.contractNumber} onChange={e=>onChange(d=>{d.contracts[i].contractNumber=e.target.value;})} style={{width:110,border:`1px solid ${T.gray3}`,borderRadius:5,padding:"7px 10px",fontSize:12}} placeholder="Contract #"/>
            <input value={ct.logoLabel}      onChange={e=>onChange(d=>{d.contracts[i].logoLabel=e.target.value;})}      style={{width:90,border:`1px solid ${T.gray3}`,borderRadius:5,padding:"7px 10px",fontSize:12}} placeholder="Label"/>
            <button onClick={()=>onChange(d=>{d.contracts[i].active=!d.contracts[i].active;})} style={{background:ct.active?T.scarletLight:T.greenLight,border:"none",padding:"6px 12px",borderRadius:5,cursor:"pointer",fontSize:12,fontWeight:600,color:ct.active?T.scarlet:T.green}}>
              {ct.active?"Deactivate":"Activate"}
            </button>
          </div>
          <textarea value={ct.description} onChange={e=>onChange(d=>{d.contracts[i].description=e.target.value;})} rows={2} style={{width:"100%",border:`1px solid ${T.gray3}`,borderRadius:5,padding:"7px 10px",fontSize:13,resize:"vertical",marginBottom:8}}/>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4}}>Logo Image</div>
            <label style={{display:"inline-flex",alignItems:"center",gap:6,background:T.bondLight,color:T.bond,border:`1px solid ${T.bond}`,borderRadius:4,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              📁 Upload Logo
              <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                const file=e.target.files[0];
                if(!file)return;
                const reader=new FileReader();
                reader.onload=ev=>onChange(d=>{d.contracts[i].logoUrl=ev.target.result;});
                reader.readAsDataURL(file);
              }}/>
            </label>
            {ct.logoUrl?(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <img src={ct.logoUrl} alt={ct.logoLabel} style={{maxHeight:24,maxWidth:80,objectFit:"contain"}}/>
                <button onClick={()=>onChange(d=>{d.contracts[i].logoUrl="";})} style={{background:"none",border:"none",color:T.scarlet,cursor:"pointer",fontSize:11,fontWeight:700}}>✕ Remove</button>
              </div>
            ):(
              <span style={{fontSize:11,color:T.gray4}}>No image — showing text label "{ct.logoLabel}"</span>
            )}
          </div>
          <div style={{fontSize:11,color:T.gray4}}>Segments: {ct.segments.join(", ")}</div>
        </div>
      ))}
    </div>
  );
  if(section==="errors")return(
    <div>
      <SectionTitle>Error States</SectionTitle>
      {Object.entries(config.errorStates).map(([key,err])=>(
        <div key={key} style={{marginBottom:18,padding:18,border:"1.5px solid #ffc107",borderRadius:10,background:"#fffdf0"}}>
          <div style={{background:T.orange,color:T.white,fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:4,display:"inline-block",marginBottom:12}}>{key.toUpperCase()}</div>
          <EditField label="Customer-facing message" value={err.message} onChange={v=>onChange(d=>{d.errorStates[key].message=v;})}/>
          <EditField label="CTA Button Label"        value={err.cta}     onChange={v=>onChange(d=>{d.errorStates[key].cta=v;})}/>
        </div>
      ))}
    </div>
  );
  if(section==="footer")return(
    <div>
      <SectionTitle>Footer</SectionTitle>
      <EditField label="Contact Email"        value={config.footer.contactEmail} onChange={v=>onChange(d=>{d.footer.contactEmail=v;})}/>
      <EditField label="Representative Phone" value={config.footer.repPhone}     onChange={v=>onChange(d=>{d.footer.repPhone=v;})}/>
      <EditField label="Footer Tagline"       value={config.footer.tagline}      onChange={v=>onChange(d=>{d.footer.tagline=v;})}/>
    </div>
  );
  // Segment page editor
  if(section.startsWith("seg_")){
    const segId=section.replace("seg_","");
    const sp=config.segmentPages[segId];
    if(!sp)return null;
    return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <SectionTitle>{config.segments[segId]?.name} — Segment Page</SectionTitle>
          <button onClick={()=>onGoSegment(segId)} style={{background:T.bondLight,color:T.bond,border:"none",padding:"8px 14px",borderRadius:6,fontWeight:700,fontSize:12,cursor:"pointer"}}>👁 Preview Page →</button>
        </div>
        <ImageUploadField label="Hero Banner Image" value={sp.heroImageUrl||""} onChange={v=>onChange(d=>{d.segmentPages[segId].heroImageUrl=v;})} hint="Background photo for this segment's hero banner. Falls back to the segment color gradient."/>
        <EditField label="Sign-Up URL"           value={sp.signupUrl||""}      onChange={v=>onChange(d=>{d.segmentPages[segId].signupUrl=v;})}    hint="URL for all Sign Up buttons on this segment page."/>
        <EditField label="Page Headline"         value={sp.headline}           onChange={v=>onChange(d=>{d.segmentPages[segId].headline=v;})}/>
        <EditField label="Intro"                 value={sp.intro}              onChange={v=>onChange(d=>{d.segmentPages[segId].intro=v;})}       multiline/>
        <EditField label="Sub-intro"             value={sp.subIntro}           onChange={v=>onChange(d=>{d.segmentPages[segId].subIntro=v;})}     multiline/>
        <EditField label="Sign-up Banner Title"  value={sp.signupBannerTitle}  onChange={v=>onChange(d=>{d.segmentPages[segId].signupBannerTitle=v;})}/>
        <EditField label="Sign-up Banner Body"   value={sp.signupBannerBody}   onChange={v=>onChange(d=>{d.segmentPages[segId].signupBannerBody=v;})}  multiline/>
        <EditField label="Featured Section Title" value={sp.featuredTitle}     onChange={v=>onChange(d=>{d.segmentPages[segId].featuredTitle=v;})}/>
        <EditField label="Featured Section Body" value={sp.featuredBody}       onChange={v=>onChange(d=>{d.segmentPages[segId].featuredBody=v;})}  multiline/>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:8}}>Featured Benefits (one per line)</label>
          <textarea value={(sp.featuredBenefits||[]).join("\n")} onChange={e=>onChange(d=>{d.segmentPages[segId].featuredBenefits=e.target.value.split("\n").filter(Boolean);})} rows={5} style={{width:"100%",border:`1.5px solid ${T.gray3}`,borderRadius:7,padding:"10px 12px",fontSize:13,resize:"vertical",fontFamily:"Open Sans,sans-serif"}}/>
        </div>
        <EditField label="Sign-up CTA"      value={sp.featuredSignupCta}    onChange={v=>onChange(d=>{d.segmentPages[segId].featuredSignupCta=v;})}/>
        <EditField label="Learn More CTA"   value={sp.featuredLearnMoreCta} onChange={v=>onChange(d=>{d.segmentPages[segId].featuredLearnMoreCta=v;})}/>
        <EditField label="Phone Number"     value={sp.phoneNumber}          onChange={v=>onChange(d=>{d.segmentPages[segId].phoneNumber=v;})}/>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:6}}>Featured Contract</label>
          <select value={sp.featuredContractId||""} onChange={e=>onChange(d=>{d.segmentPages[segId].featuredContractId=e.target.value||null;})} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.gray3}`,borderRadius:7,fontSize:14,background:T.white}}>
            <option value="">— None —</option>
            {config.contracts.map(ct=><option key={ct.id} value={ct.id}>{ct.name}</option>)}
          </select>
        </div>
        <EditField label="Other Contracts Sidebar Title" value={sp.otherContractsTitle} onChange={v=>onChange(d=>{d.segmentPages[segId].otherContractsTitle=v;})}/>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:6}}>Other Contract IDs (comma-separated)</label>
          <input value={(sp.otherContractIds||[]).join(",")} onChange={e=>onChange(d=>{d.segmentPages[segId].otherContractIds=e.target.value.split(",").map(s=>s.trim()).filter(Boolean);})} style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${T.gray3}`,borderRadius:7,fontSize:13,fontFamily:"monospace"}} placeholder="equalis,ei,omnia"/>
          <div style={{fontSize:11,color:T.gray4,marginTop:4}}>IDs: {config.contracts.map(c=>c.id).join(", ")}</div>
        </div>
        <div style={{display:"flex",gap:20,marginBottom:18}}>
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer"}}>
            <input type="checkbox" checked={!!sp.showOrgTypeFilter} onChange={e=>onChange(d=>{d.segmentPages[segId].showOrgTypeFilter=e.target.checked;})}/>Show org type filter in hero
          </label>
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer"}}>
            <input type="checkbox" checked={!!sp.showStateFilter} onChange={e=>onChange(d=>{d.segmentPages[segId].showStateFilter=e.target.checked;})}/>Show state filter in sidebar
          </label>
        </div>
      </div>
    );
  }
  // Contract page editor
  if(section.startsWith("ctr_")){
    const ctrId=section.replace("ctr_","");
    const cp=config.contractPages[ctrId];
    const ct=config.contracts.find(c=>c.id===ctrId);
    if(!cp)return null;
    return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <SectionTitle>{ct?.name} — Contract Page</SectionTitle>
          <button onClick={()=>onGoContract(ctrId)} style={{background:T.bondLight,color:T.bond,border:"none",padding:"8px 14px",borderRadius:6,fontWeight:700,fontSize:12,cursor:"pointer"}}>👁 Preview Page →</button>
        </div>
        <ImageUploadField label="Hero Banner Image" value={cp.heroImageUrl||""} onChange={v=>onChange(d=>{d.contractPages[ctrId].heroImageUrl=v;})} hint="Background photo for this contract portal's hero banner. Falls back to dark blue gradient."/>
        <EditField label="Sign-Up URL"       value={cp.signupUrl||""}   onChange={v=>onChange(d=>{d.contractPages[ctrId].signupUrl=v;})}    hint="URL for the Sign Up button on this contract portal page."/>
        <EditField label="Page Headline"     value={cp.headline}    onChange={v=>onChange(d=>{d.contractPages[ctrId].headline=v;})}    hint="Shown in hero banner"/>
        <EditField label="Section Heading"   value={cp.subheadline} onChange={v=>onChange(d=>{d.contractPages[ctrId].subheadline=v;})}/>
        <EditField label="Description Blurb" value={cp.blurb}       onChange={v=>onChange(d=>{d.contractPages[ctrId].blurb=v;})}       multiline/>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:8}}>Benefits (one per line)</label>
          <textarea value={(cp.benefits||[]).join("\n")} onChange={e=>onChange(d=>{d.contractPages[ctrId].benefits=e.target.value.split("\n").filter(Boolean);})} rows={6} style={{width:"100%",border:`1.5px solid ${T.gray3}`,borderRadius:7,padding:"10px 12px",fontSize:13,resize:"vertical",fontFamily:"Open Sans,sans-serif"}}/>
        </div>
        <EditField label="Sign-up CTA"            value={cp.signupCta}      onChange={v=>onChange(d=>{d.contractPages[ctrId].signupCta=v;})}/>
        <EditField label="Contract Info CTA"       value={cp.contractInfoCta} onChange={v=>onChange(d=>{d.contractPages[ctrId].contractInfoCta=v;})}/>
        <EditField label="Promo Section Title"     value={cp.promoTitle}     onChange={v=>onChange(d=>{d.contractPages[ctrId].promoTitle=v;})}/>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:12,fontWeight:700,color:T.gray5,textTransform:"uppercase",letterSpacing:.4,display:"block",marginBottom:8}}>Promo Bullets (one per line)</label>
          <textarea value={(cp.promoBullets||[]).join("\n")} onChange={e=>onChange(d=>{d.contractPages[ctrId].promoBullets=e.target.value.split("\n").filter(Boolean);})} rows={4} style={{width:"100%",border:`1.5px solid ${T.gray3}`,borderRadius:7,padding:"10px 12px",fontSize:13,resize:"vertical",fontFamily:"Open Sans,sans-serif"}}/>
        </div>
      </div>
    );
  }
  return null;
}

// ─── Approvals View ───────────────────────────────────────────────────────────
function ApprovalsView({pendingChanges,liveConfig,currentUser,onApprove,onReject}){
  const pending=pendingChanges.filter(c=>c.status==="pending");
  const resolved=pendingChanges.filter(c=>c.status!=="pending");
  const isAriel=currentUser.canDirectPublish;
  return(
    <div style={{maxWidth:920,margin:"0 auto",padding:"28px 24px"}}>
      <div style={{marginBottom:24}}>
        <h2 style={{fontFamily:"Montserrat,sans-serif",fontSize:22,fontWeight:800,marginBottom:6}}>{isAriel?"Approval Queue":"Pending Submissions"}</h2>
        <p style={{fontSize:14,color:T.gray5}}>{isAriel?"As Ariel Goldman, you can approve or reject proposed changes. Approved changes go live immediately.":"Changes you submit go to Ariel Goldman for review before going live."}</p>
      </div>
      <div style={{background:T.bondLight,border:`1px solid ${T.bond}`,borderRadius:10,padding:"14px 18px",marginBottom:24,display:"flex",gap:16}}>
        <span style={{fontSize:22}}>ℹ️</span>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:T.bond,marginBottom:4}}>One-Layer Approval Model</div>
          <div style={{fontSize:13,color:"#444",lineHeight:1.6}}>
            <strong>Ariel Goldman</strong> can publish directly — no approval required.<br/>
            <strong>All other admins</strong> submit changes that Ariel must approve before going live.<br/>
            <strong>Scope:</strong> All Hub Home, Segment Page, and Contract Page content.
          </div>
        </div>
      </div>
      {pending.length>0?(
        <div style={{marginBottom:32}}>
          <div style={{fontSize:11,fontWeight:700,color:T.orange,letterSpacing:1,textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{background:T.orange,color:T.white,borderRadius:"50%",width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{pending.length}</span>
            Awaiting Approval
          </div>
          {pending.map(c=><ChangeCard key={c.id} change={c} isAriel={isAriel} onApprove={onApprove} onReject={onReject} liveConfig={liveConfig}/>)}
        </div>
      ):(
        <div style={{background:T.greenLight,border:`1px solid ${T.green}`,borderRadius:10,padding:"20px 24px",marginBottom:24,textAlign:"center",color:T.green,fontWeight:600}}>✓ No pending approvals — hub is fully up to date.</div>
      )}
      {resolved.length>0&&(
        <div>
          <div style={{fontSize:11,fontWeight:700,color:T.gray4,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Recently Resolved</div>
          {resolved.map(c=><ChangeCard key={c.id} change={c} isAriel={isAriel} onApprove={onApprove} onReject={onReject} liveConfig={liveConfig} resolved/>)}
        </div>
      )}
    </div>
  );
}

function ChangeCard({change,isAriel,onApprove,onReject,resolved}){
  const [expanded,setExpanded]=useState(false);
  const statusColor={pending:T.orange,approved:T.green,rejected:T.scarlet}[change.status];
  return(
    <div style={{background:T.white,border:`1.5px solid ${resolved?T.gray2:"#ffc107"}`,borderRadius:10,marginBottom:14,overflow:"hidden"}}>
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:36,height:36,background:T.gray1,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:T.gray5}}>
          {change.submittedBy.split(" ").map(n=>n[0]).join("")}
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:2}}>Submitted by <span style={{color:T.bond}}>{change.submittedBy}</span></div>
          <div style={{fontSize:12,color:T.gray4}}>{fmtTs(change.submittedAt)} · {change.diff.length} field{change.diff.length!==1?"s":""} changed</div>
        </div>
        <span style={{background:statusColor,color:T.white,fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:4,textTransform:"uppercase"}}>{change.status}</span>
        <button onClick={()=>setExpanded(e=>!e)} style={{background:T.gray1,border:"none",padding:"6px 12px",borderRadius:5,cursor:"pointer",fontSize:12,fontWeight:600,color:T.gray5}}>{expanded?"Hide diff ↑":"Show diff ↓"}</button>
        {isAriel&&change.status==="pending"&&(
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>onApprove(change.id)} style={{background:T.green,color:T.white,border:"none",padding:"8px 16px",borderRadius:6,fontWeight:700,fontSize:13,cursor:"pointer"}}>✓ Approve</button>
            <button onClick={()=>onReject(change.id)}  style={{background:T.scarletLight,color:T.scarlet,border:"none",padding:"8px 16px",borderRadius:6,fontWeight:700,fontSize:13,cursor:"pointer"}}>✗ Reject</button>
          </div>
        )}
      </div>
      {expanded&&(
        <div style={{borderTop:`1px solid ${T.gray1}`,padding:"14px 20px",background:T.gray1}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gray4,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Changed Fields</div>
          {change.diff.map((d,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"240px 1fr 1fr",gap:10,marginBottom:8,fontSize:12}}>
              <span style={{color:T.gray5,fontWeight:600,fontFamily:"monospace",fontSize:11}}>{d.path}</span>
              <span style={{background:"#fee",padding:"4px 8px",borderRadius:4,color:"#c00"}}>− {truncate(d.before)}</span>
              <span style={{background:"#efe",padding:"4px 8px",borderRadius:4,color:"#060"}}>+ {truncate(d.after)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
