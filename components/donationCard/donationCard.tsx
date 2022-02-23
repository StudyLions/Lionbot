import Image from "next/image";
import styles from "./DonationCard.module.scss"

interface IProps {
  amount: number,
  tokens: number,
  tokens_bonus: number,
  image: string,
  onSelect: (price: number) => Promise<void>
}

export default function DonationCard({ amount, tokens, tokens_bonus, image, onSelect }: IProps) {
  return(
  <div className={styles.donationCard}>
    <div className={ `row` }>
      <div className={`col-6`}>
        <Image src={ image }
               alt={`Tokens ${tokens} image`}
               width={ 150 }
               height={ 50 }/>
      </div>
      <div className={`col-6 text-center`}>
        <p>{ tokens } Tokens</p>
        <p className={`pt-1`}>{ tokens_bonus !== 0 && `+${tokens_bonus} Bonus!` }</p>
      </div>
    </div>

    <button className={`mt-2 ${styles.checkoutButton}`} role="link" onClick={ (e => onSelect(amount)) }>
      <span className={`pe-3`}>{ amount }€</span>
    </button>
  </div>
  )
}
