import { useState } from "react";

const STEPS = 4;

export default function CatCheckIn() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const next = () => {
    if (step < STEPS - 1) setStep((current) => current + 1);
  };

  return (
    <section className="checkin-section" id="check-in" data-scroll-motion>
      <div className="checkin-intro">
        <span>NEW / Cat Check-in</span>
        <h2>Four tiny steps.<br /><em>One new friend.</em></h2>
        <p>A playful multi-step form inspired by the reference, tuned for Mochi’s world.</p>
      </div>
      <div className="step-card">
        <div className="step-progress" aria-label={`Step ${step + 1} of ${STEPS}`}>
          {Array.from({ length: STEPS }, (_, index) => <div className={`step-node${index < step ? " is-done" : ""}${index === step ? " is-active" : ""}`} key={index}><span>{index < step ? "✓" : index + 1}</span>{index < STEPS - 1 && <i><b style={{ width: index < step ? "100%" : "0%" }} /></i>}</div>)}
        </div>
        <div className="step-content" key={step}>
          {step === 0 && <div className="step-welcome"><small>Welcome to Mochi’s stepper</small><h3>A very serious cat would like to meet you.</h3><p>Check out the next step.</p></div>}
          {step === 1 && <div className="step-cat"><small>Step 2 · Character check</small><div className="step-cat-image"><img src="/frames/center.webp" alt="Mochi the cat wearing his blue hoodie" /></div><p>Mochi checks every face before granting access.</p></div>}
          {step === 2 && <div className="step-input"><small>How about an input?</small><label htmlFor="cat-step-name">Your name</label><input id="cat-step-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name?" onKeyDown={(event) => { if (event.key === "Enter") next(); }} /></div>}
          {step === 3 && <div className="checkin-success"><span>✓</span><h3>Nice to meet you{name ? `, ${name}` : ""}.</h3><p>Mochi approves. You’re officially in his orbit.</p></div>}
        </div>
        <div className="step-actions"><button disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>Previous</button>{step < STEPS - 1 && <button className="step-next" onClick={next}>Next<span>→</span></button>}</div>
      </div>
    </section>
  );
}
