import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Grid,
  Heart,
  HelpCircle,
  History,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Lightbulb,
  ListFilter,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Pause,
  Play,
  RefreshCw,
  RotateCw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Users,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { businessRules, businessTypes, defaultForm, optionMappings } from './data/mappings.js';
import {
  SITE,
  blogPosts,
  examplesGallery,
  faqItems,
  heroCarouselItems,
  howItWorksSteps,
  insightProducts,
  policyPages,
  promptLibrary,
  searchableRecords,
  servicesData,
  supportedAiModels,
  templatesData,
  testimonials,
  toolGuides,
  whyUsData,
} from './data/siteContent.js';
import { buildDescription } from './utils/descriptionBuilder.js';

const fieldLabels = {
  businessName: 'Business name',
  businessType: 'Business type',
  speciality: 'What do you offer?',
  postGoal: 'What do you want to promote?',
  platform: 'Platform',
  designMood: 'Design style type',
  designDensity: 'How much content on image?',
  imageStyle: 'Image style',
  targetAudience: 'Who should see this post?',
  offerIntensity: 'How strong should the offer look?',
  brandTone: 'Business personality',
  visualFocalPoint: 'Main thing to show',
  textPriority: 'Bigger text or bigger image?',
  trustElement: 'What builds trust?',
  hasBusinessImages: 'Do you have your own photos?',
  businessWebsite: 'Business website',
  businessAddress: 'Business address / location',
  brandColors: 'Brand colors',
  headline: 'Headline',
  subheadline: 'Subheadline',
  offerDetails: 'Offer details',
  cta: 'Button text (Call To Action)',
  contactInfo: 'Contact information',
  highlights: 'Important highlights',
  avoid: 'What should not be included?',
};

const STEP_FIELDS = {
  1: ['businessName', 'businessType', 'speciality', 'businessWebsite', 'businessAddress'],
  2: ['postGoal', 'platform', 'targetAudience'],
  3: [
    'designMood',
    'designDensity',
    'imageStyle',
    'visualFocalPoint',
    'textPriority',
    'offerIntensity',
    'brandTone',
    'trustElement',
    'hasBusinessImages',
  ],
  4: ['brandColors', 'headline', 'subheadline', 'offerDetails', 'cta', 'contactInfo', 'highlights', 'avoid'],
};

const STEP_TITLES = {
  1: { title: 'Business Info', desc: 'Tell us about your business & niche' },
  2: { title: 'Campaign Goal', desc: 'Define your promotion purpose & target feed' },
  3: { title: 'Visual & Style', desc: 'Configure mood, layout density & focal point' },
  4: { title: 'Copy & Content', desc: 'Specify headlines, offer details & brand colors' },
};

const COPY_HINT = 'Copy this prompt and paste into ChatGPT, Midjourney, Flux, Gemini, or Ideogram with your brand logo.';
const ROUTE_TITLES = new Map([
  ['/generate-prompt', 'Generate Prompt'],
  ['/generate', 'Generate Prompt'],
  ['/examples', 'Examples Gallery'],
  ['/library', 'Prompt Library'],
  ['/templates', 'Templates'],
  ['/how-it-works', 'How It Works'],
  ['/features', 'Platform Features'],
  ['/pricing', 'Pricing & Plans'],
  ['/services', 'Services'],
  ['/why-us', 'Why Choose Us'],
  ...policyPages.map((page) => [`/${page.slug}`, page.title]),
]);

function createCaptcha() {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 2;

  return { prompt: `${left} + ${right}`, answer: String(left + right) };
}

function currentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function absoluteUrl(path) {
  return `${SITE.origin}${path === '/' ? '' : path}`;
}

function baseSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.origin,
      logo: absoluteUrl(SITE.logo),
      email: SITE.email,
      description: SITE.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.productName,
      url: SITE.origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE.origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

function pageSchema(title, path, description, extra = []) {
  return [
    ...baseSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.origin },
        { '@type': 'ListItem', position: 2, name: title, item: absoluteUrl(path) },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      url: absoluteUrl(path),
      description,
    },
    ...extra,
  ];
}

function useRoute() {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    function syncPath() {
      setPath(currentPath());
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  function navigate(to) {
    if (to === path) return;
    window.history.pushState({}, '', to);
    setPath(currentPath());
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  return { path, navigate };
}

function useSeo({ title, description, path, keywords = SITE.keywords, schema = [], robots = 'index,follow,max-image-preview:large' }) {
  useEffect(() => {
    const fullTitle = title.includes(SITE.productName) ? title : `${title} | ${SITE.productName}`;
    const canonical = absoluteUrl(path);
    document.title = fullTitle;

    const tags = [
      ['meta', { name: 'description', content: description }],
      ['meta', { name: 'keywords', content: keywords }],
      ['meta', { name: 'robots', content: robots }],
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { property: 'og:title', content: fullTitle }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:type', content: path.startsWith('/blog/') ? 'article' : 'website' }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:image', content: absoluteUrl(SITE.logo) }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: fullTitle }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: absoluteUrl(SITE.logo) }],
    ];

    document.querySelectorAll('[data-managed-seo="true"]').forEach((node) => node.remove());

    tags.forEach(([tagName, attrs]) => {
      const element = document.createElement(tagName);
      Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
      element.setAttribute('data-managed-seo', 'true');
      document.head.appendChild(element);
    });

    schema.forEach((entry) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(entry);
      script.setAttribute('data-managed-seo', 'true');
      document.head.appendChild(script);
    });
  }, [title, description, keywords, path, schema, robots]);
}

function Link({ to, navigate, children, className = '', onClick }) {
  return (
    <a
      className={className}
      href={to}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

function SelectField({ name, value, options, onChange }) {
  return (
    <label className="field">
      <span>{fieldLabels[name]}</span>
      <select value={value} onChange={(event) => onChange(name, event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({ name, value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{fieldLabels[name]}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(name, event.target.value)} />
    </label>
  );
}

function TextAreaField({ name, value, onChange, placeholder }) {
  return (
    <label className="field field-wide">
      <span>{fieldLabels[name]}</span>
      <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(name, event.target.value)} />
    </label>
  );
}

function HistoryList({ items, onRestore }) {
  if (!items.length) {
    return <p className="empty-state">Generated descriptions will appear here during this session.</p>;
  }

  return (
    <div className="history-list">
      {items.map((item) => (
        <button className="history-item" key={item.id} onClick={() => onRestore(item.form)} type="button">
          <span>{item.form.businessName || item.form.businessType}</span>
          <small>
            {item.form.postGoal} - {item.form.platform}
          </small>
        </button>
      ))}
    </div>
  );
}

function Breadcrumbs({ path, navigate }) {
  const label = path === '/' ? 'Home' : ROUTE_TITLES.get(path) || path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');
  if (path === '/') return null;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/" navigate={navigate}>Home</Link>
      <span>/</span>
      <span>{label}</span>
    </nav>
  );
}

function ArticleShell({ title, description, path, navigate, children }) {
  return (
    <article className="article-shell">
      <Breadcrumbs path={path} navigate={navigate} />
      <header className="article-hero">
        <p className="eyebrow">{SITE.productName}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </article>
  );
}

function AdSlot({ label = 'Advertisement' }) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // Ignore if blocked or already pushed
    }
  }, []);

  return (
    <aside className="ad-slot" aria-label={label}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client="ca-pub-5843200435818403"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <small className="ad-label-tag">{label}</small>
    </aside>
  );
}

function downloadTxtFile(filename, text) {
  const element = document.createElement('a');
  const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroCarouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = heroCarouselItems[index];

  return (
    <section className="carousel-section" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="carousel-header-row">
        <div>
          <span className="eyebrow">Visual Proof</span>
          <h2>Examples Created Using Prompts from Our Platform</h2>
        </div>
        <div className="carousel-controls">
          <button
            className="carousel-btn"
            onClick={() => setIndex((prev) => (prev - 1 + heroCarouselItems.length) % heroCarouselItems.length)}
            aria-label="Previous example"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="carousel-btn"
            onClick={() => setIndex((prev) => (prev + 1) % heroCarouselItems.length)}
            aria-label="Next example"
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="carousel-card">
        <div className="carousel-preview-box">
          <div className="carousel-badge">{active.badge}</div>
          <img src={active.image} alt={active.title} className="carousel-img" />
        </div>
        <div className="carousel-info-box">
          <span className="carousel-meta-tag">{active.businessType} Campaign</span>
          <h3>{active.title}</h3>
          <p className="carousel-snippet">"{active.promptSnippet}"</p>
          <div className="carousel-footer-note">
            <BadgeCheck size={16} /> <span>Generated with Likhwai.Online Marketing Prompt Architecture</span>
          </div>
        </div>
      </div>

      <div className="carousel-dots">
        {heroCarouselItems.map((item, i) => (
          <button
            key={item.id}
            className={`carousel-dot${i === index ? ' active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

function SupportedModelsBar() {
  return (
    <section className="models-section">
      <div className="models-header">
        <span className="eyebrow">Universal AI Compatibility</span>
        <h2>Compatible with All Leading AI Image Generators</h2>
        <p>Copy structured prompts directly from our platform into your favorite AI tool.</p>
      </div>
      <div className="models-grid">
        {supportedAiModels.map((model) => (
          <div className="model-card" key={model.name}>
            <div className="model-card-top">
              <strong>{model.name}</strong>
              <span className="model-badge">{model.badge}</span>
            </div>
            <p>{model.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MarketingSummary({ form }) {
  const colors = form.brandColors || 'Custom Hex / Niche Match';
  const tone = form.brandTone || 'Professional & Inviting';
  const cta = form.cta || 'Contact / Visit Store';
  const focus = form.visualFocalPoint || 'Hero Product & Special Offer';

  return (
    <div className="marketing-summary-card">
      <div className="summary-header">
        <Sparkles size={20} className="summary-sparkle" />
        <div>
          <h3>AI Marketing Strategy Analysis</h3>
          <p>Key parameters extracted from your campaign brief before prompt generation</p>
        </div>
      </div>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">Business Category:</span>
          <strong>{form.businessType}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Post Goal:</span>
          <strong>{form.postGoal}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Target Audience:</span>
          <strong>{form.targetAudience}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Visual Focus:</span>
          <strong>{focus}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Recommended Colors:</span>
          <strong>{colors}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Marketing Personality:</span>
          <strong>{tone}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Call To Action:</span>
          <strong>{cta}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Suggested AI Models:</span>
          <strong>ChatGPT, Midjourney, Flux, Gemini</strong>
        </div>
      </div>
    </div>
  );
}

function fieldPlaceholder(name) {
  const map = {
    businessName: 'Example: Green Leaf Cafe',
    businessWebsite: 'Example: https://greenleafcafe.com',
    businessAddress: 'Example: GS Road, Guwahati',
    brandColors: 'Example: green, cream, charcoal',
    headline: 'Example: 20% Off Weekend Combo',
    subheadline: 'Example: Fresh meals for family evenings',
    offerDetails: 'Example: Valid till Sunday',
    cta: 'Example: Book Now',
    contactInfo: 'Example: 98765 43210',
    highlights: 'Example: fresh ingredients, free delivery, family pack',
    avoid: 'Example: avoid dark colors, avoid too much text',
  };
  return map[name] ?? '';
}

function ToolPage({ navigate, isGenerateOnly = false }) {
  const [form, setForm] = useState(defaultForm);
  const [history, setHistory] = useState(() => {
    const saved = window.localStorage.getItem('description-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [step, setStep] = useState(1);
  const [captcha, setCaptcha] = useState(() => createCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const generationTimer = useRef(null);

  const specialityOptions = Object.keys(businessTypes[form.businessType].specialities);
  const postGoalOptions = businessRules[form.businessType]?.postGoals ?? Object.keys(optionMappings.postGoal);
  const stepInfo = STEP_TITLES[step];

  useSeo({
    title: 'AI Marketing Prompt Builder & Engineering Platform',
    description:
      'Generate high-quality marketing prompts for ChatGPT, Midjourney, Flux, and AI image generators without learning prompt engineering. Developed by Insight Computers.',
    path: '/',
    schema: pageSchema('AI Marketing Prompt Builder & Engineering Platform', '/', SITE.description, [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE.productName,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: SITE.description,
        author: { '@type': 'Organization', name: SITE.companyName },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.slice(0, 5).map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ]),
  });

  useEffect(() => () => clearTimeout(generationTimer.current), []);

  useEffect(() => {
    window.localStorage.setItem('description-history', JSON.stringify(history.slice(0, 8)));
  }, [history]);

  function updateField(name, value) {
    setCopied(false);
    setForm((prev) => {
      if (name === 'businessType') {
        const nextSpeciality = Object.keys(businessTypes[value].specialities)[0];
        const nextGoals = businessRules[value]?.postGoals ?? Object.keys(optionMappings.postGoal);
        const nextGoal = nextGoals.includes(prev.postGoal) ? prev.postGoal : nextGoals[0];
        return { ...prev, businessType: value, speciality: nextSpeciality, postGoal: nextGoal };
      }
      return { ...prev, [name]: value };
    });
  }

  async function copyDescription() {
    if (!generated) return;
    const textToCopy = isEditing ? editedPrompt : generated.description;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setHistory((prev) => [
      { id: crypto.randomUUID(), form: generated.form, description: textToCopy, createdAt: new Date().toISOString() },
      ...prev,
    ].slice(0, 8));
  }

  function submitForm() {
    if (captchaInput.trim() !== captcha.answer) {
      setCaptchaError('Please solve the security check correctly before creating the prompt.');
      return;
    }

    setCaptchaError('');
    setCopied(false);
    setGenerated(null);
    setIsEditing(false);
    setIsGenerating(true);
    clearTimeout(generationTimer.current);
    setCaptchaInput('');
    setCaptcha(createCaptcha());
    const submittedForm = { ...form };
    const desc = buildDescription(submittedForm);
    generationTimer.current = setTimeout(() => {
      setGenerated({ form: submittedForm, description: desc });
      setEditedPrompt(desc);
      setIsGenerating(false);
    }, 4000);
  }

  function resetForm() {
    setCopied(false);
    setIsGenerating(false);
    setGenerated(null);
    setIsEditing(false);
    setEditedPrompt('');
    clearTimeout(generationTimer.current);
    setForm(defaultForm);
    setStep(1);
    setCaptcha(createCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
  }

  function renderStepFields() {
    return STEP_FIELDS[step].map((name) => {
      if (name === 'highlights' || name === 'avoid') {
        return <TextAreaField key={name} name={name} value={form[name]} onChange={updateField} placeholder={fieldPlaceholder(name)} />;
      }
      if (
        name === 'businessName' ||
        name === 'businessWebsite' ||
        name === 'businessAddress' ||
        name === 'brandColors' ||
        name === 'headline' ||
        name === 'subheadline' ||
        name === 'offerDetails' ||
        name === 'cta' ||
        name === 'contactInfo'
      ) {
        return <TextField key={name} name={name} value={form[name]} onChange={updateField} placeholder={fieldPlaceholder(name)} />;
      }
      let options;
      if (name === 'businessType') options = Object.keys(businessTypes);
      else if (name === 'speciality') options = specialityOptions;
      else if (name === 'postGoal') options = postGoalOptions;
      else options = Object.keys(optionMappings[name]);
      return <SelectField key={name} name={name} value={form[name]} options={options} onChange={updateField} />;
    });
  }

  return (
    <>
      <header className="topbar saas-hero">
        <div>
          <div className="product-by-badge">
            <Sparkles size={14} /> A Product by <span className="royal-blue">Insight Computers</span>
          </div>
          <h1>{isGenerateOnly ? 'Generate AI Marketing Prompt' : 'Create Professional AI Marketing Prompts in Seconds'}</h1>
          <p className="topbar-help">
            {isGenerateOnly
              ? 'Fill out the guided choices below to create a structured marketing prompt brief in seconds.'
              : 'Generate high-quality marketing prompts for ChatGPT, Midjourney, Flux, and other AI image generators without learning prompt engineering. Position your business with expert marketing analysis and conversion psychology.'}
          </p>
          {!isGenerateOnly ? (
            <div className="hero-cta-buttons">
              <a href="#create" className="primary-button hero-action-btn">
                <Wand2 size={18} /> Generate Prompt Now
              </a>
              <button className="ghost-button hero-action-btn" type="button" onClick={resetForm}>
                <RefreshCw size={18} /> Reset Form
              </button>
              <Link to="/examples" navigate={navigate} className="ghost-button hero-action-btn">
                <Eye size={18} /> Browse Examples
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      {!isGenerateOnly ? (
        <>
          <SupportedModelsBar />
          <HeroCarousel />
        </>
      ) : null}

      <div className="content-grid" id="create">
        <section className="form-panel" aria-labelledby="generator-heading">
          <div className="step-progress" aria-label="Form progress">
            {[1, 2, 3, 4].map((item) => (
              <button
                key={item}
                className={`step-dot${item === step ? ' active' : ''}${item < step ? ' done' : ''}`}
                onClick={() => setStep(item)}
                aria-label={`Go to step ${item}`}
                type="button"
              >
                <span className="step-dot-inner">{item < step ? 'OK' : item}</span>
              </button>
            ))}
          </div>

          <div className="section-heading">
            <BadgeCheck size={19} />
            <div>
              <h2 id="generator-heading">Step {step}: {stepInfo.title}</h2>
              <p>{stepInfo.desc}</p>
            </div>
          </div>

          <div className="form-grid">{renderStepFields()}</div>

          {step === 4 ? (
            <div className="captcha-panel">
              <div>
                <p className="captcha-label">Security check</p>
                <strong>Solve this: {captcha.prompt}</strong>
              </div>
              <div className="captcha-controls">
                <input
                  className="captcha-input"
                  value={captchaInput}
                  inputMode="numeric"
                  placeholder="Type answer"
                  aria-label="Security check answer"
                  onChange={(event) => {
                    setCaptchaInput(event.target.value);
                    if (captchaError) setCaptchaError('');
                  }}
                />
                <button
                  className="ghost-button captcha-refresh"
                  type="button"
                  onClick={() => {
                    setCaptcha(createCaptcha());
                    setCaptchaInput('');
                    setCaptchaError('');
                  }}
                  aria-label="Refresh security check"
                >
                  <RotateCw size={18} />
                </button>
              </div>
              {captchaError ? <p className="captcha-error">{captchaError}</p> : null}
            </div>
          ) : null}

          <div className="form-actions">
            {step > 1 ? (
              <button className="ghost-button" type="button" onClick={() => setStep((current) => Math.max(current - 1, 1))}>
                <ChevronLeft size={18} /> Back
              </button>
            ) : null}
            {step < 4 ? (
              <button className="primary-button" type="button" onClick={() => setStep((current) => Math.min(current + 1, 4))}>
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button className="primary-button submit-button" type="button" onClick={submitForm} disabled={isGenerating}>
                <Sparkles size={18} />
                {isGenerating ? 'Analyzing Campaign...' : 'Generate Marketing Prompt'}
              </button>
            )}
          </div>
        </section>

        <section className="output-panel" aria-live="polite">
          <div className="output-header">
            <div>
              <p className="eyebrow">SaaS Engine Output</p>
              <h2>Generated Prompt & Strategy</h2>
            </div>
            {generated && !isGenerating ? (
              <button className="primary-button copy-large-btn" type="button" onClick={copyDescription}>
                {copied ? <BadgeCheck size={18} /> : <Copy size={18} />}
                {copied ? 'Prompt Copied!' : 'Copy Prompt'}
              </button>
            ) : null}
          </div>

          {isGenerating ? (
            <div className="writing-state" role="status">
              <div className="writer-scene" aria-hidden="true">
                <div className="writer-head" />
                <div className="writer-body" />
                <div className="writer-arm" />
                <div className="writer-paper">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <h3>Analyzing Marketing & Engineering Prompt</h3>
              <p>Extracting consumer psychology cues, visual hierarchy, and exact typography bounds...</p>
              <div className="progress-bar">
                <span />
              </div>
            </div>
          ) : generated ? (
            <div className="generated-content-container">
              <MarketingSummary form={generated.form} />

              <div className="prompt-output-wrapper">
                <div className="prompt-box-header">
                  <strong>Generated AI Prompt Brief</strong>
                  <div className="prompt-box-actions">
                    <button
                      className="ghost-button mini-btn"
                      onClick={() => setIsEditing(!isEditing)}
                      type="button"
                    >
                      <Edit3 size={14} /> {isEditing ? 'Done Editing' : 'Edit Prompt'}
                    </button>
                    <button
                      className="ghost-button mini-btn"
                      onClick={submitForm}
                      type="button"
                    >
                      <RotateCw size={14} /> Regenerate
                    </button>
                    <button
                      className="ghost-button mini-btn"
                      onClick={() => downloadTxtFile('ai-marketing-prompt.txt', isEditing ? editedPrompt : generated.description)}
                      type="button"
                    >
                      <Download size={14} /> Download TXT
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    className="editable-prompt-textarea"
                    rows={12}
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                  />
                ) : (
                  <pre className="generated-prompt-text">{editedPrompt || generated.description}</pre>
                )}
              </div>

              <p className="output-note">{COPY_HINT}</p>
            </div>
          ) : (
            <div className="output-empty">
              <Wand2 size={38} />
              <h3>Your AI Marketing Prompt Will Appear Here</h3>
              <p>Complete the guided choices on the left and click Generate. Receive a structured prompt with copy, strategy analysis, and download options.</p>
            </div>
          )}
        </section>
      </div>

      <AdSlot label="Advertisement space below prompt generator" />
      {!isGenerateOnly ? (
        <>
          <ContentSections navigate={navigate} />
          <RecentGuides navigate={navigate} />
          <Testimonials />
        </>
      ) : null}
      <FAQSection />
      {!isGenerateOnly ? <HistoryPanel history={history} onRestore={setForm} /> : null}
    </>
  );
}

function HistoryPanel({ history, onRestore }) {
  if (!history || history.length === 0) return null;

  return (
    <section className="content-section history-wide" id="history">
      <p className="eyebrow">Recent History</p>
      <h2>Your recent prompt descriptions</h2>
      <HistoryList items={history} onRestore={onRestore} />
    </section>
  );
}

function GalleryPage({ path, navigate }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const categories = ['All', 'Restaurant', 'Salon', 'Gym', 'Medical', 'Fashion', 'Hotel', 'Bakery', 'Cafe', 'Festival', 'Retail'];
  const filtered = activeCategory === 'All' ? examplesGallery : examplesGallery.filter((item) => item.category === activeCategory);

  const description = 'Browse marketing poster examples created using AI image prompts generated by Likhwai.Online platform.';

  useSeo({
    title: 'Examples Gallery',
    description,
    path,
    schema: pageSchema('Examples Gallery', path, description),
  });

  async function copyPrompt(id, text) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  return (
    <ArticleShell
      title="Marketing Poster Examples Gallery"
      description="Real poster concepts and copy-ready AI prompts generated by our platform for ChatGPT, Midjourney, Flux, and Ideogram."
      path={path}
      navigate={navigate}
    >
      <div className="category-filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip${activeCategory === cat ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filtered.map((item) => (
          <article className="gallery-card" key={item.id}>
            <div className="gallery-card-header">
              <span className="service-deliverable">{item.businessType}</span>
              <h3>{item.title}</h3>
            </div>
            <div className="prompt-preview-box">
              <pre>{item.prompt}</pre>
              <button className="primary-button copy-mini" onClick={() => copyPrompt(item.id, item.prompt)} type="button">
                {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                {copiedId === item.id ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
            <div className="gallery-strategy-box">
              <strong>Prompt Engineering & Psychology Strategy:</strong>
              <p>{item.explanation}</p>
            </div>
            <div className="gallery-tips-box">
              <strong>Actionable Tips:</strong>
              <ul>
                {item.marketingTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <AdSlot label="Advertisement space on Gallery page" />
    </ArticleShell>
  );
}

function LibraryPage({ path, navigate }) {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return promptLibrary;
    return promptLibrary.filter((item) =>
      `${item.title} ${item.category} ${item.goal} ${item.promptText}`.toLowerCase().includes(q)
    );
  }, [search]);

  const description = 'Searchable collection of high-converting AI marketing prompt blueprints for local business campaigns.';

  useSeo({
    title: 'Prompt Library',
    description,
    path,
    schema: pageSchema('Prompt Library', path, description),
  });

  async function copyPrompt(id, text) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  return (
    <ArticleShell
      title="AI Marketing Prompt Library"
      description="Search pre-engineered prompt blueprints for instant promotional posts across 20+ industries."
      path={path}
      navigate={navigate}
    >
      <label className="search-box">
        <Search size={18} />
        <input
          value={search}
          placeholder="Search blueprints by niche (e.g. Restaurant, Salon, Discount, Festival, Gym)"
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      <div className="library-grid">
        {filtered.map((item) => (
          <article className="library-card" key={item.id}>
            <div className="library-card-top">
              <div>
                <span className="result-type">{item.category} • {item.goal}</span>
                <h3>{item.title}</h3>
              </div>
              <span className="platform-tag">{item.platform}</span>
            </div>
            <pre className="library-prompt-box">{item.promptText}</pre>
            <div className="library-card-bottom">
              <button className="primary-button" onClick={() => copyPrompt(item.id, item.promptText)} type="button">
                {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                {copiedId === item.id ? 'Copied to Clipboard' : 'Copy Blueprint Prompt'}
              </button>
            </div>
          </article>
        ))}
      </div>

      <AdSlot label="Advertisement space on Prompt Library page" />
    </ArticleShell>
  );
}

function TemplatesPage({ path, navigate }) {
  const description = 'Browse AI marketing prompt templates grouped by industry category and campaign goals.';

  useSeo({
    title: 'Templates',
    description,
    path,
    schema: pageSchema('Templates', path, description),
  });

  return (
    <ArticleShell
      title="Industry Prompt Templates"
      description="Pre-configured marketing blueprints optimized for high conversion across popular business niches."
      path={path}
      navigate={navigate}
    >
      <div className="templates-grid">
        {templatesData.map((tpl) => (
          <article className="info-card template-card" key={tpl.title}>
            <div className="template-badge">{tpl.difficulty}</div>
            <h3>{tpl.title}</h3>
            <p><strong>Niche:</strong> {tpl.category} | <strong>Goal:</strong> {tpl.goal}</p>
            <Link to="/" navigate={navigate} className="primary-button service-action">
              Load into Generator <ChevronRight size={16} />
            </Link>
          </article>
        ))}
      </div>

      <AdSlot label="Advertisement space on Templates page" />
    </ArticleShell>
  );
}

function HowItWorksPage({ path, navigate }) {
  const description = 'Step-by-step visual guide for creating professional AI marketing prompts with Likhwai.Online.';

  useSeo({
    title: 'How It Works',
    description,
    path,
    schema: pageSchema('How It Works', path, description),
  });

  return (
    <ArticleShell
      title="How Likhwai.Online Works"
      description="From raw business offer to high-converting AI marketing creative in simple visual steps."
      path={path}
      navigate={navigate}
    >
      <div className="workflow-timeline">
        {howItWorksSteps.map((s, idx) => (
          <div className="timeline-step-card" key={s.stepNum}>
            <div className="timeline-card-header">
              <div className="timeline-badge">{s.stepNum}</div>
              <h3>{s.title}</h3>
            </div>
            <p className="timeline-desc">{s.desc}</p>
            {s.image ? (
              <div className="timeline-img-wrapper">
                <img src={s.image} alt={s.title} className="timeline-step-img" loading="lazy" />
              </div>
            ) : null}
            {idx < howItWorksSteps.length - 1 ? <div className="timeline-connector-down"><ArrowRight size={18} /></div> : null}
          </div>
        ))}
      </div>

      <div className="cta-box">
        <h3>Ready to Create Your First Marketing Prompt?</h3>
        <p>Zero prompt engineering experience required. 100% Free to use.</p>
        <Link to="/" navigate={navigate} className="primary-button">
          Open AI Prompt Builder <Sparkles size={16} />
        </Link>
      </div>

      <AdSlot label="Advertisement space on How It Works page" />
    </ArticleShell>
  );
}

function FeaturesPage({ path, navigate }) {
  const description = 'Explore the 8 core features of Likhwai.Online AI Marketing Prompt Platform.';

  useSeo({
    title: 'Platform Features',
    description,
    path,
    schema: pageSchema('Platform Features', path, description),
  });

  const features = [
    { title: 'AI Marketing Analysis', desc: 'Extracts campaign intent, emotional triggers, and audience parameters automatically.' },
    { title: 'Prompt Engineering', desc: 'Converts plain business input into structured visual directions adhering to multimodal LLM rules.' },
    { title: 'Industry Templates', desc: 'Tailored prompt blueprints for 23+ local business categories.' },
    { title: 'Festival Campaigns', desc: 'Culturally authentic greetings combined with elegant promotional discounts.' },
    { title: 'Marketing Psychology', desc: 'Incorporates urgency, social proof, scarcity, and authority visual triggers.' },
    { title: 'One-Click Copy & TXT Download', desc: 'Instant clipboard copying and text file downloads for easy team sharing.' },
    { title: 'AI Model Optimization', desc: 'Parameters tailored for ChatGPT, Midjourney v6, Flux, and Ideogram.' },
    { title: 'SEO Friendly Structure', desc: 'Clean layout bounds, brand logo attachment prompts, and mobile ratio rules.' },
  ];

  return (
    <ArticleShell
      title="Platform Capabilities & Features"
      description="Built for business owners, marketers, and agencies needing fast, reliable AI design directions."
      path={path}
      navigate={navigate}
    >
      <div className="info-grid two">
        {features.map((feat) => (
          <article className="info-card" key={feat.title}>
            <CheckCircle2 size={24} className="feature-icon" />
            <h3>{feat.title}</h3>
            <p>{feat.desc}</p>
          </article>
        ))}
      </div>

      <AdSlot label="Advertisement space on Features page" />
    </ArticleShell>
  );
}

function PricingPage({ path, navigate }) {
  const description = 'View Free, Pro, and Agency pricing plans for Likhwai.Online AI Marketing Prompt Platform.';

  useSeo({
    title: 'Pricing & SaaS Plans',
    description,
    path,
    schema: pageSchema('Pricing & SaaS Plans', path, description),
  });

  return (
    <ArticleShell
      title="Simple, Accessible Pricing"
      description="Likhwai.Online is currently 100% Free. Premium SaaS plans are coming soon for advanced team features."
      path={path}
      navigate={navigate}
    >
      <div className="pricing-grid">
        <div className="pricing-card active">
          <span className="pricing-tag">Current Plan</span>
          <h3>Free Forever</h3>
          <div className="pricing-price">$0 <span>/ month</span></div>
          <p>Perfect for local small business owners, freelancers, and independent creators.</p>
          <ul>
            <li><Check size={16} /> Unlimited Prompt Generation</li>
            <li><Check size={16} /> All 23+ Business Categories</li>
            <li><Check size={16} /> One-Click Copy & TXT Download</li>
            <li><Check size={16} /> Local Browser History</li>
            <li><Check size={16} /> Ad-Supported Access</li>
          </ul>
          <Link to="/" navigate={navigate} className="primary-button">Use Free Plan</Link>
        </div>

        <div className="pricing-card">
          <span className="pricing-tag coming-soon">Coming Soon</span>
          <h3>Pro Marketer</h3>
          <div className="pricing-price">$19 <span>/ month</span></div>
          <p>For growing brands and professional marketers needing saved templates.</p>
          <ul>
            <li><Check size={16} /> Everything in Free</li>
            <li><Check size={16} /> Custom Brand Asset Profiles</li>
            <li><Check size={16} /> Saved Template Collections</li>
            <li><Check size={16} /> Ad-Free Experience</li>
            <li><Check size={16} /> Priority Support</li>
          </ul>
          <button className="ghost-button" disabled type="button">Coming Soon</button>
        </div>

        <div className="pricing-card">
          <span className="pricing-tag coming-soon">Coming Soon</span>
          <h3>Agency Team</h3>
          <div className="pricing-price">$49 <span>/ month</span></div>
          <p>For marketing agencies handling multi-client campaign portfolios.</p>
          <ul>
            <li><Check size={16} /> Everything in Pro</li>
            <li><Check size={16} /> 5 Team Member Seats</li>
            <li><Check size={16} /> Client Workspace Management</li>
            <li><Check size={16} /> Custom API Export Options</li>
            <li><Check size={16} /> Dedicated Account Manager</li>
          </ul>
          <button className="ghost-button" disabled type="button">Coming Soon</button>
        </div>
      </div>

      <AdSlot label="Advertisement space on Pricing page" />
    </ArticleShell>
  );
}

function AboutPage({ path, navigate }) {
  const description = 'Learn about Likhwai.Online, developed and maintained by Insight Computers, building AI-powered SaaS platforms for businesses.';

  useSeo({
    title: 'About Us',
    description,
    path,
    schema: pageSchema('About Us', path, description, [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Likhwai.Online',
        description,
        publisher: { '@type': 'Organization', name: SITE.companyName, url: SITE.origin },
      },
    ]),
  });

  return (
    <ArticleShell
      title="About Likhwai.Online"
      description="A flagship AI marketing platform designed, developed, and maintained by Insight Computers."
      path={path}
      navigate={navigate}
    >
      <section className="about-company-hero">
        <div className="company-badge-pill">
          <Sparkles size={16} /> Developed by <span className="royal-blue">Insight Computers</span>
        </div>
        <h2>Building AI-Powered SaaS Products for Modern Businesses</h2>
        <p>
          Likhwai.Online is officially created and operated by <strong className="royal-blue">Insight Computers</strong>. Our mission is to engineer practical, intuitive, and accessible AI software tools that simplify digital marketing and creative workflows for small businesses, freelancers, and agencies worldwide.
        </p>
      </section>

      <section className="about-hero-section">
        <div className="about-grid">
          <div className="about-card">
            <span className="eyebrow">Our Mission</span>
            <h2>Democratizing Professional AI Prompt Architecture</h2>
            <p>
              We bridge the gap between business owners' marketing goals and complex AI prompt engineering requirements. Instead of forcing users to learn technical jargon like "octane render" or "focal length", our platform asks plain business questions and generates structured visual directions that ChatGPT, Midjourney, and Flux parse with 100% accuracy.
            </p>
          </div>
          <div className="about-card highlight">
            <span className="eyebrow">Our Vision</span>
            <h2>Empowering Local Commerce</h2>
            <p>
              Local cafes, salons, clinics, and retail stores know their products better than anyone. <strong className="royal-blue">Insight Computers</strong> builds tools that turn that raw business knowledge into high-converting social media marketing assets in seconds.
            </p>
          </div>
        </div>
      </section>

      <section className="pillars-section">
        <h2>Our Core Quality & Design Pillars</h2>
        <div className="info-grid four">
          <article className="info-card">
            <ShieldCheck size={28} />
            <h3>Ad-Policy Safety</h3>
            <p>We actively discourage deceptive badges or false guarantee icons in generated visual briefs—ensuring your ad creatives comply with advertising standards.</p>
          </article>
          <article className="info-card">
            <Users size={28} />
            <h3>Customer Psychology</h3>
            <p>Prompts are tailored to trigger the right emotional connection: appetite for dining, trust for education, elegance for salons, and urgency for flash sales.</p>
          </article>
          <article className="info-card">
            <Layers size={28} />
            <h3>Visual Hierarchy</h3>
            <p>Every generated brief provides clear boundaries between main headlines, secondary copy, logo placement, and focal images for clean mobile feed readability.</p>
          </article>
          <article className="info-card">
            <Lightbulb size={28} />
            <h3>Zero Jargon</h3>
            <p>No need to memorize technical terms. Plain business language powers every option in our prompt builder.</p>
          </article>
        </div>
      </section>

      <section className="insight-products-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Product Ecosystem</span>
            <h2>More Products from <span className="royal-blue">Insight Computers</span></h2>
          </div>
        </div>
        <div className="info-grid three">
          {insightProducts.map((prod) => (
            <article className="info-card product-card" key={prod.id}>
              <span className="product-status">{prod.status}</span>
              <h3>{prod.name}</h3>
              <p>{prod.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-transparency-section">
        <h2>Publisher Information & Trust Standards</h2>
        <div className="info-card">
          <p>
            <strong className="royal-blue">Insight Computers</strong> operates Likhwai.Online under strict quality standards and full user privacy compliance:
          </p>
          <ul>
            <li><strong>Zero Mandatory Registration:</strong> Instant browser-based web access without compulsory email sign-up.</li>
            <li><strong>Privacy First:</strong> Your business form details are processed in real time and saved locally in your browser storage.</li>
            <li><strong>AdSense Supported:</strong> Supported by unobtrusive online advertising to maintain free access for all users.</li>
          </ul>
        </div>
      </section>

      <AdSlot label="Advertisement space on About page" />
    </ArticleShell>
  );
}

function ContactPage({ path, navigate }) {
  const description = `Contact Insight Computers support team at ${SITE.email} for help with Likhwai.Online AI Marketing Prompt Builder.`;
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [captcha, setCaptcha] = useState(createCaptcha);
  const [userCaptcha, setUserCaptcha] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useSeo({
    title: 'Contact Us',
    description,
    path,
    schema: pageSchema('Contact Us', path, description),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (parseInt(userCaptcha.trim(), 10) !== captcha.answer) {
      setErrorMsg('Incorrect captcha security answer. Please try again.');
      setCaptcha(createCaptcha());
      setUserCaptcha('');
      return;
    }
    setSubmitted(true);
    setErrorMsg('');
  }

  return (
    <ArticleShell
      title="Contact Insight Computers Support"
      description="Have questions about Likhwai.Online AI Marketing Prompt Builder? Get in touch with our support team."
      path={path}
      navigate={navigate}
    >
      <div className="contact-grid">
        <div className="contact-form-section">
          {submitted ? (
            <div className="status-banner success">
              <CheckCircle size={20} />
              <div>
                <strong>Message Sent Successfully!</strong>
                <p>Thank you for contacting Insight Computers. We will respond to {formData.email} within 24 hours.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <h3>Send Us a Direct Message</h3>
              <p>Fill out the form below or reach out via email. Our technical team responds within 24 hours.</p>

              {errorMsg ? (
                <div className="status-banner error">
                  <AlertTriangle size={18} /> <span>{errorMsg}</span>
                </div>
              ) : null}

              <label className="field">
                <span>Your Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Email Address *</span>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Subject *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prompt Customization Inquiry / AdSense Partnership"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Your Message *</span>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your inquiry, feedback, or custom prompt requirement in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </label>

              <div className="field">
                <span>Security Check: What is {captcha.prompt}? *</span>
                <div className="captcha-controls">
                  <input
                    type="number"
                    required
                    placeholder="Enter answer"
                    value={userCaptcha}
                    onChange={(e) => setUserCaptcha(e.target.value)}
                  />
                  <button
                    type="button"
                    className="ghost-button captcha-refresh"
                    onClick={() => {
                      setCaptcha(createCaptcha());
                      setUserCaptcha('');
                    }}
                  >
                    <RefreshCw size={16} /> New Math Check
                  </button>
                </div>
              </div>

              <button type="submit" className="primary-button hero-action-btn">
                Send Message <Send size={16} />
              </button>
            </form>
          )}
        </div>

        <div className="contact-info-section">
          <div className="info-card">
            <h3>Official Contact Information</h3>

            <div className="contact-item">
              <Mail className="contact-item-icon" size={20} />
              <div>
                <strong>Support Email</strong>
                <p><a href={`mailto:${SITE.email}`} className="text-link">{SITE.email}</a></p>
              </div>
            </div>

            <div className="contact-item">
              <Building2 className="contact-item-icon" size={20} />
              <div>
                <strong>Operating Entity & Developer</strong>
                <p>
                  Insight Computers (
                  <a href={SITE.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-link">
                    insightcomputer.in <ExternalLink size={12} />
                  </a>
                  )
                </p>
              </div>
            </div>

            <div className="contact-item">
              <MapPin className="contact-item-icon" size={20} />
              <div>
                <strong>Headquarters Address</strong>
                <p>{SITE.address}</p>
              </div>
            </div>

            <div className="contact-item">
              <Clock className="contact-item-icon" size={20} />
              <div>
                <strong>Support Hours</strong>
                <p>{SITE.supportHours}</p>
              </div>
            </div>
          </div>

          <div className="info-card" style={{ marginTop: '16px' }}>
            <h3>Publisher Transparency</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <strong>Likhwai.Online</strong> is an independent AI Marketing Prompt Engineering Platform maintained by <strong>Insight Computers</strong>. We respond to technical inquiries, copyright notices, and feedback within 24 hours.
            </p>
          </div>
        </div>
      </div>

      <AdSlot label="Advertisement space on Contact page" />
    </ArticleShell>
  );
}

function ContentSections({ navigate }) {
  return (
    <section className="content-section" aria-labelledby="tool-guide-heading">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Guide</p>
          <h2 id="tool-guide-heading">How to use Likhwai.Online Marketing Prompt Builder</h2>
        </div>
        <Link to="/faq" navigate={navigate} className="text-link">Read FAQ</Link>
      </div>
      <div className="info-grid">
        {toolGuides.map((item) => (
          <article className="info-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecentGuides({ navigate }) {
  return (
    <section className="content-section">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Latest Guides</p>
          <h2>AI prompt engineering guides for local businesses</h2>
        </div>
        <Link to="/blog" navigate={navigate} className="text-link">View all guides</Link>
      </div>
      <div className="article-grid">
        {blogPosts.slice(0, 6).map((post) => (
          <ArticleCard key={post.slug} post={post} navigate={navigate} />
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="content-section">
      <p className="eyebrow">Trust Signals</p>
      <h2>Built for practical business workflows</h2>
      <div className="info-grid three">
        {testimonials.map((item) => (
          <blockquote className="info-card" key={item.name}>
            <p>{item.quote}</p>
            <cite>{item.name}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="content-section">
      <p className="eyebrow">FAQ</p>
      <h2>Frequently asked questions</h2>
      <div className="faq-list">
        {faqItems.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function PolicyPage({ page, path, navigate }) {
  useSeo({
    title: page.title,
    description: page.description,
    path,
    schema: pageSchema(page.title, path, page.description),
  });

  return (
    <ArticleShell title={page.title} description={page.description} path={path} navigate={navigate}>
      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}
      {page.slug === 'faq' ? <FAQSection /> : null}
    </ArticleShell>
  );
}

function FAQPage({ path, navigate }) {
  const description = 'Frequently asked questions about Likhwai.Online AI Marketing Prompt Platform, business use, and privacy.';
  useSeo({
    title: 'FAQ',
    description,
    path,
    schema: pageSchema('FAQ', path, description, [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ]),
  });

  return (
    <ArticleShell title="FAQ" description={description} path={path} navigate={navigate}>
      <FAQSection />
    </ArticleShell>
  );
}

function BlogIndex({ path, navigate }) {
  const description = 'Browse AI prompt writing guides for ChatGPT, image generation, marketing, and small business social media posts.';
  useSeo({
    title: 'AI Prompt Blog',
    description,
    path,
    schema: pageSchema('AI Prompt Blog', path, description),
  });

  return (
    <ArticleShell title="AI Prompt Blog" description={description} path={path} navigate={navigate}>
      <AdSlot label="Advertisement space below blog introduction" />
      <div className="article-grid">
        {blogPosts.map((post) => (
          <ArticleCard key={post.slug} post={post} navigate={navigate} />
        ))}
      </div>
    </ArticleShell>
  );
}

function ArticleCard({ post, navigate }) {
  return (
    <article className="article-card">
      <h3>
        <Link to={`/blog/${post.slug}`} navigate={navigate}>{post.title}</Link>
      </h3>
      <p>{post.description}</p>
      <Link to={`/blog/${post.slug}`} navigate={navigate} className="text-link">
        Read guide <ExternalLink size={14} />
      </Link>
    </article>
  );
}

function BlogArticle({ post, path, navigate }) {
  const schema = pageSchema(post.title, path, post.description, [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      author: { '@type': 'Organization', name: SITE.name },
      publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: absoluteUrl(SITE.logo) } },
      mainEntityOfPage: absoluteUrl(path),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ]);

  useSeo({
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    path,
    schema,
  });

  const c = post.content || {};

  return (
    <ArticleShell title={post.title} description={post.description} path={path} navigate={navigate}>
      <nav className="toc" aria-label="Table of contents">
        <h2>Table of contents</h2>
        {post.headings.map((heading) => (
          <a key={heading} href={`#${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{heading}</a>
        ))}
      </nav>
      <AdSlot label="Advertisement space below article introduction" />

      <section id="why-this-topic-matters">
        <h2>Why this topic matters</h2>
        <p>{c.whyItMatters}</p>
      </section>

      <section id="prompt-structure-and-rules">
        <h2>Prompt structure & rules</h2>
        <p>{c.structure}</p>
      </section>

      <section id="step-by-step-workflow">
        <h2>Step-by-step workflow</h2>
        <p>{c.workflow}</p>
        <AdSlot label="Advertisement space between article sections" />
      </section>

      <section id="copy-ready-prompt-example">
        <h2>Copy-ready prompt example</h2>
        <p>You can copy and adapt the following structured visual prompt directly for ChatGPT, Midjourney, or Flux:</p>
        <pre className="prompt-code-block">
          <code>{c.examplePrompt}</code>
        </pre>
      </section>

      <section id="common-mistakes-to-avoid">
        <h2>Common mistakes to avoid</h2>
        <p>{c.mistakes}</p>
      </section>

      <section id="faq-and-best-practices">
        <h2>FAQ & Best Practices</h2>
        <div className="faq-list">
          {post.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section>
        <h2>Related guides</h2>
        <div className="related-links">
          {post.related.map((slug) => {
            const related = blogPosts.find((item) => item.slug === slug);
            return related ? <Link key={slug} to={`/blog/${slug}`} navigate={navigate}>{related.title}</Link> : null;
          })}
        </div>
      </section>
    </ArticleShell>
  );
}

function SearchPage({ path, navigate }) {
  const params = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(params.get('q') || '');
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return searchableRecords;
    return searchableRecords.filter((record) =>
      `${record.title} ${record.description} ${record.type}`.toLowerCase().includes(needle),
    );
  }, [query]);
  const description = 'Search Likhwai.Online pages, policy documents, prompt guides, and AI marketing articles.';

  useSeo({
    title: 'Search',
    description,
    path,
    schema: pageSchema('Search', path, description),
  });

  return (
    <ArticleShell title="Search" description={description} path={path} navigate={navigate}>
      <label className="search-box">
        <Search size={18} />
        <input value={query} placeholder="Search guides, policies, or prompt topics" onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="search-results">
        {results.length ? (
          results.map((result) => (
            <article className="article-card" key={result.path}>
              <span className="result-type">{result.type}</span>
              <h3><Link to={result.path} navigate={navigate}>{result.title}</Link></h3>
              <p>{result.description}</p>
            </article>
          ))
        ) : (
          <div className="output-empty small">
            <h2>No results found</h2>
            <p>Try a broader word such as prompt, business, image, policy, or ChatGPT.</p>
          </div>
        )}
      </div>
    </ArticleShell>
  );
}

function SitemapPage({ path, navigate }) {
  const description = 'Human-readable sitemap for Likhwai.Online pages, policies, and blog guides.';
  useSeo({
    title: 'Sitemap',
    description,
    path,
    schema: pageSchema('Sitemap', path, description),
  });

  return (
    <ArticleShell title="Sitemap" description={description} path={path} navigate={navigate}>
      <div className="sitemap-list">
        <Link to="/" navigate={navigate}>Home and prompt tool</Link>
        <Link to="/examples" navigate={navigate}>Examples Gallery</Link>
        <Link to="/library" navigate={navigate}>Prompt Library</Link>
        <Link to="/templates" navigate={navigate}>Templates</Link>
        <Link to="/how-it-works" navigate={navigate}>How It Works</Link>
        <Link to="/features" navigate={navigate}>Features</Link>
        <Link to="/pricing" navigate={navigate}>Pricing</Link>
        <Link to="/services" navigate={navigate}>Services</Link>
        <Link to="/why-us" navigate={navigate}>Why Choose Us</Link>
        <Link to="/blog" navigate={navigate}>Blog</Link>
        <Link to="/search" navigate={navigate}>Search</Link>
        <Link to="/faq" navigate={navigate}>FAQ</Link>
        {policyPages.map((page) => (
          <Link key={page.slug} to={`/${page.slug}`} navigate={navigate}>{page.title}</Link>
        ))}
        {blogPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} navigate={navigate}>{post.title}</Link>
        ))}
      </div>
    </ArticleShell>
  );
}

function ErrorPage({ code, path, navigate }) {
  const title = code === 500 ? 'Server Error' : 'Page Not Found';
  const description =
    code === 500
      ? 'Something went wrong while loading this page. Return to the prompt tool or search the site.'
      : 'The page you requested could not be found. Use the sitemap, search, or return to the prompt tool.';

  useSeo({
    title,
    description,
    path,
    robots: 'noindex,follow',
    schema: pageSchema(title, path, description),
  });

  return (
    <ArticleShell title={`${code} - ${title}`} description={description} path={path} navigate={navigate}>
      <div className="error-actions">
        <Link to="/" navigate={navigate} className="primary-button"><Home size={18} /> Go home</Link>
        <Link to="/search" navigate={navigate} className="ghost-button"><Search size={18} /> Search site</Link>
      </div>
    </ArticleShell>
  );
}

function ServicesPage({ path, navigate }) {
  const description = 'Explore AI prompt briefing, marketing copy structure, and niche visual direction services by Likhwai.Online.';

  useSeo({
    title: 'Services & AI Briefing Capabilities',
    description,
    path,
    schema: pageSchema('Services & AI Briefing Capabilities', path, description, [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Likhwai.Online Marketing & Prompt Services',
        itemListElement: servicesData.map((s, idx) => ({
          '@type': 'Service',
          position: idx + 1,
          name: s.title,
          description: s.details,
          provider: { '@type': 'Organization', name: SITE.name },
        })),
      },
    ]),
  });

  return (
    <ArticleShell
      title="Our Services & AI Briefing Capabilities"
      description="We empower small businesses, local services, and digital agencies with structured AI prompt architecture and marketing design direction."
      path={path}
      navigate={navigate}
    >
      <div className="services-grid">
        {servicesData.map((service) => (
          <article className="service-card" key={service.id}>
            <div className="service-header">
              <span className="service-icon"><Zap size={24} /></span>
              <div>
                <h3>{service.title}</h3>
                <span className="service-deliverable">{service.deliverable}</span>
              </div>
            </div>
            <p className="service-short">{service.shortDesc}</p>
            <div className="service-meta">
              <strong>Who it is for:</strong> {service.forWho}
            </div>
            <p className="service-details">{service.details}</p>
            <Link to="/" navigate={navigate} className="primary-button service-action">
              Use Free Brief Generator <ChevronRight size={16} />
            </Link>
          </article>
        ))}
      </div>

      <section className="workflow-section">
        <h2>How Our Prompt Briefing Process Works</h2>
        <div className="info-grid four">
          <div className="info-card">
            <span className="step-number">01</span>
            <h3>Select Business Niche</h3>
            <p>Specify your industry category so emotional triggers and design expectations align with your customers.</p>
          </div>
          <div className="info-card">
            <span className="step-number">02</span>
            <h3>Define Post Goal & Offer</h3>
            <p>Input your headline, discount, event date, and specific call to action without worrying about prompt syntax.</p>
          </div>
          <div className="info-card">
            <span className="step-number">03</span>
            <h3>Choose Visual Mood & Density</h3>
            <p>Pick layout ratios, text size priority, brand colors, and visual focal points suited for your social feed.</p>
          </div>
          <div className="info-card">
            <span className="step-number">04</span>
            <h3>Copy to ChatGPT & Generate</h3>
            <p>Copy the generated structured description into ChatGPT or Midjourney with your brand logo to create artwork.</p>
          </div>
        </div>
      </section>

      <AdSlot label="Advertisement space on Services page" />
    </ArticleShell>
  );
}

function WhyUsPage({ path, navigate }) {
  const description = 'Discover why small business owners and marketers choose Likhwai.Online for structured AI image prompt briefs.';

  useSeo({
    title: 'Why Choose Us',
    description,
    path,
    schema: pageSchema('Why Choose Us', path, description),
  });

  return (
    <ArticleShell
      title="Why Choose Likhwai.Online"
      description="Creating effective AI image prompts for small business marketing shouldn't require a degree in design or prompt engineering."
      path={path}
      navigate={navigate}
    >
      <div className="why-us-grid">
        {whyUsData.map((item) => (
          <article className="why-card" key={item.id}>
            <div className="why-card-header">
              <CheckCircle2 size={22} className="why-icon" />
              <h3>{item.title}</h3>
            </div>
            <p className="why-summary">{item.summary}</p>
            <p className="why-description">{item.description}</p>
          </article>
        ))}
      </div>

      <section className="comparison-section">
        <h2>Raw One-Line Prompts vs. Likhwai.Online Briefs</h2>
        <div className="table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature / Aspect</th>
                <th>Generic One-Line AI Prompt</th>
                <th>Likhwai.Online Structured Brief</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Visual Composition</strong></td>
                <td>Vague or random background choices</td>
                <td>Defined subject focus, focal points & platform ratio</td>
              </tr>
              <tr>
                <td><strong>Marketing Copy</strong></td>
                <td>Garbled text or missing headline hierarchy</td>
                <td>Exact headline, subheadline, offer & CTA placement</td>
              </tr>
              <tr>
                <td><strong>Consumer Psychology</strong></td>
                <td>None (Generic visuals)</td>
                <td>Niche-tuned emotional cues (Trust, Appetite, Urgency)</td>
              </tr>
              <tr>
                <td><strong>Brand Integrity</strong></td>
                <td>Ignores brand colors and real logos</td>
                <td>Instructions to attach real logo & exact hex/color names</td>
              </tr>
              <tr>
                <td><strong>Ad & Policy Safety</strong></td>
                <td>Risk of generating misleading badges</td>
                <td>Guidelines avoiding false claims or misleading badges</td>
              </tr>
              <tr>
                <td><strong>Accessibility</strong></td>
                <td>Requires prompt engineering knowledge</td>
                <td>100% Free, zero jargon, step-by-step form</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <AdSlot label="Advertisement space on Why Us page" />
    </ArticleShell>
  );
}

function Layout({ children, path, navigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {sidebarOpen ? <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} /> : null}
      <main className="app-shell">
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand-block">
              <img className="brand-logo" src={SITE.logo} alt="Likhwai.Online logo" loading="eager" width="54" height="54" />
              <div>
                <strong>{SITE.name}</strong>
                <span className="brand-subtext">by <span className="royal-blue">Insight Computers</span></span>
              </div>
            </div>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu" type="button">
              <X size={22} />
            </button>
          </div>
          <nav className="nav-list" aria-label="Main navigation">
            <Link className={path === '/' ? 'active' : ''} to="/" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Wand2 size={18} /> Home
            </Link>
            <Link className={path === '/generate-prompt' || path === '/generate' ? 'active' : ''} to="/generate-prompt" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Sparkles size={18} /> Generate Prompt
            </Link>
            <Link className={path === '/examples' ? 'active' : ''} to="/examples" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <ImageIcon size={18} /> Gallery
            </Link>
            <Link className={path === '/library' ? 'active' : ''} to="/library" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <LayoutGrid size={18} /> Library
            </Link>
            <Link className={path === '/templates' ? 'active' : ''} to="/templates" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Grid size={18} /> Templates
            </Link>
            <Link className={path === '/how-it-works' ? 'active' : ''} to="/how-it-works" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Layers size={18} /> How It Works
            </Link>
            <Link className={path === '/features' ? 'active' : ''} to="/features" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Sparkles size={18} /> Features
            </Link>
            <Link className={path === '/pricing' ? 'active' : ''} to="/pricing" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Tag size={18} /> Pricing
            </Link>
            <Link className={path === '/blog' ? 'active' : ''} to="/blog" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <History size={18} /> Blog
            </Link>
            <Link className={path === '/about' ? 'active' : ''} to="/about" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Home size={18} /> About
            </Link>
            <Link className={path === '/contact' ? 'active' : ''} to="/contact" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Mail size={18} /> Contact
            </Link>
            <Link className={path === '/search' ? 'active' : ''} to="/search" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Search size={18} /> Search
            </Link>
          </nav>
          <AdSlot label="Advertisement space for desktop sidebar" />
        </aside>

        <section className="workspace">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu" type="button">
            <Menu size={22} />
          </button>
          {children}
          <Footer navigate={navigate} />
        </section>
      </main>
    </>
  );
}

function Footer({ navigate }) {
  const footerLinks = [
    ['Home', '/'],
    ['Generate Prompt', '/generate-prompt'],
    ['Examples Gallery', '/examples'],
    ['Prompt Library', '/library'],
    ['Templates', '/templates'],
    ['How It Works', '/how-it-works'],
    ['Features', '/features'],
    ['Pricing', '/pricing'],
    ['Blog', '/blog'],
    ['About Us', '/about'],
    ['Contact Us', '/contact'],
    ['Services', '/services'],
    ['Why Us', '/why-us'],
    ['Privacy Policy', '/privacy-policy'],
    ['Terms', '/terms-and-conditions'],
    ['Disclaimer', '/disclaimer'],
    ['Cookie Policy', '/cookie-policy'],
    ['Refund Policy', '/refund-policy'],
    ['DMCA', '/dmca-policy'],
    ['Editorial Policy', '/editorial-policy'],
    ['Copyright', '/copyright'],
    ['FAQ', '/faq'],
    ['Sitemap', '/sitemap'],
  ];

  return (
    <footer className="site-footer">
      <div className="footer-top-row">
        <div>
          <strong>{SITE.name}</strong>
          <span className="footer-company-tag">A Product by <span className="royal-blue">Insight Computers</span></span>
          <p>{SITE.description}</p>
          <p>Support Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
        </div>
      </div>
      <nav aria-label="Footer navigation">
        {footerLinks.map(([label, to]) => (
          <Link key={to} to={to} navigate={navigate}>{label}</Link>
        ))}
      </nav>
      <div className="footer-bottom-bar">
        <p className="copyright">Copyright {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p className="credit-tag">Built with ❤️ by <strong className="royal-blue">Insight Computers</strong></p>
      </div>
    </footer>
  );
}

export default function App() {
  const { path, navigate } = useRoute();
  const policyPage = policyPages.find((page) => `/${page.slug}` === path);
  const blogSlug = path.startsWith('/blog/') ? path.replace('/blog/', '') : '';
  const blogPost = blogPosts.find((post) => post.slug === blogSlug);

  let content;
  if (path === '/' || path === '/create' || path === '/builder') content = <ToolPage navigate={navigate} isGenerateOnly={false} />;
  else if (path === '/generate-prompt' || path === '/generate') content = <ToolPage navigate={navigate} isGenerateOnly={true} />;
  else if (path === '/examples') content = <GalleryPage path={path} navigate={navigate} />;
  else if (path === '/library') content = <LibraryPage path={path} navigate={navigate} />;
  else if (path === '/templates') content = <TemplatesPage path={path} navigate={navigate} />;
  else if (path === '/how-it-works') content = <HowItWorksPage path={path} navigate={navigate} />;
  else if (path === '/features') content = <FeaturesPage path={path} navigate={navigate} />;
  else if (path === '/pricing') content = <PricingPage path={path} navigate={navigate} />;
  else if (path === '/services') content = <ServicesPage path={path} navigate={navigate} />;
  else if (path === '/why-us') content = <WhyUsPage path={path} navigate={navigate} />;
  else if (path === '/about') content = <AboutPage path={path} navigate={navigate} />;
  else if (path === '/contact') content = <ContactPage path={path} navigate={navigate} />;
  else if (path === '/blog') content = <BlogIndex path={path} navigate={navigate} />;
  else if (blogPost) content = <BlogArticle post={blogPost} path={path} navigate={navigate} />;
  else if (path === '/faq') content = <FAQPage path={path} navigate={navigate} />;
  else if (path === '/search') content = <SearchPage path={path} navigate={navigate} />;
  else if (path === '/sitemap') content = <SitemapPage path={path} navigate={navigate} />;
  else if (path === '/500') content = <ErrorPage code={500} path={path} navigate={navigate} />;
  else if (policyPage) content = <PolicyPage page={policyPage} path={path} navigate={navigate} />;
  else content = <ErrorPage code={404} path={path} navigate={navigate} />;

  return <Layout path={path} navigate={navigate}>{content}</Layout>;
}
