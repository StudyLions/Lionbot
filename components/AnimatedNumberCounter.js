import React, {useEffect, useState} from 'react';

const AnimatedNumberCounter = (props) => {
  // number to increment to
  // duration of count in seconds
  const {number, duration} = props

  // number displayed by component
  const [count, setCount] = useState("0")

  useEffect(() => {
    let start = 0;
    // first three numbers from props
    const end = parseInt(number.substring(0, 3))
    // if zero, return
    if (start === end) return;

    // find duration per increment
    let incrementTime = (duration / end) * 2000;

    // timer increments start counter
    // then updates count
    // ends if start reaches end
    let timer = setInterval(() => {
      start += 1;
      setCount(String(start) + number.substring(3))
      if (start === end) clearInterval(timer)
    }, incrementTime);

    // dependency array
  }, [number, duration]);

  return count;
}

export default AnimatedNumberCounter;
