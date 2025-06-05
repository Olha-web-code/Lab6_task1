const datetimePicker = document.querySelector("#datetime-picker");
const startButton = document.querySelector("button[data-start]");
const daysSpan = document.querySelector("[data-days]");
const hoursSpan = document.querySelector("[data-hours]");
const minutesSpan = document.querySelector("[data-minutes]");
const secondsSpan = document.querySelector("[data-seconds]");

let userSelectedDate = null; 
let timerIntervalId = null; 


startButton.disabled = true;


function addLeadingZero(value) {
  return String(value).padStart(2, "0");
}

function convertMs(ms) {
 
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;


  const days = Math.floor(ms / day);
 
  const hours = Math.floor((ms % day) / hour);
 
  const minutes = Math.floor(((ms % day) % hour) / minute);
 
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}


function updateTimerDisplay({ days, hours, minutes, seconds }) {
  daysSpan.textContent = addLeadingZero(days);
  hoursSpan.textContent = addLeadingZero(hours);
  minutesSpan.textContent = addLeadingZero(minutes);
  secondsSpan.textContent = addLeadingZero(seconds);
}


const flatpickrOptions = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  
  plugins: [new confirmDatePlugin({})],
  onClose(selectedDates) {
    const selectedDate = selectedDates[0];

   
    if (selectedDate.getTime() < Date.now()) {
      iziToast.error({
        title: "Error",
        message: "Please choose a date in the future",
        position: "topRight",
      });
      startButton.disabled = true; 
      userSelectedDate = null; 
    } else {
      startButton.disabled = false; 
      userSelectedDate = selectedDate; 
    }
  },
};


flatpickr(datetimePicker, flatpickrOptions);


startButton.addEventListener("click", () => {
  if (!userSelectedDate) {
    
    iziToast.warning({
      title: "Warning",
      message: "Please select a future date first!",
      position: "topRight",
    });
    return;
  }

  
  startButton.disabled = true;
  datetimePicker.disabled = true;

  
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
  }

 
  timerIntervalId = setInterval(() => {
    const currentTime = Date.now();
    const remainingTime = userSelectedDate.getTime() - currentTime;

    if (remainingTime <= 0) {
      clearInterval(timerIntervalId); 
      updateTimerDisplay({ days: 0, hours: 0, minutes: 0, seconds: 0 }); 
      iziToast.success({
        title: "Success",
        message: "Countdown finished!",
        position: "topRight",
      });
      datetimePicker.disabled = false; 
      return;
    }

    const time = convertMs(remainingTime);
    updateTimerDisplay(time);
  }, 1000); 
});
