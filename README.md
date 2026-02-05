# Cybership's Carrier Service

My thought processes are currently on [this google doc](https://docs.google.com/document/d/17PTxVcTFE3mRceC4UQcXE4fdQosityoa46FYcFrmFSM/edit?usp=sharing). I'll update the ReadME as I add more implementation

## Quick setup and test.

1. Run `npm install`
2. Run `npm test`.

You'd be surprised that's all 😵

## Important things to lookout for

- The actual implementation of individual carriers (currently only supporting UPS) can be found in ./src/carriers
- The goal is that, if you delete the `./src/carriers/ups` folder, everything should still compile (it obviously doesn't do that yet, but it's very very close)
- The `./src/index.ts` file exposes a very simple function to interact with carriers.
- To add a new carrier, the Registery only cares about the actual ProviderClass of that carrier, every other thing is left to the choice of the person implementing the carrier, as long as it satisfies the `CarrierProvider` interface.

I think every other thing is pretty straightforward

## Few caveats

1. The Token manager should use Redis or maybe a database table for storing token (properly indexed of for speak of fetching of course), but for now, it just stores it as a value in the class. If I had more time, maybe I'd use that (I think Redis + Postgres would be a good combo for managing the tokens gotten from the provider)
2. I hade claude.ai generate some tests for me. I really love to use AI to write tests. I listened to a podcast one time where someone was talking about how they've found AI to be better at writing tests than writing actual code. I haven't
   really supervised the tests well, but they run just fine.
3. Some very important tests that I would write are the mapperTests to be sure that things are correctly mapped, token manager tests, http clients, and a full-flow integration test
