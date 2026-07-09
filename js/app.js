const FATOR = 2.8;
const STORAGE_KEY = 'trolesi-history';
const WHATSAPP_NUMBER = '5535998603736';

const homeScreen = document.getElementById('homeScreen');
const converterScreen = document.getElementById('converterScreen');
const historyScreen = document.getElementById('historyScreen');
const btnOpenConverter = document.getElementById('btnOpenConverter');
const btnOpenHistory = document.getElementById('btnOpenHistory');
const btnOpenWhatsApp = document.getElementById('btnOpenWhatsApp');
const btnInstall = document.getElementById('btnInstall');
const btnBack = document.getElementById('btnBack');
const btnBackHistory = document.getElementById('btnBackHistory');
const input = document.getElementById('codigo');
const resultValue = document.getElementById('resultado');
const btnClear = document.getElementById('btnClear');
const btnSave = document.getElementById('btnSave');
const historyList = document.getElementById('historyList');
const btnClearHistory = document.getElementById('btnClearHistory');
let installPrompt = null;

function moeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function normalizar(texto) {
  return texto.trim().replace(',', '.');
}

function calcular() {
  const raw = normalizar(input.value);
  const codigo = Number.parseFloat(raw);
  if (!raw || Number.isNaN(codigo)) {
    resultValue.textContent = 'R$ 0,00';
    return { codigo: '', valor: 0 };
  }
  const valor = codigo * FATOR;
  resultValue.textContent = moeda(valor);
  return { codigo: input.value, valor };
}

function showScreen(screen) {
  homeScreen.classList.add('hidden');
  converterScreen.classList.add('hidden');
  historyScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function salvarNoHistorico(codigo, valor) {
  let historico = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  historico.unshift({ codigo, valor, data: new Date().toISOString() });
  historico = historico.slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
}

function renderHistory() {
  const historico = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  historyList.innerHTML = '';
  if (!historico.length) {
    historyList.innerHTML = '<li class="empty-state">Nenhum cálculo salvo ainda.</li>';
    return;
  }
  historico.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <span class="history-code">${item.codigo}</span>
      <span class="history-value">${moeda(item.valor)}</span>
    `;
    historyList.appendChild(li);
  });
}

function handleInstall() {
  if (installPrompt) {
    installPrompt.prompt();
    installPrompt.userChoice.finally(() => {
      installPrompt = null;
    });
  } else {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    alert(isIOS ? 'No iPhone, use Compartilhar e Adicionar à Tela de Início.' : 'No Android, use o menu do navegador para instalar o app.');
  }
}

btnOpenConverter.addEventListener('click', () => {
  showScreen(converterScreen);
  input.focus();
});

btnOpenHistory.addEventListener('click', () => {
  renderHistory();
  showScreen(historyScreen);
});

btnOpenWhatsApp.addEventListener('click', () => {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
});

btnInstall.addEventListener('click', handleInstall);
btnBack.addEventListener('click', () => showScreen(homeScreen));
btnBackHistory.addEventListener('click', () => showScreen(homeScreen));

input.addEventListener('input', calcular);

btnClear.addEventListener('click', () => {
  input.value = '';
  calcular();
  input.focus();
});

btnSave.addEventListener('click', () => {
  const { codigo, valor } = calcular();
  if (codigo && valor > 0) {
    salvarNoHistorico(codigo, valor);
    btnSave.textContent = 'Salvo';
    setTimeout(() => {
      btnSave.textContent = 'Salvar';
    }, 1200);
  }
});

btnClearHistory.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.warn);
  });
}

showScreen(homeScreen);
renderHistory();
