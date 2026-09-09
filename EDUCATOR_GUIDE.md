# Educator Guide — Probability Detective

## Audience and session

Target approximately age 12, with individual differences expected. Suggested focused session: **10–15 minutes**, plus optional replay.

## Prerequisites

Learners should be comfortable with simple fractions, decimals, multiplication, and reading small tables or charts. No prior formal probability course is required.

## Learning objectives

Learners should be able to:
- distinguish theoretical probability from an observed experimental proportion;
- explain why a finite sample can differ from the model and why a larger sample often gives more stable evidence without guaranteeing step-by-step improvement;
- reject the idea that a streak changes the next independent fair coin flip;
- reason about one-die and two-dice sample spaces, including why sums of two dice are not equally likely;
- compare simple points-game rules using expected points rather than one simulated winner.

## Activity walkthrough

### 1. Coin Laboratory

Choose a coin probability, optionally predict a heads percentage, and run 10, 100, or 1,000 flips. The chart and table keep theoretical and experimental values side by side. Fair and explicitly labelled biased coins are available, including exact 0% and 100% heads boundaries. A streak question gives specific feedback and unlimited retry.

Discussion prompt: **“What stayed fixed in the model even when the sample result changed?”**

### 2. Dice Investigation

Investigate one fair six-sided die or the sum of two fair dice. For two dice, the app exposes the number of ordered routes out of 36 and makes the six routes to a sum of 7 explicit. The generated chart and equivalent data table both use the current simulated run.

Discussion prompt: **“Why are sums near 7 more likely than sums near 2 or 12?”**

### 3. Fair-Game Designer

Alter a one-die scoring cutoff and point rewards. The exact expected-point arithmetic is displayed before the simulation so fairness is defined by the rules, not by whichever side happens to win a short run. Learners then apply the same reasoning to a fresh two-dice challenge.

Discussion prompt: **“Can fair rules still produce an uneven score in one run? Why?”**

## Differentiation, adaptations, and co-play

- **More support:** use the 50% coin preset, read the data table before the chart, and compare 10 vs. 100 trials first.
- **Reading support:** an adult can read prompts aloud while the learner controls the interface; no answer depends on audio.
- **Motor/access support:** every core action is a semantic keyboard-operable control; no drag gesture is required, and essential charts have text/table equivalents.
- **More challenge:** predict the direction of error before each run, explain why “closer with more trials” is a tendency rather than a guarantee, or invent and justify another fair points game.
- **Co-play:** an adult can ask the discussion prompts without taking over the experiment. The lesson does not rank, shame, punish, or pressure the learner.

## Persistence and privacy

The app stores only lesson progress in local browser `localStorage`. It asks for no name, email, demographics, account, wallet, payment, photo, voice, or upload. It includes no analytics, advertising, social feed, open chat, remote grading, or runtime AI. Reset clears stored progress.

## Model and content limitations

The simulations are educational pseudo-random models. A finite experimental run can differ from theoretical probability, and a larger run is not promised to be closer than every smaller run. Expected points describe a model average per round, not a guarantee about one play session. The app does not claim diagnostic value, validated learning gains, or universal age suitability.

## Content references

These adult-facing references informed the mathematical and educational framing; they are not required runtime resources and are not presented as outbound links inside the learner flow.

1. **NIST/SEMATECH e-Handbook of Statistical Methods — “1.3.6. Probability Distributions”**
   https://www.itl.nist.gov/div898/handbook/eda/section3/eda36.htm
   Supports treating a probability distribution as a theoretical model and explicitly notes simulation studies using random numbers generated from a specified probability distribution.

2. **Khan Academy — “Probability | Statistics and probability | Math”**
   https://www.khanacademy.org/math/statistics-probability/probability-library
   Supports the age-appropriate distinction between theoretical and experimental probability, sample spaces, independent probability, compound events, and interpretation of simulations.

3. **Khan Academy — “Experimental versus theoretical probability simulation”**
   https://www.khanacademy.org/math/ap-statistics/probability-ap/randomness-probability-simulation/v/experimental-versus-theoretical-probability-simulation
   Supports using repeated simulation to compare experimental results with a theoretical model and the idea that small samples can differ substantially from theoretical probability.

Interface text, examples, code, synthetic experiments, and generated screenshots in this repository are original for this submission.

## Offline follow-up

Use two ordinary six-sided dice and paper. Before rolling, list the 36 ordered pairs and group them by sum. Design a points rule that is fair in expected points, then roll 30–50 times and compare the observed score with the theoretical model. Ask whether a different observed winner would change the fairness calculation.
