import Header from "../components/Header";
import Section1 from "../components/Section1";
import Section2 from "../components/Section2";
import Section3 from "../components/Section3";
import Section4 from "../components/Section4";

export default function Onboarding() {
  return (
    <>
      <Header />
      <Section1 />
      <div id="features">
        <Section2 />
      </div>
      <div id="how-it-works">
        <Section3 />
      </div>
      <div id="pricing">
        <Section4 />
      </div>
    </>
  );
}
