import styles from './SubscriptionCard.module.scss'
import Image from "next/image";
import React from "react";

interface IProps {
  tag?: string,
  typePlan: string,
  amount: number,
  billedFrequency: string,
  benefits: Array<string>,
  buttonText: string,
}

export default function SubscriptionCard({tag, typePlan, amount, billedFrequency, benefits, buttonText }: IProps) {
  return (
          <div className={ `${ styles.containerSubscriptionCard }` }>
            {tag && <p className={`${styles.tag}`}>{tag}</p>}
            <h4 className={`mt-2`}>{ typePlan }</h4>
            <h2 className={ `mt-1 mb-1 ${ styles.containerPrice }` }>
              <span className={ `${ styles.price }` }>{ amount }</span>
              €</h2>
            <p>{ billedFrequency }</p>
            <hr/>
            <div className={ `${ styles.benefits }` }>
              { benefits.map((benefit, index) => (
                      <div className={ ` mt-1 mb-1 ${ styles.benefit }` }>
                        <Image
                                src={ require('public/icons/check-mark-svgrepo-com.svg') }
                                alt="Discord icon"
                                width={ 15 }
                                height={ 15 }
                        />
                        <p className={ `${ styles.benefit_Text }` }>{ benefit }</p>
                      </div>
              )) }
            </div>
            <hr/>
            <button type={ "button" }>{ buttonText }</button>
          </div>
  )
}
