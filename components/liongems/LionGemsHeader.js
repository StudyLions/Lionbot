import styles from './Liongems.module.scss'

export default function LionGemsHeader() {
  return <div className={`alignCenter ${styles.header_content}`}>
    <div className={`grid lg:grid-cols-2 gap-4 sm:grid-cols-1 ${styles.section}`}>
      <img className={'object-contain'} src="https://cdn.discord.study/images/Group+222.png"
           alt="February collection image"/>
      <div className={'flex items-start justify-center md:ml-5 sm:ml-0 flex-col'}>
        <h1 className={`uppercase text-7xl font-bold text-amber-400 max-w-min`}>
          February Collection
        </h1>
        <p className={'mt-5 leading-6 text-xl max-w-sm'}>
          Support the team and keep the project alive by getting some LionGems!
        </p>
        <p className={'mt-5 text-xl max-w-sm'}>
          Purchase colored skins, gift LionGems to your loved ones, and unlock special perks for your server or
          yourself!
        </p>
        <div className={`w-full mt-5 gap-5 flex gap-3 text-2xl`}>
          <a className={'uppercase px-5 py-2 rounded-full bg-amber-500 font-bold text-amber-50 cursor-pointer text-2xl'}>
            Browse
          </a>
          <a className={'uppercase px-5 py-2 rounded-full bg-amber-500 font-bold text-amber-50 cursor-pointer'}>
            LionGems
          </a>
        </div>
      </div>
    </div>
  </div>
}
