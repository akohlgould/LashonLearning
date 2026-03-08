# LashonLearning
Created by brandeis students: Adam Gould, Adam Heany, Oneg Kaufman-Grob, and Rafi Hamermesh 

**LashonLearning** is a comprehensive Hebrew vocabulary learning platform that integrates with Sefaria's extensive Jewish text database. The system combines a Chrome browser extension, a React web application, and a Cloudflare Workers proxy to create an intelligent flashcard system powered by real Biblical and Rabbinic text examples.

##  Overview

LashonLearning helps Hebrew learners build vocabulary by:
- Capturing Hebrew words directly from Sefaria.org while reading
- Fetching dictionary definitions from Sefaria's lexicon
- Finding contextual examples from across Jewish texts
- Creating interactive flashcards with authentic usage examples
- Providing a modern, responsive web interface for studying


## Components

### 1. Chrome Extension: Flashcard Word Grabber

A lightweight Chrome extension that integrates with Sefaria.org to capture Hebrew vocabulary.

#### Features
- **Context Menu Integration**: Right-click any Hebrew word to add it to your flashcard list
- **Smart Hebrew Processing**: Automatically strips cantillation marks (taamim) while preserving vowel points (nekudot)
- **Duplicate Detection**: Prevents the same word from being added multiple times
- **Local Storage**: Persists word lists in Chrome's local storage
- **External Messaging API**: Allows the web app to sync word lists via Chrome's messaging system
- **Visual Popup Interface**: Browse and manage saved words with an elegant Hebrew-optimized UI

#### Technical Details
- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `storage`, `contextMenus`
- **External Connectivity**: Configured for `localhost` and `akohlgould.github.io`
- **Extension ID**: `nlcebalffaibfcnohbknmgpkdoedliej`


#### Pages
- `/` - **FlashcardsPage**: Interactive flashcard study interface
- `/wordlist` - **WordlistPage**: Comprehensive word list with management tools

#### Development Scripts
```bash
cd react/lashon-learning

# Start development server (localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Lint code
npm run lint
```

#### Deployment
The app is deployed to GitHub Pages at: `https://akohlgould.github.io/LashonLearning/`


#### Configuration
- **Allowed Origins**:
  - `https://akohlgould.github.io` (production)
  - `http://localhost:5173` (Vite dev server)
  - `http://localhost:4173` (Vite preview)
- **Allowed Methods**: GET, POST, OPTIONS
- **Allowed Headers**: Content-Type, Accept
- **Deployment URL**: `https://sefaria-proxy.adamhsefaria.workers.dev`


#### Technical Details
- **Runtime**: Cloudflare Workers (V8 isolates)
- **Compatibility Date**: 2024-01-01
- **Path Handling**: Only proxies `/api/*` paths
- **Error Handling**: Returns 404 for non-API requests


#### Search Algorithm
The verse search uses Sefaria's naive lemmatizer field with:
- **Query Type**: Text search
- **Field**: `naive_lemmatizer` (matches word roots)
- **Size**: 100 results
- **Slop**: 10 (allows word variations)
- **Sort**: By page rank (most significant texts first)

#### Environment Detection
Automatically switches between:
- **Local Development**: Direct API calls to `localhost` (assumes local Sefaria instance or dev proxy)
- **Production**: Routes through Cloudflare Workers proxy


### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/akohlgould/LashonLearning.git
cd LashonLearning
```

#### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install React app dependencies
cd react/lashon-learning
npm install
cd ../..

# Install proxy dependencies
cd sefaria-proxy
npm install
cd ..
```

#### 3. Load Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `SefariaVocabExtension/` directory
5. Note the Extension ID (should match `nlcebalffaibfcnohbknmgpkdoedliej` or update in `App.jsx`)

#### 4. Deploy Cloudflare Proxy
```bash
cd sefaria-proxy
npx wrangler login
npm run deploy
```
Update the `PROXY_BASE` URL in `scripts/getdata.js` with your deployed Worker URL.

#### 5. Start Development Server
```bash
cd react/lashon-learning
npm run dev
```
Visit `http://localhost:5173`

## 🔧 Configuration

### Extension Configuration
Edit `SefariaVocabExtension/manifest.json`:
- Add/remove allowed origins in `externally_connectable.matches`
- Modify permissions in `permissions` array

### Proxy Configuration
Edit `sefaria-proxy/src/index.js`:
- Update `ALLOWED_ORIGINS` array for new domains
- Modify CORS headers as needed

### App Configuration
Edit `react/lashon-learning/src/App.jsx`:
- Update `EXTENSION_ID` if you load the extension unpacked
- Modify sync behavior in `syncFromExtension()`



##  Development

### Project Technologies
- **Frontend**: React 19, Vite, TailwindCSS, React Router
- **Backend/API**: Cloudflare Workers, Sefaria REST API
- **Browser**: Chrome Extension Manifest V3
- **Build Tools**: Vite, ESLint, Wrangler
- **Deployment**: GitHub Pages, Cloudflare Workers


##  API Reference

### Sefaria API Endpoints Used

#### Word Definition
```
GET /api/words/{word}
Returns: Array of lexicon entries with definitions, roots, and morphology
```

#### Text Search
```
POST /api/search-wrapper
Body: {
  "query": "word",
  "type": "text",
  "field": "naive_lemmatizer",
  "size": 100,
  "slop": 10,
  "sort_method": "score",
  "sort_fields": ["pagesheetrank"]
}
Returns: Search results with highlighted matches
```


*For questions or issues, please open an issue on GitHub.*
