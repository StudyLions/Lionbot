import Image from 'next/image'
import styles from './todolist-editable.module.scss'
import {Menu, MenuButton, MenuDivider, MenuItem, MenuList} from "@chakra-ui/react";

export default function TodolistEditable(data){
  let tasks = data.tasks;

  return (
    <>
      {tasks.map((task, index) => (
        <div
          className={`mb-1 pb-1 d-flex align-items-center ${styles.task_editable} 
          ${task.is_completed ? styles.task_completed : styles.task_incompleted}`}
          key={task + index}>
          <div className={`me-2 d-inline-block text-center rounded ${styles.index_task}`}>
            {index + 1}
          </div>
          <div
            className={`d-inline ${styles.name_task}`}>
            {task.name}
          </div>
          <div
            className={`ms-auto d-flex ${styles.three_horizontal_dots}`}
            onClick={() => {
              toggle_dropdown(task, index)
            }}>
            <Image width={15} src={require('public/icons/3-horizontal-dots.svg')} alt="3 horizontal dots"/>
          </div>

          <Menu>
            <MenuButton
              px={4}
              py={2}
              transition='all 0.2s'
              borderRadius='md'
              borderWidth='1px'
              _hover={{ bg: 'gray.400' }}
              _expanded={{ bg: 'blue.400' }}
              _focus={{ boxShadow: 'outline' }}
            >
              test
            </MenuButton>
            <MenuList>
              <MenuItem>New File</MenuItem>
              <MenuItem>New Window</MenuItem>
              <MenuDivider />
              <MenuItem>Open...</MenuItem>
              <MenuItem>Save File</MenuItem>
            </MenuList>
          </Menu>


        </div>
      ))}
    </>
  )

  function toggle_dropdown(task, index) {
    return (
      <div className={styles.dropdown_settings_task}>
        Test
      </div>
    )
  }
}
