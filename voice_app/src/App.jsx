
import React, { useState, useEffect } from 'react';

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [shoppingList, setShoppingList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState('en-US');
  const [error, setError] = useState('');
  
  // hindi data
  // Hindi translations
const hindiWords = {
  add: [ "जोड़ें", "डालें", "खरीदें", "चाहता हूँ","चाहिए", "चाहती हूँ" ],
  remove: ["हटाएं", "निकालें", "भूल गए", "डिलीट", "मिटाएं","मिटाए"],
  milk: ["दूध", "मिल्क"],
  apples: ["सेब", "ऐप्पल्स", "एप्पल"],
  bread: ["ब्रेड", "रोटी"],
  eggs: ["अंडे", "एग्स"],
  water: ["पानी", "वाटर"],
  sugar: ["चीनी", "शुगर"],
  coffee: ["कॉफी", "कॉफ़ी"],
  tea: ["चाय", "टी"],
};

// map Hindi words to English
const hindiToEnglish = {};
Object.keys(hindiWords).forEach((eng) => {
  hindiWords[eng].forEach((hi) => {
    hindiToEnglish[hi.toLowerCase()] = eng;
  });
});


  //example data
  const getFrequentItems = () => {
    try {
      const frequent = JSON.parse(localStorage.getItem('frequentItems') || '{}');
      return Object.keys(frequent)
        .sort((a, b) => frequent[b] - frequent[a])
        .slice(0, 5); // Top 5
    } catch (e) {
      return ["milk", "bread", "eggs", "apples", "coffee"];
    }
  };
  const frequentlyBought = getFrequentItems();
  const seasonalItems = new Date().getMonth() === 9 ? ['pumpkin', 'cider'] : ['berries', 'watermelon'];
  const substitutes = { milk: 'almond milk', sugar: 'honey', butter: 'margarine' };
  const categories = {
    dairy: ["milk", "दूध", "cheese", "butter", "yogurt"],
    produce: ["apple", "सेब", "banana", "oranges", "berries", "pumpkin", "watermelon"],
    snacks: ["chips", "cookies", "nuts"],
    bakery: ["bread", "ब्रेड", "bagel", "रोटी"],
    beverages: ["water", "पानी", "cider", "juice", "tea", "coffee"],
  };
  const speak = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language; // to Match voice command language
    utterance.rate = 0.9; 
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };
  const updateFrequentItems = (item) => {
    try {
      const frequent = JSON.parse(localStorage.getItem('frequentItems') || '{}');
      frequent[item] = (frequent[item] || 0) + 1;
      localStorage.setItem('frequentItems', JSON.stringify(frequent));
    } catch (e) {
      console.warn("Could not update frequent items", e);
    }
  };

  // speak("Hey This is Tanmay,your voice assistant. Say 'add milk' to begin.");
  useEffect(() => {
    setSuggestions([
      `Try: "Add 2 apples"`,
      `Tip: Say "I need bread"`,
    ]);
    speak("Hey This is Tanmay,your voice assistant. Say 'add milk' to begin.");
  }, []);
  const saveToLocalStorage = (list) => {
    try {
      localStorage.setItem('shoppingList', JSON.stringify(list));
    } catch (error) {
      console.warn("Could not save to localStorage", error);
    }
  };
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shoppingList');
      if (saved) {
        setShoppingList(JSON.parse(saved));
      } else {
        setShoppingList([]); // fallback
      }
    } catch (error) {
      console.warn("Could not load from localStorage", error);
      setShoppingList([]);
    }
  
    // Generate initial suggestions
    setSuggestions([
      `Try: "Add 2 apples"`,
      `Tip: Say "I need bread"`,
    ]);
  }, []);
  const categorizeItem = (item) => {
    const itemLower = item.toLowerCase();
    const categories = {
      dairy: ["milk", "दूध", "cheese", "butter", "yogurt"],
      produce: ["apple", "सेब", "banana", "oranges", "berries", "pumpkin", "watermelon"],
      snacks: ["chips", "cookies", "nuts"],
      bakery: ["bread", "ब्रेड", "bagel", "रोटी"],
      beverages: ["water", "पानी", "cider", "juice", "tea", "coffee"],
    };
  
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(k => itemLower.includes(k))) return category;
    }
    return 'other';
  };

  const generateSuggestions = (newItem) => {
    const newSuggestions = [];
  
    // 1. Frequent Pair Suggestions (e.g., bread → eggs)
    const frequentlyPaired = {
      bread: ["eggs", "butter", "jam"],
      coffee: ["sugar", "milk", "creamer"],
      pasta: ["tomato sauce", "cheese"],
      milk: ["cereal", "cookies"],
    };
  
    if (frequentlyPaired[newItem] && shoppingList.length === 1) {
      const missingPairs = frequentlyPaired[newItem].filter(
        (item) => !shoppingList.some((i) => i.item.toLowerCase().includes(item))
      );
      missingPairs.forEach((item) => {
        newSuggestions.push(`You often buy ${item} with ${newItem} — want to add it?`);
      });
    }
  
    // 2. Seasonal Recommendations
    const month = new Date().getMonth();
    const seasonalMap = {
      8: ["pumpkin", "apples", "cider"], // September
      9: ["pumpkin", "apples", "cider"], // October
      10: ["turkey", "stuffing", "cranberries"], // November
      11: ["chocolate", "cookies", "wine"], // December
      5: ["strawberries", "peaches", "corn"], // June
      6: ["watermelon", "berries", "zucchini"], // July
    };
  
    const currentSeasonal = seasonalMap[month] || ["berries", "watermelon"];
    currentSeasonal.forEach((item) => {
      if (!shoppingList.some((i) => i.item.toLowerCase().includes(item))) {
        newSuggestions.push(`🍓 ${item.charAt(0).toUpperCase() + item.slice(1)} are in season — add some?`);
      }
    });
  
    // 3. Substitutes
    const substitutes = { 
      milk: "How about almond milk instead?",
      sugar: "Try honey or maple syrup!",
      butter: "Coconut oil is a healthy alternative.",
      beef: "Want to try plant-based meat?"
    };
  
    if (substitutes[newItem]) {
      newSuggestions.push(`💡 ${substitutes[newItem]}`);
    }
  
    // 4. Replenishment Reminder (simulated)
    const oftenReplenished = ["coffee", "toothpaste", "shampoo", "bread", "eggs"];
    const recentlyAdded = shoppingList.find((i) => i.item === newItem);
  
    if (recentlyAdded && oftenReplenished.includes(newItem)) {
      newSuggestions.push(`✅ ${newItem.charAt(0).toUpperCase() + newItem.slice(1)} added! You usually restock every 2 weeks.`);
    }
  
    // 5. Empty List Suggestion
    if (shoppingList.length === 0) {
      newSuggestions.push("🛒 Your list is empty. Try: 'Add milk' or 'I need bread'");
    }
  
    // Set max 3 suggestions
    setSuggestions(newSuggestions.slice(0, 3));
  };

  const toggleListening = () => {
    if (isListening) {
      window.recognition?.abort();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.trim();
      setTranscript(text);
      parseCommand(text);
    };

    recognition.onerror = (event) => {
      setError(`Speech error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    window.recognition = recognition;
    setIsListening(true);
    setError('');
  };

  const parseCommand = (text) => {
    const lowerText = text.toLowerCase().trim();
    const isHindi = language === 'hi-IN';
  
    // -------------------------------
    // 🌐 HELPER: Normalize & Extract
    // -------------------------------
    const extractItemFromText = (text, keywords) => {
      for (const word of keywords) {
        if (text.includes(word)) {
          return word;
        }
      }
      return null;
    };
  
    // -------------------------------
    // 🌐 ENGLISH LOGIC
    // -------------------------------
    if (!isHindi) {
      const wordToNumber = {
        one: 1, two: 2, three: 3, four: 4, five: 5,
        six: 6, seven: 7, eight: 8, nine: 9, ten: 10
      };
  
      // Check for REMOVE first
      const removeIndicators = ['remove', 'delete', 'forget', 'clear', 'cancel', 'omit'];
      const addItemIndicators = ['add', 'buy', 'get', 'need', 'want', 'include', 'put'];
  
      const isRemove = removeIndicators.some(cmd => lowerText.includes(cmd));
      const isAdd = addItemIndicators.some(cmd => lowerText.includes(cmd)) && !isRemove;
  
      // Extract item (simple keyword match)
      const itemKeywords = ['milk', 'apples', 'apple', 'bread', 'eggs', 'water', 'sugar', 'coffee', 'tea', 'juice', 'rice', 'banana', 'oranges'];
      let item = extractItemFromText(lowerText, itemKeywords);
  
      // Handle quantity
      let quantity = 1;
      const numMatch = lowerText.match(/\d+/);
      if (numMatch) quantity = parseInt(numMatch[0]);
  
      const wordNumMatch = Object.keys(wordToNumber).find(w => lowerText.includes(w));
      if (wordNumMatch) quantity = wordToNumber[wordNumMatch];
  
      // ✅ REMOVE LOGIC
      // ✅ REMOVE LOGIC (English)
if (isRemove && item) {
  // Extract quantity to remove
  const quantityMatch = lowerText.match(/\d+|one|two|three|four|five|six|seven|eight|nine|ten/);
  const wordToNumber = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10
  };
  let removeQuantity = 1;
  if (quantityMatch) {
    const num = parseInt(quantityMatch[0]);
    removeQuantity = isNaN(num) ? wordToNumber[quantityMatch[0]] || 1 : num;
  }

  setShoppingList((prev) => {
    const updated = prev.map((i) => {
      if (i.item.toLowerCase() === item) {
        const newQuantity = i.quantity - removeQuantity;
        if (newQuantity <= 0) {
          speak(`Removed ${item}`);
          return null; // remove item
        } else {
          speak(`Removed ${removeQuantity} ${item}, ${newQuantity} left`);
          return { ...i, quantity: newQuantity };
        }
      }
      return i;
    }).filter(Boolean); // remove nulls

    saveToLocalStorage(updated);
    return updated;
  });
  return;
}
  
      // ✅ ADD LOGIC
      if (isAdd && item) {
        setShoppingList((prev) => {
          const existing = prev.find(i => i.item.toLowerCase() === item);
          if (existing) {
            return prev.map(i => i.item.toLowerCase() === item
              ? { ...i, quantity: i.quantity + quantity }
              : i
            );
          }
          return [...prev, { item, quantity, category: categorizeItem(item) }];
        });
        speak(`Added ${quantity} ${item}${quantity > 1 ? 's' : ''}`);
        generateSuggestions(item);
        return;
      }
  
      // ❌ Unknown command
      setError('Command not recognized');
      speak('Try: "Add milk" or "Remove bread"');
      return;
    }
  
    // -------------------------------
    // 🌍 HINDI LOGIC
    // -------------------------------
    const hindiToEnglish = {
      पानी: 'water', दूध: 'milk', सेब: 'apple', ब्रेड: 'bread',
      अंडे: 'eggs', चीनी: 'sugar', कॉफी: 'coffee', चाय: 'tea',
      जूस: 'juice', मिल्क: 'milk', ऐप्पल्स: 'apples', एग्स: 'eggs', वाटर: 'water'
    };
  
    const addActions = ['जोड़ें', 'डालें', 'खरीदें', 'चाहता हूँ', 'चाहती हूँ', 'ले लो'];
    const removeActions = ['हटाएं', 'निकालें', 'मिटाएं', 'भूल गए', 'डिलीट', 'हटा दो'];
  
    let action = null;
    let item = null;
  
    // Detect action
    if (removeActions.some(a => lowerText.includes(a))) {
      action = 'remove';
    } else if (addActions.some(a => lowerText.includes(a))) {
      action = 'add';
    }
  
    // Extract item (Hindi)
    for (const hi of Object.keys(hindiToEnglish)) {
      if (lowerText.includes(hi.toLowerCase())) {
        item = hi;
        break;
      }
    }
  
    // Quantity in Hindi
    const quantityMatch = lowerText.match(/(\d+)|\b(एक|दो|तीन|चार|पांच)\b/);
    let quantity = 1;
    if (quantityMatch) {
      const num = parseInt(quantityMatch[1]);
      if (!isNaN(num)) quantity = num;
      else if (quantityMatch[2]) {
        const wordToNum = { एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5 };
        quantity = wordToNum[quantityMatch[2]];
      }
    }
  
    // ✅ ADD ITEM (Hindi)
    if (action === 'add' && item) {
      setShoppingList((prev) => {
        const existing = prev.find(i => i.item === item);
        if (existing) {
          return prev.map(i => i.item === item
            ? { ...i, quantity: i.quantity + quantity }
            : i
          );
        }
        return [...prev, { item, quantity, category: categorizeItem(item) }];
      });
      speak(`डाला गया: ${quantity} ${item}`);
      generateSuggestions(item);
      return;
    }
  
    // ✅ REMOVE ITEM (Hindi)
    // ✅ REMOVE ITEM (Hindi)
if (action === 'remove' && item) {
  // Extract quantity: "एक", "दो", or digits
  const quantityMatch = lowerText.match(/(\d+)|\b(एक|दो|तीन|चार|पांच)\b/);
  let removeQuantity = 1;
  if (quantityMatch) {
    const num = parseInt(quantityMatch[1]);
    if (!isNaN(num)) removeQuantity = num;
    else if (quantityMatch[2]) {
      const wordToNum = { एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5 };
      removeQuantity = wordToNum[quantityMatch[2]];
    }
  }

  setShoppingList((prev) => {
    const updated = prev.map((i) => {
      if (i.item === item) {
        const newQuantity = i.quantity - removeQuantity;
        if (newQuantity <= 0) {
          speak(`${item} हटा दिया गया`);
          return null;
        } else {
          speak(`${removeQuantity} ${item} हटाया, ${newQuantity} बचे`);
          return { ...i, quantity: newQuantity };
        }
      }
      return i;
    }).filter(Boolean);

    saveToLocalStorage(updated);
    return updated;
  });
  return;
}
  
    // ❌ Unknown command
    setError('कमांड समझ नहीं आई');
    speak('कृपया फिर से कहें');
  };




  const removeItem = (item) => {
    setShoppingList(shoppingList.filter((i) => i.item !== item));
  };
  

  const languageNames = {
    'en-US': 'English',
    'es-ES': 'Español',
    'fr-FR': 'Français',
    'de-DE': 'Deutsch',
    'hi-IN': 'हिन्दी',
  };

  useEffect(() => {
    setSuggestions([
      `Try: "Add 2 apples"`,
      `Tip: Say "I need bread"`,
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-470">
      {/* <div className="container mx-auto px-4 py-6 w-full"> */}
      <div className="w-full px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🛒 Voice Shopping Assistant</h1>
          <p className="text-gray-600">Speak to add, remove, and manage your list</p>
        </div>
        {/* <div className="container mx-auto px-4 py-8 max-w-3xl"> */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">🗣️ Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(languageNames).map((lang) => (
              <option key={lang} value={lang}>
                {languageNames[lang]}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full text-center">
          <button
            onClick={toggleListening}
            disabled={isListening}
            className={`px-8 py-4 rounded-full font-bold text-white text-lg transition transform ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
            }`}
          >
            {isListening ? '🛑 Listening...' : '🎤 Start Voice Command'}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {transcript && (
            <p className="mt-4 p-3 bg-gray-100 rounded text-gray-800">
              <strong>Heard:</strong> "{transcript}"
            </p>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 w-full rounded">
            <h3 className="font-bold text-yellow-800 mb-2">💡 Suggestions</h3>
            <ul className="text-yellow-700 space-y-1">
              {suggestions.map((s, i) => (
                <li key={i}>→ {s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🛍️ Shopping List ({shoppingList.length})</h2>
          {shoppingList.length === 0 ? (
            <p className="text-gray-500 italic">Your list is empty. Start by saying "Add milk"!</p>
          ) : (
            <ul className="space-y-3">
              {shoppingList.map((entry, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 border-blue-400"
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {entry.quantity}x {entry.item}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">({entry.category})</span>
                  </div>
                  <button
                    onClick={() => removeItem(entry.item)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6 w-full">
          <h3 className="font-bold text-gray-800 mb-3">📌 How to Use</h3>
          <ul className="text-gray-700 space-y-1 text-sm">
            <li>• Say: <strong>"Add 2 apples"</strong></li>
            <li>• Say: <strong>"I need bread"</strong></li>
            <li>• Say: <strong>"Remove milk"</strong></li>
          </ul>
        </div>

        <footer className="text-center text-gray-500 text-sm mt-8">
          Voice Shopping Assistant • Built with React & Web Speech API
        </footer>
      </div>
    </div>
  );
}