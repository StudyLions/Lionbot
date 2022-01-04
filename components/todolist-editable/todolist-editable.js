import styles from './todolist-editable.module.scss'

export default function TodolistEditable(data){
  let tasks = data.tasks;
  return (
    <>
      {tasks.map((task, index) => (
        <div
          className={`mb-2 d-flex align-items-center ${styles.task_editable} 
          ${task.is_completed ? styles.task_completed : styles.task_incompleted}`}
          key={task + index}>
          <div className={`me-1 d-inline-block text-center rounded ${styles.index_task}`}>
            {index + 1}
          </div>
          <div
            className={`d-inline ${styles.name_task}`}>
            {task.name}
          </div>
        </div>
      ))}
      <div className={`d-flex mt-3 ${styles.add_task_container}`}>
        <input type="text" className="form-control d-inline-block me-3" placeholder="Add task here" aria-label="" aria-describedby="basic-addon1"/>
        <button type="button" className="btn fw-bold d-inline-block">Add</button>
      </div>
    </>
  )
}
