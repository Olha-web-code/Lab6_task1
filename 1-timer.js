// Отримуємо посилання на елементи DOM
const datetimePicker = document.querySelector("#datetime-picker");
const startButton = document.querySelector("button[data-start]");
const daysSpan = document.querySelector("[data-days]");
const hoursSpan = document.querySelector("[data-hours]");
const minutesSpan = document.querySelector("[data-minutes]");
const secondsSpan = document.querySelector("[data-seconds]");

let userSelectedDate = null; // Змінна для зберігання обраної дати
let timerIntervalId = null; // Змінна для зберігання ідентифікатора інтервалу таймера

// Спочатку кнопка "Start" неактивна
startButton.disabled = true;

// Функція для додавання нуля до чисел менше 10
function addLeadingZero(value) {
  return String(value).padStart(2, "0");
}

// Функція для перетворення мілісекунд у дні, години, хвилини, секунди
function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Remaining days
  const days = Math.floor(ms / day);
  // Remaining hours
  const hours = Math.floor((ms % day) / hour);
  // Remaining minutes
  const minutes = Math.floor(((ms % day) % hour) / minute);
  // Remaining seconds
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

// Функція для оновлення інтерфейсу таймера
function updateTimerDisplay({ days, hours, minutes, seconds }) {
  daysSpan.textContent = addLeadingZero(days);
  hoursSpan.textContent = addLeadingZero(hours);
  minutesSpan.textContent = addLeadingZero(minutes);
  secondsSpan.textContent = addLeadingZero(seconds);
}

// Опції для flatpickr
const flatpickrOptions = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  // Додаємо плагін confirmDate
  plugins: [new confirmDatePlugin({})],
  onClose(selectedDates) {
    const selectedDate = selectedDates[0];

    // Перевірка, чи обрана дата в минулому
    // Використовуємо Date.now() для порівняння з поточною датою і часом
    if (selectedDate.getTime() < Date.now()) {
      iziToast.error({
        title: "Error",
        message: "Please choose a date in the future",
        position: "topRight",
      });
      startButton.disabled = true; // Робимо кнопку "Start" неактивною
      userSelectedDate = null; // Скидаємо обрану дату
    } else {
      startButton.disabled = false; // Робимо кнопку "Start" активною
      userSelectedDate = selectedDate; // Зберігаємо обрану дату
    }
  },
};

// Ініціалізація flatpickr
flatpickr(datetimePicker, flatpickrOptions);

// Обробник події кліку на кнопку "Start"
startButton.addEventListener("click", () => {
  if (!userSelectedDate) {
    // Цей блок має бути заблокований disabled станом кнопки, але для надійності
    iziToast.warning({
      title: "Warning",
      message: "Please select a future date first!",
      position: "topRight",
    });
    return;
  }

  // Деактивуємо кнопку "Start" та поле вибору дати
  startButton.disabled = true;
  datetimePicker.disabled = true;

  // Очищаємо попередній інтервал, якщо він існував
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
  }

  // Запускаємо таймер
  timerIntervalId = setInterval(() => {
    const currentTime = Date.now();
    const remainingTime = userSelectedDate.getTime() - currentTime;

    if (remainingTime <= 0) {
      clearInterval(timerIntervalId); // Зупиняємо таймер
      updateTimerDisplay({ days: 0, hours: 0, minutes: 0, seconds: 0 }); // Відображаємо нулі
      iziToast.success({
        title: "Success",
        message: "Countdown finished!",
        position: "topRight",
      });
      datetimePicker.disabled = false; // Робимо поле вибору дати знову активним
      // Кнопка "Start" залишається неактивною, поки не буде обрана нова майбутня дата
      return;
    }

    const time = convertMs(remainingTime);
    updateTimerDisplay(time);
  }, 1000); // Оновлюємо кожну секунду
});