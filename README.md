# 💚 Kash — Manage. Save. Prosper.

A clean, minimal personal budget manager for Android built with **React Native** & **Expo**. Track income, expenses, and budgets across multiple categories — with AI-powered receipt scanning via **Groq**.

---

## ✨ Features

### Core

| Feature | Description |
|---|---|
| 📊 **Dashboard** | At-a-glance overview — remaining balance, budget progress bar, summary cards, and recent transactions grouped by date |
| 💰 **Income & Expense Tracking** | Log entries with title, amount, date, and optional notes |
| 🎯 **Monthly Budget** | Set a spending limit per category — tracked via a color-coded progress bar (green → yellow → red) |
| 📂 **Categories** | Create multiple budget categories (e.g. "May 2026", "Trip to Goa") — each with its own budget, transactions, and stats |
| 💾 **Local Persistence** | All data saved locally with AsyncStorage — survives app restarts |

### AI & Automation

| Feature | Description |
|---|---|
| 📷 **AI Receipt Scanner** | Capture or select a payment screenshot — Groq AI auto-extracts amount, payee, merchant, and date |
| 📤 **Share from GPay/PhonePe** | Share a payment screenshot directly from any UPI app — Kash appears in Android's share sheet and processes it automatically |

### UX Enhancements

| Feature | Description |
|---|---|
| 📅 **Date-Grouped Transactions** | Transactions are grouped by date with visual separators showing the date label, entry count, and daily totals |
| 🔍 **Date Filter Chips** | Filter transactions by specific dates — tap a date chip to see only that day's entries |
| 🗓️ **Calendar Date Picker** | Custom built-in calendar modal for selecting transaction dates — shows month grid, today highlight, and quick "Today" button |
| 🧮 **Calculator Amount Input** | Type math expressions like `100+50-20` — see a live preview of the result and tap `=` to resolve |
| 📦 **Backup & Restore** | Export all data to a `.budgetapp` file and share via WhatsApp, Drive, email, etc. Import on any device to restore |

---

## 📱 App Screens

### Home (Dashboard)

- Remaining balance hero card
- Budget usage progress bar
- Summary cards: Budget / Income / Expense
- Recent transactions grouped by date with separators
- Floating **+** button to add a transaction

### Transactions

- Full transaction history grouped by date
- Section headers with date label + daily income/expense totals
- Filter by type: All / Income / Expense
- Filter by date: tap date chips at the top
- Delete individual entries

### Scan (Upload)

- Take a photo or pick from gallery
- Or **share directly** from GPay / PhonePe via Android share sheet
- Groq AI extracts: amount, payee, merchant name, date, and a note
- One tap to save as an expense
- Shows active category badge (where the expense will be saved)

### Add Transaction

- Toggle: Income or Expense (with icons)
- **Calculator input** for amount — supports `+` and `-` expressions with live preview
- **Calendar date picker** — tap to open a month grid, select any date
- Title and optional note fields
- Category tag shown at the top

### More (Settings Hub)

- Active category banner
- Quick links to:
  - **Set Budget** — define monthly spending limit
  - **Categories** — create, rename, delete, switch between categories
  - **Backup & Restore** — export/import backup files
- App branding: **Kash** · *Manage. Save. Prosper.*

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React Native 0.81 + Expo SDK 54 | Cross-platform mobile framework |
| React Navigation 7 | Bottom tabs + stack navigation |
| AsyncStorage | Local data persistence |
| React Context + useReducer | Global state management |
| expo-image-picker | Camera & gallery access |
| expo-file-system | Read shared images as base64 |
| expo-share-intent | Android share sheet integration |
| expo-sharing + expo-document-picker | Backup export/import |
| Groq AI (Llama 4 Scout) | Vision-based receipt OCR |
| @expo/vector-icons (Ionicons) | UI icons |

---

## 🚀 Setup & Installation

### Prerequisites

| Tool | Required | Install |
|---|---|---|
| Node.js ≥ 18 | ✅ | [nodejs.org](https://nodejs.org) |
| Android Studio + SDK | ✅ | [developer.android.com](https://developer.android.com/studio) |
| Android device or emulator | ✅ | Physical device recommended |
| Groq API key | ✅ (for AI features) | [console.groq.com/keys](https://console.groq.com/keys) |

> ⚠️ **Expo Go is NOT supported.** The share intent feature modifies native Android code and requires a Development Build (`npx expo run:android`).

### Step 1 — Clone the project

```bash
git clone https://github.com/your-username/Kash.git
cd Kash
```

### Step 2 — Install dependencies

```bash
npm install --legacy-peer-deps
```

### Step 3 — Add your Groq API key

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_GROQ_API_KEY=gsk_your_key_here
```

Get a free key at [console.groq.com/keys](https://console.groq.com/keys). The AI receipt scanning feature won't work without this.

### Step 4 — Run on Android

**First build** (generates native Android project + installs on device):

```bash
npx expo run:android
```

> Connect your Android device via USB with **USB debugging enabled**, or start an Android emulator first. First build takes 5–10 minutes.

**Subsequent runs** (after the native build exists):

```bash
npx expo start --dev-client
```

### Step 5 — Build a release APK (optional)

To generate a shareable APK:

```bash
npx expo run:android --variant release
```

Or using EAS Build:

```bash
npx eas build -p android --profile preview
```

---

## 📂 Project Structure

```
Kash/
├── App.js                             # Root — navigation + share intent handler
├── .env                               # EXPO_PUBLIC_GROQ_API_KEY (git-ignored)
├── app.json                           # Expo config + share-intent plugin
├── eas.json                           # EAS Build profiles
├── package.json
│
├── assets/
│   ├── icon.png                       # Kash logo — green K on white
│   ├── adaptive-icon.png              # Android adaptive icon foreground
│   ├── splash-icon.png                # Splash screen — K + "Kash" + tagline
│   └── favicon.png                    # Web favicon
│
├── src/
│   ├── context/
│   │   └── BudgetContext.js           # Global state — categories, transactions, budget
│   │
│   ├── screens/
│   │   ├── DashboardScreen.js         # Home — summary + date-grouped recent transactions
│   │   ├── TransactionsScreen.js      # Full history with date groups + filters
│   │   ├── AddTransactionScreen.js    # Add entry — calculator input + date picker
│   │   ├── BudgetScreen.js            # Set monthly budget per category
│   │   ├── UploadScreen.js            # AI receipt scanner + share intent handler
│   │   ├── CategoriesScreen.js        # Manage categories (CRUD + switch active)
│   │   ├── DataScreen.js              # Backup export/import
│   │   └── SettingsScreen.js          # "More" hub — links to Budget/Categories/Data
│   │
│   ├── components/
│   │   ├── TransactionCard.js         # Single transaction row
│   │   ├── SummaryCard.js             # Budget / income / expense mini card
│   │   ├── BudgetProgressBar.js       # Visual budget usage meter
│   │   ├── DateGroupedList.js         # SectionList that groups transactions by date
│   │   ├── CalculatorInput.js         # Calculator-style amount input (supports + / -)
│   │   └── DatePickerModal.js         # Custom calendar date picker modal
│   │
│   └── theme/
│       └── colors.js                  # Design tokens — Kash green palette
│
└── android/                           # Native Android project (auto-generated)
```

---

## 📤 Using the Share Feature

1. Open **GPay**, **PhonePe**, or any UPI app and complete a payment
2. Tap **Share** on the payment receipt / screenshot
3. Select **Kash** from the Android share sheet
4. The app opens on the **Scan** screen with the screenshot pre-loaded
5. Groq AI auto-extracts amount, payee, date — saved as an expense

> The share feature only works after building with `npx expo run:android`. It modifies native Android intent filters and won't work in Expo Go.

---

## 📦 Backup & Restore

### Export

1. Go to **More → Backup & Restore**
2. Tap **Export & Share**
3. A `.budgetapp` file is generated containing all categories and transactions
4. Share via WhatsApp, Google Drive, email, or save to device

### Import

1. Tap **Select Backup File** and pick a `.budgetapp` file
2. Review the summary (number of categories, transactions, export date)
3. Confirm — all current data will be replaced

### Transfer to a new phone

1. On old phone → **Export & Share** → send file to yourself
2. On new phone → install Kash → **More → Backup & Restore → Select Backup File**
3. All categories, budgets, and transactions are restored

---

## 🧮 Calculator Input

The amount field supports basic arithmetic:

| Input | Result |
|---|---|
| `500` | ₹500.00 |
| `100+50` | ₹150.00 |
| `1000-250` | ₹750.00 |
| `100+200+50-25` | ₹325.00 |

- A **live preview** appears below the input as you type
- Tap the **= button** to resolve the expression
- If you save without resolving, the expression is auto-evaluated

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| **Build fails with dependency errors** | Run `npm install --legacy-peer-deps` then `npx expo run:android` |
| **Missing API key alert** | Create `.env` with `EXPO_PUBLIC_GROQ_API_KEY=your_key` and restart the dev server |
| **Groq API returns error** | Verify key at [console.groq.com](https://console.groq.com/keys). Ensure image is under ~4MB |
| **Kash not in share sheet** | Only works after `npx expo run:android`. Uninstall and reinstall if needed |
| **Camera not working on emulator** | Camera requires a real device. Use Gallery on AVD |
| **Dev client can't connect** | Ensure phone and PC are on the same Wi-Fi. Try `npx expo start --dev-client --tunnel` |

---

## 🎨 Design

The app uses a **clean light theme** with the signature **Kash green** palette:

- **Background**: Warm off-white (`#F5F5F7`)
- **Cards**: Pure white with subtle borders
- **Primary / Kash Green**: `#22A45D`
- **Primary Light**: `#34C759`
- **Income**: Green (matches primary)
- **Expense**: Warm red (`#E74C3C`)
- **Typography**: System font with 800/700/600 weight hierarchy

Navigation uses **4 bottom tabs** (Home, Transactions, Scan, More). Budget, Categories, and Data are accessible from the **More** hub.

---

## 📄 License

MIT — free to use and modify.
