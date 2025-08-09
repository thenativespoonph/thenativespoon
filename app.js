// Basic app logic: voice-to-text (Web Speech API), WhatsApp order, copy-to-clipboard, bilingual toggle
const waPrimary = '08135393029'; // WhatsApp-only
const callNumber = '07069392586';
const acctNumber = '5975526101';
document.getElementById('wa-link-main').href = 'https://wa.me/' + waPrimary.replace('+','').replace(/\D/g,'');
document.getElementById('fb-link').href = 'https://facebook.com/thenativespoon';
document.getElementById('ig-link').href = 'https://instagram.com/thenativespoonph';
document.getElementById('acct-number').textContent = acctNumber;
document.getElementById('float-wa').href = 'https://wa.me/' + waPrimary.replace('+','').replace(/\D/g,'');

// Copy account number
document.getElementById('copy-acct').addEventListener('click', ()=> {
  navigator.clipboard.writeText(acctNumber).then(()=> {
    alert('Account number copied: ' + acctNumber);
  });
});

// WhatsApp send preview
document.getElementById('preview-whatsapp').addEventListener('click', ()=> {
  const name = document.getElementById('cust-name').value || 'Customer';
  const phone = document.getElementById('cust-phone').value || '';
  const order = document.getElementById('order-text').value || '';
  if (!order) { alert('Please type or speak your order first'); return; }
  const msg = `Order from ${name} (${phone}\n)\n${order}\n\nPayment: Transfer/Cash/POS\nAcct: ${acctNumber}`;
  const url = 'https://wa.me/' + waPrimary.replace(/\D/g,'') + '?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
});

// Floating whatsapp opens waPrimary
document.getElementById('float-wa').addEventListener('click', (e)=>{
  // default anchor will open; no extra needed
});

// Voice recognition - speak to fill order textarea
let recognizing = false;
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-NG';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    const ta = document.getElementById('order-text');
    ta.value = (ta.value ? ta.value + '\n' : '') + text;
  };
  recognition.onend = () => { recognizing = false; document.getElementById('start-voice').textContent = '🎤 Speak'; };
  recognition.onerror = (e) => { recognizing = false; alert('Voice recognition error: ' + e.error); document.getElementById('start-voice').textContent = '🎤 Speak'; };
} else {
  document.getElementById('start-voice').addEventListener('click', ()=> alert('Speech recognition not supported on this browser/device.'));
}

document.getElementById('start-voice').addEventListener('click', ()=>{
  if (!recognition) { alert('Speech recognition not available. Use Chrome on Android for best results.'); return; }
  if (recognizing) { recognition.stop(); return; }
  try {
    recognition.start();
    recognizing = true;
    document.getElementById('start-voice').textContent = 'Listening... Tap to stop';
  } catch(e) { alert('Could not start recognition: ' + e.message); }
});

// Speak-order button per item: start recognition then pre-fill with item name
document.querySelectorAll('.speak-order').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const item = e.target.closest('.item').querySelector('.item-name').textContent;
    // start recognition and prefix item name
    if (!recognition) { alert('Speech not available'); return; }
    const ta = document.getElementById('order-text');
    const oldOnResult = recognition.onresult;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      ta.value = (ta.value ? ta.value + '\n' : '') + item + ' - ' + text;
      recognition.onresult = oldOnResult;
    };
    recognition.start();
    recognizing = true;
    document.getElementById('start-voice').textContent = 'Listening... Tap to stop';
  });
});

// Order button per item -> prefill and open WhatsApp for that item
document.querySelectorAll('.order-btn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const item = e.target.closest('.item').querySelector('.item-name').textContent;
    const price = e.target.closest('.item').querySelector('.item-price').textContent;
    const defaultMsg = `Order: ${item} - ${price}\nQuantity: 1`;
    const name = prompt('Your name (optional)', '') || 'Customer';
    const phone = prompt('Phone number (optional)', '') || '';
    const full = `Order from ${name} (${phone})\n\n${defaultMsg}\n\nPayment: Transfer/Cash/POS\nAcct: ${acctNumber}`;
    const url = 'https://wa.me/' + waPrimary.replace(/\D/g,'') + '?text=' + encodeURIComponent(full);
    window.open(url, '_blank');
  });
});

// Category filter
document.querySelectorAll('.cat').forEach(bt=>{
  bt.addEventListener('click', (e)=>{
    document.querySelectorAll('.cat').forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    const cat = e.target.dataset.cat;
    document.querySelectorAll('.item').forEach(it=>{
      if (cat === 'all' || it.dataset.cat === cat) it.style.display = 'flex'; else it.style.display = 'none';
    });
  });
});

// Simple bilingual strings
const i18n = {
  en: {
    menu_title: 'Menu',
    all: 'All',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    night: 'Night',
    order_title: 'Place Your Order',
    your_name: 'Your name',
    phone: 'Phone',
    order_details: 'Order details',
    follow_us: 'Follow us'
  },
  pg: {
    menu_title: 'Menu',
    all: 'All',
    breakfast: 'Mornin Food',
    lunch: 'Lunch',
    night: 'Night Chop',
    order_title: 'Make Your Order',
    your_name: 'Your name',
    phone: 'Phone',
    order_details: 'Wetin you want',
    follow_us: 'Follow us'
  }
};
let currentLang = 'en';
function applyLang(lang){
  currentLang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) el.textContent = i18n[lang][key];
  });
  document.getElementById('lang-en').classList.toggle('active', lang==='en');
  document.getElementById('lang-pg').classList.toggle('active', lang==='pg');
}
document.getElementById('lang-en').addEventListener('click', ()=>applyLang('en'));
document.getElementById('lang-pg').addEventListener('click', ()=>applyLang('pg'));
applyLang('en');
