import AcordionItem from "@/components/AcordionItem";
import {questionsAnswers} from '@/constants/FAQ'

const backgroundColor = {
  backgroundColor: '#191D29'
}

const titleColor = {
  color: '#EEC73C'
}

export default function LionGemsFAQSection() {
  return <div style={backgroundColor} className={`pb-36 pt-20`}>
    <div className={`container`}>
      <h1 className={`uppercase text-center font-bold text-7xl mb-3`} style={titleColor}>FAQ</h1>
      <hr className={'h-px border-solid border-amber-300 border-zinc-600'}/>
      {questionsAnswers.map((item) => {
        return <div className={"mt-7 mb-7"} key={item.question}>
          <AcordionItem {...item}/>
        </div>
      })}
    </div>
  </div>
}
