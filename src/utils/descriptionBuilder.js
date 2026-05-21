import { businessTypes, optionMappings, psychologyPretextMappings } from '../data/mappings.js';

const labelize = (value) => value || 'Not provided';

const sentence = (label, value) => `${label}: ${labelize(value)}`;

function buildResearchInstruction(form) {
  const sources = [];

  if (form.businessWebsite) {
    sources.push(`the official website (${form.businessWebsite})`);
  }

  if (form.businessName && form.businessAddress) {
    sources.push(`online search using the business name "${form.businessName}" and address/location "${form.businessAddress}"`);
  } else if (form.businessName) {
    sources.push(`online search using the business name "${form.businessName}"`);
  }

  if (!sources.length) {
    return 'No external research source was provided; rely only on the structured details below.';
  }

  return `Before refining the image prompt, review ${sources.join(' and ')} to understand the business identity, real offerings, local context, visual style, customer perception, and brand tone. Use only relevant factual context from that research; do not invent unsupported claims.`;
}

function buildImageSourceInstruction(form) {
  if (form.hasBusinessImages === 'Yes') {
    return 'The user will upload business images separately while pasting this description into ChatGPT. Generate the final design direction using only those uploaded business images as the visual source material. Do not suggest stock photos, generic AI-generated scenes, unrelated models, or outside images. You may improve composition, cropping, lighting, color harmony, text placement, and layout around the uploaded images, but keep the actual business imagery as the base.';
  }

  return 'No business images are available from the user. Use the selected image style, focal point, and visual direction to guide suitable image generation.';
}

function buildPsychologyPretext(form) {
  const businessPsychology =
    psychologyPretextMappings[form.businessType] ?? psychologyPretextMappings.Other;

  const matchedGoalText = businessPsychology.byPostGoal?.[form.postGoal];

  if (matchedGoalText) {
    return `${businessPsychology.default} ${matchedGoalText}`;
  }

  return businessPsychology.default;
}

export function buildDescription(form) {
  const business = businessTypes[form.businessType] ?? businessTypes.Other;
  const specialityDescription = business.specialities[form.speciality] ?? '';

  const mappedSections = [
    business.description,
    specialityDescription,
    optionMappings.postGoal[form.postGoal],
    optionMappings.platform[form.platform],
    optionMappings.designMood[form.designMood],
    optionMappings.designDensity[form.designDensity],
    optionMappings.imageStyle[form.imageStyle],
    optionMappings.targetAudience[form.targetAudience],
    optionMappings.offerIntensity[form.offerIntensity],
    optionMappings.brandTone[form.brandTone],
    optionMappings.visualFocalPoint[form.visualFocalPoint],
    optionMappings.textPriority[form.textPriority],
    optionMappings.trustElement[form.trustElement],
    buildPsychologyPretext(form),
  ].filter(Boolean);

  const contentLines = [
    sentence('Business Name', form.businessName),
    sentence('Business Type', form.businessType),
    sentence('Speciality', form.speciality),
    sentence('Post Goal', form.postGoal),
    sentence('Target Audience', form.targetAudience),
    sentence('User Has Business Images', form.hasBusinessImages),
    sentence('Business Website', form.businessWebsite),
    sentence('Business Address / Location', form.businessAddress),
    sentence('Brand Colors', form.brandColors),
    sentence('Headline', form.headline),
    sentence('Subheadline', form.subheadline),
    sentence('Offer Details', form.offerDetails),
    sentence('Call To Action', form.cta),
    sentence('Contact Information', form.contactInfo),
    sentence('Important Highlights', form.highlights),
    sentence('Things To Avoid', form.avoid),
  ];

  return [
    'DESIGN DESCRIPTION',
    '',
    'Business Context',
    `${form.businessName ? `${form.businessName} is a ` : 'This is a '}${form.businessType} business focused on ${form.speciality}.`,
    business.description,
    specialityDescription,
    '',
    'Marketing Goal',
    `${form.postGoal}: ${optionMappings.postGoal[form.postGoal]}`,
    `${form.offerIntensity} offer intensity: ${optionMappings.offerIntensity[form.offerIntensity]}`,
    '',
    'Customer Psychology Pretext',
    buildPsychologyPretext(form),
    '',
    'Platform And Format',
    `${form.platform}: ${optionMappings.platform[form.platform]}`,
    '',
    'Visual Direction',
    mappedSections.join(' '),
    '',
    'Typography And Layout Priority',
    `${form.textPriority}: ${optionMappings.textPriority[form.textPriority]}`,
    `${form.designDensity}: ${optionMappings.designDensity[form.designDensity]}`,
    '',
    'Image And Focal Point',
    `${form.imageStyle}: ${optionMappings.imageStyle[form.imageStyle]}`,
    `${form.visualFocalPoint}: ${optionMappings.visualFocalPoint[form.visualFocalPoint]}`,
    `Image source: ${optionMappings.hasBusinessImages[form.hasBusinessImages]}`,
    '',
    'Business Image Instruction',
    buildImageSourceInstruction(form),
    '',
    'Brand And Audience Tone',
    `${form.brandTone}: ${optionMappings.brandTone[form.brandTone]}`,
    `${form.targetAudience}: ${optionMappings.targetAudience[form.targetAudience]}`,
    `${form.trustElement}: ${optionMappings.trustElement[form.trustElement]}`,
    '',
    'Optional Business Research Instruction',
    buildResearchInstruction(form),
    '',
    'User Content To Include',
    ...contentLines,
    '',
    'Final Instruction',
    'Create a clear, polished social media design direction using the selected mapped details. Keep the layout readable, commercially useful, brand-appropriate, and optimized for the selected platform.',
  ].join('\n');
}

export function buildMappedChoices(form) {
  const business = businessTypes[form.businessType] ?? businessTypes.Other;

  return [
    { label: 'Business Type', choice: form.businessType, mapping: business.description },
    {
      label: 'Speciality',
      choice: form.speciality,
      mapping: business.specialities[form.speciality],
    },
    ...Object.entries(optionMappings).map(([key, group]) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()),
      choice: form[key],
      mapping: group[form[key]],
    })),
  ].filter((item) => item.choice && item.mapping);
}
