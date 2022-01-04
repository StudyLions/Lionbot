import styles from "./timer.module.scss"
import {default as options} from './options-timer.json'
import {useEffect, useState} from 'react';

export default function Timer() {
  const [typeInterval, setTypeInterval] = useState("Session Timer");
  const [timerCountdown, setTimerCountdown] = useState(0);

  useEffect(() => {
    if (typeInterval === "Session Timer") {
      //   TODO: Get time from API;
      setTimerCountdown(0)
    }
  }, [typeInterval]);

  useEffect(() => {
    if (timerCountdown === 0) {
      return;
    }

    let interval = setInterval(() => {
      setTimerCountdown(timerCountdown => timerCountdown - 1)
    }, 1000);
    return () => clearInterval(interval);

  }, [timerCountdown])

  return (
    <div className={`${styles.container}`}>
      <p>VC Name</p>
      {showTimerFields(timerCountdown)}
      <div className={`${styles.buttons}`}>
        {showStartButton(typeInterval)}
        <div className={`${styles.option_dropdown}`}>
          <select onChange={(e) => {
            setTypeInterval(e.target.value);
          }}>
            {options.map((option, index) => (
              <option key={index}>{options[index]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  function showTimerFields(timerCountdown) {
    let minutes = Math.floor(timerCountdown / 60);
    let seconds = timerCountdown - minutes * 60;

    minutes = minutes <= 9 ? '0' + minutes : minutes;
    seconds = seconds <= 9 ? '0' + seconds : seconds;
    return <p className={styles.timer_Fields}>{minutes}:{seconds}</p>
  }

  function showStartButton(typeInterval) {
    if(typeInterval === 'Session Timer'){
      return;
    }

    return <button onClick={() => {
      setTimerCountdown(typeInterval * 60 - 1);
    }} className={styles.btn_start_countdown}>
          <span className={styles.front}>
            Start
          </span>
    </button>
  }
}


