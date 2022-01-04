import Layout from 'components/layout'
import Timer from "components/timer";

export default function Page() {
  return (
    <Layout>
      <>
        <div className="container">
          <div className="row gx-0">
            <div className="col-lg-3 col-md-6 col-sm-12">
              <Timer/>
            </div>
            <div className="col-lg-9 col-md-6 col-sm-12">test</div>
          </div>
        </div>
      </>
    </Layout>
  )
}
