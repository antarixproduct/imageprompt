import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  History,
  Menu,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { businessRules, businessTypes, defaultForm, optionMappings } from './data/mappings';
import { buildDescription } from './utils/descriptionBuilder';

const fieldLabels = {
  businessName: 'Business name',
  businessType: 'Business type',
  speciality: 'Speciality',
  postGoal: 'Post goal',
  platform: 'Platform',
  designMood: 'Design mood',
  designDensity: 'Design density',
  imageStyle: 'Image style',
  targetAudience: 'Target audience',
  offerIntensity: 'Offer intensity',
  brandTone: 'Brand tone',
  visualFocalPoint: 'Visual focal point',
  textPriority: 'Text priority',
  trustElement: 'Trust element',
  hasBusinessImages: 'Do you have business images?',
  businessWebsite: 'Business website',
  businessAddress: 'Business address / location',
  brandColors: 'Brand colors',
  headline: 'Headline',
  subheadline: 'Subheadline',
  offerDetails: 'Offer details',
  cta: 'CTA',
  contactInfo: 'Contact information',
  highlights: 'Important highlights',
  avoid: 'Things to avoid',
};

/* ---------- small presenters ---------- */
function SelectField({ name, value, options, onChange }) {
  return (
    <label className="field">
      <span>{fieldLabels[name]}</span>
      <select value={value} onChange={(event) => onChange(name, event.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
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
        <button className="history-item" key={item.id} onClick={() => onRestore(item.form)}>
          <span>{item.form.businessName || item.form.businessType}</span>
          <small>{item.form.postGoal} &ndash; {item.form.platform}</small>
        </button>
      ))}
    </div>
  );
}

/* ---------- step fields ---------- */
const STEP_FIELDS = {
  1: ['businessName', 'businessType', 'speciality', 'businessWebsite', 'businessAddress'],
  2: ['postGoal', 'platform', 'targetAudience'],
  3: [
    'designMood', 'designDensity', 'imageStyle', 'visualFocalPoint',
    'textPriority', 'offerIntensity', 'brandTone', 'trustElement', 'hasBusinessImages',
  ],
  4: ['brandColors', 'headline', 'subheadline', 'offerDetails', 'cta', 'contactInfo', 'highlights', 'avoid'],
};

const STEP_TITLES = {
  1: { label: 'Step 1', title: 'Your business', desc: 'Tell us about your business' },
  2: { label: 'Step 2', title: 'Post purpose', desc: 'What do you want to promote?' },
  3: { label: 'Step 3', title: 'Look and feel', desc: 'Choose the visual style' },
  4: { label: 'Step 4', title: 'Text to show', desc: 'Enter the copy for your design' },
};

/* ========== App ========== */
export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [history, setHistory] = useState(() => {
    const saved = window.localStorage.getItem('description-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [step, setStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const generationTimer = useRef(null);

  /* detect mobile width reactively */
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 1180); }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => () => clearTimeout(generationTimer.current), []);

  /* dynamic options */
  const specialityOptions = Object.keys(businessTypes[form.businessType].specialities);
  const postGoalOptions = businessRules[form.businessType]?.postGoals ?? Object.keys(optionMappings.postGoal);

  /* persist history */
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
    setCopied(false);
    setGenerated(null);
    setIsGenerating(true);
    clearTimeout(generationTimer.current);
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
  }

  function goNext() { setStep((s) => Math.min(s + 1, 4)); }
  function goPrev() { setStep((s) => Math.max(s - 1, 1)); }

  /* render fields for current step */
  function renderStepFields() {
    return STEP_FIELDS[step].map((name) => {
      if (name === 'highlights' || name === 'avoid') {
        return <TextAreaField key={name} name={name} value={form[name]} onChange={updateField} placeholder={fieldPlaceholder(name)} />;
      }
      if (name === 'businessName' || name === 'businessWebsite' || name === 'businessAddress' ||
          name === 'brandColors' || name === 'headline' || name === 'subheadline' ||
          name === 'offerDetails' || name === 'cta' || name === 'contactInfo') {
        return <TextField key={name} name={name} value={form[name]} onChange={updateField} placeholder={fieldPlaceholder(name)} />;
      }
      let opts;
      if (name === 'businessType') opts = Object.keys(businessTypes);
      else if (name === 'speciality') opts = specialityOptions;
      else if (name === 'postGoal') opts = postGoalOptions;
      else opts = Object.keys(optionMappings[name]);
      return <SelectField key={name} name={name} value={form[name]} options={opts} onChange={updateField} />;
    });
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

  /* ---------- render ---------- */
  const stepInfo = STEP_TITLES[step];

  return (
    <>
      {/* overlay for mobile sidebar */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="app-shell">
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand-block">
              <div className="brand-mark"><Sparkles size={22} /></div>
              <div>
                <strong>Prompt Description</strong>
                <span>SMB creative planner</span>
              </div>
            </div>
            {isMobile && (
              <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <X size={22} />
              </button>
            )}
          </div>

          <nav className="nav-list">
            <a className="active" href="#create" onClick={() => setSidebarOpen(false)}>
              <FileText size={18} /> Create
            </a>
            <a href="#history" onClick={() => setSidebarOpen(false)}>
              <History size={18} /> History
            </a>
          </nav>

          <section className="sidebar-panel" id="history">
            <h2>Recent</h2>
            <HistoryList items={history} onRestore={(f) => { setForm(f); setSidebarOpen(false); }} />
          </section>
        </aside>

        <section className="workspace">
          {/* top bar */}
          <header className="topbar">
            <div className="topbar-left">
              {isMobile && (
                <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                  <Menu size={22} />
                </button>
              )}
              <div>
                <p className="eyebrow">Description Builder</p>
                <h1>Create a ready-to-copy design brief for your business post</h1>
                <p className="topbar-help">
                  Fill the simple choices below. The app will prepare a clear description you can paste into ChatGPT.
                </p>
              </div>
            </div>
            <button className="ghost-button" type="button" onClick={resetForm}>
              <RefreshCw size={18} /> Reset
            </button>
          </header>

          {/* mobile result step - show either generating animation or result */}
          {isMobile && (isGenerating || (generated && !isGenerating)) ? (
            <div className="content-grid" id="create">
              <section className="output-panel output-full">
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
                  <div className="writing-state" role="status" aria-live="polite">
                    <div className="writer-scene" aria-hidden="true">
                      <div className="writer-head" />
                      <div className="writer-body" />
                      <div className="writer-arm" />
                      <div className="writer-paper">
                        <span /><span /><span />
                      </div>
                    </div>
                    <h3>Writing your description</h3>
                    <p>Preparing a clear brief from your business details and post goal.</p>
                    <div className="progress-bar"><span /></div>
                  </div>
                ) : generated ? (
                  <>
                    <pre>{generated.description}</pre>
                    <div className="output-footer">
                      <button className="ghost-button" type="button" onClick={() => { setGenerated(null); setStep(1); }}>
                        <ChevronLeft size={18} /> Back to form
                      </button>
                    </div>
                  </>
                ) : null}
              </section>
            </div>
          ) : (
            <div className="content-grid" id="create">
              {/* form panel */}
              <section className="form-panel">
                {/* step progress indicator */}
                <div className="step-progress">
                  {[1, 2, 3, 4].map((s) => (
                    <button
                      key={s}
                      className={`step-dot${s === step ? ' active' : ''}${s < step ? ' done' : ''}`}
                      onClick={() => setStep(s)}
                      aria-label={`Go to step ${s}`}
                    >
                      <span className="step-dot-inner">{s < step ? 'OK' : s}</span>
                    </button>
                  ))}
                </div>

                <div className="section-heading">
                  <BadgeCheck size={19} />
                  <div>
                    <h2>{stepInfo.title}</h2>
                    <p>{stepInfo.desc}</p>
                  </div>
                </div>

                <div className="form-grid">
                  {renderStepFields()}
                </div>

                <div className="form-actions">
                  {step > 1 && (
                    <button className="ghost-button" type="button" onClick={goPrev}>
                      <ChevronLeft size={18} /> Back
                    </button>
                  )}
                  {step < 4 ? (
                    <button className="primary-button" type="button" onClick={goNext}>
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

              {/* output panel – visible on desktop or mobile after generation */}
              {!isMobile && (
                <section className="output-panel">
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
                    <div className="writing-state" role="status" aria-live="polite">
                      <div className="writer-scene" aria-hidden="true">
                        <div className="writer-head" />
                        <div className="writer-body" />
                        <div className="writer-arm" />
                        <div className="writer-paper">
                          <span /><span /><span />
                        </div>
                      </div>
                      <h3>Writing your description</h3>
                      <p>Preparing a clear brief from your business details and post goal.</p>
                      <div className="progress-bar"><span /></div>
                    </div>
                  ) : generated ? (
                    <pre>{generated.description}</pre>
                  ) : (
                    <div className="output-empty">
                      <FileText size={34} />
                      <h3>Your description will appear here</h3>
                      <p>Complete the choices and press Create Description. You can copy it after it is ready.</p>
                    </div>
                  )}
                </section>
              )}

            </div>
          )}
        </section>
      </main>
    </>
  );
}
