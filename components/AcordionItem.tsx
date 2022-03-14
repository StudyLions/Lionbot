import React, { useState } from "react";
import Image from "next/image";

const greyColor = {
  color: '#B6B6B6'
}

const blueColor = {
  color: '#5F97D9'
}

interface IProps {
  question: string,
  answer: any
}

export default function AcordionItem({question, answer }: IProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return <>
    <div className={ 'flex items-center justify-between' }>
      <button
              className={ `font-bold text-3xl cursor-pointer z-10` }
              onClick={ () => setIsExpanded(!isExpanded) }
              style={ blueColor }
      >
        { question }
      </button>
      <Image
              src={ require('@/public/icons/arrow_blue.svg') }
              className={ `ml-auto cursor-pointer ${ isExpanded ? 'rotate-0' : '-rotate-90' }` }
              priority
              alt="Blue arrow icon"
              layout="fixed"
              height={ 30 }
              width={ 20 }
              objectFit="contain"
              onClick={ () => setIsExpanded(!isExpanded) }
      />
    </div>
    <p className={ `text-xl w-5/6 mt-2 transition-all ${ isExpanded ? 'opacity-100 h-full' : 'opacity-0 h-0' }` }
       style={ greyColor }>
      { answer }
    </p>
  </>
}
