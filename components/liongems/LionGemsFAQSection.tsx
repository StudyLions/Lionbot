import AcordionItem from "@/components/AcordionItem";
import { questionsAnswers } from "@/constants/FAQ";

export default function LionGemsFAQSection() {
  return (
    <div className={`pb-[200px]`}>
      <div className={`container`}>
        <h1 className={`uppercase text-center font-bold text-7xl mb-[60px] text-white`}>FAQ</h1>
        {questionsAnswers.map((item) => {
          return (
            <div className={"my-7"} key={item.question}>
              <AcordionItem {...item} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
