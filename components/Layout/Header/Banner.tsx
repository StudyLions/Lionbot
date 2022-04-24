export default function Banner() {
  return (
    <div
      className={"flex justify-center items-center h-[41px] md:h-[70px] bg-gradient-to-r from-[#CE491E] to-[#EFC253]"}
    >
      <p className={"text-center leading-[12px] md: leading-[25px] text-black md:px-[15px]"}>
        <span className={"font-medium"}>We are expanding!</span> Leo is now available to use in non-study servers as
        well!
      </p>
    </div>
  );
}
