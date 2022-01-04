import React from "react";

import Layout from 'components/layout'
import Timer from "components/timer";

import {default as data_request_study} from "temporary_data_json/mockData_study.json";
import ProfileInfo from "@/components/profile-info/profile-info";
import TodolistEditable from "@/components/todolist-editable/todolist-editable";

export default function Page() {
  return (
    <Layout>
      <>
        <div className="container">
          <div className="row gx-0">
            <div className="col-lg-4 col-md-6 col-sm-12">
              <Timer/>
              <div
                className={`border-radius-15 mt-5 p-4 pt-5 position-relative bg-dark-blue`}>
                <ProfileInfo profile_info={data_request_study.current_user.profile_info}/>
                <TodolistEditable tasks={data_request_study.current_user.todo_list}/>
              </div>
            </div>
            <div className="col-lg-8 col-md-6 col-sm-12">test</div>
          </div>
        </div>
      </>
    </Layout>
  )
}
