// Initialize Amplitude connection API key
// import { initAll } from "@amplitude/unified";
// initAll("a1f05bb4175a983fae715b80c85bc5ad");

// Initialize ampli Wrapper
import { ampli } from './ampli';
ampli.load({ environment: 'mindersvetdev' });

// Track events
// track("Button Clicked", { buttonName: "Sign Up" });

// Identify users
// identify(new Identify().set("userType", "premium"));

// Access Experiment features
// const variant = await experiment.fetch("experiment-key");

// Access Session Replay features
// sessionReplay.flush();

