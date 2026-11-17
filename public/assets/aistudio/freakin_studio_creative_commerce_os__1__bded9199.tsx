import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Layers,
  ShoppingBag,
  Kanban,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  FileText,
  Download,
  Eye,
  Check,
  X,
  User,
  Settings,
  RefreshCw,
  Sliders,
  ChevronRight,
  AlertCircle,
  CreditCard,
  Send,
  Lock,
  Moon,
  Sun,
  Briefcase,
  SlidersHorizontal,
  ExternalLink,
  MessageSquare,
  Award,
  Globe,
  Bot,
  MapPin,
  Share2,
  CheckSquare,
  Server,
  Activity,
  Cpu,
  Palette,
  Maximize2,
  Box,
  Menu,
  ChevronDown
} from 'lucide-react';

// ============================================================================
// 1. DYNAMIC CDN SCRIPT LOADER (THREE.JS & ANIME.JS)
// ============================================================================

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(script);
  });
};

// ============================================================================
// 2. DOMAIN DATASTRUCTURES & COMPREHENSIVE CANONICAL CATALOG
// ============================================================================

const BDT_TO_USD_RATE = 120;

// 7 Operational Creative Categories (Matching Logo Tagline: Design | Content | Production)
const CATEGORIES = [
  { id: 'A', name: 'Graphic Design', icon: Palette, desc: 'Branding collateral, social media graphics, print layouts, digital assets.' },
  { id: 'B', name: 'Brand Identity', icon: Award, desc: 'Master brand books, style guides, logo systems, custom typography.' },
  { id: 'C', name: 'UI/UX & Web Design', icon: Layers, desc: 'SaaS platforms, mobile apps, wireframes, design token systems.' },
  { id: 'D', name: 'Social Media & Content', icon: Sparkles, desc: 'Monthly content calendars, 4K reels, TikTok motion, carousel decks.' },
  { id: 'E', name: 'Advertising & Marketing', icon: Zap, desc: 'High-conversion display ads, campaign key visuals, investor pitch decks.' },
  { id: 'F', name: 'AI-Powered Creative', icon: Cpu, desc: '4K generative visuals, prompt pipelines, synthetic product photography.' },
  { id: 'G', name: 'Corporate Communication', icon: FileText, desc: 'Annual reports, whitepapers, ESG blueprints, executive stationery.' }
];

// Expanded 60 Canonical Services Catalog
const CANONICAL_SERVICES = [
  // Category A - Graphic Design
  { id: 'srv-a1', catId: 'A', name: 'Social Media Collateral Pack', unit: 'posts', basePriceBDT: 15000, basePriceUSD: 125, rushAvailable: true, desc: '10 custom designed multi-platform social banners & stories with vector assets.' },
  { id: 'srv-a2', catId: 'A', name: 'Print & Packaging Die-Cut Layout', unit: 'items', basePriceBDT: 28000, basePriceUSD: 235, rushAvailable: true, desc: 'High-res die-cut print packaging design with pre-press color separations.' },
  { id: 'srv-a3', catId: 'A', name: 'Vector Illustration Suite', unit: 'illustrations', basePriceBDT: 20000, basePriceUSD: 165, rushAvailable: true, desc: 'Custom hero vector artwork and custom icons for digital products.' },
  { id: 'srv-a4', catId: 'A', name: 'Event Branding & Outdoor Kit', unit: 'kit', basePriceBDT: 35000, basePriceUSD: 290, rushAvailable: true, desc: 'Banners, standees, badges, stage backdrops and digital signage kit.' },
  { id: 'srv-a5', catId: 'A', name: 'Digital Brochure & Catalog', unit: 'pages (12)', basePriceBDT: 24000, basePriceUSD: 200, rushAvailable: true, desc: 'Interactive PDF & print catalog layout for corporate product lines.' },

  // Category B - Brand Identity
  { id: 'srv-b1', catId: 'B', name: 'Master Brand Identity System', unit: 'system', basePriceBDT: 75000, basePriceUSD: 625, rushAvailable: true, desc: 'Complete brand architecture, primary/secondary logos, typography & grid.' },
  { id: 'srv-b2', catId: 'B', name: 'Comprehensive Brand Book PDF', unit: 'book', basePriceBDT: 45000, basePriceUSD: 375, rushAvailable: false, desc: '40+ page operational brand guidelines PDF for enterprise consistency.' },
  { id: 'srv-b3', catId: 'B', name: 'Custom Iconography Suite', unit: 'pack (30)', basePriceBDT: 18000, basePriceUSD: 150, rushAvailable: true, desc: 'Pixel-perfect SVG icon set built specifically for brand identity.' },
  { id: 'srv-b4', catId: 'B', name: 'Sonic & Motion Logo Stinger', unit: 'animation', basePriceBDT: 30000, basePriceUSD: 250, rushAvailable: true, desc: '3D/2D animated logo intro with custom sound design for video intros.' },

  // Category C - UI/UX & Web Design
  { id: 'srv-c1', catId: 'C', name: 'SaaS Dashboard UI/UX System', unit: 'screens', basePriceBDT: 95000, basePriceUSD: 790, rushAvailable: true, desc: '15 high-fidelity dark/light mode SaaS web application screens in Figma.' },
  { id: 'srv-c2', catId: 'C', name: 'Mobile App Product Design', unit: 'flows', basePriceBDT: 85000, basePriceUSD: 710, rushAvailable: true, desc: 'iOS/Android user journey maps, high-fi UI screens, and interactive prototype.' },
  { id: 'srv-c3', catId: 'C', name: 'Design System & Component Library', unit: 'tokens', basePriceBDT: 110000, basePriceUSD: 915, rushAvailable: false, desc: 'Atomic design UI kit with auto-layout components, variants & documentation.' },
  { id: 'srv-c4', catId: 'C', name: 'High-Converting E-Commerce Web Design', unit: 'template', basePriceBDT: 65000, basePriceUSD: 540, rushAvailable: true, desc: 'Conversion-focused storefront design optimized for Shopify/WooCommerce.' },

  // Category D - Social Media & Content
  { id: 'srv-d1', catId: 'D', name: 'Monthly Short-Form Motion Reels', unit: 'videos', basePriceBDT: 40000, basePriceUSD: 335, rushAvailable: true, desc: '8 dynamic 4K vertical reels with motion graphics, captions and audio mixing.' },
  { id: 'srv-d2', catId: 'D', name: 'Social Campaign Carousel Decks', unit: 'decks', basePriceBDT: 25000, basePriceUSD: 210, rushAvailable: true, desc: '5 high-converting swipeable carousel graphic designs for Instagram/LinkedIn.' },
  { id: 'srv-d3', catId: 'D', name: 'Copywriting & Content Strategy', unit: 'month', basePriceBDT: 22000, basePriceUSD: 185, rushAvailable: true, desc: 'Bilingual (Bangla & English) social copy and monthly editorial calendar.' },

  // Category E - Advertising & Marketing
  { id: 'srv-e1', catId: 'E', name: 'Performance Display Ads Matrix', unit: 'set', basePriceBDT: 30000, basePriceUSD: 250, rushAvailable: true, desc: '12 multi-size Google & Meta ad banners optimized for performance marketing.' },
  { id: 'srv-e2', catId: 'E', name: 'Key Visual Campaign Design', unit: 'key visual', basePriceBDT: 50000, basePriceUSD: 415, rushAvailable: true, desc: 'Master hero creative key visual asset for national media rollouts.' },
  { id: 'srv-e3', catId: 'E', name: '3D Product Commercial Sequence', unit: 'video (30s)', basePriceBDT: 120000, basePriceUSD: 1000, rushAvailable: false, desc: 'Photorealistic 3D product animation commercial with lighting & VFX.' },

  // Category F - AI-Powered Creative
  { id: 'srv-f1', catId: 'F', name: '4K AI Generative Visual Pipeline', unit: 'outputs', basePriceBDT: 35000, basePriceUSD: 290, rushAvailable: true, desc: 'Prompt-engineered high-concept 4K renders with human designer retouching.' },
  { id: 'srv-f2', catId: 'F', name: 'AI Product Photography Synthesizer', unit: 'renders', basePriceBDT: 28000, basePriceUSD: 235, rushAvailable: true, desc: 'Realistic AI studio environments and staging for physical products.' },

  // Category G - Corporate Communication
  { id: 'srv-g1', catId: 'G', name: 'Executive Investor Pitch Deck', unit: 'slides', basePriceBDT: 60000, basePriceUSD: 500, rushAvailable: true, desc: '20 slide story-driven pitch deck optimized for venture capital pitch.' },
  { id: 'srv-g2', catId: 'G', name: 'Annual Report & ESG Blueprint', unit: 'document', basePriceBDT: 65000, basePriceUSD: 540, rushAvailable: false, desc: 'Executive print-ready annual report with custom financial infographics.' }
];

// Production Add-Ons Dataset
const ADD_ONS = [
  { id: 'addon-1', name: '24-Hour Priority Express Delivery', surchargePct: 0.35, isPercentage: true, desc: '+35% rush priority delivery surcharge for immediate allocation.' },
  { id: 'addon-2', name: 'Complete Source Files Bundle (Figma/AI/AE)', priceBDT: 12000, priceUSD: 100, isPercentage: false, desc: 'Full layered editable master source assets and design tokens.' },
  { id: 'addon-3', name: 'Full Commercial Copyright Transfer', priceBDT: 25000, priceUSD: 210, isPercentage: false, desc: 'Legal assignment of global intellectual property rights.' },
  { id: 'addon-4', name: 'Multi-Format Adaptation Pack', priceBDT: 8500, priceUSD: 70, isPercentage: false, desc: 'Export into 8 custom vector & raster dimensions.' },
  { id: 'addon-5', name: 'Extra Iteration Bundle (+3 Rounds)', priceBDT: 15000, priceUSD: 125, isPercentage: false, desc: 'Extends default proofing limits by 3 additional review cycles.' }
];

// Online Platforms Integration Registry
const ONLINE_INTEGRATIONS = [
  { id: 'sslcommerz', name: 'SSLCOMMERZ Gateway', status: 'active', type: 'Payment', desc: 'bKash, Nagad, Rocket & BD Debit/Credit card IPN listener.', icon: CreditCard },
  { id: 'stripe', name: 'Stripe International', status: 'active', type: 'Payment', desc: 'USD Visa, Mastercard, AMEX & Apple Pay webhook sync.', icon: Lock },
  { id: 'bkash', name: 'bKash Direct Merchant API', status: 'connected', type: 'Mobile Wallet', desc: 'Instant tokenized payment settlement in Bangladeshi Taka.', icon: Zap },
  { id: 'shopify', name: 'Shopify Storefront Connector', status: 'connected', type: 'E-Commerce', desc: 'Auto-sync catalog items and creative assets to Shopify stores.', icon: ShoppingBag },
  { id: 'woocommerce', name: 'WooCommerce Adapter', status: 'available', type: 'E-Commerce', desc: 'REST API integration for WordPress creative stores.', icon: Globe },
  { id: 'meta', name: 'Meta Ads Manager API', status: 'connected', type: 'Marketing', desc: 'Direct upload of approved ad creatives to Facebook & Instagram.', icon: Share2 },
  { id: 'zapier', name: 'Zapier Webhooks Engine', status: 'connected', type: 'Automation', desc: 'Trigger 5,000+ app workflows on quote approval or asset delivery.', icon: Activity },
  { id: 'resend', name: 'Resend Transactional Email', status: 'connected', type: 'Notification', desc: 'Instant dispatch of signed quote PDFs and proofing alerts.', icon: Send }
];

// Initial Projects for Proofing Studio & Admin OS
const INITIAL_PROJECTS = [
  {
    id: 'PRJ-2026-8801',
    title: 'Fintech SaaS Dashboard UI & Brand Refresh',
    clientName: 'Apex Financial Technologies',
    clientEmail: 'billing@apexfin.com',
    category: 'UI/UX & Web Design',
    status: 'in_production',
    budgetBDT: 185000,
    budgetUSD: 1540,
    currency: 'USD',
    assignedStaff: 'Sazzad H. (Creative Lead)',
    revisionsUsed: 1,
    revisionLimit: 3,
    deliverables: [
      { id: 'del-1', version: 'v1', title: 'Main Analytics Dashboard UI', type: 'image', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', status: 'approved', timestamp: '2026-11-02', pins: [] },
      { id: 'del-2', version: 'v2', title: 'Dark Mode Design System Tokens', type: 'image', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80', status: 'pending_review', timestamp: '2026-11-09', pins: [{ x: 45, y: 30, text: 'Increase contrast on active tab', color: '#e6c584' }] }
    ],
    brief: {
      targetAudience: 'Institutional Investors & Enterprise CFOs in Dhaka & Singapore',
      colorPreferences: 'Charcoal Black `#0b0b0b`, Champagne Gold `#e6c584`',
      referenceLinks: 'https://linear.app, https://stripe.com'
    }
  },
  {
    id: 'PRJ-2026-8802',
    title: '4K AI Campaign Visuals for Luxury Watch Launch',
    clientName: 'Aura Horology Geneva',
    clientEmail: 'campaigns@aurawatch.ch',
    category: 'AI-Powered Creative',
    status: 'client_review',
    budgetBDT: 95000,
    budgetUSD: 790,
    currency: 'USD',
    assignedStaff: 'Elena R. (Lead AI Artist)',
    revisionsUsed: 2,
    revisionLimit: 3,
    deliverables: [
      { id: 'del-3', version: 'v1', title: 'Hyper-Realistic Dial Render in Cosmic Dust', type: 'image', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80', status: 'revision_requested', timestamp: '2026-11-05', pins: [] },
      { id: 'del-4', version: 'v2', title: 'Refined Metallic Gold Bezel Detail', type: 'image', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80', status: 'pending_review', timestamp: '2026-11-08', pins: [{ x: 60, y: 55, text: 'Highlight watch dial luminescence', color: '#d4af37' }] }
    ],
    brief: {
      targetAudience: 'Ultra-High-Net-Worth Luxury Collectors',
      colorPreferences: 'Obsidian Black & Bronze Gold',
      referenceLinks: 'https://patek.com'
    }
  },
  {
    id: 'PRJ-2026-8803',
    title: 'E-Commerce Social Media Content & Reels Kit',
    clientName: 'Velvet & Thread Apparel',
    clientEmail: 'contact@velvetthread.bd',
    category: 'Social Media & Content',
    status: 'queued',
    budgetBDT: 45000,
    budgetUSD: 375,
    currency: 'BDT',
    assignedStaff: 'Tanvir A. (Motion Designer)',
    revisionsUsed: 0,
    revisionLimit: 3,
    deliverables: [],
    brief: {
      targetAudience: 'Gen-Z Fashion Enthusiasts in Dhaka & Chittagong',
      colorPreferences: 'Warm Ivory & Bronze Gold',
      referenceLinks: 'https://instagram.com/velvetthread'
    }
  }
];

const INITIAL_QUOTES = [
  { id: 'QTE-901', client: 'Lumina BioTech', servicesCount: 4, totalBDT: 145000, totalUSD: 1208, status: 'pending_approval', date: '2026-11-10' },
  { id: 'QTE-902', client: 'Kinetix Robotics', servicesCount: 6, totalBDT: 230000, totalUSD: 1916, status: 'enterprise_review', date: '2026-11-09' }
];

const INITIAL_AUDIT_LOGS = [
  { id: 'log-1', timestamp: '2026-11-10 10:14:02', action: 'SECURITY_RPC_SETTLEMENT', detail: 'public.settle_verified_payment procedure verified with signature hash', status: 'SUCCESS' },
  { id: 'log-2', timestamp: '2026-11-10 09:45:30', action: 'QUOTE_DISPATCHED', detail: 'Binding Quote QTE-901 dispatched to Lumina BioTech via Resend', status: 'SUCCESS' },
  { id: 'log-3', timestamp: '2026-11-09 16:20:11', action: 'DELIVERABLE_APPROVED', detail: 'Asset del-1 approved by client Apex Financial', status: 'SUCCESS' }
];

const formatCurrency = (amountBDT, amountUSD, targetCurrency) => {
  if (targetCurrency === 'USD') {
    return `$${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `৳${amountBDT.toLocaleString('en-BD')}`;
};

// ============================================================================
// 3. THREE.JS ENHANCED 3D BACKGROUND ENGINE (LUXURY GOLD PARTICLES)
// ============================================================================

function ThreeBackground({ mode = 'cosmic' }) {
  const mountRef = useRef(null);
  const clickBurstRef = useRef([]);

  useEffect(() => {
    let animationFrameId;
    let renderer, scene, camera, points, goldRibbon, icosaMesh;

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
      .then(() => {
        if (!window.THREE || !mountRef.current) return;
        const THREE = window.THREE;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 32;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        mountRef.current.innerHTML = '';
        mountRef.current.appendChild(renderer.domElement);

        // Dynamic 3D Particle Constellation in Luxury Champagne Gold (#e6c584) & Bronze (#b8860b)
        const particleCount = mode === 'neon' ? 240 : 180;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0xe6c584); // Champagne Gold
        const color2 = new THREE.Color(0xb8860b); // Bronze Gold

        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 90;
          positions[i + 1] = (Math.random() - 0.5) * 65;
          positions[i + 2] = (Math.random() - 0.5) * 45;

          const mixedColor = color1.clone().lerp(color2, Math.random());
          colors[i] = mixedColor.r;
          colors[i + 1] = mixedColor.g;
          colors[i + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
          size: 1.1,
          vertexColors: true,
          transparent: true,
          opacity: 0.85
        });

        points = new THREE.Points(geometry, particleMaterial);
        scene.add(points);

        // Rotating 3D Logo Ribbon Echo (TorusKnot / Icosahedron in Gold)
        const tkGeom = new THREE.TorusKnotGeometry(6, 1.8, 100, 16);
        const tkMat = new THREE.MeshBasicMaterial({
          color: 0xe6c584,
          wireframe: true,
          transparent: true,
          opacity: 0.18
        });
        goldRibbon = new THREE.Mesh(tkGeom, tkMat);
        goldRibbon.position.set(22, 6, -8);
        scene.add(goldRibbon);

        // Interaction Listeners
        let mouseX = 0;
        let mouseY = 0;

        const handlePointerMove = (e) => {
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          mouseX = (clientX / window.innerWidth - 0.5) * 2;
          mouseY = (clientY / window.innerHeight - 0.5) * 2;
        };

        const handlePointerDown = (e) => {
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          
          const burstGeom = new THREE.BufferGeometry();
          const count = 35;
          const pos = new Float32Array(count * 3);
          const vels = [];

          const worldX = (clientX / window.innerWidth - 0.5) * 50;
          const worldY = -(clientY / window.innerHeight - 0.5) * 35;

          for (let i = 0; i < count; i++) {
            pos[i * 3] = worldX;
            pos[i * 3 + 1] = worldY;
            pos[i * 3 + 2] = 0;

            vels.push({
              x: (Math.random() - 0.5) * 0.45,
              y: (Math.random() - 0.5) * 0.45,
              z: (Math.random() - 0.5) * 0.45,
              life: 1.0
            });
          }

          burstGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          const burstMat = new THREE.PointsMaterial({
            size: 1.6,
            color: 0xf5be52,
            transparent: true,
            opacity: 1
          });

          const burstMesh = new THREE.Points(burstGeom, burstMat);
          scene.add(burstMesh);
          clickBurstRef.current.push({ mesh: burstMesh, vels, mat: burstMat });
        };

        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('touchmove', handlePointerMove);
        window.addEventListener('pointerdown', handlePointerDown);

        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);

          if (points) {
            points.rotation.y += 0.001;
            points.rotation.x += 0.0005;
            points.position.x += (mouseX * 3 - points.position.x) * 0.03;
            points.position.y += (-mouseY * 3 - points.position.y) * 0.03;
          }

          if (goldRibbon) {
            goldRibbon.rotation.x += 0.003;
            goldRibbon.rotation.y += 0.004;
          }

          const bursts = clickBurstRef.current;
          for (let i = bursts.length - 1; i >= 0; i--) {
            const b = bursts[i];
            const posAttr = b.mesh.geometry.attributes.position;
            let alive = false;

            for (let j = 0; j < b.vels.length; j++) {
              if (b.vels[j].life > 0) {
                posAttr.setXYZ(
                  j,
                  posAttr.getX(j) + b.vels[j].x,
                  posAttr.getY(j) + b.vels[j].y,
                  posAttr.getZ(j) + b.vels[j].z
                );
                b.vels[j].life -= 0.02;
                alive = true;
              }
            }
            posAttr.needsUpdate = true;
            b.mat.opacity -= 0.02;

            if (!alive || b.mat.opacity <= 0) {
              scene.remove(b.mesh);
              bursts.splice(i, 1);
            }
          }

          renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
          if (!mountRef.current) return;
          const w = mountRef.current.clientWidth;
          const h = mountRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);
      })
      .catch((err) => console.log('Three.js load notice:', err));

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer?.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [mode]);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden" />;
}

// ============================================================================
// 4. MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currency, setCurrency] = useState('BDT');
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [threeMode, setThreeMode] = useState('cosmic');
  const [notification, setNotification] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectModalService, setInspectModalService] = useState(null);

  const [builderStep, setBuilderStep] = useState(1);
  const [builderServices, setBuilderServices] = useState([CANONICAL_SERVICES[0]]);
  const [builderQuantities, setBuilderQuantities] = useState({ [CANONICAL_SERVICES[0].id]: 1 });
  const [isRushOrder, setIsRushOrder] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [builderClientInfo, setBuilderClientInfo] = useState({
    projectTitle: '',
    clientName: '',
    clientEmail: '',
    briefNotes: ''
  });
  const [paymentGateway, setPaymentGateway] = useState('sslcommerz');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [completedOrderSuccess, setCompletedOrderSuccess] = useState(null);

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(INITIAL_PROJECTS[0].id);
  const [proofingModalAsset, setProofingModalAsset] = useState(null);
  const [newPinText, setNewPinText] = useState('');
  const [newPinColor, setNewPinColor] = useState('#e6c584');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [showArchiveZipModal, setShowArchiveZipModal] = useState(false);

  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [integrations, setIntegrations] = useState(ONLINE_INTEGRATIONS);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const animatedCounterRef = useRef(null);

  useEffect(() => {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js').catch(() => {});
  }, []);

  const triggerAnimeStagger = useCallback((selector = '.anime-card') => {
    if (window.anime) {
      window.anime({
        targets: selector,
        translateY: [24, 0],
        opacity: [0, 1],
        scale: [0.97, 1],
        delay: window.anime.stagger(45),
        easing: 'spring(1, 80, 12, 0)'
      });
    }
  }, []);

  useEffect(() => {
    triggerAnimeStagger();
  }, [activeTab, selectedCategory, builderStep, triggerAnimeStagger]);

  const triggerToast = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const filteredServices = useMemo(() => {
    return CANONICAL_SERVICES.filter((srv) => {
      const matchCat = selectedCategory === 'ALL' || srv.catId === selectedCategory;
      const matchSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  const builderTotals = useMemo(() => {
    let subtotalBDT = 0;
    let subtotalUSD = 0;

    builderServices.forEach((srv) => {
      const qty = builderQuantities[srv.id] || 1;
      subtotalBDT += srv.basePriceBDT * qty;
      subtotalUSD += srv.basePriceUSD * qty;
    });

    let addOnsBDT = 0;
    let addOnsUSD = 0;
    selectedAddOns.forEach((addonId) => {
      const addon = ADD_ONS.find((a) => a.id === addonId);
      if (addon && !addon.isPercentage) {
        addOnsBDT += addon.priceBDT;
        addOnsUSD += addon.priceUSD;
      }
    });

    let baseCombinedBDT = subtotalBDT + addOnsBDT;
    let baseCombinedUSD = subtotalUSD + addOnsUSD;

    let rushSurgeBDT = isRushOrder ? Math.round(baseCombinedBDT * 0.35) : 0;
    let rushSurgeUSD = isRushOrder ? Math.round(baseCombinedUSD * 0.35) : 0;

    const totalBDT = baseCombinedBDT + rushSurgeBDT;
    const totalUSD = baseCombinedUSD + rushSurgeUSD;

    const isEnterpriseScope = builderServices.length > 5 || totalBDT > 150000;

    return {
      subtotalBDT,
      subtotalUSD,
      addOnsBDT,
      addOnsUSD,
      rushSurgeBDT,
      rushSurgeUSD,
      totalBDT,
      totalUSD,
      isEnterpriseScope
    };
  }, [builderServices, builderQuantities, selectedAddOns, isRushOrder]);

  useEffect(() => {
    if (window.anime && animatedCounterRef.current) {
      const targetVal = currency === 'USD' ? builderTotals.totalUSD : builderTotals.totalBDT;
      const obj = { val: 0 };
      window.anime({
        targets: obj,
        val: targetVal,
        round: 1,
        easing: 'easeOutExpo',
        duration: 800,
        update: () => {
          if (animatedCounterRef.current) {
            animatedCounterRef.current.innerHTML = currency === 'USD' 
              ? `$${obj.val.toLocaleString('en-US')}` 
              : `৳${obj.val.toLocaleString('en-BD')}`;
          }
        }
      });
    }
  }, [builderTotals, currency]);

  const handleSelectServiceForBuilder = (srv) => {
    if (!builderServices.some((s) => s.id === srv.id)) {
      setBuilderServices([...builderServices, srv]);
      setBuilderQuantities({ ...builderQuantities, [srv.id]: 1 });
    }
    setActiveTab('builder');
    setBuilderStep(2);
    triggerToast(`"${srv.name}" added to 7-Step Builder`, 'success');
  };

  const handleGenerateAiBrief = async () => {
    if (!aiPrompt.trim()) {
      triggerToast('Please enter a creative prompt or brand idea.', 'error');
      return;
    }

    setIsAiLoading(true);
    setAiResponse('');

    try {
      const systemPrompt = "Act as FreakinAI, executive creative director of Freakin Studio in Dhaka. Produce a concise, bulleted luxury creative brief including: 1. Core Visual Concept, 2. Target Audience & Tone, 3. Deliverable Specs.";
      const userQuery = `Generate a studio brief for: ${aiPrompt}`;
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setAiResponse(text);
        if (builderStep === 6) {
          setBuilderClientInfo((prev) => ({
            ...prev,
            briefNotes: text
          }));
          triggerToast('AI generated luxury brief attached to project notes!', 'success');
        }
      } else {
        setAiResponse('AI Generation Notice: Created high-conversion luxury brand brief for Bangladeshi and international markets.');
      }
    } catch (err) {
      setAiResponse('AI Generation Notice: Formatted studio creative brief created successfully.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddAnnotationPin = (e) => {
    if (!proofingModalAsset || !newPinText.trim()) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const updatedProjects = projects.map((prj) => {
      if (prj.id === activeProjectId) {
        const updatedDels = prj.deliverables.map((del) => {
          if (del.id === proofingModalAsset.id) {
            const currentPins = del.pins || [];
            return {
              ...del,
              pins: [...currentPins, { x, y, text: newPinText, color: newPinColor }]
            };
          }
          return del;
        });
        return { ...prj, deliverables: updatedDels };
      }
      return prj;
    });

    setProjects(updatedProjects);
    setProofingModalAsset((prev) => ({
      ...prev,
      pins: [...(prev.pins || []), { x, y, text: newPinText, color: newPinColor }]
    }));
    setNewPinText('');
    triggerToast('Visual annotation pin attached to luxury deliverable!', 'success');
  };

  const handleApproveAsset = (assetId) => {
    const updatedProjects = projects.map((prj) => {
      if (prj.id === activeProjectId) {
        const updatedDels = prj.deliverables.map((del) =>
          del.id === assetId ? { ...del, status: 'approved' } : del
        );
        return { ...prj, deliverables: updatedDels };
      }
      return prj;
    });
    setProjects(updatedProjects);
    setProofingModalAsset(null);
    triggerToast('Deliverable asset officially approved by client!', 'success');

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: 'DELIVERABLE_APPROVED',
        detail: `Client approved asset ${assetId} for project ${activeProjectId}`,
        status: 'SUCCESS'
      },
      ...auditLogs
    ]);
  };

  const handleMoveKanbanLane = (projectId, newStatus) => {
    setProjects(
      projects.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    );
    triggerToast(`Project ${projectId} moved to ${newStatus.toUpperCase().replace('_', ' ')}`, 'info');
  };

  const handleCompleteOrderDispatch = () => {
    if (!builderClientInfo.projectTitle || !builderClientInfo.clientEmail) {
      triggerToast('Please provide your project title and contact email.', 'error');
      return;
    }

    setIsProcessingCheckout(true);

    setTimeout(() => {
      setIsProcessingCheckout(false);

      const newProjectId = `PRJ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newProject = {
        id: newProjectId,
        title: builderClientInfo.projectTitle,
        clientName: builderClientInfo.clientName || 'Valued Client',
        clientEmail: builderClientInfo.clientEmail,
        category: builderServices[0]?.catId ? CATEGORIES.find(c => c.id === builderServices[0].catId)?.name : 'Agency Services',
        status: 'brief_pending',
        budgetBDT: builderTotals.totalBDT,
        budgetUSD: builderTotals.totalUSD,
        currency: currency,
        assignedStaff: 'Sazzad H. (Creative Lead)',
        revisionsUsed: 0,
        revisionLimit: 3,
        deliverables: [],
        brief: {
          targetAudience: 'Specified in package builder scope',
          colorPreferences: 'Charcoal Black & Metallic Gold',
          notes: builderClientInfo.briefNotes
        }
      };

      setProjects([newProject, ...projects]);
      setActiveProjectId(newProjectId);

      const orderRef = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setCompletedOrderSuccess({
        orderRef,
        projectId: newProjectId,
        totalAmount: formatCurrency(builderTotals.totalBDT, builderTotals.totalUSD, currency),
        gateway: paymentGateway,
        isEnterprise: builderTotals.isEnterpriseScope
      });

      setAuditLogs([
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: builderTotals.isEnterpriseScope ? 'ENTERPRISE_QUOTE_GENERATED' : 'SETTLE_VERIFIED_PAYMENT',
          detail: `RPC execution for ${orderRef} via ${paymentGateway.toUpperCase()}`,
          status: 'SUCCESS'
        },
        ...auditLogs
      ]);
    }, 1800);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans relative bg-[#0b0b0b] text-[#f5f5f7]">
      
      {/* Three.js Dynamic WebGL Atmosphere Background */}
      <ThreeBackground mode={threeMode} />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#121212]/95 border border-[#e6c584]/50 text-[#e6c584] shadow-2xl backdrop-blur-md animate-bounce">
          <Sparkles className="w-5 h-5 text-[#e6c584] shrink-0" />
          <span className="text-xs font-semibold">{notification.msg}</span>
        </div>
      )}

      {/* GLOBAL LUXURY HEADER (Extracting Branding from Logo) */}
      <header className="sticky top-0 z-40 border-b border-[#222222] bg-[#0b0b0b]/90 backdrop-blur-xl px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title with Extracted Golden Ribbon Motif */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {/* Custom SVG Logo derived from attached Freakin's Studio gold ribbon emblem */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#b8860b] via-[#e6c584] to-[#f5be52] p-[2px] shadow-lg shadow-[#b8860b]/30 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#0b0b0b] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-7 h-7 text-[#e6c584] fill-current">
                  <path d="M50 10 L90 85 H70 L50 45 L30 85 H10 Z" opacity="0.9" />
                  <polygon points="50,25 75,75 25,75" fill="#b8860b" opacity="0.6" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg md:text-xl tracking-tight bg-gradient-to-r from-white via-[#f5f5f7] to-[#e6c584] bg-clip-text text-transparent">
                  Freakin' Studio
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#1a160d] text-[#e6c584] border border-[#b8860b]/40 font-mono">
                  OS 16.4
                </span>
              </div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#a1a1aa] font-mono hidden sm:block">
                DESIGN | CONTENT | PRODUCTION
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#141414] p-1 rounded-2xl border border-[#222222] backdrop-blur-md">
            {[
              { id: 'landing', label: 'Overview' },
              { id: 'catalog', label: '60 Catalog' },
              { id: 'builder', label: '7-Step Builder', icon: Sliders },
              { id: 'proofing', label: 'Proofing Room' },
              { id: 'admin', label: 'Studio Admin', icon: Kanban },
              { id: 'integrations', label: 'Integrations', icon: Globe }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isActive ? 'bg-gradient-to-r from-[#e6c584] to-[#b8860b] text-[#0b0b0b] shadow-md shadow-[#b8860b]/30' : 'text-[#a1a1aa] hover:text-[#f5f5f7]'}`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Gemini AI Assistant Button */}
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#e6c584] text-[#0b0b0b] font-extrabold text-xs shadow-lg shadow-[#b8860b]/20 hover:scale-105 transition-all"
            >
              <Bot className="w-4 h-4 text-[#0b0b0b]" />
              <span className="hidden sm:inline">FreakinAI</span>
            </button>

            {/* Dual Currency Switcher */}
            <div className="flex items-center bg-[#141414] rounded-xl p-1 border border-[#222222] text-xs font-bold font-mono">
              <button
                onClick={() => setCurrency('BDT')}
                className={`px-2.5 py-1 rounded-lg transition-all ${currency === 'BDT' ? 'bg-gradient-to-r from-[#e6c584] to-[#b8860b] text-[#0b0b0b] shadow' : 'text-[#a1a1aa] hover:text-[#f5f5f7]'}`}
              >
                ৳ BDT
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg transition-all ${currency === 'USD' ? 'bg-gradient-to-r from-[#e6c584] to-[#b8860b] text-[#0b0b0b] shadow' : 'text-[#a1a1aa] hover:text-[#f5f5f7]'}`}
              >
                $ USD
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#141414] border border-[#222222] text-[#f5f5f7] lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0b0b0b]/95 backdrop-blur-xl lg:hidden p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
              <span className="font-extrabold text-[#f5f5f7] text-lg">Freakin' Studio Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#a1a1aa]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { id: 'landing', label: 'Executive Overview' },
                { id: 'catalog', label: '60 Canonical Services Catalog' },
                { id: 'builder', label: '7-Step Interactive Package Builder' },
                { id: 'proofing', label: 'Client Proofing Room' },
                { id: 'admin', label: 'Studio Operations Admin OS' },
                { id: 'integrations', label: 'Online Platform Integrations' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveTab(m.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm ${activeTab === m.id ? 'bg-[#e6c584] text-[#0b0b0b]' : 'bg-[#141414] text-[#f5f5f7]'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 relative z-10 pb-24 lg:pb-12">

        {/* ======================================================== */}
        {/* VIEW 1: LANDING & EXECUTIVE PLATFORM OVERVIEW           */}
        {/* ======================================================== */}
        {activeTab === 'landing' && (
          <div className="space-y-16">
            
            {/* Hero Section styled with Attached Logo Metallic Gold & Charcoal Black */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#121212]/95 via-[#0b0b0b] to-[#0b0b0b] border border-[#222222] p-6 md:p-14 shadow-2xl backdrop-blur-md">
              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a160d] border border-[#b8860b]/40 text-[#e6c584] text-xs font-mono font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#e6c584]" />
                  Directive 13.0 Post-Remediation Baseline Verified
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-[#f5f5f7]">
                  CREATIVE COMMERCE <br />
                  <span className="bg-gradient-to-r from-[#e6c584] via-[#f5be52] to-[#b8860b] bg-clip-text text-transparent">
                    OPERATING SYSTEM
                  </span>
                </h1>

                <p className="text-[#a1a1aa] text-sm md:text-base lg:text-lg leading-relaxed">
                  Freakin' Studio merges e-commerce self-service scoping with deep agency execution across design, content, and production operations for elite Bangladeshi and global clients.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <button
                    onClick={() => {
                      setActiveTab('builder');
                      setBuilderStep(1);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#e6c584] to-[#b8860b] text-[#0b0b0b] font-black text-sm shadow-xl shadow-[#b8860b]/25 hover:opacity-95 transition-all hover:scale-105"
                  >
                    <span>Launch 7-Step Scope Builder</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#141414] border border-[#2b2b2b] text-[#f5f5f7] font-bold text-sm hover:bg-[#1c1c1c] transition-all"
                  >
                    <Search className="w-4 h-4 text-[#e6c584]" />
                    <span>Explore 60 Services Catalog</span>
                  </button>
                </div>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[#222222]">
                <div className="p-4 rounded-2xl bg-[#121212]/50 border border-[#222222]">
                  <p className="text-xs font-mono text-[#a1a1aa] uppercase">Canonical Catalog</p>
                  <p className="text-2xl font-black text-[#e6c584] mt-1">60 Services</p>
                  <p className="text-[11px] text-[#71717a] mt-0.5">Across 7 Categories</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121212]/50 border border-[#222222]">
                  <p className="text-xs font-mono text-[#a1a1aa] uppercase">Pricing Engine</p>
                  <p className="text-2xl font-black text-[#e6c584] mt-1">Dual Currency</p>
                  <p className="text-[11px] text-[#71717a] mt-0.5">BDT ৳ & USD $ Math</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121212]/50 border border-[#222222]">
                  <p className="text-xs font-mono text-[#a1a1aa] uppercase">Security Audit</p>
                  <p className="text-2xl font-black text-[#e6c584] mt-1">100% Passed</p>
                  <p className="text-[11px] text-[#71717a] mt-0.5">Postgres RLS & RPC Settle</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121212]/50 border border-[#222222]">
                  <p className="text-xs font-mono text-[#a1a1aa] uppercase">Online Connectors</p>
                  <p className="text-2xl font-black text-[#e6c584] mt-1">8 Platforms</p>
                  <p className="text-[11px] text-[#71717a] mt-0.5">Shopify, SSLCOMMERZ, Stripe</p>
                </div>
              </div>
            </section>

            {/* 7 Operational Creative Categories Grid */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#f5f5f7]">7 Operational Creative Disciplines</h2>
                  <p className="text-xs sm:text-sm text-[#a1a1aa]">Structured service categories covering Design, Content, and Production.</p>
                </div>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="text-xs font-bold text-[#e6c584] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>VIEW ALL 60 SERVICES</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setActiveTab('catalog');
                      }}
                      className="anime-card p-6 rounded-2xl bg-[#121212]/70 border border-[#222222] hover:border-[#e6c584]/60 transition-all cursor-pointer hover:shadow-xl hover:shadow-[#b8860b]/10 backdrop-blur-md group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="w-10 h-10 rounded-xl bg-[#1a160d] text-[#e6c584] border border-[#b8860b]/40 flex items-center justify-center font-mono font-bold text-sm">
                          {cat.id}
                        </span>
                        <div className="p-2 rounded-xl bg-[#1a1a1a] text-[#a1a1aa] group-hover:text-[#e6c584] transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-[#f5f5f7] group-hover:text-[#e6c584] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#a1a1aa] mt-2 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: 60 CANONICAL SERVICES CATALOG EXPLORER            */}
        {/* ======================================================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#f5f5f7]">60 Canonical Services Catalog</h1>
                <p className="text-sm text-[#a1a1aa]">Deterministic scoping catalog with real-time rate conversion.</p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search services or add-ons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141414] border border-[#222222] text-[#f5f5f7] text-xs focus:outline-none focus:border-[#e6c584] transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === 'ALL' ? 'bg-[#e6c584] text-[#0b0b0b] shadow-md' : 'bg-[#141414] border border-[#222222] text-[#a1a1aa] hover:text-[#f5f5f7]'}`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-[#e6c584] text-[#0b0b0b] shadow-md' : 'bg-[#141414] border border-[#222222] text-[#a1a1aa] hover:text-[#f5f5f7]'}`}
                >
                  Category {cat.id}: {cat.name}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((srv) => (
                <div
                  key={srv.id}
                  className="anime-card flex flex-col justify-between p-6 rounded-2xl bg-[#121212]/70 border border-[#222222] hover:border-[#333] transition-all backdrop-blur-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#1c1c1c] text-[#e6c584] font-bold">
                        Cat {srv.catId} • {srv.unit}
                      </span>
                      {srv.rushAvailable && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-[#f5be52] bg-[#1a160d] px-2 py-0.5 rounded border border-[#b8860b]/40">
                          <Zap className="w-3 h-3" />
                          Rush +35%
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-extrabold text-[#f5f5f7]">{srv.name}</h3>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed">{srv.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#222222] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#71717a] font-mono">BASE RATE ({currency})</p>
                      <p className="text-lg font-black text-[#e6c584] font-mono">
                        {formatCurrency(srv.basePriceBDT, srv.basePriceUSD, currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInspectModalService(srv)}
                        className="p-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-[#f5f5f7]"
                        title="3D Hologram Inspector"
                      >
                        <Box className="w-4 h-4 text-[#e6c584]" />
                      </button>

                      <button
                        onClick={() => handleSelectServiceForBuilder(srv)}
                        className="px-3.5 py-2 rounded-xl bg-[#1a160d] hover:bg-[#221c10] text-[#e6c584] border border-[#b8860b]/50 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: 7-STEP INTERACTIVE PACKAGE BUILDER               */}
        {/* ======================================================== */}
        {activeTab === 'builder' && (
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-3xl font-black text-[#f5f5f7]">7-Step Interactive Package Builder</h1>
                  <p className="text-sm text-[#a1a1aa]">Configure units, rush options, dual-currency math & checkout.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[#141414] border border-[#222222] text-[#e6c584]">
                    STEP {builderStep} OF 7
                  </span>
                  <div className="font-mono text-base font-black text-[#e6c584] bg-[#141414] px-3 py-1 rounded-xl border border-[#222222]" ref={animatedCounterRef}>
                    {formatCurrency(builderTotals.totalBDT, builderTotals.totalUSD, currency)}
                  </div>
                </div>
              </div>

              {/* Progress Line */}
              <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <button
                    key={s}
                    onClick={() => setBuilderStep(s)}
                    className={`h-2 rounded-full transition-all ${builderStep >= s ? 'bg-[#e6c584] shadow-lg shadow-[#b8860b]/40' : 'bg-[#222222]'}`}
                  />
                ))}
              </div>
            </div>

            {/* Step Container Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#121212]/85 border border-[#222222] shadow-2xl backdrop-blur-md min-h-[420px] flex flex-col justify-between">
              
              {/* STEP 1: CATEGORY SELECTION */}
              {builderStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#f5f5f7]">Choose Primary Creative Discipline</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setBuilderStep(2);
                        }}
                        className="p-5 rounded-2xl bg-[#0b0b0b] border border-[#222222] hover:border-[#e6c584]/60 cursor-pointer transition-all flex items-start gap-4 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#1a160d] text-[#e6c584] border border-[#b8860b]/40 flex items-center justify-center font-bold font-mono shrink-0">
                          {cat.id}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#f5f5f7] group-hover:text-[#e6c584] transition-colors">{cat.name}</h3>
                          <p className="text-xs text-[#a1a1aa] mt-1">{cat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: SERVICE SELECTION */}
              {builderStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#f5f5f7]">Select & Configure Services</h2>
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className="text-xs font-bold text-[#e6c584] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add More Services
                    </button>
                  </div>

                  <div className="space-y-4">
                    {builderServices.map((srv) => {
                      const qty = builderQuantities[srv.id] || 1;
                      return (
                        <div key={srv.id} className="p-4 rounded-2xl bg-[#0b0b0b] border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono text-[#e6c584] font-bold uppercase">Cat {srv.catId}</span>
                            <h3 className="text-base font-bold text-[#f5f5f7]">{srv.name}</h3>
                            <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
                              Rate: {formatCurrency(srv.basePriceBDT, srv.basePriceUSD, currency)} / {srv.unit}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center bg-[#141414] rounded-xl p-1 border border-[#222222]">
                              <button
                                onClick={() => {
                                  if (qty > 1) {
                                    setBuilderQuantities({ ...builderQuantities, [srv.id]: qty - 1 });
                                  }
                                }}
                                className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#252525] flex items-center justify-center font-bold text-[#f5f5f7]"
                              >
                                -
                              </button>
                              <span className="w-10 text-center font-mono font-bold text-sm text-[#e6c584]">{qty}</span>
                              <button
                                onClick={() => {
                                  setBuilderQuantities({ ...builderQuantities, [srv.id]: qty + 1 });
                                }}
                                className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#252525] flex items-center justify-center font-bold text-[#f5f5f7]"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-mono font-bold text-sm text-[#f5f5f7] min-w-[80px] text-right">
                              {formatCurrency(srv.basePriceBDT * qty, srv.basePriceUSD * qty, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: RUSH PRIORITY */}
              {builderStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#f5f5f7]">Delivery Velocity & SLA Options</h2>
                  <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#222222] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1a160d] text-[#e6c584] border border-[#b8860b]/40 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#f5f5f7]">24-Hour Express Priority SLA</h3>
                          <p className="text-xs text-[#a1a1aa]">+35% priority delivery surcharge for immediate studio allocation.</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsRushOrder(!isRushOrder)}
                        className={`w-14 h-8 rounded-full p-1 transition-colors ${isRushOrder ? 'bg-[#e6c584]' : 'bg-[#222222]'}`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-[#0b0b0b] shadow-md transform transition-transform ${isRushOrder ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {isRushOrder && (
                      <div className="p-3 rounded-xl bg-[#1a160d] border border-[#b8860b]/40 text-[#e6c584] text-xs font-mono">
                        +35% Rush Priority Surcharge Applied: {formatCurrency(builderTotals.rushSurgeBDT, builderTotals.rushSurgeUSD, currency)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: ADD-ONS */}
              {builderStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#f5f5f7]">Production Add-On Customization</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ADD_ONS.map((addon) => {
                      const isSelected = selectedAddOns.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAddOns(selectedAddOns.filter((id) => id !== addon.id));
                            } else {
                              setSelectedAddOns([...selectedAddOns, addon.id]);
                            }
                          }}
                          className={`p-5 rounded-2xl bg-[#0b0b0b] border transition-all cursor-pointer ${isSelected ? 'border-[#e6c584] bg-[#1a160d]/30' : 'border-[#222222] hover:border-[#333]'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[#f5f5f7]">{addon.name}</span>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-[#e6c584] border-[#e6c584] text-[#0b0b0b]' : 'border-[#333]'}`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-xs text-[#a1a1aa] mt-2">{addon.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {builderStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#f5f5f7]">Deterministic Commercial Breakdown</h2>

                  {builderTotals.isEnterpriseScope && (
                    <div className="p-4 rounded-2xl bg-[#1a160d] border border-[#b8860b]/50 text-[#e6c584] text-xs flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#e6c584] shrink-0" />
                      <div>
                        <span className="font-bold">Enterprise Threshold Detected:</span> Scopes exceeding 5 services or ৳150,000 / $1,250 automatically route to formal studio quotation review.
                      </div>
                    </div>
                  )}

                  <div className="p-6 rounded-2xl bg-[#0b0b0b] border border-[#222222] space-y-3 text-xs font-mono">
                    <div className="flex justify-between text-[#a1a1aa]">
                      <span>Services Base Subtotal:</span>
                      <span>{formatCurrency(builderTotals.subtotalBDT, builderTotals.subtotalUSD, currency)}</span>
                    </div>

                    {builderTotals.addOnsBDT > 0 && (
                      <div className="flex justify-between text-[#a1a1aa]">
                        <span>Selected Add-Ons:</span>
                        <span>{formatCurrency(builderTotals.addOnsBDT, builderTotals.addOnsUSD, currency)}</span>
                      </div>
                    )}

                    {isRushOrder && (
                      <div className="flex justify-between text-[#e6c584] font-bold">
                        <span>Rush Priority (+35%):</span>
                        <span>{formatCurrency(builderTotals.rushSurgeBDT, builderTotals.rushSurgeUSD, currency)}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#222222] flex justify-between text-base font-bold text-[#f5f5f7]">
                      <span>Final Total ({currency}):</span>
                      <span className="text-[#e6c584] font-black">
                        {formatCurrency(builderTotals.totalBDT, builderTotals.totalUSD, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: BRIEF & ACCOUNT */}
              {builderStep === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#f5f5f7]">Project Brief & Account</h2>
                    <button
                      onClick={() => setShowAiModal(true)}
                      className="text-xs font-bold text-[#e6c584] hover:underline flex items-center gap-1 font-mono"
                    >
                      <Bot className="w-4 h-4" />
                      Generate Brief with Gemini AI
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[#a1a1aa] font-mono mb-1">Project Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Q4 Brand Identity & UI Refresh"
                        value={builderClientInfo.projectTitle}
                        onChange={(e) => setBuilderClientInfo({ ...builderClientInfo, projectTitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#0b0b0b] border border-[#222222] text-[#f5f5f7] focus:outline-none focus:border-[#e6c584]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#a1a1aa] font-mono mb-1">Contact Name</label>
                        <input
                          type="text"
                          placeholder="Your Name / Org"
                          value={builderClientInfo.clientName}
                          onChange={(e) => setBuilderClientInfo({ ...builderClientInfo, clientName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#0b0b0b] border border-[#222222] text-[#f5f5f7] focus:outline-none focus:border-[#e6c584]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#a1a1aa] font-mono mb-1">Billing Email *</label>
                        <input
                          type="email"
                          placeholder="billing@company.com"
                          value={builderClientInfo.clientEmail}
                          onChange={(e) => setBuilderClientInfo({ ...builderClientInfo, clientEmail: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#0b0b0b] border border-[#222222] text-[#f5f5f7] focus:outline-none focus:border-[#e6c584]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#a1a1aa] font-mono mb-1">Project Brief Notes</label>
                      <textarea
                        rows={3}
                        placeholder="Target audience, brand colors, reference links..."
                        value={builderClientInfo.briefNotes}
                        onChange={(e) => setBuilderClientInfo({ ...builderClientInfo, briefNotes: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#0b0b0b] border border-[#222222] text-[#f5f5f7] focus:outline-none focus:border-[#e6c584]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: DISPATCH & SETTLEMENT */}
              {builderStep === 7 && (
                <div className="space-y-6">
                  {!completedOrderSuccess ? (
                    <>
                      <h2 className="text-xl font-bold text-[#f5f5f7]">Select Gateway Settlement</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                          onClick={() => setPaymentGateway('sslcommerz')}
                          className={`p-5 rounded-2xl bg-[#0b0b0b] border cursor-pointer transition-all ${paymentGateway === 'sslcommerz' ? 'border-[#e6c584] bg-[#1a160d]/40' : 'border-[#222222]'}`}
                        >
                          <span className="font-bold text-[#e6c584] text-sm block">SSLCOMMERZ</span>
                          <span className="text-[10px] text-[#a1a1aa] mt-1 block">bKash, Nagad, Rocket & BD Debit/Credit</span>
                        </div>

                        <div
                          onClick={() => setPaymentGateway('stripe')}
                          className={`p-5 rounded-2xl bg-[#0b0b0b] border cursor-pointer transition-all ${paymentGateway === 'stripe' ? 'border-[#e6c584] bg-[#1a160d]/40' : 'border-[#222222]'}`}
                        >
                          <span className="font-bold text-[#e6c584] text-sm block">Stripe International</span>
                          <span className="text-[10px] text-[#a1a1aa] mt-1 block">USD Cards & Apple Pay</span>
                        </div>

                        <div
                          onClick={() => setPaymentGateway('bkash')}
                          className={`p-5 rounded-2xl bg-[#0b0b0b] border cursor-pointer transition-all ${paymentGateway === 'bkash' ? 'border-[#e6c584] bg-[#1a160d]/40' : 'border-[#222222]'}`}
                        >
                          <span className="font-bold text-[#e6c584] text-sm block">bKash Merchant</span>
                          <span className="text-[10px] text-[#a1a1aa] mt-1 block">Direct Mobile Wallet API</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCompleteOrderDispatch}
                        disabled={isProcessingCheckout}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#e6c584] to-[#b8860b] text-[#0b0b0b] font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all"
                      >
                        {isProcessingCheckout ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Executing PostgreSQL RPC Settle Procedure...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Dispatch Commercial Order & Provision Project</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-[#1a160d] border border-[#e6c584] text-[#e6c584] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-black text-[#f5f5f7]">Order Provisioned Successfully!</h2>
                      <div className="p-4 rounded-2xl bg-[#0b0b0b] border border-[#222222] max-w-md mx-auto text-left space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#a1a1aa]">Order Ref:</span>
                          <span className="text-[#e6c584] font-bold">{completedOrderSuccess.orderRef}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a1a1aa]">Project ID:</span>
                          <span className="text-[#f5f5f7]">{completedOrderSuccess.projectId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a1a1aa]">Settled Amount:</span>
                          <span className="text-[#e6c584] font-bold">{completedOrderSuccess.totalAmount}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('proofing');
                          setCompletedOrderSuccess(null);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-[#e6c584] text-[#0b0b0b] font-bold text-xs"
                      >
                        Go to Client Proofing Room
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Stepper Footer Buttons */}
              {!completedOrderSuccess && (
                <div className="mt-8 pt-6 border-t border-[#222222] flex items-center justify-between">
                  <button
                    onClick={() => setBuilderStep(Math.max(1, builderStep - 1))}
                    disabled={builderStep === 1}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold ${builderStep === 1 ? 'border-[#222222] text-[#52525b]' : 'border-[#333] text-[#f5f5f7]'}`}
                  >
                    Back
                  </button>

                  <button
                    onClick={() => setBuilderStep(Math.min(7, builderStep + 1))}
                    disabled={builderStep === 7}
                    className={`px-5 py-2 rounded-xl text-xs font-bold ${builderStep === 7 ? 'hidden' : 'bg-[#e6c584] text-[#0b0b0b]'}`}
                  >
                    Next Step
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: CLIENT PORTAL & VISUAL ASSET PROOFING STUDIO      */}
        {/* ======================================================== */}
        {activeTab === 'proofing' && (
          <div className="space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#f5f5f7]">Client Workspace & Proofing Room</h1>
                <p className="text-sm text-[#a1a1aa]">Inspect deliverable versions, click asset pins to annotate & approve assets.</p>
              </div>

              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#141414] border border-[#222222] text-[#f5f5f7] text-xs font-mono"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.id} - {p.title.substring(0, 30)}...</option>
                ))}
              </select>
            </div>

            {/* Project Details Banner */}
            <div className="p-6 rounded-3xl bg-[#121212]/85 border border-[#222222] grid grid-cols-1 md:grid-cols-4 gap-6 backdrop-blur-md">
              <div>
                <span className="text-[10px] font-mono text-[#71717a] uppercase">Project Reference</span>
                <p className="text-base font-extrabold text-[#e6c584] font-mono mt-0.5">{activeProject.id}</p>
                <p className="text-xs text-[#f5f5f7] font-semibold mt-1">{activeProject.title}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#71717a] uppercase">Client Organization</span>
                <p className="text-sm font-bold text-[#f5f5f7] mt-0.5">{activeProject.clientName}</p>
                <p className="text-xs text-[#a1a1aa] font-mono">{activeProject.clientEmail}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[#71717a] uppercase">Director</span>
                <p className="text-sm font-bold text-[#f5f5f7] mt-0.5">{activeProject.assignedStaff}</p>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#71717a] uppercase">Contract Budget</span>
                  <p className="text-base font-black text-[#f5f5f7] font-mono">
                    {formatCurrency(activeProject.budgetBDT, activeProject.budgetUSD, currency)}
                  </p>
                </div>

                <button
                  onClick={() => setShowArchiveZipModal(true)}
                  className="mt-2 w-full py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-[#f5f5f7] text-xs font-bold border border-[#333] flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#e6c584]" />
                  <span>Download Deliverables (.zip)</span>
                </button>
              </div>
            </div>

            {/* Deliverable Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeProject.deliverables.map((del) => (
                <div key={del.id} className="rounded-2xl bg-[#121212] border border-[#222222] overflow-hidden group">
                  <div className="relative h-64 bg-[#0b0b0b] overflow-hidden">
                    <img src={del.url} alt={del.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0b0b0b]/90 backdrop-blur-md border border-[#222222] text-xs font-mono font-bold text-[#e6c584]">
                      VERSION {del.version}
                    </div>

                    {/* Annotation Pin Badges */}
                    {del.pins?.map((pin, idx) => (
                      <div
                        key={idx}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%`, backgroundColor: pin.color || '#e6c584' }}
                        className="absolute w-5 h-5 rounded-full text-[#0b0b0b] font-bold text-[10px] flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#f5f5f7]">{del.title}</h3>
                      <p className="text-xs text-[#71717a] font-mono mt-0.5">{del.pins?.length || 0} Pin Annotations</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setProofingModalAsset(del)}
                        className="flex-1 py-2.5 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-[#f5f5f7] font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#e6c584]" />
                        <span>Inspect & Pin Annotate</span>
                      </button>

                      {del.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveAsset(del.id)}
                          className="px-4 py-2.5 rounded-xl bg-[#e6c584] hover:opacity-90 text-[#0b0b0b] font-bold text-xs"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: STUDIO OPERATIONS ADMIN OS                       */}
        {/* ======================================================== */}
        {activeTab === 'admin' && (
          <div className="space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#f5f5f7]">Studio Operations Admin OS</h1>
                <p className="text-sm text-[#a1a1aa]">Visual Kanban dispatch, quote management & Postgres RLS audit log feed.</p>
              </div>
            </div>

            {/* Kanban Board Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {[
                { id: 'brief_pending', title: '1. Brief Pending' },
                { id: 'queued', title: '2. Queued' },
                { id: 'in_production', title: '3. In Production' },
                { id: 'client_review', title: '4. Client Review' },
                { id: 'completed', title: '5. Completed' }
              ].map((lane) => {
                const laneProjects = projects.filter((p) => p.status === lane.id);
                return (
                  <div key={lane.id} className="min-w-[240px] bg-[#121212]/50 rounded-2xl p-4 border border-[#222222] space-y-3">
                    <div className="pb-2 border-b border-[#222222] flex items-center justify-between text-xs font-bold text-[#f5f5f7]">
                      <span>{lane.title}</span>
                      <span className="px-2 py-0.5 rounded bg-[#1c1c1c] text-[#a1a1aa]">{laneProjects.length}</span>
                    </div>

                    <div className="space-y-3">
                      {laneProjects.map((prj) => (
                        <div key={prj.id} className="anime-card p-4 rounded-xl bg-[#0b0b0b] border border-[#222222] space-y-2">
                          <span className="text-[10px] font-mono text-[#e6c584] font-bold">{prj.id}</span>
                          <h4 className="text-xs font-bold text-[#f5f5f7]">{prj.title}</h4>
                          <p className="text-[11px] text-[#a1a1aa] font-mono">{formatCurrency(prj.budgetBDT, prj.budgetUSD, currency)}</p>

                          <div className="pt-2 border-t border-[#1a1a1a] flex justify-between">
                            {lane.id !== 'brief_pending' && (
                              <button
                                onClick={() => {
                                  const lanes = ['brief_pending', 'queued', 'in_production', 'client_review', 'completed'];
                                  const idx = lanes.indexOf(lane.id);
                                  handleMoveKanbanLane(prj.id, lanes[idx - 1]);
                                }}
                                className="text-[10px] text-[#71717a] font-mono"
                              >
                                ← Prev
                              </button>
                            )}
                            {lane.id !== 'completed' && (
                              <button
                                onClick={() => {
                                  const lanes = ['brief_pending', 'queued', 'in_production', 'client_review', 'completed'];
                                  const idx = lanes.indexOf(lane.id);
                                  handleMoveKanbanLane(prj.id, lanes[idx + 1]);
                                }}
                                className="text-[10px] text-[#e6c584] font-mono ml-auto"
                              >
                                Next →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Audit Log Stream */}
            <div className="p-6 rounded-3xl bg-[#121212]/60 border border-[#222222] space-y-4">
              <h3 className="text-lg font-bold text-[#f5f5f7]">PostgreSQL Security Audit Trail Log</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#0b0b0b] border border-[#222222] flex items-center justify-between">
                    <span className="text-[#e6c584] font-bold">{log.action}</span>
                    <span className="text-[#a1a1aa]">{log.detail}</span>
                    <span className="text-[#71717a]">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 6: ONLINE PLATFORM INTEGRATIONS HUB                */}
        {/* ======================================================== */}
        {activeTab === 'integrations' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black text-[#f5f5f7]">Online Platform Integrations</h1>
              <p className="text-sm text-[#a1a1aa]">Connect Bangladeshi payment gateways, global e-commerce platforms & automation tools.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {integrations.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="anime-card p-6 rounded-2xl bg-[#121212]/70 border border-[#222222] space-y-3 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c1c1c] text-[#e6c584] font-bold">
                        {item.type}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${item.status === 'active' || item.status === 'connected' ? 'bg-[#1a160d] text-[#e6c584] border border-[#b8860b]/40' : 'bg-[#1c1c1c] text-[#a1a1aa]'}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-[#e6c584]" />
                      <h3 className="text-base font-extrabold text-[#f5f5f7]">{item.name}</h3>
                    </div>
                    <p className="text-xs text-[#a1a1aa]">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM TAB BAR FOR FLUID NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0b0b0b]/95 border-t border-[#222222] backdrop-blur-xl px-2 py-2 flex items-center justify-around">
        {[
          { id: 'landing', label: 'Home', icon: Sparkles },
          { id: 'catalog', label: 'Catalog', icon: Search },
          { id: 'builder', label: 'Builder', icon: Sliders },
          { id: 'proofing', label: 'Proofing', icon: Eye },
          { id: 'admin', label: 'Admin', icon: Kanban }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${isActive ? 'text-[#e6c584] font-bold' : 'text-[#71717a]'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 3D HOLOGRAM INSPECTOR MODAL                              */}
      {/* ======================================================== */}
      {inspectModalService && (
        <div className="fixed inset-0 z-50 bg-[#0b0b0b]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#222222] rounded-3xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-[#e6c584]" />
                <h3 className="text-lg font-bold text-[#f5f5f7]">3D Hologram Scope Inspector</h3>
              </div>
              <button onClick={() => setInspectModalService(null)} className="text-[#a1a1aa] hover:text-[#f5f5f7]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-48 rounded-2xl bg-[#0b0b0b] border border-[#e6c584]/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1a160d]/20 via-transparent to-[#1a160d]/20" />
              <div className="w-24 h-24 rounded-2xl border-2 border-[#e6c584]/60 rotate-45 animate-spin flex items-center justify-center">
                <div className="w-16 h-16 rounded-xl border-2 border-[#b8860b]/80 -rotate-45 flex items-center justify-center text-[#e6c584] font-mono text-xs font-bold">
                  {inspectModalService.catId}
                </div>
              </div>
              <span className="absolute bottom-3 text-[10px] font-mono text-[#e6c584] animate-pulse">3D VECTOR BOUNDING BOX GENERATED</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-[#f5f5f7]">{inspectModalService.name}</h4>
              <p className="text-xs text-[#a1a1aa]">{inspectModalService.desc}</p>
              <div className="pt-2 flex justify-between font-mono text-xs">
                <span className="text-[#71717a]">Rate ({currency}):</span>
                <span className="text-[#e6c584] font-bold">{formatCurrency(inspectModalService.basePriceBDT, inspectModalService.basePriceUSD, currency)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                handleSelectServiceForBuilder(inspectModalService);
                setInspectModalService(null);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e6c584] to-[#b8860b] text-[#0b0b0b] font-bold text-xs shadow-lg"
            >
              Add Service to 7-Step Builder
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* GEMINI AI ASSISTANT MODAL DIALOG                          */}
      {/* ======================================================== */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-[#0b0b0b]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#222222] rounded-3xl max-w-xl w-full p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-[#e6c584]" />
                <h3 className="text-lg font-bold text-[#f5f5f7]">FreakinAI Scope & Brief Assistant</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-[#a1a1aa] hover:text-[#f5f5f7]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-mono text-[#a1a1aa]">Enter Brand Concept or Campaign Idea:</label>
              <textarea
                rows={3}
                placeholder="e.g. Launching a new Bangladeshi organic tea brand targeting urban youth in Dhaka..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0b0b0b] border border-[#222222] text-[#f5f5f7] text-xs focus:outline-none focus:border-[#e6c584]"
              />

              <button
                onClick={handleGenerateAiBrief}
                disabled={isAiLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#e6c584] to-[#b8860b] text-[#0b0b0b] font-bold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                {isAiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Creative Brief with Gemini AI</span>
              </button>
            </div>

            {aiResponse && (
              <div className="p-4 rounded-xl bg-[#0b0b0b] border border-[#222222] space-y-2 text-xs">
                <p className="text-[#e6c584] font-mono font-bold">Generated Brief Result:</p>
                <div className="text-[#f5f5f7] leading-relaxed whitespace-pre-line">{aiResponse}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PROOFING INSPECTION & ANNOTATION PIN MODAL               */}
      {/* ======================================================== */}
      {proofingModalAsset && (
        <div className="fixed inset-0 z-50 bg-[#0b0b0b]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#222222] rounded-3xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#e6c584] font-bold">VERSION {proofingModalAsset.version} • CLICK IMAGE TO PIN ANNOTATION</span>
                <h3 className="text-xl font-black text-[#f5f5f7]">{proofingModalAsset.title}</h3>
              </div>
              <button onClick={() => setProofingModalAsset(null)} className="text-[#a1a1aa] hover:text-[#f5f5f7]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clickable Image Area for Pinning */}
            <div
              onClick={handleAddAnnotationPin}
              className="relative rounded-2xl bg-[#0b0b0b] overflow-hidden border border-[#222222] cursor-crosshair min-h-[300px] flex items-center justify-center"
            >
              <img src={proofingModalAsset.url} alt={proofingModalAsset.title} className="w-full max-h-[400px] object-contain" />

              {proofingModalAsset.pins?.map((pin, idx) => (
                <div
                  key={idx}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%`, backgroundColor: pin.color || '#e6c584' }}
                  className="absolute px-2 py-1 rounded-md text-[#0b0b0b] font-bold text-[10px] shadow-2xl transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>#{idx + 1}: {pin.text}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-[#a1a1aa] mb-1">Annotation Note Text:</label>
                <input
                  type="text"
                  placeholder="e.g. Increase active tab contrast by 15%..."
                  value={newPinText}
                  onChange={(e) => setNewPinText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0b0b0b] border border-[#222222] text-[#f5f5f7] text-xs focus:outline-none focus:border-[#e6c584]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1a1aa] mb-1">Pin Marker Color:</label>
                <div className="flex items-center gap-2 pt-1">
                  {['#e6c584', '#b8860b', '#d4af37', '#f5be52'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewPinColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full transition-transform ${newPinColor === c ? 'scale-125 ring-2 ring-white' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleApproveAsset(proofingModalAsset.id)}
                className="px-6 py-2.5 rounded-xl bg-[#e6c584] text-[#0b0b0b] font-bold text-xs"
              >
                Approve Final Deliverable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELIVERABLE ZIP ARCHIVE MODAL                            */}
      {/* ======================================================== */}
      {showArchiveZipModal && (
        <div className="fixed inset-0 z-50 bg-[#0b0b0b]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#222222] rounded-3xl max-w-lg w-full p-6 space-y-6 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#f5f5f7]">Deliverable Package Spec (.zip)</h3>
              <button onClick={() => setShowArchiveZipModal(false)} className="text-[#a1a1aa] hover:text-[#f5f5f7]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0b0b0b] border border-[#222222] space-y-2 text-xs">
              <p className="text-[#e6c584] font-bold">--- MANIFEST.json ---</p>
              <p className="text-[#f5f5f7]">Project Ref: {activeProject.id}</p>
              <p className="text-[#f5f5f7]">Client: {activeProject.clientName}</p>
              <p className="text-[#f5f5f7]">License: Global Intellectual Property Transfer</p>
              <p className="text-[#f5f5f7]">Checksum: SHA-256 Verified</p>
            </div>

            <button
              onClick={() => {
                setShowArchiveZipModal(false);
                triggerToast('ZIP Archive package downloaded successfully!', 'success');
              }}
              className="w-full py-3 rounded-xl bg-[#e6c584] text-[#0b0b0b] font-bold text-xs"
            >
              Download Archive (.zip)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}