import React from "react";
import styles from './profile-info.module.scss'

export default function ProfileInfo(data) {
  let profile_info = data.profile_info;

  return (
    <>
      <h4 className={`p-2 bg-white ${styles.current_task}`}>{profile_info.action}</h4>
      <div className="row gx-0">
        <span
          style={{backgroundImage: `url('${profile_info.image_src}')`}}
          className={`col-3 bg-white ${styles.avatar}`}
        />
        <div className={`col-9 align-self-center ps-3`}>
          <h5 className={`fst-italic d-inline-block ${styles.name_author}`}>{profile_info.name_author}</h5>
          <h5 className={`fst-italic d-inline-block ${styles.number_author}`}>{profile_info.number_author}</h5>
          <div className={`mt-1 d-flex flex-wrap gap-1`}>
            {profile_info.tags.map((tag, index) => (
              <p key={tag + index} className={`text-uppercase rounded bg-white ${styles.tag_name}`}>{tag}</p>
            ))}
          </div>
        </div>
      </div>
      <div className={`mb-3 mt-3`}>
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
    </>
  )
}
