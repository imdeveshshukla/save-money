# 💰 BudgetApp — React Native Budget Manager

A beautiful, dark-themed Android budget management app built with **Expo** and **React Native**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 Dashboard | Monthly overview: balance, budget progress bar, recent transactions |
| 💰 Income Tracking | Log income entries with title, amount, date, and notes |
| 💸 Expense Tracking | Log expenses with the same details |
| 🎯 Monthly Budget | Set a monthly spending limit; tracked via a color-coded progress bar |
| 📷 Screenshot Upload | Capture or upload payment screenshots (OCR analysis coming soon) |
| 💾 Local Persistence | All data saved with AsyncStorage — survives app restarts |

---

## 🛠️ Tech Stack

- **React Native** (Expo managed workflow)
- **React Navigation** — Bottom Tabs + Stack
- **AsyncStorage** — local data persistence
- **expo-image-picker** — camera & gallery access
- **@expo/vector-icons** (Ionicons)
- **React Context + useReducer** — global state

---

## 🚀 Getting Started

### Prerequisites

| Tool | Install |
|---|---|
| Node.js ≥ 18 | https://nodejs.org |
| npm or yarn | included with Node |
| Expo Go app | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779) |

> **No Android Studio or Xcode required** for development with Expo Go!

---

### 1. Clone / Open the project

```bash
cd BudgetApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npx expo start
```

This will open the **Expo Dev Tools** in your browser and show a QR code in your terminal.

### 4. Run on your device

**Option A — Physical Android device (recommended):**
1. Install **Expo Go** from the Play Store
2. Open Expo Go → Scan the QR code from the terminal

**Option B — Android Emulator:**
1. Open Android Studio → start an AVD (Android Virtual Device)
2. In the Expo terminal, press `a` to launch on the emulator

**Option C — Web preview (limited):**
1. Press `w` in the Expo terminal
2. Opens in your browser (some native features won't work)

---

## 📂 Project Structure

```
BudgetApp/
├── App.js                          # Root: navigation + context provider
├── src/
│   ├── context/
│   │   └── BudgetContext.js        # Global state (budget, transactions)
│   ├── screens/
│   │   ├── DashboardScreen.js      # Home - summary & recent transactions
│   │   ├── TransactionsScreen.js   # Full transaction list with filters
│   │   ├── AddTransactionScreen.js # Add income or expense
│   │   ├── BudgetScreen.js         # Set monthly budget
│   │   └── UploadScreen.js         # Screenshot upload (OCR placeholder)
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

### Upload
- Take a photo or pick from gallery
- Preview the screenshot
- Add it as an expense entry
- 🔮 OCR auto-fill coming in a future release

---

## 🔮 Roadmap

- [ ] **OCR Integration** — auto-extract amount & merchant from payment screenshots using Google Vision API or Gemini
- [ ] **Date Picker** — native date picker for transactions
- [ ] **Monthly History** — view past months' data
- [ ] **Categories** — tag transactions (Food, Travel, Utilities, etc.)
- [ ] **Export to CSV** — share your transaction history
- [ ] **Charts** — pie/bar charts for expense breakdown
- [ ] **Notifications** — budget limit alerts

---

## 🐛 Troubleshooting

**"Unable to find module" errors**
```bash
npm install
npx expo start --clear
```

**Expo Go can't connect**
- Ensure phone and PC are on the same Wi-Fi network
- Try using tunnel mode: `npx expo start --tunnel`

**Image picker not working on emulator**
- Camera won't work on AVD; use Gallery or test on a real device

---

## 📄 License

MIT — free to use and modify.
