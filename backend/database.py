# LeafTriage SQLite Local Database Engine

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "leaftriage.db")

# Real verified agricultural remedies and disease information
DEFAULT_DISEASES = [
  {
    "id": "paddy_blast",
    "crop_en": "Paddy",
    "crop_ta": "நெல்",
    "icon": "🌾",
    "name_en": "Rice Blast Disease",
    "name_ta": "நெல் குலை நோய்",
    "symptoms_en": "Spindle-shaped brown lesions with greyish-white centers on leaf blades. Lesions enlarge and coalesce, causing entire leaves to desiccate.",
    "symptoms_ta": "இலைகளில் நீள்வட்ட வடிவ (கதிர் போன்ற) பழுப்பு நிறப் புள்ளிகள் தோன்றும். நடுப்பகுதி சாம்பல் நிறமாக இருக்கும். புள்ளிகள் ஒன்றுசேர்ந்து இலைகள் கருகிவிடும்.",
    "cause_en": "Magnaporthe oryzae (fungus), accelerated by cool nights, high humidity, and excessive nitrogen/urea fertilizer.",
    "cause_ta": "மேக்னாபோர்த்தே ஒரைசே என்ற பூஞ்சை. அதிக பனிப்பொழிவு, ஈரப்பதம் மற்றும் அளவுக்கு அதிகமான யூரியா உரம் இடுவதால் பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Panchagavya Organic Spray", "ta": "பஞ்சகாவ்யா இயற்கை தெளிப்பு" },
        "quantity": { "en": "300 ml in 10 liters of water (3% solution)", "ta": "10 லிட்டர் தண்ணீருக்கு 300 மி.லி (3% கரைசல்)" },
        "frequency": { "en": "Spray once every 10 to 12 days", "ta": "10 முதல் 12 நாட்களுக்கு ஒருமுறை" },
        "steps": { 
          "en": "Dilute clean Panchagavya in water. Spray early in the morning covering both leaf surfaces.",
          "ta": "பஞ்சகாவ்யாவை சுத்தமான நீரில் கலக்கவும். அதிகாலை வேளையில் இலைகளின் இருபுறமும் படியுமாறு தெளிக்கவும்."
        }
      },
      {
        "title": { "en": "Fermented Butter Milk & Asafoetida Spray", "ta": "புளித்த மோர் மற்றும் பெருங்காயக் கரைசல்" },
        "quantity": { "en": "500 ml sour buttermilk + 10 g asafoetida in 10L water", "ta": "10 லிட்டர் தண்ணீருக்கு 500 மி.லி புளித்த மோர் + 10 கிராம் பெருங்காயம்" },
        "frequency": { "en": "Twice with a gap of 7 days", "ta": "7 நாட்கள் இடைவெளியில் இரண்டு முறை" },
        "steps": {
          "en": "Mix well-fermented sour buttermilk with powdered asafoetida. Strain through cotton cloth and spray.",
          "ta": "புளித்த மோரில் பெருங்காயத்தூள் சேர்த்து கலக்கவும். துணியால் வடிகட்டி பயிரின் மேல் தெளிக்கவும்."
        }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Tricyclazole 75% WP [VERIFY WITH ADO]", "ta": "டிரைசைக்ளசோல் 75% WP [வேளாண் அலுவலரிடம் உறுதி செய்க]" },
        "dose": { "en": "120 g per acre in 200 liters of water", "ta": "ஏக்கருக்கு 120 கிராம் (200 லிட்டர் நீரில்)" },
        "how_to_apply": { "en": "Spray at the very first appearance of spindle spots on foliage.", "ta": "இலையில் முதல் புள்ளி தோன்றும் போதே இலைகளின் மேல் சீராக தெளிக்கவும்." },
        "safety": { "en": "Wear rubber gloves and face mask. Strictly avoid smoking or eating during spray.", "ta": "கையுறைகள் மற்றும் முகக்கவசம் அணியவும். தெளிக்கும் போது உணவு உண்பதைத் தவிர்க்கவும்." }
      }
    ],
    "prevention_en": "Avoid excess urea fertilizer. Seed treatment with Trichoderma viride at 4 g/kg seed before sowing. Maintain balanced irrigation.",
    "prevention_ta": "அதிகப்படியான யூரியாவைத் தவிர்க்கவும். விதைக்கும் முன் டிரைக்கோடெர்மா விரிடி (கிலோவுக்கு 4 கிராம்) கொண்டு விதை நேர்த்தி செய்யவும்."
  },
  {
    "id": "paddy_bacterial_blight",
    "crop_en": "Paddy",
    "crop_ta": "நெல்",
    "icon": "🌾",
    "name_en": "Bacterial Leaf Blight",
    "name_ta": "பாக்டீரியா இலைக்கருகல் நோய்",
    "symptoms_en": "Water-soaked streaks on leaf tips and margins turning yellow to straw-colored with wavy margins, drying from tip downwards.",
    "symptoms_ta": "இலைகளின் நுனி மற்றும் ஓரங்களில் நீர் ஊறிய மஞ்சள் நிறக் கோடுகள் தோன்றி, பின்னர் வைக்கோல் நிறமாக கருகி நுனியிலிருந்து கீழ்நோக்கி காயும்.",
    "cause_en": "Xanthomonas oryzae pv. oryzae bacteria, favored by cyclones, warm damp weather, and strong winds.",
    "cause_ta": "சாந்தோமோனாஸ் ஒரைசே பாக்டீரியா. புயல், தொடர் மழை மற்றும் பலத்த காற்றால் பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Fresh Cow Dung Water Filtrate Spray", "ta": "புதிய சாணக் கரைசல் தெளிப்பு" },
        "quantity": { "en": "2 kg fresh cow dung in 10 liters of water", "ta": "10 லிட்டர் தண்ணீருக்கு 2 கிலோ புதிய பசுஞ்சாணம்" },
        "frequency": { "en": "Spray immediately upon seeing tip drying", "ta": "நுனி கருகல் கண்டவுடன் தெளிக்கவும்" },
        "steps": { 
          "en": "Dissolve fresh cow dung in water, allow settling for 2 hours, filter thoroughly with muslin cloth, and spray.",
          "ta": "பசுஞ்சாணத்தை நீரில் கரைத்து 2 மணி நேரம் வைக்கவும். சுத்தமான துணியால் வடிகட்டி இலைகளில் தெளிக்கவும்."
        }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Streptocycline + Copper Oxychloride [VERIFY WITH ADO]", "ta": "ஸ்ட்ரெப்டோசைக்ளின் + காப்பர் ஆக்சிகுளோரைடு [வேளாண் ஆலோசனை]" },
        "dose": { "en": "6 g Streptocycline + 250 g COC in 200L water per acre", "ta": "ஏக்கருக்கு 6 கிராம் ஸ்ட்ரெப்டோசைக்ளின் + 250 கிராம் காப்பர் ஆக்சிகுளோரைடு" },
        "how_to_apply": { "en": "Spray when wavy margins appear on the leaves.", "ta": "இலை ஓரங்களில் அலை போன்ற கருகல் தோன்றியவுடன் தெளிக்கவும்." },
        "safety": { "en": "Keep away from drinking water channels and domestic animals.", "ta": "குடிநீர் கால்வாய்கள் மற்றும் கால்நடைகளுக்கு எட்டாமல் வைக்கவும்." }
      }
    ],
    "prevention_en": "Drain excess water from field. Apply potassic fertilizer (MOP) to boost crop immunity.",
    "prevention_ta": "வயலில் தேங்கிய நீரை வடிக்கவும். பயிரின் எதிர்ப்புச் சக்தியை அதிகரிக்க சாம்பல் சத்து (பொட்டாஷ்) இடவும்."
  },
  {
    "id": "tomato_early_blight",
    "crop_en": "Tomato",
    "crop_ta": "தக்காளி",
    "icon": "🍅",
    "name_en": "Early Blight",
    "name_ta": "ஆரம்ப இலைக்கருகல் நோய்",
    "symptoms_en": "Dark brown to black spots with concentric rings ('target-board' pattern) on older lower leaves, turning yellow and defoliating.",
    "symptoms_ta": "அடி இலைகளில் வளைய வடிவிலான (இலக்கு பலகை போன்ற) அடர் பழுப்பு நிற புள்ளிகள் தோன்றும். இலைகள் மஞ்சள் நிறமாக மாறி உதிரும்.",
    "cause_en": "Alternaria solani (fungus), thrives in warm humid weather with frequent rain or morning dew.",
    "cause_ta": "ஆல்டர்நேரியா சொலானி பூஞ்சை. மிதமான வெப்பமும் காற்றில் அதிக ஈரப்பதமும் இருக்கும் போது விரைவாக பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Neem Seed Kernel Extract (NSKE 5%)", "ta": "வேப்பங்கொட்டை சாறு (NSKE 5%)" },
        "quantity": { "en": "500 ml NSKE in 10 liters clean water", "ta": "10 லிட்டர் தண்ணீருக்கு 500 மி.லி வேப்பங்கொட்டை சாறு" },
        "frequency": { "en": "Spray every 7 to 10 days", "ta": "7 முதல் 10 நாட்களுக்கு ஒருமுறை" },
        "steps": { 
          "en": "Crush 500g neem seeds, soak overnight in 10L water, strain through cotton cloth, add 10ml soap solution, and spray.",
          "ta": "500 கிராம் வேப்பங்கொட்டையை இடித்து இரவு முழுவதும் ஊற வைக்கவும். துணியால் வடிகட்டி 10 மி.லி காதி சோப் கரைசல் சேர்த்து தெளிக்கவும்."
        }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Mancozeb 75% WP [VERIFY WITH ADO]", "ta": "மேன்கோசெப் 75% WP [வேளாண் அதிகாரியிடம் உறுதி செய்க]" },
        "dose": { "en": "2 g per liter of water (400g/acre)", "ta": "ஒரு லிட்டர் தண்ணீருக்கு 2 கிராம் (ஏக்கருக்கு 400 கிராம்)" },
        "how_to_apply": { "en": "Spray covering both upper and lower surface of leaves.", "ta": "இலையின் மேற்புறம் மற்றும் கீழ்ப்புறத்தில் நன்கு படியுமாறு தெளிக்கவும்." },
        "safety": { "en": "Do not spray during strong winds or peak sunlight.", "ta": "பலத்த காற்று அல்லது கடும் வெயிலில் தெளிக்க வேண்டாம்." }
      }
    ],
    "prevention_en": "Mulch soil around plants to prevent splash dispersal. Stake plants to elevate foliage off damp soil.",
    "prevention_ta": "செடிகளை குச்சிகட்டி தூக்கி நடவும். மண்ணிலிருந்து நீர் தெளிக்காமல் சொட்டு நீர் மூலம் பாசனம் செய்யவும்."
  },
  {
    "id": "banana_sigatoka",
    "crop_en": "Banana",
    "crop_ta": "வாழை",
    "icon": "🍌",
    "name_en": "Sigatoka Leaf Spot",
    "name_ta": "வாழை சிகடோகா இலைப்புள்ளி",
    "symptoms_en": "Small yellowish streaks parallel to veins that turn dark reddish-brown with grey centers, causing massive premature leaf drying.",
    "symptoms_ta": "இலை நரம்புகளுக்கு இணையாக மஞ்சள் கோடுகள் தோன்றி, பின் அடர் பழுப்பு நிறமாக மாறும். இலைகள் காய்ந்து தார் முதிர்வதற்கு முன்பே பழுத்துவிடும்.",
    "cause_en": "Pseudocercospora fijiensis / musae fungus, spreading rapidly in water-logged fields and dense shade.",
    "cause_ta": "சூடோசெர்கோஸ்போரா பூஞ்சை. தோட்டத்தில் நீர் தேங்குவது மற்றும் அதிக நிழலால் பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Leaf Sanitation & Field Pruning", "ta": "பாதிக்கப்பட்ட இலைகளை வெட்டி அகற்றுதல்" },
        "quantity": { "en": "Inspect every 15 days", "ta": "15 நாட்களுக்கு ஒருமுறை கள ஆய்வு" },
        "frequency": { "en": "Continuous during monsoon season", "ta": "பருவமழை காலம் முழுவதும் தொடர்ச்சியாக" },
        "steps": { 
          "en": "Cut heavily infected drying leaves with a clean sickle and bury outside the plantation to break fungal cycle.",
          "ta": "அதிகம் காய்ந்த நோயுற்ற இலைகளை வெட்டி தோட்டத்திற்கு வெளியே குழிதோண்டி புதைக்கவும்."
        }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Propiconazole 25% EC [VERIFY WITH ADO]", "ta": "புரோபிகோனசோல் 25% EC [வேளாண் ஆலோசனை பெறுக]" },
        "dose": { "en": "1 ml per liter of water + mineral oil (10ml/L)", "ta": "ஒரு லிட்டர் தண்ணீருக்கு 1 மி.லி + 10 மி.லி மினரல் ஆயில்" },
        "how_to_apply": { "en": "Spray on the lower surface of newly emerged banana leaves.", "ta": "புதிதாக வெளிவரும் வாழை இலைகளின் அடிப்பகுதியில் தெளிக்கவும்." },
        "safety": { "en": "Do not harvest fruits within 21 days of spraying.", "ta": "தெளித்த 21 நாட்களுக்கு பழங்களை அறுவடை செய்யக்கூடாது." }
      }
    ],
    "prevention_en": "Create deep drainage trenches between banana rows. Remove surplus side suckers regularly.",
    "prevention_ta": "வாழை வரப்புகளுக்கு இடையே வடிகால் வாய்க்கால் அமைக்கவும். தேவையற்ற பக்கக் கன்றுகளை நீக்கவும்."
  },
  {
    "id": "groundnut_tikka",
    "crop_en": "Groundnut",
    "crop_ta": "நிலக்கடலை",
    "icon": "🥜",
    "name_en": "Tikka Leaf Spot",
    "name_ta": "டிக்கா இலைப்புள்ளி நோய்",
    "symptoms_en": "Circular dark spots surrounded by a bright yellow halo on leaf surface, leading to early defoliation and poor pod development.",
    "symptoms_ta": "இலைகளின் மேல் மஞ்சள் நிற வளையத்துடன் கூடிய வட்ட வடிவ அடர் பழுப்பு புள்ளிகள் தோன்றும். இலைகள் கொட்டி காய்கள் சரிவர பிடிப்பதில்லை.",
    "cause_en": "Cercospora personata (fungus), spreading in wet soil conditions and prolonged humidity.",
    "cause_ta": "செர்கோஸ்போரா பூஞ்சை. காற்றில் அதிக ஈரப்பதம் மற்றும் மழைக்காலங்களில் விரைவாக பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Agni Astra Herbal Spray", "ta": "அக்னி அஸ்திர இயற்கை கரைசல்" },
        "quantity": { "en": "300 ml in 10 liters water", "ta": "10 லிட்டர் தண்ணீருக்கு 300 மி.லி" },
        "frequency": { "en": "Apply every 10 to 14 days", "ta": "10 முதல் 14 நாட்களுக்கு ஒருமுறை" },
        "steps": { 
          "en": "Boil neem leaves, green chillies, garlic paste in cow urine. Filter and spray on foliage.",
          "ta": "வேப்பிலை, பச்சை மிளகாய், பூண்டு ஆகியவற்றை பசுங்கோமியத்தில் காய்ச்சி வடித்தெடுத்து தெளிக்கவும்."
        }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Carbendazim 12% + Mancozeb 63% WP [VERIFY WITH ADO]", "ta": "கார்பென்டசிம் + மேன்கோசெப் WP [வேளாண் ஆலோசனை]" },
        "dose": { "en": "2 g per liter of water", "ta": "ஒரு லிட்டர் தண்ணீருக்கு 2 கிராம்" },
        "how_to_apply": { "en": "Spray 40-45 days after sowing or at the initial sight of spots.", "ta": "விதைத்த 40-45 நாட்களுக்குப் பிறகு அல்லது முதல் புள்ளி தெரிந்தவுடன் தெளிக்கவும்." },
        "safety": { "en": "Keep away from cattle feed and fodder.", "ta": "கால்நடை தீவனங்களிலிருந்து தள்ளி வைக்கவும்." }
      }
    ],
    "prevention_en": "Treat seeds with Trichoderma viride at 4 g/kg seed before sowing. Avoid sowing groundnut repeatedly in the same plot.",
    "prevention_ta": "விதைக்கும் முன் டிரைக்கோடெர்மா விரிடி (கிலோவுக்கு 4 கிராம்) கலந்து விதை நேர்த்தி செய்யவும்."
  },
  {
    "id": "chilli_anthracnose",
    "crop_en": "Chilli",
    "crop_ta": "மிளகாய்",
    "icon": "🌶️",
    "name_en": "Anthracnose / Fruit Rot",
    "name_ta": "கனி அழுகல் / ஆந்த்ராக்னோஸ்",
    "symptoms_en": "Sunken circular dark lesions on green and ripe chilli fruits with concentric rings of black dots, causing fruit shriveling and dropping.",
    "symptoms_ta": "பச்சை மற்றும் பழுத்த மிளகாய்களில் பள்ளமான வட்ட வடிவ புள்ளிகள் தோன்றும். பழங்கள் சுருங்கி காய்ந்து உதிர்ந்துவிடும்.",
    "cause_en": "Colletotrichum capsici (fungus), favored by high humidity (over 80%) and warm temperature (28°C).",
    "cause_ta": "கொல்லெட்டோட்ரைக்கம் பூஞ்சை. காற்றில் 80%-க்கு மேல் ஈரப்பதம் மற்றும் வெதுவெதுப்பான வெப்பநிலையில் தீவிரமடைகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Fermented Garlic & Chilli Extract", "ta": "புளித்த பூண்டு-மிளகாய் சாறு" },
        "quantity": { "en": "250 ml in 10 liters water", "ta": "10 லிட்டர் தண்ணீருக்கு 250 மி.லி" },
        "frequency": { "en": "Every 7 days during flowering and fruiting", "ta": "பூக்கும் மற்றும் காய் பிடிக்கும் பருவத்தில் 7 நாட்களுக்கு ஒருமுறை" },
        "steps": { 
          "en": "Crush 250g garlic and 250g chillies, ferment in water with a pinch of turmeric for 48 hours. Strain and spray.",
          "ta": "250 கிராம் பூண்டு, 250 கிராம் மிளகாயை நசுக்கி சிறிது மஞ்சள் தூள் சேர்த்து 48 மணி நேரம் ஊற வைக்கவும். வடிகட்டி தெளிக்கவும்."
        }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Azoxystrobin 23% SC [VERIFY WITH ADO]", "ta": "அசோக்சிஸ்ட்ரோபின் 23% SC [வேளாண் ஆலோசனை]" },
        "dose": { "en": "1 ml per liter of water", "ta": "ஒரு லிட்டர் தண்ணீருக்கு 1 மி.லி" },
        "how_to_apply": { "en": "Spray at flowering stage and repeat 15 days later if damp weather continues.", "ta": "பூ பூக்கும் தருணத்தில் ஒருமுறையும், ஈரப்பதம் தொடர்ந்தால் 15 நாட்கள் கழித்து மறுமுறையும் தெளிக்கவும்." },
        "safety": { "en": "Do not harvest chillies within 5 days of spray.", "ta": "தெளித்த 5 நாட்களுக்கு மிளகாய் பறிக்கக்கூடாது." }
      }
    ],
    "prevention_en": "Use certified disease-free seeds. Treat seeds with Pseudomonas fluorescens (10 g/kg). Ensure good row aeration.",
    "prevention_ta": "சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்தவும். சூடோமோனாஸ் புளோரசன்ஸ் கொண்டு விதை நேர்த்தி செய்யவும்."
  },
  {
    "id": "tomato_late_blight",
    "crop_en": "Tomato",
    "crop_ta": "தக்காளி",
    "icon": "🍅",
    "name_en": "Late Blight",
    "name_ta": "தாமதமான இலைக்கருகல்",
    "symptoms_en": "Water-soaked pale green lesions on leaves that expand rapidly into dark patches, often spreading from the leaf edge.",
    "symptoms_ta": "இலைகளில் நீர் ஊறிய வெளிர் பச்சை புள்ளிகள் தோன்றி விரைவாக கரும் பழுப்பு நிறமாக விரிவடையும்.",
    "cause_en": "Phytophthora infestans fungus-like oomycete favored by cool wet weather and poor drainage.",
    "cause_ta": "பைட்டோப்தோரா இன்ஃபெஸ்டான்ஸ் பூஞ்சை போன்ற உயிரினம். குளிர் மற்றும் ஈரப்பதம் மிக்க சூழலில் விரைவாக பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Garlic-Neem Foliar Spray", "ta": "பூண்டு-வேப்பிலை தெளிப்பு" },
        "quantity": { "en": "250 ml extract in 10 liters water", "ta": "10 லிட்டர் தண்ணீருக்கு 250 மி.லி சாறு" },
        "frequency": { "en": "Repeat every 5 to 7 days", "ta": "5 முதல் 7 நாட்களுக்கு ஒருமுறை" },
        "steps": { "en": "Blend neem leaves and garlic, dilute in water, filter, and spray on the crop canopy.", "ta": "வேப்பிலை மற்றும் பூண்டை அரைத்து நீரில் கரைத்து வடிகட்டி பயிரின் மேல் தெளிக்கவும்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Mancozeb + Metalaxyl-M Systemic Spray", "ta": "மேன்கோசெப் + மெட்டாலாக்சில்-எம்" },
        "dose": { "en": "2 g per liter of water", "ta": "ஒரு லிட்டர் தண்ணீருக்கு 2 கிராம்" },
        "how_to_apply": { "en": "Spray at early symptom stage and repeat after 7-10 days if needed.", "ta": "முதல் அறிகுறிகள் தெரிந்தவுடன் தெளித்து 7-10 நாட்களில் மீண்டும் தெளிக்கவும்." },
        "safety": { "en": "Use gloves and avoid spraying in hot midday sunlight.", "ta": "கையுறைகளை அணிந்து தீவிர வெயிலில் தெளிக்க வேண்டாம்." }
      }
    ],
    "prevention_en": "Improve drainage and avoid leaf wetness overnight. Remove infected lower leaves promptly.",
    "prevention_ta": "வடிகால் வசதி சீராக பராமரிக்கவும். பாதிக்கப்பட்ட கீழ் இலைகளை உடனடியாக அகற்றவும்."
  },
  {
    "id": "tomato_leaf_mold",
    "crop_en": "Tomato",
    "crop_ta": "தக்காளி",
    "icon": "🍅",
    "name_en": "Leaf Mold",
    "name_ta": "இலை அச்சு நோய்",
    "symptoms_en": "Yellow patches on older leaves with olive-green mold growth on the underside, leading to premature leaf drop.",
    "symptoms_ta": "பழைய இலைகளில் மஞ்சள் புள்ளிகள் தோன்றி, கீழ்ப்புறத்தில் ஆலிவ்-பச்சை அச்சு படிந்து இலைகள் விரைவாக உதிரும்.",
    "cause_en": "Fulvia fulva (Passalora) fungus developing under high humidity and stagnant air conditions.",
    "cause_ta": "ஃபுல்வியா ஃபுல்வா பூஞ்சை. அதிக ஈரப்பதம் மற்றும் காற்று நெரிசலான சூழலில் விரைவாக வளர்கிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Neem + Soap Spray", "ta": "வேப்பிலை + சோப்பு தெளிப்பு" },
        "quantity": { "en": "500 ml neem extract in 10 liters water", "ta": "10 லிட்டர் தண்ணீருக்கு 500 மி.லி வேப்பிலை சாறு" },
        "frequency": { "en": "Weekly until leaves recover", "ta": "நோய் குறையும் வரை வாரத்திற்கு ஒருமுறை" },
        "steps": { "en": "Prepare neem extract and add a mild soap solution, then spray undersides of leaves.", "ta": "வேப்பிலைச் சாற்றுடன் மிதமான சோப் கரைசலை சேர்த்து இலைகளின் கீழ்ப்புறத்தில் தெளிக்கவும்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Copper Oxychloride + Maneb", "ta": "காப்பர் ஆக்சிகுளோரைடு + மேனெப்" },
        "dose": { "en": "2.5 g per liter of water", "ta": "ஒரு லிட்டர் தண்ணீருக்கு 2.5 கிராம்" },
        "how_to_apply": { "en": "Spray both leaf surfaces in the evening", "ta": "இரவு நேரத்தில் இலைகளின் இரு புறமும் தெளிக்கவும்." },
        "safety": { "en": "Do not spray under strong sun. Wash packs after use.", "ta": "கடும் வெயிலில் தெளிக்க வேண்டாம். பயன்படுத்திய பிறகு பாட்டில்களை கழுவவும்." }
      }
    ],
    "prevention_en": "Keep canopy airy and avoid overhead irrigation. Prune lower leaves to improve ventilation.",
    "prevention_ta": "காற்றோட்டத்தை மேம்படுத்தி மேல்நீரைத் தவிர்க்கவும். கீழ் இலைகளை வெட்டி காற்று சுதந்திரமாக வரவிடவும்."
  },
  {
    "id": "tomato_yellow_leaf_curl",
    "crop_en": "Tomato",
    "crop_ta": "தக்காளி",
    "icon": "🍅",
    "name_en": "Yellow Leaf Curl Virus",
    "name_ta": "மஞ்சள் இலை திருப்பம்",
    "symptoms_en": "Leaves curl upward, become small, yellowed, and plant growth is stunted with poor fruit set.",
    "symptoms_ta": "இலைகள் மேல்நோக்கி மடிந்து சிறியதாகவும் மஞ்சள் நிறமாகவும் மாறுகின்றன; செடி வளர்ச்சி குறைகிறது.",
    "cause_en": "Begomovirus transmitted by whiteflies, favored by warm temperatures and rapid crop cycles.",
    "cause_ta": "வெள்ளை ஈக்கள் மூலம் பரவும் பீகின் மோனோவைரஸ்; வெப்பமான சூழலில் விரைவாகப் பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Whitefly Trap & Sanitation", "ta": "வெள்ளை ஈ பந்தை கட்டுப்படுத்துதல்" },
        "quantity": { "en": "1 trap per 50-100 m²", "ta": "50-100 சதுர மீட்டருக்கு 1 பந்து" },
        "frequency": { "en": "Monitor weekly", "ta": "வாரத்திற்கு ஒருமுறை பரிசோதனை" },
        "steps": { "en": "Use sticky yellow traps and remove infected plants to reduce vector pressure.", "ta": "மஞ்சள் ஒட்டும் பந்துகளைப் பயன்படுத்தி பாதிக்கப்பட்ட செடிகளை அகற்றி வெள்ளை ஈக்களைக் கட்டுப்படுத்தவும்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Vector Control with Imidacloprid / Thiacloprid", "ta": "இமிடாக்ளோப்ரிட் / தியாக்லோப்ரிட்" },
        "dose": { "en": "Follow local label dose strictly", "ta": "உள்ளூர் வழிகாட்டியின்படி அளவு பின்பற்றவும்" },
        "how_to_apply": { "en": "Use only as a targeted vector control measure and follow withdrawal period.", "ta": "வெள்ளை ஈ கட்டுப்பாடு மட்டும் குறிவைத்து பயன்படுத்துங்கள்; வெளியேற்ற காலம் பின்பற்றவும்." },
        "safety": { "en": "Keep away from bees and apply in the evening only.", "ta": "தேனீக்களுக்கு எட்டாதவாறு மாலை நேரத்தில் பயன்படுத்தவும்." }
      }
    ],
    "prevention_en": "Use nursery netting and resistant varieties; remove weed hosts around field edges.",
    "prevention_ta": "தோட்டம் மற்றும் நாற்றங்காலில் வெள்ளை ஈக்களை கட்டுப்படுத்தி எதிர்ப்பு வகைகளை பயன்படுத்தவும்."
  },
  {
    "id": "potato_early_blight",
    "crop_en": "Potato",
    "crop_ta": "உருளைக்கிழங்கு",
    "icon": "🥔",
    "name_en": "Early Blight",
    "name_ta": "ஆரம்ப இலைக்கருகல்",
    "symptoms_en": "Brown circular spots on older potato leaves with target-board rings, eventually leading to defoliation.",
    "symptoms_ta": "பழைய இலைகளில் வளைய வடிவ பழுப்பு புள்ளிகள் தோன்றி, பின்னர் இலைகள் உதிரும்.",
    "cause_en": "Alternaria solani fungus, worse in warm humid or drought stress conditions.",
    "cause_ta": "ஆல்டர்னேரியா சோலானி பூஞ்சை. வெப்பமும் ஈரப்பதமும் இருக்கும்போது விரைவாக பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Neem + Cow Urine Spray", "ta": "வேப்பிலை + கோமியம் தெளிப்பு" },
        "quantity": { "en": "300 ml spray solution in 10 liters water", "ta": "10 லிட்டர் தண்ணீருக்கு 300 மி.லி" },
        "frequency": { "en": "Every 7 to 10 days", "ta": "7 முதல் 10 நாட்களுக்கு ஒருமுறை" },
        "steps": { "en": "Prepare neem extract and mix with diluted cow urine, then spray once every 7-10 days.", "ta": "வேப்பிலைச் சாற்றுடன் சிறிது கோமியத்தை கலந்து 7-10 நாட்களுக்கு ஒருமுறை தெளிக்கவும்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Mancozeb 75% WP", "ta": "மேன்கோசெப் 75% WP" },
        "dose": { "en": "2 g per liter of water", "ta": "ஒரு லிட்டர் தண்ணீருக்கு 2 கிராம்" },
        "how_to_apply": { "en": "Spray on both leaf surfaces after first early blight symptoms appear.", "ta": "முதல் அறிகுறிகள் தோன்றியவுடன் இலைகளின் இருபுறமும் தெளிக்கவும்." },
        "safety": { "en": "Use PPE and wash equipment thoroughly after use.", "ta": "பாதுகாப்பு ஆடைகள் அணிந்து பயன்பாட்டின் பின் கருவிகளை கழுவவும்." }
      }
    ],
    "prevention_en": "Avoid over-irrigation and remove infected residue after harvest.",
    "prevention_ta": "அதிக நீர் பாய்ச்சுவதைத் தவிர்த்து அறுவடை பின்னர் பாதிக்கப்பட்ட சில்லுகளை அகற்றவும்."
  },
  {
    "id": "potato_late_blight",
    "crop_en": "Potato",
    "crop_ta": "உருளைக்கிழங்கு",
    "icon": "🥔",
    "name_en": "Late Blight",
    "name_ta": "தாமதமான இலைக்கருகல்",
    "symptoms_en": "Irregular dark lesions on leaf margins and tips spreading rapidly, often causing leaf collapse in wet conditions.",
    "symptoms_ta": "இலை ஓரங்களில் சமமற்ற கருப்பு புள்ளிகள் தோன்றி விரைவாக பரவி, ஈரப்பதமான சூழலில் இலைகள் சிதைகின்றன.",
    "cause_en": "Phytophthora infestans under cool cloudy wet weather and poor field sanitation.",
    "cause_ta": "சீரற்ற தட்பவெப்பம், மேகமூட்டமான மழை மற்றும் தூய்மை குறைபாடு ஆகியவை காரணமாக பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Copper Sulphate + Ash Foliar Mix", "ta": "தாமிர சல்பேட் + சாம்பல் கரைசல்" },
        "quantity": { "en": "200 ml solution in 10 liters water", "ta": "10 லிட்டர் தண்ணீருக்கு 200 மி.லி" },
        "frequency": { "en": "Every 5-7 days during wet spell", "ta": "ஈரப்பதமான காலத்தில் 5-7 நாட்களுக்கு ஒருமுறை" },
        "steps": { "en": "Prepare a mild copper solution with plant ash, filter, and spray the infected canopy.", "ta": "சிறிது தாமிர கரைசலுடன் சாம்பலை சேர்த்து வடிகட்டி பாதிக்கப்பட்ட பயிரில் தெளிக்கவும்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Metalaxyl-M + Mancozeb", "ta": "மெட்டாலாக்சில்-எம் + மேன்கோசெப்" },
        "dose": { "en": "2 g per liter of water", "ta": "ஒரு லிட்டர் தண்ணீருக்கு 2 கிராம்" },
        "how_to_apply": { "en": "Initiate spray at the first lesion appearance and repeat 7 days later if needed.", "ta": "முதல் புள்ளிகள் தோன்றியவுடன் தெளித்து 7 நாட்கள் கழித்து மீண்டும் தெளிக்கவும்." },
        "safety": { "en": "Avoid contact with skin and keep away from livestock.", "ta": "சருமத்தில் படாமல் பார்த்துக் கொள்ளுங்கள்; கால்நடைகளுக்கு அருகில் வைக்க வேண்டாம்." }
      }
    ],
    "prevention_en": "Use resistant seed potatoes and avoid dense canopy conditions at night.",
    "prevention_ta": "எதிர்ப்பு வகை உருளைக்கிழங்கை பயன்படுத்தி இரவு நேரத்தில் அடர்த்தியான காப்பு தவிர்க்கவும்."
  },
  {
    "id": "pepper_bacterial_spot",
    "crop_en": "Pepper",
    "crop_ta": "மிளகாய்",
    "icon": "🌶️",
    "name_en": "Bacterial Spot",
    "name_ta": "பாக்டீரியா புள்ளி நோய்",
    "symptoms_en": "Brown circular spots with yellow halos on pepper leaves and fruits becoming rough and cracked.",
    "symptoms_ta": "மிளகாய் இலைகளில் மஞ்சள் வளையத்துடன் பழுப்பு வட்டப் புள்ளிகள் தோன்றி, பழங்கள் கடினமாகி விரிசலடைகின்றன.",
    "cause_en": "Xanthomonas spp. bacteria spread by splashing water, infected seed, and wind-driven rain.",
    "cause_ta": "சான்தோமோனாஸ் பாக்டீரியா, நீர் தெறிப்பு மற்றும் காற்று மழை மூலம் பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Turmeric + Neem Spray", "ta": "மஞ்சள் + வேப்பிலை தெளிப்பு" },
        "quantity": { "en": "300 ml in 10 liters water", "ta": "10 லிட்டர் தண்ணீருக்கு 300 மி.லி" },
        "frequency": { "en": "Every 7 days", "ta": "7 நாட்களுக்கு ஒருமுறை" },
        "steps": { "en": "Prepare neem leaf extract and add turmeric paste, then spray on foliage.", "ta": "வேப்பிலைச் சாற்றுடன் மஞ்சள் பசை சேர்த்து இலைகளில் தெளிக்கவும்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Copper Hydroxide / Copper Oxychloride", "ta": "காப்பர் ஹைட்ராக்சைடு / ஆக்சிகுளோரைடு" },
        "dose": { "en": "2 g per liter of water", "ta": "ஒரு லிட்டர் தண்ணீருக்கு 2 கிராம்" },
        "how_to_apply": { "en": "Spray at early symptom stage and repeat 10 days later if needed.", "ta": "முதல் அறிகுறிகள் தெரிந்தவுடன் தெளித்து 10 நாட்களில் மீண்டும் தெளிக்கவும்." },
        "safety": { "en": "Use protective gloves and face mask; avoid spraying near apiary.", "ta": "கையுறைகள் மற்றும் முகக்கவசம் அணிந்து தேனீகள் இருக்கும் இடத்திற்கு அருகில் தெளிக்க வேண்டாம்." }
      }
    ],
    "prevention_en": "Use clean seed and avoid overhead irrigation. Rotate crops to reduce bacterial carryover.",
    "prevention_ta": "சுத்தமான விதைகளை பயன்படுத்தி மேல் நீர் தெளிப்பதை தவிர்க்கவும். பயிர் சுழற்சி செய்துகொள்ளவும்."
  },
  {
    "id": "apple_scab",
    "crop_en": "Apple",
    "crop_ta": "பழம்",
    "icon": "🍎",
    "name_en": "Apple Scab",
    "name_ta": "பழம் பொட்டு நோய்",
    "symptoms_en": "Olive-brown scab lesions on fruit and leaves with cracked, corky surfaces.",
    "symptoms_ta": "பழங்கள் மற்றும் இலைகளில் ஆலிவ்-பழுப்பு புள்ளிகள் தோன்றி, பிளவுபட்டு காகிதம் போன்ற மேற்பரப்பு உருவாகும்.",
    "cause_en": "Venturia inaequalis fungus spreading under cool moist spring weather.",
    "cause_ta": "வென்டூரியா இனேக்வாலிஸ் பூஞ்சை. குளிர்ந்த ஈரப்பதமான காலத்தில் விரைவாக பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Bordeaux Mixture Spray", "ta": "போர்டோமிக்ஸ் கரைசல்" },
        "quantity": { "en": "1% Bordeaux solution", "ta": "1% போர்டோமிக்ஸ் கரைசல்" },
        "frequency": { "en": "Apply during early spring", "ta": "குளிர்காலத்திற்குப் பின் ஆரம்பத்தில்" },
        "steps": { "en": "Prepare a diluted Bordeaux mixture and spray the fruiting tree canopy before disease intensifies.", "ta": "சிறிது போர்டோமிக்ஸ் கரைசலை தயார் செய்து நோய் தீவிரமடைவதற்கு முன்பே தெளிக்கவும்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Captan / Difenoconazole", "ta": "கேப்டன் / டிஃபெனோகோனசோல்" },
        "dose": { "en": "Follow product label carefully", "ta": "தயாரிப்பு லேபிளை கவனமாக பின்பற்றவும்" },
        "how_to_apply": { "en": "Use fungicide after bud break and repeat according to label.", "ta": "மொட்டு திறந்த பிறகு பூஞ்சைக் கொல்லியை பயன்படுத்தி லேபிள் வழியில் மீண்டும் தெளிக்கவும்." },
        "safety": { "en": "Avoid direct drift to nearby food crops.", "ta": "அருகிலுள்ள உணவு பயிர்களுக்கு நேரடியாகப் படாமல் பார்த்து கையாளவும்." }
      }
    ],
    "prevention_en": "Prune infected shoots and maintain good air circulation in the orchard.",
    "prevention_ta": "பாதிக்கப்பட்ட இளங்கிளைகளை வெட்டி, தோட்டத்தில் காற்றோட்டத்தை சீராக பராமரிக்கவும்."
  },
  {
    "id": "grape_black_rot",
    "crop_en": "Grape",
    "crop_ta": "திராட்சை",
    "icon": "🍇",
    "name_en": "Black Rot",
    "name_ta": "கருப்புப் புழுதி நோய்",
    "symptoms_en": "Circular black lesions on grape leaves and berries with shriveled fruit clusters.",
    "symptoms_ta": "திராட்சை இலைகளிலும் பழங்களிலும் வட்டமான கருப்பு புள்ளிகள் தோன்றி பழக்கூட்டங்கள் சுருங்கி காய்கின்றன.",
    "cause_en": "Guignardia bidwellii fungus, favored by warm humid weather and dense canopy.",
    "cause_ta": "கியூன்கார்டியா பிட்வெல்லி பூஞ்சை. வெப்பமான ஈரப்பதமான காற்றிலும் அடர்த்தியான பசுமையை கொண்ட தோட்டத்திலும் பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Sulphur Dusting", "ta": "கந்தக தூள் தெளிப்பு" },
        "quantity": { "en": "Follow farmer label directions", "ta": "வழிகாட்டி லேபிளை பின்பற்றவும்" },
        "frequency": { "en": "Every 7-10 days", "ta": "7-10 நாட்களுக்கு ஒருமுறை" },
        "steps": { "en": "Dust vines with safe sulphur powder early in the morning and after canopy dries.", "ta": "திராட்சை கொடிகளில் குறைந்த அளவு கந்தக தூளை அதிகாலையில் தெளித்து, மேற்பரப்பு வறண்ட பிறகு மீண்டும் பயன்படுத்தவும்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Mancozeb / Captan", "ta": "மேன்கோசெப் / கேப்டன்" },
        "dose": { "en": "Use label-based dosage", "ta": "லேபிளில் கூறிய அளவை பின்பற்றவும்" },
        "how_to_apply": { "en": "Apply before infection spreads extensively across bunches.", "ta": "நோய் விரைவாக பரவுவதற்கு முன் தெளிக்கவும்." },
        "safety": { "en": "Protect workers from splashes and do not spray during strong wind.", "ta": "பலத்த காற்றில் தெளிக்க வேண்டாம்; தொழிலாளர்களுக்கு பாதுகாப்பு வழங்கவும்." }
      }
    ],
    "prevention_en": "Prune dense shoots and remove infected fruit to break the disease cycle.",
    "prevention_ta": "அடர்ந்த கிளைகளை வெட்டி பாதிக்கப்பட்ட பழங்களை அகற்றி நோய் சுழற்சியை உடைக்கவும்."
  },
  {
    "id": "maize_common_rust",
    "crop_en": "Maize",
    "crop_ta": "சோளம்",
    "icon": "🌽",
    "name_en": "Common Rust",
    "name_ta": "பொதுவான துரு நோய்",
    "symptoms_en": "Small reddish-brown pustules on both leaf surfaces that later turn dark and spread along the leaf.",
    "symptoms_ta": "இலைகளின் இரு புறங்களிலும் சிறிய அரிவாள்போன்ற சிவப்பு-பழுப்பு புண்கள் தோன்றி, பின் கருமையாகி பரவுகின்றன.",
    "cause_en": "Puccinia sorghi fungal rust favored by cool nights and high humidity.",
    "cause_ta": "புக்கினியா சோர்கி பூஞ்சை. குளிர்ந்த இரவுகள் மற்றும் அதிக ஈரப்பதத்தால் பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Neem Ash Dust", "ta": "வேப்பிலை சாம்பல் தூள்" },
        "quantity": { "en": "Light dusting over canopy", "ta": "இலைகள் முழுவதும் மிதமான தூள்" },
        "frequency": { "en": "Every 10 days", "ta": "10 நாட்களுக்கு ஒருமுறை" },
        "steps": { "en": "Dust neem ash lightly on leaves and avoid heavy watering at night.", "ta": "வேப்பிலை சாம்பலை மிதமாக இலைகளில் தூவிவிட்டு இரவில் அதிக நீர் பாய்ச்சுவதை தவிர்க்கவும்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Azoxystrobin / Propiconazole", "ta": "அசோக்ஸிஸ்ட்ரோபின் / புரோபிகோனசோல்" },
        "dose": { "en": "Follow label-specific dose", "ta": "தயாரிப்பு லேபிளை பின்பற்றவும்" },
        "how_to_apply": { "en": "Apply at first rust formation and repeat after 10-14 days if needed.", "ta": "முதல் துரு புண்கள் தோன்றியவுடன் தெளித்து 10-14 நாட்கள் கழித்து மீண்டும் பயன்படுத்தவும்." },
        "safety": { "en": "Wear gloves and avoid drift to neighboring crops.", "ta": "கையுறை அணிந்து அருகிலுள்ள பிற பயிர்களுக்கு படாமல் பார்த்துக் கொள்ளுங்கள்." }
      }
    ],
    "prevention_en": "Use resistant hybrids and maintain balanced nitrogen fertilizer to prevent excessive lush growth.",
    "prevention_ta": "எதிர்ப்பு வகைகளை பயன்படுத்தி, அதிக யூரியா இடுவதைத் தவிர்க்கவும்."
  },
  {
    "id": "maize_gray_leaf_spot",
    "crop_en": "Maize",
    "crop_ta": "சோளம்",
    "icon": "🌽",
    "name_en": "Gray Leaf Spot",
    "name_ta": "சாம்பல் இலைப்புள்ளி நோய்",
    "symptoms_en": "Long gray rectangular lesions parallel to leaf veins, reducing photosynthesis and grain fill.",
    "symptoms_ta": "இலை நரம்புகளுக்கு இணையாக நீளமான சாம்பல் செவ்வகப் புள்ளிகள் தோன்றி ஒளிச்சேர்க்கையை குறைக்கின்றன.",
    "cause_en": "Cercospora zeae-maydis fungus spreading in warm humid weather and continuous maize cropping.",
    "cause_ta": "செர்கோஸ்போரா ஜீ-மேய்டிஸ் பூஞ்சை. வெப்பம் மற்றும் ஈரப்பதம் அதிகமாக உள்ள இடங்களில் பரவுகிறது.",
    "traditional_remedies": [
      {
        "title": { "en": "Layered Compost & Ash Mulch", "ta": "மட்கிய உரம் + சாம்பல் பூச்சு" },
        "quantity": { "en": "Light mulch layer across rows", "ta": "வரிகளில் மிதமான பூச்சு" },
        "frequency": { "en": "At onset of season", "ta": "பருவ ஆரம்பத்தில்" },
        "steps": { "en": "Add compost and wood ash to the field, and reduce water stress by avoiding leaf wetness overnight.", "ta": "மட்கிய உரமும் மரசாம்பலும் சேர்த்து தடவிவிட்டு இரவு நேரத்தில் இலைப்பகுதியை நனையவிடாதீர்கள்." }
      }
    ],
    "fertilizer_remedies": [
      {
        "name": { "en": "Azoxystrobin / Propiconazole", "ta": "அசோக்ஸிஸ்ட்ரோபின் / புரோபிகோனசோல்" },
        "dose": { "en": "Follow label dose exactly", "ta": "லேபிளின் அளவை திட்டமாக பின்பற்றவும்" },
        "how_to_apply": { "en": "Apply at disease onset and repeat 10-14 days later if needed.", "ta": "நோய் தோன்றியதும் தெளித்து 10-14 நாட்களுக்கு பின் மீண்டும் பயன்படுத்தவும்." },
        "safety": { "en": "Wear gloves and avoid contaminating nearby water sources.", "ta": "கையுறை அணிந்து, அருகிலுள்ள நீர் ஆதாரங்களில் படாமல் பார்த்துக் கொள்ளுங்கள்." }
      }
    ],
    "prevention_en": "Rotate with legumes and maintain balanced plant nutrition to reduce infection pressure.",
    "prevention_ta": "கால்நடை மற்றும் பருப்பு வகை பயிர் சுழற்சி செய்து, ஊட்டச்சத்து சமநிலையை பராமரிக்கவும்."
  }
]

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Diseases table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS diseases (
        id TEXT PRIMARY KEY,
        crop_en TEXT NOT NULL,
        crop_ta TEXT NOT NULL,
        icon TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_ta TEXT NOT NULL,
        symptoms_en TEXT NOT NULL,
        symptoms_ta TEXT NOT NULL,
        cause_en TEXT,
        cause_ta TEXT,
        traditional_remedies TEXT NOT NULL,
        fertilizer_remedies TEXT NOT NULL,
        prevention_en TEXT,
        prevention_ta TEXT
    )
    """)

    # Scan history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scan_history (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        disease_id TEXT NOT NULL,
        crop_en TEXT NOT NULL,
        crop_ta TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_ta TEXT NOT NULL,
        icon TEXT,
        confidence INTEGER NOT NULL,
        image_data TEXT,
        status TEXT DEFAULT 'diagnosed'
    )
    """)

    # Seed missing disease records so the database stays aligned with the larger PlantVillage-style disease set.
    for d in DEFAULT_DISEASES:
        cursor.execute("""
        INSERT OR IGNORE INTO diseases (
            id, crop_en, crop_ta, icon, name_en, name_ta,
            symptoms_en, symptoms_ta, cause_en, cause_ta,
            traditional_remedies, fertilizer_remedies,
            prevention_en, prevention_ta
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            d["id"], d["crop_en"], d["crop_ta"], d["icon"],
            d["name_en"], d["name_ta"], d["symptoms_en"], d["symptoms_ta"],
            d.get("cause_en", ""), d.get("cause_ta", ""),
            json.dumps(d["traditional_remedies"]),
            json.dumps(d["fertilizer_remedies"]),
            d.get("prevention_en", ""), d.get("prevention_ta", "")
        ))
    conn.commit()

    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn

# Database helpers
def fetch_all_diseases() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM diseases")
    rows = cursor.fetchall()
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "crop": r["crop_en"],
            "crop_ta": r["crop_ta"],
            "icon": r["icon"],
            "names": { "en": r["name_en"], "ta": r["name_ta"] },
            "symptoms": { "en": r["symptoms_en"], "ta": r["symptoms_ta"] },
            "cause": { "en": r["cause_en"], "ta": r["cause_ta"] },
            "traditional_remedies": json.loads(r["traditional_remedies"]),
            "fertilizer_remedies": json.loads(r["fertilizer_remedies"]),
            "prevention": { "en": r["prevention_en"], "ta": r["prevention_ta"] }
        })
    conn.close()
    return results

def fetch_disease_by_id(disease_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM diseases WHERE id = ?", (disease_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    return {
        "id": r["id"],
        "crop": r["crop_en"],
        "crop_ta": r["crop_ta"],
        "icon": r["icon"],
        "names": { "en": r["name_en"], "ta": r["name_ta"] },
        "symptoms": { "en": r["symptoms_en"], "ta": r["symptoms_ta"] },
        "cause": { "en": r["cause_en"], "ta": r["cause_ta"] },
        "traditional_remedies": json.loads(r["traditional_remedies"]),
        "fertilizer_remedies": json.loads(r["fertilizer_remedies"]),
        "prevention": { "en": r["prevention_en"], "ta": r["prevention_ta"] }
    }

def fetch_scan_history() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scan_history ORDER BY timestamp DESC LIMIT 50")
    rows = cursor.fetchall()
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "diseaseId": r["disease_id"],
            "cropEn": r["crop_en"],
            "cropTa": r["crop_ta"],
            "diseaseNameEn": r["name_en"],
            "diseaseNameTa": r["name_ta"],
            "icon": r["icon"],
            "confidence": r["confidence"],
            "imagePlaceholder": r["image_data"]
        })
    conn.close()
    return results

def insert_scan_history(record: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO scan_history (
        id, timestamp, disease_id, crop_en, crop_ta,
        name_en, name_ta, icon, confidence, image_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record["id"], record["timestamp"], record["disease_id"],
        record["crop_en"], record["crop_ta"], record["name_en"],
        record["name_ta"], record.get("icon", "🌿"),
        record["confidence"], record.get("image_data", "")
    ))
    conn.commit()
    conn.close()
    return record

def delete_scan_record(scan_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scan_history WHERE id = ?", (scan_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def clear_all_scans() -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scan_history")
    conn.commit()
    conn.close()
    return True
