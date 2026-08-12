import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  HelpCircle,
  History,
  Home,
  Layers,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  RefreshCw,
  RotateCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { businessRules, businessTypes, defaultForm, optionMappings } from './data/mappings.js';
import {
  SITE,
  blogPosts,
  faqItems,
  policyPages,
  searchableRecords,
  servicesData,
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
  1: { title: 'Your business', desc: 'Tell us about your business' },
  2: { title: 'Post purpose', desc: 'What do you want to promote?' },
  3: { title: 'Look and feel', desc: 'Choose the visual style' },
  4: { title: 'Text to show', desc: 'Enter the copy for your design' },
};

const COPY_HINT = 'Copy the description and paste in ChatGPT with your brand logo or other images.';
const ROUTE_TITLES = new Map([
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

function ToolPage({ navigate }) {
  const [form, setForm] = useState(defaultForm);
  const [history, setHistory] = useState(() => {
    const saved = window.localStorage.getItem('description-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [step, setStep] = useState(1);
  const [captcha, setCaptcha] = useState(() => createCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const generationTimer = useRef(null);

  const specialityOptions = Object.keys(businessTypes[form.businessType].specialities);
  const postGoalOptions = businessRules[form.businessType]?.postGoals ?? Object.keys(optionMappings.postGoal);
  const stepInfo = STEP_TITLES[step];

  useSeo({
    title: 'Free AI Image Prompt Description Generator',
    description:
      'Create structured AI image prompt descriptions for small business social media posts, offers, festive wishes, announcements, and marketing campaigns.',
    path: '/',
    schema: pageSchema('Free AI Image Prompt Description Generator', '/', SITE.description, [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE.productName,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: SITE.description,
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
    await navigator.clipboard.writeText(generated.description);
    setCopied(true);
    setHistory((prev) => [
      { id: crypto.randomUUID(), form: generated.form, description: generated.description, createdAt: new Date().toISOString() },
      ...prev,
    ].slice(0, 8));
  }

  function submitForm() {
    if (captchaInput.trim() !== captcha.answer) {
      setCaptchaError('Please solve the security check correctly before creating the description.');
      return;
    }

    setCaptchaError('');
    setCopied(false);
    setGenerated(null);
    setIsGenerating(true);
    clearTimeout(generationTimer.current);
    setCaptchaInput('');
    setCaptcha(createCaptcha());
    const submittedForm = { ...form };
    const desc = buildDescription(submittedForm);
    generationTimer.current = setTimeout(() => {
      setGenerated({ form: submittedForm, description: desc });
      setIsGenerating(false);
    }, 5000);
  }

  function resetForm() {
    setCopied(false);
    setIsGenerating(false);
    setGenerated(null);
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
      <header className="topbar">
        <div>
          <p className="eyebrow">Likhwai.Online - AI Creative Architecture</p>
          <h1>Free Ready-to-Copy AI Image Prompt Generator for Business Marketing</h1>
          <p className="topbar-help">
            Turn raw campaign offers, discounts, announcements, and festival wishes into copy-ready, structured visual design briefs. Built specifically for ChatGPT, Midjourney, DALL-E 3, and Flux to generate professional social media artwork without design jargon.
          </p>
        </div>
        <button className="ghost-button" type="button" onClick={resetForm}>
          <RefreshCw size={18} /> Reset Generator
        </button>
      </header>

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
              <h2 id="generator-heading">{stepInfo.title}</h2>
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
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button className="primary-button submit-button" type="button" onClick={submitForm} disabled={isGenerating}>
                <Sparkles size={18} />
                {isGenerating ? 'Preparing...' : 'Create Description'}
              </button>
            )}
          </div>
        </section>

        <section className="output-panel" aria-live="polite">
          <div className="output-header">
            <div>
              <p className="eyebrow">Generated Output</p>
              <h2>Your description</h2>
            </div>
            {generated && !isGenerating ? (
              <button className="primary-button" type="button" onClick={copyDescription}>
                {copied ? <BadgeCheck size={18} /> : <Copy size={18} />}
                {copied ? 'Copied' : 'Copy'}
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
              <h3>Writing your description</h3>
              <p>Preparing a clear brief from your business details and post goal.</p>
              <div className="progress-bar">
                <span />
              </div>
            </div>
          ) : generated ? (
            <>
              <pre>{generated.description}</pre>
              <p className="output-note">{COPY_HINT}</p>
            </>
          ) : (
            <div className="output-empty">
              <FileText size={34} />
              <h3>Your description will appear here</h3>
              <p>Complete the choices and press Create Description. You can copy it after it is ready.</p>
            </div>
          )}
        </section>
      </div>

      <AdSlot label="Advertisement space below tool introduction" />
      <ContentSections navigate={navigate} />
      <RecentGuides navigate={navigate} />
      <Testimonials />
      <FAQSection />
      <HistoryPanel history={history} onRestore={setForm} />
    </>
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

function ContentSections({ navigate }) {
  return (
    <section className="content-section" aria-labelledby="tool-guide-heading">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Guide</p>
          <h2 id="tool-guide-heading">How to use Creative Prompt Writer well</h2>
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
          <h2>AI prompt guides for small business marketing</h2>
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

function HistoryPanel({ history, onRestore }) {
  return (
    <section className="content-section history-wide" id="history">
      <p className="eyebrow">Recent</p>
      <h2>Your recent descriptions</h2>
      <HistoryList items={history} onRestore={onRestore} />
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
  const description = 'Frequently asked questions about Creative Prompt Writer, AI image prompts, business use, and privacy.';
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
  const description = 'Search Creative Prompt Writer pages, policy documents, prompt guides, and AI marketing articles.';

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
  const description = 'Human-readable sitemap for Creative Prompt Writer pages, policies, and blog guides.';
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

function AboutPage({ path, navigate }) {
  const description = 'Learn about Likhwai.Online, our mission, visual design methodology, and commitment to free, accessible AI marketing tools.';

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
        publisher: { '@type': 'Organization', name: SITE.name, url: SITE.origin },
      },
    ]),
  });

  return (
    <ArticleShell
      title="About Likhwai.Online"
      description="We bridge the gap between small business marketing ideas and high-performing AI image design briefs."
      path={path}
      navigate={navigate}
    >
      <section className="about-hero-section">
        <div className="about-grid">
          <div className="about-card">
            <span className="eyebrow">Our Mission</span>
            <h2>Democratizing Professional AI Prompt Briefs</h2>
            <p>
              Likhwai.Online was built with a clear purpose: to make AI design workflows accessible and practical for everyday small business owners, local service providers, freelancers, and marketers.
            </p>
            <p>
              Most AI image generators produce unpredictable results when fed simple one-line prompts. We eliminate that frustration by converting straightforward business details into structured visual directions that ChatGPT, DALL-E, Midjourney, and Flux understand effortlessly.
            </p>
          </div>
          <div className="about-card highlight">
            <span className="eyebrow">Our Story</span>
            <h2>Built for Local Business Reality</h2>
            <p>
              Small businesses know their products, offers, and target customers better than anyone. However, translating an upcoming festival discount or new menu launch into complex prompt engineering keywords can feel overwhelming.
            </p>
            <p>
              Creative Prompt Writer asks intuitive business questions—such as post goal, headline copy, brand colors, and visual focus—and generates an error-free, copy-ready prompt in seconds.
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
            <p>We actively discourage deceptive badges, false guarantee icons, or fake reviews in generated visual briefs—ensuring your creatives comply with advertising standards.</p>
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
            <p>No need to memorize technical terms like focal length, camera aperture, or rendering engines. Plain business language powers every option.</p>
          </article>
        </div>
      </section>

      <section className="about-transparency-section">
        <h2>Publisher Information & Transparency</h2>
        <div className="info-card">
          <p>
            <strong>Likhwai.Online</strong> is an independent web application dedicated to AI writing and prompt education. We maintain strict editorial guidelines and provide complete user privacy:
          </p>
          <ul>
            <li><strong>No Required Registrations:</strong> The tool operates locally in your web browser.</li>
            <li><strong>Zero Data Selling:</strong> User input is processed in real time and stored locally in browser storage for session convenience.</li>
            <li><strong>Monetization & Ad Policy:</strong> Likhwai.Online is supported by unobtrusive online advertising to keep the platform free for all users.</li>
          </ul>
        </div>
      </section>

      <AdSlot label="Advertisement space on About page" />
    </ArticleShell>
  );
}

function ContactPage({ path, navigate }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
  const [captcha, setCaptcha] = useState(() => createCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const description = 'Contact Likhwai.Online for support, feedback, partnerships, policy questions, or technical inquiries.';

  useSeo({
    title: 'Contact Us',
    description,
    path,
    schema: pageSchema('Contact Us', path, description, [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Likhwai.Online',
        url: absoluteUrl(path),
        description,
      },
    ]),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill in all required fields (Name, Email, Message).' });
      return;
    }
    if (captchaInput.trim() !== captcha.answer) {
      setStatusMsg({ type: 'error', text: 'Incorrect security check solution. Please try again.' });
      return;
    }

    setStatusMsg({
      type: 'success',
      text: 'Thank you! Your message has been received. Our team will respond to your email within 24 to 48 hours.',
    });
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    setCaptchaInput('');
    setCaptcha(createCaptcha());
  }

  return (
    <ArticleShell
      title="Contact Us"
      description="Have questions, suggestions, feedback, or policy inquiries? Send us a message and our team will be happy to assist."
      path={path}
      navigate={navigate}
    >
      <div className="contact-grid">
        <section className="contact-form-section">
          <h2>Send Us a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Your Name *</span>
              <input
                type="text"
                value={formData.name}
                placeholder="Enter your full name"
                required
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Email Address *</span>
              <input
                type="email"
                value={formData.email}
                placeholder="example@domain.com"
                required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Subject / Inquiry Type</span>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                <option value="Policy & Ad Concerns">Policy & Ad Concerns</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Partnership">Partnership</option>
              </select>
            </label>

            <label className="field field-wide">
              <span>Message *</span>
              <textarea
                rows={5}
                value={formData.message}
                placeholder="Type your message here..."
                required
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </label>

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
                  placeholder="Answer"
                  required
                  onChange={(e) => setCaptchaInput(e.target.value)}
                />
                <button
                  className="ghost-button captcha-refresh"
                  type="button"
                  onClick={() => {
                    setCaptcha(createCaptcha());
                    setCaptchaInput('');
                  }}
                  aria-label="Refresh security check"
                >
                  <RotateCw size={18} />
                </button>
              </div>
            </div>

            {statusMsg.text ? (
              <div className={`status-banner ${statusMsg.type}`}>
                {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <HelpCircle size={18} />}
                <span>{statusMsg.text}</span>
              </div>
            ) : null}

            <button className="primary-button submit-button" type="submit">
              <Send size={18} /> Send Message
            </button>
          </form>
        </section>

        <aside className="contact-info-section">
          <h2>Direct Contact Information</h2>
          <div className="info-card">
            <div className="contact-item">
              <Mail className="contact-item-icon" size={20} />
              <div>
                <strong>Email Address</strong>
                <p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
              </div>
            </div>

            <div className="contact-item">
              <MapPin className="contact-item-icon" size={20} />
              <div>
                <strong>Office Address</strong>
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

            <div className="contact-item">
              <ShieldCheck className="contact-item-icon" size={20} />
              <div>
                <strong>Response Guarantee</strong>
                <p>We review and respond to genuine inquiries within 24 to 48 business hours.</p>
              </div>
            </div>
          </div>

          <div className="info-card trust-note">
            <h3>Privacy & Trust Commitment</h3>
            <p>
              We value your privacy. Email addresses and message details submitted through this form are strictly used to respond to your request and will never be sold or shared with third parties.
            </p>
          </div>
        </aside>
      </div>

      <AdSlot label="Advertisement space on Contact page" />
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
              <img className="brand-logo" src={SITE.logo} alt="Creative Prompt Writer logo" loading="eager" width="54" height="54" />
              <div>
                <strong>{SITE.name}</strong>
                <span>{SITE.productName}</span>
              </div>
            </div>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu" type="button">
              <X size={22} />
            </button>
          </div>
          <nav className="nav-list" aria-label="Main navigation">
            <Link className={path === '/' ? 'active' : ''} to="/" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <FileText size={18} /> Home / Create
            </Link>
            <Link className={path === '/services' ? 'active' : ''} to="/services" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Zap size={18} /> Services
            </Link>
            <Link className={path === '/why-us' ? 'active' : ''} to="/why-us" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Award size={18} /> Why Us
            </Link>
            <Link className={path === '/about' ? 'active' : ''} to="/about" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Home size={18} /> About
            </Link>
            <Link className={path === '/contact' ? 'active' : ''} to="/contact" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <Mail size={18} /> Contact
            </Link>
            <Link className={path === '/blog' ? 'active' : ''} to="/blog" navigate={navigate} onClick={() => setSidebarOpen(false)}>
              <History size={18} /> Blog
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
    ['Services', '/services'],
    ['Why Choose Us', '/why-us'],
    ['About Us', '/about'],
    ['Contact Us', '/contact'],
    ['Blog', '/blog'],
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
      <div>
        <strong>{SITE.name}</strong>
        <p>{SITE.description}</p>
        <p>Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
      </div>
      <nav aria-label="Footer navigation">
        {footerLinks.map(([label, to]) => (
          <Link key={to} to={to} navigate={navigate}>{label}</Link>
        ))}
      </nav>
      <p className="copyright">Copyright {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
    </footer>
  );
}

export default function App() {
  const { path, navigate } = useRoute();
  const policyPage = policyPages.find((page) => `/${page.slug}` === path);
  const blogSlug = path.startsWith('/blog/') ? path.replace('/blog/', '') : '';
  const blogPost = blogPosts.find((post) => post.slug === blogSlug);

  let content;
  if (path === '/') content = <ToolPage navigate={navigate} />;
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

