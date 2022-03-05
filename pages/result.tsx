import { useRouter } from "next/router";
import useSWR from 'swr'
import Layout from "@/components/Layout/Layout";

export default function Result(){
  const router = useRouter();

  const {data, error} = useSWR(
    router.query.session_id ? `/api/checkout/${router.query.session_id}` : null,
          (url) => fetch(url).then(res => res.json())
  )

  return <Layout>
    <div className={`text-center mt-5`}>
      <h1>Payment Result</h1>
      <pre>{data ? 'The transaction was completed successfully!' : 'Loading...'}</pre>
    </div>
  </Layout>
}
