# 💰 BudgetApp — React Native Budget Manager

A beautiful, dark-themed Android budget management app built with **Expo** and **React Native**. Automatically extracts payment details from screenshots using **Groq AI**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 Dashboard | Monthly overview: balance, budget progress bar, recent transactions |
| 💰 Income Tracking | Log income entries with title, amount, date, and notes |
| 💸 Expense Tracking | Log expenses with the same details |
| 🎯 Monthly Budget | Set a monthly spending limit; tracked via a color-coded progress bar |
| 📷 Screenshot Upload | Capture or upload payment screenshots — Groq AI auto-extracts amount, payee & date |
| 📤 Share from GPay | Share a payment screenshot directly from GPay/PhonePe — app appears in Android share sheet |
| 💾 Local Persistence | All data saved with AsyncStorage — survives app restarts |

---

## 🛠️ Tech Stack

- **React Native** (Expo managed workflow)
- **React Navigation** — Bottom Tabs + Stack
- **AsyncStorage** — local data persistence
- **expo-image-picker** — camera & gallery access
- **expo-file-system** — read shared image files as base64
- **expo-share-intent** — Android share sheet integration
- **Groq AI** (`meta-llama/llama-4-scout-17b-16e-instruct`) — vision-based OCR for payment screenshots
- **@expo/vector-icons** (Ionicons)
- **React Context + useReducer** — global state

---

## 🚀 Getting Started

### Prerequisites

| Tool | Install |
|---|---|
| Node.js ≥ 18 | https://nodejs.org |
| Android Studio + SDK | Required for dev build (share intent feature) |
| A physical Android device or AVD | For testing |

> ⚠️ **Expo Go is NOT supported** — the share intent feature modifies native Android code and requires a Development Build.

---

### 1. Clone / open the project

```bash
cd BudgetApp
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Add your Groq API key

Get a free key at https://console.groq.com/keys, then create/update `.env`:

```env
EXPO_PUBLIC_GROQ_API_KEY=gsk_your_key_here
```

### 4. Build and run on Android

```bash
npx expo run:android
```

> First build takes a few minutes. Connect your Android device via USB with **USB debugging enabled**, or start an Android emulator first.

For subsequent runs (after the native build exists):

```bash
npx expo start --dev-client
```

---

## 📂 Project Structure

```
BudgetApp/
├── App.js                          # Root: navigation + share intent handler
├── .env                            # EXPO_PUBLIC_GROQ_API_KEY (not committed)
├── app.json                        # Expo config + expo-share-intent plugin
├── src/
│   ├── context/
│   │   └── BudgetContext.js        # Global state (budget, transactions)
│   ├── screens/
│   │   ├── DashboardScreen.js      # Home – summary & recent transactions
│   │   ├── TransactionsScreen.js   # Full transaction list with filters
│   │   ├── AddTransactionScreen.js # Add income or expense manually
│   │   ├── BudgetScreen.js         # Set monthly budget
│   │   └── UploadScreen.js         # Screenshot upload + Groq AI extraction
│   ├── components/
│   │   ├── SummaryCard.js          # Budget / income / expense mini card
│   │   ├── TransactionCard.js      # Single transaction row
│   │   └── BudgetProgressBar.js    # Visual budget usage meter
│   └── theme/
│       └── colors.js               # Design token palette
├── package.json
└── README.md
```

---

## 📱 App Screens

### Dashboard
- Remaining balance (large hero card)
- Budget usage progress bar (green → yellow → red)
- Summary cards: Budget / Income / Expense
- Last 5 transactions
- ➕ FAB to add a transaction

### Transactions
- Full transaction history
- Filter by: All / Income / Expense
- Delete individual transactions

### Add Transaction
- Toggle: Income or Expense
- Fields: Title, Amount, Date, Note
- Validates before saving

### Budget
- Set your monthly budget amount
- Shows current budget (saved persistently)

### Upload (AI-powered)
- Take a photo or pick from gallery
- Or **share directly from GPay / PhonePe** via Android share sheet
- Groq AI automatically extracts: amount, payee, merchant name, date
- One tap to save as an expense

---

## 📤 Using the Share Feature

1. Open **GPay** (or any UPI/banking app) and complete a payment
2. Tap **Share** on the payment receipt/screenshot
3. Select **BudgetApp** from the Android share sheet
4. The app opens on the Upload screen with the screenshot pre-loaded
5. Tap **"Add as Expense"** — Groq AI extracts all details automatically

---

## 🐛 Troubleshooting

**Build fails with dependency errors**
```bash
npm install --legacy-peer-deps
npx expo run:android
```

**`EXPO_PUBLIC_GROQ_API_KEY` not found / missing API key alert**
- Make sure `.env` exists with your key and restart the dev server

**Groq API returns an error**
- Check your key is valid at https://console.groq.com/keys
- Ensure image is under ~4MB (Groq's base64 limit)

**BudgetApp not showing in share sheet**
- Only works after `npx expo run:android` (not Expo Go)
- Uninstall and reinstall the app after first build if share target doesn't appear

**Image picker not working on emulator**
- Camera won't work on AVD; use Gallery or test on a real device

**Expo dev client can't connect**
- Ensure phone and PC are on the same Wi-Fi network
- Try: `npx expo start --dev-client --tunnel`

---

## 📄 License

MIT — free to use and modify.
