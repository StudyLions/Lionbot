import React from "react";
import styles from './profile-info.module.scss'

export default function ProfileInfo(data) {
  let profile_info = data.profile_info;

  return (
    <>
      <h3 className={styles.current_task}>{profile_info.action}</h3>
      <div className="row gx-0">
            <span
              style={{backgroundImage: `url('${profile_info.image_src}')`}}
              className={`col-3 ${styles.avatar}`}
            />
        <div className={`col-9 ${styles.profile}`}>
          <div>
            <span className={`fst-italic ${styles.name_author}`}>{profile_info.name_author}</span>
            <span className={`fst-italic ${styles.number_author}`}>{profile_info.number_author}</span>
          </div>
          <div className={styles.tags}>
            {profile_info.tags.map((tag, index) => (
              <p key={tag+index} className={`text-uppercase ${styles.tag_name}`}>{tag}</p>
            ))}
          </div>
        </div>
      </div>
      <div className={`mb-3 ${styles.more_details}`}>
        <div className={`${styles.container_rank}`}>
          <div className={`${styles.name_rank}`}>
            {profile_info.current_rank} <span className={`${styles.range_rank}`}>{profile_info.range_rank}</span>
          </div>
          <div className={styles.progress}>
            <div style={{width: `${profile_info.percent_progress_bar}`}} className={styles.bar}/>
          </div>
          <p className={`fst-italic ${styles.next_rank}`}>
            NEXT RANK: {profile_info.next_rank}
          </p>
        </div>
      </div>
    </>
  )
}
