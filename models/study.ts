export interface IProfile_info {
  action: string,
  image_src: string,
  name_author: string,
  number_author: string,
  tags: Array<string>,
  current_rank: string,
  range_rank: string,
  percent_progress_bar: string,
  next_rank: string
}

export interface ITodo_list {
  name: string,
  is_completed: boolean
}
