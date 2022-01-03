import styles from "./timer.module.scss"
import {default as options} from './options-timer.json'
import {useEffect, useState} from 'react';

export default function Timer() {
  const [typeInterval, setTypeInterval] = useState("Group's Timer");
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);

  useEffect(() => {
    if (typeInterval === "Group's Timer") {
      //   TODO: Get time from API;
      setTimerTotalSeconds(0)
    }
  }, [typeInterval]);

  useEffect(() => {
    if (timerTotalSeconds === 0) {
      return;
    }

    let interval = setInterval(() => {
      setTimerTotalSeconds(timerTotalSeconds => timerTotalSeconds - 1)
    }, 1000);
    return () => clearInterval(interval);

  }, [timerTotalSeconds])

  return (
    <div className={`${styles.container}`}>
      <p>VC Name</p>
      {showTimerFields(timerTotalSeconds)}
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

  function showTimerFields(timerTotalSeconds) {
    let minutes = Math.floor(timerTotalSeconds / 60);
    let seconds = timerTotalSeconds - minutes * 60;

    minutes = minutes <= 9 ? '0' + minutes : minutes;
    seconds = seconds <= 9 ? '0' + seconds : seconds;
    return <p>{minutes}:{seconds}</p>
  }

  function showStartButton(typeInterval) {
    if(typeInterval === 'Group\'s Timer'){
      return;
    }

    return <button onClick={() => {
      setTimerTotalSeconds(typeInterval * 60 - 1);
    }} className={styles.pushable}>
          <span className={styles.front}>
            Start
          </span>
    </button>
  }
}


