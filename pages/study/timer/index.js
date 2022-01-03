import styles from "./timer.module.scss"
import {default as options} from './options-timer.json'
import {useEffect, useRef, useState} from 'react';

export default function Timer() {
  const [typeInterval, setTypeInterval] = useState("Group's Timer");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (typeInterval === "Group's Timer") {
      //   TODO: Get time from API;
      setTimeLeft(0)
    }
  }, [typeInterval]);

  useEffect(() => {
    if (timeLeft === 0) {
      return;
    }

    let interval = setInterval(() => {
      setTimeLeft(timeLeft => timeLeft - 1)
    }, 1000);
    return () => clearInterval(interval);

  }, [timeLeft])

  return (
    <div className={`${styles.container}`}>
      <div>VC Name</div>
      <div>{Math.floor(timeLeft / 60)}:{timeLeft - (Math.floor(timeLeft / 60)) * 60}</div>
      <div className={`${styles.buttons}`}>

        <div onClick={() => {
          setTimeLeft(typeInterval * 60 - 1);
        }} className={styles.pushable}>
          <span className={styles.front}>
            Start
          </span>
        </div>

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
}
