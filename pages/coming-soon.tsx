import Layout from "@/components/Layout/Layout";

export default function ComingSoon() {
  return (
    <>
      <Layout>
        <div className={"alignCenter flex-col h-[57vh] bg-gradient-to-r from-[#627AF7] to-[#EF566A] px-[30px]"}>
          <h1 className={"text-[65px] font-bold uppercase md:text-[30px]"}>coming soon!</h1>
          <h2 className={"mt-[10px] text-[20px] md:text-[18px] text-center"}>
            We are currently creating something great.
          </h2>
        </div>
      </Layout>
    </>
  );
}
