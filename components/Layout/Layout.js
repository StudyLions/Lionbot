import Header from '@/components/Layout/Header/Header'
import Footer from "@/components/Layout/Footer/Footer";

export default function Layout({children}) {
  return (
    <>
      <Header/>
        <main>
            {children}
        </main>
        <Footer/>
    </>
  )
}
