import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import TopBar from '../widgets/TopBar';
import { Search, Sprout, Droplets, SunMedium, TrendingUp, ShieldCheck, ArrowRight, Leaf, CalendarDays, ChevronRight } from 'lucide-react';

const cropCatalog = [
  {
    id: 'tomato',
    category: 'Vegetable',
    crop: 'Tomato',
    cropTa: 'தக்காளி',
    icon: '🍅',
    overview: {
      en: 'A widely grown vegetable crop that prefers warm weather, good sunlight, and well-drained soil.',
      ta: 'சூடான காலநிலை, நல்ல சூரிய ஒளி மற்றும் நன்கு வடிகட்டிய மண்ணை விரும்பும் பிரபலமான காய்கறி பயிர்.'
    },
    varieties: [
      { name: 'Arka Samrat', nameTa: 'அர்க்கா சம்ரத்', note: 'High-yield hybrid' },
      { name: 'PKM-1', nameTa: 'பிகேஎம்-1', note: 'Popular local variety' },
      { name: 'CO-3', nameTa: 'சோ-3', note: 'Recommended for Tamil Nadu' }
    ],
    planting: {
      en: [
        'Sow or transplant in well-prepared raised beds with organic compost added.',
        'Maintain spacing of 45–60 cm between plants and 75–90 cm between rows.',
        'Prefer 6–8 hours of direct sunlight and avoid waterlogging.'
      ],
      ta: [
        'செயற்கை உரம் சேர்த்து நன்கு தயார் செய்த மேடுகளில் விதைக்கவும் அல்லது நாற்றுகளை நடவும்.',
        'செடி மற்றும் வரிசைகளுக்கு இடையே 45–60 செ.மீ. இடைவெளி வைக்கவும்.',
        '6–8 மணி நேரம் நேரடி சூரிய ஒளியையும், நீர் தேங்காமல் பார்த்துக் கொள்ளவும்.'
      ]
    },
    fertilizer: {
      en: [
        'Apply 10–12 tons of farmyard manure per acre before planting.',
        'Use 150:75:150 NPK kg/acre in split doses; half at transplanting and remaining in top dressing.',
        'Add micronutrients such as calcium and magnesium if fruits show blossom-end rot or yellowing.'
      ],
      ta: [
        'நடவு செய்வதற்கு முன் ஏக்கருக்கு 10–12 டன் பசுமைப் சாணத்தை இடவும்.',
        'ஏக்கருக்கு 150:75:150 NPK அளவைக் கலப்பாகப் பயன்படுத்தவும்; நடவு போதும், பின்னர் மேல்மூட்டு உரமாகவும் வழங்கவும்.',
        'பழங்களில் முடிக்குரிய சிதைவு அல்லது மஞ்சள் நிறம் ஏற்பட்டால் கால்சியம், மெக்னீசியம் போன்ற மைக்ரோ நுண்ணூட்டங்களை சேர்க்கவும்.'
      ]
    },
    yield: { en: '12–20 tons per acre depending on variety and care', ta: 'வகை மற்றும் பராமரிப்பைப் பொறுத்து ஏக்கருக்கு 12–20 டன் வரை' }
  },
  {
    id: 'chilli',
    category: 'Vegetable',
    crop: 'Chilli',
    cropTa: 'மிளகாய்',
    icon: '🌶️',
    overview: {
      en: 'A heat-loving crop cultivated for green and red fruits, best in warm, fertile soil with good drainage.',
      ta: 'வெப்பத்தை விரும்பும் மிளகாய் பயிர், சத்தான மற்றும் நன்கு வடிகட்டிய மண்ணில் சிறப்பாக வளரும்.'
    },
    varieties: [
      { name: 'Byadgi', nameTa: 'ப்யாத்கி', note: 'High pungency' },
      { name: 'K2', nameTa: 'கே2', note: 'Widely grown hybrid' },
      { name: 'Arka Lohit', nameTa: 'அர்க்கா லோஹித்', note: 'Red chilli hybrid' }
    ],
    planting: {
      en: [
        'Use healthy seedlings and transplant during warm seasons for strong rooting.',
        'Keep 45–60 cm between plants and 60–75 cm between rows.',
        'Maintain mulch to retain moisture and reduce soil temperature.'
      ],
      ta: [
        'சீரான நாற்றுகளை தேர்ந்தெடுத்து வெப்பமான காலத்தில் நடவு செய்யவும்.',
        'செடிகளுக்கு இடையே 45–60 செ.மீ. மற்றும் வரிசைகளுக்கு இடையே 60–75 செ.மீ. இடைவெளி வைக்கவும்.',
        'மண்ணின் ஈரப்பதத்தை தக்கவைக்க மால்ச்சிங் பயன்படுத்தவும்.'
      ]
    },
    fertilizer: {
      en: [
        'Apply compost or poultry manure before planting at 5–8 tons per acre.',
        'Provide balanced NPK with potassium-rich feeding to improve fruit set and pungency.',
        'Use foliar micronutrient sprays if leaves show pale chlorosis.'
      ],
      ta: [
        'நடவு செய்வதற்கு முன் ஏக்கருக்கு 5–8 டன் உரம் அல்லது கோழி எரு இடவும்.',
        'சமநிலை NPK-யுடன் பொட்டாசியம் நிறைந்த உரம் கொடுக்க வேண்டும்.',
        'இலை மஞ்சள் நிறமாகி இருந்தால் மைக்ரோ நுண்ணூட்ட தெளிப்பு செய்யவும்.'
      ]
    },
    yield: { en: '2–5 tons per acre depending on variety and pest pressure', ta: 'வகை மற்றும் பூச்சி அழுத்தத்தைப் பொறுத்து ஏக்கருக்கு 2–5 டன் வரை' }
  },
  {
    id: 'banana',
    category: 'Fruit',
    crop: 'Banana',
    cropTa: 'வாழை',
    icon: '🍌',
    overview: {
      en: 'A perennial fruit crop that needs warm temperatures, regular moisture, and nutrient-rich soil.',
      ta: 'வெப்பமான காலநிலை, தொடர்ந்து ஈரப்பதம் மற்றும் ஊட்டச்சத்து நிறைந்த மண் தேவைப்படும் நிரந்தர பழப்பயிர்.'
    },
    varieties: [
      { name: 'Grand Naine', nameTa: 'கிராண்ட் நெய்ன்', note: 'High-yield tissue culture banana' },
      { name: 'Nendran', nameTa: 'நெந்தன்', note: 'Popular in Kerala' },
      { name: 'Rasthali', nameTa: 'ரஸ்தாளி', note: 'Sweet dessert banana' }
    ],
    planting: {
      en: [
        'Use healthy suckers or tissue-culture plantlets with a spacing of 1.8–2.2 m.',
        'Prepare pits of 45x45x45 cm and add compost before planting.',
        'Apply mulch and maintain regular irrigation for uniform bunch development.'
      ],
      ta: [
        'சுகாதாரமான கன்றுகள் அல்லது டிசியூ கல்ச்சர் நாற்றுகளை 1.8–2.2 மீட்டர் இடைவெளியில் நடவு செய்யவும்.',
        '45x45x45 செ.மீ. குழிகள் தோண்டி உரம் சேர்க்கவும்.',
        'மால்ச்சிங் செய்து தொடர்ந்து நீர் பாய்ச்சுவதால் பழை சீராக வளரும்.'
      ]
    },
    fertilizer: {
      en: [
        'Apply organic manure yearly and balanced NPK based on crop age and leaf analysis.',
        'Potassium is especially important for fruit filling and bunch size.',
        'Supplement magnesium and zinc when leaves show deficiency symptoms.'
      ],
      ta: [
        'முழு ஆண்டும் கரிம உரம் கொடுத்து, பயிரின் வயதுக்கு ஏற்ப NPK ஊட்டத்தை அளவாக அளிக்கவும்.',
        'பழங்கள் உருவாகவும், கச்சா மொட்டுகள் பெரிதாகவும் பொட்டாசியம் முக்கியம்.',
        'இலைகள் குறைபாடு அறிகுறிகள் காட்டினால் மெக்னீசியம், ஜிங்க் சேர்க்கவும்.'
      ]
    },
    yield: { en: '25–40 tons per acre depending on variety and management', ta: 'வகை மற்றும் பராமரிப்பைப் பொறுத்து ஏக்கருக்கு 25–40 டன் வரை' }
  },
  {
    id: 'groundnut',
    category: 'Vegetable',
    crop: 'Groundnut',
    cropTa: 'நிலக்கடலை',
    icon: '🥜',
    overview: {
      en: 'A legume crop that thrives in well-drained sandy loam, with moderate rainfall and balanced nutrient supply.',
      ta: 'நன்கு வடிகட்டிய மணல்-களிமண் மண்ணில் வளரும் கொட்டை பயிர், மிதமான மழை மற்றும் சமச்சீர் உரங்களால் சிறக்கும்.'
    },
    varieties: [
      { name: 'TMV-2', nameTa: 'டிஎம்வி-2', note: 'Widely grown local variety' },
      { name: 'Kadiri-6', nameTa: 'கதிரி-6', note: 'High yielding variety' },
      { name: 'JL-24', nameTa: 'ஜேஎல்-24', note: 'Well adapted for rainfed cultivation' }
    ],
    planting: {
      en: [
        'Sow seeds at 5–6 cm depth in rows 30–45 cm apart.',
        'Use gypsum or calcium sources on flowering stage for pod filling.',
        'Avoid excess irrigation once pegging begins.'
      ],
      ta: [
        '5–6 செ.மீ. ஆழத்தில் விதைகளை வரிசைகளாக 30–45 செ.மீ. இடைவெளியில் விதைக்கவும்.',
        'மலர் காலத்தில் ஜிப்சம் அல்லது கால்சியம் மூலங்களை வழங்கி, கொட்டை உருவாக்கத்தை தூண்டவும்.',
        'முளைப்பது தொடங்கியபிறகு அதிக நீர் பாய்ச்சுவதை தவிர்க்கவும்.'
      ]
    },
    fertilizer: {
      en: [
        'Apply phosphorous-rich basal fertilizer and a little nitrogen for early vigor.',
        'Use gypsum at flowering to support pod formation and kernel development.',
        'Maintain calcium and sulphur levels to avoid poor pod filling.'
      ],
      ta: [
        'பாஸ்பரஸ் நிறைந்த அடித்தள உரம் மற்றும் ஆரம்ப வளர்ச்சிக்கு சிறிய அளவு நைட்ரஜன் வழங்கவும்.',
        'மலர் உருவாக்க நேரத்தில் ஜிப்சம் அளித்து காய்/கொட்டை வளர்ச்சிக்கு உதவவும்.',
        'கால்சியம் மற்றும் கந்தக அளவை சரிசெய்து கொட்டை வளர்ச்சியை மேம்படுத்தவும்.'
      ]
    },
    yield: { en: '1.5–3 tons per acre under good management', ta: 'சிறந்த பராமரிப்பில் ஏக்கருக்கு 1.5–3 டன் வரை' }
  },
  {
    id: 'paddy',
    category: 'Cereal',
    crop: 'Paddy',
    cropTa: 'நெல்',
    icon: '🌾',
    overview: {
      en: 'A major cereal crop grown in puddled and irrigated fields, requiring controlled water and balanced nutrition.',
      ta: 'நன்கு பாசனமுள்ள வயல்களில் வளர்க்கப்படும் முக்கிய தானியப் பயிர்; நீர் மேலாண்மை மற்றும் சமநிலை ஊட்டச்சத்து அவசியம்.'
    },
    varieties: [
      { name: 'ADT 43', nameTa: 'ஏடி டி 43', note: 'short duration variety' },
      { name: 'BPT 5204', nameTa: 'பிபிடி 5204', note: 'Popular high-yield variety' },
      { name: 'CO 51', nameTa: 'சோ 51', note: 'Suitable for Tamil Nadu' }
    ],
    planting: {
      en: [
        'Prepare puddled fields and establish seedlings with uniform planting depth.',
        'Keep the field wet but avoid water stagnation during early growth.',
        'Provide consistent irrigation in tillering and flowering stages.'
      ],
      ta: [
        'நன்கு புளித்த வயல்களை தயார் செய்து ஒரே உயரத்தில் நாற்றுகளை நடவு செய்யவும்.',
        'ஆரம்ப வளர்ச்சியில் நீர் தேங்காமல், ஈரப்பதமாக வைத்திருக்கவும்.',
        'பிரிவு மற்றும் பூக்கும் காலத்தில் தொடர்ந்து நீர் வழங்கவும்.'
      ]
    },
    fertilizer: {
      en: [
        'Apply 120:50:50 NPK kg/acre in split doses with basal and top dressing.',
        'Apply zinc and silica as needed for healthy tillering and grain filling.',
        'Avoid excessive nitrogen after flowering to reduce lodging risk.'
      ],
      ta: [
        'ஏக்கருக்கு 120:50:50 NPK அளவை அடித்தள மற்றும் மேல் உரமாகப் பிரித்து வழங்கவும்.',
        'சீரான கிளை வளர்ச்சி மற்றும் தானிய நிறைவு için துத்தநாகம், சிலிகா போன்ற கூறுகளை வழங்கவும்.',
        'பூக்கும் பிறகு அதிக நைட்ரஜன் கொடுப்பதை தவிர்க்கவும்.'
      ]
    },
    yield: { en: '2.5–4.5 tons per acre depending on season and management', ta: 'நிலை மற்றும் பராமரிப்பைப் பொறுத்து ஏக்கருக்கு 2.5–4.5 டன் வரை' }
  },
  {
    id: 'apple',
    category: 'Fruit',
    crop: 'Apple',
    cropTa: 'ஆப்பிள்',
    icon: '🍏',
    overview: {
      en: 'A temperate fruit crop that needs cold winters, deep soil, and disciplined nutrient management.',
      ta: 'குளிர் காலநிலை, ஆழமான மண் மற்றும் சீரான ஊட்டச்சத்து மேலாண்மை தேவைப்படும் மிதவெப்ப பழப்பயிர்.'
    },
    varieties: [
      { name: 'Red Delicious', nameTa: 'ரெட் டெலிசியஸ்', note: 'Popular dessert cultivar' },
      { name: 'Royal Gala', nameTa: 'ராயல் கேலா', note: 'Early-bearing variety' },
      { name: 'Anna', nameTa: 'அன்னா', note: 'Suitable for warm subtropics' }
    ],
    planting: {
      en: [
        'Plant grafted saplings in deep, well-drained soil with enough spacing between trees.',
        'Train trees to a manageable canopy and prune dead or crowded branches yearly.',
        'Irrigate regularly during fruit development but avoid waterlogging.'
      ],
      ta: [
        'ஆழமான, நன்கு வடிகட்டிய மண்ணில் கன்று மரங்களை நடவு செய்யவும்.',
        'மரம் விரிந்து வளராமல் பார்த்துக் கொண்டு, இறந்த அல்லது அடர்த்தியான கிளைகளை ஆண்டு தோறும் வெட்டவும்.',
        'பழங்கள் உருவாகும் போது தொடர்ந்து நீர் வழங்கவும், ஆனால் நீர் தேங்குவதை தவிர்க்கவும்.'
      ]
    },
    fertilizer: {
      en: [
        'Apply farmyard manure, supplemented with calcium and micronutrients once trees begin fruiting.',
        'Use nitrogen carefully to avoid excessive vegetative growth.',
        'Regular foliar sprays help maintain leaf color and fruit quality.'
      ],
      ta: [
        'மரம் பழம்தரும் காலத்தில் பசுமைப் சாணம், கால்சியம் மற்றும் மைக்ரோநுண்ணூட்டங்களுடன் உரமிடவும்.',
        'அதிக இலை வளர்ச்சியைத் தவிர்க்க நைட்ரஜனை கவனமாக பயன்படுத்தவும்.',
        'இலை நிறம் மற்றும் பழத்தின் தரத்தை மேம்படுத்த இலை தெளிப்பு செய்யலாம்.'
      ]
    },
    yield: { en: 'Varies by orchard management; generally 8–20 tons per hectare' , ta: 'பண்ணை மேலாண்மையைப் பொறுத்து எக்டேருக்கு 8–20 டன் வரை' }
  },
  {
    id: 'grape',
    category: 'Fruit',
    crop: 'Grape',
    cropTa: 'திராட்சை',
    icon: '🍇',
    overview: {
      en: 'A fruit vine that prefers full sunlight, good airflow, and well-balanced fertility for quality berries.',
      ta: 'முழு சூரிய ஒளி, நல்ல காற்றோட்டம் மற்றும் சமச்சீர் உரங்கள் தேவைப்படும் பழ வகை கொடி பயிர்.'
    },
    varieties: [
      { name: 'Thompson Seedless', nameTa: 'தாம்சன் சீட்லெஸ்', note: 'Common table grape' },
      { name: 'Muscat', nameTa: 'மஸ்கட்', note: 'Sweet aromatic grape' },
      { name: 'Red Globe', nameTa: 'ரெட் குளோப்', note: 'Large red table grape' }
    ],
    planting: {
      en: [
        'Train vines on trellises with spacing adjusted to the chosen variety.',
        'Use fertile, well-drained loamy soil and maintain drip irrigation.',
        'Prune to keep the canopy open and allow sunlight into fruit clusters.'
      ],
      ta: [
        'கொடிகளை டிரெல்லிஸில் காயப்போட்டு, வகையைப் பொருத்து இடைவெளி வைக்கவும்.',
        'நன்கு வடிகட்டிய வளமான களிமண் மண்ணில் drip நீர்ப்பாசனம் செய்யவும்.',
        'இலையுதிர் பகுதியும் பழங்கள் நன்கு ஒளி பெறுமாறு கிளைகளை வெட்டவும்.'
      ]
    },
    fertilizer: {
      en: [
        'Apply compost and balanced NPK at early growth and before fruit set.',
        'Potassium and magnesium are especially important for berry sweetness and quality.',
        'Adjust irrigation and nutrient supply during ripening to avoid berry cracking.'
      ],
      ta: [
        'ஆரம்ப வளர்ச்சியில் மற்றும் பழம் உருவாகும் முன் உரம் மற்றும் சமநிலை NPK கொடுக்கவும்.',
        'பழங்களின் இனிப்பு மற்றும் தரத்திற்கு பொட்டாசியம், மெக்னீசியம் முக்கியம்.',
        'முதிர்ச்சியின்போது நீர் மற்றும் உரத்தை சீராக பராமரிக்கவும்.'
      ]
    },
    yield: { en: '10–18 tons per hectare depending on variety', ta: 'வகையைப் பொறுத்து எக்டேருக்கு 10–18 டன் வரை' }
  }
];

export default function CropCatalogScreen() {
  const { lang, navigateTo, goBack } = useApp();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(cropCatalog[0].id);

  const filteredCrops = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return cropCatalog;

    return cropCatalog.filter(item => {
      const text = `${item.crop} ${item.cropTa} ${item.category} ${item.overview.en} ${item.overview.ta}`.toLowerCase();
      return text.includes(query);
    });
  }, [search]);

  const selectedCrop = filteredCrops.find(item => item.id === selectedId) || filteredCrops[0] || cropCatalog[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%' }}>
      <TopBar title={lang === 'ta' ? 'பயிர் தகவல் அட்டை' : 'Plant Guide'} showBack={true} onBack={goBack} />

      <div style={{ paddingBottom: '18px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--color-surface)',
          border: '1.5px solid var(--color-card-border)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 18px',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '620px'
        }}>
          <Search size={20} color="var(--color-text-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ta' ? 'பயிர் அல்லது வகையைத் தேடுக...' : 'Search crop or variety...'}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: 'calc(0.95rem * var(--font-scale))',
              color: 'var(--color-text-main)',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 300px) minmax(0, 1fr)', gap: '18px', alignItems: 'start', width: '100%' }}>
        <div style={{
          backgroundColor: 'var(--color-card)',
          border: '1.5px solid var(--color-card-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {filteredCrops.length > 0 ? filteredCrops.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                border: selectedCrop?.id === item.id ? '1.5px solid var(--color-primary)' : '1px solid transparent',
                backgroundColor: selectedCrop?.id === item.id ? 'var(--color-primary-light)' : 'rgba(255,255,255,0.03)',
                color: 'var(--color-text-main)',
                borderRadius: '16px',
                padding: '12px 14px',
                marginBottom: '10px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                    {lang === 'ta' ? item.category : item.category}
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '1rem' }}>
                    {lang === 'ta' ? item.cropTa : item.crop}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </button>
          )) : (
            <div style={{ padding: '20px 8px', color: 'var(--color-text-muted)' }}>
              {lang === 'ta' ? 'பொருத்தமான பயிர் தகவல்கள் இல்லை.' : 'No matching plant details found.'}
            </div>
          )}
        </div>

        {selectedCrop && (
          <div style={{
            backgroundColor: 'var(--color-card)',
            border: '1.5px solid var(--color-card-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.08em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                  {selectedCrop.category}
                </div>
                <h2 style={{ margin: '6px 0 0', fontSize: 'calc(1.7rem * var(--font-scale))', fontWeight: '800' }}>
                  {lang === 'ta' ? selectedCrop.cropTa : selectedCrop.crop}
                </h2>
              </div>

              <button
                className="btn-primary"
                onClick={() => navigateTo('camera', { selectedCrop: selectedCrop.crop })}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px' }}
              >
                <Leaf size={18} />
                {lang === 'ta' ? 'இதை ஸ்கேன் செய்க' : 'Scan This Crop'}
              </button>
            </div>

            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.98rem', marginBottom: '20px' }}>
              {lang === 'ta' ? selectedCrop.overview.ta : selectedCrop.overview.en}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <InfoCard icon={<CalendarDays size={18} />} label={lang === 'ta' ? 'வகைகள்' : 'Varieties'} value={selectedCrop.varieties.map(v => lang === 'ta' ? v.nameTa : v.name).join(', ')} />
              <InfoCard icon={<SunMedium size={18} />} label={lang === 'ta' ? 'இலையுதிர்/வெப்பம்' : 'Conditions'} value={lang === 'ta' ? 'சூரிய ஒளி மற்றும் மண் வடிகால்' : 'Sunlight and soil drainage'} />
              <InfoCard icon={<TrendingUp size={18} />} label={lang === 'ta' ? 'மொத்த மகசூல்' : 'Yield'} value={lang === 'ta' ? selectedCrop.yield.ta : selectedCrop.yield.en} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              <DetailPanel
                icon={<Sprout size={18} />}
                title={lang === 'ta' ? 'வித்தியாசமான நடவு முறை' : 'Plantation Details'}
                bullets={lang === 'ta' ? selectedCrop.planting.ta : selectedCrop.planting.en}
              />

              <DetailPanel
                icon={<Droplets size={18} />}
                title={lang === 'ta' ? 'உரம் / உரமிடும் முறை' : 'Fertilizer Details'}
                bullets={lang === 'ta' ? selectedCrop.fertilizer.ta : selectedCrop.fertilizer.en}
              />
            </div>

            <div style={{ marginTop: '18px' }}>
              <div style={{ fontWeight: '800', marginBottom: '10px', fontSize: '1rem' }}>
                {lang === 'ta' ? 'பிரபலமான வகைகள்' : 'Popular Varieties'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedCrop.varieties.map(variety => (
                  <span key={variety.name} style={{
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary-hover)',
                    borderRadius: '999px',
                    padding: '8px 12px',
                    fontWeight: '700',
                    fontSize: '0.8rem'
                  }}>
                    {lang === 'ta' ? `${variety.nameTa} • ${variety.note}` : `${variety.name} • ${variety.note}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--color-card-border)',
      borderRadius: '16px',
      padding: '12px 14px',
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start'
    }}>
      <div style={{ color: 'var(--color-primary)', marginTop: '2px' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ marginTop: '4px', fontWeight: '600', lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  );
}

function DetailPanel({ icon, title, bullets }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--color-card-border)',
      borderRadius: '18px',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', marginBottom: '10px' }}>
        <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
        <span>{title}</span>
      </div>
      <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
        {bullets.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
