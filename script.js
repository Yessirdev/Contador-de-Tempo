// Seleciona os elementos do DOM
const setupDiv = document.getElementById('setup');
const countdownDiv = document.getElementById('countdown');

const eventNameInput = document.getElementById('eventName');
const eventDateInput = document.getElementById('eventDate');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

const countdownTitle = document.getElementById('countdown-title');
let daysEl = document.getElementById('days');
let hoursEl = document.getElementById('hours');
let minutesEl = document.getElementById('minutes');
let secondsEl = document.getElementById('seconds');

let countdownInterval;
let eventData; // Objeto para guardar dados do evento

/**
 * Adiciona um zero à esquerda se o número for menor que 10.
 * @param {number} time - O número a ser formatado.
 * @returns {string} O número formatado com zero à esquerda.
 */
function formatTime(time) {
    return time < 10 ? `0${time}` : String(time);
}

/**
 * Inicia a contagem regressiva.
 */
function startTimer() {
    const title = eventNameInput.value;
    const date = eventDateInput.value;
    
    if (!title || !date) {
        alert('Por favor, preencha o nome e a data do evento.');
        return;
    }
    
    // Usa T00:00:00 para pegar o início do dia na timezone local.
    const targetDate = new Date(`${date}T00:00:00`).getTime();
    const now = new Date().getTime();

    if (isNaN(targetDate)) {
        alert('Por favor, selecione uma data válida.');
        return;
    }

    const mode = targetDate > now ? 'countdown' : 'countup';

    eventData = { title, targetDate, mode };

    // Salva no localStorage para persistir
    localStorage.setItem('countdownEvent', JSON.stringify(eventData));

    showTimer(eventData);
}

/**
 * Mostra o contador e inicia o intervalo.
 * @param {object} data - O objeto do evento contendo { title, targetDate, mode }.
 */
function showTimer(data) {
    const { title, targetDate, mode } = data;

    // Esconde a configuração e mostra o contador
    setupDiv.classList.add('hidden');
    countdownDiv.classList.remove('hidden');

    countdownTitle.innerText = mode === 'countdown' 
        ? `Contagem regressiva para: ${title}` 
        : `Tempo desde: ${title}`;

    // Limpa qualquer intervalo anterior para evitar múltiplos contadores
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    const updateDisplay = () => {
        const now = new Date().getTime();
        // A lógica de cálculo muda com base no modo
        const distance = mode === 'countdown' ? targetDate - now : now - targetDate;

        // Se for countdown e o tempo acabou
        if (mode === 'countdown' && distance <= 0) {
            clearInterval(countdownInterval);
            countdownTitle.innerText = `O evento "${title}" chegou!`;
            document.querySelector('.timer').innerHTML = "<h2>🎉🎉🎉</h2>";
            localStorage.removeItem('countdownEvent'); // Limpa o evento finalizado
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.innerText = formatTime(days);
        hoursEl.innerText = formatTime(hours);
        minutesEl.innerText = formatTime(minutes);
        secondsEl.innerText = formatTime(seconds);
    };

    updateDisplay(); // Executa uma vez imediatamente
    countdownInterval = setInterval(() => {
        updateDisplay();
    }, 1000);
}

function resetCountdown() {
    clearInterval(countdownInterval);
    localStorage.removeItem('countdownEvent');
    setupDiv.classList.remove('hidden');
    countdownDiv.classList.add('hidden');
    eventNameInput.value = '';
    eventDateInput.value = '';

    // Restaura o HTML do timer caso tenha sido alterado
    const timerContainer = document.querySelector('.timer');
    if (timerContainer) {
        timerContainer.innerHTML = `
            <div class="timer-el">
                <p class="big-text" id="days">00</p>
                <span>dias</span>
            </div>
            <div class="timer-el">
                <p class="big-text" id="hours">00</p>
                <span>horas</span>
            </div>
            <div class="timer-el">
                <p class="big-text" id="minutes">00</p>
                <span>minutos</span>
            </div>
            <div class="timer-el">
                <p class="big-text" id="seconds">00</p>
                <span>segundos</span>
            </div>`;
        
        // Reatribui as referências aos novos elementos do DOM
        daysEl = document.getElementById('days');
        hoursEl = document.getElementById('hours');
        minutesEl = document.getElementById('minutes');
        secondsEl = document.getElementById('seconds');
    }
}

startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetCountdown);

// Verifica se há um evento salvo no localStorage ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedEvent = localStorage.getItem('countdownEvent');
    if (savedEvent) {
        eventData = JSON.parse(savedEvent);
        // Se for um evento futuro ou um evento passado, mostre o timer
        if (eventData.mode === 'countup' || (eventData.mode === 'countdown' && eventData.targetDate > new Date().getTime())) {
            showTimer(eventData);
        } else {
            localStorage.removeItem('countdownEvent');
        }
    }
});