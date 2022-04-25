export default function Banner() {
  return (
    <div
      className={
        "flex justify-center items-center h-[41px] bg-gradient-to-r from-[#CE491E] to-[#EFC253]" +
        " md:h-full md:py-[10px]"
      }
    >
      <p className={"text-center leading-[12px] text-black md:px-[15px] md:leading-[25px]"}>
        <span className={"font-medium"}>We are expanding!</span> Leo is now available to use in non-study servers as
        well!
      </p>
    </div>
  );
}
